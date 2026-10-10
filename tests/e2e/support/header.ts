import type { Page, TestInfo } from "@playwright/test";

import { expect } from "../fixtures";

// Shared by header.spec.ts and header-scrollbar.spec.ts (header.md §13.5).

export const PREVIEW = "/dev/header";

export const desktop = (testInfo: TestInfo): boolean =>
  testInfo.project.name.startsWith("desktop");

export const bagLink = (page: Page) =>
  page.getByRole("banner").getByRole("link", { name: /^Bag\b/ });
export const menuButton = (page: Page) =>
  page.getByRole("button", { name: "Menu", exact: true });
export const closeButton = (page: Page) =>
  page.getByRole("button", { name: "Close menu" });
export const drawer = (page: Page) => page.locator("dialog#site-menu");

/** Loads /dev/header and waits for hydration: "Bag" in the server HTML, "Bag, empty" after. */
export async function openPreview(page: Page): Promise<void> {
  await page.goto(PREVIEW);
  await expect(bagLink(page)).toHaveAccessibleName("Bag, empty");
}

/** Opens the drawer and waits for its slide-in (or fade) to finish. */
export async function openDrawer(page: Page): Promise<void> {
  await menuButton(page).click();
  await expect(drawer(page)).toHaveAttribute("open", "");
  await drawer(page).evaluate((el) =>
    Promise.all(el.getAnimations().map((animation) => animation.finished)),
  );
}
