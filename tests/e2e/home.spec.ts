import type { Page, TestInfo } from "@playwright/test";

import { expect, test } from "./fixtures";
import { HERO_PREVIEW, heroSettled } from "./support/hero";
import { tabOrder } from "./support/keyboard";
import { layoutShifts } from "./support/layout-shift";

// The home hero (design/pages/home.md §3, §12, §14; M2.2). On "/" the hero
// has no CTAs until M2.3/M2.4 add the sections they jump to (§3.7); the CTA
// checks run on /dev/hero, the same component with both CTAs and stand-in
// #collections / #bestsellers sections.

const HEADING = "Light a little starlight.";
const TITLE = "Starflames · Scented candles for starlit evenings";
const DESCRIPTION =
  "Scented candles, travel tins, wax melts and gift sets inspired by moonlit terraces, starry reading rooms, pine forests and still mountain lakes.";
const ALT =
  "A lit candle in a smoky blue glass jar on a stone terrace ledge at night, above a still lake, distant hillside lights and a starry violet sky.";

const isDesktop = (testInfo: TestInfo): boolean =>
  testInfo.project.name.startsWith("desktop");
/** --section-y at this project's width (64px at 390, 128px at 1440). */
const sectionY = (testInfo: TestInfo): number =>
  isDesktop(testInfo) ? 128 : 64;
/** --header-h at this project's width. */
const headerH = (testInfo: TestInfo): number => (isDesktop(testInfo) ? 80 : 64);

type Rect = { top: number; right: number; bottom: number; left: number };

async function rectOf(page: Page, selector: string): Promise<Rect> {
  return page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top, right: r.right, bottom: r.bottom, left: r.left };
  });
}

const PRIMARY = "#hero [data-hero-reveal] > a:first-child";
const TEXT_LINK = "#hero [data-hero-reveal] > a + a";

// ── "/" (the M2.2 state) ────────────────────────────────────────────────────

test("1. / is 200 with one h1, the home title and description", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText(HEADING);
  await expect(page).toHaveTitle(TITLE);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    DESCRIPTION,
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    TITLE,
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    DESCRIPTION,
  );
  // No placeholder social image before M8.5/M8.6 (§12).
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
});

test("2. the hero is a named solid region that ends flush", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.getByRole("region", { name: HEADING });
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("id", "hero");
  await expect(hero).toHaveAttribute("data-band", "solid");
  await expect(hero).toHaveAttribute("data-flush-end", "");
  // The eyebrow and the h1 in an hgroup; only the eyebrow, the subcopy and the
  // CTA group are ever pre-hidden, never the hgroup, the h1 or the image (§3.6).
  await expect(page.locator("#hero hgroup > *")).toHaveText([
    "Scented candles for the night",
    HEADING,
  ]);
  await expect(
    page.locator(
      "#hero :is(hgroup, h1, img, picture, .hero-media, .hero-image, .hero-glow)[data-hero-reveal]",
    ),
  ).toHaveCount(0);
  await expect(page.locator("[data-hero-reveal]")).toHaveText([
    "Scented candles for the night",
    "Inspired by moonlit terraces, starry reading rooms and still lakes, for long, quiet evenings.",
  ]);
});

test("3. no dead in-page link: no CTA until its section exists", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#collections, #bestsellers")).toHaveCount(0);
  await expect(page.locator("#hero a, #hero button")).toHaveCount(0);
  for (const route of ["/", HERO_PREVIEW]) {
    await page.goto(route);
    const dead = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
        .map((a) => a.getAttribute("href")!.slice(1))
        .filter((id) => !document.getElementById(id)),
    );
    expect(dead, route).toEqual([]);
  }
});

