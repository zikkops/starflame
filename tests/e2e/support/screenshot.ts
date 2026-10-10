import { join } from "node:path";

import type { Page, TestInfo } from "@playwright/test";

import { heroSettled } from "./hero";

/** "/" -> "home", "/shop/gift-sets" -> "shop-gift-sets". */
export function routeSlug(route: string): string {
  const slug = route
    .replace(/[?#].*$/, "")
    .split("/")
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "_");
  return slug || "home";
}

export type CaptureOptions = {
  /** "css" (default): 390 or 1440 px wide. "device": DPR-sized. */
  scale?: "css" | "device";
  /** Replaces routeSlug(route) in the file name: <name>-<project>.png. */
  name?: string;
  /** Default true. false: only the viewport (e.g. an open menu). */
  fullPage?: boolean;
  /** Default "disabled" (CSS animations and transitions finish at once). */
  animations?: "disabled" | "allow";
};

/**
 * Saves a screenshot to <outputDir>/screenshots/<name>-<project>.png
 * (C:\Projects\starflame\test-results\screenshots\ in this repo) for QA to
 * compare against the spec; <name> is options.name, else routeSlug(route).
 * Waits for load, web fonts and the end of the CSS hero entrance (so that
 * `animations: "allow"` shots don't catch it mid-way; with the default
 * "disabled" it is fast-forwarded anyway), and hides the caret. A page without
 * a hero, or under reduced motion, doesn't wait at all. By default a full-page,
 * CSS-pixel shot with CSS animations and transitions frozen. Playwright clears
 * test-results/ at the start of every run.
 */
export async function captureRoute(
  page: Page,
  route: string,
  testInfo: TestInfo,
  options: CaptureOptions = {},
): Promise<string> {
  await page.waitForLoadState("load");
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await heroSettled(page);
  const file = join(
    testInfo.project.outputDir,
    "screenshots",
    `${options.name ?? routeSlug(route)}-${testInfo.project.name}.png`,
  );
  await page.screenshot({
    path: file,
    fullPage: options.fullPage ?? true,
    animations: options.animations ?? "disabled",
    caret: "hide",
    scale: options.scale ?? "css",
  });
  return file;
}
