import { expect, test } from "./fixtures";
import { desktop, drawer, openDrawer, openPreview } from "./support/header";

// header.md §13.5 check 19 (M1.15; QA build minor 2). Playwright launches
// Chromium with --hide-scrollbars, which hides classic scrollbars: the stable
// gutter is still reserved, but no scrollbar is ever painted or removed. This
// file's browser keeps them, so at 1000px a real 15px scrollbar is painted at
// rest and the menu's scroll lock removes it. launchOptions is worker-scoped and
// can only be set for a whole file, so check 19 lives here on its own.
test.use({ launchOptions: { ignoreDefaultArgs: ["--hide-scrollbars"] } });

test("19. at 1000px the scroll lock moves nothing; reaching lg closes the drawer", async ({
  page,
}, testInfo) => {
  test.skip(!desktop(testInfo), "desktop only (a classic scrollbar)");
  await page.setViewportSize({ width: 1000, height: 900 });
  await openPreview(page);
  const measure = () =>
    page.evaluate(() => {
      const right = (selector: string) =>
        document.querySelector(selector)?.getBoundingClientRect().right ?? null;
      return {
        // The body's width excludes the scrollbar gutter (stable, so it is
        // reserved with or without a scrollbar).
        gutter: window.innerWidth - document.body.getBoundingClientRect().width,
        // The viewport less a painted classic scrollbar: under the lock the
        // scrollbar goes, the gutter stays.
        client: document.documentElement.clientWidth,
        bar: document
          .querySelector("body > header > div")!
          .getBoundingClientRect().width,
        menu: right('button[aria-controls="site-menu"]'),
        close: right('#site-menu[open] button[aria-label="Close menu"]'),
      };
    });
  const before = await measure();
  expect(before.gutter, "a classic scrollbar's gutter").toBeGreaterThan(0);
  expect(before.client, "a painted scrollbar").toBe(1000 - before.gutter);
  await openDrawer(page);
  const open = await measure();
  expect(open.close).not.toBeNull();
  expect(open.client, "the lock removes the scrollbar").toBe(1000);
  expect({ ...open, close: null, client: null }).toEqual({
    ...before,
    close: null,
    client: null,
  });
  expect(open.close).toBe(open.menu);
  testInfo.annotations.push({
    type: "1000px",
    description: JSON.stringify({ before, open }),
  });
  await page.mouse.move(16, 400);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(300);
  expect(await measure()).toEqual(open);

  await page.setViewportSize({ width: 1100, height: 900 });
  await expect(drawer(page)).not.toHaveAttribute("open");
  await expect(page.locator("[data-home-link]")).toBeFocused();
  await expect(
    page.locator('button[aria-controls="site-menu"]'),
  ).toHaveAttribute("aria-expanded", "false");
});
