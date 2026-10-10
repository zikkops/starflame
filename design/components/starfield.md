# Starfield background (M1.18)

Status: spec, QA PASSED (fix round 2), with the post-pass sync with M1.19 as-built (changelog below). Owner: design-agent. Implemented by tech-agent in M1.19.
Fills the slot defined in [`layout-shell.md`](./layout-shell.md) §8 (fixed, `top: 0`, `100lvh`, `--z-starfield`, stars, constellation lines and particles only, **no haze**, `aria-hidden`, `data-decorative`, `data-starfield-state`), within the layers of §2.3 and the bands of §5.2, and keeps the star-free top band required by [`header.md`](./header.md) §8.2. Uses [`tokens.md`](../system/tokens.md) (§2.3 star and constellation roles, §2.5 rule 5, §6.2 `shadow-glow-starlight`, §8, §9.1), [`motion.md`](../system/motion.md) (§2 `duration-twinkle`, `duration-falling-star`, §3 `ease-ambient`, `ease-linear`, §5, §6, and the constants in `lib/motion/tokens.ts`) and [`accessibility.md`](../system/accessibility.md) (§1, §2, §5, §7, §8). Nothing here loosens those files; where this spec is stricter, it says so.

## Changelog

**Test wording from M1.20b** (2026-10-10). Wording only, from `design/tech/M1.20b-e2e-reliability.md` §2; no behaviour or copy change. §14.5 test 12 (c): the streak is picked up before 600ms, sampled at the first frame at or after 600ms and before the fade-out starts (retaken on the next streak, at most 3), and the relaunch is counted in `sf-attempt` checks. §13.2 `dev-starfield-streak`: the running streak is found and paused in one task. §9 per-attempt row, §14.5 test 15: the `@perf` budgets run in the serial pass of `npm run test:e2e`.

**Post-pass sync with M1.19 as-built** (2026-10-10). The approved tech pushback (`design/tech/M1.19-starfield.md` §3) and the as-built notes (§4 there). No other value changes; test numbers keep their meaning.

