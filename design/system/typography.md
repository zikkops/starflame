# Typography system (M1.10)

Status: spec, **QA PASSED** (fix round 1), post-pass minors applied. Owner: design-agent. Implemented by tech-agent in M1.11.
Depends on [`tokens.md`](./tokens.md) (colour roles, the contrast table, §2.5 rules 4 and 6–9, §10 reserved font names, §11 mapping rules), [`accessibility.md`](./accessibility.md) and [`motion.md`](./motion.md) §5.1 (the hero's LCP requirement).

## Changelog

**Post-pass minors from M1.11 review** (2026-10-09)

1. §9.1 `fallback` is now "none". tech-agent verified that in Next 16.4 with Turbopack, passing `fallback` to next/font silently drops the size-adjusted "<Family> Fallback" face. The §2.2/§2.3 system stacks are appended in the `@theme inline` tokens instead, and §9.2 now gives the full token values, matching the implemented file. The claim that each Cormorant call gets its own generated family name is corrected: both emit the family "Cormorant Garamond", and the italic instance is reached through its own CSS variable (§6.2, §9.1).
2. §2.4 sizes updated to the build's measured values: Jost 26,588 B, Cormorant roman 37,776 B (64,364 B preloaded in total), Cormorant italic 23,900 B on demand (also in §11, open question 2).
3. §3.2: the `viewBox` is the ink bounds plus half the stroke width, so the hairline stroke isn't clipped.
4. Status line updated.

**Fix round 1: QA issues 1–8** (2026-10-09)

1. `weight` values now build in Next 16.4.0: `['400', '500', '600']` for Jost and `['500', '600']` for Cormorant roman (`'variable'` is the equivalent alternative). Each resolves to the same single variable woff2 (§2.2, §2.3, §9.1).
2. Download budget restated with QA's measured file sizes. Google serves the full-axis variable file regardless of the weights requested (§2.4).
3. The reason for two Cormorant calls is now only the true one: `preload` applies to every file in one call (§9.1).
4. Subsets corrected: next/font self-hosts every subset with `unicode-range` and preloads only the `subsets` list, so latin-ext and the others are fetched on demand, not "not loaded". Pinyon Script's latin-ext and vietnamese subsets are available, not "marked unavailable" (research table, §2.2, §2.3, §2.4, §9.1).
5. New §11 Open questions, which the "open question 1/2" references now point to.
6. The wordmark build route is named: (a) a one-off dev script using Next's bundled fontkit, owner tech-agent in M1.11, with (b) a manual Inkscape/Figma export as the fallback (§3.2).
7. SVG size restated as about 4–9 KB raw, 2–4 KB gzipped. The path is defined once per page with `<symbol>` + `<use>` (§3.1, §3.2).
8. §6.7 and §7.4 now agree: over haze, h3 and h4 use text-primary only; text-secondary for Cormorant only at ≥ 28px (§6.7).

Research (2026-10-09, Google Fonts metadata and CSS API, checked by WebFetch):

| Family | Google Fonts build | Format | Weights / axes | Styles | Subsets offered |
|---|---|---|---|---|---|
| Pinyon Script | v24 | static | 400 only | normal only | latin, latin-ext, vietnamese (all available) |
| Cormorant Garamond | v21 | **variable**, `wght` 300–700 | any value from 300 to 700 | normal + italic (separate files) | latin, latin-ext, cyrillic, cyrillic-ext, vietnamese |
| Jost | v20 | **variable**, `wght` 100–900 | any value from 100 to 900 | normal + italic (separate files) | latin, latin-ext, cyrillic |

All three are under the SIL Open Font License, so they are free for commercial use, self-hosting (which is what `next/font` does) and logo outlining.

---

## 1. Purpose and acceptance criteria

Purpose: one type system that feels like a candlelit night (an elegant script signature, a refined high-contrast serif for display and a calm geometric sans for reading and UI) while staying fast on a phone arriving from Instagram, and readable as light text on dark backgrounds.

Acceptance criteria (from M1.10, refined):

1. Three free `next/font/google` families: a script for the wordmark only, a display serif, and a body/UI sans. For each: the reason, the exact weights and styles (the fewest possible), subsets, `display` strategy, fallback stack and fallback-metrics plan (§2).
2. The wordmark: SVG or webfont, decided with trade-offs (§3).
3. A mobile-first fluid type scale, 390 → 1440, for display-1/2, h1–h4, body-lg, body, body-sm, caption, eyebrow, button, price and nav, with size, line-height, letter-spacing, weight, family and transform. Body ≥ 16px on mobile. A measure for long copy (§4, §5).
4. Usage rules: heading hierarchy, italics, all-caps, numerals, and text over haze (§6).
5. Accessibility: 200% resize, no text in images except the wordmark, contrast references, minimum sizes for the script and the serif, and thin-stroke rules for dark backgrounds (§7).
6. Implementation mapping for M1.11: font tokens, the `--font-sans` alias, Tailwind v4 `@theme` names, `@theme` vs `:root`, and the `next/font` loading plan (§9).
7. Original sample copy, no lorem ipsum, IP guardrail checked (§8, §10).

---

## 2. The three families

**Decision: keep the trio from the exploratory mockup** (Pinyon Script, Cormorant Garamond, Jost). The user has seen it and hasn't objected, and each one is still the best fit once checked against performance and dark-background readability. The guard rails in §6–§7 handle the one real weakness (Cormorant's thin strokes).

Alternatives considered and rejected:
- Script: Great Vibes, Parisienne, Alex Brush and Italianno are all heavier or more casual. Pinyon's formal copperplate reads most "luxury invitation".
- Serif: Playfair Display is sturdier but common and heavier in mood. Bodoni Moda has even finer hairlines (worse on dark). EB Garamond is a sturdy text face without the display drama. Fraunces is too playful.
- Sans: Inter and DM Sans are more neutral but less characterful. Jost's geometric, slightly Art Deco shapes pair with Cormorant's classical forms and suit "mountain city at night".

