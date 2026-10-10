import { gzipSync } from "node:zlib";

import type { Page, Response } from "@playwright/test";

import { expect, test } from "./fixtures";
import { layoutShifts } from "./support/layout-shift";
import { captureRoute } from "./support/screenshot";
import {
  countShown,
  frame,
  layerSnapshot,
  markBoxes,
  SF,
  slot,
  slotAnimations,
  waitForState,
} from "./support/starfield";

// starfield.md §14.5 browser tests 5-15 and 17-19, plus the §13.2 shots. Both
// projects run Chromium: mobile-390 emulates an iPhone 14's viewport (390 x 664,
// DPR 3, touch), not its CPU. Tests 1-4 and 16 are in starfield-data.spec.ts.

const isMobile = (): boolean =>
  test.info().project.name.startsWith("mobile-390");
const twinkles = (): number => (isMobile() ? 11 : 32);

// ── 5. No JavaScript: the static sky is server-rendered ─────────────────────
test.describe("no JavaScript", () => {
  // With scripts off, Chromium blocks the preloaded chunks ("csp").
  test.use({
    javaScriptEnabled: false,
    expectedIssues: [/\/_next\/static\/chunks\/[^ ]+\.js \(csp\)$/],
  });

  test("5. the field and the dim twinkle spans are in the server HTML", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(slot(page).locator("[data-sf-field]")).toHaveCount(1);
    const circles = await countShown(page, "[data-sf-field] circle");
    const spans = await countShown(page, "[data-sf-twinkles] > [data-sf-tw]");
    expect([circles, spans]).toEqual(isMobile() ? [29, 7] : [102, 26]);
    expect(circles + spans).toBe(isMobile() ? 36 : 128);
    await expect(slot(page)).not.toHaveAttribute("data-starfield-state");
  });
});

// ── 6. The header band is star-free ─────────────────────────────────────────
const MARKS =
  "[data-starfield] circle, [data-starfield] path, [data-starfield] [data-sf-tw]";

for (const size of [null, { width: 844, height: 390 }] as const) {
  test(`6. no mark above the header band${size ? " (844 x 390)" : ""}`, async ({
    page,
  }) => {
    if (size) {
      test.skip(!isMobile(), "844 x 390 runs in mobile-390");
      await page.setViewportSize(size);
    }
    await page.goto(SF.still);
    const { band, header } = await frame(page);
    expect(band).toBeCloseTo(header + 8, 1);
    const boxes = await markBoxes(page, MARKS);
    expect(boxes.length).toBeGreaterThan(0);
    for (const box of boxes) expect(box.top).toBeGreaterThanOrEqual(band);
  });
}

// ── 7. Bright marks outside the content box; dim constellations inside ────
const EDGE_MARKS =
  "[data-sf-edge] circle, [data-sf-edge] [data-sf-tw], [data-sf-drift] svg";

for (const width of [390, 1440, 1684, 1920, 2560]) {
  test(`7. edge marks and constellation backings at ${width}`, async ({
    page,
  }) => {
    test.skip(
      isMobile() !== (width === 390),
      "390 in mobile, wider in desktop",
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto(SF.still);
    const { contentLeft, contentRight } = await frame(page);
    if (width !== 1684 && width !== 2560) {
      const edges = await page.evaluate((sel) => {
        const shown = (el: Element | null): boolean => {
          for (let e = el; e; e = e.parentElement) {
            if (getComputedStyle(e).display === "none") return false;
          }
          return true;
        };
        return [...document.querySelectorAll(sel)].filter(shown).map((el) => {
          const r = el.getBoundingClientRect();
          // The starlight glow reaches 16px past the star.
          const glow = getComputedStyle(el).boxShadow === "none" ? 0 : 16;
          return { left: r.left - glow, right: r.right + glow };
        });
      }, EDGE_MARKS);
      expect(edges.length).toBeGreaterThan(0);
      for (const box of edges) {
        const outside =
          box.right <= contentLeft - 8 || box.left >= contentRight + 8;
        expect(outside, JSON.stringify(box)).toBe(true);
      }
    }
    const [start, end] = await markBoxes(page, "[data-sf-edge]");
    const backings = await markBoxes(page, "[data-sf-const]");
    expect(backings).toHaveLength(isMobile() ? 1 : 3);
    for (const box of backings) {
      expect(box.left).toBeGreaterThanOrEqual(start!.right - 0.01);
      expect(box.right).toBeLessThanOrEqual(end!.left + 0.01);
    }
  });
}

// ── 8-11. States ────────────────────────────────────────────────────────────
test("8. animating, with one running animation per twinkle", async ({
  page,
}) => {
  await page.goto("/");
  await waitForState(page, "animating");
  const states = await slotAnimations(page);
  expect(states).toEqual(Array(twinkles()).fill("running"));
});

test(
  "9. reduced motion: static, no animation, no streak in 60s",
  { tag: "@motion" },
  async ({ page }, testInfo) => {
    test.skip(
      !testInfo.project.name.endsWith("-reduced-motion"),
      "reduced-motion projects only",
    );
    await page.clock.install();
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.clock.runFor(3000); // the idle callback that loads the module
    await waitForState(page, "static");
    expect(await slotAnimations(page, "*")).toEqual([]);
    await page.clock.runFor(60_000);
    await expect(slot(page)).toHaveAttribute("data-sf-streaks", "0");
    await expect(slot(page).locator("[data-sf-streak]")).toHaveCount(0);
  },
);

test("10. a hidden tab pauses; visible again animates", async ({ page }) => {
  await page.goto(SF.noStreak);
  await waitForState(page, "animating");
  const setHidden = (hidden: boolean) =>
    page.evaluate((h) => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => h,
      });
      Object.defineProperty(document, "visibilityState", {
        configurable: true,
        get: () => (h ? "hidden" : "visible"),
      });
      document.dispatchEvent(new Event("visibilitychange"));
    }, hidden);
  await setHidden(true);
  await waitForState(page, "paused");
  expect(await slotAnimations(page)).toEqual(Array(twinkles()).fill("paused"));
  await setHidden(false);
  await waitForState(page, "animating");
});

