import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { buildYear } from "./support/build";
import { layoutShift } from "./support/layout-shift";

// The layout shell (design/components/layout-shell.md, M1.13).

const MISSING = "/this-page-does-not-exist";

/** --header-h at this project's width: 64px at 390, 80px at 1440 (§4.1). */
function headerHeight(page: Page): number {
  return (page.viewportSize()?.width ?? 0) >= 1440 ? 80 : 64;
}

/** True if the document scrolls sideways. */
async function scrollsSideways(page: Page): Promise<boolean> {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
}

test("the skip link is the first tab stop and moves focus to main", async ({
  page,
}) => {
  await page.goto("/");
  const skip = page.getByRole("link", { name: "Skip to content" });
  // Visually hidden at rest (clipped to 1px), but in the tab order.
  expect((await skip.boundingBox())!.width).toBeLessThanOrEqual(1);
  await page.keyboard.press("Tab");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  expect(await skip.evaluate((el) => getComputedStyle(el).position)).toBe(
    "fixed",
  );
  const box = await skip.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  // Above the header, and immediately in the ring colour.
  const ring = await skip.evaluate((el) => {
    const style = getComputedStyle(el);
    return `${style.outlineStyle} ${style.outlineColor} ${style.zIndex}`;
  });
  expect(ring).toBe("solid rgb(232, 207, 150) 70");

  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
  const [mainTop, headerBottom] = await page.evaluate(() => [
    document.querySelector("main")!.getBoundingClientRect().top,
    document.querySelector("body > header")!.getBoundingClientRect().bottom,
  ]);
  expect(mainTop).toBeGreaterThanOrEqual(headerBottom - 0.5);
  // main shows no ring of its own (§3.3).
  expect(
    await page
      .locator("main")
      .evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("none");
});

test("in-page anchors land below the sticky header", async ({ page }) => {
  await page.goto("/");
  const offset = await page.evaluate(
    () => getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  expect(offset).toBe(`${headerHeight(page)}px`);
  // A tall page with a target far down: after the jump the header is stuck at
  // the top and the target starts at its bottom edge, not under it.
  await page.evaluate(() => {
    const main = document.querySelector("main")!;
    main.insertAdjacentHTML(
      "beforeend",
      '<div style="height:3000px"></div><p id="probe" tabindex="-1">Probe</p><div style="height:3000px"></div>',
    );
    location.hash = "#probe";
  });
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(1000);
  const [targetTop, headerTop, headerBottom] = await page.evaluate(() => {
    const header = document.querySelector("body > header")!;
    return [
      document.getElementById("probe")!.getBoundingClientRect().top,
      header.getBoundingClientRect().top,
      header.getBoundingClientRect().bottom,
    ];
  });
  expect(headerTop).toBe(0);
  expect(targetTop).toBeCloseTo(headerBottom, 0);
});

test("one banner, one main, one contentinfo and one h1, in body order", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toHaveCount(1);
  // The header renders no headings; the wordmark is a named image in a home link.
  await expect(page.locator("header :is(h1,h2,h3,h4,h5,h6)")).toHaveCount(0);
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Starflames" }),
  ).toHaveAttribute("href", "/");
  await expect(page.getByRole("contentinfo")).toContainText(
    `© ${buildYear()} Starflames`,
  );
  const order = await page.evaluate(() =>
    [...document.body.children]
      .filter(
        (el) =>
          !["SCRIPT", "TEMPLATE", "NEXT-ROUTE-ANNOUNCER"].includes(
            el.tagName,
          ) && !el.hasAttribute("hidden"),
      )
      .map((el) =>
        el.matches("[data-starfield]")
          ? "starfield"
          : el.matches(".skip-link")
            ? "skip"
            : el.tagName.toLowerCase(),
      ),
  );
  expect(order).toEqual([
    "skip",
    "svg",
    "starfield",
    "header",
    "main",
    "footer",
  ]);
  // Every nav has a unique name (none exist yet; M1.15 and M1.17 add them).
  const names = await page
    .getByRole("navigation")
    .evaluateAll((navs) => navs.map((nav) => nav.getAttribute("aria-label")));
  expect(names.every(Boolean)).toBe(true);
  expect(new Set(names).size).toBe(names.length);
});

