import "server-only";

import { FOUR_POINT_STAR_D } from "@/components/icons/glyphs";

import {
  backingSize,
  buildStarfield,
  type Colour,
  DIM_CONSTELLATIONS,
  DIM_LINE_GROUP,
  lineSegments,
  type DimStar,
  type EdgeMark,
  PATTERNS,
  type Pattern,
  type Side,
  TIERS,
  type Tier,
} from "./starfield-data";

/**
 * The static sky (starfield.md §4, §14.2), rendered on the server only: the
 * field SVG (still dim stars only), the dim twinkle spans, the content column
 * with the dim constellations on their bg-page backings, then the two edge
 * zones. Paint order is DOM order. Styles: app/globals.css section 10. The
 * slot's markup budget is 16KB raw (§9), so numbers are written in their
 * shortest form and tiers, colours and opacity levels are shared by groups.
 *
 * The sky's inside is one pre-built HTML string, so React's RSC payload carries
 * a single string instead of an element tree (about four times the markup).
 * The string is built once, at module scope during the build, only from the
 * constant data of starfield-data.ts (one seed, no props, never user input).
 * Nothing in it needs escaping; tag() still refuses a value with a markup
 * character, so a future data change fails the build instead of the page.
 * The DOM is the one the JSX version rendered (same elements and attributes).
 */

type Attrs = Readonly<Record<string, string | number | undefined>>;

/** One element; attributes in order, undefined ones left out (as React does). */
function tag(name: string, attrs: Attrs, inner = ""): string {
  let open = `<${name}`;
  for (const [key, value] of Object.entries(attrs)) {
    if (value === undefined) continue;
    const text = String(value);
    if (/[&<>"']/.test(text)) {
      throw new Error(`starfield: unexpected markup in ${name} ${key}`);
    }
    open += ` ${key}="${text}"`;
  }
  return `${open}>${inner}</${name}>`;
}
/** An inline style, serialised as React does: `name:value;name:value`. */
const css = (props: Readonly<Record<string, string>>): string =>
  Object.entries(props)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
const HIDDEN = { "aria-hidden": "true", focusable: "false" } as const;

/** 0.12 -> ".12", 12.3 -> "12.3". */
const num = (v: number): string =>
  String(Math.round(v * 1000) / 1000).replace(/^(-?)0\./, "$1.");
const pct = (v: number): string => `${num(v)}%`;
/** Tiered marks: hidden below their breakpoint and in short viewports. */
const minTier = (tier: Tier): Tier | undefined =>
  tier === "base" ? undefined : tier;
const COLOUR: Record<Colour, string> = {
  core: "sf-core",
  violet: "sf-violet",
  gold: "sf-gold",
  rose: "sf-rose",
};

/** Group by key, in first-seen order. */
function groups<T>(items: readonly T[], key: (item: T) => string): T[][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    map.set(k, [...(map.get(k) ?? []), item]);
  }
  return [...map.values()];
}

/** The four-point star glyph (components/icons/glyphs.tsx, decorative). */
const FOUR_POINT = tag(
  "svg",
  { viewBox: "0 0 24 24", fill: "currentColor", ...HIDDEN },
  tag("path", { d: FOUR_POINT_STAR_D }),
);

/**
 * A twinkle span (§4.4). Only `hi` is inline: CSS derives `lo` (0.5 × hi in
 * the content column, 0.6 × hi at the edges) and the still value, the midpoint.
 */
function twinkle({
  x,
  y,
  hi,
  dur = 4000,
  delay = 0,
  tier,
  className,
  fourPoint = false,
}: {
  x: number;
  y: number;
  hi: number;
  dur?: number;
  delay?: number;
  tier: Tier;
  className?: string;
  fourPoint?: boolean;
}): string {
  return tag(
    "span",
    {
      "data-sf-tw": "",
      "data-sf-fp": fourPoint ? "" : undefined,
      "data-sf-min": minTier(tier),
      class: className,
      style: css({
        left: pct(x),
        top: pct(y),
        "--sf-hi": num(hi),
        "--sf-dur": `${dur}ms`,
        "--sf-delay": `${delay}ms`,
      }),
    },
    fourPoint ? FOUR_POINT : "",
  );
}

function linePath(p: Pattern): string {
  return lineSegments(p)
    .map(([x1, y1, x2, y2]) => `M${num(x1)} ${num(y1)}L${num(x2)} ${num(y2)}`)
    .join("");
}

/**
 * Drawn larger than the placement box (user request, 2026-10-10). The layout
 * (backings, the twinkle stars' clear areas) still uses the pattern box:
 * scaling the pattern data itself further leaves no room for the twinkles.
 */