test("11. no plain band in view pauses", async ({ page }) => {
  await page.goto(SF.noStreak);
  await waitForState(page, "animating");
  // The solid band's top 16px above the header band's bottom; it is at least
  // a viewport tall, so it covers the whole sky.
  await page.evaluate(() => {
    const band = document
      .querySelector("[data-sf-sky]")!
      .getBoundingClientRect().top;
    const solid = document.querySelector('[data-band="solid"]')!;
    window.scrollBy(0, solid.getBoundingClientRect().top - band + 16);
  });
  await waitForState(page, "paused");
  await page.evaluate(() => window.scrollTo(0, 0));
  await waitForState(page, "animating");
});

// ── 12. The falling star: demo and refused demo ────────────────────────────
// The viewport is set to the spec's 390 x 844 (iPhone 14's project viewport is
// 390 x 664, which passes too: the spacer and the refused path sit above 560).
async function openDemo(page: Page, route: string): Promise<void> {
  if (isMobile()) await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  // Preconditions (§13.3): fail loudly if the page above the spacer changes.
  const pre = await page.evaluate(() => {
    const band = document
      .querySelector("[data-sf-sky]")!
      .getBoundingClientRect().top;
    const open = document
      .querySelector('[data-sf-demo="open"]')!
      .getBoundingClientRect();
    const text = document
      .querySelector('[data-sf-demo="text"]')!
      .getBoundingClientRect();
    return {
      inView:
        open.left >= 0 &&
        open.right <= document.documentElement.clientWidth &&
        open.bottom <= innerHeight,
      belowBand: open.top - band,
      textTop: text.top,
      height: innerHeight,
    };
  });
  expect(pre.inView).toBe(true);
  expect(pre.belowBand).toBeGreaterThanOrEqual(24);
  expect(pre.textTop).toBeLessThan(pre.height);
  await waitForState(page, "animating");
}