### 2.1 Wordmark script: Pinyon Script

| | |
|---|---|
| Reason | A formal copperplate script with long, calm entry strokes. It reads as hand-lettered and elegant without being frilly, and its capital S gives "Starflames" a strong opening. |
| Used for | The "Starflames" wordmark only, **shipped as an inline SVG made from its outlines** (§3). Never as live text. |
| Weights / styles | 400 normal (the only cut). It is used as outlines, so **no font file is downloaded at runtime.** |
| Subsets | Not applicable (not loaded). The source glyphs are all basic Latin. |
| `display` | Not applicable. |
| Fallback | Not applicable: inline SVG cannot fail to load. `--font-wordmark` is a documentation-only value (§9). |

### 2.2 Display serif: Cormorant Garamond

| | |
|---|---|
| Reason | A refined Garamond-style display serif with high stroke contrast, long elegant ascenders and a beautiful italic. It brings the "candlelit library" luxury. It is the Garamond-flavoured cut of Cormorant, with larger counters than plain Cormorant, which helps at heading sizes. It is variable, so one file covers the weights we need. |
| Used for | display-1, display-2, h1–h4. Never body copy, UI labels, buttons, prices or form text. |
| Weights | **500 and 600, roman** (requested as the weight array `['500', '600']`, or `'variable'`; either resolves to the one variable woff2). 500 for display-1 through h2, 600 for h3 and h4 (§7.4). 300 and 400 are not used (too thin on dark backgrounds). 700 isn't needed. |
| Styles | normal (roman), plus **italic at 500 only**, as a separate, non-preloaded load used for accent words in headings ≥ 28px (§6.2). |
| Subsets | **latin** preloaded (the `subsets` list). The brand's copy is English. Google's latin subset already covers Western European accents (é, è, ñ, ü, ø, ß). latin-ext and the other subsets are not preloaded: next/font still self-hosts them with a `unicode-range`, so they would be fetched on demand only if a heading contained one of their characters, which design-agent's headings don't. |
| `display` | `swap`, with the metric-adjusted fallback (below), so headings are visible at once and the swap barely moves anything. `optional` was rejected: on a slow first visit the heading would stay in Times for the whole page view. |
| Fallback stack | `Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", ui-serif, Georgia, serif` |
| Fallback metrics | `adjustFontFallback: true` (the `next/font/google` default). next/font generates a "Cormorant Garamond Fallback" face from local Times New Roman with `size-adjust`, `ascent-override`, `descent-override` and `line-gap-override` matched to Cormorant, and puts it first in the stack. All our line-heights are unitless and fixed (§4), so line boxes don't change height on swap. Only line wrapping could, and size-adjust keeps text widths close. |

### 2.3 Body and UI sans: Jost

| | |
|---|---|
| Reason | A clean geometric sans (in the Futura tradition) with even, open strokes that stay legible as light text on dark. Its geometric round letters echo the moon and the arched frames. It is variable, so a single file covers regular, medium and semibold. |
| Used for | All body copy, UI (buttons, nav, form labels and inputs, badges), prices, eyebrows and captions. It is also the preflight default (§9.2). |
| Weights | **400, 500, 600, roman** (requested as the weight array `['400', '500', '600']`, or `'variable'`; either resolves to the one variable woff2). 400 for reading text, 500 for UI and labels, 600 only for `<strong>` (§6.5). 300 and below are never used (too thin on dark). |
| Styles | **normal only.** Jost's true italic is a slanted roman, so the browser's synthesized oblique for the rare `<em>` in body copy looks close to it. Skipping it saves a file (§6.2). |
| Subsets | **latin** (preloaded). latin-ext (and cyrillic) is not preloaded; it is fetched on demand via `unicode-range`. next/font self-hosts it, and the browser downloads it only on a page that renders one of its characters. In practice that is customer-entered data (names, addresses, order notes with characters such as ł, ő, ș), which then renders in Jost after a small on-demand request. |
| `display` | `swap` with the metric-adjusted fallback. Body text is visible immediately. |
| Fallback stack | `ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` |
| Fallback metrics | `adjustFontFallback: true`. next/font generates a "Jost Fallback" face from local Arial with matching size and vertical-metric overrides, placed first in the stack. |

**Fallback caveat (for the build review).** The generated fallback faces use `local("Arial")` and `local("Times New Roman")`. Android doesn't have those, so it falls through to Roboto or Noto Serif without adjustment, and a small reflow on swap is possible there on a first visit. Fixed unitless line-heights limit this to line-wrap changes. The build review measures CLS with Lighthouse mobile. The target is CLS < 0.05 page-wide, with font swap contributing < 0.01.

### 2.4 Download budget

Sizes are the M1.11 build's measurements (2026-10-09, woff2, latin subset). Google serves the **full-axis variable file regardless of the weights requested**, so the weight list only records which weights we use; it doesn't shrink the file.

- Preloaded on every route: **two files**, Jost latin (26,588 B) and Cormorant Garamond latin roman (37,776 B), **64,364 B** (about 64 KB) in total.
- Loaded on demand: Cormorant Garamond italic latin (23,900 B), only on pages whose headings contain an italic accent (not preloaded).
- Not preloaded; fetched on demand via `unicode-range`: the latin-ext / cyrillic / cyrillic-ext / vietnamese files of the faces we load, only on a page that renders one of their characters (§2.2, §2.3).
- Not loaded at all: Pinyon Script (the wordmark is SVG), Jost italic.
- **Budget: ≤ 120 KB of woff2 preloaded in total.** At about 64 KB it holds with room to spare. The build review measures this in the Network panel. If Cormorant ever puts it over, narrow Cormorant to the single weight 500, which is served as a static file (QA measured a static 500-only file at 23,312 B). h3 and h4 then render at 500, and their minimum sizes rise to 24px (§7.4).

