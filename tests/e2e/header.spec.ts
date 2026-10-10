import type { Page } from "@playwright/test";

import {
  headerAccount,
  headerBag,
  headerMore,
  headerPrimary,
} from "../../components/layout/site-routes";

import { expect, test } from "./fixtures";
import {
  bagLink,
  closeButton,
  desktop,
  drawer,
  menuButton,
  openDrawer,
  openPreview,
  PREVIEW,
} from "./support/header";
import { hasVisibleFocus, tabOrder } from "./support/keyboard";
import { layoutShift } from "./support/layout-shift";

// The site header (design/components/header.md §13.5, M1.15). Public routes show
// the wordmark only; /dev/header shows every item, driven by its own controls on
// one loaded page (never by URL).

const PRIMARY = ["Shop", "Collections", "Gift sets", "Our story"];
const BAR = "body > header > div"; // the bar inside the header
const BAR_NAV = `${BAR} > nav[aria-label="Primary"]`;

/** --header-h for the current viewport width (64 / 72 / 72 / 80px). */
const headerHeight = (page: Page): number => {
  const width = page.viewportSize()?.width ?? 0;
  return width >= 1440 ? 80 : width >= 768 ? 72 : 64;
};

const status = (page: Page) => page.getByRole("banner").getByRole("status");

/** Drawer link texts, in order, that are visible (the Search item is md:hidden from md). */
async function visibleDrawerLinks(page: Page): Promise<string[]> {
  return drawer(page)
    .locator("a")
    .evaluateAll((links) =>
      links
        .filter((link) => link.getClientRects().length > 0)
        .map((link) => (link.textContent ?? "").trim()),
    );
}

/**
 * Opens the drawer while nothing has focus, then closes it with Esc: focus must
 * come back to Menu. Chromium's own dialog focus restoration returns focus to
 * whatever was focused before the open (here <body>), so only MobileMenu's
 * explicit focus() passes this; a real click on Menu would hide its removal.
 */