test("12. demo: launches, survives to its end, and scrolling hides it at once", async ({
  page,
}) => {
  await openDemo(page, SF.demo);
  // (a) Within 4s of animating.
  await expect(slot(page)).toHaveAttribute("data-sf-streaks", /^[1-9]/, {
    timeout: 4000,
  });
  // (b) and (c), with no input at all. Nothing here depends on wall-clock
  // bounds, which a loaded machine breaks (M1.20b). The mid-flight sample is the
  // first frame at or after 600ms, and it must fall before the fade-out starts:
  // getComputedTiming().progress at most the end of the opacity-1 plateau, read
  // from the keyframe offsets. A frame that lands late is no failure of the
  // streak, so the sample is retaken on the next streak (the demo relaunches
  // every 3s), at most 3 streaks. Every streak watched must survive to its end
  // and be removed. "Increments again at the next 3s attempt" is counted in
  // sf-attempt measures (one per check, read by count, not by timestamp): the
  // first attempt to run after the streak's end launches in its third check.
  const result = await page.evaluate(async () => {
    const slotEl = document.querySelector("[data-starfield]")!;
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const measures = () => performance.getEntriesByName("sf-attempt").length;
    // At the next change of data-sf-streaks: the measures so far (null after `ms`).
    const nextLaunch = (ms: number) =>
      new Promise<number | null>((resolve) => {
        const timer = setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, ms);
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          observer.disconnect();
          resolve(measures());
        });
        observer.observe(slotEl, { attributeFilter: ["data-sf-streaks"] });
      });
    const runs: {
      props: string[];
      plateauEnd: number;
      time: number;
      progress: number;
      opacity: number;
      connected: boolean;
      removed: boolean;
    }[] = [];
    let previous: Element | null = null;
    let measuresAtEnd = 0;
    for (let round = 1; round <= 3; round++) {
      // A streak in flight that has not reached 600ms yet, new each round.
      let el: HTMLElement | undefined;
      let anim: Animation | undefined;
      const deadline = performance.now() + 10_000;
      while (!el || !anim) {
        const found = slotEl.querySelector<HTMLElement>(
          ":scope > [data-sf-streak]",
        );
        const a = found?.getAnimations()[0];
        if (found && a && found !== previous && Number(a.currentTime) < 600) {
          el = found;
          anim = a;
        } else if (performance.now() > deadline) {
          throw new Error(`no fresh streak within 10s (round ${round})`);
        } else await frame();
      }
      previous = el;
      const effect = anim.effect as KeyframeEffect;
      const keyframes = effect.getKeyframes();
      const props = [
        ...new Set(
          keyframes
            .flatMap((k) => Object.keys(k))
            .filter(
              (k) =>
                !["offset", "computedOffset", "easing", "composite"].includes(
                  k,
                ),
            ),
        ),
      ].sort();
      // The fade-out starts at the last keyframe at full opacity.
      const plateauEnd = Math.max(
        ...keyframes
          .filter((k) => Number(k.opacity) === 1)
          .map((k) => k.computedOffset),
      );
      const finished = anim.finished; // rejects (AbortError) if cancelled
      while (anim.playState === "running" && Number(anim.currentTime) < 600)
        await frame();
      const sample = {
        time: Number(anim.currentTime),
        progress: Number(effect.getComputedTiming().progress),
        opacity: Number(getComputedStyle(el).opacity),
        connected: el.isConnected,
      };
      await finished;
      measuresAtEnd = measures();
      runs.push({ props, plateauEnd, ...sample, removed: !el.isConnected });
      if (sample.progress <= plateauEnd) break;
    }
    const measuresAtLaunch = await nextLaunch(10_000);
    const checks =
      measuresAtLaunch === null ? null : measuresAtLaunch - measuresAtEnd;
    return { runs, checks };
  });
  test.info().annotations.push({
    type: "demo streak samples",
    description: JSON.stringify(result),
  });
  for (const run of result.runs) {
    expect(run.props).toEqual(["opacity", "transform"]);
    expect(run.connected).toBe(true);
    expect(run.removed).toBe(true);
  }
  const mid = result.runs.at(-1)!;
  expect(mid.time).toBeGreaterThanOrEqual(600);
  expect(mid.progress).toBeLessThanOrEqual(mid.plateauEnd);
  expect(mid.opacity).toBeGreaterThan(0.5);
  // The next attempt launched: three checks after the end, the last one launching.
  expect(result.checks).toBe(3);
  // (d) A 1px scroll in flight: no visible streak in the next frame. The streak
  // is found and the scroll made in one task, so it cannot end in between.
  const after = await page.evaluate(async () => {
    const slotEl = document.querySelector("[data-starfield]")!;
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    const deadline = performance.now() + 10_000;
    for (;;) {
      const el = slotEl.querySelector<HTMLElement>(":scope > [data-sf-streak]");
      const anim = el?.getAnimations()[0];
      if (el && anim?.playState === "running") {
        anim.finished.catch(() => {});
        window.scrollBy(0, 1);
        await frame();
        return {
          playState: anim.playState,
          hidden: !el.isConnected || getComputedStyle(el).opacity === "0",
        };
      }
      if (performance.now() > deadline) return null;
      await frame();
    }
  });
  expect(after).toEqual({ playState: "idle", hidden: true });
});