const DRAW_SCALE = 1.45;

/** A constellation in its own px-sized SVG (§4.3). */
function constellation(pattern: Pattern, dim: boolean): string {
  return tag(
    "svg",
    {
      width: num(pattern.w * DRAW_SCALE),
      height: num(pattern.h * DRAW_SCALE),
      viewBox: `0 0 ${pattern.w} ${pattern.h}`,
      overflow: "visible",
      ...HIDDEN,
    },
    tag("path", {
      class: "sf-line",
      d: linePath(pattern),
      opacity: dim ? num(DIM_LINE_GROUP) : undefined,
    }) +
      tag(
        "g",
        { class: "sf-core", opacity: dim ? ".3" : ".75" },
        pattern.stars
          .map(([x, y]) =>
            tag("circle", { cx: x, cy: y, r: dim ? "1.6" : "2" }),
          )
          .join(""),
      ),
  );
}

/** Circles in one group per tier, then per colour (dim) and opacity level. */
function circles<
  T extends { tier: Tier; level: number; x: number; y: number; r: number },
>(marks: readonly T[], colour: (mark: T) => string): string {
  return TIERS.map((tier) => {
    const inTier = marks.filter((m) => m.tier === tier);
    const content = groups(inTier, (m) => `${colour(m)} ${m.level}`)
      .map((members) =>
        tag(
          "g",
          { class: colour(members[0]!), opacity: num(members[0]!.level) },
          members
            .map((m) =>
              tag("circle", { cx: pct(m.x), cy: pct(m.y), r: num(m.r) }),
            )
            .join(""),
        ),
      )
      .join("");
    if (inTier.length === 0 || tier === "base") return content;
    return tag("g", { "data-sf-min": tier }, content);
  }).join("");
}

function edge(side: Side, marks: readonly EdgeMark[]): string {
  return tag(
    "div",
    { "data-sf-edge": side },
    tag(
      "svg",
      HIDDEN,
      circles(
        marks.filter((m) => !m.twinkle),
        () => "sf-core",
      ),
    ) +
      marks
        .filter((m) => m.twinkle)
        .map((m) =>
          twinkle({
            ...m,
            hi: m.level,
            className: m.kind === "dot" ? "sf-core sf-2" : undefined,
            fourPoint: m.kind === "four-point",
          }),
        )
        .join("") +
      tag(
        "div",
        { "data-sf-drift": "", "data-sf-min": "xl" },
        constellation(PATTERNS.drift, false),
      ),
  );
}

function skyMarkup(): string {
  const sky = buildStarfield();
  const dim: readonly DimStar[] = sky.dim;
  return [
    tag(
      "svg",
      { "data-sf-field": "", "data-sf-dim": "", ...HIDDEN },
      circles(
        dim.filter((s) => s.kind === "circle"),
        (s) => COLOUR[s.colour],
      ),
    ),
    tag(
      "div",
      { "data-sf-twinkles": "", "data-sf-dim": "" },
      dim
        .filter((s) => s.kind === "twinkle")
        .map((s) =>
          twinkle({
            ...s,
            hi: s.level,
            className:
              s.size === 2 ? `${COLOUR[s.colour]} sf-2` : COLOUR[s.colour],
          }),
        )
        .join(""),
    ),
    tag(
      "div",
      { "data-sf-column": "", "data-sf-dim": "" },
      DIM_CONSTELLATIONS.map((c) => {
        const { w, h } = backingSize(c.pattern);
        return tag(
          "div",
          {
            "data-sf-const": c.pattern.name,
            "data-sf-min": minTier(c.tier),
            style: css({
              left: `clamp(0px, ${c.ax}%, calc(100% - ${w}px))`,
              top: `clamp(0px, ${c.ay}%, calc(100% - ${h}px))`,
            }),
          },
          constellation(c.pattern, true),
        );
      }).join(""),
    ),
    ...(["start", "end"] as const).map((side) =>
      edge(
        side,
        sky.edges.filter((m) => m.side === side),
      ),
    ),
  ].join("");
}

/**
 * Built once per server bundle, at build time (the pages are static). One
 * shared object: the RSC payload holds the layout twice (the page and the root
 * not-found boundary), and React writes a repeated object once, then refers to it.
 */
const SKY_HTML = { __html: skyMarkup() };

export function StarfieldLayer() {
  // Constant markup from seeded data, never user input (see the note above).
  return <div data-sf-sky="" dangerouslySetInnerHTML={SKY_HTML} />;
}
