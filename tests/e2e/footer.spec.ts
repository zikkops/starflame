import type { Page, TestInfo } from "@playwright/test";

import {
  footerGroup,
  headerMore,
  headerPrimary,
  type RegistryOptions,
} from "../../components/layout/site-routes";

import { expect, test } from "./fixtures";
import { buildYear } from "./support/build";
import { hasVisibleFocus, tabOrder } from "./support/keyboard";
import { layoutShift } from "./support/layout-shift";

// The site footer (design/components/footer.md §11.3, M1.17). Public routes show
// the minimal sign-off; /dev/footer shows every item, driven by its own controls
// on one loaded page (never by URL); /dev/footer/minimal is the shipped state.

const FULL = "/dev/footer";
const MINIMAL = "/dev/footer/minimal";
const BRAND_LINE = "Candles for long, starlit evenings.";

const EXPLORE = ["Shop", "Collections", "Gift sets", "Our story", "Search"];
const COLLECTIONS = [
  "Moonlit Terrace",
  "Starlit Library",
  "Ember Grove",
  "Lakeside Hush",
  "Comet Season",
];
const HELP = ["FAQ", "Contact us", "Shipping & returns", "Your account"];
const LEGAL = ["Privacy policy", "Terms & conditions"];
const SOCIAL = ["Starflames on Instagram", "Starflames on Pinterest"];

const desktop = (testInfo: TestInfo): boolean =>
  testInfo.project.name.startsWith("desktop");

const footer = (page: Page) => page.getByRole("contentinfo");
const list = (page: Page, name: string) =>
  footer(page).getByRole("list", { name, exact: true });

/** Loads /dev/footer and waits for hydration (React has attached to the controls). */
async function openFull(page: Page): Promise<void> {
  await page.goto(FULL);
  await page.waitForFunction(() => {
    const box = document.querySelector("main input[type='checkbox']");
    return !!box && Object.keys(box).some((key) => key.startsWith("__react"));
  });
}

const slot = (page: Page) => page.locator("[data-footer-slot]");

// ── Public `/` (the M1.17 state) and /dev/footer/minimal (check 15) ─────────

for (const route of ["/", MINIMAL]) {
  test.describe(`minimal footer on ${route}`, () => {
    test("1. the wordmark, the brand line and the © build year; nothing else", async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
      const info = footer(page);
      await expect(
        info.getByRole("img", { name: "Starflames", exact: true }),
      ).toBeVisible();
      await expect(info).toContainText(BRAND_LINE);
      await expect(info).toContainText(`© ${buildYear()} Starflames`);
      await expect(info.getByRole("link")).toHaveCount(0);
      await expect(info.getByRole("navigation")).toHaveCount(0);
      await expect(info.getByRole("heading")).toHaveCount(0);
      await expect(info.getByRole("list")).toHaveCount(0);
      await expect(info.locator("a, button, input, [tabindex]")).toHaveCount(0);
    });

    test("2–3. bg-sunken above the starfield; the bottom padding and the height", async ({
      page,
    }, testInfo) => {
      await page.goto(route);
      const box = await page.locator("body > footer").evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          background: s.backgroundColor,
          layer: `${s.position} ${s.zIndex}`,
          top: parseFloat(s.paddingTop),
          bottom: parseFloat(s.paddingBottom),
          height: el.getBoundingClientRect().height,
        };
      });
      expect(box.background).toBe("rgb(7, 9, 20)");
      expect(box.layer).toBe("relative 1");
      expect(box.top).toBe(desktop(testInfo) ? 96 : 48);
      expect(box.bottom).toBeGreaterThanOrEqual(desktop(testInfo) ? 40 : 32);
      // footer.md §4.2: 251px at 390, 334–335 at 1440 (no inset in emulation).
      testInfo.annotations.push({
        type: "footer height",
        description: String(box.height),
      });
      if (desktop(testInfo)) {
        expect(Math.abs(box.height - 334.5)).toBeLessThanOrEqual(1);
      } else {
        expect(box.height).toBe(251);
      }
    });

    test("15. the wordmark, brand line and © line are centred", async ({
      page,
    }) => {
      await page.goto(route);
      const offsets = await page.evaluate(() => {
        const container = document.querySelector("body > footer > div")!;
        const s = getComputedStyle(container);
        const box = container.getBoundingClientRect();
        const centre =
          box.left +
          parseFloat(s.paddingLeft) +
          (box.width - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight)) /
            2;
        return [
          'svg[role="img"]',
          "p:first-of-type",
          "p:last-of-type",
          "[data-decorative]:not(svg)",
        ].map((selector) => {
          const r = container.querySelector(selector)!.getBoundingClientRect();
          return Math.abs(r.left + r.width / 2 - centre);
        });
      });
      for (const offset of offsets) expect(offset).toBeLessThanOrEqual(1);
    });
  });
}

