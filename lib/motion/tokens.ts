// Motion tokens for JS (GSAP): design/system/motion.md §2–§4 and §7, and the
// reduced-motion remap in §6.3. They mirror the motion variables in app/globals.css
// (sections 2, 4 and 5); tests/e2e/tokens.spec.ts fails if the two drift apart.
// GSAP code imports these and never reads getComputedStyle: the CSS minifier
// rewrites the variables' values (150ms becomes .15s while 40ms stays 40ms).
// Units: durations and staggers in seconds (GSAP's unit), distances in px.

export const DURATION = {
  instant: 0,
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  slower: 0.7,
  glow: 5,
  twinkle: 4,
  fallingStar: 1.4,
  drift: 90,
} as const;

/** Cap a group's spread with `stagger: { amount: Math.min(STAGGER.maxTotal, (n - 1) * s) }` (motion.md §4). */
export const STAGGER = {
  tight: 0.04,
  base: 0.06,
  loose: 0.1,
  maxTotal: 0.4,
} as const;

export const DISTANCE = { sm: 8, md: 16, lg: 24 } as const;

export const SCALE = { hover: 1.03, press: 0.98 } as const;

/** GSAP ease names, canonical in JS (motion.md §3). */
export const EASE = {
  standard: "power2.out",
  enter: "power3.out",
  exit: "power2.in",
  inOut: "power2.inOut",
  ambient: "sine.inOut",
  linear: "none",
} as const;

/** The CSS twins of EASE (the --ease-* variables), e.g. for a WAAPI animation. */
export const EASE_CSS = {
  standard: "cubic-bezier(0.215, 0.61, 0.355, 1)",
  enter: "cubic-bezier(0.165, 0.84, 0.44, 1)",
  exit: "cubic-bezier(0.55, 0.055, 0.675, 0.19)",
  inOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
  ambient: "cubic-bezier(0.445, 0.05, 0.55, 0.95)",
  linear: "linear",
} as const satisfies Record<keyof typeof EASE, string>;

/**
 * The values that change under prefers-reduced-motion: reduce (motion.md §6.3),
 * for the `reduce` branch of gsap.matchMedia(). Everything else is unchanged;
 * ambient loops are not started at all.
 */
export const REDUCED = {
  duration: { base: 0.15, slow: 0.15, slower: 0.15 },
  distance: { sm: 0, md: 0, lg: 0 },
  scale: { hover: 1, press: 1 },
} as const;
