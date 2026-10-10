import { expect, test } from "@playwright/test";

import {
  backingRect,
  BRIGHT_PER_SIDE,
  buildStarfield,
  DIM_CAP,
  DIM_CONSTELLATIONS,
  DIM_COUNT,
  DIM_LINE_GROUP,
  DIM_TWINKLE_COUNT,
  type DimStar,
  edgeWidth,
  LINE_ALPHA,
  LINE_CAP,
  LINE_GAP,
  lineSegments,
  MAX_WIDTH,
  maxTier,
  PATTERNS,
  SEP_X,
  SEP_Y,
  type Tier,
  TIER_MIN,
  TIERS,
} from "../../components/starfield/starfield-data";

// starfield.md §14.5 data tests 1-4 and 16, in Node: no page and no browser, so
// this file imports @playwright/test, not ./fixtures. Runs once, in mobile-390.

test.beforeEach(() => {
  test.skip(
    test.info().project.name !== "mobile-390",
    "Node only: runs once, in mobile-390",
  );
});

const sky = buildStarfield();
const atTier = (tier: Tier) => (s: { tier: Tier }) =>
  TIERS.indexOf(s.tier) <= TIERS.indexOf(tier);
/** A dim mark's box side in px: the circle's diameter or the span's square. */
const side = (s: DimStar): number => (s.kind === "twinkle" ? s.size! : 2 * s.r);
/** The smallest sky two marks share: the higher tier's true minimum (§14.3). */
const pairSky = (a: { tier: Tier }, b: { tier: Tier }) =>
  TIER_MIN[maxTier(a.tier, b.tier)];

test("1. buildStarfield() is deterministic", () => {
  expect(buildStarfield()).toEqual(buildStarfield());
});

test("2. tier counts, the 0.14 cap and the line group", () => {
  const circles = { base: 29, md: 58, lg: 77, xl: 102 };
  const edgeTwinkles = { base: 4, md: 4, lg: 5, xl: 6 };
  for (const tier of TIERS) {
    const dim = sky.dim.filter(atTier(tier));
    expect(dim, tier).toHaveLength(DIM_COUNT[tier]);
    expect(
      dim.filter((s) => s.kind === "circle"),
      tier,
    ).toHaveLength(circles[tier]);
    expect(
      dim.filter((s) => s.kind === "twinkle"),
      tier,
    ).toHaveLength(DIM_TWINKLE_COUNT[tier]);
    const edges = sky.edges.filter(atTier(tier));
    for (const s of ["start", "end"] as const) {
      expect(
        edges.filter((m) => m.side === s && m.kind === "dot"),
        `${tier} ${s} dots`,
      ).toHaveLength(BRIGHT_PER_SIDE[tier]);
    }
    expect(
      edges.filter((m) => m.twinkle),
      tier,
    ).toHaveLength(edgeTwinkles[tier]);
  }
  expect(
    sky.edges.filter((m) => m.kind === "four-point").map((m) => m.tier),
  ).toEqual(["base", "base", "lg", "xl"]);
  for (const s of sky.dim) expect(s.level).toBeLessThanOrEqual(DIM_CAP);
  expect(DIM_LINE_GROUP * LINE_ALPHA).toBeCloseTo(DIM_CAP, 10);
  // Lines stop 3px short of every vertex star (the stroke's cap included).
  for (const pattern of Object.values(PATTERNS)) {
    for (const [x1, y1, x2, y2] of lineSegments(pattern)) {
      for (const [vx, vy] of pattern.stars) {
        const len2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
        const t = Math.max(
          0,
          Math.min(1, ((vx - x1) * (x2 - x1) + (vy - y1) * (y2 - y1)) / len2),
        );
        const d = Math.hypot(x1 + t * (x2 - x1) - vx, y1 + t * (y2 - y1) - vy);
        expect(d - LINE_CAP, pattern.name).toBeGreaterThanOrEqual(
          LINE_GAP - 1e-9,
        );
      }
    }
  }
});

