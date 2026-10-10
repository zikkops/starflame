import { readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

import type { Page } from "@playwright/test";

import {
  DISTANCE,
  DURATION,
  EASE,
  EASE_CSS,
  REDUCED,
  SCALE,
  STAGGER,
} from "../../lib/motion/tokens";

import { expect, test } from "./fixtures";
import { hasVisibleFocus } from "./support/keyboard";
import { layoutShift } from "./support/layout-shift";

const PRELOAD_BUDGET = 120_000; // bytes of woff2 preloaded per route (typography.md §2.4)

/** Every --color-* token declared in app/globals.css. */
function colourTokens(root: string): string[] {
  const css = readFileSync(join(root, "app", "globals.css"), "utf8");
  return [...css.matchAll(/^\s*(--color-[a-z0-9-]+):/gm)].map((m) => m[1]!);
}

test("body is Jost, the h1 is Cormorant, the night theme applies", async ({
  page,
}) => {
  await page.goto("/");
  const styles = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const h1 = document.querySelector("h1");
    return {
      body: body.fontFamily,
      h1: h1 ? getComputedStyle(h1).fontFamily : "",
      background: body.backgroundColor,
      color: body.color,
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
    };
  });
  // next/font family, then its metric-adjusted fallback, then the system stack.
  expect(styles.body).toMatch(/^"?Jost"?, "Jost Fallback", ui-sans-serif,/);
  expect(styles.h1).toMatch(
    /^"Cormorant Garamond", "Cormorant Garamond Fallback", Garamond,/,
  );
  expect(styles.background).toBe("rgb(11, 15, 36)"); // bg-page night-900
  expect(styles.color).toBe("rgb(243, 239, 231)"); // text-primary moon-100
  expect(styles.colorScheme).toBe("dark");

  // The real web fonts render (the token page uses both), not just fallbacks.
  await page.goto("/dev/tokens");
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts]
      .filter((face) => face.status === "loaded")
      .map((face) => `${face.family} ${face.style}`);
  });
  expect(loaded).toContain("Jost normal");
  expect(loaded).toContain("Cormorant Garamond normal");
});

test("every --color-* token is present at runtime", async ({
  page,
}, testInfo) => {
  const names = colourTokens(dirname(testInfo.config.configFile!));
  expect(names.length).toBeGreaterThan(90);
  await page.goto("/");
  const missing = await page.evaluate((list) => {
    const root = getComputedStyle(document.documentElement);
    return list.filter((name) => root.getPropertyValue(name).trim() === "");
  }, names);
  expect(missing).toEqual([]);
});

/** The unit each motion group must be written in (motion.md §7). */
const MOTION_UNIT: Record<string, RegExp> = {
  duration: /^\d+(\.\d+)?(ms|s)$/,
  stagger: /^\d+(\.\d+)?(ms|s)$/,
  "motion-distance": /^\d+(\.\d+)?px$/,
  "motion-scale": /^\d+(\.\d+)?$/, // unitless
};

/** Motion variables of one CSS block as "group.camelName" -> seconds, px or a factor. */
function motionValues(block: string): Record<string, number> {
  const values: Record<string, number> = {};
  const pattern =
    /--(duration|stagger|motion-distance|motion-scale)-([a-z-]+):\s*([^;]+);/g;
  for (const [, group, name, raw] of block.matchAll(pattern)) {
    const camel = name!.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    const value = raw!.trim();
    // A wrong unit (a duration in px, a scale in %) fails here, not as a number.
    expect(value, `--${group}-${name}`).toMatch(MOTION_UNIT[group!]!);
    const n = parseFloat(value);
    values[`${group}.${camel}`] = value.endsWith("ms") ? n / 1000 : n;
  }
  return values;
}

/** The same shape from the TS constants. */
function flatten(groups: Record<string, Record<string, number>>) {
  return Object.fromEntries(
    Object.entries(groups).flatMap(([group, values]) =>
      Object.entries(values).map(([name, value]) => [
        `${group}.${name}`,
        value,
      ]),
    ),
  );
}

test("lib/motion/tokens.ts mirrors the motion variables in globals.css", () => {
  const root = dirname(test.info().config.configFile!);
  const css = readFileSync(join(root, "app", "globals.css"), "utf8");
  const [normal = "", reduced = ""] = css.split(
    "@media (prefers-reduced-motion: reduce)",
  );
  expect(motionValues(normal)).toEqual(
    flatten({
      duration: DURATION,
      stagger: STAGGER,
      "motion-distance": DISTANCE,
      "motion-scale": SCALE,
    }),
  );
  expect(motionValues(reduced.split("Safety net")[0]!)).toEqual(
    flatten({
      duration: REDUCED.duration,
      "motion-distance": REDUCED.distance,
      "motion-scale": REDUCED.scale,
    }),
  );
  const easings = Object.fromEntries(
    [...normal.matchAll(/--ease-([a-z-]+):\s*([^;]+);/g)].map(([, name, v]) => [
      name!.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
      v!.trim(),
    ]),
  );
  expect(easings).toEqual(EASE_CSS);
  expect(Object.keys(EASE)).toEqual(Object.keys(EASE_CSS));
});