test("the header reserves its height and causes no layout shift", async ({
  page,
}, testInfo) => {
  await page.route("**/*.woff2", async (fontRoute) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await fontRoute.continue();
  });
  await page.goto("/");
  const header = page.locator("body > header");
  const style = await header.evaluate((el) => {
    const s = getComputedStyle(el);
    return `${s.position} ${s.top} ${s.zIndex}`;
  });
  expect(style).toBe("sticky 0px 30");
  expect((await header.boundingBox())!.height).toBe(headerHeight(page));
  const cls = await layoutShift(page);
  testInfo.annotations.push({ type: "CLS", description: cls.toFixed(4) });
  expect(cls).toBeLessThan(0.05);
  expect((await header.boundingBox())!.height).toBe(headerHeight(page));
});

test("the starfield slot is fixed, hidden, not focusable and behind content", async ({
  page,
}) => {
  await page.goto("/");
  const slot = page.locator("[data-starfield]");
  await expect(slot).toHaveAttribute("aria-hidden", "true");
  await expect(slot).toHaveAttribute("data-decorative", "");
  const info = await slot.evaluate((el) => {
    const s = getComputedStyle(el);
    return {
      css: `${s.position} ${s.top} ${s.zIndex} ${s.pointerEvents}`,
      height: el.getBoundingClientRect().height,
      // The static sky since M1.19 (starfield.md), never anything focusable.
      sky: el.querySelectorAll(":scope > [data-sf-sky]").length,
      focusable: el.querySelectorAll(
        "a, button, input, select, textarea, [tabindex]",
      ).length,
    };
  });
  expect(info.css).toBe("fixed 0px 0 none");
  expect(info.height).toBe(page.viewportSize()!.height); // 100lvh
  expect(info.sky).toBe(1);
  expect(info.focusable).toBe(0);
  for (const selector of ["main", "body > footer"]) {
    const layer = await page
      .locator(selector)
      .evaluate(
        (el) =>
          `${getComputedStyle(el).position} ${getComputedStyle(el).zIndex}`,
      );
    expect(layer, selector).toBe("relative 1");
  }
});

test("adjacent bands on the same background share one --section-y", async ({
  page,
}) => {
  await page.goto("/");
  // In a wrapper of their own, so the page's own bands (the home hero) don't
  // take part. "solid+flush" is a band with data-flush-end (a hero ending in
  // its image, layout-shell.md §5.1 as amended in M2.1).
  const bands = [
    "plain",
    "solid",
    "sunken",
    "sunken",
    "haze",
    "solid",
    "solid+flush",
    "plain",
    "plain",
    "solid+flush",
  ];
  const pads = await page.evaluate((list) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = list
      .map((band) => {
        const [name, flush] = band.split("+");
        return `<section data-band="${name}"${flush ? " data-flush-end" : ""}><p>x</p></section>`;
      })
      .join("");
    document.querySelector("main")!.append(wrapper);
    return [...wrapper.children].map((el) => {
      const style = getComputedStyle(el);
      return `${style.paddingTop} ${style.paddingBottom}`;
    });
  }, bands);
  const y = (page.viewportSize()?.width ?? 0) >= 1440 ? "128px" : "64px";
  // plain and solid collapse (both bg-page), sunken keeps its padding, sunken
  // after sunken collapses, haze and the solid after it keep theirs; a solid
  // after a solid collapses even when it is flush-ending; the plain after a
  // flush-ending band keeps its top (the first band already ends at 0); a
  // flush-ending band has no bottom padding, unless it is the last band.
  expect(pads).toEqual([
    `${y} ${y}`,
    `0px ${y}`,
    `${y} ${y}`,
    `0px ${y}`,
    `${y} ${y}`,
    `${y} ${y}`,
    "0px 0px",
    `${y} ${y}`,
    `0px ${y}`,
    `0px ${y}`,
  ]);
});