test("12. refused demo: aimed at text, every attempt is refused as text", async ({
  page,
}) => {
  await openDemo(page, SF.blocked);
  await expect(slot(page)).toHaveAttribute("data-sf-last-skip", "text", {
    timeout: 1000,
  });
  await page.waitForTimeout(4000);
  await expect(slot(page)).toHaveAttribute("data-sf-streaks", "0");
  await expect(slot(page)).toHaveAttribute("data-sf-last-skip", "text");
});

test("12. demo refused then clear: one refused check stops that attempt", async ({
  page,
}) => {
  await openDemo(page, SF.demo);
  await expect(slot(page)).toHaveAttribute("data-sf-streaks", /^[1-9]/, {
    timeout: 4000,
  });
  // In one task: read the count, cover the spacer with text, and watch the
  // attributes. The observer's microtask runs before the next check's task, so
  // check 1 is refused and checks 2-3 see open sky again. The page records what
  // happens, so a slow test runner cannot miss or misorder it (M1.20b): every
  // text refusal before the next launch, and the count that launch sets.
  const before = await page.evaluate(() => {
    const slotEl = document.querySelector("[data-starfield]")!;
    const r = document
      .querySelector('[data-sf-demo="open"]')!
      .getBoundingClientRect();
    const cover = document.createElement("p");
    cover.textContent = "Refused-then-clear probe";
    Object.assign(cover.style, {
      position: "fixed",
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
      margin: "0",
      zIndex: "2147483647",
    });
    // sf-attempt measures so far (one per check, in order; never timestamps).
    const measures = () => performance.getEntriesByName("sf-attempt").length;
    const probe = {
      texts: 0,
      removed: false,
      launched: false,
      measuresAtRefusal: 0,
      measuresAtLaunch: 0,
      streaks: 0,
      earlyLaunches: 0,
    };
    (window as unknown as { __sfProbe: typeof probe }).__sfProbe = probe;
    new MutationObserver((records) => {
      for (const rec of records) {
        if (probe.launched) return;
        if (rec.attributeName === "data-sf-streaks") {
          // A launch before the refusal would mean the cover was missed.
          if (!probe.removed) probe.earlyLaunches += 1;
          else {
            probe.launched = true;
            probe.measuresAtLaunch = measures();
            probe.streaks = Number(slotEl.getAttribute("data-sf-streaks"));
          }
        } else if (slotEl.getAttribute("data-sf-last-skip") === "text") {
          probe.texts += 1;
          if (!probe.removed) {
            cover.remove();
            probe.removed = true;
            probe.measuresAtRefusal = measures();
          }
        }
      }
    }).observe(slotEl, {
      attributeFilter: ["data-sf-last-skip", "data-sf-streaks"],
    });
    document.body.append(cover);
    return {
      streaks: Number(slotEl.getAttribute("data-sf-streaks")),
      skip: slotEl.getAttribute("data-sf-last-skip"),
    };
  });
  expect(before.skip).toBeNull();
  // The next attempt (every 3s) hits the cover on its first check; the attempt
  // after it, with the cover gone, launches again. A readiness wait.
  await page.waitForFunction(
    () =>
      (window as unknown as { __sfProbe: { launched: boolean } }).__sfProbe
        .launched,
    undefined,
    { timeout: 15_000 },
  );
  const probe = await page.evaluate(() => {
    const p = (
      window as unknown as {
        __sfProbe: {
          texts: number;
          earlyLaunches: number;
          streaks: number;
          measuresAtRefusal: number;
          measuresAtLaunch: number;
        };
      }
    ).__sfProbe;
    // sf-attempt measures (one per check) after the refused check, up to the launch.
    return { ...p, checks: p.measuresAtLaunch - p.measuresAtRefusal };
  });
  test.info().annotations.push({
    type: "refused then clear",
    description: JSON.stringify(probe),
  });
  expect(probe.earlyLaunches).toBe(0);
  expect(probe.texts).toBe(1); // only check 1 was refused
  // Checks 2-3 of the refused attempt (no launch), then the next attempt's
  // three checks, which launch: the refusal stopped that attempt.
  expect(probe.checks).toBe(5);
  expect(probe.streaks).toBe(before.streaks + 1);
});

// ── 13-14. Forced colours, print, increased contrast ───────────────────────
test("13. forced colours and print hide the slot", async ({ page }) => {
  await page.goto(SF.still);
  await page.emulateMedia({ forcedColors: "active" });
  await expect(slot(page)).toHaveCSS("display", "none");
  await page.emulateMedia({ forcedColors: "none", media: "print" });
  await expect(slot(page)).toHaveCSS("display", "none");
});