test("the minimal footer has the same DOM on / and /dev/footer/minimal", async ({
  page,
}) => {
  const html: string[] = [];
  for (const route of ["/", MINIMAL]) {
    await page.goto(route);
    html.push(
      await page.locator("body > footer").evaluate((el) => el.outerHTML),
    );
  }
  expect(html[1]).toBe(html[0]);
});

test("5. no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const route of ["/", MINIMAL, FULL]) {
    await page.goto(route);
    const sideways = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(sideways, route).toBe(false);
  }
});

test("16. the footer causes no layout shift", async ({ page }, testInfo) => {
  for (const route of ["/", FULL]) {
    await page.goto(route);
    const fromFooter = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let count = 0;
          const el = document.querySelector("body > footer")!;
          new PerformanceObserver((entries) => {
            for (const entry of entries.getEntries() as (PerformanceEntry & {
              sources?: { node?: Node | null }[];
            })[]) {
              if (entry.sources?.some((s) => s.node && el.contains(s.node)))
                count += 1;
            }
          }).observe({ type: "layout-shift", buffered: true });
          setTimeout(() => resolve(count), 300);
        }),
    );
    expect(fromFooter, route).toBe(0);
    const cls = await layoutShift(page);
    testInfo.annotations.push({
      type: `CLS ${route}`,
      description: cls.toFixed(4),
    });
    expect(cls).toBeLessThan(0.05);
  }
});

// ── 4. No JavaScript: every drawer-only link is in the footer ───────────────

test.describe("without JavaScript", () => {
  // With scripts off, Chromium blocks the preloaded chunks ("csp").
  test.use({
    javaScriptEnabled: false,
    expectedIssues: [/\/_next\/static\/chunks\/[^ ]+\.js \(csp\)$/],
  });

  /**
   * The expected links come from the registry helpers, never a hard-coded list:
   * every live drawer-only entry (headerPrimary, headerMore), and the account
   * slot that footerGroup("help") picks. The footer never holds both account links.
   */
  async function drawerOnlyLinksInFooter(
    page: Page,
    options: RegistryOptions,
  ): Promise<number> {
    const slotEntry =
      footerGroup("help", options).find(
        (entry) => entry.key === "account" || entry.key === "sign-in",
      ) ?? null;
    const expected = [
      ...headerPrimary(options),
      ...headerMore(options),
      ...(slotEntry ? [slotEntry] : []),
    ];
    for (const entry of expected) {
      const link = footer(page).getByRole("link", {
        name: entry.label,
        exact: true,
      });
      await expect(link, entry.key).toBeVisible();
      await expect(link, entry.key).toHaveAttribute("href", entry.href);
    }
    const accountLinks = await footer(page)
      .locator('a[href="/account"], a[href="/sign-in"]')
      .count();
    expect(accountLinks).toBeLessThanOrEqual(1);
    return expected.length;
  }

  test("4. public pages: every live drawer-only key is a footer link", async ({
    page,
  }, testInfo) => {
    test.skip(desktop(testInfo), "390 only");
    await page.goto("/");
    await expect(footer(page)).toBeVisible();
    await expect(
      footer(page).getByRole("img", { name: "Starflames", exact: true }),
    ).toBeVisible();
    // M1.17: no route is live, so the set is empty (it grows as routes go live).
    expect(await drawerOnlyLinksInFooter(page, {})).toBe(0);
  });

  test("4. /dev/footer: with every route live, the same check finds all eight", async ({
    page,
  }, testInfo) => {
    test.skip(desktop(testInfo), "390 only");
    await page.goto(FULL);
    expect(await drawerOnlyLinksInFooter(page, { preview: true })).toBe(8);
    await expect(
      footer(page).getByRole("link", { name: "Your account", exact: true }),
    ).toHaveAttribute("href", "/account");
  });
});

// ── /dev/footer: the full footer ────────────────────────────────────────────

test("6. the Footer nav: three groups in order, the registry labels", async ({
  page,
}) => {
  await openFull(page);
  const nav = footer(page).getByRole("navigation", {
    name: "Footer",
    exact: true,
  });
  await expect(nav.locator("h2")).toHaveText([
    "Explore",
    "Our collections",
    "Help",
  ]);
  await expect(footer(page).locator("h1")).toHaveCount(0);
  await expect(list(page, "Explore").getByRole("link")).toHaveText(EXPLORE);
  await expect(list(page, "Our collections").getByRole("link")).toHaveText(
    COLLECTIONS,
  );
  await expect(
    footer(page).getByRole("link", { name: "Gift Sets", exact: true }),
  ).toHaveCount(0);
  await expect(list(page, "Help").getByRole("link")).toHaveText(HELP);
  await expect(
    list(page, "Help").getByRole("link", { name: "Your account" }),
  ).toHaveAttribute("href", "/account");
});

