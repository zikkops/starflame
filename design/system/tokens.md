# Design tokens (M1.9)

Status: spec, **QA PASSED** (fix round 1), with post-pass minors 1–5, post-pass check minors 1–3, the M1.12 layout-shell registrations, the M1.18 starfield clarifications, the M2.1 newsletter-background note and the M2.1 fix round 2 wording note applied (changelog below). Owner: design-agent. Implemented by tech-agent in M1.11.

## Changelog

**M2.1 home fix round 2: QA issues 1–7** (2026-10-10). Only issue 7 touches this file. No value changes.

1. §2.6: the places for the one haze band or veil per view are now **examples**, not a fixed list. It said "(hero, brand story, newsletter)", which read as if those three were where haze typically goes; home keeps its hero `solid` and its newsletter on `sunken`, with the brand story as its one haze band (`design/pages/home.md` §2.1). Each page spec decides where its haze goes. No token, value, name or ratio changes.

**M2.1 home fix round 1: the newsletter's background** (2026-10-10). No value changes.

1. §2.5 rule 7 and the §2.3 `bg-haze` use note: the newsletter form may sit on solid **bg-sunken** (`border-control` 4.74:1, U3) as well as solid bg-haze (U14). Rule 7 already listed bg-sunken as an allowed background for form controls; only the sentence naming the newsletter's place said "bg-haze". The home page puts the newsletter on a `sunken` band because its brand story is the page's one haze band (`design/pages/home.md` §2.1). No ratio, value or name changes.

**Post-pass minors from M1.13 review** (2026-10-09). No value changes.

1. Checked for the prose container's utility: this file doesn't list it as `max-w-prose` anywhere (§9 and §11.4 name only the `--container-*` variables), so nothing here changes. For reference, the utility is `max-w-(--container-prose)`, because Tailwind 4's built-in `max-w-prose` is a fixed 65ch (`design/components/layout-shell.md` §4.1). `max-w-content` and `max-w-wide` don't collide with Tailwind built-ins.

**M1.18 starfield fix round 1: two usage notes** (2026-10-09). No value changes.

1. §2.3, stars and particles row: in the starfield's content column (behind text) the opacity is capped at **0.14** (`design/components/starfield.md` §3.2); the 0.3–0.9 range applies only outside it (the edge zones, particles in verified empty sky).
2. §2.2, night-500: the use note no longer says "constellation lines". Constellation lines are the `constellation` role, gold-300 at 35% (§2.3), as the starfield draws them; night-500 stays a decorative icon fill.

**M1.12 layout-shell post-pass minors 4–5: registrations** (2026-10-09)

1. §9.1 (new), §11.0 and §11.4: the layout-shell variables `--header-h`, `--scroll-offset`, `--page-inline-start` and `--page-inline-end`, and the short-viewport query `@media (max-height: 28rem)`, are registered here. Their behaviour stays owned by `design/components/layout-shell.md` §3.4, §4.1 and §6.5.
2. §8: the `z-starfield` row now says what the layer holds (stars, constellation lines and particles only; haze lives in bands) and how it is sized (`top: 0` with a `100lvh` height, not `inset: 0`), matching layout-shell.md §8.

**Post-pass minors from M1.11 review** (2026-10-09)

1. §11.2: `badge-new` and `badge-bestseller` have no variables of their own. They reuse `border-accent` and `text-accent` (both gold-400) on a transparent fill.
2. §11.0: the colour tokens are implemented in `@theme static`, so every `--color-*` is emitted and readable at runtime. Approved.
3. §11.0: the minifier rewrites custom-property times and colours, so JS reads motion values from the TS constants module (`motion.md` §7), not from `getComputedStyle`.

**M1.7 fix round 1: Bestseller badge** (2026-10-09)

1. `badge-bestseller` added to §2.3. It reuses the `badge-new` outline style (transparent on bg-raised, 1px gold-400 border, gold-400 text); the label text tells the two apart. New row T56 (§3.2), with its working in `accessibility.md` §2.4. Its border is covered by U5.

**Post-pass check minors 1–3: alignment with typography.md** (2026-10-09)

1. §10 and §11.4 now say `@theme inline` for the next/font-backed font tokens (`--font-sans`, `--font-display`, `--font-display-italic`, `--font-body`), matching typography.md §9.2. `--font-mono` stays in plain `@theme`. §11.0 is updated to match.
2. `--font-display-italic` added to the §10 table and the §11.4 font row.
3. `--wordmark-h-header` and `--wordmark-h-footer` added to the §11.0 `:root` column.

**Post-pass minors 1–5** (2026-10-09)

1. CTA glow family added. `shadow-glow-candle` (ember-400 at 0.28) had no ceiling. Over haze worst its peak composite is `#8F5E6A` (L 0.14886): gold-300 drops to 3.46:1 there, and a ghost border next to it to 1.85:1. Decision: **the CTA glow is switched off over any haze gradient** (new §2.5 rule 9). It may appear only over solid backgrounds, where the worst composite is `#594E55` over bg-overlay (L 0.08229). That is the new family ceiling (§2.4). New rows T54–T55, U16, X8–X10. Inside the glow footprint, only the CTA's own focus ring and text in text-primary, text-secondary or link colours are allowed. The focus-ring minimum is corrected from "at least 5.72:1" to **5.21:1** (U16; `accessibility.md` §3). `shadow-glow-candle` is now CTA-only. **The hero image uses `gradient-candle-glow` alone**: no box-shadow halo is stacked on it (§2.4, §2.5 rule 6, §6.2).
2. bg-sunken (the footer base) added to rule 7's allowed backgrounds for form controls (border-control on bg-sunken is 4.74:1, U3).
3. `motion.md` §5.1: new requirement for the M2 hero spec covering the LCP element at 390px.
4. `accessibility.md` §8: "CSS fallback" corrected to "an inline-script timer fallback (`motion.md` §5.1)".
5. `accessibility.md` §2: gold-400 R_lin restored to 0.693872 (L 0.502250). T39 is 4.5804, so it still reads 4.58. The QA-rounding parenthetical is removed.

**Fix round 1: QA issues 1–11** (2026-10-09)

1. Candle glow placement restricted (option a): `gradient-candle-glow` sits only on solid bg-page or bg-sunken, never on a haze gradient, bg-haze or bg-raised, and never under text or controls (§2.4, §2.5 rule 6). The hero and featured-card compositions are restated. Separate haze and glow ceilings replace the self-contradicting single ceiling (§2.4). New rows T51–T53 cover the `shadow-glow-candle-soft` halo that featured cards use instead.
2. Haze worst corrected from `#663A6D` (L 0.0696) to **`#663B6D` (L 0.07057)**. T36–T39, U2, U8, X2 and X4 recomputed. No verdicts change.
3. UI pairs over haze added (U11–U15). New §2.5 rule 7: form controls never sit over a haze gradient.
4. Status text on bg-haze added to T42–T45. New X7 (coral over haze worst, which fails). New §2.5 rule 8: status text is never placed over a gradient.
5. `--color-cta-text` dropped. CTA text is `text-inverse` everywhere (§2.3, §11.2).
6. §11 now says which variables go in `@theme` and which plain variables go in `:root` (§11.0). The same applies in `motion.md` §7.
7. §11 now recommends resetting `--radius-*`, `--shadow-*`, `--ease-*` (and `--animate-*`) as well as colours and breakpoints.
8. Hero entrance without a flash of visible-then-hidden content: `motion.md` §5.1.
9. GSAP stagger cap corrected (`amount` overrides `each`): `motion.md` §4.
10. `<dialog>.showModal()` and the top layer: §8 note. Toasts render inside the open dialog.
11. Tailwind preflight font: §10 note to alias `--font-sans` to `--font-body`.

Companion files:
- [`motion.md`](./motion.md): durations, easings, stagger, the reduced-motion policy
- [`accessibility.md`](./accessibility.md): the luminance working behind every ratio in §3, plus the global focus, touch-target and forced-colors rules
- [`typography.md`](./typography.md) (M1.10): families, type scale and the values for the font tokens reserved in §10

---

## 1. Purpose and acceptance criteria