test("14. increased contrast: no dim marks, static", async ({ page }) => {
  await page.emulateMedia({ contrast: "more" });
  await page.goto("/");
  const dim = await page.evaluate(() =>
    [...document.querySelectorAll("[data-starfield] [data-sf-dim]")].map(
      (el) => getComputedStyle(el).display,
    ),
  );
  expect(dim.length).toBe(3);
  expect(new Set(dim)).toEqual(new Set(["none"]));
  await waitForState(page, "static");
});

// ── 15. Performance (§9) ────────────────────────────────────────────────────
test(
  "15. markup: the slot is at most 16KB raw and 5KB gzipped",
  { tag: "@perf" },
  async ({ page }) => {
    test.skip(isMobile(), "measured at 1440 (every tier is in the markup)");
    await page.goto("/");
    const html = await slot(page).evaluate((el) => el.outerHTML);
    const raw = Buffer.byteLength(html);
    const gz = gzipSync(html, { level: 9 }).length;
    test.info().annotations.push({
      type: "slot markup",
      description: `${raw} B raw, ${gz} B gz`,
    });
    expect(raw).toBeLessThanOrEqual(16 * 1024);
    expect(gz).toBeLessThanOrEqual(5 * 1024);
  },
);

/**
 * The bundled module around `at` in a Turbopack chunk: from its entry
 * (`<id>,e=>{` or `<id>,(e,t,r)=>{`) to the matching brace, strings skipped.
 */