test("7. Legal nav, social links in white in every state", async ({ page }) => {
  await openFull(page);
  await expect(
    footer(page)
      .getByRole("navigation", { name: "Legal", exact: true })
      .getByRole("link"),
  ).toHaveText(LEGAL);
  const social = list(page, "Starflames on social media").getByRole("link");
  await expect(social).toHaveCount(2);
  for (const [i, name] of SOCIAL.entries()) {
    const link = social.nth(i);
    await expect(link).toHaveAccessibleName(name);
    expect(await link.getAttribute("target")).toBeNull();
    await expect(link).toHaveAttribute("rel", "me");
    const fills = async () =>
      link
        .locator("svg")
        .evaluate((svg) => [
          getComputedStyle(svg).fill,
          getComputedStyle(svg.querySelector("path")!).fill,
        ]);
    expect(await fills(), `${name} at rest`).toEqual([
      "rgb(255, 255, 255)",
      "rgb(255, 255, 255)",
    ]);
    await link.focus();
    expect(await fills(), `${name} focused`).toEqual([
      "rgb(255, 255, 255)",
      "rgb(255, 255, 255)",
    ]);
    await link.hover();
    // Hover styles apply only where hover exists (Tailwind's `hover:` is
    // @media (hover: hover)), so the touch-emulated 390 project has no outline.
    const canHover = await page.evaluate(
      () => matchMedia("(hover: hover)").matches,
    );
    await expect
      .poll(() => link.evaluate((el) => getComputedStyle(el).borderTopColor))
      .toBe(canHover ? "rgb(232, 207, 150)" : "rgba(0, 0, 0, 0)");
    expect(await fills(), `${name} hovered`).toEqual([
      "rgb(255, 255, 255)",
      "rgb(255, 255, 255)",
    ]);
  }
});

test("8. every footer link is at least 44 × 44", async ({ page }) => {
  await openFull(page);
  const boxes = await footer(page)
    .locator("a")
    .evaluateAll((links) =>
      links.map((link) => {
        const r = link.getBoundingClientRect();
        return {
          name: link.getAttribute("aria-label") ?? link.textContent ?? "",
          width: r.width,
          height: r.height,
        };
      }),
    );
  expect(boxes.length).toBe(2 + 5 + 5 + 4 + 2);
  for (const { name, width, height } of boxes) {
    expect(width, name).toBeGreaterThanOrEqual(44);
    expect(height, name).toBeGreaterThanOrEqual(44);
  }
});

test("9. keyboard order and the focus ring", async ({ page }) => {
  await openFull(page);
  const links = footer(page).locator("a");
  for (let i = 0; i < (await links.count()); i += 1) {
    expect(await hasVisibleFocus(links.nth(i)), `link ${i}`).toBe(true);
  }
  // From the last control in main, Tab runs through the footer (footer.md §8.3).
  await page.getByLabel("Show the reserved newsletter space").focus();
  const expected = [...SOCIAL, ...EXPLORE, ...COLLECTIONS, ...HELP, ...LEGAL];
  const order = await tabOrder(page, expected.length + 2);
  expect(order.slice(0, expected.length)).toEqual(
    expected.map((label) => `a:${label}`),
  );
});

test("10. current page, the slot outline, body order", async ({ page }) => {
  await openFull(page);
  const current = page.getByLabel("Current page");
  const link = (name: string) =>
    footer(page).getByRole("link", { name, exact: true });
  const bodyChildren = () =>
    page.evaluate(() =>
      ["main", "footer"].map(
        (tag) => document.querySelector(tag)!.parentElement!.tagName,
      ),
    );

  await current.selectOption({ label: "Moonlit Terrace" });
  await expect(link("Moonlit Terrace")).toHaveAttribute("aria-current", "page");
  await expect(link("Collections")).not.toHaveAttribute("aria-current");
  await expect(footer(page).locator('[aria-current="page"]')).toHaveCount(1);
  const line = await link("Moonlit Terrace").evaluate(async (el) => {
    // The colours change over --duration-fast: read the settled values.
    await Promise.all(el.getAnimations().map((a) => a.finished));
    const s = getComputedStyle(el);
    return {
      line: s.textDecorationLine,
      thickness: s.textDecorationThickness,
      color: s.textDecorationColor,
      offset: parseFloat(s.textUnderlineOffset) / parseFloat(s.fontSize),
    };
  });
  expect(line).toMatchObject({
    line: "underline",
    thickness: "2px",
    color: "rgb(232, 207, 150)",
  });
  expect(line.offset).toBeCloseTo(0.4, 2);

  await current.selectOption({ label: "FAQ" });
  await expect(link("FAQ")).toHaveAttribute("aria-current", "page");
  await expect(footer(page).locator('[aria-current="page"]')).toHaveCount(1);
  await current.selectOption({ label: "None" });
  await expect(footer(page).locator('[aria-current="page"]')).toHaveCount(0);

  const toggle = page.getByLabel("Show the reserved newsletter space");
  await expect(slot(page)).toHaveAttribute("hidden", "");
  await expect(slot(page)).toBeHidden();
  await toggle.check();
  await expect(slot(page)).not.toHaveAttribute("hidden");
  await expect(slot(page)).toBeVisible();
  await expect(slot(page)).toContainText(
    "Reserved for the newsletter signup (M2.6, M2.7)",
  );
  // §2.4: the M2.6 budget, 20rem at base, 12rem from md.
  const width = page.viewportSize()?.width ?? 0;
  expect(
    (await slot(page).locator("> div").first().boundingBox())!.height,
  ).toBe(width >= 768 ? 192 : 320);
  expect(await bodyChildren()).toEqual(["BODY", "BODY"]);
  await toggle.uncheck();
  await expect(slot(page)).toBeHidden();
  expect(await bodyChildren()).toEqual(["BODY", "BODY"]);
});

