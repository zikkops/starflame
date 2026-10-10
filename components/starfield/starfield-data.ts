/**
 * The starfield's sky as plain data (starfield.md §4, §7, §14.3). Pure: no DOM,
 * no React and no imports (in particular no `server-only`), so the server layer
 * renders it and the Node tests (tests/e2e/starfield-data.spec.ts) import it.
 * Deterministic: one seed, mulberry32 and the R2 sequence, so every build draws
 * the same sky. Positions are % of the sky (one decimal), sizes in px.
 */

export const STARFIELD_SEED = 20261009;

export type Tier = "base" | "md" | "lg" | "xl";
export const TIERS: readonly Tier[] = ["base", "md", "lg", "xl"];
const tierIndex = (tier: Tier): number => TIERS.indexOf(tier);
/** The higher of two tiers: a pair of marks is only ever shown together there. */
export const maxTier = (a: Tier, b: Tier): Tier =>
  tierIndex(a) >= tierIndex(b) ? a : b;

/** The narrowest viewport and the smallest sky each tier is drawn in (§7). */
export const TIER_MIN: Readonly<Record<Tier, { w: number; h: number }>> = {
  base: { w: 320, h: 120 },
  md: { w: 768, h: 368 },
  lg: { w: 1024, h: 368 },
  xl: { w: 1440, h: 360 },
};
/** Cumulative counts per tier (§7). */
export const DIM_COUNT: Readonly<Record<Tier, number>> = {
  base: 36,
  md: 72,
  lg: 96,
  xl: 128,
};
export const DIM_TWINKLE_COUNT: Readonly<Record<Tier, number>> = {
  base: 7,
  md: 14,
  lg: 19,
  xl: 26,
};
export const BRIGHT_PER_SIDE: Readonly<Record<Tier, number>> = {
  base: 3,
  md: 4,
  lg: 5,
  xl: 6,
};
/** The content-column cap (§3.2): nothing there paints brighter than this. */
export const DIM_CAP = 0.14;
export const DIM_LEVELS = [0.08, 0.1, 0.12, 0.14] as const;
export const BRIGHT_LEVELS = [0.45, 0.6, 0.75, 0.9] as const;
export const FOUR_POINT_PEAK = 0.85;
/** Constellation lines: the token's 0.35 inside a group at 0.4 (§4.3). */
export const LINE_ALPHA = 0.35;
export const DIM_LINE_GROUP = 0.7;
/** Separation box between dim stars, in % of the sky (§14.3). */
export const SEP_X = 2;
export const SEP_Y = 3;
export const MAX_WIDTH = 3840;

export type Colour = "core" | "violet" | "gold" | "rose";

export type DimStar = {
  rank: number;
  tier: Tier;
  /** % of the sky, one decimal. */
  x: number;
  y: number;
  /** Circle radius in px; a twinkle span is `size` px square instead. */
  r: number;
  colour: Colour;
  /** The star's level (≤ DIM_CAP); for a twinkle star, its `hi`. */
  level: number;
  kind: "circle" | "twinkle";
  /** Twinkle only: span size (px), period and negative phase delay (ms). */
  size?: number;
  dur?: number;
  delay?: number;
};

export type Side = "start" | "end";
export type EdgeMark = {
  side: Side;
  tier: Tier;
  kind: "dot" | "four-point";
  /** % of the zone's width and of the sky's height. */
  x: number;
  y: number;
  /** Dot radius in px (four-point stars are sized by CSS per breakpoint). */
  r: number;
  /** Peak opacity. */
  level: number;
  twinkle: boolean;
  dur?: number;
  delay?: number;
};

export type Point = readonly [number, number];
export type Pattern = {
  name: "wick" | "ribbon" | "sprig" | "drift";
  /** Pattern box, px. */
  w: number;
  h: number;
  stars: readonly Point[];
  /** Pairs of star indexes. */
  lines: readonly (readonly [number, number])[];
};