test.describe("not found", () => {
  test.use({ expectedIssues: [/this-page-does-not-exist/] });

  // The 404 page is the shell's short page (home is taller than a screen since
  // the M2.2 hero).
  test("a short page keeps the footer at the bottom of the screen", async ({
    page,
  }) => {
    await page.goto(MISSING);
    const [footerBottom, viewport] = await page.evaluate(() => [
      document.querySelector("body > footer")!.getBoundingClientRect().bottom,
      window.innerHeight,
    ]);
    expect(footerBottom).toBeCloseTo(viewport, 0);
  });

  test("an unknown URL is a 404 inside the shell", async ({ page }) => {
    const response = await page.goto(MISSING);
    expect(response?.status()).toBe(404);
    await expect(page).toHaveTitle("Page not found · Starflames");
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText("We can't find that page");
    await expect(
      page.getByRole("main").getByRole("link", { name: "Go to the home page" }),
    ).toHaveAttribute("href", "/");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
  });

  // The prose wrapper is --container-prose (680px), not a font-relative 65ch:
  // the same width with the web fonts blocked and loaded, so nothing shifts
  // sideways when they swap in (§4.2).
  for (const fonts of ["blocked", "loaded"] as const) {
    test.describe(`fonts ${fonts}`, () => {
      // One pattern: a two-element array would read as Playwright's
      // [value, options] fixture tuple. Blocked fonts log failed requests.
      test.use({
        expectedIssues: [
          fonts === "blocked"
            ? /this-page-does-not-exist|\.woff2\b/
            : /this-page-does-not-exist/,
        ],
      });

      test(`the 404 prose wrapper is 680px wide at 1440 (fonts ${fonts})`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        if (fonts === "blocked") {
          await page.route("**/*.woff2", (fontRoute) => fontRoute.abort());
        }
        await page.goto(MISSING);
        const measured = await page.evaluate(async () => {
          await document.fonts.ready;
          // Web fonts only: next/font's metric-matched "… Fallback" faces are
          // local() fonts and load even when every woff2 is blocked.
          const loaded = [...document.fonts].filter(
            (face) =>
              face.status === "loaded" && !face.family.includes("Fallback"),
          ).length;
          const wrapper = document.querySelector("main h1")!.parentElement!;
          return {
            viewport: window.innerWidth,
            loaded,
            width: wrapper.getBoundingClientRect().width,
          };
        });
        expect(measured.viewport).toBe(1440);
        if (fonts === "blocked") expect(measured.loaded).toBe(0);
        else expect(measured.loaded).toBeGreaterThan(0);
        expect(measured.width).toBe(680);
      });
    });
  }
});

for (const route of ["/", MISSING]) {
  test.describe(`reflow on ${route}`, () => {
    test.use({ expectedIssues: [/this-page-does-not-exist/] });

    test("no horizontal scroll at 320px", async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(route);
      expect(await scrollsSideways(page)).toBe(false);
    });

    // 400% zoom of a 1280x1024 window is a 320x256 CSS px viewport (WCAG 1.4.10).
    test("400% zoom: base layout, header not sticky, no offset", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 320, height: 256 });
      await page.goto(route);
      expect(await scrollsSideways(page)).toBe(false);
      const state = await page.evaluate(() => [
        getComputedStyle(document.querySelector("body > header")!).position,
        getComputedStyle(document.documentElement).scrollPaddingTop,
      ]);
      expect(state).toEqual(["relative", "0px"]);
    });
  });
}

test("print hides decorative layers and flattens the frame", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ media: "print" });
  const printed = await page.evaluate(() => {
    const css = (selector: string) =>
      getComputedStyle(document.querySelector(selector)!);
    return {
      starfield: css("[data-starfield]").display,
      skip: css(".skip-link").display,
      header: css("body > header").position,
      body: `${css("body").display} ${css("body").minHeight}`,
      text: css("h1").color,
      background: css("body > footer").backgroundColor,
      main: css("main").zIndex,
    };
  });
  expect(printed).toEqual({
    starfield: "none",
    skip: "none",
    header: "static",
    body: "block 0px",
    text: "rgb(0, 0, 0)",
    background: "rgba(0, 0, 0, 0)",
    main: "auto",
  });
});

test("forced colors: the header sits on Canvas, decoration is gone", async ({
  page,
}) => {
  await page.goto("/");
  await page.emulateMedia({ forcedColors: "active" });
  const [header, canvas, starfield] = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "Canvas";
    document.body.append(probe);
    const result = [
      getComputedStyle(document.querySelector("body > header")!)
        .backgroundColor,
      getComputedStyle(probe).backgroundColor,
      getComputedStyle(document.querySelector("[data-starfield]")!).display,
    ];
    probe.remove();
    return result;
  });
  expect(header).toBe(canvas);
  expect(header).not.toBe("rgba(0, 0, 0, 0)");
  expect(starfield).toBe("none");
});

test("the viewport allows zoom and covers the notch", async ({ page }) => {
  await page.goto("/");
  const viewport = await page
    .locator('meta[name="viewport"]')
    .getAttribute("content");
  expect(viewport).toContain("viewport-fit=cover");
  expect(viewport).not.toMatch(/maximum-scale|user-scalable/);
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute(
    "content",
    "#0b0f24",
  );
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute(
    "content",
    "dark",
  );
});

test("/dev/tokens stays outside the shell and keeps the skip link working", async ({
  page,
}) => {
  await page.goto("/dev/tokens");
  await expect(page.getByRole("banner")).toHaveCount(0);
  await expect(page.locator("[data-starfield]")).toHaveCount(0);
  await expect(page.getByRole("main")).toHaveCount(1);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});
