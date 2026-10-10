/**
 * Inline SVG glyphs for the header (header.md §4.3): 24×24 line icons, 1.5px
 * `currentColor` stroke with round caps and joins, plus the two filled motifs.
 * Always decorative: the control around them carries the name.
 */

type GlyphProps = {
  className?: string;
  /** Adds data-decorative: removed under forced colors (globals.css section 8). */
  decorative?: boolean;
};

function Line({
  className,
  children,
}: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

function Filled({
  className,
  decorative,
  children,
}: GlyphProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      data-decorative={decorative ? "" : undefined}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Three strokes, the middle one shorter. */
export function MenuIcon({ className }: GlyphProps) {
  return (
    <Line className={className}>
      <path d="M4 7h16M4 12h11M4 17h16" />
    </Line>
  );
}

/** A thin ×. */
export function CloseIcon({ className }: GlyphProps) {
  return (
    <Line className={className}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </Line>
  );
}

export function SearchIcon({ className }: GlyphProps) {
  return (
    <Line className={className}>
      <circle cx="10.5" cy="10.5" r="6.25" />
      <path d="M15.25 15.25L20 20" />
    </Line>
  );
}

/** Head and shoulders. */
export function AccountIcon({ className }: GlyphProps) {
  return (
    <Line className={className}>
      <circle cx="12" cy="8" r="3.75" />
      <path d="M4.75 20c.6-3.6 3.6-5.75 7.25-5.75s6.65 2.15 7.25 5.75" />
    </Line>
  );
}

/** A shopping bag with two handles. */
export function BagIcon({ className }: GlyphProps) {
  return (
    <Line className={className}>
      <path d="M5.25 8.25h13.5l-1 11.25a1.5 1.5 0 0 1-1.5 1.25H7.75a1.5 1.5 0 0 1-1.5-1.25z" />
      <path d="M8.5 8.25V6.5a1.75 1.75 0 0 1 3.5 0v1.75M12 8.25V6.5a1.75 1.75 0 0 1 3.5 0v1.75" />
    </Line>
  );
}

/** The four-point star's path, shared with the starfield's pre-built markup. */
export const FOUR_POINT_STAR_D =
  "M12 1.5Q13 11 22.5 12Q13 13 12 22.5Q11 13 1.5 12Q11 11 12 1.5z";

/** The four-point star (the drawer's current-page marker). */
export function FourPointStarIcon({ className }: GlyphProps) {
  return (
    <Filled className={className}>
      <path d={FOUR_POINT_STAR_D} />
    </Filled>
  );
}

export function CrescentIcon({ className, decorative }: GlyphProps) {
  return (
    <Filled className={className} decorative={decorative}>
      <path d="M14.6 3.1a9 9 0 1 0 6.3 13.6A7.25 7.25 0 0 1 14.6 3.1z" />
    </Filled>
  );
}