function moduleAround(source: string, at: number): string {
  let start = -1;
  for (const m of source.matchAll(/[[,]\d+,\(?\w+(?:,\w+)*\)?=>\{/g)) {
    if (m.index >= at) break;
    start = m.index + 1;
  }
  if (start < 0) throw new Error("no module entry before the marker");
  let depth = 0;
  let quote = "";
  for (let i = source.indexOf("{", start); i < source.length; i++) {
    const c = source[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = "";
    } else if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error("unbalanced module");
}

test(
  "15. island: the motion chunk is lazy, after load, at most 3KB gzipped; loader at most 0.6KB",
  { tag: "@perf" },
  async ({ page }) => {
    const scripts: Response[] = [];
    page.on("response", (response) => {
      if (response.url().endsWith(".js")) scripts.push(response);
    });
    await page.goto("/");
    await waitForState(page, "animating");
    const bodies = await Promise.all(
      scripts.map(async (r) => [r.url(), await r.body()] as const),
    );
    const motion = bodies.filter(([, body]) =>
      body.includes("data-starfield-state"),
    );
    expect(motion).toHaveLength(1);
    const [url, body] = motion[0]!;
    const gz = gzipSync(body, { level: 9 }).length;
    test.info().annotations.push({
      type: "motion chunk",
      description: `${body.length} B raw, ${gz} B gz`,
    });
    expect(gz).toBeLessThanOrEqual(3 * 1024);
    // No dependency: no other module is bundled in (one module, one marker).
    expect(body.toString()).not.toMatch(/gsap|ScrollTrigger/);
    const timing = await page.evaluate((u) => {
      const nav = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;
      const res = performance.getEntriesByName(u)[0]!;
      return { load: nav.loadEventStart, start: res.startTime };
    }, url);
    expect(timing.start).toBeGreaterThan(timing.load);
    // The loader (StarfieldIsland) in the shared bundle, by its own marker: the
    // slot selector, which only the loader's module contains.
    const loaders = bodies.filter(
      ([, js]) => js.includes("[data-starfield]") && js !== body,
    );
    expect(loaders).toHaveLength(1);
    const source = loaders[0]![1].toString();
    const loader = moduleAround(source, source.indexOf("[data-starfield]"));
    expect(loader).toContain("requestIdleCallback");
    const loaderGz = gzipSync(loader, { level: 9 }).length;
    test.info().annotations.push({
      type: "loader module",
      description: `${loader.length} B raw, ${loaderGz} B gz`,
    });
    expect(loaderGz).toBeLessThanOrEqual(0.6 * 1024);
  },
);

test(
  "15. main thread: no script or layout work while it twinkles",
  { tag: "@perf" },
  async ({ page }) => {
    await page.goto(SF.noStreak);
    await waitForState(page, "animating");
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Performance.enable");
    const metric = async () => {
      const { metrics } = await cdp.send("Performance.getMetrics");
      const get = (name: string) =>
        metrics.find((m) => m.name === name)?.value ?? 0;
      return {
        script: get("ScriptDuration") * 1000,
        layouts: get("LayoutCount"),
      };
    };
    const before = await metric();
    await page.waitForTimeout(10_000);
    const after = await metric();
    test.info().annotations.push({
      type: "10s idle twinkle",
      description: `script ${(after.script - before.script).toFixed(2)}ms, layouts ${after.layouts - before.layouts}`,
    });
    expect(after.script - before.script).toBeLessThanOrEqual(20);
    expect(after.layouts - before.layouts).toBe(0);
  },
);

test(
  "15. paint: no paint storm while it twinkles",
  { tag: "@perf" },
  async ({ page, browser }) => {
    await page.goto(SF.noStreak);
    await waitForState(page, "animating");
    await page.waitForTimeout(500);
    await browser.startTracing(page, { categories: ["devtools.timeline"] });
    await page.waitForTimeout(5000);
    const trace = JSON.parse((await browser.stopTracing()).toString()) as {
      traceEvents: { name: string }[];
    };
    const paints = trace.traceEvents.filter((e) => e.name === "Paint").length;
    test.info().annotations.push({
      type: "Paint events in 5s",
      description: String(paints),
    });
    expect(paints).toBeLessThanOrEqual(2);
  },
);

// Each sf-attempt measure is one task: one path's corridor check (§4.5; the
// demo checks its fixed path three times per attempt, the worst case). Both
// projects run Chromium unthrottled (mobile-390 emulates the viewport, not the
// CPU). A 4x CDP CPU throttle is not used: it inflates elementFromPoint about
// 15x but plain script about 5x, so it is no stand-in for a phone (M1.19
// PUSHBACK). Budget: median within 4ms, every task under one frame (16ms),
// never a long task.
type Span = { startTime: number; duration: number };
test(
  "15. per attempt: sf-attempt within budget, never a long task",
  { tag: "@perf" },
  async ({ page }) => {
    await page.addInitScript(() => {
      const tasks: Span[] = [];
      (window as unknown as { __longTasks: Span[] }).__longTasks = tasks;
      new PerformanceObserver((list) => {
        for (const t of list.getEntries()) tasks.push(t.toJSON() as Span);
      }).observe({ type: "longtask" });
    });
    await page.goto(SF.demo);
    await waitForState(page, "animating");
    await page.waitForTimeout(12_000);
    const result = await page.evaluate(() => {
      const attempts = performance.getEntriesByName("sf-attempt");
      const tasks = (window as unknown as { __longTasks: Span[] }).__longTasks;
      // Only long tasks that overlap an attempt (page load has its own).
      const overlapping = tasks.filter((t) =>
        attempts.some(
          (a) =>
            t.startTime < a.startTime + a.duration &&
            a.startTime < t.startTime + t.duration,
        ),
      );
      return {
        attempts: attempts.map((a) => a.duration).sort((a, b) => a - b),
        longTasks: overlapping.length,
      };
    });
    const { attempts } = result;
    const median = attempts[Math.floor(attempts.length / 2)]!;
    const max = attempts.at(-1)!;
    test.info().annotations.push({
      type: "sf-attempt",
      description: `${attempts.length} tasks, median ${median.toFixed(1)}ms, max ${max.toFixed(1)}ms`,
    });
    expect(attempts.length).toBeGreaterThanOrEqual(12); // 4 attempts x 3 checks
    // The 4ms median is a review measurement: it holds in a serial run
    // (--workers=1); with parallel workers sharing the CPU, only the frame
    // budget and "never a long task" are asserted (M1.19 PUSHBACK).
    if (test.info().config.workers === 1) expect(median).toBeLessThanOrEqual(4);
    expect(max).toBeLessThanOrEqual(16);
    expect(result.longTasks).toBe(0);
  },
);

test(
  "15. compositor: each twinkle span on its own layer, no overlap growth",
  { tag: "@perf" },
  async ({ page }) => {
    const cdp = await page.context().newCDPSession(page);
    const started: string[] = [];
    cdp.on("Animation.animationStarted", (e) => started.push(e.animation.type));
    await cdp.send("Animation.enable");
    await page.goto(SF.noStreak);
    await waitForState(page, "animating");
    await page.waitForTimeout(500);
    const spans = twinkles();
    expect(
      started.filter((t) => t === "CSSAnimation").length,
    ).toBeGreaterThanOrEqual(spans);
    const animating = await layerSnapshot(cdp, page);
    const has = (l: { reasons: string[] }, re: RegExp) =>
      l.reasons.some((r) => re.test(r));
    // Per span (binding): every twinkle span has its own opacity-animation layer.
    const spanLayers = animating.filter(
      (l) => l.node === "span" && has(l, /^activeOpacityAnimation$/i),
    );
    expect(spanLayers).toHaveLength(spans);
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-motion", "off"),
    );
    await waitForState(page, "static");
    const still = await layerSnapshot(cdp, page);
    const overlap = (layers: typeof still) =>
      layers
        .filter(
          (l) => has(l, /overlap/i) && l.node !== "slot" && l.node !== "span",
        )
        .map((l) => l.node);
    const extraOverlap = overlap(animating).filter(
      (n) => !overlap(still).includes(n),
    );
    test.info().annotations.push({
      type: "layers",
      description: `animating ${animating.length}, static ${still.length}, spans ${spans}, new overlap ${JSON.stringify(extraOverlap)}`,
    });
    expect(extraOverlap.length).toBeLessThanOrEqual(2);
    for (const node of extraOverlap) expect(["main", "header"]).toContain(node);
    expect(animating.length - still.length).toBeLessThanOrEqual(32 + 2);
    expect(animating.length - still.length - spans).toBeLessThanOrEqual(2);
  },
);

test(
  "15. animated elements: at most 32, each border box at most 16 x 16",
  { tag: "@perf" },
  async ({ page }) => {
    await page.goto("/");
    await waitForState(page, "animating");
    const boxes = await page.evaluate(() =>
      document
        .querySelector("[data-starfield]")!
        .getAnimations({ subtree: true })
        .map((a) =>
          (a.effect as KeyframeEffect).target!.getBoundingClientRect(),
        )
        .map((r) => [r.width, r.height]),
    );
    expect(boxes.length).toBeLessThanOrEqual(32);
    for (const [w, h] of boxes) {
      expect(w).toBeLessThanOrEqual(16);
      expect(h).toBeLessThanOrEqual(16);
    }
  },
);

test(
  "15. no layout shift from the layer; LCP is never in it",
  { tag: "@perf" },
  async ({ page }) => {
    await page.goto("/");
    await waitForState(page, "animating");
    // Strict: no slack. Each shift's sources are annotated, so a failure names its cause.
    const cls = await layoutShifts(page);
    test.info().annotations.push({
      type: "layout shifts",
      description: cls.shifts.length
        ? JSON.stringify(cls.shifts)
        : "none (CLS 0)",
    });
    expect(cls.total).toBe(0);
    const result = await page.evaluate(
      () =>
        new Promise<{ shiftsInSlot: number; lcpInSlot: boolean; lcp: string }>(
          (resolve) => {
            const slotEl = document.querySelector("[data-starfield]")!;
            let shiftsInSlot = 0;
            new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as (PerformanceEntry & {
                sources: { node?: Node }[];
              })[]) {
                if (
                  entry.sources.some((s) => s.node && slotEl.contains(s.node))
                )
                  shiftsInSlot++;
              }
            }).observe({ type: "layout-shift", buffered: true });
            new PerformanceObserver((list) => {
              const last = list.getEntries().at(-1) as PerformanceEntry & {
                element: Element | null;
              };
              resolve({
                shiftsInSlot,
                lcpInSlot: !!last.element && slotEl.contains(last.element),
                lcp: last.element?.tagName ?? "none",
              });
            }).observe({ type: "largest-contentful-paint", buffered: true });
          },
        ),
    );
    expect(result.shiftsInSlot).toBe(0);
    expect(result.lcpInSlot).toBe(false);
  },
);