test("4. the hero image: art-directed, eager, high priority, the only one", async ({
  page,
}, testInfo) => {
  const sizes: number[] = [];
  page.on("response", async (response) => {
    if (response.url().includes("/_next/image?")) {
      sizes.push((await response.body()).length);
    }
  });
  await page.goto("/");
  const img = page.locator("#hero picture > img");
  await expect(img).toBeVisible();
  await expect(img).toHaveAttribute("alt", ALT);
  await expect(img).toHaveAttribute("fetchpriority", "high");
  await expect(img).toHaveAttribute("loading", "eager");
  await expect(img).toHaveAttribute("sizes", "100vw");
  await expect(page.locator("#hero picture > source")).toHaveAttribute(
    "media",
    "(min-width: 48rem)",
  );
  await expect(page.locator("#hero picture > source")).toHaveAttribute(
    "sizes",
    "(min-width: 64rem) 81vw, 133.3vw",
  );
  await expect(
    page.locator('img[fetchpriority="high"], img[loading="eager"]'),
  ).toHaveCount(1);
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.complete))
    .toBe(true);
  const served = await img.evaluate((el: HTMLImageElement) => ({
    src: decodeURIComponent(el.currentSrc),
    natural: el.naturalWidth,
  }));
  // 390 at DPR 3 (1170px) and 1440 at DPR 1 (81vw = 1166px) both take 1200w.
  expect(served.src).toContain(
    isDesktop(testInfo) ? "hero-desktop" : "hero-mobile",
  );
  expect(served.src).toMatch(/[?&]w=1200&/);
  testInfo.annotations.push({
    type: "hero image",
    description: `${served.src} (${served.natural}px wide, ${sizes.join(", ")} bytes)`,
  });
});

test.describe("4b. iPad portrait (768 at DPR 2)", () => {
  test.use({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });

  test("the md sizes (133.3vw) picks the 2048w candidate", async ({
    page,
  }, testInfo) => {
    // One viewport, so one project is enough.
    test.skip(testInfo.project.name !== "desktop-1440", "runs once");
    await page.goto("/");
    const img = page.locator("#hero picture > img");
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.complete))
      .toBe(true);
    const src = await img.evaluate((el: HTMLImageElement) =>
      decodeURIComponent(el.currentSrc),
    );
    // 133.3vw × 2 = 2047.5px fits the 2048 bucket (home.md §3.9); 134vw
    // would ask for 2058px and fetch the 3840w file.
    expect(src).toContain("hero-desktop");
    expect(src).toMatch(/[?&]w=2048&/);
  });
});

test("LCP: the largest contentful paint is the hero image", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const img = page.locator("#hero picture > img");
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.complete))
    .toBe(true);
  await heroSettled(page);
  const lcp = await page.evaluate(
    () =>
      new Promise<{ element: string; size: number; time: number }>(
        (resolve) => {
          new PerformanceObserver((list) => {
            const entries = list.getEntries() as (PerformanceEntry & {
              element: Element | null;
              size: number;
            })[];
            const last = entries.at(-1)!;
            resolve({
              element: last.element?.matches("#hero picture > img")
                ? "hero image"
                : (last.element?.outerHTML.slice(0, 80) ?? "none"),
              size: last.size,
              time: last.startTime,
            });
          }).observe({ type: "largest-contentful-paint", buffered: true });
        },
      ),
  );
  testInfo.annotations.push({
    type: "LCP",
    description: `${lcp.element}, ${lcp.size} px², ${lcp.time.toFixed(0)} ms (unthrottled)`,
  });
  expect(lcp.element).toBe("hero image");
});

