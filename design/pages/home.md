# Home page (M2.1)

Status: spec, **QA PASSED** (fix round 2), with post-pass minors 1–3 applied, plus the **hero follow-ups from M2.2** (changelog below), which await QA review. Owner: design-agent. Built by tech-agent in M2.2 (hero), M2.3 (featured collections), M2.4 (bestsellers), M2.5 (brand story). The newsletter band is reserved for M2.6/M2.7 (§8).

Builds on [`layout-shell.md`](../components/layout-shell.md) (§4 Container and Grid, §5 bands and the SectionHeading pattern, §6 the header contract), [`header.md`](../components/header.md) (§8 at rest vs scrolled, §8.3 the hero images), [`footer.md`](../components/footer.md) (§2.4 the newsletter slot and the one-form rule, §3.2 the route registry and the `features` map), [`starfield.md`](../components/starfield.md) (§3.1 text inside the Container, §3.2 the 0.14 cap, §4.5 the markup rules), [`tokens.md`](../system/tokens.md) (§2.4 glows, §2.5 rules 1–9, §3 contrast, §5 arches, §9 breakpoints), [`typography.md`](../system/typography.md), [`motion.md`](../system/motion.md) (§5, §5.1 the CSS-only hero entrance and the LCP rule, §6), [`accessibility.md`](../system/accessibility.md), [`catalog.md`](../copy/catalog.md) / [`catalog.json`](../copy/catalog.json), [`art-direction.md`](../art/art-direction.md) (§4.3, §5, §7) and [`shot-list.json`](../art/shot-list.json). Nothing here loosens those files. Where this spec is stricter, it says so.

## Changelog

**M2.2 spec-review minor 1** (2026-10-10): §3.9: the md hero `sizes` is **`133.3vw`** (was `134vw`), so iPad portrait (768, DPR 2) fetches w=2048, not w=3840.

**Post-pass minors from the hero follow-up review** (2026-10-10)

1. §3.6, §9, §14: the build-review acceptance measure is the last reveal animation's own end time, read from `document.getAnimations()` as `startTime + delay + duration` on the document timeline and compared with the FCP entry's `startTime`. The `animationend` event time is recorded as a secondary figure only: under hydration long tasks on 4× CPU it can be dispatched late even when the compositor animation finished on time. The FCP + 1.0 s limit is unchanged.
2. §2.3: the flush-end switch-off selector is quoted the same way as in §14: `[data-band][data-flush-end]:not(:has(~ [data-band]))`.

**Hero follow-ups from M2.2** (2026-10-10)

1. **Approved tech pushback (M2.2 tech spec §1.11, PUSHBACK 1).** The hero's `padding-block-end: 0` applies only when another band follows it. While the hero is the last band before the footer (as in M2.2), it keeps `--section-y` at the bottom, because layout-shell §5.1 says the last section before the footer keeps its bottom padding. Updated in §2.3, §3.2 (the Spacing row) and §14 (the Bands bullet and e2e check 13). Nothing changes once M2.3 puts a band after the hero.
2. **The hero entrance is CSS-only and starts at first paint** (§3.6, §9, §14; motion.md §5.1 is rewritten to match). On slow 4G with a 4× CPU slowdown, tech-agent measured the hero image painting at about 1.7 s, while the eyebrow, subcopy and CTA group stayed hidden until hydration (about 2.8 s) and finished at about 3.7 s. The `hero-pending` head script, its 2500ms timer and the GSAP hero tween are retired. A CSS keyframe animation with the same values (24px, 700ms, `--ease-enter`, 100ms stagger) now starts when the hero first renders, needs no JS, and ends visible by itself. **The hero no longer loads GSAP.** GSAP arrives in M2.3 with the section reveals, imported dynamically after `load` + idle, so it is never on `/`'s critical path. The copy, the layout and the LCP decision are unchanged.

**Post-pass minors 1–3** (2026-10-10)

1. §4.4: the base Comet Season card sum is corrected to 222.7 + 16 + 30.9 + 27.5 + 4 + 105.6 = **406.7** (it read 407.7), so the base card-height range is **≈ 349–407** (in the §4.4 table, its working, and the fix round 2 item 2 entry below).
2. §3.2, §3.6, §11.1: the subcopy line counts at 768 and 1440 assumed a 450px measure. `max-w-measure-intro` is 45ch, and Jost's "0" is 0.6em wide, so the measure is 27em: about 502px at 768, and 540px at 1440 (20px), capped by the 514px column. The subcopy therefore sets in **2 lines** at 768 and 1440, not 3. The §3.6 subcopy area at 1440 is now **514 × 64 ≈ 32,900**, and the 1440 text-block height is **≈ 350px** (was 382). The 390 geometry, the 1024 heights and e2e check 12 are unchanged.
3. §4.4: the collections `sizes` entry for 90rem and wider is **`187px`** (was `190px`), matching the 186.7px card.

**Fix round 2: QA issues 1–7** (2026-10-10)

1. §2.3, §14: layout-shell.md §5.1 is amended (its changelog has the entry): "A hero may override its own top and bottom spacing (M2.1); no other band does", and the collapse rule now keeps the next band's top padding when the band before it already ends at 0. §2.3 quotes both sentences exactly. §14 asks for the collapse selector to skip the band after the flush-ending hero, plus a shell test case. No other spec relied on the old wording (checked: header.md §8.3, footer.md §4.1, layout-shell §7, starfield.md §13.1 and §13.3, the M1.13 shell test).
2. §4.4: the card-height row is recomputed from its own formula, with the working under the table: **≈ 349–407** (base), **395–454** (md), **504–536** (lg), **388–450** (xl). The Limited badge is about 23–24px tall (eyebrow line + padding + border), so badge + gap is about 31–32px. "About 450px of cards" at xl still holds (449.9). The longest taglines are Moonlit Terrace's and Comet Season's, 55 characters each.
3. §5.2, §6.1: the longest short description on home is **Ink & Cedar's (71 characters)**; Moonrise's is 69. At base (about 17 characters per line) it wraps to 6 lines, so base cards reach **≈ 498px** (the seed rows are ≈ 470 and ≈ 471), and §6.1 now says 2–6 lines. Every bestseller card height is recomputed, with the working under the table.
4. §5.2, §6.5: at lg the bestseller card is (944 − 3 × 24) / 4 = **218px**, its image **186 × 232.5**, and the `sizes` check reads **186**.
5. §3.2, §11.1, §14, §15: the hero subcopy is shortened from 110 to **93 characters** ("Inspired by moonlit terraces, starry reading rooms and still lakes, for long, quiet evenings."), so it sets in **3 lines** at 390 with room to spare (it stays at 3 lines down to 32 characters per line). The 390 geometry in §3.2, the LCP areas in §3.6 and e2e check 11 therefore stand as written; new e2e check 12 guards the 3 lines. The 1024 and 1440 text-block heights are recomputed (≈ 417 / 493 and ≈ 382).
6. §3.2, §3.4: the capped hero box: the col-6 line sits at `50vw − 93.3px`, so the 960px cap is reached at about **1733px**, and the end-edge gap is about **93px at 1920** and **413px at 2560**.
7. tokens.md §2.6 now gives the haze places as examples, not a list. art-direction.md §5 marks the `newsletter-texture` reason in shot-list.json as superseded. No token values change.

**Fix round 1: QA issues 1–12** (2026-10-10)

1. Collection taglines and product short descriptions now use `type-body` (16 → 18px), not `type-body-sm` (typography.md §7.4 keeps body-sm for meta of at most 2 lines). Line counts, card heights and the layouts are re-checked at every breakpoint (§4.3, §4.4, §5.2, §6.1, §6.5, §10.6). Because 4 cards at md left only 134px of text width (5–6 lines of description), **the bestsellers go 2 per row at md** (cards 340px wide). Colours are unchanged, so every ratio is unchanged.
2. The hero glow's radius (30% of the box) is a stated deviation from art-direction.md §4.3's original 12.5%, with the reason: a 12.5% circle would sit entirely behind opaque pixels and never show (§3.4). art-direction.md §4.3 is updated to match.
3. The CTA glow footprint: the subcopy pair inside it is listed (text-secondary over the glow on bg-page, 6.04:1; worst case T55 4.71:1), and the text link now sits **32px** (step 8) from the primary CTA at every breakpoint, so the link and its focus ring stay outside the 26px footprint (§3.2, §3.7, §10.3, §10.5). tokens.md rule 9 is unchanged.
4. On home, a card always shows the badge that qualified it (Bestseller or New), even when the product has more badges than the 2-badge limit (§6.2).
5. The collection image field is `moodImage` (`{ src, alt, width, height }`), not `images.mood` (§10.4, §13, §14).
6. The hero DOM (§3.1) now wraps the eyebrow and the h1 in `<hgroup>`, matching §10.1.
7. The brand-story SVG: `vector-effect: non-scaling-stroke` on every stroke, minimum rendered sizes for the star dots and four-point stars, and a larger base size (240 × 192) (§7.2, §7.3).
8. The hero image box once the 60rem cap applies (from 1732px wide): it stays anchored at its start edge, next to the text, and its end edge stops short of the viewport, already feathered into bg-page (§3.2).
9. The bestsellers h2 has a variant for the mixed row: **"Favorites and new flames"**. The hero CTA is now **"Shop favorites"**, which suits both variants (§3, §5.3, §11).
10. The hero subcopy no longer repeats the eyebrow's "Scented candles" (§11.1).
11. The newsletter on `sunken` is logged as a departure from the old "solid bg-haze" lines, and tokens.md §2.5 rule 7 and art-direction.md §5 are updated so M2.6 isn't contradicted (§2.1, §8).
12. The hero → collections junction is described as the hero's own `padding-block-end: 0` override (layout-shell §5.1 lets a hero override its own spacing), not as an exception to the collapse rule (§2.3). *(Fix round 2, item 1: layout-shell §5.1 is amended so that this reading is what it actually says.)*

---

## 1. Purpose and acceptance criteria

Purpose: a phone visitor arriving from Instagram or Pinterest sees a lit candle, a one-line promise and a thumb-sized button in the first screen. A short scroll then shows the collections as six arched windows and the best-loved candles on solid cards, followed by a quiet brand note. It should feel calm and luxurious, the products stay in focus, and nothing on the page links to a route that doesn't exist yet.