// ── 17. Markup rules (§4.5) on every route the suite visits ────────────────
const ROUTES = [
  "/",
  "/dev/tokens",
  "/dev/header",
  "/dev/footer",
  "/dev/footer/minimal",
  ...Object.values(SF),
];

test("17. no bare text in open sky; nothing in main skipped by hit tests", async ({
  page,
}) => {
  test.skip(!isMobile(), "markup only: runs once, in mobile-390");
  for (const route of ROUTES) {
    await page.goto(route);
    const issues = await page.evaluate(() => {
      const found: string[] = [];
      const open = document.querySelectorAll(
        'main, [data-band="plain"], [data-open-sky]',
      );
      for (const el of open) {
        for (const child of el.childNodes) {
          if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
            found.push(
              `bare text in ${el.tagName}: "${child.textContent.trim()}"`,
            );
          }
        }
      }
      const main = document.querySelector("main");
      for (const el of main ? main.querySelectorAll("*") : []) {
        const carries =
          el.matches("img, picture, video, [data-card]") ||
          [...el.childNodes].some(
            (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
          );
        if (carries && getComputedStyle(el).pointerEvents === "none") {
          found.push(`pointer-events: none on ${el.tagName}`);
        }
      }
      return found;
    });
    expect(issues, route).toEqual([]);
  }
});