test("6. the box, the crop and the glow per breakpoint", async ({
  page,
}, testInfo) => {
  await page.goto(HERO_PREVIEW);
  await heroSettled(page);
  const media = await rectOf(page, ".hero-media");
  const band = await rectOf(page, "#hero");
  const glow = page.locator(".hero-glow");
  await expect(glow).toHaveAttribute("aria-hidden", "true");
  await expect(glow).toHaveAttribute("data-decorative", "");
  const crop = await page
    .locator("#hero picture > img")
    .evaluate((el) => getComputedStyle(el).objectPosition);
  if (!isDesktop(testInfo)) {
    // Full bleed 1:1, 32px under the last CTA row; no glow below md (§3.2, §3.4).
    expect(media.left).toBe(band.left);
    expect(media.right).toBe(band.right);
    expect(media.bottom - media.top).toBeCloseTo(media.right - media.left, 0);
    const link = await rectOf(page, TEXT_LINK);
    expect(media.top - link.bottom).toBeCloseTo(32, 0);
    expect(crop).toBe("50% 80%");
    await expect(glow).toBeHidden();
    return;
  }
  // From lg: from the col-6 line (32px after the text column) to the band's
  // end edge, 5:4, top at the header's bottom edge (§3.2, §3.5).
  const text = await rectOf(page, "#hero hgroup");
  const width = media.right - media.left;
  // Columns 1–5 of the 12-column grid: 514.7px in a 1440px band; the e2e
  // browser reserves a 15px scrollbar gutter (scrollbar-gutter: stable), so
  // the band is 1425px and the column 508.4px.
  const content = Math.min(band.right - band.left - 2 * 80, 1280);
  const col = (content - 11 * 32) / 12;
  expect(text.right - text.left).toBeCloseTo(5 * col + 4 * 32, 0);
  expect(media.left - text.right).toBeCloseTo(32, 0);
  expect(media.right).toBeCloseTo(band.right, 0);
  expect((media.bottom - media.top) / width).toBeCloseTo(0.8, 2);
  expect(media.top).toBeCloseTo(headerH(testInfo), 1);
  expect(crop).toBe("100% 50%");
  // The glow: 60% of the box wide, centred at 43.1% / 57%, at least 100px clear
  // of the text column (§3.4).
  const g = await rectOf(page, ".hero-glow");
  expect(g.right - g.left).toBeCloseTo(width * 0.6, 0);
  expect((g.left + g.right) / 2 - media.left).toBeCloseTo(width * 0.431, 0);
  expect((g.top + g.bottom) / 2 - media.top).toBeCloseTo(
    (media.bottom - media.top) * 0.57,
    0,
  );
  expect(g.left - text.right).toBeGreaterThanOrEqual(100);
  // Behind the image, in the band's own stacking context.
  expect(await glow.evaluate((el) => getComputedStyle(el).zIndex)).toBe("-1");
});

test("the feather mask is static and on the image only", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  const mask = await page
    .locator(".hero-image")
    .evaluate((el) => getComputedStyle(el).maskImage);
  const gradients = mask.match(/linear-gradient/g) ?? [];
  expect(gradients).toHaveLength(isDesktop(testInfo) ? 2 : 1);
  expect(mask).toContain("8%");
  expect(mask).toContain("84%");
  if (isDesktop(testInfo)) {
    expect(mask).toContain("24%");
    expect(mask).toContain("92%");
  }
  expect(
    await page
      .locator(".hero-image")
      .evaluate((el) => el.getAnimations().length),
  ).toBe(0);
});

// ── Bands (§2.3, e2e 13) ────────────────────────────────────────────────────

test("13. the band after the flush-ending hero keeps its top padding", async ({
  page,
}, testInfo) => {
  const y = `${sectionY(testInfo)}px`;
  const top = isDesktop(testInfo) ? "0px" : "24px";
  // /dev/hero: hero (bottom 0) → plain #collections (top --section-y) →
  // plain #bestsellers (collapsed, top 0).
  await page.goto(HERO_PREVIEW);
  const pads = await page.evaluate(() =>
    ["#hero", "#collections", "#bestsellers"].map((id) => {
      const style = getComputedStyle(document.querySelector(id)!);
      return [style.paddingTop, style.paddingBottom];
    }),
  );
  expect(pads).toEqual([
    [top, "0px"],
    [y, y],
    ["0px", y],
  ]);
  // "/": the hero is the last band before the footer, so it keeps its bottom
  // padding (layout-shell.md §5.1).
  await page.goto("/");
  const hero = await page
    .locator("#hero")
    .evaluate((el) => [
      getComputedStyle(el).paddingTop,
      getComputedStyle(el).paddingBottom,
    ]);
  expect(hero).toEqual([top, y]);
});

// ── The CTAs (/dev/hero) ────────────────────────────────────────────────────

