/**
 * Class recipes shared by the header's server markup and its client islands
 * (header.md §4.3). Plain strings, so Tailwind's scanner sees them here.
 */

/** 44px icon button: transparent border (forced colors), gold glyph on hover, press scale. */
export const ICON_BUTTON =
  "relative inline-flex size-(--size-touch) shrink-0 items-center justify-center rounded-pill border border-transparent text-text-primary transition-colors hover:text-link [&>svg]:transition-[scale] [&>svg]:duration-(--duration-fast) [&>svg]:ease-standard active:[&>svg]:scale-(--motion-scale-press)";

/** The 24px glyph inside an icon button. */
export const ICON_GLYPH = "size-6";
