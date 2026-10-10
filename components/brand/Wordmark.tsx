import {
  WORDMARK_PATH,
  WORDMARK_STROKE,
  WORDMARK_VIEWBOX,
} from "./wordmark-path";

const SYMBOL_ID = "sf-wordmark";

/**
 * The wordmark's one definition per page (typography.md §3.2). Rendered once, by
 * the root layout. Zero-size and out of flow, but not display:none, so <use>
 * references always resolve.
 */
export function WordmarkSprite() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="absolute overflow-hidden"
    >
      <symbol id={SYMBOL_ID} viewBox={WORDMARK_VIEWBOX}>
        <path
          d={WORDMARK_PATH}
          fill="currentColor"
          stroke="currentColor"
          strokeWidth={WORDMARK_STROKE}
          strokeLinejoin="round"
          paintOrder="stroke"
        />
      </symbol>
    </svg>
  );
}

type WordmarkProps = {
  /** Height token: header 28/32/36px, footer 40/44/48px (typography.md §3.3). */
  size: "header" | "footer";
  className?: string;
};

const HEIGHT = {
  header: "h-(--wordmark-h-header)",
  footer: "h-(--wordmark-h-footer)",
} as const;

/**
 * "Starflames" as an image with that accessible name. Colour comes from
 * `currentColor` (the parent's text colour), so links, hover and forced colors
 * just work. Never inside a heading; never the page's h1.
 */
export function Wordmark({ size, className }: WordmarkProps) {
  return (
    <svg
      role="img"
      aria-label="Starflames"
      viewBox={WORDMARK_VIEWBOX}
      className={`${HEIGHT[size]} w-auto shrink-0 ${className ?? ""}`.trim()}
    >
      <use href={`#${SYMBOL_ID}`} />
    </svg>
  );
}