test("11. the text link sits 32px from the primary CTA", async ({
  page,
}, testInfo) => {
  await page.goto(HERO_PREVIEW);
  await heroSettled(page);
  const cta = await rectOf(page, PRIMARY);
  const link = await rectOf(page, TEXT_LINK);
  const gap = isDesktop(testInfo)
    ? link.left - cta.right
    : link.top - cta.bottom;
  testInfo.annotations.push({ type: "CTA–link gap", description: `${gap}px` });
  // ≥ 30 keeps the link's focus ring (4px out) outside the 26px glow footprint.
  expect(gap).toBeGreaterThanOrEqual(30);
  expect(gap).toBeCloseTo(32, 0);
});

test("12. at 390 the subcopy is 3 lines and the CTA is in thumb reach", async ({
  page,
}, testInfo) => {
  test.skip(isDesktop(testInfo), "390 only");
  for (const route of ["/", HERO_PREVIEW]) {
    await page.goto(route);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const sub = await rectOf(page, "#hero p.type-body-lg");
    expect(sub.bottom - sub.top, route).toBeLessThanOrEqual(87);
  }
  await heroSettled(page);
  const cta = await rectOf(page, PRIMARY);
  expect(cta.top).toBeLessThanOrEqual(340);
});

test("the CTAs: names, targets, sizes, keyboard order", async ({
  page,
}, testInfo) => {
  await page.goto(HERO_PREVIEW);
  await heroSettled(page);
  const primary = page.locator(PRIMARY);
  const link = page.locator(TEXT_LINK);
  await expect(primary).toHaveText("Shop favorites");
  await expect(primary).toHaveAttribute("href", "#bestsellers");
  await expect(link).toHaveText("Explore collections");
  await expect(link).toHaveAttribute("href", "#collections");
  await expect(link.locator("svg")).toHaveAttribute("aria-hidden", "true");
  const cta = await rectOf(page, PRIMARY);
  expect(cta.bottom - cta.top).toBeGreaterThanOrEqual(48);
  expect(
    (await rectOf(page, TEXT_LINK)).bottom -
      (await rectOf(page, TEXT_LINK)).top,
  ).toBeGreaterThanOrEqual(44);
  // Full width at base (350 = 390 − 2 × 20), auto from md.
  if (isDesktop(testInfo)) expect(cta.right - cta.left).toBeLessThan(250);
  else expect(cta.right - cta.left).toBeCloseTo(350, 0);
  // Skip link, wordmark, then the two CTAs (§10.2).
  const order = await tabOrder(page, 4);
  expect(order.slice(2)).toEqual(["a:Shop favorites", "a:Explore collections"]);
});