Purpose: one shared vocabulary of colour, space, shape, depth, layering, motion and breakpoints. Every later page and component spec refers to these names and never to raw hex or px values.

Acceptance criteria (from M1.9, refined):

1. **Colour.** Raw scales with exact hex for night (navy/indigo), haze violet, haze rose, starlight gold, ember (candle-glow amber), the moon neutrals and the status hues. Semantic roles for background layers, text, borders, focus, primary CTA states, the secondary/ghost button, links, status colours, badges, star/particle colours, glows and haze gradients. Dark-only, with the reason stated.
2. **Contrast table.** Every text/background and UI/background pair has a computed ratio and an AA verdict. No failing pair is ever used for text. The table covers text on the amber CTA and text over the worst case of the haze and glow gradients.
3. **Spacing** (4px base), **radius** (including the arched frame, which scales with width), **shadows/glows**, **z-index**, **borders**.
4. **Motion tokens** with GSAP and CSS easings and the reduced-motion policy, kept in `motion.md`. Only `transform` and `opacity` animate.
5. **Breakpoints** 390 (base) / 768 / 1024 / 1440, containers and gutters per breakpoint, touch targets of at least 44×44.
6. **Tailwind v4 mapping table** (§11): names and values only, with which ones go in `@theme` and which go in `:root`.
7. **Font family token names reserved** for M1.10.
8. **Usage proportion** described (§2.6).
9. **IP guardrail:** every token name is generic (night, haze, gold, ember, moon, moss, honey, coral, tide). No series terms.

---

## 2. Colour

### 2.1 Theme: dark only (night)

- **The site has a single night theme. No light theme exists, and none is planned.**
- Why: the brand *is* a night sky, and candles read as glowing only against darkness. Product photography is art-directed for dark surroundings (see the image notes in §6.3). A light theme would weaken the brand and double the contrast and screenshot QA for no customer benefit.
- Implementation: set `color-scheme: dark` on `<html>` so native form controls, scrollbars and autofill match. Do **not** add `prefers-color-scheme` switches. Visitors whose OS is in light mode still get the night theme, which is intentional.
- Forced-colors / Windows High Contrast is still supported. See `accessibility.md` §5.

### 2.2 Raw scales

Raw tokens are never used directly in components. Components use the semantic roles in §2.3. Scale steps marked "decorative" never carry text.

**Night: the base, deep midnight navy to indigo**

| Token | Hex | Typical use |
|---|---|---|
| night-50 | `#F1F2FA` | spare tint (not used for text, see moon-100) |
| night-100 | `#DDE0F2` | spare tint |
| night-200 | `#C3C6E0` | secondary text |
| night-300 | `#9097C2` | muted text, ghost-button border |
| night-400 | `#6E78B6` | input and control borders (UI, 3:1) |
| night-500 | `#3F4A8A` | decorative (icon fills on dark). Constellation lines are not night-500: they use the `constellation` role, gold-300 at 35% (§2.3) |
| night-600 | `#2A3468` | dividers (decorative) |
| night-700 | `#1C2550` | overlay / sheet / modal surface, disabled CTA fill |
| night-800 | `#131A38` | raised surface (cards, header when scrolled) |
| night-900 | `#0B0F24` | page background |
| night-950 | `#070914` | sunken (inputs, footer base, starfield base) |

**Haze violet** (all decorative except where §3 lists a pair)

| Token | Hex |
|---|---|
| violet-100 | `#E4DCF7` |
| violet-200 | `#C9B8F2` |
| violet-300 | `#A893DC` |
| violet-400 | `#8A70C6` |
| violet-500 | `#6E4FB0` |
| violet-600 | `#533A8E` |
| violet-700 | `#3D2770` |
| violet-800 | `#2A1B55` |
| violet-900 | `#1E1240` |

**Haze rose (dusky pink)**

| Token | Hex |
|---|---|
| rose-100 | `#F4E1EA` |
| rose-200 | `#E9C3D5` |
| rose-300 | `#D9A3BE` |
| rose-400 | `#C686A7` |
| rose-500 | `#B0688F` |
| rose-600 | `#8C4C74` |
| rose-700 | `#6B3561` |
| rose-800 | `#4A2348` |
| rose-900 | `#2E1430` |

**Starlight gold** (small accents)

| Token | Hex |
|---|---|
| gold-100 | `#F7ECD2` |
| gold-200 | `#F0DEB4` |
| gold-300 | `#E8CF96` |
| gold-400 | `#D9B871` |
| gold-500 | `#C9A45C` |
| gold-600 | `#A8853F` |
| gold-700 | `#8A6A2A` |
| gold-800 | `#5E4719` |

**Ember: candle-glow amber** (reserved for the primary CTA and the candle-glow highlight)

| Token | Hex |
|---|---|
| ember-100 | `#FEEBCB` |
| ember-200 | `#FDDDA8` |
| ember-300 | `#FBCF8A` |
| ember-400 | `#F7B861` |
| ember-500 | `#F0A040` |
| ember-600 | `#D9822B` |
| ember-700 | `#B4661A` |
| ember-800 | `#7F4510` |

**Moon: warm ivory neutrals**

| Token | Hex | Use |
|---|---|---|
| moon-50 | `#FFF8E7` | star cores, the brightest glints (decorative) |
| moon-100 | `#F3EFE7` | primary text. A warm ivory reads as candlelight; pure white would glare on night-900. |

**Status hues** (softened to sit in the night palette; each comes in a light "300" for text and icons and a dark "900" for surfaces)

| Token | Hex | Token | Hex |
|---|---|---|---|
| moss-300 (success) | `#86D1B0` | moss-900 | `#0F2A2B` |
| honey-300 (warning) | `#EBC46B` | honey-900 | `#2E2614` |
| coral-300 (error) | `#F28B9B` | coral-900 | `#33141F` |
| tide-300 (info) | `#93B4F0` | tide-900 | `#13213F` |

Warning (honey) sits close to gold and ember in hue. It is never the only signal: every status message carries an icon and a text label (see `accessibility.md` §4).

### 2.3 Semantic roles

