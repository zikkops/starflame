/**
 * The primary (ember) CTA recipe (tokens.md §2.3, §2.5 rule 9, §6.2; motion.md
 * §5): ember-400 fill, text-inverse, pill, type-button, padding 12 / 24, min
 * height 48, a transparent 1px border (it shows in forced colors). Hover: the
 * ember-300 fill. Active: ember-500 and the press scale (1 under reduced motion,
 * via --motion-scale-press). The glow is an ::after that already carries
 * shadow-glow-candle at opacity 0 and fades in on hover and focus-visible
 * (opacity only, duration-fast; kept under reduced motion, motion.md §6.2).
 *
 * `glow: false` is the no-glow variant: over a haze gradient, or with another
 * control inside the glow's 26px footprint (rule 9). It has no ::after at all.
 *
 * Class strings only (no component), so a plain <a>, a next/link <Link> or a
 * <button> can all wear it. Width is the caller's (the hero: full width at base).
 */
export function primaryButtonClasses({
  glow = true,
}: { glow?: boolean } = {}): string {
  const base =
    "relative inline-flex min-h-12 items-center justify-center rounded-pill border border-transparent bg-cta-bg px-6 py-3 text-center type-button text-text-inverse transition-[background-color,scale] duration-(--duration-fast) ease-standard hover:bg-cta-bg-hover active:scale-(--motion-scale-press) active:bg-cta-bg-active";
  if (!glow) return base;
  return `${base} after:pointer-events-none after:absolute after:-inset-px after:rounded-[inherit] after:opacity-0 after:shadow-glow-candle after:transition-opacity after:duration-(--duration-fast) after:ease-standard after:content-[''] hover:after:opacity-100 focus-visible:after:opacity-100`;
}