test("preloaded fonts stay within the 120 KB budget", async ({
  page,
  request,
}, testInfo) => {
  await page.goto("/");
  const hrefs = await page
    .locator('link[rel="preload"][as="font"]')
    .evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
  // Jost latin and Cormorant Garamond latin roman; the italic is not preloaded.
  expect(hrefs).toHaveLength(2);
  const root = dirname(testInfo.config.configFile!);
  let total = 0;
  for (const href of hrefs) {
    const response = await request.get(href);
    expect(response.status()).toBe(200);
    const bytes = (await response.body()).length;
    // Same bytes as the build output in .next/static/media.
    const onDisk = statSync(
      join(root, ".next", new URL(href).pathname.replace(/^\/_next/, "")),
    ).size;
    expect(bytes).toBe(onDisk);
    total += bytes;
  }
  testInfo.annotations.push({
    type: "preloaded font bytes",
    description: String(total),
  });
  expect(total).toBeLessThanOrEqual(PRELOAD_BUDGET);
});

test("the app icon is served (no favicon 404)", async ({ page, request }) => {
  await page.goto("/");
  const href = await page
    .locator('link[rel="icon"]')
    .first()
    .getAttribute("href");
  expect(href).toMatch(/^\/icon\.svg/);
  const response = await request.get(href!);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
});

test("the wordmark is an image named Starflames at its token heights", async ({
  page,
}, testInfo) => {
  await page.goto("/dev/tokens");
  const marks = page.getByRole("img", { name: "Starflames", exact: true });
  await expect(marks).toHaveCount(2);
  const desktop = testInfo.project.name.startsWith("desktop");
  const expected = desktop ? [36, 48] : [28, 40]; // header, footer (typography.md §3.3)
  for (const [i, height] of expected.entries()) {
    const box = await marks.nth(i).boundingBox();
    expect(box?.height).toBeCloseTo(height, 0);
    expect(box?.width).toBeGreaterThan(height * 3); // follows the viewBox ratio
  }
  // One definition per page: a zero-size sprite that is not display:none.
  const sprite = page.locator(
    "svg[aria-hidden='true']:has(symbol#sf-wordmark)",
  );
  await expect(sprite).toHaveCount(1);
  const spriteStyle = await sprite.evaluate((el) => {
    const style = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return { display: style.display, size: box.width + box.height };
  });
  expect(spriteStyle.display).not.toBe("none");
  expect(spriteStyle.size).toBe(0);
  // The fill follows currentColor: --color-wordmark (gold-300) here.
  const fill = await marks.first().evaluate((el) => getComputedStyle(el).color);
  expect(fill).toBe("rgb(232, 207, 150)");
});

test("the focus ring is visible on the token page's live controls", async ({
  page,
}) => {
  await page.goto("/dev/tokens");
  const button = page.getByRole("button", { name: "Add to bag" });
  expect(await hasVisibleFocus(button)).toBe(true);
});

/**
 * Presses Tab until the focused element has this text (or aria-label) and
 * returns its outline colour, read in the same evaluate as the focus check, so
 * a transition would still be at its first frame.
 */
async function outlineColourOnTab(page: Page, name: string): Promise<string> {
  for (let i = 0; i < 40; i += 1) {
    await page.keyboard.press("Tab");
    const colour = await page.evaluate((wanted) => {
      const el = document.activeElement;
      const label = el?.getAttribute("aria-label") ?? el?.textContent?.trim();
      const svg = el
        ?.querySelector("svg[aria-label]")
        ?.getAttribute("aria-label");
      return label === wanted || svg === wanted
        ? getComputedStyle(el!).outlineColor
        : "";
    }, name);
    if (colour) return colour;
  }
  throw new Error(`no tab stop named ${name}`);
}

// transition-colors includes outline-color, so without the base rule the ring
// would fade in from currentColor; it must be instant (motion.md §6.2).
test("the focus ring is gold-300 immediately after a keyboard Tab", async ({
  page,
}) => {
  await page.goto("/");
  // The header home link (transition-colors): skip link, then this.
  expect(await outlineColourOnTab(page, "Starflames")).toBe(
    "rgb(232, 207, 150)",
  );
  await page.goto("/dev/tokens");
  expect(await outlineColourOnTab(page, "Shop the collection")).toBe(
    "rgb(232, 207, 150)",
  );
});

// Slow fonts force the fallback-then-swap path, which is what could shift layout.
for (const route of ["/", "/dev/tokens"]) {
  test(`no layout shift from the font swap on ${route}`, async ({
    page,
  }, testInfo) => {
    await page.route("**/*.woff2", async (fontRoute) => {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
      await fontRoute.continue();
    });
    await page.goto(route);
    const cls = await layoutShift(page);
    testInfo.annotations.push({ type: "CLS", description: cls.toFixed(4) });
    expect(cls).toBeLessThan(0.05); // typography.md §2.3 target, page-wide
  });
}