/** Invented patterns (§4.3, §15), px from the top-start corner. */
const BASE_PATTERNS: Readonly<Record<Pattern["name"], Pattern>> = {
  wick: {
    name: "wick",
    w: 66,
    h: 38,
    stars: [
      [0, 0],
      [14, 12],
      [34, 16],
      [46, 34],
      [66, 38],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
  ribbon: {
    name: "ribbon",
    w: 68,
    h: 40,
    stars: [
      [0, 0],
      [14, 10],
      [22, 26],
      [38, 34],
      [56, 30],
      [68, 40],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  sprig: {
    name: "sprig",
    w: 40,
    h: 30,
    stars: [
      [0, 30],
      [18, 18],
      [28, 0],
      [40, 26],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [1, 3],
    ],
  },
  drift: {
    name: "drift",
    w: 10,
    h: 100,
    stars: [
      [6, 0],
      [0, 26],
      [8, 52],
      [2, 76],
      [10, 100],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
    ],
  },
};

/** The background constellations drawn larger (user request, 2026-10-10). */
export const PATTERN_SCALE = 2.2;

const scalePattern = (p: Pattern): Pattern => ({
  ...p,
  w: p.w * PATTERN_SCALE,
  h: p.h * PATTERN_SCALE,
  stars: p.stars.map(([x, y]) => [x * PATTERN_SCALE, y * PATTERN_SCALE] as const),
});

export const PATTERNS: Readonly<Record<Pattern["name"], Pattern>> = {
  wick: scalePattern(BASE_PATTERNS.wick),
  ribbon: scalePattern(BASE_PATTERNS.ribbon),
  sprig: scalePattern(BASE_PATTERNS.sprig),
  drift: scalePattern(BASE_PATTERNS.drift),
};

/** Each line stops this far short of its vertex stars (§4.3). */
export const LINE_GAP = 3;
/** The 1px line's round cap reaches half its width past each end. */
export const LINE_CAP = 0.5;

/** A pattern's lines as [x1, y1, x2, y2], each end pulled in by gap + cap. */
export function lineSegments(p: Pattern): [number, number, number, number][] {
  return p.lines.map(([a, b]) => {
    const [x1, y1] = p.stars[a]!;
    const [x2, y2] = p.stars[b]!;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const ux = ((x2 - x1) / len) * (LINE_GAP + LINE_CAP);
    const uy = ((y2 - y1) / len) * (LINE_GAP + LINE_CAP);
    return [x1 + ux, y1 + uy, x2 - ux, y2 - uy];
  });
}

/** Dim constellations: tier and anchor in % of the content column / sky (§4.3). */
export type DimConstellation = {
  pattern: Pattern;
  tier: Tier;
  ax: number;
  ay: number;
};
/** Backing = pattern box + 6px on every side (§4.3). */
export const BACKING_PAD = 6;
export const DIM_CONSTELLATIONS: readonly DimConstellation[] = [
  { pattern: PATTERNS.wick, tier: "base", ax: 58, ay: 62 },
  { pattern: PATTERNS.ribbon, tier: "md", ax: 12, ay: 24 },
  { pattern: PATTERNS.sprig, tier: "lg", ax: 74, ay: 40 },
];
export const backingSize = (p: Pattern): { w: number; h: number } => ({
  w: p.w + 2 * BACKING_PAD,
  h: p.h + 2 * BACKING_PAD,
});

/* ── Geometry (§3.1, §4.3), as functions of the viewport width, no insets ── */

/** --gutter per breakpoint (tokens.md §9): md 768, lg 1024, xl 1440. */
export function gutter(width: number): number {
  if (width >= 1440) return 80;
  if (width >= 1024) return 40;
  if (width >= 768) return 32;
  return 20;
}
/** The tier a viewport shows (short viewports show only the base tier). */
export function tierAt(width: number, height: number): Tier {
  if (height <= 448) return "base";
  if (width >= 1440) return "xl";
  if (width >= 1024) return "lg";
  if (width >= 768) return "md";
  return "base";
}
/** Each edge zone's width: outside the Container's content box, less 8px. */
export function edgeWidth(width: number): number {
  const g = gutter(width);
  return Math.max(0, (width - 1280 - 2 * g) / 2) + g - 8;
}
export type Rect = { left: number; top: number; right: number; bottom: number };
/** A dim constellation's backing in px of a sky `width` × `height`. */
export function backingRect(
  c: DimConstellation,
  width: number,
  height: number,
): Rect {
  const edge = edgeWidth(width);
  const column = width - 2 * edge;
  const { w, h } = backingSize(c.pattern);
  const clamp = (v: number, max: number) => Math.min(Math.max(0, v), max);
  const left = edge + clamp((c.ax / 100) * column, column - w);
  const top = clamp((c.ay / 100) * height, height - h);
  return { left, top, right: left + w, bottom: top + h };
}
/**
 * The sky-% area a backing can cover next to a mark of `tier`: the union of its
 * rectangles over every integer width from the pair's minimum to 3840px, at the
 * pair's smallest sky (where the box is tallest in %), widened by 1% for the
 * span's own size (§14.3).
 */
function exclusion(tier: Tier, c: DimConstellation): Rect {
  const pair = TIER_MIN[maxTier(tier, c.tier)];
  const area: Rect = { left: 100, top: 100, right: 0, bottom: 0 };
  for (let w = pair.w; w <= MAX_WIDTH; w++) {
    const b = backingRect(c, w, pair.h);
    area.left = Math.min(area.left, (b.left / w) * 100 - 1);
    area.right = Math.max(area.right, (b.right / w) * 100 + 1);
    area.top = Math.min(area.top, (b.top / pair.h) * 100 - 1);
    area.bottom = Math.max(area.bottom, (b.bottom / pair.h) * 100 + 1);
  }
  return area;
}
const clearOf = (areas: readonly Rect[], x: number, y: number): boolean =>
  areas.every(
    (a) => x <= a.left || x >= a.right || y <= a.top || y >= a.bottom,
  );

/* ── Randomness ──────────────────────────────────────────────────────────── */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const G = 1.32471795724474602596;
const frac = (v: number): number => v - Math.floor(v);
const round1 = (v: number): number => Math.round(v * 10) / 10;
const pick = <T>(rng: () => number, items: readonly T[]): T =>
  items[Math.floor(rng() * items.length)] as T;
const between = (rng: () => number, lo: number, hi: number): number =>
  lo + rng() * (hi - lo);
function weighted<T>(rng: () => number, table: readonly [T, number][]): T {
  let roll = rng();
  for (const [value, weight] of table) {
    if ((roll -= weight) < 0) return value;
  }
  return table[table.length - 1]![0];
}
const tierOfRank = (rank: number): Tier =>
  TIERS.find((tier) => rank < DIM_COUNT[tier]) ?? "xl";
function timing(rng: () => number): { dur: number; delay: number } {
  const dur = Math.round(between(rng, 3000, 6000));
  return { dur, delay: -Math.round(rng() * dur) };
}

/* ── The sky ─────────────────────────────────────────────────────────────── */

export type Starfield = {
  dim: DimStar[];
  edges: EdgeMark[];
};

function buildDim(rng: () => number): DimStar[] {
  const stars: DimStar[] = [];
  for (let n = 0; stars.length < DIM_COUNT.xl; n++) {
    // R2 sequence plus a seeded jitter of up to ±1%.
    const x = round1(frac(0.5 + n / G) * 100 + between(rng, -1, 1));
    const y = round1(frac(0.5 + n / (G * G)) * 100 + between(rng, -1, 1));
    if (x < 1 || x > 99 || y < 1 || y > 99) continue;
    if (
      stars.some((s) => Math.abs(s.x - x) < SEP_X && Math.abs(s.y - y) < SEP_Y)
    ) {
      continue;
    }
    const rank = stars.length;
    stars.push({
      rank,
      tier: tierOfRank(rank),
      x,
      y,
      r: weighted(rng, [
        [0.5, 0.6],
        [0.75, 0.3],
        [1, 0.1],
      ]),
      colour: weighted<Colour>(rng, [
        ["core", 0.7],
        ["violet", 0.15],
        ["gold", 0.1],
        ["rose", 0.05],
      ]),
      level: pick(rng, DIM_LEVELS),
      kind: "circle",
    });
  }
  // About one in five twinkles: ranks with rank % 5 === 2; one that falls under
  // a constellation backing passes its turn to the next clear rank of its tier.
  const areas = new Map(
    TIERS.map((tier) => [
      tier,
      DIM_CONSTELLATIONS.map((c) => exclusion(tier, c)),
    ]),
  );
  let owed = 0;
  for (const star of stars) {
    if (star.rank % 5 === 2) owed++;
    if (owed > 0 && clearOf(areas.get(star.tier) ?? [], star.x, star.y)) {
      owed--;
      star.kind = "twinkle";
      star.size = star.r > 0.5 ? 2 : 1;
      Object.assign(star, timing(rng));
    }
    if (star.rank === DIM_COUNT[star.tier] - 1 && owed > 0) {
      throw new Error(`starfield: tier ${star.tier} is short of twinkle stars`);
    }
  }
  return stars;
}

function buildEdges(rng: () => number): EdgeMark[] {
  const marks: EdgeMark[] = [];
  // Four-point stars: one upper per side from base; the lower end one at lg, the
  // lower start one at xl (§7). The upper ones sit above Drift (centred at y 30%,
  // 100px tall) with their 44px glow, even in the smallest xl sky (360px); the
  // two sides take different bands (start y 6-8%, end y 8-10%).
  const fourPoint: [Side, Tier, number, number][] = [
    ["start", "base", 6, 8],
    ["end", "base", 8, 10],
    ["end", "lg", 60, 85],
    ["start", "xl", 60, 85],
  ];
  for (const [side, tier, lo, hi] of fourPoint) {
    marks.push({
      side,
      tier,
      kind: "four-point",
      x: 50,
      y: round1(between(rng, lo, hi)),
      r: 0,
      level: FOUR_POINT_PEAK,
      twinkle: true,
      ...timing(rng),
    });
  }
  for (const side of ["start", "end"] as const) {
    const taken = marks.filter((m) => m.side === side).map((m) => m.y);
    for (let rank = 0; rank < BRIGHT_PER_SIDE.xl;) {
      const y = round1(between(rng, 5, 95));
      if (taken.some((t) => Math.abs(t - y) < 6)) continue;
      taken.push(y);
      const twinkle = rank === 0; // one bright dot per side twinkles
      marks.push({
        side,
        tier: TIERS.find((tier) => rank < BRIGHT_PER_SIDE[tier]) ?? "xl",
        kind: "dot",
        x: round1(between(rng, 25, 75)),
        y,
        r: twinkle ? 1 : pick(rng, [0.75, 1, 1.25]),
        level: pick(rng, BRIGHT_LEVELS),
        twinkle,
        ...(twinkle ? timing(rng) : {}),
      });
      rank++;
    }
  }
  return marks;
}

/** The whole sky as plain data. Same seed, same sky. */
export function buildStarfield(seed: number = STARFIELD_SEED): Starfield {
  const rng = mulberry32(seed);
  return { dim: buildDim(rng), edges: buildEdges(rng) };
}

/** The dev preview pages' constant prop (§13.1). */
export type StarfieldPreview = {
  still?: boolean;
  streak?: "off" | "demo" | "demo-blocked";
};