async function programmaticOpenThenEscape(
  page: Page,
  open: () => Promise<unknown>,
): Promise<void> {
  await page.evaluate(() =>
    (document.activeElement as HTMLElement | null)?.blur(),
  );
  expect(
    await page.evaluate(() => document.activeElement === document.body),
  ).toBe(true);
  await open();
  await expect(drawer(page)).toHaveAttribute("open", "");
  await expect(menuButton(page)).toHaveAttribute("aria-expanded", "true");
  await expect(closeButton(page)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(drawer(page)).not.toHaveAttribute("open");
  await expect(menuButton(page)).toBeFocused();
  await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
}

// ── 1. Public routes (M1.15 state) ──────────────────────────────────────────

test("public pages: the header is the wordmark only", async ({ page }) => {
  // The registry state behind it: no header route is live yet.
  expect([
    headerPrimary(),
    headerMore(),
    headerAccount(false),
    headerAccount(true),
    headerBag(),
  ]).toEqual([[], [], null, null, null]);

  await page.goto("/");
  const banner = page.getByRole("banner");
  await expect(banner.getByRole("link")).toHaveCount(1);
  const home = banner.getByRole("link", { name: "Starflames" });
  await expect(home).toHaveAttribute("href", "/");
  await expect(banner.locator("nav")).toHaveCount(0);
  await expect(banner.locator("button")).toHaveCount(0);
  await expect(page.locator("#site-menu")).toHaveCount(0);
  await expect(banner.getByRole("status")).toHaveCount(0);
});

test("public pages: the scroll state runs and the surface fades in", async ({
  page,
}) => {
  await page.goto("/");
  const header = page.locator("body > header");
  // Hydrated first: the starfield island sets its state from an effect after
  // load + idle. Changing main before hydration makes React report a mismatch.
  await expect(page.locator("[data-starfield]")).toHaveAttribute(
    "data-starfield-state",
    /./,
  );
  await page.evaluate(() => {
    document
      .querySelector("main")!
      .insertAdjacentHTML("beforeend", '<div style="height:3000px"></div>');
  });
  await expect(header).not.toHaveAttribute("data-scrolled");
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveAttribute("data-scrolled");
});

// ── /dev/header: the full header ────────────────────────────────────────────

test("2. the bar's nav from lg, the menu button below it", async ({
  page,
}, testInfo) => {
  await openPreview(page);
  const nav = page.locator(BAR_NAV);
  if (desktop(testInfo)) {
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link")).toHaveText(PRIMARY);
    await expect(menuButton(page)).toBeHidden();
  } else {
    await expect(nav).toBeHidden();
    await expect(menuButton(page)).toBeVisible();
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
    await expect(menuButton(page)).toHaveAttribute(
      "aria-controls",
      "site-menu",
    );
    await expect(menuButton(page)).toHaveAttribute("aria-haspopup", "dialog");
  }
});

test("3. keyboard order matches §10.2", async ({ page }, testInfo) => {
  const skip = "a:Skip to content";
  const home = "a:"; // the wordmark link: its name comes from the SVG
  const drawerOrder = [
    "a:Shop",
    "a:Collections",
    "a:Gift sets",
    "a:Our story",
    "a:Search",
    "a:FAQ",
    "a:Contact us",
    "a:Sign in",
  ];
  await openPreview(page);
  if (desktop(testInfo)) {
    const expected = [
      skip,
      home,
      ...PRIMARY.map((label) => `a:${label}`),
      "a:Search",
      "a:Sign in",
      "a:Bag, empty",
    ];
    const order = await tabOrder(page);
    expect(order.slice(0, expected.length)).toEqual(expected);
    return;
  }
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await openPreview(page);
    const bar = [skip, home, ...(width === 768 ? ["a:Search"] : [])];
    const expected = [...bar, "a:Bag, empty", "button:Menu"];
    const order = await tabOrder(page);
    expect(order.slice(0, expected.length), `bar at ${width}`).toEqual(
      expected,
    );
    await openDrawer(page);
    await expect(closeButton(page)).toBeFocused();
    const inDrawer = drawerOrder.filter(
      (item) => width < 768 || item !== "a:Search",
    );
    // From "Close menu", Tab runs through the drawer and wraps (Chromium may
    // pass through the document itself between the last item and the first).
    const drawerTabs = await tabOrder(page, 20);
    expect(drawerTabs.slice(0, inDrawer.length), `drawer at ${width}`).toEqual(
      inDrawer,
    );
    expect(drawerTabs.slice(inDrawer.length)).toEqual(
      drawerTabs.length > inDrawer.length ? ["button:Close menu"] : [],
    );
    await page.keyboard.press("Escape");
  }
});

test("4. the drawer: open, contain focus, close three ways", async ({
  page,
}, testInfo) => {
  test.skip(desktop(testInfo), "below lg only");
  await openPreview(page);
  const ways = {
    Escape: () => page.keyboard.press("Escape"),
    "the close button": () => closeButton(page).click(),
    // The 48px strip of scrim at the start edge.
    "a scrim click": () => page.mouse.click(16, 400),
  };
  for (const [way, close] of Object.entries(ways)) {
    await openDrawer(page);
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "true");
    await expect(closeButton(page)).toBeFocused();
    // Tab never leaves the dialog for the inert page behind it.
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press("Tab");
      const where = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return "document";
        return document.querySelector("#site-menu")!.contains(el)
          ? "dialog"
          : "page";
      });
      expect(where, `Tab ${i + 1}`).not.toBe("page");
    }
    await close();
    await expect(drawer(page), way).not.toHaveAttribute("open");
    await expect(menuButton(page)).toBeFocused();
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
  }
  // A scripted click (it doesn't focus the button) runs the invoker command.
  await programmaticOpenThenEscape(page, () =>
    menuButton(page).evaluate((el) => (el as HTMLButtonElement).click()),
  );
});