Acceptance criteria (from the orchestrator's M2.1 task, refined):

1. **Section order and bands** at 390 / 768 / 1024 / 1440 (§2). There is at most one haze-family band per view, and none behind product grids.
2. **Hero (M2.2)** (§3):
   - art direction: the mobile and desktop sources, the crops and the `sizes` values;
   - text placement on solid ground, with the LCP decision;
   - the glow, placed on the real candle;
   - the header relationship;
   - the entrance motion, with its reduced-motion fallback;
   - a note on the flagged placeholder.
3. **Featured collections (M2.3)** (§4): which collections, the card design, the layout per breakpoint, the data, and the **M2 state of the links**.
4. **Bestsellers (M2.4)** (§5): the selection rule; the product card, defined here as the baseline M3.1 extends (§6); the M2 state of the bag action and the links.
5. **Brand story (M2.5)** (§7): copy with no maker claims, an inline SVG illustration and motifs.
6. **Newsletter (M2.6/M2.7)** (§8): its place is reserved; in M2 it is omitted and takes no space.
7. **Copy** (§11): every string is final and IP-checked.
8. **Motion** per section (§9): transform and opacity only, no CLS, a static fallback under reduced motion, performance notes.
9. **Accessibility** (§10): heading order, landmarks, alt text, contrast for every pair, focus order, 44px targets.
10. **SEO basics** (§12).
11. **Data needs and implementation notes** (§13, §14).
12. **IP guardrail** (§15).

---

## 2. Section order and bands

### 2.1 Order

| # | Section | Band (layout-shell §5.2) | Task | Element / id | Rendered in M2 |
|---|---|---|---|---|---|
| 1 | Hero | `solid` | M2.2 | `<section id="hero" aria-labelledby="hero-heading">` | yes |
| 2 | Featured collections ("Choose your kind of night") | `plain` | M2.3 | `<section id="collections" aria-labelledby="collections-heading">` | yes, when at least one collection is published (§4.6) |
| 3 | Bestsellers ("Most-loved after dark", or "Favorites and new flames" for a mixed row, §5.3) | `plain` | M2.4 | `<section id="bestsellers" aria-labelledby="bestsellers-heading">` | yes, when the selection holds at least one bestseller (§5.1) |
| 4 | Brand story ("Lit slowly, after dark") | `dusk` (dusk + veil) | M2.5 | `<section id="story" aria-labelledby="story-heading">` | yes |
| 5 | Newsletter ("Join the night list") | `sunken` (reserved, §8) | M2.6 / M2.7 | — | **no**: omitted, no space reserved |
| — | Footer | (footer's own bg-sunken) | M1.17 | `<footer>` | yes (minimal composition) |

This is the order the user saw and liked in the mockup. It is kept.

**Why the hero is `solid`, not `plain`:** tokens.md §2.5 rule 6 allows the candle glow only on solid bg-page or bg-sunken (§3.4). The hero photo carries its own stars, so the starfield isn't missed there.

**Why the brand story is the page's only haze band, and why the newsletter is `sunken`, not `haze`:** layout-shell §5.2 says two haze-family bands are never adjacent. With the liked order, the brand story sits directly above the newsletter, so only one of them can be haze. The brand story gets the haze, because it is pure atmosphere and has no form controls. The newsletter form needs solid ground (tokens.md §2.5 rule 7). bg-sunken is one of rule 7's allowed backgrounds (`border-control` 4.74:1, U3), and it turns the newsletter and the footer into one calm sign-off zone. M2.6 confirms this (§16, question 2).

**Logged departure:** art-direction.md §5 and tokens.md §2.5 rule 7 used to say the newsletter form "sits on solid bg-haze". That was written before any page put a haze band next to it. On home it sits on bg-sunken instead. Both lines are updated in fix round 1 to say "solid bg-haze or bg-sunken", so M2.6 can spec either without contradicting them. Nothing about the form's contrast changes: rule 7 already allowed bg-sunken. (The older sentence that remains in shot-list.json's `newsletter-texture` entry is marked superseded in art-direction.md §5, fix round 2.)

### 2.2 Haze check (layout-shell §5.2)

- The page has **exactly one** haze-family band, the brand story. At the 844px (390) and 900px (1440) reference heights, no view can contain two.
- **No product grid sits on haze.** Collections and bestsellers are `plain`, and product cards sit on bg-raised (tokens.md §2.5 rule 3).
- **Dusk edges:**
  - The top stop is night-900, which melts into the plain bestsellers band above it.
  - The bottom stop (rose-800) meets bg-sunken (the footer in M2, the newsletter band later) with a hard edge. That edge is intended. It is marked by a 1px `gradient-starlight-rule` along the inside bottom of the dusk band, full width, `aria-hidden`, `data-decorative`.

### 2.3 Spacing between bands (layout-shell §5.1, as amended in fix round 2)

| Junction | Rule |
|---|---|
| Header → hero | The hero overrides its own top spacing. layout-shell §5.1: "A hero may override its own top and bottom spacing (M2.1); no other band does." It uses **24px** at base, **32px** at md, and **0 at lg+**, where the image box starts directly under the header (§3.2). |
| Hero (solid) → collections (plain) | **The hero's bottom override, and the collapse rule as amended.** The hero sets `padding-block-end: 0` when another band follows it, because it then ends in a feathered image, not in padding (the same §5.1 sentence allows it). **The hero's `padding-block-end: 0` applies only when another band follows it; while it is the page's last band before the footer (M2.2), it keeps `--section-y` at the bottom (layout-shell §5.1: the last section before the footer keeps its bottom padding).** The two bands share bg-page, so the collapse rule applies, and layout-shell §5.1 now reads: "The collapse only removes a duplicate: if the first band already ends at 0 (a hero that overrides its bottom spacing, next point), the second keeps its top padding, so there is still exactly one `--section-y` between them." So the collections band keeps its top padding, and exactly one `--section-y` (64 / 80 / 96 / 128px) separates the bottom of the image box from the collections heading. **Build:** the M1.13 collapse selector (`:is(plain, solid) + :is(plain, solid)` drops `padding-block-start`) must skip a band that follows a flush-ending band, for example by marking the hero `data-flush-end` and excluding the band after it from the selector (tech-agent's call; the layout-shell §5.1 build note, §14). The flush end must switch itself off when no band follows (tech-agent's M2.2 rule `[data-band][data-flush-end]:not(:has(~ [data-band]))` does this). |
| Collections (plain) → bestsellers (plain) | Collapse: bestsellers has `padding-block-start: 0`, so exactly one `--section-y` separates them. (If the collections section is omitted, §4.6, bestsellers follows the hero directly and keeps its top padding by the same amended rule.) |
| Bestsellers (plain) → brand story (dusk) | Both paddings stay (different colours). |
| Brand story (dusk) → footer (M2) / newsletter (later) | Both paddings stay. The footer adds its own top padding (footer.md §4.1). |
| Hero → footer (M2.2 only, while the hero is the last band) | The hero keeps `--section-y` at the bottom (64 / 80 / 96 / 128px), so the feathered image fades into bg-page before the footer's bg-sunken edge, never directly onto it. The footer adds its own top padding. |

### 2.4 Page diagrams

```
390 (base), viewport 390 x 664 (the Playwright project) / 844 (reference)
+------------------------------------------+ 0
| HEADER 64 (at rest: transparent)         |
+------------------------------------------+ 64
| HERO (solid)   24                        |
|  EYEBROW                                 |
|  Light a little                          |  h1 display-1 (44px), 2 lines
|  starlight.                              |
|  subcopy (body-lg, 3 lines)              |
|  [ Shop favorites ............... ]      |  primary, full width, 48 tall   y ~ 335-383
|  32                                      |
|  Explore collections ->                  |  text link, 44 tall             y ~ 415-459
|  32                                      |
|##########################################|  image 1:1 full bleed, 390 x 390, top/bottom feathered
|######## candle (photo) ##################|  top at y ~ 491
+------------------------------------------+
| COLLECTIONS (plain)  64                  |
|  eyebrow / h2 / intro                    |
|  48                                      |
|  [arch][arch]                            |  2 per row, 3 rows
|  [arch][arch]                            |
|  [arch][arch]                            |
+------------------------------------------+
| BESTSELLERS (plain, top padding 0)       |
|  eyebrow / h2 / intro   48               |
|  [card][card]                            |  2 x 2 on bg-raised
|  [card][card]           64               |
+------------------------------------------+
| BRAND STORY (dusk)   64                  |
|        (crescent illustration)           |
|  eyebrow / h2 / two paragraphs   64      |
+--------------- starlight rule -----------+
| FOOTER (minimal, sunken)                 |
+------------------------------------------+

1440 (xl), viewport 1440 x 900
+--------------------------------------------------------------------------------------+ 0
| HEADER 80                                                                              |
+--------------------------------------------------------------------------------------+ 80
| 80 | EYEBROW                  |32|##################### image box 5:4 ################|
|    | Light a little           |  |##### 814 x 651, bleeds to the right viewport edge ##|
|    | starlight.               |  |#### left/top/right/bottom feathered ################|
|    | subcopy                  |  |######## candle at 43% / 57% of the box ############|
|    | [Shop favorites] 32 Explore collections ->  ###################################|
|    |<- cols 1-5, 514 ->|      |  |####################################################|
+--------------------------------------------------------------------------------------+ 731
| COLLECTIONS (plain) 128 / heading row / 48 / six arches in one row (187 wide) / 128   |
| BESTSELLERS (plain) heading / 48 / four cards in one row (296 wide) / 128             |
| BRAND STORY (dusk) illustration cols 1-5 | text cols 7-12                              |
| FOOTER                                                                                 |
+--------------------------------------------------------------------------------------+
```

---

## 3. Hero (M2.2)

### 3.1 Content and DOM order

```
<section id="hero" data-band="solid" aria-labelledby="hero-heading" class="isolate overflow-clip">
  <div class="HeroGrid">                                   Container at base/md; see §3.2 for lg+
    <div class="HeroText">
      <hgroup>
        <p class="type-eyebrow" data-hero-reveal>…</p>      reveal order 0 (§3.6)
        <h1 id="hero-heading" class="type-display-1">…</h1>  NOT animated (§3.6)
      </hgroup>
      <p class="type-body-lg" data-hero-reveal>…</p>        reveal order 1
      <div class="HeroActions" data-hero-reveal>            reveal order 2
        <a href="#bestsellers" class="Button primary">Shop favorites</a>
        <a href="#collections" class="TextLink">Explore collections <svg arrow aria-hidden/></a>
      </div>
    </div>
    <div class="HeroMedia" data-decorative-glow-host>
      <div class="HeroGlow" aria-hidden="true" data-decorative></div>   md+ only (§3.4)
      <div class="HeroImage">  <picture>…</picture>  </div>             masked (§3.3)
    </div>
  </div>
</section>
```

- The eyebrow and the h1 are grouped in `<hgroup>` (typography.md §6.1; a `<p>` before the heading is valid `hgroup` content), exactly as the section headings below (§10.1). The `hgroup` itself carries no reveal attribute; the eyebrow inside it does.
- The DOM order (text, then media) is the visual order at every breakpoint: the text sits above the image below lg and beside it from lg. No `order` tricks are used.
- Both CTAs are **plain `<a>` in-page anchors**, not `next/link`, so nothing is prefetched and they can never 404 (§3.8).

### 3.2 Layout per breakpoint

| | base (390; holds from 320) | md (768–1023) | lg (1024–1439) | xl (1440+) |
|---|---|---|---|---|
| Composition | stacked: text, then image | stacked: text, then image | two columns | two columns |
| Text | in the `Container`, start-aligned | in the `Container`, start-aligned | Grid 12, cols 1–5 (379px), vertically centred on the image box | cols 1–5 (514px), vertically centred |
| Image source | `hero-mobile` (1792×2240, 4:5) | `hero-desktop` (2688×1520, 16:9) | `hero-desktop` | `hero-desktop` |
| Image box | **full bleed** (outside the Container), `aspect-ratio: 1 / 1` | full bleed, `aspect-ratio: 4 / 3` | starts at the col-6 line (`--grid-gap` after the text column) and bleeds to the viewport's end edge. `aspect-ratio: 5 / 4`, `max-inline-size: 60rem`, `justify-self: start` | as lg; **capped from about 1733px wide** (see below) |
| Crop (`object-fit: cover`) | `object-position: 50% 80%`: removes about 16% of the height at the top (calm sky; the small crescent goes) and 4% at the bottom | `object-position: 100% 50%`: shows the right 75% of the photo (trims the empty left 25%) | `object-position: 100% 50%`: shows the right 70.3% (trims the left 29.7%) | same |
| Box size | 390 × 390 | 768 × 576 | 581 × 465 at 1024 | 814 × 651 at 1440; grows to 960 × 768 at about 1733; stays 960 × 768 above that |
| Candle in the box (from the real photo: x 52–74%, centre x 60%, y 57%; mobile body centre x 50%, y 54%) | centre x 50%, y 47.5% | centre x 46.7%, y 57% | centre x 43.1%, y 57% (body spans x 31.7–63%) | same |
| Spacing | top 24 (step 6); text → image 32 (step 8); bottom 0 when another band follows, `--section-y` while the hero is the last band (§2.3) | top 32; text → image 32; bottom as base | padding-block-start 0; padding-block-end as base; the band's content height is the image box's height (or the text's, if taller); `align-items: center` | same |
| CTAs (`HeroActions`: `display: flex; flex-wrap: wrap; align-items: center; gap: 2rem`, step 8 in both directions) | primary full width (min-height 48); the text link wraps below it, **32px** (step 8) under it (44 tall) | primary auto width (min-height 48); text link on the same row, **32px** after it | as md (min-height 48). If the row doesn't fit the 379px column, the link wraps below with the same 32px gap | as md |

- **The capped box (the end edge from about 1733px).** Above 1440 the Container centres at 1280, so its content box starts at `50vw − 640px`, and the col-6 line sits five columns and five gaps further on (5 × 77.33 + 5 × 32 = 546.7px), at `50vw − 93.3px`. The box would be `50vw + 93.3px` wide. It reaches the 60rem (960px) cap at 2 × (960 − 93.3) ≈ **1733px**. From there the box **stays anchored at its start edge** (the col-6 line, 32px after the text column), so the text-to-image gap, the glow's clearance from the text and the candle's place next to the heading never change. Its **end edge stops short of the viewport** by `50vw + 93.3px − 960px`: about **93px at 1920** and **413px at 2560** (QA's 414 rounds the 93.3px offset up to 94). That strip is plain bg-page, and the box's end feather (opaque 92% → transparent 100%, §3.3) already fades the photo into it, so there is no hard edge. The image is not stretched or recentred.
- **Text widths:** h1 `max-w-measure-heading` (18ch), subcopy `max-w-measure-intro` (45ch), both set on the text element itself (typography.md §5).
  - Expected lines: the h1 is 2 lines at 390, 768 and 1440, and may be 3 at 1024. **The subcopy is 3 lines at 390 and 1024, and 2 lines at 768 and 1440** (93 characters; the measures, the line breaks and the margin are worked in §11.1). At 320 it may take 4, which nothing depends on.
  - Nothing is truncated, and nothing depends on a line count.
- **Text block height:**
  - **390: about 371px** (eyebrow 17 + 12 + h1 92 + 16 + subcopy 86 + 24 + CTA 48 + 32 + link 44).
  - **1440: about 350px** (eyebrow 18 + 12 + h1 168 + 16 + subcopy 64, 2 lines + 24 + CTA row 48). The box is 651px tall, so it fits with room to spare.
  - **1024: about 417px** with a 3-line h1 (eyebrow 18 + 12 + h1 207 + 16 + subcopy 92 + 24 + CTA row 48), and **about 493px** if the text link wraps below the CTA (+ 32 + 44). The row needs about 384px (CTA 171 + 32 + link 181) of the 379px column, so it may wrap there. The one-row case fits the 465px box.
  - If the text is taller than the box (the wrapped link at 1024, or the text-spacing override), the band grows, both columns stay centred, and the image keeps its ratio.
- **First view:**
  - **390 × 664:** the primary CTA spans y ≈ 335–383, in the lower half and inside thumb reach. The text link spans y ≈ 415–459. The image starts at y ≈ 491, so the flame and the top of the jar are in view (the candle starts about 93px into the box, at y ≈ 584).
  - **390 × 844:** the whole candle is in view.
  - **1440 × 900:** the whole hero (80 + 651) is in view, with the collections band's top edge below it.
- **Why the text is never over the photo:**
  - Desktop: the left 45% of `hero-desktop` is dark only in its upper half. Its lower 40% is the pale stone balustrade (from about y 58% at the left edge). A heading, subcopy and two CTAs don't fit in the dark part at 1024–1440 without a scrim.
  - Mobile: the calm top 30% of `hero-mobile` is only 146px tall at 390.
  - So the text sits on solid bg-page beside the image (lg+) or above it (below lg). That is the preferred layout in art-direction.md §5, and it needs no scrim (accessibility.md §7).
- **Why text first on mobile:** with the image first, the CTA would land at about y 870, below the fold even on an 844px screen. Text first puts the button in the first view on 664px screens. The image then follows as the payoff and stays the largest element (§3.6).
- **Why 1:1 (not 4:5) at base:** a 4:5 box would be 487px tall, and the candle would start below the fold at 390 × 664. The 1:1 crop removes only calm sky and a strip of balustrade, and the subject zone (x 25–75%, y 35–90% of the source) stays inside the box.
- **Why 4:3 at md:** art-direction.md §4.3 allows it ("crop to about 4:3 at 768–1023 by trimming the left edge"). It centres the candle (46.7%) under a stacked text block. A full 16:9 frame would leave an empty dark left half under the text.

### 3.3 Image treatment: feathered edges

The photo's edges already fall off to near night-900. A CSS mask on `.HeroImage` (never animated) fades them fully into bg-page, so the image has no hard rectangle edge.

| | Mask (a stack of linear gradients, intersected: `mask-composite: intersect`; `-webkit-mask-composite: source-in` for older Safari) |
|---|---|
| base, md | top: transparent 0 → opaque 8%; bottom: opaque 84% → transparent 100%. The sides run to the viewport edge with no feather. |
| lg, xl | start (left): transparent 0 → opaque 24%; end (right): opaque 92% → transparent 100%; top: transparent 0 → opaque 8%; bottom: opaque 84% → transparent 100% |

- The feathered strips show bg-page (and the glow behind them, §3.4) through the image. **No text box overlaps any part of the image box at any breakpoint**:
  - lg+: there is a 24/32px gap between the text column and the box.
  - below lg: there is 32px between the last CTA row and the box.
- Forced colors: images render as they are. Print: the image prints, but masks don't print reliably and that's accepted.

### 3.4 Glow: the photo carries it, plus a faint spill through the feather

- **The photo's own glow is the main glow:** the flame, the lit glass and the warm pool on the stone are all part of the image.
- **`gradient-candle-glow` (tokens.md §2.4) can't be placed over the photo,** because nothing glows on top of products (tokens.md §2.5 rule 5). It sits **behind** the opaque image, so it shows only where the mask makes the image transparent: a faint warm spill along the feathered bottom edge (and, at lg+, the start edge), as if candlelight were reaching past the photo onto the page.
- **No box-shadow halo** on the image (tokens.md §2.4). **No breathing loop:** the glow is mostly hidden, so a loop would cost CPU for nothing.

**Glow element `.HeroGlow`:** a square, `position: absolute` inside `.HeroMedia` (which is `position: relative` and has the image box's exact size), `z-index: -1` in the band's own isolated context (layout-shell §4.4), `background: var(--gradient-candle-glow)` (a `closest-side` circle, so its radius is half the element's width), placed with `left` / `top` at the candle centre plus `translate(-50%, -50%)`. That is a static transform, not an animation. `aria-hidden="true"`, `data-decorative` (hidden in forced colors and print).

| | Rendered? | Centre in the box (follows the real candle and the crop, §3.2) | Size (radius) | Footprint at the design width | Clearances |
|---|---|---|---|---|---|
| base | **no** (`display: none` below md) | — | — | — | At 390 the circle can't reach the feathered bottom edge without also reaching the top edge next to the text, so it would be invisible. The photo's own glow carries the hero. |
| md | yes | x 46.7%, y 57% | width 60% of the box (r = 30% of the box) | at 768: centre (358, 328), r 230 → x 128–588, y 98–558; it shows through the bottom feather (y 484–576). In the source photo: x 37.5–82.4%, r = 22.5% of the rendered image width | inside the box: it never reaches the box's top edge, so it never reaches the text above it; no haze in the hero |
| lg | yes | x 43.1%, y 57% | 60% of the box width | at 1024 (box 581 × 465): centre (250, 265), r 174 → x 76–424, y 91–439; shows through the start feather (x 0–139) and the bottom feather (y 391–465). Source: x 38.9–81.0%, r = 21.1% of the image width | the box starts 24px after the text column, and the circle starts 76px inside the box, so it is **100px clear of the text column** |
| xl | yes | x 43.1%, y 57% | 60% of the box width | at 1440 (box 814 × 651): centre (351, 371), r 244 → x 107–595, y 127–615; shows through the start feather (x 0–195) and the bottom feather (y 547–651). Source: x 38.9–81.1%, r = 21.1% of the image width. Capped (box 960 × 768, from about 1733): centre (414, 438), r 288 → x 126–702 | **139px clear** of the text column (32 + 107; 158px when capped); its whole footprint is over bg-page (rule 6); it never overlaps the CTA glow footprint (§10.5) |

**Deviation from art-direction.md §4.3, and why.** Before M2, art-direction.md asked for a small glow (radius about 12.5% of the image width, inside about x 55–80% of the source) so it would stay clear of a heading set **over** the image's dark left 45%. This spec doesn't put text over the image: the text sits beside it (lg+) or above it (below lg), on bg-page. And the glow sits **behind** the opaque photo, so it only shows where the feather makes the photo transparent. At xl a 12.5% circle (r ≈ 145, at the candle centre) would span box x 206–496 and y 226–516: entirely inside the opaque area (the start feather ends at x 195 and the bottom feather begins at y 547). It would be completely hidden and add nothing. To reach the feathers it needs r > 156 (start) and r > 176 (bottom); r = 30% of the box (244 at xl) reaches 88px into the start feather and 68px into the bottom one, which gives the faint spill. The constraint that matters, rule 6's footprint check against every text box, control and haze layer, is met at every breakpoint (the Clearances column). art-direction.md §4.3 was updated in fix round 1 to record this resolution, so the two files agree.

- **When the box is capped** (from about 1733px), the box is still 5:4 and the crop rule is the same, so the candle stays at 43.1% / 57% of the box and the percentages hold.
- Contrast: the glow never sits under text or controls, so no text pair involves it (T40/T41 stay margin checks only).

### 3.5 Header relationship

- **The hero sits below the header, in flow, never under it** (layout-shell §6.1). The header is transparent at rest over its own strip of bg-page, and opaque bg-raised once the page is scrolled more than 8px.
- So **header text never meets the hero image**, and header.md §8.3's over-image variant (`data-over-image`) is **not used**. The crescent in `hero-mobile`, which header.md measured behind the bag and menu buttons, is never under the bar (and the base crop removes it anyway).
- At lg+ the image box starts directly at the header's bottom edge. Its top 8% is feathered, so the bar at rest sees bg-page and the faint top of the night sky fading in below it, never the image behind its text.
- When the hero scrolls under the header, the header is already opaque (header.md §8.2).

### 3.6 Entrance motion (motion.md §5.1) and the LCP rule

**LCP decision: option (b) at every breakpoint. The h1 is never animated.** Only the eyebrow, the subcopy and the CTA group carry `data-hero-reveal`. The image and the glow are visible from the first paint.

Areas, for the build review (option (a) would also hold, but (b) removes the risk on short phones):

| Width | Hero image (rendered box) | In the first viewport | h1 text block | Subcopy block |
|---|---|---|---|---|
| 390 | 390 × 390 = **152,100 px²** | 390 × 173 = **67,470** at 664 tall; the whole box at 844 | 350 × 92 = **32,200** | 350 × 86 ≈ 30,100 (3 lines) |
| 1440 | 814 × 651 = **529,914 px²** | all of it | 514 × 168 ≈ 86,350 | 514 × 64 ≈ 32,900 (2 lines) |

The image is the expected LCP element at both widths. Whatever the build review measures, nothing that could be the LCP element is ever at opacity 0.

**Decision (hero follow-ups from M2.2): a CSS-only entrance that starts at first paint** (option (c) of the M2.2 follow-up). It replaces the `hero-pending` head script, the 2500ms timer and the GSAP tween.

Why: tech-agent measured, on slow 4G with a 4× CPU slowdown, the image painting at about 1.7 s while the JS-driven text waited for hydration (about 2.8 s) and finished at about 3.7 s. A CSS animation starts with the first paint, so the message and the CTAs finish arriving about 0.9 s after the hero first shows, whatever the JS is doing, and the plain `<a>` CTAs work before hydration. On a fast connection it looks exactly as before (the same 24px, 700ms, `--ease-enter` and 100ms stagger), and it can't be left hidden if JS fails, because it ends visible by itself. It also removes GSAP from the hero entirely (M2.2 loads none; §9). Options (a) and (b) were set aside: (a) would split the hero into two behaviours and still leave the eyebrow and subcopy waiting on JS, and (b) would race hydration on mid-range phones (the entrance would play on some loads and be skipped on others) and still wait on a timer, not on the paint.

| Step | What happens |
|---|---|
| Server HTML | The eyebrow, the subcopy and the CTA group carry `data-hero-reveal` and a reveal order in DOM order: **0, 1, 2** (`--reveal-order`, set by the server as an inline custom property or a class; tech-agent's call). On `/` in M2.2, where the hero has no CTAs yet, the targets are the eyebrow (0) and the subcopy (1). |
| First paint (`prefers-reduced-motion: no-preference`, and `<html>` without `data-motion="off"`) | The global stylesheet's `hero-reveal` keyframes run once on each target: `opacity 0 → 1`, `translateY(var(--motion-distance-lg)) → none` (24px), `animation-duration: var(--duration-slower)` (700ms), `animation-timing-function: var(--ease-enter)` (`cubic-bezier(0.165, 0.84, 0.44, 1)`), `animation-fill-mode: backwards`, `animation-delay: calc(var(--reveal-order) * var(--stagger-loose))` (0 / 100 / 200ms; the 200ms spread is under the 400ms cap). The whole entrance takes **0.9 s from the hero's first paint**. The exact CSS is in motion.md §5.1. |
| Hydration | Nothing. No client code touches the hero. Hydration reuses the server DOM, so the animation doesn't restart. |
| What moves | Only `opacity` and `transform` on those targets. Their space is reserved by normal layout, so there is no shift. After the animation ends, no inline style, `will-change` or fill state remains. |
| Reduced motion | No animation is declared: everything is visible at first paint (motion.md §6.2). |
| `html[data-motion="off"]` (the M8.8b hook from M1.19) | Excluded by the selector, so no entrance. M8.8b sets the attribute from the stored preference before first paint. If it is switched on after the hero has painted, the entrance has already finished. |
| No JS, or the JS fails | The same as with JS: the animation runs and ends visible. |
| A client-side navigation back to `/` | The hero is inserted fresh and plays its entrance once, from its first paint in that view (never a flash). A back/forward-cache restore doesn't replay it. |

Expected timing (the build review records the real figures):

| Profile | Before (head script + GSAP, measured in M2.2) | Now (CSS) |
|---|---|---|
| Slow 4G, 4× CPU (390) | image ≈ 1.7 s; text hidden until ≈ 2.8 s, done ≈ 3.7 s | the text starts at the hero's first paint (FCP) and is done by FCP + 0.9 s; the image (LCP) is unchanged |
| Fast 4G, 2× CPU | the entrance started at ≈ 0.8 s | starts at FCP |
| Desktop | ≈ 0.2 s | starts at FCP |

- **Build-review acceptance:** on tech-agent's slow-4G / 4× CPU probe at 390 (`/dev/hero`, which has the CTA group), the last reveal target's **animation end time** is at most **FCP + 1.0 s**; the LCP element is still the hero `<img>`; CLS is 0.
  - **The measure is the animation's own end time, not the event.** For each `[data-hero-reveal]` target, take its `hero-reveal` animation from `document.getAnimations()` and compute `startTime + delay + duration` (`startTime` on the document timeline; `delay` and `duration` from `effect.getTiming()`, in ms). The latest of these is compared with the `first-contentful-paint` paint entry's `startTime` (the same time origin). Capture the `Animation` objects while they run (a finished animation with `fill: backwards` drops out of `document.getAnimations()`), and read `startTime` once it is resolved.
  - **Secondary figure:** the last target's `animationend` event time is recorded too, but it is not the pass/fail measure. Under hydration long tasks on 4× CPU the event can be dispatched late even when the compositor animation finished on time.
- The CTA group is hit-testable throughout (opacity doesn't block taps), and the plain fragment links need no JS.

The image doesn't zoom or animate on hover (it isn't interactive).

### 3.7 States

| Element | Default | Hover | Focus-visible | Active | Disabled / loading / empty / error |
|---|---|---|---|---|---|
| Primary CTA "Shop favorites" | `cta-bg` ember-400, text `text-inverse`, `rounded-pill`, `type-button`, padding 12 / 24, `border: 1px solid transparent` | ember-300 fill plus the CTA glow `::after` fading in (opacity, `duration-fast`) | default fill + the glow + the focus ring (2px gold-300, 2px offset) | `scale(0.98)`, ember-500 | never disabled. If the bestsellers section is omitted (§5.1), this CTA becomes **"Explore collections" → `#collections`** and the text link is not rendered. If both sections are omitted, the hero shows no CTAs (the h1 and subcopy remain). |
| Text link "Explore collections" | gold-300, underlined (1px, 0.2em offset), `type-nav`, followed by a 16px arrow (`aria-hidden`, `currentColor`), `min-height: 44px`, inline-flex, **32px from the CTA** (§3.2) | moon-100, underline stays | the focus ring | as hover | not rendered when the collections section is omitted (§4.6) |
| Image | visible from the first paint; `bg-raised` shows as the box colour before the image decodes (no white flash; the box reserves the space) | — | — | — | If the file fails, the box shows bg-raised with the feather. No broken-image icon text is visible; the alt is still exposed. |

**The CTA glow is allowed here** (tokens.md §2.5 rule 9). Its footprint is the button's box plus 26px on every side, and all of it lies over solid bg-page (beyond the gutter at base it is clipped by the band's `overflow: clip`). What falls inside it:

- **The subcopy** (text-secondary, body-lg), whose last line box ends 24px above the CTA, so the footprint's top 2px reach it. text-secondary is one of rule 9's allowed text colours. Over the CTA glow on bg-page it is **6.04:1** (working in §10.5); the family's worst case is 4.71:1 (T55, over bg-overlay). Both pass 4.5:1.
- **The CTA's own focus ring** (U16, worst 5.21:1; 6.68:1 over bg-page).
- **Nothing else.** The text link sits 32px from the CTA at every breakpoint (below it at base, beside it from md, below it again if it wraps at lg). Its focus ring extends 4px outside its box (2px offset + 2px width), so the ring's nearest edge is 28px from the CTA, outside the 26px footprint. At base the footprint ends 26px below the button; the image box starts 32 + 44 + 32 = 108px below it. At md (link beside the CTA) the box starts 32px below the button, 6px clear.

### 3.8 Where the CTAs go (no dead links)

- The CTAs are **in-page anchors**, so they work now, never 404 and aren't prefetched:
  - "Shop favorites" → `#bestsellers`
  - "Explore collections" → `#collections`
- "Shop favorites" fits both versions of the section it jumps to: the all-bestsellers row ("Most-loved after dark") and the mixed row ("Favorites and new flames"), §5.3.
- With the sticky header, `html { scroll-padding-top: var(--scroll-offset) }` (layout-shell §3.4) lands each section heading below the bar. `scroll-behavior` stays `auto`.
- Fragment navigation moves the browser's focus-navigation starting point to the section, so the next Tab continues from there. No `tabindex` is added to the sections.
- **Later:** the anchors are deliberately kept after `/shop` and `/collections` go live. A one-tap scroll to products suits the phone visitor, and the sections' own links ("Shop all candles", "See all collections") lead to the full pages (§4.4, §5.4). [confirm with user: keep the hero CTAs as in-page jumps after launch, or point them at /shop and /collections]

### 3.9 Images: sources, `sizes`, priority

Rendered with Next's `getImageProps()` art-direction pattern: one call per source, inside one `<picture>`:

```
<picture>
  <source media="(min-width: 48rem)" srcSet={desktop.srcSet} sizes="(min-width: 64rem) 81vw, 133.3vw" />
  <img {...mobile} sizes="100vw" alt="…" fetchPriority="high" loading="eager" decoding="async"
       class="size-full object-cover" />
</picture>
```

- **`sizes` is the image's rendered width, not the box's** (with `object-fit: cover` the image is wider than its box):
  - base: the box is 100vw wide, and the 4:5 image fills the width → `100vw`.
  - md: the 4:3 box is 100vw wide, and the 16:9 image is scaled to the box height → 576 × 16/9 = 1024px at 768 = `133.3vw` (rounded down, not up: at 768 and DPR 2 it asks for 2047.5px, so the w=2048 candidate is picked; `134vw` asked for 2058px and fetched w=3840, about 33% more bytes).
  - lg+: the box height × 16/9 = 826px at 1024 and 1157px at 1440 ≈ `81vw`. At 1920 (capped box) it is 1365px ≈ 71vw, so `81vw` slightly over-fetches there, which is accepted.
- **Priority:** the hero image is the **only** high-priority, eager image on the page. Every other image on home is lazy (§4, §6).
- **Preload:** Next can't preload both art-directed sources with one hint. tech-agent decides whether to preload the mobile source only (mobile-first audience) with `<link rel="preload" as="image" imagesrcset … media="(max-width: 47.99rem)">`, and checks the Next 16.4 docs for `getImageProps` with `preload` / `priority` (§14).
- Sources: `public/images/hero/hero-mobile.jpg` and `hero-desktop.jpg` (exported in M1.8), statically imported so width and height are known.
- **Alt (both sources, from shot-list.json):** "A lit candle in a smoky blue glass jar on a stone terrace ledge at night, above a still lake, distant hillside lights and a starry violet sky." It is the same string for both sources, so one `alt` on the `<img>` is correct.
- **Flagged placeholder:** `hero-mobile` is flagged in `assets/images/manifest.json` (visible posterization in the bokeh and the lake reflections). **This spec is fine with it for development and the M2 gate.** Before launch it should be regenerated at high quality or upscaled (art-direction.md §9.3, §11 question 1). The 1:1 crop and the bottom feather hide part of the banding but not all of it.

---

## 4. Featured collections (M2.3)

### 4.1 Which collections

**All published collections, by `sortOrder`, at most 6. Gift Sets is included.** With the seed data that is Moonlit Terrace, Starlit Library, Ember Grove, Lakeside Hush, Comet Season (Limited) and Gift Sets.

- Why Gift Sets is in: on home it is a mood like the others, and the six arches make a complete row at xl. The footer drops it only because its Explore group already links Gift sets.
- Comet Season shows a **Limited** badge (from `collection.isLimited`).
- The list is data-driven. If M7 archives a collection or adds one, home follows after revalidation, capped at 6.

### 4.2 Section heading (layout-shell §5.3)

| Element | Copy | Style |
|---|---|---|
| Eyebrow | **Our collections** | `type-eyebrow`, text-accent gold-400 |
| h2 (`id="collections-heading"`) | **Choose your kind of night** | `type-h2`, text-primary |
| Section link (only when the `collections` registry key is live, M3.7) | **See all collections** → `/collections` | the section-link recipe (layout-shell §5.3) |
| Intro | **Each collection gathers the scents of one place, from a moonlit terrace to a quiet lake.** | `type-body-lg`, text-secondary, `max-w-measure-intro` |

### 4.3 Collection card

```
<ul class="CollectionGrid">                                   a plain list
  <li class="CollectionCard">
    <div class="ArchFrame ratio-3/4">  <Image … />  </div>     radius-arch, 1px gold-400/40 inset outline
    <div class="CollectionCard-text">
      [badge "Limited"]                                        only if isLimited
      <h3 class="type-h4">Moonlit Terrace</h3>                 (M3.7+: the name is the link, §4.5)
      <p class="type-body">Cool stone, night flowers and a valley of lights below.</p>
    </div>
  </li>
</ul>
```

- **No card surface.** These are mood windows, not product cards: the arch and its text sit directly on the plain band, over the starfield. The text is inside the `Container` (starfield.md §3.1) and inside elements (never bare text nodes, starfield.md §4.5). No `pointer-events: none` on the image or the text (§4.5 there).
- **Arch frame:**
  - 3:4, `radius-arch` (a semicircular top, tokens.md §5), `overflow: hidden`.
  - Empty colour bg-raised.
  - A 1px gold-400 inset outline at 40% opacity following the arch (decorative; it is the signature of the collection windows).
  - The image is `fill`, `object-cover`, `object-position: 50% 100%`. The col-* images are arch-safe: the subject is in the central 60% and below the top 30%.
- **Text block:** 16px (step 4) below the frame. Inside it: badge, 8px, name, 4px (step 1), tagline.
  - Name: `type-h4` (Cormorant 600, 22–24px), text-primary. It wraps and is never truncated.
  - Tagline: **`type-body`** (Jost 400, 16 → 18px, line-height 1.65), text-secondary, `text-wrap: pretty`. It wraps freely and is never clamped. (body-sm is for meta of at most 2 lines, typography.md §7.4; a tagline can run to 4 lines here, so it is running text.)
- **Limited badge:** the `badge-limited` recipe: gold-400 fill, text-inverse, `type-eyebrow` (source text "Limited", uppercased by CSS), padding 2px 8px, `radius-sm`, `border: 1px solid transparent` (forced colors), `min-block-size` 1.25rem. It is inline, start-aligned, above the name: outside the image, so nothing overlays the photo. Its rendered height is the eyebrow line plus padding and border, about 23–24px (§4.4).
- **Alignment:** grid items stretch, so names in a row share a top line under equal-height frames. Taglines of different lengths simply end at different heights; there is no surface whose bottom edge would show it.

### 4.4 Layout per breakpoint

| | base (390) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Grid | 2 columns (`pair`, span 2 of 4), column gap `--grid-gap` 16 | own list grid `grid-cols-3`, gap 24 (layout-shell §4.3: a list grid with its own recipe) | Grid 12, span 4 (3 per row) | Grid 12, **span 2 (6 in one row)** |
| Row gap | 32 (step 8) | 40 (step 10) | 48 (step 12) | n/a (one row) |
| Card width | 167 | 218.7 | 298.7 | 186.7 |
| Frame (3:4) | 167 × 222.7 | 218.7 × 291.6 | 298.7 × 398.2 | 186.7 × 248.9 |
| Tagline size × line-height / about characters per line | 16 × 1.65 = 26.4px / ~20 | 16.7 × 1.65 = 27.6px / ~25 | 17.2 × 1.65 = 28.4px / ~34 | 18 × 1.65 = 29.7px / ~20 |
| Tagline lines (seed; the longest are Moonlit Terrace's and Comet Season's, 55 characters each) | 3–4 (79.2–105.6px) | 2–3 (55.2–82.8px) | 2 (56.8px) | 3–4 (89.1–118.8px) |
| Name, 1 line (`type-h4` size × 1.25) | 27.5 | 28.4 | 29.0 | 30.0 |
| Limited badge + 8px gap (Comet Season only; eyebrow size × 1.3 + 4 padding + 2 border) | 22.9 + 8 = 30.9 | 23.4 + 8 = 31.4 | 23.7 + 8 = 31.7 | 24.2 + 8 = 32.2 |
| Card height (frame + 16 + [badge + 8] + name + 4 + tagline) | ≈ 349–407 | ≈ 395–454 | ≈ 504–536 | ≈ 388–450 |
| Rows for 6 cards | 3 | 2 | 2 | 1 |

Working for the card-height row (sizes interpolated as typography.md §4: body 16 → 18px is 16.72 at 768 and 17.21 at 1024; h4 22 → 24px is 22.72 and 23.21; eyebrow 13 → 14px is 13.36 and 13.60). The shortest card has no badge and the fewest tagline lines; the tallest is Comet Season (Limited badge, the most lines):

- **base:** 222.7 + 16 + 27.5 + 4 + 79.2 = **349.4**; Comet Season 222.7 + 16 + 30.9 + 27.5 + 4 + 105.6 = **406.7**.
- **md:** 291.6 + 16 + 28.4 + 4 + 55.2 = **395.2**; Comet Season 291.6 + 16 + 31.4 + 28.4 + 4 + 82.8 = **454.2**.
- **lg:** 398.2 + 16 + 29.0 + 4 + 56.8 = **504.0**; Comet Season adds the badge: 504.0 + 31.7 = **535.7**.
- **xl:** 248.9 + 16 + 30.0 + 4 + 89.1 = **388.0**; Comet Season 248.9 + 16 + 32.2 + 30.0 + 4 + 118.8 = **449.9**.
- Tagline wraps at base and xl (about 20 characters): Comet Season "A limited run for" / "the longest," / "brightest winter" / "nights." (4); Moonlit Terrace "Cool stone, night" / "flowers and a valley" / "of lights below." (3). Every other seed tagline is 3 lines there.

- **Why 6 in a row at xl:** a single colonnade of six arched windows is the strongest arch motif on the site. It keeps the collections compact (about 450px of cards with body-size taglines: the single row is as tall as its tallest card, 449.9px) so the bestsellers start within the first two screens. At 1024 six would be 137px wide, too narrow for the names, so lg uses 3.
- The cards get narrower from lg (299) to xl (187), and that is intended. Names still fit on one line at 187px ("Moonlit Terrace" at 24px is about 165px). Taglines wrap to 3–4 short lines of about 20 characters at 18px. That is a narrow measure, but each tagline is a single short sentence, and `text-wrap: pretty` avoids one-word last lines.
- Character estimates use Jost's average lowercase advance of about 0.51em (including the 0.01em tracking). Line counts are guidance only: nothing depends on them, and nothing is clipped.
- With fewer than 6 collections the grid packs from the start and nothing is centred or stretched.
- **`sizes`:** `(min-width: 90rem) 187px, (min-width: 64rem) calc((100vw - 128px) / 3), (min-width: 48rem) calc((100vw - 112px) / 3), calc(50vw - 28px)`.
  - Check: at 390, 167px; at 768, 218.7; at 1024, 298.7; at 1440 and wider, 187.
- `loading="lazy"` (the next/image default). No `priority`.

### 4.5 Links: the M2 state (decision)

**Decision: in M2 the cards render as non-interactive content (no `<a>`, no `tabindex`, no hover effect) until the `collection-pages` feature flag is live (M3.7). Then they become links with no other change.**

- **Why not wait to ship the section:** the collections are the second thing the mockup showed, and they sell the mood. As plain content they are useful already, and they carry no dead link: the M1.20 fixture fails on 404 prefetches, and a non-link has nothing to prefetch.
- **Why no hover in M2:** an image zoom or a border change on something that can't be clicked reads as broken.
- **The flag:** `features["collection-pages"]` in `components/layout/site-routes.ts` (footer.md §3.2.2; it already exists, milestone M3.7). The footer's "Our collections" group reads the same flag, so both switch on together.
- **When live (M3.7):**
  - The `<h3>` holds `<a href="/collections/{slug}">{name}</a>` (`next/link`). The link's `::after` covers the whole card (the stretched-link pattern), so the card's single tab stop is the link, and its accessible name is the collection name alone.
  - The image and the tagline stay outside the link's content, so they are read once, as card content.
  - The focus ring goes on the whole card box via the stretched pseudo-element (`outline` on `a:focus-visible::after`, 2px gold-300, 2px offset), outside the arch clip (tokens.md §7).
  - Hover: the image `scale(1.03)` inside the arch over `--duration-slower`, `--ease-standard` (motion.md §5); the name gets a 1px underline; the cursor is a pointer. Under reduced motion there is no zoom (scale 1), and the underline stays.
  - Active: no scale on the card.
- The section link "See all collections" follows the `collections` registry key (live in M3.7).

### 4.6 States

| State | Behaviour |
|---|---|
| Default (M2) | as §4.3, non-interactive |
| Hover / focus / active | none in M2; from M3.7, §4.5 |
| Loading | none: the page is static; the frame shows bg-raised until the image decodes |
| Empty (no published collection) | **the section is not rendered** (no heading, no space), and the hero's "Explore collections" link is not rendered (§3.7) |
| Error | a repository failure at build fails the build (the preflight, §14). During an on-demand revalidation, Next keeps the last good page. There is no in-page error UI. |
| An image fails | the bg-raised frame stays, the alt is exposed, the text block is unchanged |

### 4.7 Contrast (plain band over the starfield; the cap composite `#2D303F` is from starfield.md §3.2)

| Pair | Ratio |
|---|---|
| Eyebrow gold-400 over the cap | 6.87 (on plain bg-page 9.96, T16) |
| h2 text-primary over the cap | 11.40 (T2 16.52) |
| Intro text-secondary over the cap | 7.76 (T7 11.25) |
| Card name text-primary (h4, normal text, needs 4.5) | 11.40 |
| Tagline text-secondary, body (normal text, needs 4.5) | 7.76 (the colour is unchanged by the move to `type-body`, so the ratio is too) |
| Limited badge text, text-inverse on gold-400 | 9.96 (T31) |
| Section link gold-300 over the cap (M3.7) | 8.58 |
| Focus ring gold-300 over the cap (M3.7) | 8.58 (≥ 3) |
| Arch outline gold-400 at 40% | decorative, exempt |

---

## 5. Bestsellers (M2.4)

### 5.1 Selection rule (decision)

Only two seed products carry the Bestseller badge (Moonrise, Ink & Cedar). Two cards look thin, and padding the row with unbadged products under "Most-loved" would claim something that isn't true. So:

**Up to 4 cards. First, every in-stock product with the `bestseller` badge, by `sortOrder`. Then, if there are fewer than 4, fill with in-stock products with the `new` badge (not already chosen), by `sortOrder`.** Every card visibly carries the badge that qualified it, Bestseller or New (§6.2), and the eyebrow, h2 and intro say exactly what the row is (§5.3).

- Seed result: **Moonrise** (Bestseller), **Ink & Cedar** (Bestseller), **Midnight Balcony** (New), **Quiet Shore** (New). That is three jars and a tin, across three collections. The seed row is therefore the **mixed** variant (§5.3).
- **If the selection holds no bestseller** (all of them archived or out of stock), **the section is not rendered.** A row of only new arrivals in a section the hero calls "favorites" would be untrue. The hero's primary CTA then switches to "Explore collections" (§3.7).
- If the selection holds 1–3 cards, they show as they are and the grid packs from the start.
- `inStock === false` cards are skipped (home shouldn't open with something that can't be bought).
- The rule is a **pure function** over `ProductCard[]` (`selectHomeBestsellers(cards, 4)`, name tech-agent's call). It returns each chosen card **with its qualifying badge** (`"bestseller"` or `"new"`) and whether the row is mixed. It is unit-tested for these cases: the seed case (mixed), ≥4 bestsellers (no fill, not mixed), 0 bestsellers (empty), an out-of-stock bestseller (skipped), and a product that is both bestseller and new (counted once, qualified as `bestseller`, because the bestseller pass runs first).

### 5.2 Layout per breakpoint

| | base (390) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Grid | 2 per row (span 2 of 4) | **2 per row** (span 4 of 8) | 4 in one row (span 3 of 12) | 4 in one row (span 3) |
| Column gap / row gap | 16 / 32 (step 8) | 24 / 32 (step 8) | 24 / — | 32 / — |
| Card width | 167 | 340 | 218 | 296 |
| Card padding | 12 (step 3) | 16 (step 4) | 16 | 16 |
| Image (4:5) | 143 × 178.75 | 308 × 385 | 186 × 232.5 | 264 × 330 |
| Text width / description size / about characters per line | 143 / 16px / ~17 | 308 / 16.7px / ~36 | 186 / 17.2px / ~21 | 264 / 18px / ~28 |
| Description lines (seed; the longest of the four is Ink & Cedar's, 71 characters) | 5–6 (132–158.4px; Ink & Cedar 6) | 2 (55.2px) | 3–4 (85.2–113.6px) | 3 (89.1px) |
| Name lines (`type-h4`, size × 1.25 per line) | 1–2 (27.5 / 55; "Midnight Balcony" wraps at 143px) | 1 (28.4) | 1 (29.0) | 1 (30.0) |
| Card height (border 2 + padding × 2 + image + 12 + badge + 8 + name + 4 + description + 12 + price) | ≈ 444–498 (seed rows ≈ 470 and ≈ 471) | ≈ 584 | ≈ 463–491 | ≈ 567 |

Working for the card-height row:

- **Badge** (one per card on home): eyebrow size × 1.3 + 4 padding + 2 border = 22.9 / 23.4 / 23.7 / 24.2px. **Price line:** price size × 1.3 = 20.8 / 21.7 / 22.4 / 23.4px. The 12px above the price is the minimum auto margin (§6.1).
- **Fixed part** (everything except the name and the description):
  - base: 2 + 24 + 178.75 + 12 + 22.9 + 8 + 4 + 12 + 20.8 = **284.45**
  - md: 2 + 32 + 385 + 12 + 23.4 + 8 + 4 + 12 + 21.7 = **500.1**
  - lg: 2 + 32 + 232.5 + 12 + 23.7 + 8 + 4 + 12 + 22.4 = **348.6**
  - xl: 2 + 32 + 330 + 12 + 24.2 + 8 + 4 + 12 + 23.4 = **447.6**
- **base:** row 1 (Moonrise 5 lines, Ink & Cedar 6 lines, both names 1 line) is as tall as Ink & Cedar: 284.45 + 27.5 + 158.4 = **470.35**. Row 2 (Midnight Balcony: 2-line name, 5 lines; Quiet Shore: 5 lines) is 284.45 + 55 + 132 = **471.45**. The range runs from 284.45 + 27.5 + 132 = **443.95** (a 1-line name with 5 lines) to 284.45 + 55 + 158.4 = **497.85** (a 2-line name with 6 lines; not in the seed rows).
- **md:** 500.1 + 28.4 + 55.2 = **583.7** (every seed card).
- **lg:** 348.6 + 29.0 + 85.2 = **462.8** (3 lines) to 348.6 + 29.0 + 113.6 = **491.2** (4 lines).
- **xl:** 447.6 + 30.0 + 89.1 = **566.7** (every seed card).
- Ink & Cedar at base (about 17 characters per line): "Black tea, old" / "paper and" / "cedarwood. The" / "scent of a" / "library after" / "hours." (6 lines). Moonrise: "Night jasmine and" / "bergamot on cool" / "terrace air. An" / "easy first" / "candle." (5 lines).

- **Why 2 per row at md (changed in fix round 1):** with body-size descriptions, 4 cards in a row at 768 left only 134px of text, so descriptions ran to 5–6 lines of about 15 characters. Two per row gives 308px of text (2 lines) and a large, clear product image. The section is taller at md (two rows of about 584px), which is acceptable on a tablet. lg and xl keep 4 in a row.
- The cards are a `<ul>` of `<li>`s. Grid rows stretch, so the cards in a row are equal height. Inside each card the text block is a flex column with the price pushed to the bottom (`margin-block-start: auto`), so prices line up.
- Line counts use the same 0.51em estimate as §4.4 and are guidance only. Descriptions are never clamped.
- These are product cards, so the band stays `plain` or `solid`, never haze (tokens.md §2.5 rule 3). The cards themselves sit on bg-raised.

### 5.3 Section heading

The heading has two variants. `selectHomeBestsellers` says which one applies.

| Element | All bestsellers (no fill) | Mixed (bestsellers plus new arrivals; the seed case) | Style |
|---|---|---|---|
| Eyebrow | **Bestsellers** | **Bestsellers and new arrivals** | `type-eyebrow`, gold-400 |
| h2 (`id="bestsellers-heading"`) | **Most-loved after dark** | **Favorites and new flames** | `type-h2`, text-primary |
| Intro | **Our most-loved scents, lit night after night.** | **Our bestsellers, and the newest scents to join them.** | `type-body-lg`, text-secondary, `max-w-measure-intro` |
| Section link (only when the `shop` registry key is live, M3.5) | **Shop all candles** → `/shop` | the same | the section-link recipe |

- Why a second h2: with 2 of 4 cards new, "Most-loved after dark" would claim that the new arrivals are loved too. "Favorites and new flames" names both halves of the row, and "new flames" fits the candle theme without claiming anything.

### 5.4 Links and the bag action: the M2 state (decision)

- **Product links:** product pages arrive in M4.3, so the cards are **non-interactive** in M2, exactly as in §4.5. A new feature flag, **`features["product-pages"] = { milestone: "M4.3", live: false }`**, is added to the same `features` map in `components/layout/site-routes.ts` (footer.md §3.2.2 gains this row). When it is live:
  - the product name becomes the card's single stretched link to **`/products/{slug}`**, built by one helper (`productHref(slug)`). The route is proposed here; M4.1 confirms it `[M4.1 confirms]`.
  - The hover and focus states in §6.3 switch on.
- **"Add to bag":** the bag arrives in M5.4. In M2–M4 there is **no button at all**: not disabled and not hidden, just absent, with **no space reserved**. A disabled "Add to bag" on a home page reads as out of stock. The quick-add action and its states belong to M3.1 (product card) and M5.4 (bag), which add it as a build-time change (no runtime shift).
- The section link "Shop all candles" follows the `shop` registry key (live in M3.5).
- e2e (M2): no `<a>` and no `<button>` inside `#collections ul` or `#bestsellers ul` while the flags are off.

### 5.5 States

| State | Behaviour |
|---|---|
| Default (M2) | the cards as §6, non-interactive; the heading variant from §5.3 |
| Hover / focus / active | none in M2; from M4.3, §6.3 |
| Loading | none (static) |
| Empty (no bestseller) | the section is not rendered, and the hero CTA falls back (§3.7, §5.1) |
| Error | as §4.6 |

---

## 6. Product card: the baseline for M3.1

**Decision:** this spec defines the card's **anatomy, tokens and M2 state**. It is the source of truth that **M3.1 adopts and extends** (quick add, variants hint, sale price, out-of-stock state, the hover zoom details, and the move to `design/components/product-card.md`). M3.1 may revise anything here as long as it says what changed. Home then picks up the revision with no spec change here.

**Current spec: [`product-card.md`](../components/product-card.md)** (M3.1) owns the card from M3.2 on: anatomy, states, quick add, sizes per context and its e2e checks. Its §12 lists what changed against this section, which stays as the M2 baseline.

### 6.1 Anatomy

```
<li>
  <article class="ProductCard">                         bg-raised, radius-md, 1px border-divider, shadow-raised, padding 12 / 16
    <div class="ArchFrame ratio-4/5">  <Image alt="" … />  </div>     radius-arch, no outline
    <div class="ProductCard-text">                      12px (step 3) below the frame
      <ul class="Badges" aria-label="Labels">           only if the product has badges (§6.2)
        <li class="badge-bestseller">Bestseller</li>
      </ul>
      <h3 class="type-h4">Moonrise</h3>                 (M4.3+: the name is the stretched link)
      <p class="type-body">Night jasmine and bergamot on cool terrace air. An easy first candle.</p>
      <p class="type-price">From $34.00</p>
    </div>
  </article>
</li>
```

- Spacing inside the text block: badges, 8px (step 2), name, 4px (step 1), short description, 12px minimum (step 3, the auto margin above the price), price.
- **Image:** `cardImage` (the `cat-*` catalog shot), 4:5, `radius-arch`, `fill`, `object-cover`, `object-position: 50% 50%`. The catalog shots keep the product below the top 25%, so the arch never cuts it (art-direction.md §4.1). Empty colour bg-raised.
  - **`alt=""`** on the card: the name and short description that follow give the content, and the full catalog alt is used on the product page (art-direction.md §7 allows this; M3.1 confirms).
  - No glow or halo: home cards stay calm (`shadow-glow-candle-soft` is reserved for a "featured" variant, if M3.1 defines one).
- **Name:** `type-h4` (Cormorant 600, 22–24px), text-primary, wraps to 2–3 lines and is never truncated (typography.md §5).
- **Short description:** `shortDescription` (≤ 20 words), **`type-body`** (Jost 400, 16 → 18px), text-secondary, `text-wrap: pretty`. It wraps and is never clamped (WCAG 1.4.12: no clipping). It runs to **2–6 lines** depending on the breakpoint (6 at base for Ink & Cedar, §5.2), so it is running text, not body-sm meta (typography.md §7.4).
- **Price:** `type-price` (Jost 500, tabular), text-primary. Format with `Intl.NumberFormat("en-US", { style: "currency", currency })` from minor units:
  - `priceFrom === priceTo` → **"{price}"** (for example "$18.00");
  - otherwise → **"From {priceFrom}"** (for example "From $34.00").
  - Currency is USD `[confirm with user: currency]`, as in catalog.md.
- `<article>` gives each card a self-contained unit for assistive tech without making it a landmark.

### 6.2 Badges

| Badge | Token | Look | Display order |
|---|---|---|---|
| Limited | `badge-limited` | gold-400 fill, text-inverse | 1 |
| New | `badge-new` | transparent on bg-raised, 1px gold-400 border, gold-400 text | 2 |
| Bestseller | `badge-bestseller` | same outline style as New; the label tells them apart | 3 |

- Labels come from `microcopy.badgeLabels` (sentence case in the source, `type-eyebrow` uppercases them).
- At most **2** badges per card, shown in the order above.
- **On home, the qualifying badge is always shown** (§5.1). The card receives its qualifying badge (`bestseller` or `new`) from `selectHomeBestsellers`. If the product has more than 2 badges, the card shows the qualifying badge plus the first other badge in display order, and the pair is then shown in display order. Example: a product badged Limited, New and Bestseller that qualified as a bestseller shows **Limited, Bestseller** (not Limited, New). With 2 badges or fewer, nothing is dropped. Unit test: that example, and a Limited + New + Bestseller product qualifying as new is impossible (the bestseller pass runs first), so the test asserts it qualifies as bestseller.
- Outside home (M3.1 and later) the card has no qualifying badge, and the plain "first 2 in display order" rule applies until M3.1 says otherwise. The prop is optional (name tech-agent's call, for example `pinnedBadge`).
- A wrapping row (`flex-wrap`, gap 8px), padding 2px 8px, `radius-sm`, `min-block-size` 1.25rem.
- Never over the image.
- The list's `aria-label` is "Labels", so screen readers announce "Labels, list, 1 item, Bestseller". That keeps the label from running into the name.

### 6.3 States

| State | M2 (no link) | From M4.3 (`product-pages` live) |
|---|---|---|
| Default | as §6.1 | as §6.1 |
| Hover | none | border `border-accent` (gold-400, U5 8.96), image `scale(1.03)` inside the arch (`--duration-slower`, `--ease-standard`), the name gets a 1px underline |
| Focus-visible | — | the stretched link's ring around the whole card (2px gold-300, 2px offset, outside the arch clip) |
| Active | — | no scale on the card |
| Disabled | never | never (an unbuyable product is omitted, §5.1; M3.1 defines out-of-stock) |
| Loading / empty / error | static page; the frame shows bg-raised until the image decodes | same |
| Reduced motion | — | no zoom; the border and underline changes stay |

### 6.4 Contrast (bg-raised `#131A38`)

| Pair | Ratio |
|---|---|
| Name text-primary (h4, normal text) | 14.85 (T3) |
| Short description text-secondary, body (normal text) | 10.12 (T8; unchanged by the move to `type-body`) |
| Price text-primary | 14.85 (T3) |
| New / Bestseller badge text and border gold-400 | 8.96 (T33, T56, U5) |
| Limited badge text-inverse on gold-400 / the fill vs bg-raised | 9.96 (T31) / 8.96 |
| Hover border gold-400 (M4.3) | 8.96 (U5) |
| Focus ring gold-300 around the card, over the plain band (cap composite) | 8.58 |
| Card border night-600 | decorative (X6); it is never the only boundary of a control |

### 6.5 `sizes`

The image width is the card width minus 2 × padding: `(min-width: 90rem) 264px, (min-width: 64rem) calc((100vw - 152px) / 4 - 32px), (min-width: 48rem) calc((100vw - 88px) / 2 - 32px), calc((100vw - 56px) / 2 - 24px)`.

- Check: at 390, 143; at 768, 308; at 1023, 435.5 (the largest card image on home, so the `cat-*` originals at 1600px wide cover it at 3x); at 1024, (1024 − 152) / 4 − 32 = **186**; at 1440, 264.
- Lazy (the default). Storage URLs go through the M1.6 `remotePatterns` setup.

---

## 7. Brand story (M2.5)

### 7.1 Content (no maker claims)

| Element | Copy | Style |
|---|---|---|
| Eyebrow | **About Starflames** | `type-eyebrow`, **gold-300** (over haze, typography.md §6.7) |
| h2 (`id="story-heading"`) | **Lit slowly, after dark** | `type-h2`, text-primary |
| Paragraph 1 | **We think the best part of the day is the hour after dark, when the house goes quiet and one small flame is enough.** | `type-body-lg`, text-primary, `max-w-measure-intro` |
| Paragraph 2 | **So every Starflames scent begins with a place you could almost step into: a stone terrace above a valley of lights, a reading room under a window full of stars, a lantern-lit path through the pines, a lake so still it holds the moon twice. Light one, slow down, and let the evening take its time.** | `type-body-lg`, text-primary, `max-w-measure-prose` |
| Link (only when the `our-story` registry key is live, M8.2) | **Read our story** → `/our-story` | the section-link recipe, gold-300, underlined |

- The mockup's heading, "Poured by hand, after dark", is rewritten without the production claim, keeping its rhythm ("…, after dark"). The copy speaks about atmosphere, the scents' inspiration and intention only: nothing about who pours them, how, in what batches, or from what materials (catalog.md §2).
- No CTA button: the section is a pause, and the page's one ember CTA is the hero's (tokens.md §2.5 rule 1).

### 7.2 Band and layout

- **Band `dusk`:** `--gradient-haze-dusk` with `--gradient-haze-veil` layered (no blush). That stays inside the haze ceiling (tokens.md §2.4), so the worst case behind text is at or below haze worst `#663B6D`.
- A `gradient-starlight-rule` along the inside bottom edge (§2.2).
- Padding: `--section-y`.

| | base | md | lg | xl |
|---|---|---|---|---|
| Composition | stacked: illustration (centred), 32px (step 8), text | Grid 8: illustration cols 1–3, text cols 4–8 | Grid 12: illustration cols 1–5, text cols 7–12 | as lg |
| Illustration size | **240 × 192** (scale 0.667 of the viewBox; fits the 280px content width at 320) | 100% of its column (about 249 wide, scale 0.69), 5:4 | up to 360 × 288 (scale 1), centred in its column | 360 × 288 |
| Vertical alignment | — | `align-items: center` | center | center |

The DOM order is illustration, then text, which matches the visual order at every breakpoint. The illustration isn't focusable either way.

### 7.3 Illustration: an inline SVG motif (the brand-story photo is on hold)

`brand-story` is not generated (art-direction.md §4.4: it implies in-house making, which the user hasn't confirmed). Using a `col-*` mood here would repeat an image already shown in the collections section. So: **an inline SVG**, `aria-hidden="true"`, `focusable="false"`, `data-decorative`, `viewBox="0 0 360 288"`, made of the brand motifs only. Sizes below are in viewBox units (= CSS px at lg/xl, scale 1):

- **A thin crescent moon:** a 2px gold-300 stroke with a 20% gold-300 fill, about 120 tall, upper start of the box, opening towards the end side.
- **A small flame:** gold-400 fill (ember stays scarce, tokens.md §2.5 rule 1), 28 tall. It rests in the crescent's lower curve, as if the moon were holding a candle flame.
- **One invented constellation:** the starfield's **Ribbon** pattern (starfield.md §4.3: 6 stars, a loose S), scaled 2.5×, running from the crescent's tip towards the lower end. Lines: the `constellation` role (gold-300 at 35%), 1px, stopping 3 units short of each star. Stars: moon-50 dots, **radius 1.5** (3 across), at opacity 0.9.
- **Three four-point stars** (the `components/icons` shape, filled, no stroke): gold-300, **12 / 14 / 18** across, at the upper end, the lower start and beside the flame, at opacity 0.85.
- Nothing else. No text, no ember, no figures.

**Thin strokes at small sizes:** the SVG scales down to 0.667 at base and 0.69 at md, which would thin a 1px line to about 0.67px. So:

- **Every stroked element** (the crescent's outline and the constellation lines) has **`vector-effect: non-scaling-stroke`**. The crescent stays a 2px stroke and the lines stay 1px CSS at every size.
- **Filled shapes scale, with minimums:** the star dots render at 2.0px across at base (3 × 0.667) and 2.1px at md, never below 2px. The smallest four-point star renders at 8px at base (12 × 0.667) and 8.3px at md. The flame renders at about 19px at base. These are the minimum rendered sizes; if tech-agent's final path data makes any shape smaller than this at base, it enlarges the shape in the viewBox rather than adding a second artwork.
- The 3-unit gap between a line and its star becomes 2px at base, which still reads as a gap.

The illustration sits in its own grid area and never under or behind text. Over dusk it is decorative, so no ratio is required. Forced colors: hidden (`data-decorative`). Print: hidden.

### 7.4 States

Static content: no hover, focus, loading, empty or error states. The section always renders (its copy is static). The "Read our story" link appears when `our-story` is live, and then takes the section-link states (hover moon-100, focus ring).

### 7.5 Contrast over dusk (worst case haze worst `#663B6D`)

| Pair | Ratio |
|---|---|
| Eyebrow gold-300 (small text) | 5.72 (T38) |
| h2 text-primary | 7.59 (T36) |
| Paragraphs text-primary, body-lg | 7.59 (T36) |
| Link gold-300, underlined (M8.2) | 5.72 (T38) |
| Focus ring gold-300 (M8.2) | 5.72 (U8) |

text-muted, status text and form controls are not used in this band (tokens.md §2.5 rules 4, 7, 8).

---

## 8. Newsletter ("Join the night list"): reserved

- **Its place in the order:** section 5, after the brand story, on a **`sunken`** band (§2.1; M2.6 confirms).
- **The band is a logged departure** from the earlier "solid bg-haze" wording (§2.1). tokens.md §2.5 rule 7 and art-direction.md §5 now say "solid bg-haze or bg-sunken", so M2.6 may use `sunken` here (border-control 4.74:1, U3) without contradicting either file.
- **It ships only when all three are done:** M2.5a/M2.5b (the `/privacy` page, with legal text from the user), M2.6 (the component spec) and M2.7 (the signup works). It renders when `features.newsletter` is live (footer.md §3.2.2).
- **Home state until then:** **the section is omitted. There is no element, no heading, no placeholder copy and no reserved space.** The brand story is followed directly by the footer. The page is static, so the band appearing in a later build never shifts anything at runtime.
- **When it ships:** home renders the footer **without** its newsletter slot (`newsletter={false}` or equivalent), so the page never has two signup forms (footer.md §2.4).
- Reserved copy: the heading **Join the night list**. Everything else (intro, field label, button, consent line, messages) belongs to M2.6.

---

## 9. Motion

All motion follows motion.md: only `transform` and `opacity` animate, nothing moves layout, and content is visible by default.

| Section | What moves | Trigger | Values | Reduced motion |
|---|---|---|---|---|
| Hero | eyebrow, subcopy, CTA group (not the h1, not the image, not the glow) | **the hero's first paint, CSS only** (the `hero-reveal` keyframes, §3.6, motion.md §5.1); no JS | `opacity 0→1`, `translateY(24px)→none`, `--duration-slower` (700ms), `--ease-enter` (`cubic-bezier(0.165, 0.84, 0.44, 1)`), `animation-delay` = reveal order × `--stagger-loose` (0 / 100 / 200ms), fill `backwards` | no animation declared; visible at first paint |
| Collections | (1) the SectionHeading block as one target; (2) the cards | ScrollTrigger on the section, `start: "top 85%"`, `once: true` | `opacity 0→1`, `y 16→0`, `--duration-slower`, `--ease-enter`; cards `stagger: { amount: Math.min(0.4, (n - 1) * 0.06) }`, the cards starting 0.1s after the heading | instant, no pre-hidden state |
| Bestsellers | the heading block, then the cards | the same | the same | instant |
| Brand story | the illustration, then the text block (eyebrow, h2, paragraphs as one target) | the same | the illustration: `opacity 0→1` only; the text: `opacity 0→1`, `y 16→0` | instant |
| Collection and product cards (from M3.7 / M4.3) | the image inside the arch | pointer hover on the card | `scale 1→1.03`, `--duration-slower`, `--ease-standard` | no zoom (scale stays 1 via `--motion-scale-hover`) |
| Primary CTA | the glow pseudo-element; the press scale | hover / focus; `:active` | opacity, `--duration-fast`; `scale(0.98)` | glow opacity kept (150ms); no scale |

Rules:

- **The hero is the one CSS-driven entrance** (motion.md §1, §5.1). It is declared only under `prefers-reduced-motion: no-preference` and outside `html[data-motion="off"]`, starts at first paint and ends visible without JS. No script reads or writes the hero's reveal targets.
- **Section-reveal pre-hidden states are set only in the `no-preference` branch of `gsap.matchMedia()`, and only for sections whose start line is still below the viewport when the reveal code sets up** (after `load` + idle, see Performance). A section already past `top 85%` at that moment (a reload mid-page, arriving via `#bestsellers`, or a visitor who scrolled before the code loaded) is left visible and gets no trigger (motion.md §5).
- `html[data-motion="off"]` (the M8.8b hook) skips every reveal and the hover zoom, exactly like reduced motion. If the preference changes mid-session, `gsap.matchMedia()` reverts the inline styles, so nothing stays hidden.
- No ScrollTrigger `scrub` or `pin`, no parallax, no animated masks or `box-shadow`, no SVG line-drawing (that would animate `stroke-dashoffset`, which isn't transform or opacity). The brand-story illustration simply fades in.
- No ambient loops on home beyond the starfield (no glow breathing, no twinkle in the illustration). This keeps M8.8b's pause control simple.
- **CLS:** zero from motion. Every reveal starts at its final layout position, offset only by transform. Every image box has an `aspect-ratio`. The feather masks are static. Target: CLS < 0.05 page-wide at 390 and 1440 (layout-shell §13.3).

**Performance (@perf):**

- **The hero needs no JS** (§3.6). In **M2.2, `/` loads no GSAP and no motion island**: the first-load JS stays at the M1 baseline, give or take shared-chunk churn, and the build review records it.
- **From M2.3**, one client island, `HomeMotion` (name tech-agent's call), runs the section reveals. It loads `gsap` core and `ScrollTrigger` with a **dynamic `import()` after the `load` event plus idle** (`requestIdleCallback` with a timeout of about 2 s, or a `setTimeout` fallback where it is missing), registers ScrollTrigger once, and sets up the three triggers. So GSAP is never part of `/`'s first-load JS and never competes with the hero image on a slow phone.
- Three triggers in total, each `once: true`, so each is killed after it fires.
- No scroll listeners of its own. No work while the tab is hidden (GSAP's ticker already sleeps).
- GSAP is not imported by the root layout or any shared component. Home is the only route that loads it in M2.
- The build review records: the home route's first-load JS against the M1 baseline, the LCP element and its time at 390 and 1440 under Lighthouse mobile throttling, the hero's FCP and its last reveal's animation end time on the slow-4G probe (with the `animationend` event time as a secondary figure, §3.6), and CLS.

---

## 10. Accessibility

### 10.1 Heading outline and landmarks

```
banner (header)
main
  region "Light a little starlight."   h1  (hero; the eyebrow and h1 in an hgroup)
  region "Choose your kind of night"   h2  → h3 × up to 6 (collection names)
  region "Favorites and new flames"    h2  → h3 × up to 4 (product names)   (seed: mixed; "Most-loved after dark" when all are bestsellers)
  region "Lit slowly, after dark"      h2
  [region "Join the night list"        h2  — M2.6/M2.7]
contentinfo (footer; its h2s start after main's)
```

- **One h1, the hero heading.** The wordmark is never a heading.
- Each section is a `<section aria-labelledby>` named region (four now, five with the newsletter, within layout-shell's six).
- Eyebrows are `<p>`s grouped with their heading in `<hgroup>` (typography.md §6.1): the hero's eyebrow with the h1 (§3.1), and each section eyebrow with its h2.
- Card names are `<h3>` styled `type-h4`. No level is skipped.
- Collection and product lists are `<ul>`s, so screen readers announce their counts.

### 10.2 Keyboard and focus order (M2)

Skip link → wordmark → **"Shop favorites"** → **"Explore collections"** → (nothing focusable in the collections, bestsellers or brand story sections in M2) → (footer: nothing focusable in M1.17).

- Later, in DOM order: each section link after its h2 (when live), each card's single stretched link (M3.7 / M4.3), "Read our story" (M8.2), the newsletter form (M2.7).
- **Focus treatment:** the global ring (2px gold-300, 2px offset).
  - On the ember CTA the ring sits on bg-page: X5 is why the offset is mandatory.
  - The text link's ring stays outside the CTA's glow footprint (§3.7).
  - Stretched-card rings are drawn on the link's `::after` around the whole card, never clipped by the arch.
- **Fragment targets:** after "Shop favorites", the section's heading lands below the sticky header (`scroll-padding-top`), and the next Tab continues inside that section.

### 10.3 Touch targets

| Control | Size |
|---|---|
| Primary CTA | min-height **48px**; full width (350px) at base, auto (≥ 44px wide) from md |
| "Explore collections" text link | min-height **44px**, inline-flex, **32px** below the CTA at base, 32px beside it from md (32px below it if it wraps at lg) |
| Section links (later) | min-height 44px (layout-shell §5.3) |
| Card stretched links (later) | the whole card (167 × about 470px at 390; 132px wide at 320) |

### 10.4 Alt text

| Image | Alt |
|---|---|
| Hero (both sources) | "A lit candle in a smoky blue glass jar on a stone terrace ledge at night, above a still lake, distant hillside lights and a starry violet sky." |
| Collection cards | the collection's `moodImage.alt` from the data (written in shot-list.json, §11.3). They describe the scene, which the name and tagline don't, so they are not empty. |
| Product cards | `alt=""` (the name and description follow; §6.1) |
| Brand-story SVG, hero glow, starlight rules, arch outlines, the CTA arrow | decorative: `aria-hidden="true"` |

### 10.5 Contrast summary (every pair this page introduces or uses)

| Where | Pair | Ratio | Needs |
|---|---|---|---|
| Hero (solid bg-page) | eyebrow gold-400 | 9.96 (T16) | 4.5 |
| | h1 text-primary (display-1) | 16.52 (T2) | 3.0 (large) |
| | subcopy text-secondary (body-lg), on bg-page | 11.25 (T7) | 4.5 |
| | subcopy text-secondary, the strip inside the CTA glow footprint | **6.04** over bg-page (working below); 4.71 family worst case (T55) | 4.5 |
| | CTA text-inverse on ember-400 / hover ember-300 / active ember-500 | 10.81 / 12.99 / 8.85 (T27–T29) | 4.5 |
| | CTA shape ember-400 vs bg-page | 10.81 (U1) | 3.0 |
| | text link gold-300 (outside the CTA glow footprint) | 12.45 (T20) | 4.5 |
| | text link focus ring (outside the footprint, on bg-page) | 12.45 (U7) | 3.0 |
| | CTA's own focus ring, inside its glow | **6.68** over bg-page (working below); 5.21 family worst case (U16) | 3.0 |
| Collections, bestsellers headings (plain, over the starfield cap) | eyebrow gold-400 / h2 text-primary / intro text-secondary / link gold-300 | 6.87 / 11.40 / 7.76 / 8.58 | 4.5 |
| Collection cards (plain) | name / tagline (body) / Limited badge | 11.40 / 7.76 / 9.96 | 4.5 |
| Product cards (bg-raised) | §6.4 (description now body) | 8.96–14.85 | 4.5 |
| Brand story (dusk, haze worst) | §7.5 | 5.72–7.59 | 4.5 |

**Working: the CTA glow over bg-page** (method as tokens.md §3 and accessibility.md §2; ratios rounded down).

- Composite at the glow's 28% peak: ember-400 `#F7B861` (247, 184, 97) over bg-page `#0B0F24` (11, 15, 36): R = 0.28 × 247 + 0.72 × 11 = 77.08; G = 0.28 × 184 + 0.72 × 15 = 62.32; B = 0.28 × 97 + 0.72 × 36 = 53.08 (≈ `#4D3E35`).
- Linearised: R 0.07436, G 0.04866, B 0.03571. L = 0.2126 × 0.07436 + 0.7152 × 0.04866 + 0.0722 × 0.03571 = 0.01581 + 0.03480 + 0.00258 = **0.05319**.
- text-secondary `#C3C6E0`: L 0.57373. (0.57373 + 0.05) / (0.05319 + 0.05) = 0.62373 / 0.10319 = 6.044 → **6.04:1**. (QA measured 6.06; the difference is channel rounding. Both pass.)
- gold-300 `#E8CF96`: L 0.63984. 0.68984 / 0.10319 = 6.685 → **6.68:1** (the CTA's own ring).
- These are lighter-background cases than the family's tabled worst case (over bg-overlay, `#594E55`, T55 / U16), so the tabled ratios remain the floor.

Notes:

- **Text over the hero image:** none at any breakpoint (§3.2, §3.3), so no scrim ratio is needed.
- **The candle glow under text:** none (§3.4).
- **The CTA glow:** its footprint holds only the CTA's own ring and the bottom strip of the text-secondary subcopy, over solid bg-page (tokens.md §2.5 rule 9). The text link and its ring sit outside it (32px gap, ring at 28px). It never overlaps the hero candle glow: at lg+ the CTA sits in the text column, and the candle glow starts ≥ 100px into the image box; at md it ends 6px above the image box, and the candle glow starts 98px into it.
- **No new colour pairs** beyond tokens.md §3 and starfield.md §3.2, except the two over-bg-page glow composites worked out above, which are above their tabled family floors.
- **During the hero entrance** the eyebrow, subcopy and CTA group pass through partial opacity for at most 0.9 s from first paint. That is a transition, not a resting state, so the ratios above are judged at rest (opacity 1), as for every other fade.

### 10.6 Zoom, reflow, text spacing

- At 320px wide: one column. The hero CTA is full width, and the cards are 2-up at 132px wide (names wrap; product descriptions run to about 6–7 lines in 108px of text, collection taglines to about 4–5). There is no horizontal scroll and no `100vw` widths: the hero's full-bleed boxes are `100%` of the band.
- 200% / 400% zoom on a 1280px window gives the md / base layouts. At 400% the header isn't sticky (layout-shell §6.5).
- Under the WCAG 1.4.12 text-spacing override, nothing has a fixed height around text: the hero band and the cards grow, the hero's text link wraps with its 32px gap if needed, and every image box keeps its ratio.

---

## 11. Copy (final)

### 11.1 Page strings

| Where | String |
|---|---|
| Hero eyebrow | **Scented candles for the night** |
| Hero h1 | **Light a little starlight.** (no italic accent at launch, typography.md §6.2, §11 question 2) |
| Hero subcopy | **Inspired by moonlit terraces, starry reading rooms and still lakes, for long, quiet evenings.** |
| Hero primary CTA | **Shop favorites** (→ `#bestsellers`) |
| Hero primary CTA, fallback when the bestsellers section is omitted | **Explore collections** (→ `#collections`) |
| Hero text link | **Explore collections** (→ `#collections`) |
| Collections eyebrow | **Our collections** |
| Collections h2 | **Choose your kind of night** |
| Collections intro | **Each collection gathers the scents of one place, from a moonlit terrace to a quiet lake.** |
| Collections section link (M3.7+) | **See all collections** |
| Bestsellers eyebrow | **Bestsellers** (all bestsellers) / **Bestsellers and new arrivals** (mixed) (§5.3) |
| Bestsellers h2 | **Most-loved after dark** (all bestsellers) / **Favorites and new flames** (mixed) (§5.3) |
| Bestsellers intro | **Our most-loved scents, lit night after night.** (all bestsellers) / **Our bestsellers, and the newest scents to join them.** (mixed) (§5.3) |
| Bestsellers section link (M3.5+) | **Shop all candles** |
| Product card badge list label (`aria-label`) | **Labels** |
| Product card price | **{price}** or **From {priceFrom}** (§6.1) |
| Brand story eyebrow | **About Starflames** |
| Brand story h2 | **Lit slowly, after dark** |
| Brand story paragraph 1 | **We think the best part of the day is the hour after dark, when the house goes quiet and one small flame is enough.** |
| Brand story paragraph 2 | **So every Starflames scent begins with a place you could almost step into: a stone terrace above a valley of lights, a reading room under a window full of stars, a lantern-lit path through the pines, a lake so still it holds the moon twice. Light one, slow down, and let the evening take its time.** |
| Brand story link (M8.2+) | **Read our story** |
| Newsletter h2 (reserved, M2.6) | **Join the night list** |

- The subcopy doesn't start with "Scented candles", so it doesn't repeat the eyebrow. The eyebrow keeps the plain "what we sell" line for a first-time visitor; the subcopy gives the places.
- **Its length is set by the 390 layout (fix round 2).** It is **93 characters** (it was 110; "mountain" and "at home" are gone), so it sets in **3 lines** at 390, as the §3.2 geometry and the §3.6 areas assume:
  - At 390 its measure is the 350px content width (45ch at 18px is wider). At the 0.51em estimate that is about 38 characters per line: "Inspired by moonlit terraces, starry" (36) / "reading rooms and still lakes, for" (34) / "long, quiet evenings." (21).
  - **Margin:** it still sets in 3 lines down to 32 characters per line, that is an average advance of up to 0.61em (20% wider than the estimate): "Inspired by moonlit terraces," (29) / "starry reading rooms and still" (30) / "lakes, for long, quiet evenings." (32). So the real Jost metrics or the size-adjusted fallback don't add a fourth line.
  - At 1024 (379px column, 19.2px, about 38 per line) it is also 3 lines. At 768 and 1440 the 45ch measure sets the width: Jost's "0" is 0.6em, so 45ch is 27em, about 502px at 768 (about 53 characters per line) and 540px at 1440 (20px), capped by the 514px column (about 50 per line). So it sets in **2 lines** there (post-pass minor 2).
  - `text-wrap: pretty` (typography.md §5) may move a word between the last lines; it doesn't add a line in current engines, and e2e check 12 (§14) guards the 390 case. At 320 it may take 4 lines; nothing depends on that.

### 11.2 From the data (catalog.json, not repeated here)

- Collection `name` and `tagline`.
- Product `name` and `shortDescription`.
- The badge labels "Bestseller", "New" and "Limited" (`microcopy.badgeLabels`).

### 11.3 Alt text (shot-list.json; the seed stores the collection alts in `moodImage.alt`)

| Image | Alt |
|---|---|
| `hero-desktop`, `hero-mobile` | A lit candle in a smoky blue glass jar on a stone terrace ledge at night, above a still lake, distant hillside lights and a starry violet sky. |
| `col-moonlit-terrace` | A lit candle in a smoky blue glass jar on a stone balustrade at night, above a valley of town lights, mountains, stars and a crescent moon. |
| `col-starlit-library` | A lit candle in a smoky blue glass jar on an oak reading table beside old leather books and a cup of tea, under a tall window full of stars. |
| `col-ember-grove` | A lit ivory pillar candle on a mossy stone in a pine forest at night, with violet mist and tiny drifting lights between the trees. |
| `col-lakeside-hush` | A lit candle in a smoky blue glass jar on a wooden jetty beside a folded linen throw, over a still, misty lake reflecting the moon and mountains. |
| `col-comet-season` | A lit candle in a smoky blue glass jar and a pack of lilac wax melts on a winter windowsill, with a faint comet over snowy mountains. |
| `col-gift-sets` | An open midnight-blue gift box of lilac-silver travel tins on ivory linen, with a gold ribbon and one tin lit in front. |
| `cat-*` on cards | `""` (§6.1) |

### 11.4 Notes

- No production, material or wellness claims anywhere on the page (catalog.md §2).
- The Gilded Plum shimmer `[confirm with user]` doesn't appear on home: Gilded Plum isn't selected (it is neither a bestseller nor new). If a future selection includes it, its short description comes from the data, and the existing catalog flag covers it.
- US spelling ("favorites") and USD, as the user defaults.

---

## 12. SEO basics

| Field | Value |
|---|---|
| `<title>` (absolute, not templated) | **Starflames · Scented candles for starlit evenings** (U+00B7 with spaces, as layout-shell §11) |
| Meta description (≈ 145 characters) | **Scented candles, travel tins, wax melts and gift sets inspired by moonlit terraces, starry reading rooms, pine forests and still mountain lakes.** |
| Canonical | `/` (the absolute URL is set by M8.6 once the domain is known) |
| `<html lang>` | `en` (exists) |
| Open Graph / Twitter image | **None in M2.** M8.5 specs the OG image (copy and IP-checked), and M8.6 builds it. It may be derived from `hero-desktop` with live-text-free composition; typography.md §7.2 allows text in OG images. Until then no `og:image` is emitted (no placeholder image). |
| `og:title` / `og:description` | the same as the title and description (M8.6 may refine) |
| Structured data | none in M2 (M8.5) |
| Indexing | home is indexable. Nothing is hidden from crawlers: the collections and bestsellers are server-rendered text. |

---

## 13. Data needs

| Section | Repository (M1.6, `lib/firebase/repositories/catalog.ts`) | Fields read |
|---|---|---|
| Hero | none (static imports from `public/images/hero/`) | — |
| Collections | `getCollections()`, then the first 6 by `sortOrder` (already sorted) | `slug`, `name`, `tagline`, `isLimited`, `sortOrder`, `moodImage.src`, `moodImage.alt`, `moodImage.width`, `moodImage.height` (`StaticImage`, `lib/types/catalog.ts`) |
| Bestsellers | **`getProducts()`**, then `selectHomeBestsellers(cards, 4)` in memory (§5.1) | `ProductCard`: `slug`, `name`, `shortDescription`, `badges`, `inStock`, `sortOrder`, `priceFrom`, `priceTo`, `currency`, `cardImage.src`, `cardImage.width`, `cardImage.height` (`cardImage.alt` is not rendered on the card). The selector adds each card's qualifying badge and the row's variant (all bestsellers or mixed). |
| Brand story | none | — |
| Section links, card links | `site-routes.ts`: the `collections`, `shop` and `our-story` registry keys, and `features["collection-pages"]` and `features["product-pages"]` (new) | `live` |

- **Why `getProducts()` and not `getBestsellers(4)`:** the fill needs the new arrivals too. `getProducts()` is one cached read of every card (about 17 cards, about 1 KB each), and it uses the existing `products (status, sortOrder)` index. Two reads (`getBestsellers` plus a fill) would cost more for the same result. `getBestsellers` stays available. **M2.4 needs no new index.**
- No N+1: two cached reads for the whole page, and both are deduplicated with any later footer read (React `cache`).
- Nothing on home reads `longDescription`, `scentNotes` or variants.

---

## 14. Implementation notes for tech-agent (M2.2–M2.5)

- **Dependency (moved from M2.2 to M2.3):** the hero no longer needs GSAP (§3.6), so **M2.2 adds no dependency**. M2.3 adds `gsap` (ScrollTrigger ships inside it) with the first section reveals, lists it in `PROGRESS.md`, and records its `allowScripts` decision if npm asks (tech-agent found no install script in 3.15.0).
- **Route:** `app/(site)/page.tsx` replaces the placeholder. It is a Server Component with **static rendering**: no `searchParams`, cookies or headers, and no `export const revalidate` (the repositories use `revalidate: false`). It is revalidated on demand: the page inherits the `products` and `collections` cache tags from the two reads, so M7's `updateTag` / `revalidateTag` refreshes it.
- **Build preflight hand-off:** **M2.3 is the first task that calls a repository from a page, so M2.3 enables `scripts/build-preflight.mjs` in `prebuild`** (TASKS M2.3, M1.8 hand-off). M2.4 then has nothing to enable. Always build with `npm run build` or `npm run test:e2e` (M1.6).
- **Components** (names are tech-agent's call): `HomeHero`, `CollectionGrid` / `CollectionCard`, `BestsellerGrid`, `ProductCard` (the §6 baseline, in `components/catalog/` so M3.2 extends it; with an optional pinned-badge prop, §6.2), `BrandStory` (with the inline SVG as a component), `HomeMotion` (the single client island for the section reveals, from M2.3, §9). Everything except `HomeMotion` is a Server Component. No component imports Firestore.
- **Registry:** add `"product-pages": { milestone: "M4.3", live: false }` to `features` in `components/layout/site-routes.ts` (footer.md §3.2.2 gains this row; design-agent updates footer.md at its next edit). The card components take an `interactive` boolean from the flag; with `false` they render no `<a>`, no hover classes and no cursor change. Section links come from the registry rows (`collections`, `shop`, `our-story`), rendered only when `live`.
- **Hero layout:**
  - The eyebrow and h1 inside an `<hgroup>` (§3.1).
  - The subcopy with `max-w-measure-intro` and `text-wrap: pretty`; its copy is the 93-character string in §11.1 (3 lines at 390).
  - `HeroActions` is a wrapping flex row with `gap: 2rem` in both directions (§3.2), so the text link is always 32px from the CTA, whether beside it or wrapped below it.
  - At lg+, `.HeroMedia` has `max-inline-size: 60rem` and `justify-self: start` (start-anchored once capped, from about 1733px, §3.2).
- **Hero image:**
  - `getImageProps()` twice and one `<picture>` (§3.9). `fetchPriority="high"` and `loading="eager"` on the `<img>`.
  - Check the Next 16.4 docs (`node_modules/next/dist/docs`) for the current `priority` / `preload` guidance with `getImageProps`. Preload the mobile source only, if at all.
  - `object-position` per breakpoint by CSS (§3.2). The box `aspect-ratio` per breakpoint by CSS; the `<img>` is `size-full object-cover`.
  - The mask by CSS, both prefixed and unprefixed (§3.3). The glow is a sibling behind the image (§3.4), sized by §3.4's table, not by shot-list.json's older `glowPlacement` note (superseded, see art-direction.md §4.3).
- **Hero entrance (CSS only, §3.6, motion.md §5.1):**
  - Put the `hero-reveal` keyframes and the `[data-hero-reveal]` rule in the global stylesheet (render-blocking, so they apply at first paint), inside `@media (prefers-reduced-motion: no-preference)` and scoped to `html:not([data-motion="off"])`. Use the exact CSS in motion.md §5.1.
  - Set the reveal order (0, 1, 2 in DOM order) on the targets from the server (`--reveal-order` inline, or classes). **Don't add `data-hero-reveal` to the h1, the `hgroup`, the image or the glow.**
  - **Retire** the M1.11 `hero-pending` head script, its 2500ms timer and the `.hero-pending [data-hero-reveal]` rule, with their tests (motion.md §5.1, "Retired"). Keep `suppressHydrationWarning` on `<html>` only if another head script still changes `<html>` before hydration.
  - No client code touches the hero. Keep `HomeHero` a Server Component with deterministic markup: a hydration mismatch in the hero would re-create it and replay the entrance after it had shown.
  - No `will-change`. After the animation, nothing inline remains.
  - Screenshots: Playwright's `animations: "disabled"` fast-forwards finite CSS animations to their end, so the hero needs no special wait in `captureRoute` (the M2.2 `heroSettled` helper can wait for `animationend` or be dropped; tech-agent's call).
- **Collection images:** `next/image` `fill` inside the 3:4 arch box, the §4.4 `sizes`, lazy. `src` and `alt` come from `collection.moodImage` (`/images/collections/...`, served from `/public`). tech-agent may map `moodImage.src` to a static import for blur placeholders (optional); `moodImage.width` / `height` are available if a non-`fill` render is ever needed.
- **Product images:** Storage URLs through the existing `remotePatterns`, `fill` inside the 4:5 arch box, the §6.5 `sizes`, lazy.
- **Type:** taglines and short descriptions use `type-body`, not `type-body-sm` (§4.3, §6.1), with `text-wrap: pretty`.
- **Bestseller grid at md:** 2 per row (span 4 of 8), card padding 16 (§5.2).
- **Brand-story SVG:** `vector-effect: non-scaling-stroke` on every stroked element; the minimum rendered sizes in §7.3; base size 240 × 192.
- **Starfield markup rules** (starfield.md §4.5): no bare text nodes directly in `main` or in the plain sections (every string sits in an element); no `pointer-events: none` on the non-interactive cards, images or text.
- **Bands** (§2.3, layout-shell §5.1 as amended in fix round 2):
  - The hero is `data-band="solid"` with its own spacing overrides: top 24 / 32 / 0 (base / md / lg+). **Bottom: 0 when another band follows it; while it is the page's last band before the footer (M2.2), it keeps `--section-y` (layout-shell §5.1: the last section before the footer keeps its bottom padding).** tech-agent's `[data-band][data-flush-end]:not(:has(~ [data-band]))` rule does exactly this and switches itself off when M2.3 adds a band.
  - **The collapse selector must skip the band after the hero.** The M1.13 rule `:is(plain, solid) + :is(plain, solid)` would otherwise zero the collections band's top padding and leave no gap at all. Mark the hero as flush-ending (for example `data-flush-end`) and exclude its next sibling from the collapse; the collections band (or bestsellers, if collections is omitted) keeps its top `--section-y`. Extend the shell's band-collapse e2e test with that case, and with the flush-ending band as the last band (bottom = `--section-y`).
  - Collections `plain`. Bestsellers `plain` (collapsed top after collections). Brand story `dusk` with the veil and the bottom starlight rule.
- **Footer:** unchanged in M2 (minimal). When the home newsletter band ships, pass `newsletter={false}` to the footer on `/`.
- **Metadata:** `export const metadata` with `title: { absolute: "Starflames · Scented candles for starlit evenings" }` and the description (§12).
- **Unit tests:** `selectHomeBestsellers` (the §5.1 cases, including each card's qualifying badge and the row variant); the badge choice (§6.2 example); the price formatter ("$18.00", "From $34.00").
- **e2e** (`tests/e2e`):
  1. `/` returns 200 and has exactly one h1 with the text "Light a little starlight.".
  2. Sections appear in the order hero, collections, bestsellers, story, and each is a named region.
  3. The seed shows 6 collection cards in sortOrder and 4 product cards: Moonrise, Ink & Cedar, Midnight Balcony, Quiet Shore, each with its qualifying badge; the bestsellers h2 reads "Favorites and new flames".
  4. With the flags off, `#collections ul` and `#bestsellers ul` contain no `a` and no `button`.
  5. "Shop favorites" scrolls to `#bestsellers` and the section's h2 is not under the header.
  6. The hero image is visible, and the h1 has no `data-hero-reveal`.
  7. `@motion`: under reduced motion no element in `main` has an inline `opacity: 0` after load, and every `[data-hero-reveal]` has a computed `animation-name` of `none`.
  8. No horizontal scroll at 320.
  9. No 404s (the M1.20 fixture).
  10. CLS < 0.05 at 390 and 1440.
  11. The gap between the primary CTA's box and the text link's box is at least 30px at 390 and 1440 (the ring stays outside the glow footprint).
  12. At 390, once `document.fonts.ready` has resolved, the hero subcopy is 3 lines (its box is at most 87px tall: 3 × 28.8px), and the primary CTA's top edge is at most 340px from the top of the page (§3.2: y ≈ 335).
  13. When a band follows the hero: the collections band's computed `padding-top` equals `--section-y` (64px at 390, 128px at 1440), and the hero's `padding-bottom` is 0 (§2.3). While the hero is the last band (M2.2 on `/`): the hero's `padding-bottom` equals `--section-y`.
  14. Under `no-preference`: each `[data-hero-reveal]` has the computed `animation-name` `hero-reveal`, a duration of 0.7s, `animation-fill-mode: backwards`, and delays of 0s / 0.1s / 0.2s in DOM order (0s / 0.1s on `/` in M2.2). After `animationend`, each target has opacity 1, no transform and no inline style. `<html>` never has a `hero-pending` class.
  15. With every `/_next/static/chunks/*.js` request aborted, the reveal targets still reach opacity 1 within 1.5 s of `DOMContentLoaded` (the entrance doesn't depend on JS).
  16. With `data-motion="off"` set on `<html>` before first paint (an init script), every `[data-hero-reveal]` has `animation-name: none` and is visible.
- **Build review (M2.2):** `/`'s first-load JS against the M1 baseline (no gsap chunk); and, on the slow-4G / 4× CPU probe at 390 on `/dev/hero`, FCP, the last reveal target's animation end time (`startTime + delay + duration` from `document.getAnimations()`, at most FCP + 1.0 s, §3.6), its `animationend` event time (secondary, recorded only) and LCP (still the hero `<img>`).
- **Screenshots:** the existing `home-<project>.png` full-page shots, plus a named viewport shot `home-hero` (`fullPage: false`) at 390 and 1440, for comparison with §2.4 and §3.2.

---

## 15. IP guardrail

I re-read every string in §11, the alt text in §11.3, the SEO copy in §12 and the illustration description in §7.3 against CLAUDE.md, including the strings new in fix round 1 and the subcopy shortened in fix round 2:

- **New strings:** "Shop favorites", "Favorites and new flames", and the subcopy, now "Inspired by moonlit terraces, starry reading rooms and still lakes, for long, quiet evenings." (fix round 2 only removed words: "mountain" and "at home"). They are ordinary shop words (favorites, new, flames) and generic atmosphere words, in my own phrasing. "New flames" refers to new candles; it is not a title, a named group or an epithet.
- **Words used:** night, dark, starlight, starlit, starry, moonlit, terrace, valley of lights, reading room, window full of stars, lantern-lit path, pines, a lake that holds the moon twice, still lakes, mountain lakes (meta description), after dark, quiet evenings, favorites, new flames, the night list, and the brand and catalog names (Starflames and the six collections, all already IP-checked in catalog.md §7). They are generic atmosphere words, combined in my own phrasing.
- **"Light a little starlight."** uses "starlight" on its own (allowed). It isn't part of any title or epithet construction.
- **Not used:** no character, place, court or book names; no author name; no quotes or close paraphrases; no invented terms (peoples, factions, magic, titles); no "Night Court", "Court of …" or "High Lord/Lady"; no "city of …" or "house of …" epithets; nothing about stars falling, star showers, wishing on stars or stars that listen; no wings; "frost" is never paired with "starlight"; no seasonal court names.
- **"Join the night list"** is ordinary mailing-list wording.
- **The illustration** uses only the brand's generic motifs (crescent, small flame, four-point stars, an invented constellation from starfield.md).
- **No maker, hand-poured, small-batch, material or wellness claims** in any string.
- The build-note attribute `data-flush-end` (§2.3, §14) is a generic English identifier. So are the identifiers added in the hero follow-ups: the `hero-reveal` keyframes and the `--reveal-order` property. The follow-ups add no visible copy.

Confirmed clean.

---

## 16. Open questions

1. **Hero CTAs after launch:** keep them as in-page jumps (`#bestsellers`, `#collections`, recommended for phone visitors), or point them at `/shop` and `/collections` once those pages exist? `[confirm with user]` (§3.8). The user default in force: in-page jumps.
2. **The newsletter band is `sunken`, not haze** (§2.1). That keeps the brand story as the page's one haze band and the user's section order intact. tokens.md rule 7 and art-direction.md §5 now allow it. M2.6 confirms it. If the user would rather have the newsletter on violet haze, the brand story must become `plain` (or the order must change). The user default in force: `sunken`.
3. **The bestsellers fill:** the row shows the 2 bestsellers plus the 2 newest arrivals, with its own heading for the mixed case ("Favorites and new flames") and honest eyebrow and intro copy (§5.1, §5.3). `[confirm with user]` that the mixed row and its heading read well. The alternative is a 2-card row. The user default in force: the 2 + 2 fill.
4. **Product route `/products/{slug}`** is proposed for M4.1 to confirm (§5.4). The user default in force: this route.
5. **`hero-mobile` quality:** flagged posterization. Regenerate at high quality or upscale before launch? This costs credits. `[confirm with user: upscales]` (§3.9). The user default in force: regenerate before launch.
6. **Brand story wording:** "About Starflames" and the two paragraphs make no production claims. When the user confirms whether they make the candles, the heading could return to a maker line, and the on-hold `brand-story` photo could replace the SVG. `[confirm with user: production claims]`