test("3. separation in px at the true minimum sky; twinkles clear of backings", () => {
  const dim = sky.dim;
  for (const [i, a] of dim.entries()) {
    for (const b of dim.slice(i + 1)) {
      const { w, h } = pairSky(a, b);
      const gapX = (Math.abs(a.x - b.x) / 100) * w - (side(a) + side(b)) / 2;
      const gapY = (Math.abs(a.y - b.y) / 100) * h - (side(a) + side(b)) / 2;
      expect(
        Math.max(gapX, gapY),
        `ranks ${a.rank} and ${b.rank} at ${w} x ${h}`,
      ).toBeGreaterThan(0);
    }
  }
  for (const s of dim.filter((d) => d.kind === "twinkle")) {
    for (const c of DIM_CONSTELLATIONS) {
      const { w: minW, h } = pairSky(s, c);
      for (let w = minW; w <= MAX_WIDTH; w++) {
        const b = backingRect(c, w, h);
        const x = (s.x / 100) * w;
        const y = (s.y / 100) * h;
        const half = s.size! / 2;
        const clear =
          x + half <= b.left ||
          x - half >= b.right ||
          y + half <= b.top ||
          y - half >= b.bottom;
        if (!clear) {
          throw new Error(
            `twinkle rank ${s.rank} under ${c.pattern.name} at ${w} x ${h}`,
          );
        }
      }
    }
  }
});

test("4. every edge mark fits its zone at the zone's minimum width", () => {
  const fourPoint: Record<Tier, number> = { base: 8, md: 10, lg: 12, xl: 12 };
  for (const m of sky.edges) {
    // Each tier from the mark's own up: its zone and sky are smallest there.
    for (const tier of TIERS.slice(TIERS.indexOf(m.tier))) {
      const zone = edgeWidth(TIER_MIN[tier].w);
      const h = TIER_MIN[tier].h;
      const glow = zone >= 56 && m.kind === "four-point" ? 16 : 0;
      const half =
        (m.kind === "four-point" ? fourPoint[tier] / 2 : m.twinkle ? 1 : m.r) +
        glow;
      const x = (m.x / 100) * zone;
      const y = (m.y / 100) * h;
      const what = `${m.side} ${m.kind} (${m.tier}) at ${tier}`;
      expect(x - half, what).toBeGreaterThanOrEqual(0);
      expect(x + half, what).toBeLessThanOrEqual(zone);
      expect(y - half, what).toBeGreaterThanOrEqual(0);
      expect(y + half, what).toBeLessThanOrEqual(h);
    }
  }
  // Drift: only in zones of 120px or more, centred, at y 30% of an xl sky.
  const drift = PATTERNS.drift;
  expect(drift.w).toBeLessThanOrEqual(120);
  expect(0.3 * TIER_MIN.xl.h - drift.h / 2).toBeGreaterThanOrEqual(0);
  // No four-point star (with its glow) touches Drift in any xl sky.
  for (let h = TIER_MIN.xl.h; h <= 2160; h++) {
    for (const m of sky.edges.filter((e) => e.kind === "four-point")) {
      const y = (m.y / 100) * h;
      const apart = Math.abs(y - 0.3 * h) - (drift.h / 2 + 6 + 16);
      expect(apart, `${m.side} (${m.tier}) at ${h}`).toBeGreaterThan(0);
    }
  }
});

test("16. no circle shares a position with a span", () => {
  const circles = sky.dim.filter((s) => s.kind === "circle");
  const spans = sky.dim.filter((s) => s.kind === "twinkle");
  expect(circles.length + spans.length).toBe(sky.dim.length);
  for (const c of circles) {
    for (const s of spans) {
      const inBox = Math.abs(c.x - s.x) < SEP_X && Math.abs(c.y - s.y) < SEP_Y;
      expect(inBox, `circle ${c.rank} and span ${s.rank}`).toBe(false);
    }
  }
});
