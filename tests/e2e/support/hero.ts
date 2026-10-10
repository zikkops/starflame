import type { Page } from "@playwright/test";

/** The dev page with both hero CTAs and stand-in target sections (M2.2). */
export const HERO_PREVIEW = "/dev/hero";

/**
 * Resolves once the hero entrance is over (motion.md §5.1): every animation on
 * the `[data-hero-reveal]` elements has finished (the CSS `hero-reveal`
 * keyframes, at most 0.9 s from the hero's first paint), and each is at
 * opacity 1 with no transform. A readiness wait, not a budget. Pages without a
 * hero, and reduced motion (no animation declared), resolve at once.
 */
export async function heroSettled(page: Page, timeout = 10_000): Promise<void> {
  // Bounded, so a paused animation fails the check below instead of hanging.
  await page.evaluate(async (ms) => {
    const targets = [...document.querySelectorAll("[data-hero-reveal]")];
    await Promise.race([
      Promise.all(
        targets
          .flatMap((el) => el.getAnimations())
          .map((animation) => animation.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, ms)),
    ]);
  }, timeout);
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("[data-hero-reveal]")].every((el) => {
        const style = getComputedStyle(el);
        return style.opacity === "1" && style.transform === "none";
      }),
    undefined,
    { timeout },
  );
}