| Role | Token (semantic) | Value |
|---|---|---|
| **Background layers** | | |
| Page | `bg-page` | night-900 `#0B0F24` |
| Sunken (inputs, footer base, a newsletter band next to the footer) | `bg-sunken` | night-950 `#070914` |
| Raised surface (cards, scrolled header, dropdowns) | `bg-raised` | night-800 `#131A38` |
| Overlay / sheet / drawer / modal | `bg-overlay` | night-700 `#1C2550` |
| Haze band (a solid violet section band, e.g. a newsletter band where the page has no other haze nearby) | `bg-haze` | violet-900 `#1E1240` |
| Scrim behind drawer/modal | `bg-scrim` | `rgba(7, 9, 20, 0.72)` (night-950 at 72%) |
| Text selection | `bg-selection` | violet-600 `#533A8E`, text stays moon-100 |
| **Text** | | |
| Primary | `text-primary` | moon-100 `#F3EFE7` |
| Secondary | `text-secondary` | night-200 `#C3C6E0` |
| Muted (captions, placeholders, meta) | `text-muted` | night-300 `#9097C2` |
| Inverse on amber / gold / rose fills (including all CTA text) | `text-inverse` | night-900 `#0B0F24` |
| Accent (eyebrows, small labels, stars-in-text) | `text-accent` | gold-400 `#D9B871` |
| Glow highlight (rare; one highlighted word or price-drop) | `text-glow` | ember-400 `#F7B861` |
| Disabled | `text-disabled` | night-300 `#9097C2` (on bg-overlay) |
| **Borders** | | |
| Divider (decorative hairline) | `border-divider` | night-600 `#2A3468` |
| Control border (inputs, checkboxes, select) | `border-control` | night-400 `#6E78B6` |
| Ghost-button border | `border-ghost` | night-300 `#9097C2` |
| Accent border (hover, selected, "new" badge) | `border-accent` | gold-400 `#D9B871` |
| Error border | `border-error` | coral-300 `#F28B9B` |
| **Focus** | | |
| Focus ring | `focus-ring` | gold-300 `#E8CF96`, 2px solid, 2px offset (see §7) |
| **Primary CTA (ember)** | | |
| Default | `cta-bg` | ember-400 `#F7B861`, text `text-inverse` |
| Hover | `cta-bg-hover` | ember-300 `#FBCF8A` (the flame brightens), plus the candle glow fading in (§6.2), except where §2.5 rule 9 switches the glow off |
| Active / pressed | `cta-bg-active` | ember-500 `#F0A040` |
| Disabled | `cta-bg-disabled` | night-700 `#1C2550`, text `text-disabled`, border `border-divider`, no glow |
| Focus-visible | — | default fill plus `focus-ring` (plus the glow where rule 9 allows it) |
| **Secondary / ghost button** | | |
| Default | — | transparent fill, `text-primary`, 1px `border-ghost` |
| Hover | — | fill `bg-raised`, border `border-accent` |
| Active | — | fill `bg-overlay`, border `border-accent` |
| Disabled | — | transparent, `text-disabled`, border `border-divider` |
| **Link** | | |
| Default | `link` | gold-300 `#E8CF96`, always underlined (1px, 0.2em offset) |
| Hover | `link-hover` | moon-100 `#F3EFE7`, underline stays |
| Visited | — | same as default (a shop, not a document) |
| **Status** (text and icon / surface) | | |
| Success | `success` / `success-surface` | moss-300 / moss-900 |
| Warning | `warning` / `warning-surface` | honey-300 / honey-900 |
| Error | `error` / `error-surface` | coral-300 / coral-900 |
| Info | `info` / `info-surface` | tide-300 / tide-900 |
| **Badges** | | |
| Limited | `badge-limited` | fill gold-400, text `text-inverse` |
| Sale | `badge-sale` | fill rose-300 `#D9A3BE`, text `text-inverse` |
| New | `badge-new` | fill transparent on `bg-raised`, 1px gold-400 border, text gold-400 |
| Bestseller | `badge-bestseller` | same outline style as `badge-new`: fill transparent on `bg-raised`, 1px gold-400 border, text gold-400 (T56). The label text, not the colour, tells it apart from New. |
| Cart count | `badge-count` | fill gold-400, text `text-inverse` (not ember, which stays scarce) |
| **Stars and particles** (decorative, behind content, opacity 0.3–0.9; **in the starfield's content column, behind text, at most 0.14**, including twinkle peaks and constellation lines: see `design/components/starfield.md` §3.2) | | |
| Star core | `star-core` | moon-50 `#FFF8E7` |
| Star gold | `star-gold` | gold-300 `#E8CF96` |
| Star violet | `star-violet` | violet-200 `#C9B8F2` |
| Star rose | `star-rose` | rose-200 `#E9C3D5` |
| Constellation line | `constellation` | gold-300 at 35% opacity |

There is no separate CTA text token: CTA text is always `text-inverse`.

### 2.4 Glows and haze gradients

All gradients are background layers behind content, never over product images. Peak alphas are hard ceilings: the contrast table's worst cases depend on them.

| Token | Value | Use |
|---|---|---|
| `gradient-haze-dusk` | `linear-gradient(180deg, #0B0F24 0%, #1E1240 55%, #4A2348 100%)` | hero and section bands, night melting into violet and dusky rose |
| `gradient-haze-veil` | `radial-gradient(60% 50% at 70% 20%, rgba(110, 79, 176, 0.28) 0%, rgba(110, 79, 176, 0) 70%)` | a violet mist laid over night or dusk |
| `gradient-haze-blush` | `radial-gradient(50% 40% at 20% 80%, rgba(176, 104, 143, 0.20) 0%, rgba(176, 104, 143, 0) 70%)` | a rose mist, used sparingly |
| `gradient-candle-glow` | `radial-gradient(closest-side, rgba(247, 184, 97, 0.35) 0%, rgba(247, 184, 97, 0.12) 45%, rgba(247, 184, 97, 0) 100%)` | the warm pool of light behind a hero or featured candle image. **Only on solid bg-page or bg-sunken** (§2.5 rule 6). It is the hero image's only glow: no box-shadow halo is stacked on it. |
| `gradient-starlight-rule` | `linear-gradient(90deg, rgba(232, 207, 150, 0) 0%, rgba(232, 207, 150, 0.6) 50%, rgba(232, 207, 150, 0) 100%)` | a 1px divider that fades out at both ends |

**Worst-case composites** (used in §3; working in `accessibility.md` §2.3):
- **Haze worst `#663B6D`, L 0.07057.** Veil (28%) and blush (20%) both at peak, stacked over the lightest dusk stop `#4A2348`. Text may sit over haze within the limits of §2.5 rule 4.
- **Glow worst `#5E4A39`, L 0.07573.** Candle glow at its 35% peak over night-900. Over night-950 the composite is darker in every channel, so night-900 is the worst permitted case. The glow never sits under text or controls, so T40/T41/X3 are a safety margin for a faded glow edge, not a permitted text pairing.
- **Candle halo worst `#33303E`, L 0.03166.** `shadow-glow-candle-soft` (ember-400 at 14%) over bg-raised: the warmth a featured card uses instead of the gradient glow (T51–T53).
- **CTA glow worst `#594E55`, L 0.08229.** `shadow-glow-candle` (ember-400 at its 28% peak) over bg-overlay, the lightest solid background a primary CTA may sit on. Over bg-raised, bg-haze, bg-page and bg-sunken the composite is darker (`accessibility.md` §2.3). Over haze worst it would be `#8F5E6A`, L 0.14886, which is why the glow is switched off over any haze gradient (§2.5 rule 9, X8).

**Ceilings (one per family).** A new layer, a different stack, or a higher alpha must not produce a composite lighter than its family's ceiling. If it would, design-agent recomputes §3 first. Two glow families never stack: no element carries both the gradient glow and a box-shadow glow, and their footprints don't overlap.

| Family | Ceiling composite | Ceiling L | Where it may appear |
|---|---|---|---|
| Haze (dusk, veil, blush, in any stack) | `#663B6D` | 0.07057 | behind text, within §2.5 rule 4 |
| Candle glow (`gradient-candle-glow`) | `#5E4A39` | 0.07573 | only on bg-page or bg-sunken, never under text or controls, never overlapping a haze layer or another glow |
| Candle halo (`shadow-glow-candle-soft`) | `#33303E` | 0.03166 | around a featured image on bg-raised or bg-page |
| CTA glow (`shadow-glow-candle`) | `#594E55` | 0.08229 | around the primary CTA on hover/focus, only over solid bg-page, bg-sunken, bg-raised, bg-overlay or bg-haze, never over a haze gradient or another glow (§2.5 rule 9) |

### 2.5 Colour rules

1. **Ember is scarce.** It appears on one primary CTA per viewport and in the candle glow. It never appears on badges, links, headings, icons or decorative stars. `text-glow` is limited to one highlighted word or figure per page section.
2. **Gold is for small things:** four-point stars, eyebrows, focus rings, links, thin rules, badge fills, icon strokes. It is never a large fill.
3. **Haze is atmosphere, not a surface:** at most one haze band or veil per viewport. Product cards always sit on `bg-raised` or `bg-page`, never on a gradient. That keeps product colours true.
4. **Text over haze** uses only `text-primary` or `text-secondary` (gold-300 is allowed for links and small eyebrows; gold-400 for large text only). `text-muted` is **forbidden** over any gradient (it fails; see §3).
5. **Nothing glows on top of products.** Glows and particles sit behind product images, and their z-index is lower (§8).
6. **The candle glow sits only on solid bg-page or bg-sunken.** Never on a haze gradient, on bg-haze or on bg-raised, and never under text or controls. Its footprint (the `closest-side` circle) must not overlap any text box, control or haze layer at any breakpoint. In practice:
   - **Hero:** the product image and its glow sit in an area of plain bg-page. The hero's haze (a dusk band, a veil or a blush) goes elsewhere: below the product area, or a veil/blush positioned in the opposite part of the hero, with no overlap with the glow's circle. **The hero image uses `gradient-candle-glow` only.** It carries no `shadow-glow-candle` or `shadow-glow-candle-soft` on top. The hero spec (M2) shows the arrangement at each breakpoint.
   - **Featured candles in cards (bg-raised):** no gradient glow. The image gets `shadow-glow-candle-soft` instead (§6.2; text pairs T51–T53).
   - **A featured candle band** that wants the full glow places the product on bg-page, outside a card.
7. **Form controls never sit over a haze gradient.** Inputs, selects, checkboxes and their labels sit only on solid bg-sunken, bg-page, bg-raised, bg-overlay or bg-haze. On bg-sunken (the footer base) `border-control` is 4.74:1 (U3). Over haze worst, `border-control` is 2.08:1 and the bg-sunken fill is 2.27:1, both failing 3:1 (U11, U12). The newsletter form therefore sits on solid ground, **bg-haze (U14) or bg-sunken (U3)**, never on a dusk band. (Home puts it on bg-sunken, because its brand story is the page's one haze band: `design/pages/home.md` §2.1.) The primary CTA may sit over haze (U2), without its glow (rule 9). A ghost button may too, but only just (U13, 3.06:1), so prefer solid ground.
8. **Status text is never placed over a gradient.** Success, warning, error and info messages sit on a solid background (T42–T45) or on their own status surface (T46–T50). Coral over haze worst is 3.70:1, which fails (X7).
9. **The CTA glow (`shadow-glow-candle`) is for the primary CTA only, and only over solid ground.**
   - Its **footprint** is the button's box plus **26px** on every side (2px spread + 24px blur). The whole footprint must lie over solid bg-page, bg-sunken, bg-raised, bg-overlay or bg-haze.
   - **Over any haze gradient the glow is switched off.** The CTA keeps the ember-300 hover fill, the press scale and the focus ring, with no glow. tech-agent provides this as a no-glow variant of the primary button (prop name is tech-agent's choice, e.g. `glow={false}`). Page specs say which CTAs use it.
   - **Inside the footprint, only these are allowed:** the CTA's own focus ring (U16, 5.21:1) and text in text-primary, text-secondary or link gold-300 (T54, T55). **No other control boundary** (ghost border, control border, chip, stepper) and **no text-muted** may fall inside it: those fail (X9, X10).
   - So a control placed beside the CTA either keeps at least 26px from the CTA's edge, or the CTA uses the no-glow variant. Examples: a quantity stepper 8px from "Add to bag", or the newsletter email field next to its submit button, means that CTA runs without the glow.
   - No other component uses `shadow-glow-candle`, and it is never stacked with another glow (§2.4).

### 2.6 How the palette is used on a typical page

On a typical page, roughly 80% is deep night (page, raised cards, sunken footer), so products and their photography carry the colour. About 10–15% is violet and rose haze, used as one soft band or veil per view (for example a brand-story band, a newsletter band or a veil in a hero; each page spec decides where) and never behind product grids. Starlight gold makes up about 5%: tiny four-point stars, eyebrows, link underlines, focus rings and hairline rules. Candle-glow amber is the rarest colour, at 2% or less: the single primary CTA (Add to bag, Shop the collection) and the warm glow behind a hero candle, so the eye always lands on the product and then the button.

---

## 3. Contrast table

Method: WCAG 2.x relative luminance, L = 0.2126 R + 0.7152 G + 0.0722 B on linearised sRGB channels, with ratio = (L_light + 0.05) / (L_dark + 0.05). Ratios are **rounded down** to 2 decimals (so a figure computed elsewhere with round-to-nearest may read 0.01 higher). The per-colour luminance working is in `accessibility.md` §2.
Thresholds: **4.5:1** for body text, **3:1** for large text (≥ 24px regular or ≥ 18.66px bold) and for UI components and focus indicators (WCAG 1.4.11). Pairs are labelled T (text) or U (UI). Which type-scale steps count as large text is set in `typography.md` §6.

### 3.1 Text on solid backgrounds

| # | Foreground | Background | Ratio | Body 4.5 | Large/UI 3.0 |
|---|---|---|---|---|---|
| T1 | text-primary `#F3EFE7` | bg-sunken `#070914` | 17.30 | Pass | Pass |
| T2 | text-primary | bg-page `#0B0F24` | 16.52 | Pass | Pass |
| T3 | text-primary | bg-raised `#131A38` | 14.85 | Pass | Pass |
| T4 | text-primary | bg-overlay `#1C2550` | 12.80 | Pass | Pass |
| T5 | text-primary | bg-haze `#1E1240` | 15.06 | Pass | Pass |
| T6 | text-secondary `#C3C6E0` | bg-sunken | 11.78 | Pass | Pass |
| T7 | text-secondary | bg-page | 11.25 | Pass | Pass |
| T8 | text-secondary | bg-raised | 10.12 | Pass | Pass |
| T9 | text-secondary | bg-overlay | 8.72 | Pass | Pass |
| T10 | text-secondary | bg-haze | 10.26 | Pass | Pass |
| T11 | text-muted `#9097C2` | bg-sunken (incl. input placeholder) | 6.98 | Pass | Pass |
| T12 | text-muted | bg-page | 6.67 | Pass | Pass |
| T13 | text-muted | bg-raised | 5.99 | Pass | Pass |
| T14 | text-muted / text-disabled | bg-overlay | 5.16 | Pass | Pass |
| T15 | text-muted | bg-haze | 6.07 | Pass | Pass |
| T16 | text-accent gold-400 `#D9B871` | bg-page | 9.96 | Pass | Pass |
| T17 | text-accent | bg-raised | 8.96 | Pass | Pass |
| T18 | text-accent | bg-overlay | 7.72 | Pass | Pass |
| T19 | text-accent | bg-haze | 9.08 | Pass | Pass |
| T20 | link gold-300 `#E8CF96` | bg-page | 12.45 | Pass | Pass |
| T21 | link | bg-raised | 11.19 | Pass | Pass |
| T22 | link | bg-overlay | 9.64 | Pass | Pass |
| T23 | link | bg-sunken | 13.03 | Pass | Pass |
| T24 | text-glow ember-400 `#F7B861` | bg-page | 10.81 | Pass | Pass |
| T25 | text-glow | bg-raised | 9.72 | Pass | Pass |
| T26 | text-primary | bg-selection `#533A8E` | 7.74 | Pass | Pass |

### 3.2 Text on the amber CTA and on badges

| # | Foreground | Background | Ratio | Body | Large/UI |
|---|---|---|---|---|---|
| T27 | text-inverse `#0B0F24` | cta-bg ember-400 `#F7B861` | 10.81 | Pass | Pass |
| T28 | text-inverse | cta-bg-hover ember-300 `#FBCF8A` | 12.99 | Pass | Pass |
| T29 | text-inverse | cta-bg-active ember-500 `#F0A040` | 8.85 | Pass | Pass |
| T30 | text-disabled `#9097C2` | cta-bg-disabled `#1C2550` | 5.16 | Pass | Pass (disabled is exempt, but it passes anyway) |
| T31 | text-inverse | badge-limited / badge-count gold-400 | 9.96 | Pass | Pass |
| T32 | text-inverse | badge-sale rose-300 `#D9A3BE` | 8.96 | Pass | Pass |
| T33 | badge-new text gold-400 | bg-raised | 8.96 | Pass | Pass |
| T56 | badge-bestseller text gold-400 | bg-raised / bg-page | 8.96 / 9.96 | Pass | Pass (its 1px gold-400 border is U5) |

### 3.3 Text over haze and glow (worst cases)

| # | Foreground | Background | Ratio | Body | Large/UI |
|---|---|---|---|---|---|
| T34 | text-primary | dusk bottom stop `#4A2348` | 11.26 | Pass | Pass |
| T35 | text-secondary | dusk bottom stop | 7.67 | Pass | Pass |
| T36 | text-primary | **haze worst** `#663B6D` | 7.59 | Pass | Pass |
| T37 | text-secondary | haze worst | 5.17 | Pass | Pass |
| T38 | link gold-300 | haze worst | 5.72 | Pass | Pass |
| T39 | text-accent gold-400 | haze worst | 4.58 | Pass (thin margin: use gold-400 over haze **for large text only**; small eyebrows over haze use gold-300) | Pass |
| T40 | text-primary | **glow worst** `#5E4A39` | 7.28 | Margin check only: the glow never sits under text (§2.5 rule 6) | — |
| T41 | text-secondary | glow worst | 4.96 | Margin check only | — |
| T51 | text-primary | **candle halo worst** `#33303E` (featured card, bg-raised) | 11.21 | Pass | Pass |
| T52 | text-secondary | candle halo worst | 7.63 | Pass | Pass |
| T53 | text-muted | candle halo worst | 4.52 | Pass (thin margin: in a featured card, meta text near the image uses text-secondary) | Pass |
| T54 | text-primary | **CTA glow worst** `#594E55` (inside a CTA's glow footprint, over bg-overlay) | 6.92 | Pass | Pass |
| T55 | text-secondary / link gold-300 | CTA glow worst | 4.71 / 5.21 | Pass | Pass |

The glow composites over bg-haze, bg-raised and the haze stack (which QA measured at text-secondary 4.53, 4.45 and 2.78 respectively) are not tabled because rule 6 forbids those placements.

### 3.4 Status text (solid backgrounds only; never over a gradient)

| # | Foreground | Background | Ratio | Body | Large/UI |
|---|---|---|---|---|---|
| T42 | success moss-300 `#86D1B0` | bg-page / raised / overlay / haze | 10.61 / 9.54 / 8.22 / 9.67 | Pass | Pass |
| T43 | warning honey-300 `#EBC46B` | bg-page / raised / overlay / haze | 11.40 / 10.25 / 8.84 / 10.39 | Pass | Pass |
| T44 | error coral-300 `#F28B9B` | bg-page / raised / overlay / sunken / haze | 8.06 / 7.25 / 6.25 / 8.44 / 7.35 | Pass | Pass |
| T45 | info tide-300 `#93B4F0` | bg-page / raised / overlay / haze | 9.04 / 8.13 / 7.01 / 8.24 | Pass | Pass |
| T46 | success on success-surface `#0F2A2B` | — | 8.48 | Pass | Pass |
| T47 | warning on warning-surface `#2E2614` | — | 9.00 | Pass | Pass |
| T48 | error on error-surface `#33141F` | — | 7.09 | Pass | Pass |
| T49 | info on info-surface `#13213F` | — | 7.61 | Pass | Pass |
| T50 | text-primary on success / warning / error / info surface | — | 13.20 / 13.04 / 14.52 / 13.90 | Pass | Pass |

### 3.5 UI components and focus indicators (3:1)

| # | Element | Against | Ratio | UI 3.0 |
|---|---|---|---|---|
| U1 | cta-bg ember-400 (button shape) | bg-page | 10.81 | Pass |
| U2 | cta-bg ember-400 | haze worst `#663B6D` | 4.96 | Pass (no glow over haze, §2.5 rule 9) |
| U3 | border-control night-400 `#6E78B6` | bg-sunken / page / raised / overlay | 4.74 / 4.53 / 4.07 / 3.51 | Pass (lowest is on overlay) |
| U4 | border-ghost night-300 | bg-page / raised | 6.67 / 5.99 | Pass |
| U5 | border-accent gold-400 | bg-page / raised | 9.96 / 8.96 | Pass |
| U6 | border-error coral-300 | bg-sunken | 8.44 | Pass |
| U7 | focus-ring gold-300 | bg-sunken / page / raised / overlay / haze | 13.03 / 12.45 / 11.19 / 9.64 / 11.34 | Pass |
| U8 | focus-ring gold-300 | haze worst | 5.72 | Pass (the CTA glow is off here, so this is the composite the ring sees) |
| U9 | icon stroke gold-500 `#C9A45C` | bg-page | 8.07 | Pass |
| U10 | badge-sale fill rose-300 | bg-raised (card) | 8.05 | Pass |
| U11 | border-control night-400 | haze worst | 2.08 | **Fail.** Controls never sit over haze (§2.5 rule 7). |
| U12 | input fill bg-sunken `#070914` | haze worst | 2.27 | **Fail.** Same rule. |
| U13 | border-ghost night-300 | haze worst | 3.06 | Pass (narrow; prefer solid ground) |
| U14 | border-control night-400 | bg-haze | 4.13 | Pass (a newsletter form on bg-haze) |
| U15 | border-ghost night-300 | bg-overlay / bg-haze | 5.16 / 6.07 | Pass |
| U16 | focus-ring gold-300 | CTA glow worst `#594E55` (the CTA's own ring, inside its glow) | 5.21 | Pass. **This is the lowest ratio the focus ring meets anywhere** (`accessibility.md` §3). |

### 3.6 Pairs that fail and are forbidden

These are listed so nobody reaches for them. None may be used for text, and the UI-only ones are noted.

| # | Pair | Ratio | Verdict |
|---|---|---|---|
| X1 | text-primary (ivory) on cta-bg ember-400 | 1.52 | **Fail.** CTA text is always text-inverse. |
| X2 | text-muted on haze worst `#663B6D` | 3.06 | **Fail for body.** Forbidden over gradients. |
| X3 | text-muted on glow worst `#5E4A39` | 2.93 | **Fail.** Forbidden (and the glow never sits under text anyway). |
| X4 | gold-500 text on haze worst | 3.71 | **Fail for body.** Gold-500 is for icons only, never text. |
| X5 | focus-ring gold-300 directly against ember-400 | 1.15 | **Fail.** This is why the 2px offset is mandatory: the ring sits on the page background, not on the button. |
| X6 | border-divider night-600 `#2A3468` vs bg-page | 1.61 | Decorative only. It must never be the only boundary of an interactive control. |
| X7 | error coral-300 on haze worst | 3.70 | **Fail for body.** Status text is never placed over a gradient (§2.5 rule 8). |
| X8 | CTA glow over haze worst `#8F5E6A`: focus-ring gold-300 / border-ghost / text-secondary | 3.46 / 1.85 / 3.13 | **Not permitted.** The CTA glow is switched off over any haze gradient (§2.5 rule 9). |
| X9 | border-ghost / border-control inside the CTA glow footprint (CTA glow worst `#594E55`) | 2.79 / 1.89 | **Fail.** No other control boundary inside the footprint: keep 26px away, or use the no-glow CTA (§2.5 rule 9). |
| X10 | text-muted inside the CTA glow footprint | 2.79 | **Fail.** Forbidden there. |

---

## 4. Spacing (4px base)

Tailwind v4 generates spacing from one base: `--spacing: 0.25rem` (4px), so `p-4` = 16px. Design specs refer to these steps:

| Step | px | rem | Typical use |
|---|---|---|---|
| 0 | 0 | 0 | — |
| 0.5 | 2 | 0.125 | hairline nudges, focus offset |
| 1 | 4 | 0.25 | icon to label (tight) |
| 2 | 8 | 0.5 | inline gaps, chip padding Y, minimum gap between touch targets |
| 3 | 12 | 0.75 | button padding Y, form label gap |
| 4 | 16 | 1 | card padding (mobile), grid gap (mobile) |
| 5 | 20 | 1.25 | page gutter (mobile) |
| 6 | 24 | 1.5 | button padding X, card padding (desktop), grid gap (tablet and up) |
| 8 | 32 | 2 | stack between groups, gutter (tablet) |
| 10 | 40 | 2.5 | gutter (laptop) |
| 12 | 48 | 3 | heading to content |
| 16 | 64 | 4 | section spacing (mobile) |
| 20 | 80 | 5 | section spacing (tablet), gutter (desktop) |
| 24 | 96 | 6 | section spacing (laptop) |
| 32 | 128 | 8 | section spacing (desktop), hero breathing room |

Semantic spacing (responsive values; tech-agent sets them per breakpoint):

| Token | base (390) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| `--gutter` (page side padding) | 20px | 32px | 40px | 80px |
| `--section-y` (vertical gap between sections) | 64px | 80px | 96px | 128px |
| `--grid-gap` | 16px | 24px | 24px | 32px |

---

## 5. Radius

| Token | Value | Use |
|---|---|---|
| radius-none | 0 | full-bleed imagery, the arch's bottom edge |
| radius-xs | 2px | badges' inner marks, checkbox |
| radius-sm | 4px | inputs, small badges |
| radius-md | 8px | cards, dropdowns, toasts |
| radius-lg | 12px | sheets/drawers (leading edge), modals |
| radius-xl | 20px | large feature panels, the bottom sheet's top corners |
| radius-pill | 9999px | buttons, chips, the cart count |

**Arched frame (product imagery).** The signature shape is a round-topped arch, like a balcony doorway.

- **`radius-arch`** (default): `border-radius: 9999px 9999px 0 0`, i.e. Tailwind `rounded-t-full`.
  CSS scales over-large radii down by a single factor f = min(sideLength / sum of radii on that side). For the top edge, f = width / (2 × 9999px), so each top radius resolves to exactly **width ÷ 2**, both horizontally and vertically. The result is a true semicircular top that **scales with the element's width** at any size, as long as height ≥ width ÷ 2 (all our image ratios qualify). Because f applies to every corner, any bottom radius would collapse to 0, which is why the bottom corners are square by definition.
- **`radius-arch-soft`** (shallower arch for dense grids): an elliptical top whose height is 30% of the width. The vertical percentage depends on aspect ratio, so the token is defined per ratio:
  - 4:5 frame: `border-radius: 50% 50% 0 0 / 24% 24% 0 0`
  - 1:1 frame: `border-radius: 50% 50% 0 0 / 30% 30% 0 0`
  - Formula for other ratios: vertical % = 30 × (width ÷ height).
- The arch clips the image (`overflow: hidden` on the frame). An optional 1px gold-400 arch outline at 40% opacity follows the same radius (inset, so the arch edge stays crisp).
- Default product ratio is **4:5**. Final aspect ratios and `sizes` hints belong to the product-card spec (M3.1).

---

## 6. Shadows and glows

Calm and subtle: the night surface already supplies depth, so shadows are soft and dark, and glows are faint warm or cool halos.

### 6.1 Elevation shadows

| Token | Value | Use |
|---|---|---|
| shadow-raised | `0 1px 2px rgba(3, 4, 12, 0.40), 0 8px 24px -8px rgba(3, 4, 12, 0.60)` | cards, dropdowns |
| shadow-overlay | `0 24px 64px -16px rgba(3, 4, 12, 0.70)` | drawers, sheets, modals, toasts |

### 6.2 Glows

| Token | Value | Use |
|---|---|---|
| shadow-glow-candle | `0 0 24px 2px rgba(247, 184, 97, 0.28)` | **primary CTA hover/focus only**, and only where §2.5 rule 9 allows it (solid ground, nothing else inside its 26px footprint). Worst composite and pairs: §2.4, T54–T55, U16. Not used on images: the hero image's glow is `gradient-candle-glow` alone. |
| shadow-glow-candle-soft | `0 0 48px 8px rgba(247, 184, 97, 0.14)` | the wide halo behind a featured product image (under the image). This is the featured card's warmth on bg-raised; the gradient glow is not used there (§2.5 rule 6). Worst composite and text pairs: §2.4, T51–T53. |
| shadow-glow-starlight | `0 0 16px 0 rgba(232, 207, 150, 0.22)` | four-point star glints, "limited" badge on hover, selected chip |

**Glows are never animated by changing `box-shadow`.** Only transform and opacity animate. A glow that "comes on" (for example on CTA hover) lives on a pseudo-element (`::after`) that already carries the shadow at `opacity: 0` and transitions to `opacity: 1`. Details are in `motion.md` §5. The no-glow CTA variant simply omits that pseudo-element.

### 6.3 Image art direction (palette note)

Mock product photography should be shot or graded dark: deep navy or charcoal backdrop, the candle lit, a warm flame pool, a hint of violet rim light. That way images sit naturally on `bg-raised` without visible boxes. Full image direction comes in M1.7 and M3.1.

---

## 7. Borders and focus

| Token | Value |
|---|---|
| border-width-hairline | 1px (dividers, cards, inputs, ghost buttons) |
| border-width-strong | 2px (selected states, the focus ring) |
| focus-ring-width | 2px |
| focus-ring-offset | 2px |
| focus-ring-color | gold-300 `#E8CF96` |

- Dividers: 1px `border-divider`, or `gradient-starlight-rule` for decorative section breaks.
- Cards: 1px border in `border-divider` (decorative) plus `shadow-raised`. The card is not an interactive boundary on its own; its link or button carries the focus ring.
- Every button has a border, even a transparent one (`1px solid transparent` on the CTA), so it keeps a visible edge in forced-colors mode.
- Focus: `:focus-visible { outline: 2px solid var(--color-focus-ring); outline-offset: 2px; }` everywhere, with no `outline: none` without this replacement. Inside clipped containers (the arch frame) the ring goes on the wrapping link, outside the clip. More in `accessibility.md` §3.

---

## 8. Z-index layers

| Token | Value | Layer |
|---|---|---|
| z-starfield | 0 | the fixed starfield, behind everything: **stars, constellation lines and particles only**. Haze is never in this layer; it lives in section bands (layout-shell.md §5.2, §8.2). Sized `position: fixed; inset-inline: 0; top: 0; height: 100lvh; pointer-events: none` (not `inset: 0`, so the layer never resizes as mobile toolbars show and hide; layout-shell.md §8.1). |
| z-content | 1 | page content (its own stacking context above the starfield) |
| z-raised | 10 | in-flow overlaps: dropdowns, popovers, the sticky filter bar |
| z-header | 30 | sticky site header |
| z-scrim-drawer | 40 | scrim behind the drawer or bottom sheet |
| z-drawer | 41 | cart drawer, mobile menu, filter sheet |
| z-scrim-modal | 50 | scrim behind a modal |
| z-modal | 51 | modal dialog |
| z-toast | 60 | toasts / live notifications (above drawers) |
| z-skip-link | 70 | skip link when focused |

Particles and glows always live inside `z-starfield` or behind their product within `z-content` (a negative z within the card's own context). Never above text or images.

**Top layer and `<dialog>`.** A dialog opened with `showModal()` (or any element shown in the top layer) ignores z-index and paints above every z value, including `z-toast` and `z-skip-link`. Decision: **modals and drawers may use `showModal()`**, because it gives native inert background, Esc to close and focus containment. When they do:
- `z-scrim-*`, `z-drawer` and `z-modal` don't apply to them. The scrim is the dialog's `::backdrop`, styled with `bg-scrim`.
- **Toasts render inside the open dialog.** While a top-layer dialog is open, the toast region is rendered as the last child of that dialog (the toast provider targets the topmost open dialog, falling back to the page-level region when none is open). The page-level region is outside the dialog, so it is inert and hidden behind it.
- The toast region inside the dialog is its own `role="status"` / `aria-live="polite"` region, present in the dialog from the moment it opens, so announcements aren't lost by moving nodes between regions.
- `z-toast` then only orders toasts against non-top-layer content (the header and in-page drawers built without `showModal()`).

---

## 9. Breakpoints, containers, touch targets

Mobile-first: unprefixed styles are the 390px design, and they must still hold down to 320px wide.

| Name | Min width | Tailwind token | Columns | Gutter | Grid gap | Container max width |
|---|---|---|---|---|---|---|
| base | 0 (designed at **390**) | — | 4 | 20px | 16px | 100% |
| md | **768**px | `--breakpoint-md: 48rem` | 8 | 32px | 24px | 100% |
| lg | **1024**px | `--breakpoint-lg: 64rem` | 12 | 40px | 24px | 100% |
| xl | **1440**px | `--breakpoint-xl: 90rem` | 12 | 80px | 32px | 1280px content (`container-content`) |

Containers:

| Token | Value | Use |
|---|---|---|
| container-content | 80rem (1280px) | default page content width (inside gutters) |
| container-prose | 42.5rem (680px) | long text: about, care guide, FAQ answers |
| container-wide | 90rem (1440px) | full-bleed bands whose inner content still caps at container-content |

Above 1440px, content stays at 1280px and centred. The starfield and haze bands run full-bleed.

Touch targets: **minimum 44×44px** (`--size-touch: 2.75rem`) for every tappable control at every breakpoint. Icon buttons get the hit area through padding even when the glyph is 20–24px. Adjacent targets keep at least 8px between them. Primary CTAs on mobile are at least 48px tall and sit in the lower half of the viewport where possible, within thumb reach.

### 9.1 Layout-shell variables and the short-viewport query (M1.12)

Registered here so every spec uses the same names. Their behaviour is owned by [`layout-shell.md`](../components/layout-shell.md) (§3.4, §4.1, §6.1, §6.5). All are plain `:root` variables (§11.0).

| Token | base (390) | md (768) | lg (1024) | xl (1440) | Use |
|---|---|---|---|---|---|
| `--header-h` | 4rem (64px) | 4.5rem (72px) | 4.5rem (72px) | 5rem (80px) | the header bar's block size, excluding the top safe-area inset |
| `--scroll-offset` | `calc(var(--header-h) + env(safe-area-inset-top, 0px))`; `0px` under the short-viewport query | (follows `--header-h`) | | | `html { scroll-padding-top }`; the `top` of any sticky bar inside `main` |
| `--page-inline-start` | `max(var(--gutter), env(safe-area-inset-left, 0px))` | (follows `--gutter`) | | | the container's and header bar's start padding |
| `--page-inline-end` | `max(var(--gutter), env(safe-area-inset-right, 0px))` | (follows `--gutter`) | | | the container's and header bar's end padding |

**Short-viewport query: `@media (max-height: 28rem)`** (448px: a phone in landscape, or a desktop window at about 200% zoom and above). Inside it the header is not sticky (`position: relative`) and `--scroll-offset` is `0px`. It is the only height-based media query in the system; any other spec that needs a short-viewport rule reuses this exact query.

---

## 10. Typography (filled by M1.10)

The values live in [`typography.md`](./typography.md) §9. Summary:

| Token | Purpose | Value (see typography.md §9) |
|---|---|---|
| `--font-wordmark` | script, wordmark only | Pinyon Script, **shipped as an inline SVG, not a webfont**. Documentation-only `:root` value; no utility, no font download. |
| `--font-display` | serif display headings | Cormorant Garamond via `next/font` (`var(--font-cormorant)`) |
| `--font-display-italic` | serif italic accent words in display headings | Cormorant Garamond italic 500 via `next/font` (`var(--font-cormorant-italic)`), not preloaded |
| `--font-body` | sans, body and UI | Jost via `next/font` (`var(--font-jost)`) |

**Preflight alias (decided in M1.10):** `--font-sans: var(--font-body);` in `@theme inline` (the `--font-*: initial;` reset comes first, in `@theme`), so unstyled text gets the body face. `--font-display`, `--font-display-italic` and `--font-body` also go in `@theme inline`, because they point at the next/font variables declared on `<html>`. `--font-mono` is redefined in plain `@theme` as a system stack (no download). See typography.md §9.2.

---

## 11. Tailwind v4 mapping (for tech-agent, M1.11)

Names and values only. tech-agent writes the CSS.

### 11.0 Where each variable goes

A plain `@theme` block only emits the variables that some generated utility uses, so a variable no utility reads would be missing at runtime (empty in CSS `var()` outside utilities and in JS `getComputedStyle`). So:

| Goes in `@theme` (they drive utilities) | Goes in `:root` as plain custom properties (or in `@theme static`) |
|---|---|
| `--color-*` (§11.1, §11.2), `--spacing`, `--radius-*`, `--shadow-*`, `--ease-*`, `--breakpoint-*`, `--container-*`, `--font-mono`, `--font-weight-*`, `--text-*` (typography.md §9). In **`@theme inline`**: the next/font-backed `--font-sans`, `--font-display`, `--font-display-italic`, `--font-body` (typography.md §9.2). | `--gradient-*`, `--gutter`, `--section-y`, `--grid-gap`, `--size-touch`, `--header-h`, `--scroll-offset`, `--page-inline-start`, `--page-inline-end` (§9.1), `--z-*`, `--border-width-*`, `--focus-ring-*`, `--duration-*`, `--stagger-*`, `--motion-*` (motion ones in `motion.md` §7), `--font-wordmark`, `--wordmark-h-header`, `--wordmark-h-footer` (typography.md §9) |

- **Colour tokens are in `@theme static` (as implemented in M1.11; approved).** Every `--color-*` (§11.1, §11.2) is therefore emitted and readable at runtime, including colours no utility uses yet. They still generate the same utilities.
- The `:root` set is what the reduced-motion remap (`motion.md` §6.3), the responsive `--gutter` / `--section-y` / `--grid-gap` / `--header-h` overrides and the short-viewport `--scroll-offset` override (§9.1) change inside media queries. Plain `:root` variables make that straightforward.
- They are used as arbitrary-value utilities, e.g. `z-(--z-header)`, `duration-(--duration-base)`, `px-(--gutter)`, `h-(--header-h)`, and read in JS with `getComputedStyle(document.documentElement)`.
- **Motion values in JS come from the TS constants module, not from CSS.** The production CSS minifier rewrites custom-property times and colours (for example `150ms` becomes `.15s` while `40ms` stays as written, and colours may become 8-digit hex), so values read back with `getComputedStyle` don't have a stable format. JS (GSAP included) reads durations, easings and stagger from the TS constants module (`motion.md` §7), never from `getComputedStyle`.
- Optional, tech-agent's call: Tailwind v4 also has theme keys that generate native utilities, `--z-index-*` (giving `z-header`) and `--transition-duration-*` (giving `duration-base`), if tech-agent confirms them in the installed version. If tech-agent uses those keys, put them in `@theme static` so they are always emitted, and keep the token names in this spec as the source.

**Resets.** Start the `@theme` block by clearing Tailwind's defaults in every namespace we define, so off-system values can't be reached:

- `--color-*: initial;` (the default palette includes names like `sky` and `rose`)
- `--breakpoint-*: initial;` (then define only md, lg, xl)
- `--radius-*: initial;` (drops the default `rounded-2xl`, `rounded-3xl` and the rest)
- `--shadow-*: initial;` (drops the default black shadows). Also `--inset-shadow-*`, `--drop-shadow-*` and `--text-shadow-*`, which we don't use.
- `--ease-*: initial;` (drops the default `ease-in`, `ease-out`, `ease-in-out` curves, so only §3 of `motion.md` exists)
- `--animate-*: initial;` (drops the default `animate-bounce`, `animate-ping` and the rest, which break the no-bounce rule in `motion.md` §1)
- `--font-*: initial;`, `--font-weight-*: initial;`, `--text-*: initial;` (typography.md §9)

Static utilities that don't read theme variables (`rounded-none`, `rounded-full`, `rounded-t-full`, `shadow-none`) still exist after the reset, which is what `radius-arch` relies on.

### 11.1 Raw colours (`@theme`)

| CSS variable | Value |
|---|---|
| `--color-night-50` … `--color-night-950` | as §2.2 (50 `#F1F2FA`, 100 `#DDE0F2`, 200 `#C3C6E0`, 300 `#9097C2`, 400 `#6E78B6`, 500 `#3F4A8A`, 600 `#2A3468`, 700 `#1C2550`, 800 `#131A38`, 900 `#0B0F24`, 950 `#070914`) |
| `--color-violet-100` … `--color-violet-900` | 100 `#E4DCF7`, 200 `#C9B8F2`, 300 `#A893DC`, 400 `#8A70C6`, 500 `#6E4FB0`, 600 `#533A8E`, 700 `#3D2770`, 800 `#2A1B55`, 900 `#1E1240` |
| `--color-rose-100` … `--color-rose-900` | 100 `#F4E1EA`, 200 `#E9C3D5`, 300 `#D9A3BE`, 400 `#C686A7`, 500 `#B0688F`, 600 `#8C4C74`, 700 `#6B3561`, 800 `#4A2348`, 900 `#2E1430` |
| `--color-gold-100` … `--color-gold-800` | 100 `#F7ECD2`, 200 `#F0DEB4`, 300 `#E8CF96`, 400 `#D9B871`, 500 `#C9A45C`, 600 `#A8853F`, 700 `#8A6A2A`, 800 `#5E4719` |
| `--color-ember-100` … `--color-ember-800` | 100 `#FEEBCB`, 200 `#FDDDA8`, 300 `#FBCF8A`, 400 `#F7B861`, 500 `#F0A040`, 600 `#D9822B`, 700 `#B4661A`, 800 `#7F4510` |
| `--color-moon-50`, `--color-moon-100` | `#FFF8E7`, `#F3EFE7` |
| `--color-moss-300`, `--color-moss-900` | `#86D1B0`, `#0F2A2B` |
| `--color-honey-300`, `--color-honey-900` | `#EBC46B`, `#2E2614` |
| `--color-coral-300`, `--color-coral-900` | `#F28B9B`, `#33141F` |
| `--color-tide-300`, `--color-tide-900` | `#93B4F0`, `#13213F` |

### 11.2 Semantic colours (`@theme`)

Utilities read as `bg-bg-page`, `text-text-primary` and so on. The doubled prefix is deliberate: it keeps the role names identical to this spec.

| CSS variable | Value |
|---|---|
| `--color-bg-page` | `var(--color-night-900)` |
| `--color-bg-sunken` | `var(--color-night-950)` |
| `--color-bg-raised` | `var(--color-night-800)` |
| `--color-bg-overlay` | `var(--color-night-700)` |
| `--color-bg-haze` | `var(--color-violet-900)` |
| `--color-bg-scrim` | `rgb(7 9 20 / 0.72)` |
| `--color-bg-selection` | `var(--color-violet-600)` |
| `--color-text-primary` | `var(--color-moon-100)` |
| `--color-text-secondary` | `var(--color-night-200)` |
| `--color-text-muted` | `var(--color-night-300)` |
| `--color-text-inverse` | `var(--color-night-900)` (also all CTA text) |
| `--color-text-accent` | `var(--color-gold-400)` |
| `--color-text-glow` | `var(--color-ember-400)` |
| `--color-text-disabled` | `var(--color-night-300)` |
| `--color-border-divider` | `var(--color-night-600)` |
| `--color-border-control` | `var(--color-night-400)` |
| `--color-border-ghost` | `var(--color-night-300)` |
| `--color-border-accent` | `var(--color-gold-400)` |
| `--color-border-error` | `var(--color-coral-300)` |
| `--color-focus-ring` | `var(--color-gold-300)` |
| `--color-cta-bg` | `var(--color-ember-400)` |
| `--color-cta-bg-hover` | `var(--color-ember-300)` |
| `--color-cta-bg-active` | `var(--color-ember-500)` |
| `--color-cta-bg-disabled` | `var(--color-night-700)` |
| `--color-link` | `var(--color-gold-300)` |
| `--color-link-hover` | `var(--color-moon-100)` |
| `--color-success` / `--color-success-surface` | `var(--color-moss-300)` / `var(--color-moss-900)` |
| `--color-warning` / `--color-warning-surface` | `var(--color-honey-300)` / `var(--color-honey-900)` |
| `--color-error` / `--color-error-surface` | `var(--color-coral-300)` / `var(--color-coral-900)` |
| `--color-info` / `--color-info-surface` | `var(--color-tide-300)` / `var(--color-tide-900)` |
| `--color-badge-limited` | `var(--color-gold-400)` |
| `--color-badge-sale` | `var(--color-rose-300)` |
| `--color-badge-count` | `var(--color-gold-400)` |
| `--color-star-core` | `var(--color-moon-50)` |
| `--color-star-gold` | `var(--color-gold-300)` |
| `--color-star-violet` | `var(--color-violet-200)` |
| `--color-star-rose` | `var(--color-rose-200)` |
| `--color-constellation` | `rgb(232 207 150 / 0.35)` |
| `--color-wordmark` | `var(--color-gold-300)` (added in M1.10, typography.md §3.4) |

- **`badge-new` and `badge-bestseller` have no variables of their own.** Both are the outline style in §2.3: a transparent fill (on `bg-raised`), a 1px `border-accent` border and `text-accent` text, both gold-400 (T33, T56, U5). Use `border-border-accent` and `text-text-accent`; there is no `--color-badge-new` or `--color-badge-bestseller`.

### 11.3 Gradients (`:root`; not a Tailwind namespace)

| CSS variable | Value |
|---|---|
| `--gradient-haze-dusk` | §2.4 |
| `--gradient-haze-veil` | §2.4 |
| `--gradient-haze-blush` | §2.4 |
| `--gradient-candle-glow` | §2.4 |
| `--gradient-starlight-rule` | §2.4 |

### 11.4 Space, radius, shadow, layers, layout

| CSS variable | Where | Value |
|---|---|---|
| `--spacing` | `@theme` | `0.25rem` |
| `--gutter` | `:root` | 1.25rem → md 2rem → lg 2.5rem → xl 5rem (overridden per breakpoint) |
| `--section-y` | `:root` | 4rem → md 5rem → lg 6rem → xl 8rem |
| `--grid-gap` | `:root` | 1rem → md 1.5rem → lg 1.5rem → xl 2rem |
| `--size-touch` | `:root` | `2.75rem` |
| `--header-h` | `:root` | 4rem → md 4.5rem → lg 4.5rem → xl 5rem (overridden per breakpoint; §9.1) |
| `--scroll-offset` | `:root` | `calc(var(--header-h) + env(safe-area-inset-top, 0px))`; `0px` inside `@media (max-height: 28rem)` (§9.1) |
| `--page-inline-start` / `--page-inline-end` | `:root` | `max(var(--gutter), env(safe-area-inset-left, 0px))` / `max(var(--gutter), env(safe-area-inset-right, 0px))` (§9.1) |
| `--radius-xs` / `-sm` / `-md` / `-lg` / `-xl` | `@theme` | `2px` / `4px` / `8px` / `12px` / `20px` |
| `--radius-pill` | `@theme` | `9999px` |
| `--radius-arch` | `@theme` | shorthand `9999px 9999px 0 0` (or use `rounded-t-full`) |
| `--radius-arch-soft-4-5` | `@theme` | `50% 50% 0 0 / 24% 24% 0 0` |
| `--radius-arch-soft-1-1` | `@theme` | `50% 50% 0 0 / 30% 30% 0 0` |
| `--shadow-raised` | `@theme` | §6.1 |
| `--shadow-overlay` | `@theme` | §6.1 |
| `--shadow-glow-candle` | `@theme` | §6.2 (primary CTA only, §2.5 rule 9) |
| `--shadow-glow-candle-soft` | `@theme` | §6.2 |
| `--shadow-glow-starlight` | `@theme` | §6.2 |
| `--z-starfield` … `--z-skip-link` | `:root` | §8 (0, 1, 10, 30, 40, 41, 50, 51, 60, 70), used as `z-(--z-header)` |
| `--border-width-hairline` / `--border-width-strong` | `:root` | `1px` / `2px` |
| `--focus-ring-width` / `--focus-ring-offset` | `:root` | `2px` / `2px` |
| `--breakpoint-md` / `--breakpoint-lg` / `--breakpoint-xl` | `@theme` | `48rem` / `64rem` / `90rem` |
| `--container-content` / `--container-prose` / `--container-wide` | `@theme` | `80rem` / `42.5rem` / `90rem` |
| `--font-display` / `--font-display-italic` / `--font-body` / `--font-sans` | `@theme inline` | typography.md §9.2 (next/font-backed) |
| `--font-mono` | `@theme` | typography.md §9.2 (system stack) |
| `--font-wordmark` | `:root` | typography.md §9 (documentation only) |

### 11.5 Motion (values in `motion.md` §7; reduced-motion remap in `motion.md` §6.3)

`--ease-standard`, `--ease-enter`, `--ease-exit`, `--ease-in-out`, `--ease-ambient`, `--ease-linear` go in `@theme`. `--duration-instant` … `--duration-drift`, `--stagger-*`, `--motion-distance-*` and `--motion-scale-*` go in `:root`.

---

## 12. Spec checklist notes

- Layout, components, page copy, data needs: not applicable to tokens (no UI strings, no data fields).
- States: CTA, ghost, link and disabled states are in §2.3. Hover glows are in §6.2 and `motion.md` §5. The no-glow CTA variant is in §2.5 rule 9.
- IP check: every token and palette name (night, violet, rose, gold, ember, moon, moss, honey, coral, tide, haze, dusk, veil, blush, candle, halo, starlight, constellation, arch, wordmark) is a generic English word. None comes from, or combines into, a term from any book series. The M1.12 layout names (header, scroll offset, page inline) are generic too. Re-read after the registrations and confirmed.