test("the primary CTA: glow on hover and focus, the ring, the press colour", async ({
  page,
}, testInfo) => {
  test.skip(!isDesktop(testInfo), "pointer hover: 1440 only");
  await page.goto(HERO_PREVIEW);
  await heroSettled(page);
  const primary = page.locator(PRIMARY);
  const glow = () =>
    primary.evaluate((el) => {
      const after = getComputedStyle(el, "::after");
      return { opacity: after.opacity, shadow: after.boxShadow };
    });
  expect((await glow()).opacity).toBe("0");
  expect((await glow()).shadow).toContain("rgba(247, 184, 97, 0.28)");
  await primary.hover();
  await expect.poll(async () => (await glow()).opacity).toBe("1");
  await expect
    .poll(() => primary.evaluate((el) => getComputedStyle(el).backgroundColor))
    .toBe("rgb(251, 207, 138)");
  await page.mouse.move(0, 0);
  await expect.poll(async () => (await glow()).opacity).toBe("0");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(primary).toBeFocused();
  await expect.poll(async () => (await glow()).opacity).toBe("1");
  const ring = await primary.evaluate((el) => {
    const s = getComputedStyle(el);
    return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineOffset} ${s.outlineColor}`;
  });
  expect(ring).toBe("solid 2px 2px rgb(232, 207, 150)");
});

test("5. Shop favorites lands the section below the sticky header", async ({
  page,
}, testInfo) => {
  await page.goto(HERO_PREVIEW);
  await heroSettled(page);
  await page.locator(PRIMARY).click();
  await expect(page).toHaveURL(/#bestsellers$/);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(500);
  const heading = await rectOf(page, "#bestsellers-heading");
  const header = await rectOf(page, "body > header");
  expect(heading.top).toBeGreaterThanOrEqual(header.bottom - 0.5);
  expect(header.bottom).toBeCloseTo(headerH(testInfo), 1);
});

// ── The header over the hero (§3.5, header.md §8) ───────────────────────────

test("the hero starts below the header, which is opaque once scrolled", async ({
  page,
}) => {
  await page.goto(HERO_PREVIEW);
  await heroSettled(page);
  const header = page.locator("body > header");
  await expect(header).not.toHaveAttribute("data-scrolled");
  await expect(header).not.toHaveAttribute("data-over-image");
  // At rest no part of the hero, its image included, is under the bar.
  const bar = await rectOf(page, "body > header");
  const hero = await rectOf(page, "#hero");
  const media = await rectOf(page, ".hero-media");
  expect(hero.top).toBeCloseTo(bar.bottom, 1);
  expect(media.top).toBeGreaterThanOrEqual(bar.bottom);
  // At rest the surface is off: the bar shows bg-page, never the photo.
  const surface = () =>
    header.evaluate((el) => getComputedStyle(el, "::before").opacity);
  expect(await surface()).toBe("0");
  // Scrolled: the opaque bg-raised surface is on before the image reaches it.
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await expect.poll(surface).toBe("1");
  expect(
    await header.evaluate(
      (el) => getComputedStyle(el, "::before").backgroundColor,
    ),
  ).toBe("rgb(19, 26, 56)");
});

test("the starfield is paused behind the solid hero", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.endsWith("-reduced-motion"),
    "no-preference only",
  );
  // No plain band in view at scroll 0, so the fixed sky is fully covered
  // (starfield.md §6) and nothing twinkles behind the hero. "/" at 390 and
  // 1440: the solid hero, then the sunken footer. /dev/hero at 390 only (at
  // 1440 its plain #collections stand-in is in view).
  await page.addInitScript(() => {
    const w = window as Window & { __sf?: string[] };
    w.__sf = [];
    new MutationObserver((records) => {
      for (const record of records) {
        const el = record.target as Element;
        w.__sf!.push(el.getAttribute("data-starfield-state") ?? "");
      }
    }).observe(document, {
      attributes: true,
      subtree: true,
      attributeFilter: ["data-starfield-state"],
    });
  });
  const routes = isDesktop(testInfo) ? ["/"] : ["/", HERO_PREVIEW];
  for (const route of routes) {
    await page.goto(route);
    await expect(page.locator("[data-starfield]"), route).toHaveAttribute(
      "data-starfield-state",
      "paused",
      { timeout: 20_000 },
    );
    // Paused from the start: it never animated behind the hero.
    const states = await page.evaluate(
      () => (window as Window & { __sf?: string[] }).__sf ?? [],
    );
    expect(states, route).not.toContain("animating");
  }
});

// ── Motion (§3.6, §9; motion.md §5.1): CSS only, from first paint ───────────

/** The computed animation of each `[data-hero-reveal]`, in DOM order. */
async function revealAnimations(page: Page) {
  return page.locator("[data-hero-reveal]").evaluateAll((els) =>
    els.map((el) => {
      const s = getComputedStyle(el);
      return {
        name: s.animationName,
        duration: s.animationDuration,
        easing: s.animationTimingFunction,
        fill: s.animationFillMode,
        delay: s.animationDelay,
        running: el.getAnimations().length,
      };
    }),
  );
}

test("14. the entrance is the CSS hero-reveal animation, no JS", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.endsWith("-reduced-motion"),
    "no-preference only",
  );
  // From before the first script: every class <html> ever gets, and, at
  // DOMContentLoaded, whether the h1 and the image are visible and still.
  await page.addInitScript(() => {
    const w = window as Window & {
      __hero?: { classes: string[]; still: string[] };
    };
    const record = { classes: [] as string[], still: [] as string[] };
    w.__hero = record;
    new MutationObserver(() => {
      record.classes.push(document.documentElement.className);
    }).observe(document, {
      attributes: true,
      subtree: true,
      attributeFilter: ["class"],
    });
    document.addEventListener("DOMContentLoaded", () => {
      record.classes.push(document.documentElement.className);
      for (const selector of ["#hero h1", "#hero img"]) {
        const el = document.querySelector(selector)!;
        record.still.push(
          `${getComputedStyle(el).opacity} ${el.getAnimations().length}`,
        );
      }
    });
  });
  for (const [route, delays] of [
    ["/", ["0s", "0.1s"]],
    [HERO_PREVIEW, ["0s", "0.1s", "0.2s"]],
  ] as const) {
    await page.goto(route);
    const animations = await revealAnimations(page);
    expect(
      animations.map(({ delay }) => delay),
      route,
    ).toEqual(delays);
    for (const animation of animations) {
      expect(animation, route).toMatchObject({
        name: "hero-reveal",
        duration: "0.7s",
        easing: "cubic-bezier(0.165, 0.84, 0.44, 1)",
        fill: "backwards",
      });
    }
    await heroSettled(page);
    // Afterwards: visible, no transform, nothing inline, nothing running.
    const after = await page
      .locator("[data-hero-reveal]")
      .evaluateAll((els) =>
        els.map(
          (el) =>
            `${getComputedStyle(el).opacity} ${getComputedStyle(el).transform} ${el.getAttribute("style")} ${el.getAnimations().length}`,
        ),
      );
    expect(after, route).toEqual(delays.map(() => "1 none null 0"));
    const record = await page.evaluate(
      () =>
        (
          window as Window & {
            __hero?: { classes: string[]; still: string[] };
          }
        ).__hero!,
    );
    // The h1 and the image: visible and not animated from the start (§3.6).
    expect(record.still, route).toEqual(["1 0", "1 0"]);
    // The retired head script's class never appears.
    expect(record.classes.join(" "), route).not.toContain("hero-pending");
    await expect(page.locator("html")).not.toHaveClass(/hero-pending/);
  }
});

test.describe("without the app JS", () => {
  test.use({ expectedIssues: [/\/_next\/static\/chunks\//] });

  type NoJsRun = {
    route: string;
    targets: number;
    ends: number;
    /** The last hero-reveal animationend, in ms after DOMContentLoaded. */
    last: number;
    opacities: string[];
  };

  /**
   * Loads "/" and /dev/hero with every JS chunk aborted and records, per
   * route, the hero-reveal animationend events (page time) and the targets'
   * final opacity. Returns the runs and how many chunk requests were aborted.
   */
  async function withoutJs(
    page: Page,
  ): Promise<{ runs: NoJsRun[]; aborted: number }> {
    let aborted = 0;
    await page.route("**/_next/static/chunks/*.js", (route) => {
      aborted += 1;
      return route.abort();
    });
    await page.addInitScript(() => {
      const w = window as Window & { __t?: { dcl: number; ends: number[] } };
      const t = { dcl: -1, ends: [] as number[] };
      w.__t = t;
      document.addEventListener("DOMContentLoaded", () => {
        t.dcl = performance.now();
      });
      document.addEventListener(
        "animationend",
        (event) => {
          if (event.animationName === "hero-reveal") {
            t.ends.push(performance.now());
          }
        },
        true,
      );
    });
    const runs: NoJsRun[] = [];
    for (const route of ["/", HERO_PREVIEW]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const targets = await page.locator("[data-hero-reveal]").count();
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                (window as Window & { __t?: { ends: number[] } }).__t!.ends
                  .length,
            ),
          { message: route },
        )
        .toBe(targets);
      const t = await page.evaluate(
        () =>
          (window as Window & { __t?: { dcl: number; ends: number[] } }).__t!,
      );
      const opacities = await page
        .locator("[data-hero-reveal]")
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
      runs.push({
        route,
        targets,
        ends: t.ends.length,
        last: Math.max(...t.ends) - t.dcl,
        opacities,
      });
    }
    return { runs, aborted };
  }

  test("15. the entrance ends visible with every JS chunk aborted", async ({
    page,
  }, testInfo) => {
    test.skip(
      testInfo.project.name.endsWith("-reduced-motion"),
      "no-preference only",
    );
    const { runs, aborted } = await withoutJs(page);
    for (const run of runs) {
      expect(run.targets, run.route).toBeGreaterThan(0);
      expect(run.ends, run.route).toBe(run.targets);
      expect(run.opacities, run.route).toEqual(Array(run.targets).fill("1"));
    }
    expect(aborted).toBeGreaterThan(0);
  });

  // The wall-clock bound runs in the serial @perf pass only: under parallel
  // load the animationend dispatch can lag without anything being wrong.
  test(
    "15b. without JS the last animationend is within 1.5 s of DOMContentLoaded",
    { tag: "@perf" },
    async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name.endsWith("-reduced-motion"),
        "no-preference only",
      );
      const { runs, aborted } = await withoutJs(page);
      expect(aborted).toBeGreaterThan(0);
      for (const run of runs) {
        testInfo.annotations.push({
          type: `no JS ${run.route}`,
          description: `last animationend ${run.last.toFixed(0)} ms after DOMContentLoaded`,
        });
        expect(run.ends, run.route).toBe(run.targets);
        expect(run.last, run.route).toBeLessThanOrEqual(1_500);
      }
    },
  );
});

test("16. data-motion=off before first paint: no entrance", async ({
  page,
}) => {
  // The M8.8b hook, set as early as M8.8b's own head script will set it.
  await page.addInitScript(() => {
    const set = () => {
      if (!document.documentElement) return false;
      document.documentElement.dataset.motion = "off";
      return true;
    };
    if (!set()) {
      const observer = new MutationObserver(() => {
        if (set()) observer.disconnect();
      });
      observer.observe(document, { childList: true });
    }
  });
  for (const route of ["/", HERO_PREVIEW]) {
    await page.goto(route);
    const animations = await revealAnimations(page);
    expect(animations.length, route).toBeGreaterThan(0);
    expect(
      animations.map(({ name, running }) => `${name} ${running}`),
      route,
    ).toEqual(animations.map(() => "none 0"));
    const opacities = await page
      .locator("[data-hero-reveal]")
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
    expect(
      opacities.every((o) => o === "1"),
      route,
    ).toBe(true);
  }
});

test(
  "7. reduced motion: no entrance declared, nothing hidden",
  { tag: "@motion" },
  async ({ page }, testInfo) => {
    test.skip(
      !testInfo.project.name.endsWith("-reduced-motion"),
      "reduced-motion projects only",
    );
    for (const route of ["/", HERO_PREVIEW]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      // From the first paint: no animation on any reveal target.
      const animations = await revealAnimations(page);
      expect(
        animations.map(({ name, running }) => `${name} ${running}`),
        route,
      ).toEqual(animations.map(() => "none 0"));
      await page.waitForLoadState("load");
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>("main *")]
          .filter((el) => el.style.opacity === "0" || el.style.transform !== "")
          .map((el) => el.tagName),
      );
      expect(hidden, route).toEqual([]);
      const opacities = await page
        .locator("[data-hero-reveal]")
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity));
      expect(
        opacities.every((o) => o === "1"),
        route,
      ).toBe(true);
    }
  },
);

test("10. no layout shift on / and /dev/hero, entrance included", async ({
  page,
}, testInfo) => {
  for (const route of ["/", HERO_PREVIEW]) {
    await page.goto(route);
    await heroSettled(page);
    const { total, shifts } = await layoutShifts(page);
    testInfo.annotations.push({
      type: `CLS ${route}`,
      description:
        total === 0 ? "none (CLS 0)" : `${total} ${JSON.stringify(shifts)}`,
    });
    expect(total, route).toBeLessThan(0.05);
  }
});

test("8. no horizontal scroll at 320", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const route of ["/", HERO_PREVIEW]) {
    await page.goto(route);
    await heroSettled(page);
    const sideways = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(sideways, route).toBe(false);
  }
});