1. §4.5, §9 per-attempt row, §14.5 test 15: **each path's corridor check runs in its own task** (one `sf-attempt` measure per task). Test 15 asserts, unthrottled in both projects, **every task ≤ 16ms and no long task**, plus a **median ≤ 4ms in a serial run** (`--workers=1`); the 4× CPU throttle figures are reported in the build review, not asserted. The five-line, 8px grid is unchanged.
2. §9, §13.1: the demo launches **only if none of its three checks refused** (a `refused` flag carried through the three tasks), and the deciding (third) check runs in the same task as the launch.
3. §13.1, §14.5 test 11: the dev page's own solid band has `min-h-lvh` (that preview page only), so test 11 has a scroll position with no plain band in view. The shared `Section` is unchanged.
4. §4.2, §7: the upper four-point stars sit at **y 6–10%** of the sky (start side 6–8%, end side 8–10%), not anywhere in the upper half: clear of the Drift chain and its glow, and not a symmetric pair of bookends.
5. §3.2, §4.3, §14.2: the 3px line gaps are made by **shortening each segment at each vertex** (no SVG mask), one `<path>` per pattern.
6. §4.4, §7, §14.2: the dim twinkle spans share **one `data-sf-dim` wrapper** (`data-sf-twinkles`: absolute, inset 0, no opacity, no z-index); CSS derives `--sf-lo` and the still opacity from `--sf-hi`.
7. §13.3: the "head 2px adds 1px" note is dropped from the corridor-box row. §9: both projects run Chromium (mobile-390 emulates the viewport, not the CPU). §14.5 test 12: the viewport is set to 390 × 844 explicitly (the project's own 390 × 664 also passes).
8. §9 static-markup row, §14.1: the sky's static markup ships as **one pre-built string**, so the RSC payload carries it once as a single string: a first load costs the markup plus one string copy (the "about twice" wording is re-baselined).
9. §4.5, §12: the streak's colour comes from the star-core token through `color-mix()` (no hard-coded rgb).

**Fix round 2: QA issues 1–7** (2026-10-09). Test numbers keep their meaning; test 12 and test 15 are extended.

1. §11, §13.1, new §13.3, §14.5 test 12: the demo path is defined **inside** the spacer, inset from its top-start corner by at least trail + corridor half-width + 16px horizontally (76px at base, 104px from md) and 56 / 64px vertically, at a fixed 20° and a fixed travel (160 / 240px). The spacer is now the **first** element of the first plain band, with a fixed px height (320 / 360px), so it is fully in view at scroll 0 at 390 × 844 and 1440 × 900. §13.3 gives the geometry at both sizes. The first demo launch fires as soon as the state is `animating`, and test 12's 4s counts from `animating`. `/dev/starfield/streak-blocked` aims the same path at the caption directly below the spacer (now `data-sf-demo="text"`), with its whole corridor inside the layer and its margins, so the refusal can only be `text`. The caption now reads "…the empty space above."
2. §4.5, §14.5 test 12: the in-flight `ResizeObserver` on `main` compares each reported size with main's size recorded at launch and cancels only when it differs (its initial notification right after `observe()` reports the same size, so it never cancels). The streak element is appended to the slot, which is a sibling of `main`, so the in-flight `MutationObserver` on `main` never sees it. Test 12 adds: a streak with no input survives to its natural end.
3. §11, §13.1: dev page titles, one per page, each set by a `generateMetadata` that calls `requireDevPages()` first.
4. §4.5, §9, §14.5 test 15: the ≤ 4ms per-attempt budget is measured with `performance.measure` (`sf-attempt`); max ≤ 4ms on desktop-1440, and ≤ 16ms with no long task on mobile-390 under 4× CPU throttling. The five-line, 8px grid stays (justified in §9).
5. §9: the layer delta is `animating − static ≤ 32 + 2`; the binding check is per span (each span has its own layer, overlap layers stay at most one each for `main` and the header, and the extra layers don't grow with the span count).
6. `layout-shell.md` §8.1: "the layer and its SVG never resize during scroll" (there is no canvas).
7. §4.5, §13.1: `data-sf-last-skip` takes `text`, `edge` or `null`, with a fixed evaluation order per sample.

**Fix round 1: QA issues 1–14** (2026-10-09). The 0.14 cap is unchanged (QA verified every text and UI colour stays at AA over it). Test numbers 1–15 keep their meaning; tests 16–19 are new (§14.5).

1. §3.2, §4.1, §4.4, §7, §14.2, §14.3, §14.5: a twinkling dim star is drawn **only** as its span, never also as a circle. Circles are 29 / 58 / 77 / 102 per tier, plus 7 / 14 / 19 / 26 dim twinkle spans (36 / 72 / 96 / 128 dim stars). Test 5 now counts circles + dim twinkle spans (29 + 7 = 36 at 390, 102 + 26 = 128 at 1440). New data test 16: no circle shares a position with a span.
2. §6.1, §9, §11, §13, §14.1, §14.5: the preview query string is replaced by five static pages, `/dev/starfield`, `/dev/starfield/still`, `/dev/starfield/no-streak`, `/dev/starfield/streak-demo` and `/dev/starfield/streak-blocked`, each passing a constant preview prop (no `searchParams`). The §11 link targets, the §9 measurement URLs, test 12 and the §13.2 shot list follow. `captureRoute` gains `name`, `fullPage` and `animations` options (tech, M1.13). Each new file is listed for the `app/dev/dev.css` `@source`.
3. §6.1, §8, §10, §16: a persistent site-wide "Pause animations" control is **required before launch** (WCAG 2.2.2), scheduled as TASKS.md M8.8b. M1.19 exposes the hook `html[data-motion="off"]`, which puts the starfield in `static` now (test 18).
4. §7, §14.3, §14.5: content-column marks are **hidden when the sky is under 120px tall or under 320px wide** (a container query on the sky). Separation and twinkle exclusion are evaluated at that true minimum, 320 × 120 for the base tier, and at the true minimum of each higher tier. Test 3 covers those sizes; test 19 checks the floor.
5. §4.5, §14.5: the corridor check. Bare text directly in `main`, plain sections and `[data-open-sky]`, and `pointer-events: none` on text, images and cards, are forbidden (test 17); a `null` hit blocks. Samples are no more than 8px apart, along and across the corridor. A streak in flight is cancelled on `pointerdown`, `keydown`, a pathname change, and a `ResizeObserver` / `MutationObserver` on `main` that is active only during flight. Scrolling cancels it at once (opacity 0 in the same frame), not with a 150ms fade.
6. `layout-shell.md` §8.1 and §8.3 reworded: server-rendered static SVG and spans are allowed; the motion module loads after `load` plus idle. The cost is noted (about 5KB gzipped of HTML plus the RSC copy per first load).
7. `tokens.md` §2.3 (stars row: the content-column cap of 0.14) and §2.2 (night-500 no longer claims constellation lines; they are gold-300 at 35%).
8. §4.3, §7, §14.2: dim constellations are anchored to the content column and clamped inside it, so they never fall in an edge zone at any width (including 1684px and wider). Each sits on a bg-page backing that covers the field beneath it (this replaces the SVG hole mask). Test 7 checks it.
9. §5, §9: a build-review compositor check (CDP `Animation` and `LayerTree`: every twinkle on the compositor, including keyframes that read `var(--sf-lo)` / `var(--sf-hi)`; no extra layers from overlap promotion). The animated-element budget now separates the 16 × 16 border box from the 44 × 44 layer of a glowing four-point star at xl. `DURATION` is in seconds, so `element.animate()` gets `× 1000`.
10. §13.2: the streak shot uses `animations: "allow"`.
11. §13.2: every starfield shot uses `fullPage: false`.
12. §7, §14.5: the short-viewport row: at 844 wide the band is 72 + 8, so the sky is 844 × 310 (density 1.4). Test 7 also covers 390 (12px zones).
13. §6.2: the `IntersectionObserver` root margin is a px value computed from the band, rebuilt when the band changes (breakpoint or inset).
14. §16: the stale footer question is removed; the questions answered since are moved to "Resolved".

---

## 1. Purpose and acceptance criteria

Purpose: a calm night sky behind every customer page. It shows only where a page lets it (plain bands), it is there at first paint without JavaScript, it moves so little that you notice it only when you look for it, and it never costs a line of text its contrast or the page a pixel of layout shift. Products stay the focus.

Acceptance criteria (from M1.18, refined):

1. **Layers** (§4): a static field (density per breakpoint, sizes, four-point stars for a few hero stars, dots for the rest), faint constellation lines, a slow opacity-only twinkle, rare falling stars (frequency, angle, length, duration, one at a time, never across the header band, never behind text).
2. **Rendering approach** (§5): one recommendation with the trade-offs. A server-rendered static layer, plus a client island for the animation only.
3. **Motion and runtime** (§6): no GSAP, no ScrollTrigger, no parallax (decided); pauses on hidden tab, covered sky and idle; stops entirely under reduced motion and under the site's motion-off hook; low-power heuristics decided.
4. **Performance budget** (§9): island JS size, main-thread cost, compositor use, no layout shift, no paint storms, and how to measure each in Playwright.
5. **Contrast** (§3): the worst case behind text, computed, and the maximum brightness that keeps text-muted at 4.5:1 or more; zones that keep anything brighter away from text.
6. **Responsive** (§7): density and counts per breakpoint, the header band, landscape phones, very wide screens, the minimum sky.
7. **Forced colours, print, reduced motion, reduced transparency, increased contrast** (§8).
8. **Data and copy** (§11, §12): no data; no copy in the layer; final copy for the dev pages.
9. **Dev preview** `/dev/starfield` and its four sibling pages, and QA screenshots (§13).
10. **Implementation notes** for M1.19 (§14): files, the island boundary, deterministic placement, tests.
11. **IP guardrail** (§15): invented constellation shapes only.

---

## 2. What the visitor sees

```
|<-edge->|<------------------- content column ------------------->|<-edge->|
+---------------------------------------------------------------------------+
|                      header band: no stars at all                         |  --sf-band
+--------+---------------------------------------------------------+--------+
|  *     |   .        .            .      .         .       .      |    ✦   |
|     ✦  |       .         .   ._.         .    .                  |  *     |
|  .     |   .     .  ._./      \.    .            .         .     |     .  |
|        |        .        .         .        .        .            |  *     |
| bright |  dim dust (never brighter than 0.14), faint constellation |  ✦     |
| stars, |  lines, slow twinkle; a rare falling star through empty   |        |
| ✦ motif|  sky only                                                 |  .     |
+--------+---------------------------------------------------------+--------+
```

- The middle of the screen, where words and products sit, holds a **dim dust of small dots** and one to three **faint constellations**. Nothing there is ever brighter than the text-contrast cap (§3.2).
- The two **edge zones** (the page gutters, which never hold text) carry the **brighter stars** and the **four-point star** motif, so the sky frames the content instead of competing with it.
- Now and then a **falling star** crosses an empty stretch of sky. It never crosses text, product images, the header band or a band that hides the sky.
- The sky is visible only through **plain** bands (layout-shell §5.2). Solid, sunken, haze and dusk bands, product cards on bg-raised, the footer and the scrolled header cover it.

---

## 3. Zones and the contrast rule

### 3.1 Zones

All geometry is in CSS, so the server render is correct before any script runs.

| Zone | Where | What may be in it |
|---|---|---|
| **Header band** | the top `--sf-band` of the layer: `calc(var(--header-h) + env(safe-area-inset-top, 0px) + 0.5rem)` | nothing (header.md §8.2, plus 8px of clearance) |
| **Content column** | below the band, between the two edge zones | the dim field, dim constellations (anchored to and clamped inside this column, §4.3), the dim twinkle, falling stars in verified empty sky (§4.5) |
| **Edge zone, start** | below the band, from the viewport's start edge, width `--sf-edge-start` | bright dots, four-point stars, their glows (when wide enough), a bright constellation (when wide enough) |
| **Edge zone, end** | the same at the end edge, width `--sf-edge-end` | the same |

Edge-zone widths (component-scoped custom properties, not new global tokens):

```
--sf-edge-start: calc(max(0px, (100% - var(--container-content) - var(--page-inline-start) - var(--page-inline-end)) / 2) + var(--page-inline-start) - 0.5rem);
--sf-edge-end:   calc(max(0px, (100% - var(--container-content) - var(--page-inline-start) - var(--page-inline-end)) / 2) + var(--page-inline-end) - 0.5rem);
```

That is exactly the space outside the `Container`'s content box (layout-shell §4.2), less **8px of clearance** so a focus ring (2px offset + 2px width) on an element at the content edge never meets a bright star. Resulting widths: 12px at 390, 24px at 768, 32px at 1024, 72px at 1440, 312px at 1920; about 39px in landscape behind a 47px notch inset.

**The header band uses the header's full height, also in short viewports.** header.md §8.2 names `var(--scroll-offset)`, which is `0px` under `@media (max-height: 28rem)`. But there the header is in flow at the top of the page at scroll 0 and is transparent at rest, so stars would sit behind its text. This spec therefore uses `--header-h` plus the top inset at every size: a tightening of header.md §8.2, not a change to it.

**Why the edge zones never hold text:** all text lives inside a `Container` (layout-shell §4.2, §4.4), and the zones are outside its content box by construction. **New requirement for later page and component specs:** over a `plain` band, nothing that carries text may extend outside the `Container`'s content box unless it is opaque (for example a horizontally scrolling row of product cards on bg-raised that bleeds to the screen edge is fine; bare text in that row is not). Two more markup rules for every page, needed by the falling-star check, are in §4.5.

### 3.2 Worst case behind text: the cap

Text on plain bands sits directly over the layer, so every pixel the layer paints in the content column must keep the weakest permitted text, **text-muted**, at **4.5:1** or more (layout-shell §8.2). The lightest colour the layer paints is star-core moon-50 `#FFF8E7` (255, 248, 231). Over bg-page night-900 (11, 15, 36), composited at alpha α (out = bg + α × (fg − bg), rounded at the end; method as accessibility.md §2):

Required: text-muted's L + 0.05 is 0.36957, so the composite's L + 0.05 must be at most 0.36957 / 4.5 = 0.082127, that is **L ≤ 0.032127**.

**α = 0.14 (adopted as the cap):**
- R 11 + 0.14 × 244 = 45.16 → 45; G 15 + 0.14 × 233 = 47.62 → 48; B 36 + 0.14 × 195 = 63.30 → 63. Composite **`#2D303F`**.
- R 45: 0.176471 → 0.231471 / 1.055 = 0.219404 → exp(2.4 × −1.516840) = exp(−3.640416) = 0.026241.
- G 48: 0.029557 (accessibility.md §2.3, the candle halo row).
- B 63: 0.049707 (accessibility.md §2.1, tide-900 B).
- L = 0.2126 × 0.026241 + 0.7152 × 0.029557 + 0.0722 × 0.049707 = 0.005579 + 0.021139 + 0.003589 = **0.030307**. L + 0.05 = **0.080307**.

**α = 0.15 (fails, so 0.14 is the ceiling at two decimals):**
- (11 + 36.60, 15 + 34.95, 36 + 29.25) = (47.60, 49.95, 65.25) → (48, 50, 65).
- G 50: 0.196078 → 0.251078 / 1.055 = 0.237989 → exp(2.4 × −1.435530) = 0.031896. B 65: 0.052860.
- L = 0.2126 × 0.029557 + 0.7152 × 0.031896 + 0.0722 × 0.052860 = 0.006284 + 0.022812 + 0.003816 = 0.032912 > 0.032127. text-muted would be 0.36957 / 0.082912 = 4.457 → **4.45, fails**.

Pairs over the cap composite `#2D303F` (new rows, ratios rounded down):

| Text | Working | Ratio | Verdict (4.5) |
|---|---|---|---|
| text-muted night-300 | 0.36957 / 0.080307 = 4.6020 | **4.60** | pass (was 6.67 on plain bg-page, T12) |
| text-secondary night-200 | 0.62372 / 0.080307 = 7.7667 | **7.76** | pass |
| text-primary moon-100 | 0.915573 / 0.080307 = 11.4009 | **11.40** | pass |
| link gold-300 | 0.68983 / 0.080307 = 8.5899 | **8.58** | pass |
| text-accent gold-400 | 0.55225 / 0.080307 = 6.8767 | **6.87** | pass |

**The other star colours at the same alpha are darker, so the cap holds for all of them:**
- star-gold gold-300 (232, 207, 150) at 0.14 → (41.94, 41.88, 51.96) → (42, 42, 52): lower than `#2D303F` in every channel.
- star-rose rose-200 (233, 195, 213) at 0.14 → (42.08, 40.20, 60.78) → (42, 40, 61): lower in every channel.
- star-violet violet-200 (201, 184, 242) at 0.14 → (37.60, 38.66, 64.84) → (38, 39, 65). B is 2 higher, so computed: R 38 0.019382, G 39 0.020289, B 65 0.052860 → L = 0.004121 + 0.014511 + 0.003816 = **0.022448**, well below 0.030307.
- The constellation line (gold-300 at the token's 35%, drawn at opacity 0.4 on its path, so 0.14 effective) is the star-gold row above.

**The rule (binding for M1.19):**

1. **In the content column, the composite of everything the layer paints at any one pixel is at most moon-50 at 0.14.** That includes a star at its twinkle peak, a constellation line, and antialiasing (partial coverage only lowers the alpha).
2. **Nothing stacks there.** Each dim star is drawn **once**: as a circle in the field SVG or, if it twinkles, as its span, never both (§4.4). Dim stars keep a minimum separation that holds down to the smallest sky they are shown in (§14.3). Each dim constellation sits on an opaque bg-page backing that covers the field beneath it (§4.3), and its lines stop 3px short of its vertex stars (each segment shortened at both ends, §4.3). So no two marks ever overlap, and the single-mark cap is the true worst case.
3. **Anything brighter than the cap lives only in the edge zones** (no text, §3.1), or is a falling star that runs only through verified empty sky and disappears the moment the page scrolls (§4.5).

---

## 4. Layers

### 4.1 The static field (content column, dim)

| Property | Value |
|---|---|
| Shape | round dots: SVG `<circle>` for still stars; a twinkling dim star is its HTML span instead (§4.4), with no circle |
| Radius | 0.5px (60% of stars), 0.75px (30%), 1px (10%). At DPR 3 the smallest is 3 device pixels across, crisp because it is vector. |
| Colour | star-core moon-50 70%, star-violet 15%, star-gold 10%, star-rose 5% |
| Opacity | one of **0.08, 0.10, 0.12, 0.14** per star (quantised, so stars of one colour and level share a `<g>`); never above 0.14 |
| Count | dim stars per breakpoint, §7 (36 at 390, 128 at 1440): of those, the circles are 29 and 102, the twinkle spans 7 and 26 |
| Placement | deterministic, evenly spread (§14.3), positions in % of the sky so the field fills any viewport without JS |
| Minimum sky | hidden, with the dim twinkle and dim constellations, when the sky is under 320 × 120px (§7) |

### 4.2 Edge zones: bright stars and the four-point motif

| Property | Value |
|---|---|
| Bright dots | radius 0.75–1.25px; opacity one of 0.45, 0.60, 0.75, 0.90 (the token range 0.3–0.9, tokens.md §2.3); x 25–75% of the zone width, y 5–95% of the sky; count per side in §7 |
| Four-point stars | the **same four-point star shape as `components/icons`** (header.md §7.3); fill star-gold gold-300; peak opacity 0.85; size **8px at base, 10px at md, 12px at lg and xl**; centred in the zone (x 50%). **The upper star of each side sits at y 6–10% of the sky: start side 6–8%, end side 8–10%**, so the pair doesn't read as symmetric bookends and, at xl, each star and its 44px glow stay clear of the Drift chain (centred at y 30%) in every xl sky. The lower star of a side that has two (end from lg, start from xl) sits in the lower half; count in §7 |
| Starlight glow | `shadow-glow-starlight` (tokens.md §6.2) on a four-point star **only where the zone is at least 56px wide** (xl and wider, via a container query on the zone), so the glow's footprint (the star plus 16px all round, 44 × 44px) stays inside the zone |
| Fit | every edge mark, glow included, lies wholly inside its zone; the zone already ends 8px short of the content edge |

### 4.3 Constellation lines

Invented patterns (§15), drawn as short chains, at fixed pixel size wherever the viewport is. Each is its own small inline `<svg>` with its geometry in px, so it keeps its proportions at every aspect ratio.

| Pattern | Stars (x, y in px from the top-start corner) | Lines | Box |
|---|---|---|---|
| **Wick** | (0,0) (14,12) (34,16) (46,34) (66,38) | 1–2, 2–3, 3–4, 4–5 | 66 × 38 |
| **Ribbon** | (0,0) (14,10) (22,26) (38,34) (56,30) (68,40) | 1–2, 2–3, 3–4, 4–5, 5–6 (a loose S) | 68 × 40 |
| **Sprig** | (0,30) (18,18) (28,0) (40,26) | 1–2, 2–3, 2–4 (one branch) | 40 × 30 |
| **Drift** (edge only) | (6,0) (0,26) (8,52) (2,76) (10,100) | 1–2, 2–3, 3–4, 4–5 (a tall chain for the gutter) | 10 × 100 |

Placement and treatment:

| | Content column (dim) | Edge zone (bright) |
|---|---|---|
| Which | Wick from base; Ribbon from md; Sprig from lg | Drift, centred in each zone at y 30%, **only where the zone is at least 120px wide** (from about 1536px wide) |
| Anchor | **in the content column, not the viewport**: x is a % of the column's width (the space between the two edge zones), y a % of the sky's height. Wick (58%, 62%), Ribbon (12%, 24%), Sprig (74%, 40%). Each is **clamped inside the column**: `left: clamp(0px, <x>%, 100% − <backing width>)`, `top: clamp(0px, <y>%, 100% − <backing height>)`, so it never enters an edge zone at any width (at 1684px and wider a viewport-% anchor would have put Ribbon in the start zone) | centred in the zone |
| Backing | an opaque **bg-page** (`--color-bg-page`, night-900) box: the pattern's box **plus 6px** on every side (Wick 78 × 50, Ribbon 80 × 52, Sprig 52 × 42). It is the same colour as the page behind the layer, so it is invisible, and it covers any field dot or twinkle span beneath it, so nothing stacks with the pattern | none |
| Line | 1px, `stroke: var(--color-constellation)` (gold-300 at 35%), round caps, at opacity 0.4 on the pattern's line `<path>`: **0.14 effective** (at the cap, §3.2) | 1px, the token as is (0.35) |
| Vertex stars | 0.75px radius, moon-50 at 0.12 | 1px radius, moon-50 at 0.6 |
| Gaps | each line stops **3px short** of its vertex stars, so line and star never stack. **No SVG mask:** each segment is shortened at each vertex (its ends pulled in by 3px, plus the 1px line's 0.5px round cap, so the visible gap is 3px), and all of a pattern's segments are drawn as **one `<path>`** (`M…L…` per segment) | the same, for the look |
| Twinkle around it | twinkling stars are not placed under a backing (§14.3), so the twinkle count stays visible; any that a backing still covers at an extreme width is hidden, never stacked | n/a |
| Motion | none: constellations never twinkle or move | none |

"Never behind text blocks?" A fixed layer can't know where text will scroll, so constellations in the content column are kept harmless by the cap, not by placement. Bolder constellation art, where a page spec controls exactly where text sits, belongs in band decoration (hero, brand story), not in this layer.

### 4.4 Twinkle

| Property | Value |
|---|---|
| What | a subset of stars (§7) slowly changes **opacity only**, from `lo` to `hi` and back |
| Values | content column: `hi` = the star's level (≤ 0.14), `lo` = 0.5 × `hi`; edge zones: `hi` = the star's peak, `lo` = 0.6 × `hi`. Only `--sf-hi` is written on the span; **CSS derives `--sf-lo`** from it (§14.2) |
| Period | per star, 3000–6000ms (motion.md §2 `duration-twinkle`, randomised), keyframes `lo` → `hi` (50%) → `lo`, timing `--ease-ambient` per segment, infinite |
| Phase | a negative `animation-delay` between 0 and −period per star, so the sky never pulses in unison |
| Which stars | every four-point star, one bright dot per edge side, and about one dim star in five (never a constellation vertex, never under a constellation's backing) |
| **Drawn once** | a twinkling dim star is rendered **only** as its span. It has **no** `<circle>` in the field SVG: a circle and a span at one position would stack to about 0.26 and drop text-muted to 2.99:1. The same holds for twinkling edge marks (drawn only as their spans) |
| Mechanism | **CSS keyframe animation**, server-rendered with the stars, so it needs no JavaScript and runs on the compositor (§5, checked in §9) |
| Still value | each twinkling star's own `opacity` is the midpoint (`(lo + hi) / 2`, derived in CSS from `--sf-hi`); that is what shows under reduced motion, in the static state and when screenshots disable animations (motion.md §6.1 "at their mid opacity") |

### 4.5 Falling stars

The only particle. Calm means rare: on phones, where text fills most of the width, many visits will see none, which is accepted.

| Property | Value |
|---|---|
| Look | a 2px head and a trail that fades from full colour at the head to transparent at the tail; trail **48px long and 1px thick at base, 72px and 1.5px from md**. **Colour: the star-core token** (`--color-star-core`, moon-50); the head and the trail's gradient stops take it through `color-mix(in srgb, var(--color-star-core) <n>%, transparent)` (no hard-coded rgb) |
| Peak brightness | head at 0.9 opacity (it only ever crosses empty sky) |
| Direction | falls from upper to lower, **15–30° below the horizontal**, leftward or rightward at random |
| Travel | the head moves **120–180px at base, 200–280px from md** |
| Duration | `DURATION.fallingStar` (1.4, motion.md §2). **Every `DURATION` value is in seconds** (GSAP's unit, `lib/motion/tokens.ts`); `element.animate()` takes milliseconds, so pass `DURATION.fallingStar * 1000` |
| Easing | travel linear (`EASE_CSS.linear`, motion.md §3); opacity keyframes 0 → 1 at 15% → 1 at 55% → 0 at 100% |
| Animates | `transform` (a fixed rotation plus a translate along the path) and `opacity` only. The element's own base style is `opacity: 0`, so cancelling its animation hides it in the next frame |
| At most | **one at a time**; **six per page view** (the count resets when the path changes) |
| Timing | the first no earlier than a random **6–12s** after the island starts animating; then a random **10–16s** between launch attempts (stricter than motion.md's "at most one every 8–14s"). The demo modes have their own timing (§13.1) |
| Never launched | unless the state is `animating` (§6.1); within 1000ms after a scroll, wheel or touchmove; while any `dialog` is open; under the increased-contrast preference (§8) |

**Corridor check (how "never behind text" is enforced).** Before a launch, the island picks a random path and tests a corridor around it: the whole path of the head plus the trail behind its start, widened by **12px each side at base, 16px from md**. It samples a **grid of points no more than 8px apart, both along and across the corridor**: five lines (the centre line, both corridor edges and the two lines halfway between, so 6px apart at base and 8px from md), each sampled every 8px or less along its length. That is about 5 × 45 = 225 points for the longest path. The corridor is **open sky** only if every sample passes three checks, **in this order**; the first sample that fails one stops the check and names the reason, which the island writes to the slot as `data-sf-last-skip`:

| Order | Check | Fails when | `data-sf-last-skip` |
|---|---|---|---|
| 1 | **Edge** (pure geometry, no hit test) | the sample lies outside the layer, closer than 16px to a viewport edge, or less than 24px below the header band (the band itself included) | `edge` |
| 2 | **Hit** | `document.elementFromPoint(x, y)` returns `null` (the layer has `pointer-events: none`, so the call otherwise returns what is in front of it) | `null` |
| 3 | **Open sky** | the element returned is anything other than `html`, `body`, `main#main`, a `[data-band="plain"]` section or an element marked `data-open-sky` (the `Container` and plain layout spacers; §14.1). Text elements, images, cards, grids, controls, other bands and the sticky filter bar all block. `Grid` is deliberately not marked, so streaks keep away from product grids | `text` (any blocking element, not only text) |

`data-sf-last-skip` is absent until the first refusal of the page view and keeps the reason of the most recent one; a successful launch leaves it as it is. Up to **3 paths** are tried per attempt, **each path's check in its own task** (the next path is checked in a new task, `setTimeout(…, 0)`); a random path launches in the same task as the check that found it open, and no further path is tried. The demo modes check one fixed path three times, one task each (§13.1). If no path is open, that attempt is skipped and the next is scheduled as usual. The cost is at most about 225 hit tests per task, up to three tasks once every 10–16s; it is measured per task in §9 (every task ≤ 16ms and never a long task; median ≤ 4ms).

**Two markup rules the check depends on (binding for M1.19 and every later page and component spec).** `elementFromPoint` skips any element with `pointer-events: none`, and a hit on a bare text node returns that node's parent element. So:

1. **No bare text directly inside `main`, a plain section (`[data-band="plain"]`) or a `[data-open-sky]` element.** Every non-whitespace text node there is wrapped in its own element (`p`, `h2`, `span`, `a` …), so a hit on it returns an element that blocks.
2. **No `pointer-events: none` on text, images or cards** (or on any of their ancestors inside `main`), so they are never skipped by the hit test.

Test 17 (§14.5) checks both on every route the e2e suite visits.

**During flight.** The streak is **cancelled at once**: its animation is cancelled and its opacity set to 0 in the same task as the event, so the next frame no longer shows it; then the element is removed. No fade. This happens when:

- the page scrolls (`scroll`, `wheel` or `touchmove`);
- a `pointerdown` or `keydown` arrives;
- the pathname changes (the island's `onRouteChange()`);
- `main` changes. A `ResizeObserver` and a `MutationObserver` on `main` are connected **only while a streak is in flight** (about 1.4s) and disconnected when it ends:
  - **`ResizeObserver`:** at launch the island records main's border-box size (`getBoundingClientRect()` width and height). `observe()` always delivers an initial notification right away, which reports that same size; so a callback cancels the streak **only if a reported border-box size (`borderBoxSize[0]`, inline and block) differs from the recorded one by more than 0.5px** in either dimension. The initial notification therefore never cancels, and a real reflow of `main` does.
  - **`MutationObserver`** (`childList`, `subtree`, `characterData`, and `attributes` filtered to `class`, `style`, `hidden` and `open`): any record cancels the streak. It also catches a client navigation's DOM swap before it paints. **It never fires on the island's own writes:** the streak element is appended to the slot `[data-starfield]`, and the island writes its data attributes on the slot; the slot is a direct child of `<body>` and a sibling of `main` (layout-shell §2.1), so neither is in main's subtree. The motion module writes nothing inside `main`, ever;
- the viewport resizes (`resize` on `window`, which has no initial notification), the tab is hidden, a dialog opens, or the state leaves `animating`.

Content can't slide or appear under it unnoticed. A streak that meets none of these runs to its natural end (`finished`), and is then removed (test 12).

---

## 5. Rendering approach

**Decision: server-rendered inline SVG for the static sky, tiny HTML elements with CSS keyframes for the twinkle, and a small lazy client module (WAAPI) for the falling star only.** No canvas.

| Option | First paint without JS | Crisp at DPR 3 | Memory | Per-frame cost | CLS / LCP | Verdict |
|---|---|---|---|---|---|---|
| **Inline SVG (server-rendered)** | yes | yes (vector) | the fixed layer's raster only, painted once | none while static | none; vector shapes aren't LCP candidates (layout-shell §8.3) | **chosen for the static sky** |
| CSS only (box-shadow dots, radial gradients) | yes | box-shadows at px offsets, so no % positioning: needs one rule set per breakpoint and can't follow the viewport's shape | as SVG | animating any of it repaints the whole layer (box-shadow and gradients aren't compositor properties) | a viewport-sized gradient background can be measured as an image | rejected |
| One `<canvas>` | **no**: blank until JS runs | only if the backing store is DPR × size: about 1170 × 2532 × 4 bytes = **11.8MB** at 390 on a DPR 3 phone, 5.3MB capped at DPR 2 | high | every twinkle frame redraws on the main thread (or needs OffscreenCanvas and a worker) | none, but stars arrive late | rejected |

Why the twinkle is HTML, not SVG: opacity animations on SVG child elements (`<circle>`) are not composited, so each frame would repaint the SVG. A small absolutely positioned `<span>` animating only `opacity` is promoted to its own compositor layer by the browser while it animates, so the twinkle costs **no main-thread work and no paint per frame**. With at most 32 such spans, each a few pixels square (the four glowing four-point stars at xl at most 44 × 44px with their glow), layer memory is negligible. The build review confirms the compositing in the browser (§9, compositor row), including for keyframes that read `var(--sf-lo)` / `var(--sf-hi)`; if those are not composited, the keyframes become one literal `@keyframes` rule per opacity level (§9).

Why WAAPI and not GSAP for the falling star: it is one element, two properties, a fixed duration, and no scroll link. `element.animate()` runs `transform` and `opacity` on the compositor, needs no library, and takes its values from `DURATION`, `EASE_CSS` and `REDUCED` in `lib/motion/tokens.ts` (which already exports `EASE_CSS` "for a WAAPI animation"; `DURATION` is in seconds, so multiply by 1000 for `animate()`). GSAP would add about 25KB gzipped to a chunk on every page for nothing it needs. TASKS.md M1.19 now reads "GSAP allowed but not required"; this spec uses none.

---

## 6. Motion and runtime behaviour

### 6.1 States (`data-starfield-state` on the slot)

| State | When | Twinkle (CSS) | Falling stars |
|---|---|---|---|
| *(attribute absent)* | before the island has loaded, or no JS | runs if motion is allowed (pure CSS) and `html` doesn't carry `data-motion="off"` | none |
| `animating` | motion allowed, tab visible, a plain band in view, input within the last 60s | runs | scheduled (§4.5) |
| `paused` | the tab is hidden, **or** no `[data-band="plain"]` element intersects the viewport below the header band (the sky is fully covered), **or** 60s have passed with no scroll, pointer, touch or key input | `animation-play-state: paused` (stars hold where they are) | timer cleared; a streak in flight is cancelled at once (§4.5) |
| `static` | `prefers-reduced-motion: reduce`, **or** `forced-colors: active`, **or** `prefers-contrast: more`, **or** **`html[data-motion="off"]`** (the hook for the site-wide "Pause animations" control, M8.8b; §10), **or** the still preview page `/dev/starfield/still` (§13) | `animation: none` (each star at its still value) | none |

Precedence: `static` over `paused` over `animating`. Leaving `paused` never fires a burst of missed streaks: the next attempt is scheduled afresh.

**`html[data-motion="off"]` (exposed by M1.19, set by M8.8b).** CSS applies it before any script: `html[data-motion="off"] [data-starfield] [data-sf-tw] { animation: none }`. The island also treats it as `static`, and follows changes to it (adding or removing the attribute takes effect at once, without a reload). Nothing in M1.19 sets the attribute except tests; M8.8b adds the control and its persistence.

### 6.2 Triggers the island listens to

- `document.visibilitychange` (hidden → `paused`; visible → re-evaluate). This is the "offscreen" signal for a fixed layer; an `IntersectionObserver` on the layer itself would always report it visible.
- An `IntersectionObserver` on every `[data-band="plain"]` section, trimmed by the header band. **`rootMargin` accepts only px or %**, so the island measures the band in px (the top of `[data-sf-sky]` relative to the slot, which includes the safe-area inset) and builds the observer with `rootMargin: "-<band>px 0px 0px 0px"`. It **rebuilds** the observer whenever the measured band changes: checked on `matchMedia` changes of the md, lg and xl breakpoints and of `(max-height: 28rem)` (each changes `--header-h` or the tier), and on a `ResizeObserver` on `[data-sf-sky]` (its height is `100lvh` minus the band, so it fires when the inset, the text size or the large viewport changes; not during scroll). That observer's initial notification only re-measures the band and finds it unchanged, so it rebuilds nothing. Re-observed when the path changes (the layout, and so the island, persists across navigations).
- `matchMedia` listeners for `(prefers-reduced-motion: reduce)`, `(forced-colors: active)` and `(prefers-contrast: more)`, so changing the OS setting takes effect without a reload (motion.md §6.3).
- A `MutationObserver` on `document.documentElement` with `attributeFilter: ["data-motion"]` (§6.1).
- Passive `scroll`, `wheel`, `touchmove`, `pointerdown`, `keydown` listeners on `window`. They record a timestamp (idle timer, launch delay) and cancel a streak in flight (§4.5).
- `pageshow` with `persisted` (back/forward cache): re-evaluate the state.

### 6.3 Decisions

- **No scroll parallax and no drift.** Any vertical movement of the field would carry stars into the star-free header band (or make them pop at its edge if clipped), would move the bright edge stars, and would add work tied to scrolling. A calm sky that stays still while the page moves also reads as distance. `duration-drift` stays unused here; a band decoration may use it under its own spec.
- **No GSAP, no ScrollTrigger** in the starfield (§5).
- **Reduced motion:** the static field only. No twinkle (the CSS animation is declared only inside `@media (prefers-reduced-motion: no-preference)`, and `static` sets `animation: none`), no falling stars, no fades. Switching to reduce mid-streak removes the streak at once.
- **Battery and low-power heuristics: none beyond the pauses.** The always-on cost is at most 32 tiny compositor opacity animations; the idle pause (60s without input), the covered pause and the hidden-tab pause stop even those when nobody is looking. Considered and rejected: `prefers-reduced-data` (not shipped in any stable browser), `navigator.deviceMemory` and `hardwareConcurrency` (Chromium-only, a fingerprinting surface, and the cost is already tiny), the Battery Status API (Chromium-only). iOS Low Power Mode already throttles animation frame rates.

---

## 7. Responsive

Counts are per tier; each tier adds stars to the one below (the generator's evenly spread order means any prefix is evenly spread too, §14.3).

| | base (390, from 320) | md (768) | lg (1024) | xl (1440) | short viewport (`max-height: 28rem`) |
|---|---|---|---|---|---|
| Dim stars (content column and under the edges) | 36 | 72 | 96 | 128 | 36 (base tier only, whatever the width) |
| of which circles + twinkle spans | 29 + 7 | 58 + 14 | 77 + 19 | 102 + 26 | 29 + 7 |
| Density, sky area at the reference size | 390 × 772 → 1.2 per 10,000px² | 768 × 944 → 1.0 | 1024 × 688 → 1.4 | 1440 × 812 → 1.1 | 844 × 310 → 1.4 (the band at 844 wide is 72 + 8 = 80px, so the sky of an 844 × 390 screen is 310px) |
| Dim constellations | Wick | + Ribbon | + Sprig | 3 | Wick |
| Edge zone width | 12px | 24px | 32px | 72px (312px at 1920) | 24px at 844 (about 39px behind a notch) |
| Bright dots per side | 3 | 4 | 5 | 6 | 3 |
| Four-point stars (total; size) | 2 (one per side, the upper ones: start y 6–8%, end y 8–10%; 8px) | 2 (10px) | 3 (two at the end, one at the start; 12px) | 4 (two per side; 12px) | 2 (8px) |
| Starlight glow on four-point stars | no | no | no | yes (zone ≥ 56px) | no |
| Edge constellation (Drift) | no | no | no | from about 1536px wide (zone ≥ 120px) | no |
| Twinkling stars (dim + edge) | 7 + 4 = **11** | 14 + 4 = **18** | 19 + 5 = **24** | 26 + 6 = **32** | 11 |
| Falling star travel / trail | 120–180px / 48px | 200–280px / 72px | as md | as md | as base |
| True minimum sky for the tier (§14.3) | **320 × 120** (the floor below) | 768 × 368 | 1024 × 368 | 1440 × 360 | 320 × 120 |

- **The header band** is star-free at every size (§3.1), including short viewports.
- **Minimum sky: content-column marks are hidden below 320 × 120px.** The sky wrapper is a size container (`container: sf-sky / size`); `@container sf-sky (width < 320px) or (height < 120px)` hides everything marked `data-sf-dim` (the field SVG, the one wrapper holding the dim twinkle spans, and the dim constellations). The edge zones stay. At 400% zoom on a 1280 × 800 window (320 × 200, band 72) the sky is 320 × 128, so the dim sky still shows there; on a shorter window it is simply plain bg-page, which is the safe fallback. Because no dim mark is ever drawn in a sky smaller than 320 × 120, that is the size at which separation and the twinkle exclusion are evaluated for the base tier (§14.3). Tiers above base are hidden under the short-viewport query, so they only appear in skies at least 449px tall minus their band: their true minima are in the last row.
- **Landscape phones** (`max-height: 28rem`, the only height query in the system, tokens.md §9.1): only the base tier shows, so a 844 × 390 screen isn't packed with the md count; the edge zones widen to the notch inset, and stars there may sit under the notch (decoration may extend under the insets, layout-shell §6.4).
- **Very wide screens:** the content column caps at 1280px, so above 1440 the edge zones widen and carry the glow and the Drift constellation. Field density thins a little above 1920; that is accepted (calm). Dim constellations are anchored to the content column (§4.3), so they stay in the middle however wide the screen is.
- **320px:** the dim constellations are clamped inside the content column (§4.3), so they never reach an edge zone at any width.

---

## 8. Forced colours, print, preferences

| Condition | Behaviour |
|---|---|
| `forced-colors: active` | the whole slot is `display: none` through the existing `[data-decorative]` rule (accessibility.md §5); the island also goes `static`, so it schedules nothing |
| Print | hidden through `[data-decorative]` (layout-shell §9.6) |
| `prefers-reduced-motion: reduce` | static field only (§6.3) |
| `html[data-motion="off"]` (the site's own motion switch, M8.8b) | static field only, the same as reduced motion (§6.1) |
| `prefers-contrast: more` | **stricter than the system:** the content-column field, dim twinkle and dim constellations (`data-sf-dim`) are hidden, so text sits on plain bg-page (text-muted back to 6.67, T12); the edge zones stay, still; no falling stars; state `static` |
| `prefers-reduced-transparency: reduce` | **no change.** The layer isn't a translucent surface over content; it sits behind opaque-looking content, and the site has no translucent surfaces for it to show through (the header is opaque when anything is under it, layout-shell §6.2). |
| No JavaScript | the full static sky and the CSS twinkle (when motion is allowed); no falling stars; no attribute on the slot |

---

## 9. Performance budget and how to measure it

| Budget | Value | How the build review measures it (Playwright, Chromium) |
|---|---|---|
| Static markup | the slot's server HTML **≤ 16KB raw and ≤ 5KB gzipped**. The sky's static markup ships as **one pre-built string**, so the RSC payload carries it once as a single string: a first load costs **the markup + one string copy** (each about the markup's size, ≈ 2.6KB gzipped as measured); client navigations don't resend the layout | `outerHTML` of `[data-starfield]` on `/` at 1440 (the largest tier), gzipped in the test with Node's `zlib` |
| Island JS | loader component in the shared bundle **≤ 0.6KB gzipped**; the lazy motion chunk **≤ 3KB gzipped**; **no dependencies** (imports only `lib/motion/tokens.ts`) | capture the JS responses on `/` after idle; the chunk whose body contains the literal `data-starfield-state` is the motion chunk; gzip and compare. The loader is checked the same way against its own marker. |
| Load timing | the motion chunk is requested only after `load` and an idle callback (`requestIdleCallback` with a 2000ms timeout; `setTimeout(…, 1500)` where it doesn't exist, as in Safari) | the chunk's request starts after the `load` event |
| Main thread per frame | **0**: no `requestAnimationFrame` loop anywhere; twinkle and streak run on the compositor | CDP `Performance.getMetrics` before and after 10s on `/dev/starfield/no-streak`: `ScriptDuration` grows by **≤ 20ms**, `LayoutCount` by **0** |
| Per launch attempt | **Each path's corridor check runs in its own task** (at most about 225 hit tests per task; up to 3 tasks per attempt). **Every task ≤ 16ms (under one frame) and never a long task**, unthrottled, in both projects; **median ≤ 4ms** per task in a serial run | The motion module checks one path per task (the next path in a new task, `setTimeout(…, 0)`) and wraps each task (its corridor check, up to the launch or the skip) in `performance.mark("sf-attempt-start")` and `performance.measure("sf-attempt", "sf-attempt-start")`, so each `sf-attempt` entry is one task. A random path launches in the task whose check finds it open. **In the demo modes each attempt checks its fixed path three times, one task each** (the worst case: three fully sampled corridors), and launches only if none of the three refused, in the same task as the third check (§13.1). Test over 12s from `animating` on `/dev/starfield/streak-demo` (4 attempts, 12 tasks), **unthrottled in both projects** (both projects run Chromium; mobile-390 emulates the viewport, not the CPU): every `sf-attempt` duration (`performance.getEntriesByName("sf-attempt")`) is **≤ 16ms**, and a `PerformanceObserver` for `longtask` records **no entry overlapping an attempt**; in the serial review run (`--workers=1`) the **median is ≤ 4ms**. The test is `@perf`-tagged and runs in the serial pass (`npm run test:e2e` does a parallel pass and then a serial @perf pass; see M1.20b). Parallel runs assert only the 16ms and long-task budgets (on a shared machine a 4ms bound is not stable). **4× CPU throttling** (CDP `Emulation.setCPUThrottlingRate({ rate: 4 })`): the figures are **reported in the build review, not asserted** (the throttle is not linear for this workload: `elementFromPoint` slows about 15× under it). **Why the five-line, 8px grid stays** instead of three lines: three lines across a 24–32px corridor are 12–16px apart, wide enough for a small inline element (a 12px icon, a short price or badge) to fall between them unseen, and the measured cost of the full grid is already a fraction of a frame |
| Paint | **no paint storms**: twinkle and streak repaint nothing after they start | `browser.startTracing(page, { categories: ["devtools.timeline"] })` over 5s on `/dev/starfield/no-streak`: **≤ 2** `Paint` events in that window |
| **Compositor** | every twinkle animation runs on the compositor, **including keyframes that read `var(--sf-lo)` / `var(--sf-hi)`**; animating promotes **no content per span** (no overlap layer that grows with the number of twinkle spans) | CDP session on `/dev/starfield/no-streak` at 390 and 1440, state `animating`: `Animation.enable` and collect the `animationStarted` events for the slot's twinkle animations; `LayerTree.enable`, then `LayerTree.compositingReasons` for each layer. **Per span (the binding check):** every twinkle span has its own layer whose reasons include `activeOpacityAnimation`. **Overlap:** in `animating`, at most one layer for `main` and one for the header report `overlap` or `assumedOverlap` that they didn't in `static`; no other layer outside the slot does. **Totals:** count the layers, set `html[data-motion="off"]` (state `static`), count again: **animating − static ≤ 32 + 2** (the spans, plus the one overlap layer each allowed for `main` and the header), and **(animating − static) − spans ≤ 2 at both 390 (11 spans) and 1440 (32 spans)**, so the extra layers don't grow with the span count. If the `var()` keyframes are not composited, the fix is one literal `@keyframes` rule per opacity level (4 dim levels + 5 edge levels = 9 rules), which the quantised levels allow, and the check is run again |
| Animated elements | **≤ 32** twinkle elements, each with a **border box ≤ 16 × 16 CSS px** (dots 1–2px, four-point stars 8–12px). Their composited layer is the border box plus visual overflow: ≤ 16 × 16 for every element **except** the at most 4 glowing four-point stars at xl, whose layer includes the starlight glow (12px + 16px each side = **44 × 44 CSS px**). The streak's border box ≤ 90 × 4 CSS px | count `document.getAnimations()` targets inside the slot; check each target's `getBoundingClientRect()`; the layer sizes come from the `LayerTree` snapshot above |
| CLS | **0** from the layer | `layout-shift` entries whose sources are inside `[data-starfield]`: none |
| LCP | the LCP element is **never** inside the layer | `largest-contentful-paint` entry's element is not inside `[data-starfield]`, at 390 and 1440 |
| No extra full-viewport layers | no `will-change` on the slot, the sky wrapper or the SVG; the fixed slot's own raster is painted once | code review, plus the layer difference above |

The DPR cap that layout-shell §8.3 asks M1.18 to set is **not applicable**: there is no canvas, the SVG is vector, and the twinkle spans are rasterised by the compositor at the device scale.

---

## 10. Accessibility

- The slot is `aria-hidden="true"`, `pointer-events: none`, `data-decorative`; nothing inside is focusable or announced. All inner SVGs carry `aria-hidden="true"` and `focusable="false"` as well.
- **Contrast:** §3.2. Text-muted keeps 4.60:1 at the worst pixel in the content column; text-secondary 7.76, text-primary 11.40, gold-300 links 8.58, gold-400 accents 6.87. Anything brighter is in the text-free edge zones or in verified empty sky.
- **Particles never over text or product images** (accessibility.md §7): the layer is below all content in z order, and the corridor check (with its two markup rules, §4.5) keeps falling stars away from text, images, cards and grids.
- **Vestibular safety:** the only movement is a small streak, rare, never more than one, never tied to scrolling, removed under reduced motion.
- **WCAG 2.2.2 (Pause, Stop, Hide): a persistent site-wide "Pause animations" control is required before public launch.** The twinkle starts automatically, runs alongside content and lasts more than 5 seconds, so the reduced-motion preference and the 60s idle pause are not enough on their own. The control is scheduled as **TASKS.md M8.8b** (required before launch). **M1.19 exposes the hook now:** `html[data-motion="off"]` puts the starfield in `static` (no twinkle, no falling stars) from CSS before any script runs, and the island follows changes to it (§6.1). M8.8b adds the visible control, its copy and its persistence, and sets that attribute.

---

## 11. Copy

The layer has **no copy** (it is `aria-hidden`, and its SVGs have no `<title>`).

Dev preview pages (`/dev/starfield` and its four siblings, dev-only, all with the same content), final. Strings in the order they appear on the page (§13.1):

| Where | String |
|---|---|
| *(first: the empty demo spacer, no text)* | |
| Caption directly below the spacer (text-muted; `data-sf-demo="text"`) | **In the demo, falling stars cross the empty space above.** |
| `<h1>` | **Starfield preview** |
| Intro (text-secondary) | **The night sky behind every page. Sample text sits over it so you can check that the stars stay faint behind words.** |
| Preview modes, `<h2>` | **Preview modes** |
| Link to `/dev/starfield` | **Live sky** |
| Link to `/dev/starfield/still` | **Still frame** |
| Link to `/dev/starfield/no-streak` | **No falling stars** |
| Link to `/dev/starfield/streak-demo` | **A falling star every few seconds** |
| Link to `/dev/starfield/streak-blocked` | **A falling star aimed at text (it should be refused)** |
| Open-sky section, `<h2>` | **Text over the open sky** |
| Open-sky paragraph (text-secondary) | **Stars stay faint in the middle of the page, where words and products sit. The brighter stars keep to the edges.** |
| Caption (text-muted) | **This caption uses the faintest text colour allowed over the sky.** |
| Solid band, `<h2>` | **A solid band hides the sky** |
| Solid band paragraph | **Dense content such as checkout sits on solid ground, so no stars show behind it.** |
| Haze band, `<h2>` | **A haze band hides it too** |
| Haze band paragraph | **Haze lives in its own bands, never in the sky layer.** |
| Filler section, `<h2>` | **Scroll to check that the sky stays still** |
| Filler paragraph | **The stars are fixed to the screen. Only the page moves.** |

Page titles (`<title>`, one per page, set in each page's `generateMetadata`, §13.1; the middle dot is U+00B7 with a space on each side, as layout-shell §11):

| Page | Title |
|---|---|
| `/dev/starfield` | **Starfield preview · Starflames** |
| `/dev/starfield/still` | **Starfield preview, still frame · Starflames** |
| `/dev/starfield/no-streak` | **Starfield preview, no falling stars · Starflames** |
| `/dev/starfield/streak-demo` | **Starfield preview, falling star demo · Starflames** |
| `/dev/starfield/streak-blocked` | **Starfield preview, refused falling star · Starflames** |

The mode links are plain `<a href>` elements (not `next/link`), so each mode starts a fresh page view with a fresh island. The current page's link carries `aria-current="page"`.

Contrast on the dev pages: the same pairs as any plain, solid or haze band (layout-shell §5.3 table); over the sky, §3.2.

## 12. Data needs and images

- **Data: none.** No Firestore, no props from data. The only inputs are the constant preview props of the dev pages (§13.1).
- **Images: none.** No raster image, no CSS `background-image` with a URL. The trail gradient on the streak is a CSS gradient on a tiny element, not an image; its colour stops come from `--color-star-core` through `color-mix()` (§4.5).

---

## 13. Dev preview and QA screenshots

### 13.1 The five preview pages

- Each page calls `requireDevPages()` (`app/dev/gate.ts`) at its top, like `/dev/tokens`, so none exists in a plain production build. **Each also exports a `generateMetadata()` that calls `requireDevPages()` first and then returns its title from §11** (the pattern of `app/dev/tokens/page.tsx`; `gate.ts` asks for the call in both, because Next renders a layout and its page in parallel). They read **no `searchParams`**, so they stay static and the gate runs once at build time.
- Each renders `<SiteShell>` around the shared content (the opt-in in layout-shell §13.2), so the real slot, the header band and the footer are present, and passes **a constant `starfieldPreview` prop**:

| Path | File | `starfieldPreview` | What it shows |
|---|---|---|---|
| `/dev/starfield` | `app/dev/starfield/page.tsx` | `{}` | the live sky, as on any customer page |
| `/dev/starfield/still` | `app/dev/starfield/still/page.tsx` | `{ still: true }` | the still frame: the slot is server-rendered with `data-starfield-state="static"` and the island keeps it so |
| `/dev/starfield/no-streak` | `app/dev/starfield/no-streak/page.tsx` | `{ streak: "off" }` | twinkle and pauses as normal; no falling stars |
| `/dev/starfield/streak-demo` | `app/dev/starfield/streak-demo/page.tsx` | `{ streak: "demo" }` | the streak demo below |
| `/dev/starfield/streak-blocked` | `app/dev/starfield/streak-blocked/page.tsx` | `{ streak: "demo-blocked" }` | the refused-streak demo below |

- Shared content lives in one Server Component, `app/dev/starfield/StarfieldPreviewPage.tsx` (name tech-agent's call), which each page renders. Content, top to bottom:
  1. a `plain` band (the first section in `main`, so its content starts `--section-y` below the header, layout-shell §5.1) whose `Container` holds, **first**, the empty demo spacer `<div data-open-sky data-sf-demo="open">`, **`height: 320px` at base and `360px` from md** (fixed px, not `vh` or rem, so §13.3's geometry holds), full content width, no children, `margin-block-end` step 4 (16px); then the caption (`data-sf-demo="text"`, §11), then 48px (step 12), the h1, the intro, the mode links and the open-sky text (§11);
  2. a `solid` band with **`min-height: 100lvh` (`min-h-lvh`)**, set on this preview page only (the shared `Section` is unchanged), so there is a scroll position where the solid and haze bands together cover the whole sky and no plain band is in view (test 11); 3. a `haze` band; 4. a `plain` filler band at least 1500px tall.
- **`app/dev/dev.css`:** `app/globals.css` skips `./dev`, and a directory source in `dev.css` would be overridden by that `not`, so each file is listed one by one: `@source "./starfield/page.tsx"; @source "./starfield/still/page.tsx"; @source "./starfield/no-streak/page.tsx"; @source "./starfield/streak-demo/page.tsx"; @source "./starfield/streak-blocked/page.tsx"; @source "./starfield/StarfieldPreviewPage.tsx";`.
- **Demo modes.** Both use one **fixed path** (§13.3), the same at every attempt. Each attempt checks it **three times, each check in its own task** (the §9 measurement). A `refused` flag carried through the three tasks records any refusal: **the attempt launches only if none of the three checks refused**, and the launch happens **in the same task as the third (deciding) check**, so nothing can change between that check and the launch. Each refusal writes `data-sf-last-skip` as usual (§4.5).
  - **Timing:** the **first attempt fires as soon as the state becomes `animating`** (no 6–12s first delay), then one attempt every **3s**. The demo ignores the interval, idle (60s) and per-page limits, but **not** the corridor check, the one-at-a-time rule, the 1000ms scroll lockout, the dialog rule or the state rules. With load plus idle at most about 2s before `animating`, the first launch is about 2s after `load`; test 12's 4s window counts from `animating`, not from navigation.
  - `streak: "demo"`: the path is the §13.3 path inside `[data-sf-demo="open"]`; its corridor is open sky, so every attempt launches.
  - `streak: "demo-blocked"`: the same path vector, started on the caption `[data-sf-demo="text"]` (§13.3); its whole corridor passes the edge check, so the corridor check must refuse it with **`text`**.
- **What the island records on the slot** (all modes, not only the demos): `data-sf-streaks="<n>"`, the number launched this page view, set to `"0"` when the island starts and incremented at each launch; `data-sf-last-skip`, absent until the first refusal, then `text`, `edge` or `null` (§4.5). The streak element carries `data-sf-streak` (§14.2).

### 13.2 Screenshots (M1.20 harness)

**`captureRoute` gains `name`, `fullPage` and `animations` options (tech, M1.13)** in `tests/e2e/support/screenshot.ts`: `name` replaces `routeSlug(route)` in the file name (`<name>-<project>.png`), so several shots of one route don't overwrite each other; `fullPage` (default `true`, as today) and `animations` (default `"disabled"`, as today) are passed to `page.screenshot`.

**Every starfield shot uses `fullPage: false`.** The layer is `position: fixed` and sized in `lvh`; a full-page capture can resize the viewport to the page height, which stretches the sky and moves every %-placed star. The viewport-sized shot shows what a visitor sees. (Full-page shots of other routes, such as `/`, may show the layer distorted in the same way; QA judges the sky only from the shots below.)

| Shot (file name before `-<project>`) | Viewport(s) | How |
|---|---|---|
| `dev-starfield-still` | 390 and 1440 (both projects and their reduced-motion twins) | `/dev/starfield/still`, `fullPage: false`, animations disabled (the default). Added to the screenshot routes (an entry with options, or its own `@motion` test); the twins must match (both are the still frame) |
| `dev-starfield-landscape` | 844 × 390 (`page.setViewportSize`, in the `mobile-390` project) | `/dev/starfield/still`, `name: "dev-starfield-landscape"`, `fullPage: false`: base tier only, sky 310px tall (no notch is emulated, so each edge zone is the md gutter less 8px: 24px) |
| `dev-starfield-wide` | 1920 × 1080 (in the `desktop-1440` project) | `/dev/starfield/still`, `name: "dev-starfield-wide"`, `fullPage: false`: glows and the Drift constellation in the edges |
| `dev-starfield-streak` | 390 and 1440 | `/dev/starfield/streak-demo` at scroll 0 (the spacer is in view, §13.3), `name: "dev-starfield-streak"`, `fullPage: false`, **`animations: "allow"`** (`"disabled"` would fast-forward the finite WAAPI streak to its end, where it is invisible). In one task, find the one running streak, then pause every animation in the slot (`getAnimations()`), set the streak's `currentTime` to 700 and each twinkle's `currentTime` to 0, so the shot is repeatable |
| `dev-starfield-forced-colors` | 390 | `/dev/starfield/still`, `name: "dev-starfield-forced-colors"`, `fullPage: false`, after `page.emulateMedia({ forcedColors: "active" })`: no stars at all |

**All other screenshots of `(site)` routes**, including the existing `/` entries, keep `animations: "disabled"` (the default) so the twinkle can't make them flaky (infinite CSS animations are cancelled, which leaves every star at its still value).

### 13.3 Demo geometry

**The path, relative to the spacer's top-start corner** (x toward the inline end, y down; the head travels toward the inline end and down). Direction vector d = (cos 20°, sin 20°) = (0.9397, 0.3420); corridor normal n = (−0.3420, 0.9397).

| | base (390) | from md (1440 shown) |
|---|---|---|
| Angle | 20° below the horizontal (rule: 15–30°) | 20° |
| Travel (head) | 160px (rule: 120–180) | 240px (rule: 200–280) |
| Trail T / corridor half-width W | 48 / 12 | 72 / 16 |
| Required start inset | x ≥ T + W + 16 = **76**; y ≥ 24 | x ≥ 72 + 16 + 16 = **104**; y ≥ 24 |
| **Start** (head at t = 0) | **(76, 56)** | **(104, 64)** |
| Trail tail at start (start − T·d) | (30.9, 39.6) | (36.3, 39.4) |
| **End** (head at t = 1, start + travel·d) | **(226.4, 110.7)** | **(329.5, 146.1)** |
| Corridor box (tail to end, ± W·n) | x 26.8 → 230.5, y 28.3 → 122.0 | x 30.9 → 335.0, y 24.3 → 161.1 |
| Spacer (content width × height) | 350 × 320 | 1280 × 360 |
| Clearance inside the spacer (start / top / end / bottom) | 26.8 / 28.3 / 119.5 / 198.0 | 30.9 / 24.3 / 945.0 / 198.9 |

**In the viewport at scroll 0** (no safe-area insets; header in flow at the top; the plain band's top padding is `--section-y`):

| | 390 × 844 | 1440 × 900 |
|---|---|---|
| Header / header band bottom (`--sf-band`) | 64 / **72** | 80 / **88** |
| Spacer box (x, y → x, y) | (20, 128) → (370, 448): fully in view | (80, 208) → (1360, 568): fully in view |
| Path start → end | (96, 184) → (246.4, 238.7) | (184, 272) → (409.5, 354.1) |
| Trail tail at start | (50.9, 167.6) | (116.3, 247.4) |
| Corridor box | x 46.8 → 250.5, y 156.3 → 250.0 | x 110.9 → 415.0, y 232.3 → 369.1 |
| To the viewport start / end edge (rule ≥ 16) | 46.8 / 139.5 | 110.9 / 1025.0 |
| Below the header band (rule ≥ 24) | 84.3 | 144.3 |
| To the viewport bottom | 594.0 | 530.9 |
| To the start edge zone (12px / 72px wide) | 34.8 | 38.9 |
| To the caption below the spacer (top at 464 / 584) | 214.0 | 214.9 |
| Neighbours above and beside | above: the band's empty top padding (the plain section, open sky), then the header band; beside: none inside the band (the spacer is the full content width), then the edge zones | the same |

Every sample therefore lands on the spacer (`data-open-sky`), passes the edge check and hits an open-sky element: the demo launches. At 768 and 1024 the md numbers apply in a 704- or 944px-wide spacer, with more room at the end.

**`/dev/starfield/streak-blocked`:** the same vector, with the **start 8px below the caption's top-start corner, inset 76px (base) / 104px (md) along the inline axis**: start = (caption left + 76 or 104, caption top + 8). The caption is a block `<p>` spanning the content width, so the start sample is inside its box at any line height of 16px or more.

| | 390 × 844 | 1440 × 900 |
|---|---|---|
| Caption top (spacer bottom + 16) | 464 | 584 |
| Path start → end | (96, 472) → (246.4, 526.7) | (184, 592) → (409.5, 674.1) |
| Corridor box | x 46.8 → 250.5, y 444.3 → 538.0 | x 110.9 → 415.0, y 552.3 → 689.1 |
| Edge check | passes everywhere: ≥ 46.8 from the side edges, ≥ 372 below the band, ≥ 306 above the bottom (rule 16) | passes: ≥ 110.9 from the sides, ≥ 464 below the band, ≥ 210 above the bottom |
| What blocks | the caption `<p>` (at the start sample and along the head's path), then the h1 below it | the same |

No sample fails the edge check and none returns `null` (every sample is inside the viewport), so the first failure is always check 3: the refusal is **`text`**. Test 12 asserts the preconditions (the spacer's box is fully inside the viewport and its top is at least 24px below the header band; the caption's top is in view) before it asserts the outcomes, so a change in the page above the spacer fails loudly rather than silently testing `edge`.

---

## 14. Implementation notes for tech-agent (M1.19)

### 14.1 Files (names are tech-agent's call)

| File | Kind | Holds |
|---|---|---|
| `components/starfield/starfield-data.ts` | pure module (no DOM, no React, **no `server-only` import**, so tests can import it in Node) | the seed, the RNG, the evenly spread sequence, tier counts (§7), star attributes (§4), which dim stars twinkle (and so are spans, not circles), the four constellation patterns and their column anchors (§4.3), the edge-zone and content-column geometry as a function of viewport width (mirroring §3.1 and §4.3, no insets, for the tests), and a `buildStarfield()` that returns plain data |
| `components/starfield/StarfieldLayer.tsx` | Server (`import "server-only"`) | renders the sky from `buildStarfield()` (computed once at module scope): the sky wrapper below the header band, the field SVG (grouped circles of the **non-twinkling** dim stars only), the twinkle spans, the content-column wrapper with the dim constellations on their backings, the two edge zones (bright dots SVG, four-point star spans, the Drift SVG). The static markup ships as **one pre-built string**, so the RSC payload carries a single string copy of it (§9) |
| `components/layout/StarfieldSlot.tsx` | Server (exists from M1.13) | now renders `<StarfieldLayer />` and `<StarfieldIsland preview={…} />` inside the slot; with `preview.still` it also renders `data-starfield-state="static"` on the slot |
| `components/layout/SiteShell.tsx` | Server (exists from M1.13) | accepts an optional `starfieldPreview` prop and passes it to the slot (only the dev pages pass it) |
| `components/starfield/StarfieldIsland.tsx` | Client, tiny | renders `null`; on mount waits for `load` plus idle (§9), then `import("./starfield-motion")`, starts it with the slot element and the preview options, calls `onRouteChange()` when `usePathname()` changes, and `destroy()` on unmount |
| `components/starfield/starfield-motion.ts` | client module, lazy | the state machine (§6), the listeners and observers (§6.2), the streak scheduler with the corridor check (§4.5, its ordered checks and skip reasons, one path per task), the in-flight cancellation (§4.5, including the size comparison for the `ResizeObserver`), the `sf-attempt` performance measure (one per task, §9), the demo paths and the demo's `refused` flag (§13.1, §13.3), the WAAPI streak (`DURATION` × 1000), `data-starfield-state`, `data-sf-streaks`, `data-sf-last-skip` |
| `components/starfield/starfield.css` (or a section of `app/globals.css`) | CSS | the zones and their custom properties (§3.1), the content-column wrapper, tier visibility (`[data-sf-min]`), the short-viewport override, the `sf-sky` size container and its minimum-sky rule (§7), the twinkle keyframes inside `no-preference`, `--sf-lo` and the still opacity derived from `--sf-hi` (§14.2), the `paused` and `static` rules, the `html[data-motion="off"]` rule (§6.1), the `prefers-contrast: more` rule, the zone container queries (glow, Drift), the colour classes (`fill` / `background-color` from `--color-star-*`), the streak's colour from `--color-star-core` through `color-mix()` (§4.5) |
| `components/layout/Container.tsx` | Server (exists from M1.13) | adds `data-open-sky` to the Container element |
| `app/dev/starfield/page.tsx`, `still/page.tsx`, `no-streak/page.tsx`, `streak-demo/page.tsx`, `streak-blocked/page.tsx`, `StarfieldPreviewPage.tsx` | Server | §13.1 (each page: `requireDevPages()` in the page and in its `generateMetadata`, the §11 title; the solid band's `min-h-lvh`) |
| `app/dev/dev.css` | CSS | the six `@source` lines in §13.1 |
| `tests/e2e/support/screenshot.ts` | test support | `captureRoute` gains `name`, `fullPage` and `animations` options (§13.2; tech, M1.13) |
| `tests/e2e/starfield.spec.ts`, `tests/e2e/starfield-data.spec.ts` | tests | §14.5 |

The root layout never imports the island or the motion module (layout-shell §8.3, §13.3). Make sure `--container-content` is emitted at runtime (it is, if the `Container` already uses it in CSS).

### 14.2 Markup shape (sketch; exact elements are tech-agent's call)

```
<div data-starfield data-decorative aria-hidden="true" class="pointer-events-none fixed inset-x-0 top-0 h-lvh z-(--z-starfield)">
  <div data-sf-sky>                                  absolute; inset-inline 0; top var(--sf-band); bottom 0; overflow hidden; container: sf-sky / size
    <svg data-sf-field data-sf-dim width="100%" height="100%">   no viewBox: % positions, px radii; still dim stars only
      <g class="sf-core" opacity=".12"> <circle cx="12.3%" cy="56.7%" r=".5"/> … </g> …
    </svg>
    <div data-sf-twinkles data-sf-dim>               absolute; inset 0; no opacity, no z-index (one wrapper for all dim twinkle spans)
      <span data-sf-tw class="sf-core" style="left:…%; top:…%; --sf-hi:…; --sf-dur:…ms; --sf-delay:-…ms"></span> …
    </div>
    <div data-sf-column data-sf-dim>                 absolute; inset-block 0; inset-inline-start var(--sf-edge-start); inset-inline-end var(--sf-edge-end)
      <div data-sf-const="wick" style="left: clamp(0px, 58%, calc(100% - 78px)); top: clamp(0px, 62%, calc(100% - 50px))">
                                                     absolute; padding 6px; background-color var(--color-bg-page)
        <svg width="66" height="38" overflow="visible"> <path class="sf-line" opacity=".4" d="M…L…M…L…"/> (one path, segments shortened at each vertex, no mask), vertex circles </svg>
      </div> …
    </div>
    <div data-sf-edge="start"> bright-dot SVG, four-point star spans (inline SVG of the icon shape), Drift SVG </div>
    <div data-sf-edge="end"> … </div>
  </div>
  <!-- the motion module appends the streak element here: <span data-sf-streak>, a child of the slot,
       outside main's subtree (§4.5) -->
</div>
```

- Positions are percentages with one decimal (0.1% of 1920px is under 2px). Opacity levels are grouped in `<g>` to keep the markup small (§9).
- **Paint order is DOM order** (all absolutely positioned, no z-index): field SVG, the twinkle-span wrapper, the content-column wrapper (so each constellation's backing covers dots and spans beneath it), then the edge zones.
- **The dim twinkle spans share one wrapper**, `<div data-sf-twinkles data-sf-dim>`: `position: absolute; inset: 0`, with **no `opacity` and no `z-index`** (so it creates no stacking context or group opacity, the spans keep their own compositor layers and the paint order above holds). One `data-sf-dim` on the wrapper replaces one per span for the minimum-sky and increased-contrast rules.
- **Each span carries only** `left`, `top`, `--sf-hi`, `--sf-dur` and `--sf-delay`. **CSS derives** `--sf-lo` (0.5 × `--sf-hi` for dim spans, 0.6 × `--sf-hi` for edge spans) and the still value `opacity: calc((var(--sf-lo) + var(--sf-hi)) / 2)` (§4.4).
- **A twinkling dim star appears once, as its span.** `buildStarfield()` marks each dim star `circle` or `twinkle`; the field SVG renders only the `circle` ones.
- Tiered elements carry `data-sf-min="md" | "lg" | "xl"`: hidden below that breakpoint and always hidden under `@media (max-height: 28rem)`.
- Twinkle spans: `position: absolute`, 1px or 2px square (`border-radius: 50%`), `translate: -50% -50%` (static, never animated). The animation is declared only inside `@media (prefers-reduced-motion: no-preference)`; `[data-starfield-state="paused"] [data-sf-tw] { animation-play-state: paused }`; `[data-starfield-state="static"] [data-sf-tw], html[data-motion="off"] [data-sf-tw] { animation: none }`.

### 14.3 Deterministic placement

- **Seed:** one exported constant (for example `STARFIELD_SEED = 20261009`). The same build always produces the same sky, so SSR, hydration and screenshots are stable. The client never regenerates the sky (it is a Server Component's output).
- **RNG:** mulberry32 (a few lines, no dependency) seeded with `STARFIELD_SEED`, used for jitter, sizes, colours, opacity levels and twinkle periods and phases.
- **Even spread:** positions come from the **R2 low-discrepancy sequence** (`g = 1.32471795724474602596`, `x_n = frac(0.5 + n / g)`, `y_n = frac(0.5 + n / g²)`) plus a small seeded jitter, in rank order. Any prefix of an R2 sequence is evenly spread, so each tier's subset (§7) is even on its own.
- **Separation:** a candidate is rejected (and the next taken) if it is within **2% horizontally and 3% vertically** of an accepted star. It is evaluated at the **true minimum sky** each pair can share: two base-tier stars at **320 × 120px** (the floor below which no dim mark is drawn, §7), any pair involving a higher-tier star at that tier's minimum (768 × 368, 1024 × 368, 1440 × 360). At 320 × 120, 2% is 6.4px and 3% is 3.6px, so two dots (2px across at most, as are the twinkle spans) are always at least 1.6px apart edge to edge and never touch.
- **Kept clear:** x and y within 1–99%. Twinkle stars are never chosen under a dim constellation's backing (the pattern's box plus 6px). Because constellations are anchored to the content column, a backing's position in sky % depends on the width: the generator excludes the **union of the backing's sky-% rectangles over every integer viewport width from the tier's minimum width to 3840px, at the tier's minimum sky height** (where a box is tallest in %), using the geometry of §3.1 and §4.3. Wider than 3840px a backing may cover a twinkle star, which then is hidden, never stacked.
- **Twinkle selection:** ranks where `rank % 5 === 2`; when such a star falls inside an excluded area, the next rank of the same tier that is clear takes its place, so the §7 counts hold; plus every four-point star and one bright dot per edge. A dim star chosen to twinkle is rendered **only** as a span (§4.4).
- **Falling stars** use `Math.random` in normal use; in the demo modes paths are fixed (§13.3).

### 14.4 Island boundary

- **Server:** all stars, constellations, zones and the twinkle (HTML and CSS). Visible at first paint; works without JS.
- **Client:** state, pauses, preference listeners, the falling star. Nothing in the client touches the static markup except the slot's data attributes and the appended streak element.

### 14.5 Tests

Numbers 1–15 keep their first-draft meaning; 16–19 are new in fix round 1; tests 12 and 15 are extended in fix round 2.

`tests/e2e/starfield-data.spec.ts` (Node only, imports `starfield-data.ts`):

- **1.** `buildStarfield()` twice gives deep-equal output.
- **2.** Tier counts match §7 (dim stars, and of them circles and twinkle spans); every content-column star has opacity ≤ 0.14; the constellation line group is 0.4 × 0.35 = 0.14.
- **3.** Separation (§14.3) holds in px, with each mark's real size (circle radius, span square): for the base-tier stars at **320 × 120**, and for all stars of each higher tier at that tier's true minimum (768 × 368, 1024 × 368, 1440 × 360). No twinkle star lies under any dim constellation's backing at any integer width from the tier's minimum to 3840px, at the tier's minimum sky height.
- **4.** Every edge mark (with its glow where enabled) fits inside its zone at the zone's minimum width for its tier.
- **16. No circle shares a position with a span:** the dim stars split into `circle` and `twinkle` with no star in both, and no circle's position equals (or lies within the separation box of) any twinkle span's position.

`tests/e2e/starfield.spec.ts` (browser, using the M1.20 fixture):

- **5.** JS disabled, at 390 and 1440: the slot contains the field SVG; the number of **rendered** field circles is **29 and 102** and the number of dim twinkle spans **7 and 26**, so circles + dim twinkle spans = **36 and 128**.
- **6.** No star, line or span inside the slot has a bounding box above the header band's bottom edge (390, 1440, 844 × 390).
- **7.** Every bright edge mark's box lies outside the `Container` content box plus 8px (**390** (12px zones), 1440, 1920). Every dim constellation's backing lies inside the content column, between the two edge zones (390, 1440, 1684, 1920, 2560).
- **8.** Normal project: the slot reaches `data-starfield-state="animating"`; the number of running animations inside it equals the §7 twinkle count.
- **9.** Reduced-motion project: state `static`; no animations inside the slot; with `page.clock` installed, running 60s of timers creates no streak.
- **10.** Hidden tab (override `document.visibilityState` and dispatch `visibilitychange`): state `paused`, twinkle `playState` is `"paused"`; visible again → `animating`.
- **11.** Scrolled into the solid band (`min-h-lvh` on the preview page, §13.1) so no plain band is in view → `paused`.
- **12.** At 390 × 844 (set explicitly with `page.setViewportSize` in mobile-390; the project's own 390 × 664 viewport also passes) and 1440 × 900, at scroll 0, with no input (no click, key or wheel) except where stated. **Preconditions** (§13.3): `[data-sf-demo="open"]`'s box is fully inside the viewport and its top is at least 24px below the header band's bottom; the top of `[data-sf-demo="text"]` is inside the viewport. **Timing:** wait for `data-starfield-state="animating"`; every window below counts from that moment.
  - `/dev/starfield/streak-demo`: (a) **within 4s** `data-sf-streaks` is at least 1. (b) The streak (`[data-starfield] > [data-sf-streak]`) animates only `transform` and `opacity` (inspect its keyframes). (c) **A streak with no input survives to its natural end:** on a streak picked up before 600ms (the first one, or a later one if the first is already past it), in `page.evaluate`, take the streak's animation and await its `finished` promise (it rejects with `AbortError` if the streak is cancelled, which fails the test); at the first frame at or after 600ms, and before the fade-out starts (`getComputedTiming().progress` at most the end of the opacity-1 plateau; a late frame is retaken on the next streak, at most 3), the element's computed opacity is above 0.5 and it is still connected; `finished` resolves; and `data-sf-streaks` then increments again on the first attempt after the streak's end (three `sf-attempt` checks). This proves that neither the `ResizeObserver` initial notification nor the island's own DOM writes cancel a streak (§4.5). (d) Scrolling by 1px while a streak is in flight leaves no visible streak in the next frame (its animation is gone and its computed opacity is 0).
  - `/dev/starfield/streak-blocked`: 4s after `animating`, `data-sf-streaks` is `"0"` and `data-sf-last-skip` is **`"text"`**.
- **13.** `forcedColors: "active"`: the slot is `display: none`. Print emulation: the slot is hidden.
- **14.** `contrast: "more"` emulation (if the installed Playwright supports it): `data-sf-dim` marks hidden; state `static`.
- **15.** Performance (§9), tagged `@perf` (it runs in the serial pass: `npm run test:e2e` does a parallel pass and then a serial @perf pass; see M1.20b): markup size, chunk sizes, `ScriptDuration` and `LayoutCount` deltas, `Paint` events, the per-task `sf-attempt` measure (each path's check in its own task; **unthrottled, in both projects: every task ≤ 16ms and no long task overlapping an attempt; median ≤ 4ms in a serial `--workers=1` run**; 4× CPU throttle figures reported in the build review, not asserted), the compositor check (`Animation` and `LayerTree`: per-span layers, overlap layers, `animating − static ≤ 34`, extra layers ≤ 2 at 390 and 1440), CLS sources, LCP element.
- **17. Markup rules (§4.5)** on every route the suite visits (`/` and the dev pages): no non-whitespace text node is a direct child of `main`, a `[data-band="plain"]` element or a `[data-open-sky]` element; no element inside `main` that contains text or is an `img`, `picture`, `video` or card has computed `pointer-events: none`.
- **18. Motion hook:** setting `html[data-motion="off"]` (with `page.evaluate`, right after `domcontentloaded` and so before the island loads) stops every twinkle animation at once (the CSS rule), and the state settles at `static` once the island starts; removing the attribute returns the state to `animating`.
- **19. Minimum sky:** at 320 × 190 (sky 118px) every `data-sf-dim` element is hidden and the edge zones still show; at 320 × 200 (sky 128px, the 400% zoom case) the dim marks show.

---

## 15. IP guardrail

- The four constellation patterns (Wick, Ribbon, Sprig, Drift) are invented for this site. They are deliberately unlike any well-known star pattern (no W or M, no ladle, no row of three equal stars, no cross, no small semicircle, no tight cluster), and they form no letters, crests, emblems or symbols from any book, game or film. No pattern recreates a sky, map or symbol from the book series that inspired the mood.
- Their names, the zone and state names, the attribute names (`data-sf-*`, `data-open-sky`, `data-motion`), the skip reasons (`text`, `edge`, `null`), the `refused` flag, the performance mark names (`sf-attempt`), the page paths (`still`, `no-streak`, `streak-demo`, `streak-blocked`), the CSS classes, the dev-page copy and the dev-page titles are plain generic English. The dev-page sentences are original and describe the effect, not any story.
- No character, place, court or book names, no author name, no quotes or paraphrases, no invented terms, no "Court of …" or "High Lord/Lady" style combinations. Re-read for this after fix round 2 (including the new caption wording and the five page titles) and again after the post-pass sync with M1.19 as-built (no copy changed; the new identifiers `refused`, `data-sf-twinkles` and `min-h-lvh` are generic), and confirmed.

## 16. Open questions

1. **How bright the middle of the sky can be.** The 0.14 cap (§3.2) is set by text-muted. It makes the content-column stars faint on phones, where that column is almost the whole screen. If page specs agreed never to put text-muted on plain bands, the cap could rise to 0.28 (moon-50 at 0.28 → `#4F505B`, L 0.081549: text-secondary 4.74, but text-muted only 2.80, which is why it isn't adopted). Recommendation: keep 0.14 and judge it in the M1 gate screenshots. [confirm with user after the M1 gate screenshots]

Resolved since the first draft:
- **GSAP in the M1.19 title:** TASKS.md M1.19 now reads "CSS + WAAPI per starfield.md; GSAP allowed but not required". This spec uses no GSAP (§5).
- **A site-wide "Pause animations" control:** required before launch, scheduled as M8.8b; M1.19 exposes `html[data-motion="off"]` (§6.1, §10).
- **layout-shell §8.3 wording:** layout-shell.md §8.1 and §8.3 now allow server-rendered static SVG and spans in the slot, with the motion module loaded after `load` plus idle.
