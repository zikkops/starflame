import type { Locator, Page } from "@playwright/test";

/**
 * Presses Tab up to `max` times and returns a short label for each element that
 * receives focus (tag plus aria-label, text or id), stopping when focus leaves
 * the page or comes back to the first element. Wrap-around is detected by element
 * identity (two controls may share a label); the label is for display only.
 */
export async function tabOrder(page: Page, max = 50): Promise<string[]> {
  const labels: string[] = [];
  for (let i = 0; i < max; i += 1) {
    await page.keyboard.press("Tab");
    const label = await page.evaluate((isFirst) => {
      const w = window as Window & { __tabOrderFirst?: Element };
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      if (isFirst) w.__tabOrderFirst = el;
      else if (el === w.__tabOrderFirst) return null;
      const name =
        el.getAttribute("aria-label") ??
        (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
      return `${el.tagName.toLowerCase()}:${name || el.id}`;
    }, i === 0);
    if (label === null) break;
    labels.push(label);
  }
  await page.evaluate(() => {
    delete (window as Window & { __tabOrderFirst?: Element }).__tabOrderFirst;
  });
  return labels;
}

/**
 * Visible outline and box-shadow layers of the element, once its CSS
 * transitions have finished. Transparent or zero-alpha colours and zero widths
 * don't count, so Tailwind's resting `0 0 #0000` shadows are ignored.
 */
async function ringLayers(locator: Locator): Promise<string[]> {
  return locator.evaluate(async (el) => {
    await Promise.all(
      el
        .getAnimations()
        .filter((animation) => animation instanceof CSSTransition)
        .map((animation) => animation.finished.catch(() => undefined)),
    );
    const alpha = (color: string): number => {
      if (color === "transparent") return 0;
      const slash = /\/\s*([\d.]+)(%?)\s*\)$/.exec(color);
      if (slash) return Number(slash[1]) / (slash[2] ? 100 : 1);
      const rgba = /^rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\)$/.exec(color);
      return rgba ? Number(rgba[1]) : 1;
    };
    const style = getComputedStyle(el);
    const layers: string[] = [];
    if (
      style.outlineStyle !== "none" &&
      parseFloat(style.outlineWidth) > 0 &&
      alpha(style.outlineColor) > 0
    ) {
      layers.push(
        `outline ${style.outlineStyle} ${style.outlineWidth} ${style.outlineColor}`,
      );
    }
    if (style.boxShadow !== "none") {
      // Split the layer list on top-level commas (colours contain commas too).
      let depth = 0;
      let current = "";
      const shadows: string[] = [];
      for (const char of style.boxShadow) {
        if (char === "(") depth += 1;
        if (char === ")") depth -= 1;
        if (char === "," && depth === 0) {
          shadows.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      shadows.push(current.trim());
      for (const shadow of shadows) {
        const color =
          /(?:[a-z-]+\([^)]*\)|#[0-9a-f]+|transparent)/i.exec(shadow)?.[0] ??
          "currentcolor";
        const [x = 0, y = 0, blur = 0, spread = 0] = (
          shadow.replace(color, "").match(/-?[\d.]+px/g) ?? []
        ).map(parseFloat);
        const drawn = x !== 0 || y !== 0 || blur > 0 || spread > 0;
        if (drawn && alpha(color) > 0) layers.push(`shadow ${shadow}`);
      }
    }
    return layers;
  });
}

/**
 * True if focusing the element adds a visible outline or box-shadow layer that
 * it doesn't have while blurred. A ring drawn with a border or a pseudo-element
 * reads false: check the screenshot. Call it before any mouse interaction in the
 * test, since `:focus-visible` may not match a scripted focus after a click.
 */
export async function hasVisibleFocus(locator: Locator): Promise<boolean> {
  await locator.evaluate((el) => (el as HTMLElement).blur());
  const blurred = new Set(await ringLayers(locator));
  await locator.focus();
  const focused = await ringLayers(locator);
  return focused.some((layer) => !blurred.has(layer));
}