test("4b. without invoker commands, showModal() opens and close() closes", async ({
  page,
}, testInfo) => {
  test.skip(desktop(testInfo), "below lg only");
  // A browser without invoker commands: the feature is gone before any page
  // script runs, and the attributes are stripped from the server HTML as it is
  // parsed (before hydration), so only the click handlers open and close.
  await page.addInitScript(() => {
    Reflect.deleteProperty(HTMLButtonElement.prototype, "commandForElement");
    Reflect.deleteProperty(HTMLButtonElement.prototype, "command");
    new MutationObserver(() => {
      for (const el of document.querySelectorAll("[commandfor], [command]")) {
        el.removeAttribute("commandfor");
        el.removeAttribute("command");
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await openPreview(page);
  expect(
    await page.evaluate(() => ({
      native: "commandForElement" in HTMLButtonElement.prototype,
      attributes: document.querySelectorAll("[commandfor], [command]").length,
    })),
  ).toEqual({ native: false, attributes: 0 });
  const ways = {
    "the close button": () => closeButton(page).click(),
    Escape: () => page.keyboard.press("Escape"),
  };
  for (const [way, close] of Object.entries(ways)) {
    await openDrawer(page);
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "true");
    await expect(closeButton(page)).toBeFocused();
    await close();
    await expect(drawer(page), way).not.toHaveAttribute("open");
    await expect(menuButton(page)).toBeFocused();
    await expect(menuButton(page)).toHaveAttribute("aria-expanded", "false");
  }
  // Opened by script, not by the button at all.
  await programmaticOpenThenEscape(page, () =>
    drawer(page).evaluate((el) => (el as HTMLDialogElement).showModal()),
  );
});

test("5. the open drawer locks the page scroll; the gutter is permanent", async ({
  page,
}, testInfo) => {
  test.skip(desktop(testInfo), "below lg only");
  await openPreview(page);
  const read = () =>
    page.evaluate(() => {
      const html = getComputedStyle(document.documentElement);
      return {
        overflow: html.overflow,
        gutter: html.scrollbarGutter,
        y: window.scrollY,
      };
    });
  expect(await read()).toEqual({ overflow: "visible", gutter: "stable", y: 0 });
  await openDrawer(page);
  await page.mouse.move(16, 400);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(300);
  expect(await read()).toEqual({ overflow: "hidden", gutter: "stable", y: 0 });
  await page.keyboard.press("Escape");
  await expect(drawer(page)).not.toHaveAttribute("open");
  expect((await read()).overflow).toBe("visible");
  await page.mouse.wheel(0, 800);
  await expect.poll(async () => (await read()).y).toBeGreaterThan(0);
  expect((await read()).gutter).toBe("stable");
});

test(
  "6. drawer motion: a slide, or a 150ms fade under reduced motion",
  { tag: "@motion" },
  async ({ page }, testInfo) => {
    test.skip(desktop(testInfo), "below lg only");
    await openPreview(page);
    const reduced = testInfo.project.name.endsWith("-reduced-motion");
    // Open and sample every frame for 500ms, in one evaluate.
    const samples = await page.evaluate(async () => {
      const dialog = document.querySelector<HTMLDialogElement>("#site-menu")!;
      document
        .querySelector<HTMLButtonElement>('button[aria-controls="site-menu"]')!
        .click();
      const seen: { transform: string; opacity: string; duration: string }[] =
        [];
      const start = performance.now();
      while (performance.now() - start < 500) {
        const style = getComputedStyle(dialog);
        seen.push({
          transform: style.transform,
          opacity: style.opacity,
          duration: style.transitionDuration,
        });
        await new Promise(requestAnimationFrame);
      }
      return seen;
    });
    expect(samples.length).toBeGreaterThan(5);
    const transforms = new Set(samples.map((s) => s.transform));
    const durations = new Set(samples.map((s) => s.duration));
    if (reduced) {
      expect([...transforms]).toEqual(["none"]);
      expect([...durations]).toEqual(["0.15s"]);
      // It fades instead.
      expect(Number(samples[0]!.opacity)).toBeLessThan(1);
    } else {
      expect(transforms.size).toBeGreaterThan(1); // it slides
      expect(samples.at(-1)!.transform).toBe("none");
      expect([...durations]).toEqual(["0.4s"]);
    }
    expect(samples.at(-1)!.opacity).toBe("1");
  },
);

test("7. bag: badge, name, cap and the polite live region", async ({
  page,
}) => {
  await openPreview(page);
  const select = page.getByLabel("Items in the bag");
  const badge = bagLink(page).locator("span[aria-hidden='true']");
  await expect(badge).toHaveCount(0);
  await expect(status(page)).toHaveAttribute("role", "status");
  // The first read is never announced.
  await page.waitForTimeout(600);
  await expect(status(page)).toHaveText("");

  const steps = [
    ["1", "1", "Bag, 1 item", "Your bag has 1 item"],
    ["120", "99+", "Bag, 120 items", "Your bag has 120 items"],
    ["0", null, "Bag, empty", "Your bag is empty"],
  ] as const;
  for (const [value, text, name, announced] of steps) {
    await select.selectOption(value);
    await expect(bagLink(page)).toHaveAccessibleName(name);
    if (text) await expect(badge).toHaveText(text);
    else await expect(badge).toHaveCount(0);
    await expect(status(page)).toHaveText(announced, { timeout: 1_000 });
  }

  // Coalescing, deterministic: both changes in one task, then 1.2s of watching.
  const texts = await page.evaluate(async () => {
    const region = document.querySelector('body > header [role="status"]')!;
    const select = [...document.querySelectorAll("label")]
      .find((label) => label.textContent?.startsWith("Items in the bag"))!
      .querySelector("select")!;
    const seen: string[] = [];
    const observer = new MutationObserver(() =>
      seen.push(region.textContent ?? ""),
    );
    observer.observe(region, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    for (const value of ["3", "99"]) {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    observer.disconnect();
    return seen;
  });
  expect(texts).toEqual(["Your bag has 99 items"]);
  await expect(badge).toHaveText("99");
});

test("8. current page and account, through the controls", async ({
  page,
}, testInfo) => {
  await openPreview(page);
  const current = page.getByLabel("Current page");
  const signedIn = page.getByLabel("Signed in");
  const scope = desktop(testInfo) ? page.locator(BAR_NAV) : drawer(page);
  const link = (name: string) => scope.getByRole("link", { name, exact: true });

  const check = async (path: string, expected: string | null) => {
    await current.selectOption(path);
    if (!desktop(testInfo)) await openDrawer(page);
    const marked = await scope
      .locator('[aria-current="page"]')
      .allTextContents();
    expect(marked, path).toEqual(expected ? [expected] : []);
    if (expected) {
      if (desktop(testInfo)) {
        expect(
          await link(expected).evaluate(
            (el) => getComputedStyle(el).textDecorationLine,
          ),
        ).toBe("underline");
      } else {
        await expect(link(expected).locator("svg")).toHaveCount(1); // the star
      }
    }
    if (!desktop(testInfo)) await page.keyboard.press("Escape");
  };
  await check("/collections/gift-sets", "Gift sets");
  await check("/collections/moonlit-terrace", "Collections");
  await check("", null);

  for (const [ticked, name, href] of [
    [true, "Your account", "/account"],
    [false, "Sign in", "/sign-in"],
  ] as const) {
    await signedIn.setChecked(ticked);
    if (desktop(testInfo)) {
      const account = page
        .getByRole("banner")
        .getByRole("link", { name, exact: true });
      await expect(account).toBeVisible();
      await expect(account).toHaveAttribute("href", href);
    } else {
      await openDrawer(page);
      const account = drawer(page).getByRole("link", { name, exact: true });
      await expect(account).toHaveText(name);
      await expect(account).toHaveAttribute("href", href);
      await page.keyboard.press("Escape");
    }
  }
});

test("9. at rest vs scrolled", async ({ page }) => {
  await openPreview(page);
  const header = page.locator("body > header");
  const surface = () =>
    header.evaluate((el) => getComputedStyle(el, "::before").opacity);
  await expect(header).not.toHaveAttribute("data-scrolled");
  expect(await surface()).toBe("0");
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(header).toHaveAttribute("data-scrolled", "true");
  await expect.poll(surface).toBe("1");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(header).not.toHaveAttribute("data-scrolled");
});

test("10. every header control is at least 44 × 44", async ({
  page,
}, testInfo) => {
  await openPreview(page);
  const sizes = async (selector: string) =>
    page.locator(selector).evaluateAll((els) =>
      els
        .filter((el) => el.getClientRects().length > 0)
        .map((el) => {
          const box = el.getBoundingClientRect();
          const name =
            el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
          return { name, width: box.width, height: box.height };
        }),
    );
  const bar = await sizes(`${BAR} :is(a, button)`);
  expect(bar.length).toBe(desktop(testInfo) ? 8 : 3);
  let all = bar;
  if (!desktop(testInfo)) {
    await openDrawer(page);
    all = [...bar, ...(await sizes("#site-menu :is(a, button)"))];
    expect(all.length).toBe(3 + 9);
  }
  for (const { name, width, height } of all) {
    expect(width, name).toBeGreaterThanOrEqual(44);
    expect(height, name).toBeGreaterThanOrEqual(44);
  }
});

test("11. the header keeps --header-h through hydration and never shifts", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const w = window as Window & { __headerHeights?: number[] };
    w.__headerHeights = [];
    const read = () =>
      w.__headerHeights!.push(
        document.querySelector("body > header")!.getBoundingClientRect().height,
      );
    document.addEventListener("DOMContentLoaded", read);
    window.addEventListener("load", read);
  });
  await openPreview(page);
  const heights = await page.evaluate(
    () => (window as Window & { __headerHeights?: number[] }).__headerHeights,
  );
  expect(heights).toEqual([headerHeight(page), headerHeight(page)]);
  expect((await page.locator("body > header").boundingBox())!.height).toBe(
    headerHeight(page),
  );
  const fromHeader = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let count = 0;
        const header = document.querySelector("body > header")!;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & {
            sources?: { node?: Node | null }[];
          })[]) {
            if (entry.sources?.some((s) => s.node && header.contains(s.node)))
              count += 1;
          }
        }).observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(count), 300);
      }),
  );
  expect(fromHeader).toBe(0);
  const cls = await layoutShift(page);
  testInfo.annotations.push({ type: "CLS", description: cls.toFixed(4) });
  expect(cls).toBeLessThan(0.05);
});