// ── 18. The site's motion switch: html[data-motion="off"] ──────────────────
test("18. data-motion=off stops the twinkle before the island and holds static", async ({
  page,
}) => {
  await page.goto(SF.noStreak, { waitUntil: "domcontentloaded" });
  await page.evaluate(() =>
    document.documentElement.setAttribute("data-motion", "off"),
  );
  expect(await slotAnimations(page, "*")).toEqual([]);
  await waitForState(page, "static");
  await page.evaluate(() =>
    document.documentElement.removeAttribute("data-motion"),
  );
  await waitForState(page, "animating");
  expect(await slotAnimations(page)).toEqual(Array(twinkles()).fill("running"));
});

// ── 19. The minimum sky ─────────────────────────────────────────────────────
test("19. no dim marks under a 120px sky; they show at 128", async ({
  page,
}) => {
  test.skip(!isMobile(), "320px wide: mobile-390");
  const dimShown = () =>
    page.evaluate(() =>
      [...document.querySelectorAll("[data-starfield] [data-sf-dim]")].map(
        (el) => getComputedStyle(el).display !== "none",
      ),
    );
  await page.setViewportSize({ width: 320, height: 190 });
  await page.goto(SF.still);
  expect((await frame(page)).band).toBe(72);
  expect(await dimShown()).toEqual([false, false, false]);
  expect(await countShown(page, "[data-sf-edge] [data-sf-tw]")).toBe(4);
  await page.setViewportSize({ width: 320, height: 200 });
  expect(await dimShown()).toEqual([true, true, true]);
});

// ── §13.2 screenshots ───────────────────────────────────────────────────────
test(
  "screenshot dev-starfield-still",
  { tag: "@motion" },
  async ({ page }, testInfo) => {
    await page.goto(SF.still);
    await captureRoute(page, SF.still, testInfo, {
      name: "dev-starfield-still",
      fullPage: false,
    });
  },
);

test("screenshot dev-starfield-landscape", async ({ page }, testInfo) => {
  test.skip(!isMobile(), "mobile-390 only");
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto(SF.still);
  await captureRoute(page, SF.still, testInfo, {
    name: "dev-starfield-landscape",
    fullPage: false,
  });
});

test("screenshot dev-starfield-wide", async ({ page }, testInfo) => {
  test.skip(isMobile(), "desktop-1440 only");
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(SF.still);
  await captureRoute(page, SF.still, testInfo, {
    name: "dev-starfield-wide",
    fullPage: false,
  });
});

test("screenshot dev-starfield-streak", async ({ page }, testInfo) => {
  await page.goto(SF.demo);
  await waitForState(page, "animating");
  // Freeze a repeatable frame: the streak at 700ms, every twinkle at 0. The
  // streak is found and frozen in one task, so it cannot end in between; the
  // wait for it is a readiness wait (M1.20b).
  const frozen = await page.evaluate(async (sel) => {
    const slotEl = document.querySelector("[data-starfield]")!;
    const deadline = performance.now() + 15_000;
    for (;;) {
      const all = slotEl.getAnimations({ subtree: true });
      const streaks = all.filter(
        (a) =>
          (a.effect as KeyframeEffect).target?.matches(sel) &&
          a.playState === "running",
      );
      if (streaks.length === 1) {
        for (const a of all) {
          a.pause();
          a.currentTime = a === streaks[0] ? 700 : 0;
        }
        const s = streaks[0]!;
        return {
          streaks: 1,
          time: s.playState === "paused" ? Number(s.currentTime) : null,
        };
      }
      if (performance.now() > deadline) {
        return { streaks: streaks.length, time: null };
      }
      await new Promise((r) => requestAnimationFrame(r));
    }
  }, "[data-starfield] > [data-sf-streak]");
  expect(frozen).toEqual({ streaks: 1, time: 700 });
  await captureRoute(page, SF.demo, testInfo, {
    name: "dev-starfield-streak",
    fullPage: false,
    animations: "allow",
  });
});

test("screenshot dev-starfield-forced-colors", async ({ page }, testInfo) => {
  test.skip(!isMobile(), "mobile-390 only");
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto(SF.still);
  await captureRoute(page, SF.still, testInfo, {
    name: "dev-starfield-forced-colors",
    fullPage: false,
  });
});