---

## 3. The wordmark

### 3.1 Decision: inline SVG, not a webfont

The script appears in exactly one word. Shipping a whole font for it costs a request and a swap on every first visit. **The wordmark ships as an inline SVG of "Starflames" outlined from Pinyon Script 400.**

| Concern | Inline SVG (chosen) | Pinyon Script webfont |
|---|---|---|
| Download | About 4–9 KB of raw path data inside the HTML, 2–4 KB gzipped after optimisation (QA's test build: an 8.6 KB path, 3.9 KB gzipped). It appears twice per page (header and footer), so the path is defined once with `<symbol>` and reused with `<use>` (§3.2), and the cost is paid once. No request, nothing to preload. | One more font file (tens of KB) per first visit. It would need preloading to avoid a late swap, which competes with the hero image on mobile. |
| LCP | Inline SVG paths aren't an LCP candidate, so the wordmark never becomes or delays the LCP element. | The header text could be an LCP candidate on small screens, and its swap could delay LCP. |
| CLS | Zero: the SVG has a fixed `viewBox`, its height is set by a token and its width follows the aspect ratio. | The swap from a cursive fallback (Segoe Script, Apple Chancery or Times) changes the width. Metric adjustment against Arial or Times matches a script poorly. |
| Flash of wrong brand | None. | A first visit shows the brand name in a system cursive for a moment. That is a visible brand flaw. |
| Crispness | Vector at any DPR. The hairlines can be thickened in the artwork for small sizes (§3.3). | Script hairlines are poorly hinted at small sizes. They can't be thickened per size without `-webkit-text-stroke` hacks. |
| Accessibility | Needs an explicit accessible name: `role="img"` plus `aria-label="Starflames"` (§3.4). Scales with text-size settings because its height is in rem. Follows forced colors through `currentColor`. | Real text, so the name is free. |
| Translation / selection | Not selectable and not machine-translated. That's correct for a brand name. | Selectable. |
| Maintenance | A change means re-exporting the SVG. | A text change is enough. |

The SVG wins on every performance and brand-consistency point. Its one cost, a deliberate accessible name, is cheap. The OFL allows using the font's outlines in a logo: the SVG contains artwork, not font software.

### 3.2 Artwork

- Text: "Starflames", set in Pinyon Script 400, with the font's default kerning and contextual forms, and no added tracking.
- Outlined to paths, merged into one compound path, and the `viewBox` set to the ink bounds (ascender of S and f to the descender of f) plus half the stroke width on every side, so the hairline stroke isn't clipped. Spacing around it comes from layout tokens.
- **Build route (orchestrator decision: option a). Owner: tech-agent in M1.11.**
  - **(a) A one-off dev script** using the fontkit that Next already bundles (`next/dist/compiled/@next/font/dist/fontkit`). It is already installed, so no new dependency. It is an internal API, used at dev time only and never imported at runtime. The script lays out "Starflames" from the Pinyon Script latin woff2 with the `calt` and `kern` features on, writes the glyph outlines as one optimised SVG path, and the resulting SVG is **committed**. QA verified the route works: 10 glyphs, an 8.6 KB path, 3.9 KB gzipped.
  - **(b) Fallback, if the internal API breaks:** a manual export from Inkscape or Figma (set the word in Pinyon Script 400 with default kerning and ligatures, convert text to paths, union, optimise), committed the same way.
- `fill="currentColor"`. No hard-coded colour, so it follows the link colour, hover and forced colors.
- A matching `stroke="currentColor"` with `paint-order: stroke` thickens the hairlines. The stroke width is set in `viewBox` units so it renders at about **1 CSS px when the wordmark is 28px tall**, the smallest permitted size. It scales up proportionally at larger sizes.
- A four-point-star or crescent flourish, if any, belongs to `motifs.md`. It must be part of the same SVG and must not change the accessible name.
- Delivered as an asset (for example `/public/brand/wordmark.svg`, location tech-agent's call) and **inlined** into the markup, not referenced through `<img>`, so `currentColor` works.
- **Defined once per page.** The path lives in one `<symbol id="…">` (with the `viewBox`), in a hidden sprite `<svg aria-hidden="true">` rendered once by the root layout (zero-size and out of flow; not `display: none`). The header and footer each render their own outer `<svg role="img" aria-label="Starflames">` that repeats the `viewBox` and contains a `<use href="#…">`. The `<use>` instance inherits `color`, so `currentColor` (fill and stroke) still follows each link's colour, hover and forced colors. Repeating the `viewBox` on each outer `<svg>` keeps the aspect ratio known before paint, so CLS stays at zero, and the inline SVG is still never an LCP candidate.

### 3.3 Sizes

The height is the SVG's rendered height; the width follows the aspect ratio.

| Context | base (390) | md (768) | xl (1440) | Token |
|---|---|---|---|---|
| Header | 28px (1.75rem) | 32px (2rem) | 36px (2.25rem) | `--wordmark-h-header` |
| Footer | 40px (2.5rem) | 44px (2.75rem) | 48px (3rem) | `--wordmark-h-footer` |

- **Minimum: 28px tall anywhere.** Below that, Pinyon's hairlines break up on 1× screens even with the stroke. The wordmark is never used inline in running text.
- The header link around it keeps a hit area of at least 44×44 (`--size-touch`) through padding.

### 3.4 Colour, states and accessibility

- Colour: `--color-wordmark` = gold-300 `#E8CF96` (a new semantic role, added to tokens.md §11.2). It is a logo, so WCAG 1.4.3 doesn't require a ratio, but it passes anyway: 12.45:1 on bg-page (T20), 11.19:1 on the scrolled header's bg-raised (T21), 13.03:1 on the bg-sunken footer (T23), and 5.72:1 over haze worst (T38).
- States (it is the home link): hover changes to `text-primary` moon-100 (`duration-fast`), with no underline (a logo link isn't in running text, so the always-underline rule doesn't apply). Focus-visible uses the standard gold-300 ring, 2px offset, on the link.
- Markup intent: a home link `<a href="/">` containing the SVG with `role="img"` and `aria-label="Starflames"`, so the link's accessible name is **"Starflames"**, matching the visible word (WCAG 2.5.3). No `<title>` inside the SVG (it would duplicate the name and add a tooltip). The SVG is not focusable on its own.
- The wordmark is **never inside a heading** and is never the page's h1. The h1 is the page's own heading (§6.1).
- Forced colors: `currentColor` follows the system LinkText colour automatically.

---

## 4. Type scale

Fluid sizes interpolate linearly from the 390px design to the 1440px design and are clamped outside that range:
`clamp(min, intercept + slope·vw, max)`, with slope = (max − min) / 1050 × 100 vw and intercept = min − (max − min) × 390/1050. Intercepts and clamp limits are in rem, so text follows the user's font-size setting. Every step keeps **max ≤ 2 × min** (needed for §7.1).

| Token | Family | Size 390 → 1440 (px) | `clamp()` value | Line-height | Letter-spacing | Weight | Transform / features | Large text? (§6.6) |
|---|---|---|---|---|---|---|---|---|
| `display-1` | display | 44 → 80 | `clamp(2.75rem, 1.9143rem + 3.4286vw, 5rem)` | 1.05 | -0.01em | 500 | `lining-nums` | Yes |
| `display-2` | display | 38 → 64 | `clamp(2.375rem, 1.7714rem + 2.4762vw, 4rem)` | 1.08 | -0.01em | 500 | `lining-nums` | Yes |
| `h1` | display | 34 → 52 | `clamp(2.125rem, 1.7071rem + 1.7143vw, 3.25rem)` | 1.1 | -0.005em | 500 | `lining-nums` | Yes |
| `h2` | display | 28 → 40 | `clamp(1.75rem, 1.4714rem + 1.1429vw, 2.5rem)` | 1.15 | 0 | 500 | `lining-nums` | Yes |
| `h3` | display | 24 → 30 | `clamp(1.5rem, 1.3607rem + 0.5714vw, 1.875rem)` | 1.2 | 0.005em | 600 | `lining-nums` | Yes (≥ 24px) |
| `h4` | display | 22 → 24 | `clamp(1.375rem, 1.3286rem + 0.1905vw, 1.5rem)` | 1.25 | 0.01em | 600 | `lining-nums` | **No** (22px, 600 isn't bold) |
| `body-lg` | body | 18 → 20 | `clamp(1.125rem, 1.0786rem + 0.1905vw, 1.25rem)` | 1.6 | 0 | 400 | — | No |
| `body` | body | **16** → 18 | `clamp(1rem, 0.9536rem + 0.1905vw, 1.125rem)` | 1.65 | 0.01em | 400 | — | No |
| `body-sm` | body | 14 → 15 | `clamp(0.875rem, 0.8518rem + 0.0952vw, 0.9375rem)` | 1.5 | 0.015em | 400 | — | No |
| `caption` | body | 13 (fixed) | `0.8125rem` | 1.45 | 0.02em | 400 | — | No |
| `eyebrow` | body | 13 → 14 | `clamp(0.8125rem, 0.7893rem + 0.0952vw, 0.875rem)` | 1.3 | 0.14em | 500 | `uppercase` | No |
| `button` | body | 16 (fixed) | `1rem` | 1.25 | 0.03em | 500 | none (sentence case) | No |
| `price` | body | 16 → 18 | `clamp(1rem, 0.9536rem + 0.1905vw, 1.125rem)` | 1.3 | 0.01em | 500 | `lining-nums tabular-nums` | No |
| `price-lg` | body | 20 → 24 | `clamp(1.25rem, 1.1571rem + 0.381vw, 1.5rem)` | 1.2 | 0 | 500 | `lining-nums tabular-nums` | No |
| `nav` | body | 15 → 16 | `clamp(0.9375rem, 0.9143rem + 0.0952vw, 1rem)` | 1.3 | 0.02em | 500 | none | No |

Notes:
- `display` = Cormorant Garamond (`--font-display`), `body` = Jost (`--font-body`).
- Where each step is used:
  - display-1 is the home hero heading only.
  - display-2 is for collection heroes and big editorial bands.
  - h1 is the default page heading (for example a product name).
  - h2 is a section heading; h3 a sub-section or card-group heading; h4 a small heading (care steps, footer column titles).
  - price-lg is the product page price; price is the card and line-item price.
  - nav is the header links; the mobile menu's primary links use `h3` styling (§6.1).
- The button's height comes from the button spec (min-height 48px for the primary CTA on mobile, 44px for others), not from line-height.
- Badges ("Sale", "Limited", "New") use the `eyebrow` style.
- Paragraph spacing: `margin-block-end: 1em` between paragraphs of body and body-lg.
- Gaps: eyebrow → heading is spacing step 3 (12px); heading → following text is step 4 (16px) for display-1 through h2, and step 3 (12px) for h3–h4.
- Line-heights are unitless. Don't override them with fixed px heights (§7.1).

---

## 5. Measure and wrapping

| Token | Value | Use |
|---|---|---|
| `measure-prose` | `65ch` | long copy: about page, care guide, FAQ answers, product descriptions. At body 18px, 65ch of Jost is about 640px, which sits inside `container-prose` (680px). |
| `measure-intro` | `45ch` | hero supporting copy, section intros, the newsletter blurb |
| `measure-heading` | `18ch` | display-1 and display-2, so hero headings break into two or three balanced lines rather than one long line |

- `ch` is measured in the element's own font, so apply the measure on the text element itself, not a wrapper in a different font.
- Headings: `text-wrap: balance`. Body paragraphs: `text-wrap: pretty`. Both are progressive enhancements; older browsers wrap normally.
- `overflow-wrap: break-word` globally, so a long email address or word never forces horizontal scroll at 320px. `hyphens: manual` (no automatic hyphenation in headings; body copy is short enough without it). `<html lang="en">` is required.
- Product names in cards wrap (up to 2–3 lines). They are never truncated with an ellipsis, so the full name is always visible.

---

## 6. Usage rules

### 6.1 Heading hierarchy

- **One `<h1>` per page**, and it is the page's own subject, never the wordmark. Examples: home → the hero heading; collection → the collection name; product → the product name; bag → "Your bag".
- **The visual style is independent of the semantic level.** Pick the level from the document outline and the style from the scale. For example, home h1 uses `display-1`; collection h1 uses `display-2`; product h1 uses `h1`; the bag page's h1 uses `h2` styling; a card title in a grid is an `<h3>` (or `<h2>` if it's the first level under the h1) styled `h4`.
- Don't skip levels in the outline (h2 → h4). A smaller look is achieved with a smaller style, not a deeper level.
- Eyebrows are not headings: a `<p>` placed just before its heading (optionally grouped with it in `<hgroup>`). Screen readers then read "New this season, Moonlit Terrace".
- The mobile menu's primary links are links in a `<nav>`, styled `h3` for size, not heading elements.

### 6.2 Italics

- **Display serif:** Cormorant Garamond italic (500) is for **one accent word or short phrase per heading**, e.g. "Light a little *starlight*.". Only in display-1, display-2, h1 and h2 (≥ 28px). Never a whole heading, never in h3/h4, and never in body text.
- **Not in the home hero heading at launch.** The italic file isn't preloaded, so an italic word in the LCP-area heading would swap in late (see §11, open question 2). Below-the-fold headings may use it freely within the rule above.
- Implementation: an `<em>` inside a display heading switches to `--font-display-italic` with `font-style: italic` (§9.3). The italic instance shares the family name "Cormorant Garamond" with the roman, but it is reached through its own CSS variable, so the switch must be explicit.
- **Body (Jost):** `<em>` is allowed sparingly, for a stressed word or a title. It renders as a synthesized oblique (Jost's own italic is an oblique, so the look is close). Product names in running text are not italicised.

### 6.3 All-caps

- Caps are only for **short labels**: eyebrows, badges ("Sale", "Limited", "New"), and small spec labels such as "Top notes". Keep them to about 4 words or 32 characters.
- Always set with the `eyebrow` style: 500 weight, **0.14em tracking**. Caps without tracking look cramped, especially light on dark.
- **Write the source text in sentence case** and uppercase it with CSS (`text-transform: uppercase`), so screen readers don't spell words out as letters and copy stays reusable.
- Never in caps: headings, buttons, nav, form labels, sentences, prices.

### 6.4 Numerals

- **Lining figures everywhere** (`lining-nums` on display steps, which also covers whatever default figure style Cormorant ships; Jost's figures are lining by default). Old-style figures are not used at launch.
- **Prices, quantities, order totals and steppers use `tabular-nums`** (built into the `price` and `price-lg` steps; apply it to quantity steppers and order-summary columns too), so digits line up and don't jitter when a quantity changes.
- Body text numbers ("Burn time about 45 hours") stay proportional (the default).
- Prices: a sale shows the old price in `<s>` with text-muted, `price` style, plus visually hidden "Was" and "Now" labels. The current price is text-primary; text-glow is allowed for one price-drop per section (tokens.md §2.5 rule 1). Details belong to the product-card spec (M3.1).

### 6.5 Weights

- Cormorant Garamond: 500 (display-1 to h2, italic accents), 600 (h3, h4). Nothing else.
- Jost: 400 (reading text), 500 (UI: eyebrow, button, nav, price, form labels), 600 (`<strong>` and `<b>` only).
- `font-synthesis-weight: none` globally, so no faux bold appears. `<strong>` and `<b>` are set to 600 explicitly, because preflight's `bolder` would ask for 700, which is outside the loaded range.

### 6.6 Large text, for contrast

WCAG large text means ≥ 24px regular or ≥ 18.66px bold (700). In this scale, **display-1, display-2, h1, h2 and h3 are large text** at every viewport (their minimums are ≥ 24px). **Everything else is normal text** and needs 4.5:1, including h4 (22px at 600, which isn't bold) and price-lg.

Tightening for the thin display serif: a pair that depends on the large-text allowance must be **h2 or bigger (≥ 28px)**, not just ≥ 24px. Cormorant's small x-height makes 24px look smaller than 24px of a typical font.

### 6.7 Text over haze, glows and effects

These apply tokens.md §2.5 rules 4 and 6–9 to type:

| Text | Over a haze gradient (worst case `#663B6D`) | Notes |
|---|---|---|
| Display headings (display-1 to h2, ≥ 28px) | text-primary (7.59, T36), text-secondary (5.17, T37) | |
| gold-400 accent word in a heading | **h2 or bigger only** (4.58, T39) | Stricter than "large" (§6.6). |
| h3, h4 | **text-primary only** (7.59, T36) | Cormorant in text-secondary only at ≥ 28px (§7.4). Not the gold-400 accent (h2 or bigger only). |
| body-lg, body | text-primary or text-secondary | Weight 400, never smaller than body. |
| body-sm, caption | text-primary or text-secondary only, and preferably not over haze at all | |
| eyebrow | gold-300 (5.72, T38) | Never gold-400 at eyebrow size over haze. |
| Links | gold-300 (5.72, T38), underlined | |
| text-muted | **Never** over any gradient (X2) | |
| Status messages | **Never** over a gradient (rule 8, X7) | |
| Form labels, inputs, help text | **Never** over a gradient (rule 7) | |

- **The candle glow never sits under text** (rule 6): keep every text box outside the glow's circle.
- **Inside a CTA's 26px glow footprint** (rule 9): text-primary, text-secondary or gold-300 links only (T54, T55). No text-muted (X10). Over haze, the CTA has no glow.
- **Over a featured card's halo** (bg-raised): text-primary or text-secondary. Meta text next to the image uses text-secondary rather than text-muted (T53).
- Text is never placed over photography without the scrim rule in accessibility.md §7.

---

## 7. Accessibility

### 7.1 Resize text to 200% without loss (WCAG 1.4.4, 1.4.10, 1.4.12)

- All font sizes are in rem (with a small vw term for fluid steps). No px font sizes anywhere.
- **Page zoom:** every step keeps max ≤ 2 × min. At 400% zoom on a 1440 window, the layout viewport is 360 CSS px, so every step sits at its minimum and renders at 4 × min, which is at least 2 × the 100% size. At 200% zoom, every step is visibly larger. Reflow at 320 CSS px wide means a single column with no horizontal scroll (tokens.md §9).
- **Text-only resize** (browser font size set to 32px): rem parts double. Small steps are nearly fixed, so they come close to 2× (body at 1440 ≈ 1.85×). Big display steps grow less, since their vw part doesn't scale. That is acceptable because page zoom meets 1.4.4, and the display steps are already large.
- **Text spacing (1.4.12):** no fixed `height` on any element containing text (buttons, badges, chips, nav items, cards use `min-height` and padding). No `overflow: hidden` on text boxes. Content must survive line-height 1.5, paragraph spacing 2em, letter-spacing 0.12em and word-spacing 0.16em without clipping or overlap.
- **Build-review test protocol:**
  - 1280×800 at 200% and 400% browser zoom
  - 390 with the browser's font size at "Very large"
  - the text-spacing override at 390 and 1440
  - Check that nothing is clipped, overlapping or cut off in the header, buttons, badges, product cards and the footer.

### 7.2 No text in images except the wordmark

- The wordmark is the only text set as an image (inline SVG with the accessible name "Starflames", §3.4).
- Product photography has no baked-in text, apart from the physical label that is part of the product. Promotions, banners, prices and headings over imagery are live text (with the scrim rule in accessibility.md §7).
- Social share (Open Graph) images may contain text, because they are metadata, not page content. They never carry information that isn't also on the page.
- Decorative glyphs (four-point stars, crescents, flames) used next to text are inline SVG with `aria-hidden="true"`, never Unicode characters inside headings.

### 7.3 Contrast references

All colour pairs come from tokens.md §3. The typical type pairs:

| Text | Pairs |
|---|---|
| Body and headings | text-primary T1–T5 (12.80–17.30), text-secondary T6–T10 (8.72–11.78) |
| Captions and meta | text-muted T11–T15 (5.16–6.98). On solid backgrounds only, never over a gradient. |
| Eyebrows | text-accent gold-400 T16–T19 (7.72–9.96) on solid; gold-300 over haze (T38) |
| Links | gold-300 T20–T23 (9.64–13.03) |
| Button text | text-inverse on ember T27–T29 (8.85–12.99) |
| Badge text | text-inverse on gold-400 or rose-300, T31–T32 |

No new colour pair is introduced by this file, except `--color-wordmark`, which reuses gold-300 (T20, T21, T23, T38).

### 7.4 Minimum sizes and thin-stroke rules on night backgrounds

Light text on very dark backgrounds loses thin strokes first. Antialiasing thins hairlines below one device pixel, and high-contrast serifs suffer most. Cormorant Garamond's hairlines are very fine, so:

| Face | Rule |
|---|---|
| Cormorant Garamond (and any similar high-contrast serif) | **Never below 22px.** 22–27px (h3, h4) **must be 600**. **500 only at ≥ 28px** (h2 and up). **300 and 400 are never used.** Italic only at ≥ 28px and 500. Colours are text-primary, text-secondary (at ≥ 28px only) or a gold accent word; never text-muted or text-disabled. Never set in body or UI roles. |
| Pinyon Script | **SVG only, never live text.** At least **28px tall**, with hairlines thickened to about 1 CSS px at that size (§3.2). If a script text style were ever added (see §11, open question 1), its minimum would be 32px font size, for one or two words only. |
| Jost | Running text is ≥ 16px at 400. body-sm (14–15px) is for meta of at most 2 lines. caption (13px) is for single-line meta and image notes. eyebrow (13–14px) is caps, 500, tracked. **Nothing on the site is below 13px.** Weights below 400 are never used. |

- Don't apply Tailwind's `antialiased` (`-webkit-font-smoothing: antialiased`) globally. On macOS it renders light-on-dark text noticeably thinner, which hurts Cormorant most. Leave the default font smoothing.
- If the §2.4 fallback (Cormorant at 500 only) is ever applied, h3 and h4 rise to a 24px minimum at 500.

### 7.5 Reduced motion and type

Text is never animated by `font-size`, `font-weight`, `letter-spacing` or the variable `wght` axis. Text reveals follow motion.md (opacity and transform only). The hero heading's pre-hidden state follows motion.md §5.1, including its LCP requirement at 390px.

---

## 8. Specimen copy

These samples are original and are used for the type specimen, Storybook-style previews and screenshots. Real page copy comes with each page spec.

| Style | Sample |
|---|---|
| Wordmark (SVG) | Starflames |
| eyebrow | New this season *(source text in sentence case; displayed uppercase)* |
| display-1 | Light a little starlight. |
| display-2 | Moonlit Terrace |
| h1 | Midnight Balcony Candle |
| h2 | Scents for long, quiet evenings |
| h2 with an italic accent | A glow for *slow* evenings |
| h3 | Notes of cedar, plum and warm amber |
| h4 | Caring for your candle |
| body-lg | Each candle is poured by hand in small batches and finished with a cotton wick, so it burns slowly and evenly. [confirm with user: production claims] |
| body | Trim the wick to 5 mm before every burn and let the first burn melt all the way to the edge of the jar. That keeps the wax level and the scent full until the very last evening. |
| body-sm | Burn time about 45 hours · 220 g |
| caption | Shown lit, on a windowsill after dusk. |
| button | Add to bag · Shop the collection |
| price / price-lg | $34.00 [confirm with user: currency] |
| nav | Shop · Collections · Gift sets · Our story |
| badges (eyebrow style) | New · Limited · Sale |

---

## 9. Implementation mapping (for tech-agent, M1.11)

Names and values only. tech-agent writes the code.

### 9.1 Loading plan (`next/font/google`)

- **One font definitions file**, `app/fonts.ts` (the location is tech-agent's call), imported **only by the root layout** `app/layout.tsx`. All three instances are then defined once; `jost` and `cormorant` are preloaded on every route, `cormorantItalic` is not (the root-layout rule).
- The root layout puts the three `.variable` classes on `<html>`. Don't use `.className`: the font reaches the page through `--font-sans` and preflight (§9.2).

| Instance | Family | `weight` | `style` | `subsets` | `display` | `preload` | `adjustFontFallback` | `variable` (CSS var) | `fallback` |
|---|---|---|---|---|---|---|---|---|---|
| `jost` | Jost | `['400', '500', '600']` (or `'variable'`; one variable file) | `'normal'` | `['latin']` | `'swap'` | `true` | `true` | `--font-jost` | none; the §2.2/§2.3 system stack is appended in the `@theme inline` token |
| `cormorant` | Cormorant Garamond | `['500', '600']` (or `'variable'`; one variable file) | `'normal'` | `['latin']` | `'swap'` | `true` | `true` | `--font-cormorant` | none; the §2.2/§2.3 system stack is appended in the `@theme inline` token |
| `cormorantItalic` | Cormorant Garamond | `'500'` | `'italic'` | `['latin']` | `'swap'` | **`false`** | `true` | `--font-cormorant-italic` | none; the §2.2/§2.3 system stack is appended in the `@theme inline` token |
| — | Pinyon Script | **not loaded** (wordmark is SVG) | | | | | | | |

- Don't use a range string such as `'400 600'`: Next 16.4.0's types accept only a single weight, `'variable'` or an array of single weights, and its runtime validation throws "Unknown weight".
- `subsets` sets only what is **preloaded**. next/font self-hosts every subset of each requested face with a `unicode-range`, so the others are fetched on demand (§2.4).
- **Don't pass `fallback`.** tech-agent verified that in Next 16.4 with Turbopack, passing `fallback` silently drops the size-adjusted "<Family> Fallback" face. Without it, each next/font variable resolves to `"<Family>", "<Family> Fallback"`, and the system stack follows it in the token (§9.2).

Why two Cormorant instances: `preload` applies to every file in one call. A separate italic call is therefore what lets the italic stay un-preloaded while the roman is preloaded. Both calls emit the same family name, "Cormorant Garamond". The italic instance is reached through its own CSS variable, `--font-cormorant-italic` (via `--font-display-italic`), which is why italics use the explicit family switch (§9.3).

### 9.2 Font tokens

| Token | Where | Value | Utility |
|---|---|---|---|
| `--font-*: initial` | `@theme` (first) | reset. It drops Tailwind's default `font-sans` / `font-serif` / `font-mono` stacks. | — |
| `--font-body` | `@theme inline` | `var(--font-jost), ui-sans-serif, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | `font-body` |
| `--font-display` | `@theme inline` | `var(--font-cormorant), Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", ui-serif, Georgia, serif` | `font-display` |
| `--font-display-italic` | `@theme inline` | `var(--font-cormorant-italic), Garamond, Baskerville, "Baskerville Old Face", "Hoefler Text", "Times New Roman", ui-serif, Georgia, serif` | `font-display-italic` |
| `--font-sans` | `@theme inline` | `var(--font-body)`, **the preflight alias** (tokens.md §10). It makes `html` and all unstyled text Jost. | `font-sans` (equivalent to `font-body`) |
| `--font-mono` | `@theme` | `ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace`, a system stack with no download, for preflight's `code`/`kbd`/`pre` | `font-mono` |
| `--font-wordmark` | **`:root`** (documentation only) | `"Pinyon Script", cursive`. Records the SVG's source face. Nothing reads it, no utility is generated, and no font is loaded. | none, by design |
| `--font-weight-*: initial` | `@theme` | reset (drops `font-thin` … `font-black`) | — |
| `--font-weight-regular` / `-medium` / `-semibold` | `@theme` | `400` / `500` / `600` | `font-regular`, `font-medium`, `font-semibold` |
| `--color-wordmark` | `@theme` | `var(--color-gold-300)` | `text-wordmark` |

- `@theme inline` follows the Next.js + Tailwind v4 pattern: the next/font variables are declared by classes on `<html>`, and `inline` makes the utilities use the next/font variable directly.
- The system stacks are the §2.2 and §2.3 fallback stacks, appended after the next/font variable (which already holds the family and its metric-adjusted fallback face), because `fallback` is not passed to next/font (§9.1).
- We alias `--font-sans` rather than setting `--default-font-family`, so the `font-sans` utility and preflight agree.
- **Verify in M1.11:** the computed `font-family` of `<body>` starts with `"Jost"` (the plain family name), with the `"Jost Fallback"` face next, and an `<h2 class="font-display">` starts with `"Cormorant Garamond"`, with `"Cormorant Garamond Fallback"` next.

### 9.3 Type-scale tokens (`@theme`)

Start with `--text-*: initial;`, which drops `text-xs` … `text-9xl` so only this scale exists. Each step uses Tailwind v4's sub-properties `--text-<name>--line-height`, `--text-<name>--letter-spacing` and `--text-<name>--font-weight`, so the single utility `text-<name>` sets all four.

| Variable | Value | `--line-height` | `--letter-spacing` | `--font-weight` |
|---|---|---|---|---|
| `--text-display-1` | `clamp(2.75rem, 1.9143rem + 3.4286vw, 5rem)` | `1.05` | `-0.01em` | `500` |
| `--text-display-2` | `clamp(2.375rem, 1.7714rem + 2.4762vw, 4rem)` | `1.08` | `-0.01em` | `500` |
| `--text-h1` | `clamp(2.125rem, 1.7071rem + 1.7143vw, 3.25rem)` | `1.1` | `-0.005em` | `500` |
| `--text-h2` | `clamp(1.75rem, 1.4714rem + 1.1429vw, 2.5rem)` | `1.15` | `0em` | `500` |
| `--text-h3` | `clamp(1.5rem, 1.3607rem + 0.5714vw, 1.875rem)` | `1.2` | `0.005em` | `600` |
| `--text-h4` | `clamp(1.375rem, 1.3286rem + 0.1905vw, 1.5rem)` | `1.25` | `0.01em` | `600` |
| `--text-body-lg` | `clamp(1.125rem, 1.0786rem + 0.1905vw, 1.25rem)` | `1.6` | `0em` | `400` |
| `--text-body` | `clamp(1rem, 0.9536rem + 0.1905vw, 1.125rem)` | `1.65` | `0.01em` | `400` |
| `--text-body-sm` | `clamp(0.875rem, 0.8518rem + 0.0952vw, 0.9375rem)` | `1.5` | `0.015em` | `400` |
| `--text-caption` | `0.8125rem` | `1.45` | `0.02em` | `400` |
| `--text-eyebrow` | `clamp(0.8125rem, 0.7893rem + 0.0952vw, 0.875rem)` | `1.3` | `0.14em` | `500` |
| `--text-button` | `1rem` | `1.25` | `0.03em` | `500` |
| `--text-price` | `clamp(1rem, 0.9536rem + 0.1905vw, 1.125rem)` | `1.3` | `0.01em` | `500` |
| `--text-price-lg` | `clamp(1.25rem, 1.1571rem + 0.381vw, 1.5rem)` | `1.2` | `0em` | `500` |
| `--text-nav` | `clamp(0.9375rem, 0.9143rem + 0.0952vw, 1rem)` | `1.3` | `0.02em` | `500` |

- These names don't collide with any `--color-*` name, so `text-h1` (size) and `text-text-primary` (colour) stay distinct.
- Family, transform and numeric features are not `--text-*` sub-properties. Recommended: composite utilities (`@utility`, tech-agent's call) named `type-display-1` … `type-nav` that combine the family, the `text-*` step, `uppercase` (eyebrow only) and `font-variant-numeric` (`lining-nums` on display steps; `lining-nums tabular-nums` on price steps), so components use one class per role.
- Base styles (tech-agent): `body` uses `text-body` and `text-text-primary`; `strong, b` use weight 600; `font-synthesis-weight: none` on `html`; inside display headings and `type-display-*`, `em` and `i` switch to `font-display-italic` with `font-style: italic` at weight 500.

### 9.4 Other typography variables

| Variable | Where | Value |
|---|---|---|
| `--container-measure-prose` | `@theme` | `65ch` (utility `max-w-measure-prose`) |
| `--container-measure-intro` | `@theme` | `45ch` (`max-w-measure-intro`) |
| `--container-measure-heading` | `@theme` | `18ch` (`max-w-measure-heading`) |
| `--wordmark-h-header` | `:root` | `1.75rem` → md `2rem` → xl `2.25rem` (overridden per breakpoint) |
| `--wordmark-h-footer` | `:root` | `2.5rem` → md `2.75rem` → xl `3rem` |

`--tracking-*` and `--leading-*` may also be reset (`initial`) to stop off-scale values. That's optional and tech-agent's call: the `--text-*` sub-properties already carry every line-height and tracking value.

---

## 10. Spec checklist notes

- **Layout per breakpoint:** the fluid scale (§4) covers 390 → 1440, and the wordmark sizes are per breakpoint (§3.3). Page layouts come with their page specs.
- **Components:** the header and footer (wordmark, M1.12/M1.13), buttons (`button` step), product card (`h4` / `price`, M3.1). Each component spec names its type tokens.
- **States:** wordmark hover and focus are in §3.4. Link states are in tokens.md §2.3.
- **Motion:** none of its own (§7.5).
- **Data needs:** none, except that prices are formatted by the data layer and rendered with `price` / `price-lg`.
- **Images:** the wordmark SVG (§3.2). No text in other images (§7.2).
- **IP check:** every family is a generic Google Font. Every sample in §8 is original. "Moonlit Terrace" comes from the brand brief's own examples. "Midnight Balcony", "Light a little starlight." and the care copy are new and describe atmosphere in generic words. No names, places, titles, terms or phrasing from the inspiring series, and no "Court of …" or "High Lord/Lady" style combinations. Re-read and confirmed.

---

## 11. Open questions

1. **Wordmark source.** At launch the wordmark is an SVG outlined from Pinyon Script 400 (§3). Later, the user may want a custom-lettered mark instead (commissioned or hand-drawn), which would replace the committed SVG with no other change to this spec. Related: the script is never live text; if a script text style were ever wanted beyond the wordmark, its minimum would be 32px for one or two words (§7.4). [confirm with user: keep the Pinyon-based mark, or plan a custom-lettered one]
2. **Italic accent word in the home hero heading.** It would need the Cormorant italic file (23,900 B) on the home page's first paint on mobile. That file isn't preloaded, so the word would swap in late in the LCP area, and preloading it adds about 24 KB to every route. **Forbidden at launch for now** (§6.2). Below-the-fold headings may use it. [confirm with user: is an italic word in the hero heading worth the extra file?]
3. **Currency.** The specimen price is shown as `$34.00` (§8). [confirm with user: currency]
4. **"Poured by hand in small batches".** The body-lg specimen makes a production claim (§8) that must be true before it ships anywhere. [confirm with user: production claims]