test("12. no horizontal scroll at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openPreview(page);
  const sideways = () =>
    page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
  expect(await sideways()).toBe(false);
  await openDrawer(page);
  expect(await sideways()).toBe(false);
  // The drawer leaves its 48px strip of scrim at the start edge: 272px wide
  // at 320 (less a classic scrollbar's gutter on desktop).
  const box = (await drawer(page).boundingBox())!;
  expect(box.x).toBe(48);
  expect(box.width).toBeLessThanOrEqual(272);
});

test("13. the bar survives the text-spacing override", async ({ page }) => {
  await openPreview(page);
  await page.addStyleTag({
    content:
      "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }",
  });
  const fit = await page.evaluate((selector) => {
    const bar = document.querySelector(selector)!;
    const box = bar.getBoundingClientRect();
    const out = [...bar.querySelectorAll("a, button, nav")]
      .filter((el) => el.getClientRects().length > 0)
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.top < box.top - 0.5 ||
          r.bottom > box.bottom + 0.5 ||
          r.left < box.left - 0.5 ||
          r.right > box.right + 0.5
        );
      })
      .map((el) => el.getAttribute("aria-label") ?? el.textContent);
    return {
      height: box.height,
      overflow: bar.scrollWidth > bar.clientWidth,
      out,
    };
  }, BAR);
  expect(fit).toEqual({
    height: headerHeight(page),
    overflow: false,
    out: [],
  });
});

