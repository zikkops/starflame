import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";
import { captureRoute, routeSlug } from "./support/screenshot";

// Add each new page here. Tagged @motion, so the reduced-motion projects shoot it too.
const ROUTES = [
  "/",
  "/dev/tokens",
  "/dev/header",
  "/dev/footer",
  "/dev/footer/minimal",
];

for (const route of ROUTES) {
  test(
    `screenshot ${routeSlug(route)}`,
    { tag: "@motion" },
    async ({ page }, testInfo) => {
      await page.goto(route);
      const reduce = await page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
      expect(reduce).toBe(testInfo.project.name.endsWith("-reduced-motion"));
      await captureRoute(page, route, testInfo);
    },
  );
}

// The not-found page inside the shell: saved as 404-<project>.png.
test.describe(() => {
  test.use({ expectedIssues: [/this-page-does-not-exist/] });
  test("screenshot 404", { tag: "@motion" }, async ({ page }, testInfo) => {
    const route = "/this-page-does-not-exist";
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
    await captureRoute(page, route, testInfo, { name: "404" });
  });
});

// The /dev/header gate shots (header.md §3.4): each from a fresh load, after
// hydration ("Bag" in the server HTML, "Bag, empty" once hydrated).
const HEADER = "/dev/header";

async function openHeaderPreview(page: Page): Promise<void> {
  await page.goto(HEADER);
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Bag, empty" }),
  ).toBeVisible();
}

for (const [count, badge] of [
  ["3", "3"],
  ["120", "99+"],
] as const) {
  test(`screenshot dev-header-bag-${count}`, async ({ page }, testInfo) => {
    await openHeaderPreview(page);
    await page.getByLabel("Items in the bag").selectOption(count);
    await expect(
      page.getByRole("banner").getByRole("link", { name: /^Bag, / }),
    ).toHaveText(badge);
    await captureRoute(page, HEADER, testInfo, {
      name: `dev-header-bag-${count}`,
    });
  });
}

test("screenshot dev-header-menu-open", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "390 only");
  await openHeaderPreview(page);
  await page.getByRole("button", { name: "Menu" }).click();
  await expect(page.locator("dialog#site-menu[open]")).toBeVisible();
  await captureRoute(page, HEADER, testInfo, {
    name: "dev-header-menu-open",
    fullPage: false,
  });
});

test("screenshot dev-header-scrolled", async ({ page }, testInfo) => {
  await openHeaderPreview(page);
  await page.evaluate(() => window.scrollTo(0, 200));
  await expect(page.locator("body > header")).toHaveAttribute(
    "data-scrolled",
    "true",
  );
  await captureRoute(page, HEADER, testInfo, {
    name: "dev-header-scrolled",
    fullPage: false,
  });
});
