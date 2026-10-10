import type { CDPSession, Locator, Page } from "@playwright/test";

/** The five dev pages (starfield.md §13.1). */
export const SF = {
  live: "/dev/starfield",
  still: "/dev/starfield/still",
  noStreak: "/dev/starfield/no-streak",
  demo: "/dev/starfield/streak-demo",
  blocked: "/dev/starfield/streak-blocked",
} as const;

export const slot = (page: Page): Locator => page.locator("[data-starfield]");

/**
 * Waits until the motion module has set the state (load + idle, then the IO).
 * A readiness wait, not a budget: 20s leaves room for a loaded machine.
 */
export async function waitForState(
  page: Page,
  state: "animating" | "paused" | "static",
  timeout = 20_000,
): Promise<void> {
  await page.waitForFunction(
    (s) =>
      document
        .querySelector("[data-starfield]")
        ?.getAttribute("data-starfield-state") === s,
    state,
    { timeout },
  );
}

/**
 * Boxes of the shown marks inside the slot. An SVG element under a
 * display:none group still reports checkVisibility() true, so ancestors are
 * walked instead.
 */
export function markBoxes(
  page: Page,
  selector: string,
): Promise<{ left: number; top: number; right: number; bottom: number }[]> {
  return page.evaluate((sel) => {
    const shown = (el: Element | null): boolean => {
      for (let e = el; e; e = e.parentElement) {
        if (getComputedStyle(e).display === "none") return false;
      }
      return true;
    };
    return [...document.querySelectorAll(sel)].filter(shown).map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
    });
  }, selector);
}

/** Number of shown elements matching the selector (ancestors walked). */
export async function countShown(
  page: Page,
  selector: string,
): Promise<number> {
  return (await markBoxes(page, selector)).length;
}

/** Running animations inside the slot (twinkles, and a streak if one flies). */
export function slotAnimations(page: Page, selector = "[data-sf-tw]") {
  return page.evaluate((sel) => {
    const slotEl = document.querySelector("[data-starfield]")!;
    return slotEl
      .getAnimations({ subtree: true })
      .filter((a) => (a.effect as KeyframeEffect).target?.matches(sel))
      .map((a) => a.playState);
  }, selector);
}

/** The Container content box of the first section, and the header band's bottom. */
export function frame(page: Page) {
  return page.evaluate(() => {
    const container = document.querySelector("main [data-open-sky]")!;
    const cs = getComputedStyle(container);
    const r = container.getBoundingClientRect();
    const sky = document
      .querySelector("[data-sf-sky]")!
      .getBoundingClientRect();
    return {
      contentLeft: r.left + parseFloat(cs.paddingLeft),
      contentRight: r.right - parseFloat(cs.paddingRight),
      band: sky.top,
      header: document.querySelector("body > header")!.getBoundingClientRect()
        .bottom,
    };
  });
}

/** CDP: every layer with its compositing reasons and whether its node is a twinkle span. */
export async function layerSnapshot(cdp: CDPSession, page: Page) {
  let layers: { layerId: string; backendNodeId?: number }[] = [];
  const onChange = (event: { layers?: typeof layers }) => {
    if (event.layers) layers = event.layers;
  };
  cdp.on("LayerTree.layerTreeDidChange", onChange);
  await cdp.send("LayerTree.enable");
  // Two frames, so the tree reflects the current state.
  await page.evaluate(
    () =>
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
  await page.waitForTimeout(300);
  cdp.off("LayerTree.layerTreeDidChange", onChange);
  await cdp.send("DOM.getDocument", { depth: 0 });
  const out: { reasons: string[]; node: string }[] = [];
  for (const layer of layers) {
    let reasons: string[] = [];
    try {
      const r = await cdp.send("LayerTree.compositingReasons", {
        layerId: layer.layerId,
      });
      reasons = r.compositingReasonIds ?? [];
    } catch {
      continue; // the layer is gone already
    }
    let node = "";
    if (layer.backendNodeId) {
      try {
        const { object } = await cdp.send("DOM.resolveNode", {
          backendNodeId: layer.backendNodeId,
        });
        const { result } = await cdp.send("Runtime.callFunctionOn", {
          objectId: object.objectId!,
          functionDeclaration: `function () {
            if (!(this instanceof Element)) return "other";
            if (this.matches("[data-sf-tw]")) return "span";
            if (this.closest("[data-starfield]")) return "slot";
            if (this.matches("main#main")) return "main";
            if (this.matches("body > header")) return "header";
            return this.tagName.toLowerCase();
          }`,
          returnByValue: true,
        });
        node = String(result.value);
      } catch {
        node = "";
      }
    }
    out.push({ reasons, node });
  }
  await cdp.send("LayerTree.disable");
  return out;
}