test("14. forced colors: Canvas behind the header, a visible badge edge", async ({
  page,
}) => {
  await openPreview(page);
  await page.getByLabel("Items in the bag").selectOption("3");
  await page.emulateMedia({ forcedColors: "active" });
  const result = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = "Canvas";
    document.body.append(probe);
    const canvas = getComputedStyle(probe).backgroundColor;
    probe.remove();
    const badge = document.querySelector(
      'body > header a[aria-label^="Bag"] span[aria-hidden="true"]',
    )!;
    const style = getComputedStyle(badge);
    return {
      header:
        getComputedStyle(document.querySelector("body > header")!)
          .backgroundColor === canvas,
      border: `${style.borderTopStyle} ${style.borderTopWidth}`,
      transparent: style.borderTopColor === "rgba(0, 0, 0, 0)",
    };
  });
  expect(result).toEqual({
    header: true,
    border: "solid 1px",
    transparent: false,
  });
});

test("15. print: the wordmark only, a static header", async ({ page }) => {
  await openPreview(page);
  await page.emulateMedia({ media: "print" });
  const printed = await page.evaluate((nav) => {
    const display = (selector: string) =>
      getComputedStyle(document.querySelector(selector)!).display;
    return {
      header: getComputedStyle(document.querySelector("body > header")!)
        .position,
      nav: display(nav),
      utilities: display('body > header [data-print="hide"]:has(> a)'),
      menu: display('button[aria-controls="site-menu"]'),
      status: display('body > header [role="status"]'),
    };
  }, BAR_NAV);
  expect(printed).toEqual({
    header: "static",
    nav: "none",
    utilities: "none",
    menu: "none",
    status: "none",
  });
  await expect(
    page.getByRole("banner").getByRole("img", { name: "Starflames" }),
  ).toBeVisible();
});