test("11. group layout: one row at 1440, two rows at 390", async ({
  page,
}, testInfo) => {
  await openFull(page);
  const tops = await footer(page)
    .locator("nav h2")
    .evaluateAll((headings) =>
      headings.map((h) => h.getBoundingClientRect().top),
    );
  expect(tops).toHaveLength(3);
  const [explore, collections, help] = tops as [number, number, number];
  expect(collections).toBe(explore);
  if (desktop(testInfo)) {
    expect(help).toBe(explore);
    // The wordmark's top aligns with the headings (§4.4).
    const mark = (await footer(page)
      .getByRole("img", { name: "Starflames", exact: true })
      .boundingBox())!;
    expect(mark.y).toBeCloseTo(explore, 0);
  } else {
    expect(help).toBeGreaterThan(explore);
  }
});

test("12. the groups survive the text-spacing override", async ({ page }) => {
  await openFull(page);
  await page.addStyleTag({
    content:
      "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
  });
  const overflowing = await page.evaluate(() =>
    [
      ...document.querySelectorAll(
        "body > footer [data-group], body > footer nav, body > footer ul",
      ),
    ]
      .filter((el) => el.scrollWidth > el.clientWidth)
      .map((el) => el.getAttribute("data-group") ?? el.tagName),
  );
  expect(overflowing).toEqual([]);
});

test("13. print: the navs, socials and slot are hidden", async ({ page }) => {
  await openFull(page);
  await page.getByLabel("Show the reserved newsletter space").check();
  await expect(slot(page)).toBeVisible();
  await page.emulateMedia({ media: "print" });
  for (const hidden of [
    footer(page).getByRole("navigation", { name: "Footer", exact: true }),
    footer(page).getByRole("navigation", { name: "Legal", exact: true }),
    list(page, "Starflames on social media"),
    slot(page),
  ]) {
    await expect(hidden).toBeHidden();
  }
  await expect(
    footer(page).getByRole("img", { name: "Starflames", exact: true }),
  ).toBeVisible();
  await expect(
    footer(page).getByText(`© ${buildYear()} Starflames`),
  ).toBeVisible();
  await expect(footer(page).getByText(BRAND_LINE)).toBeVisible();
});

test("14. forced colors: no motifs, visible social borders", async ({
  page,
}, testInfo) => {
  await openFull(page);
  await page.emulateMedia({ forcedColors: "active" });
  const result = await page.evaluate(() => {
    const el = document.querySelector("body > footer")!;
    const decorative = [...el.querySelectorAll("[data-decorative]")].map(
      (d) => getComputedStyle(d).display,
    );
    const borders = [
      ...el.querySelectorAll('ul[aria-label="Starflames on social media"] a'),
    ].map((a) => {
      const s = getComputedStyle(a);
      return `${s.borderTopStyle} ${s.borderTopWidth} ${s.borderTopColor === "rgba(0, 0, 0, 0)" ? "transparent" : "visible"}`;
    });
    const fill = getComputedStyle(
      el.querySelector('ul[aria-label="Starflames on social media"] svg')!,
    ).fill;
    const color = getComputedStyle(
      el.querySelector('ul[aria-label="Starflames on social media"] a')!,
    ).color;
    return { decorative, borders, fill, color };
  });
  // The crescent, the starlight rule and the (hidden) slot's rule.
  expect(result.decorative).toEqual(["none", "none", "none"]);
  expect(result.borders).toEqual(["solid 1px visible", "solid 1px visible"]);
  // §7.3: the glyph follows the system colour (currentColor), not the white.
  expect(result.fill).toBe(result.color);
  testInfo.annotations.push({
    type: "forced colors",
    description: JSON.stringify(result),
  });
});