test("16. every header control shows the focus ring", async ({
  page,
}, testInfo) => {
  await openPreview(page);
  const banner = page.getByRole("banner");
  const controls = desktop(testInfo)
    ? [
        banner.getByRole("link", { name: "Starflames" }),
        ...PRIMARY.map((name) =>
          page.locator(BAR_NAV).getByRole("link", { name }),
        ),
        banner.getByRole("link", { name: "Search" }),
        banner.getByRole("link", { name: "Sign in" }),
        bagLink(page),
      ]
    : [
        banner.getByRole("link", { name: "Starflames" }),
        bagLink(page),
        menuButton(page),
      ];
  for (const control of controls) {
    expect(await hasVisibleFocus(control)).toBe(true);
  }
  if (!desktop(testInfo)) {
    // Opened from the keyboard, so :focus-visible applies inside the drawer.
    await menuButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(drawer(page)).toHaveAttribute("open", "");
    expect(await hasVisibleFocus(closeButton(page))).toBe(true);
  }
});

test("17. drawer at md: no Search in More; the close button replaces Menu", async ({
  page,
}, testInfo) => {
  test.skip(desktop(testInfo), "below lg only (mobile viewport)");
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await openPreview(page);
    const menu = (await menuButton(page).boundingBox())!;
    await openDrawer(page);
    const links = await visibleDrawerLinks(page);
    expect(links.includes("Search"), `Search at ${width}`).toBe(width < 768);
    const close = (await closeButton(page).boundingBox())!;
    expect(
      Math.abs(close.x + close.width - (menu.x + menu.width)),
      `right edge at ${width}`,
    ).toBeLessThanOrEqual(1);
    await page.keyboard.press("Escape");
  }
});

test("18. header and main stay direct children of body", async ({ page }) => {
  await openPreview(page);
  await page.getByLabel("Items in the bag").selectOption("3");
  await page.getByLabel("Signed in").check();
  const parents = await page.evaluate(() =>
    ["header", "main"].map(
      (tag) => document.querySelector(tag)!.parentElement!.tagName,
    ),
  );
  expect(parents).toEqual(["BODY", "BODY"]);
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
});

// Check 19 runs in header-scrollbar.spec.ts (it needs its own browser launch).

test.describe("without JavaScript", () => {
  // With scripts off, Chromium blocks the preloaded chunks ("csp").
  test.use({
    javaScriptEnabled: false,
    expectedIssues: [/\/_next\/static\/chunks\/[^ ]+\.js \(csp\)$/],
  });

  test("the menu button is hidden and the surface stays on", async ({
    page,
  }) => {
    for (const route of [PREVIEW, "/"]) {
      await page.goto(route);
      const header = page.locator("body > header");
      expect(
        await header.evaluate((el) => getComputedStyle(el, "::before").opacity),
        route,
      ).toBe("1");
    }
    await page.goto(PREVIEW);
    await expect(menuButton(page)).toBeHidden();
    // The server HTML names the bag "Bag" (the count is never known without JS).
    await expect(bagLink(page)).toHaveAccessibleName("Bag");
    await expect(page.locator("dialog#site-menu")).toHaveCount(1);
  });
});
