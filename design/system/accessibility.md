# Accessibility baseline (M1.9)

Status: spec, **QA PASSED** (fix round 1), with post-pass minors 1–5 applied (changelog at the top of [`tokens.md`](./tokens.md); this file changes for minors 1, 2, 4 and 5). M1.7 fix round 1 adds the T56 working for `badge-bestseller` (§2.4). Part of the M1.9 design tokens; see [`tokens.md`](./tokens.md), [`motion.md`](./motion.md) and, for type, [`typography.md`](./typography.md). Every page and component spec inherits these rules and may only tighten them.

Target: **WCAG 2.2 AA**.

## 1. Contrast thresholds

- Body text: at least **4.5:1**.
- Large text (≥ 24px regular, or ≥ 18.66px / 14pt bold): at least **3:1**. Which type-scale steps count as large is set in `typography.md` §6.
- UI components (control boundaries, button shapes, icons that carry meaning) and focus indicators: at least **3:1** against adjacent colours (WCAG 1.4.11 and 2.4.11).
- Decorative elements (stars, haze, dividers, constellation lines) are exempt, but they must never be the only thing that identifies a control or conveys information.
- Disabled controls are exempt. Ours still pass 4.5:1 (tokens.md T30).
- A new text/background pair that is not in tokens.md §3 needs its ratio stated in the spec that introduces it.

## 2. Luminance working

Formula per channel: c = v/255; linear = c/12.92 if c ≤ 0.04045, else ((c + 0.055)/1.055)^2.4.
L = 0.2126 R_lin + 0.7152 G_lin + 0.0722 B_lin. Ratio = (L1 + 0.05)/(L2 + 0.05), with L1 the lighter colour. Ratios are rounded down to 2 decimals.
Each power was computed as exp(2.4 × ln x). Every value whose ratio lands within about 1.0 of a threshold was recomputed a second time from scratch (marked ✓✓).

### 2.1 Relative luminance per colour

| Colour | Hex | R_lin | G_lin | B_lin | L |
|---|---|---|---|---|---|
| night-950 | `#070914` | 0.002125* | 0.002732* | 0.006995 | 0.00291 ✓✓ |
| night-900 | `#0B0F24` | 0.003347 | 0.004777 | 0.017642 | 0.00540 |
| night-800 | `#131A38` | 0.006512 | 0.010330 | 0.039546 | 0.01163 |
| night-700 | `#1C2550` | 0.011612 | 0.018500 | 0.080219 | 0.02149 ✓✓ |
| night-600 | `#2A3468` | 0.023153 | 0.034340 | 0.138431 | 0.03948 |
| violet-900 | `#1E1240` | 0.012984 | 0.006049 | 0.051270 | 0.01079 ✓✓ |
| violet-600 | `#533A8E` | 0.086500 | 0.042311 | 0.270499 | 0.06818 |
| rose-800 (dusk stop) | `#4A2348` | 0.068478 | 0.016807 | 0.064803 | 0.03126 |
| haze worst (composite) | `#663B6D` | 0.132868 | 0.043735 | 0.152926 | **0.07057** ✓✓ |
| glow worst (composite) | `#5E4A39` | 0.111932 | 0.068478 | 0.040915 | 0.07573 ✓✓ |
| candle halo worst (composite) | `#33303E` | 0.033104 | 0.029557 | 0.048171 | 0.03166 ✓✓ |
| CTA glow worst (composite, over bg-overlay) | `#594E55` | 0.099899 | 0.076185 | 0.090842 | **0.08229** ✓✓ |
| CTA glow over haze worst (composite, not permitted) | `#8F5E6A` | 0.274677 | 0.111932 | 0.144128 | 0.14886 ✓✓ |
| moss-900 | `#0F2A2B` | 0.004777 | 0.023153 | 0.024157 | 0.01932 |
| honey-900 | `#2E2614` | 0.027321 | 0.019382 | 0.006995 | 0.02018 |
| coral-900 | `#33141F` | 0.033105 | 0.006995 | 0.013702 | 0.01303 |
| tide-900 | `#13213F` | 0.006512 | 0.015209 | 0.049707 | 0.01585 |
| moon-100 | `#F3EFE7` | 0.896269 | 0.863157 | 0.799107 | 0.86557 ✓✓ |
| night-200 | `#C3C6E0` | 0.545724 | 0.564712 | 0.745404 | 0.57372 ✓✓ |
| night-300 | `#9097C2` | 0.278894 | 0.309469 | 0.539478 | 0.31957 ✓✓ |
| night-400 | `#6E78B6` | 0.155927 | 0.187821 | 0.467782 | 0.20125 ✓✓ |
| gold-300 | `#E8CF96` | 0.806950 | 0.623960 | 0.304987 | 0.63983 ✓✓ |
| gold-400 | `#D9B871` | 0.693872 | 0.479320 | 0.165132 | 0.502250 ✓✓ |
| gold-500 | `#C9A45C` | 0.584079 | 0.371238 | 0.107023 | 0.39741 ✓✓ |
| ember-300 | `#FBCF8A` | 0.964688 | 0.623960 | 0.254152 | 0.66970 |
| ember-400 | `#F7B861` | 0.930109 | 0.479320 | 0.119538 | 0.54918 ✓✓ |
| ember-500 | `#F0A040` | 0.871367 | 0.351532 | 0.051269 | 0.44037 ✓✓ |
| rose-300 | `#D9A3BE` | 0.693872 | 0.366253 | 0.514918 | 0.44664 |
| moss-300 | `#86D1B0` | 0.238398 | 0.637597 | 0.434153 | 0.53804 |
| honey-300 | `#EBC46B` | 0.830770 | 0.552012 | 0.147027 | 0.58204 |
| coral-300 | `#F28B9B` | 0.887924 | 0.258183 | 0.327778 | 0.39709 |
| tide-300 | `#93B4F0` | 0.291771 | 0.456411 | 0.871367 | 0.45137 |

\* below the 0.04045 threshold, so the linear branch (c / 12.92) applies.

Post-pass minor 5: gold-400 R_lin (R = 217) is **0.693872**, so L = 0.147517 + 0.342810 + 0.011923 = **0.502250**. Fix round 1 had wrongly changed it to 0.693845, and that is now reverted. rose-300 has the same red channel (217), so its R_lin reads 0.693872 too; its L is unchanged at 0.44664. violet-900 and night-950 were recomputed in fix round 1 to confirm the bg-haze and bg-sunken rows.

### 2.2 Worked example (T2, text-primary on bg-page)

- moon-100 `#F3EFE7`: R 243 → 243/255 = 0.952941 → (0.952941 + 0.055)/1.055 = 0.955394 → ^2.4 = exp(2.4 × −0.045631) = 0.896269. G 239 → 0.863157. B 231 → 0.799107.
  L = 0.2126 × 0.896269 + 0.7152 × 0.863157 + 0.0722 × 0.799107 = 0.190547 + 0.617330 + 0.057696 = **0.865573**.
- night-900 `#0B0F24`: 0.003347, 0.004777, 0.017642 → L = 0.000712 + 0.003417 + 0.001274 = **0.005403**.
- Ratio = (0.865573 + 0.05)/(0.005403 + 0.05) = 0.915573/0.055403 = **16.52:1**.

### 2.3 Composites (worst cases over gradients)

Alpha compositing per channel: out = bg + α × (fg − bg). Each channel is rounded to the nearest integer only at the end.

**Haze worst.**
- Start: lightest dusk stop rose-800 `#4A2348` = (74, 35, 72).
- Veil violet-500 (110, 79, 176) at its 0.28 peak:
  R 74 + 0.28 × 36 = 84.08; G 35 + 0.28 × 44 = 47.32; B 72 + 0.28 × 104 = 101.12.
- Blush rose-500 (176, 104, 143) at its 0.20 peak on top:
  R 84.08 + 0.20 × 91.92 = 102.46; **G 47.32 + 0.20 × 56.68 = 58.66**; B 101.12 + 0.20 × 41.88 = 109.50 (109.496).
- Rounded: (102, 59, 109) = **`#663B6D`**. (Round 0 had G 58.4 → `3A`, an arithmetic slip.)
- Luminance:
  - R 102: 0.400000 → 0.455000/1.055 = 0.431280 → exp(2.4 × −0.840998) = exp(−2.018395) = 0.132868.
  - G 59: 0.231373 → 0.286373/1.055 = 0.271443 → exp(2.4 × −1.304003) = exp(−3.129607) = 0.043735.
  - B 109: 0.427451 → 0.482451/1.055 = 0.457300 → exp(2.4 × −0.782416) = exp(−1.877798) = 0.152926.
  - L = 0.2126 × 0.132868 + 0.7152 × 0.043735 + 0.0722 × 0.152926 = 0.028248 + 0.031279 + 0.011041 = **0.070568**. L + 0.05 = **0.120568**.
- This is lighter than rose-700 `#6B3561` (L 0.06535), so it is the true haze ceiling.

**Glow worst (unchanged).** Candle glow ember-400 (247, 184, 97) at its 0.35 peak over night-900 (11, 15, 36) gives (93.6, 74.2, 57.4), which rounds to **`#5E4A39`**, L = 0.07573.
- Over night-950 (7, 9, 20) the same glow gives (91.0, 70.3, 47.0): darker than `#5E4A39` in every channel, so its luminance is lower and night-900 is the worst *permitted* placement (tokens.md §2.5 rule 6).
- The glow over haze, bg-haze or bg-raised is forbidden by that rule, so those composites are not part of the system.

**Candle halo worst.** `shadow-glow-candle-soft`, ember-400 at its 0.14 peak, over bg-raised night-800 (19, 26, 56):
- R 19 + 0.14 × 228 = 50.92; G 26 + 0.14 × 158 = 48.12; B 56 + 0.14 × 41 = 61.74 → (51, 48, 62) = **`#33303E`**.
- R 51: 0.200000 → 0.255000/1.055 = 0.241706 → exp(2.4 × −1.420033) = exp(−3.408079) = 0.033104.
- G 48: 0.188235 → 0.243235/1.055 = 0.230555 → exp(2.4 × −1.467266) = exp(−3.521438) = 0.029557.
- B 62: 0.243137 → 0.298137/1.055 = 0.282594 → exp(2.4 × −1.263745) = exp(−3.032988) = 0.048171.
- L = 0.007038 + 0.021139 + 0.003478 = **0.031655**. L + 0.05 = **0.081655**.
- 0.14 is a true ceiling: an outer box-shadow is not painted under its own element, and outside the element the blurred shadow is at or below its colour alpha.

**CTA glow worst (new, post-pass minor 1).** `shadow-glow-candle`, ember-400 (247, 184, 97) at its 0.28 peak. The 0.28 colour alpha is used as the ceiling, which is conservative: outside the button, the blurred shadow is at or below that alpha.
- Over **bg-overlay** night-700 (28, 37, 80), the lightest solid background a primary CTA may sit on:
  R 28 + 0.28 × 219 = 89.32; G 37 + 0.28 × 147 = 78.16; B 80 + 0.28 × 17 = 84.76 → (89, 78, 85) = **`#594E55`**.
  - R 89: 0.349020 → 0.404020/1.055 = 0.382957 → exp(2.4 × −0.959833) = exp(−2.303599) = 0.099899.
  - G 78: 0.305882 → 0.360882/1.055 = 0.342068 → exp(2.4 × −1.072745) = exp(−2.574588) = 0.076185.
  - B 85: 0.333333 → 0.388333/1.055 = 0.368089 → exp(2.4 × −0.999431) = exp(−2.398634) = 0.090842.
  - L = 0.021239 + 0.054488 + 0.006559 = **0.082286**. L + 0.05 = **0.132286**.
- The other permitted solid backgrounds give darker composites: bg-haze → (91, 64, 73) `#5B4049`, L 0.06372; bg-raised → (83, 70, 67) `#534643`, L 0.06625; bg-page → (77, 62, 53) `#4D3E35`, L 0.05280; bg-sunken darker still. So bg-overlay is the family ceiling.
- Over **haze worst** (102.46, 58.66, 109.50), not permitted:
  R 102.46 + 0.28 × 144.54 = 142.93; G 58.66 + 0.28 × 125.34 = 93.76; B 109.50 + 0.28 × (−12.50) = 106.00 → (143, 94, 106) = **`#8F5E6A`**.
  - R 143: 0.560784 → 0.615784/1.055 = 0.583682 → exp(2.4 × −0.538400) = exp(−1.292160) = 0.274677.
  - G 94: 0.368627 → 0.423627/1.055 = 0.401542 → 0.111932 (same channel value as glow worst R).
  - B 106: 0.415686 → 0.470686/1.055 = 0.446148 → exp(2.4 × −0.807105) = exp(−1.937052) = 0.144128.
  - L = 0.058396 + 0.080054 + 0.010406 = **0.148856**. L + 0.05 = **0.198856**.
  - Over haze, this is why the glow is switched off (tokens.md §2.5 rule 9).

Raising any peak alpha, or adding a layer to a stack, invalidates T34–T41, T51–T55 and U2, U8, U11–U13, U16, and needs a recomputation.

### 2.4 Pair working (borderline pairs and every row new or changed in fix round 1, the post-pass minors or M1.7 fix round 1)

L + 0.05 values used: moon-100 0.915573; night-200 0.62372; night-300 0.36957; night-400 0.25125; gold-300 0.68983; gold-400 0.55225; gold-500 0.44741; ember-400 0.59918; moss-300 0.58804; honey-300 0.63204; coral-300 0.44709; tide-300 0.50137; haze worst 0.120568; halo worst 0.081655; CTA glow worst 0.132286; CTA glow over haze 0.198856; bg-haze 0.060788; bg-overlay 0.07149; bg-raised 0.06163; bg-page 0.055403; bg-sunken 0.05291.

| Pair | Working | Ratio | Threshold and verdict |
|---|---|---|---|
| T36 text-primary on haze worst | 0.915573 / 0.120568 = 7.5939 | **7.59** | 4.5: pass |
| T37 text-secondary on haze worst | 0.62372 / 0.120568 = 5.1731 | **5.17** | 4.5: pass |
| T38 / U8 gold-300 on haze worst | 0.68983 / 0.120568 = 5.7215 | **5.72** | 4.5 / 3.0: pass |
| T39 gold-400 on haze worst | 0.55225 / 0.120568 = 4.5804 | **4.58** | 4.5 body: passes narrowly, so the rule stays **large text only** |
| U2 ember-400 on haze worst | 0.59918 / 0.120568 = 4.9696 | **4.96** | 3.0: pass |
| X2 text-muted on haze worst | 0.36957 / 0.120568 = 3.0652 | **3.06** | 4.5: **fails, forbidden** |
| X4 gold-500 on haze worst | 0.44741 / 0.120568 = 3.7108 | **3.71** | 4.5: **fails** (icons only) |
| U11 border-control on haze worst | 0.25125 / 0.120568 = 2.0839 | **2.08** | 3.0: **fails**; controls never over haze |
| U12 bg-sunken fill vs haze worst | 0.120568 / 0.05291 = 2.2787 | **2.27** | 3.0: **fails**; same rule |
| U13 border-ghost on haze worst | 0.36957 / 0.120568 = 3.0652 | **3.06** | 3.0: passes narrowly |
| U14 border-control on bg-haze | 0.25125 / 0.060788 = 4.1332 | **4.13** | 3.0: pass |
| U15 border-ghost on bg-overlay | 0.36957 / 0.07149 = 5.1695 | **5.16** | 3.0: pass |
| U15 border-ghost on bg-haze | 0.36957 / 0.060788 = 6.0796 | **6.07** | 3.0: pass |
| T42 moss-300 on bg-haze | 0.58804 / 0.060788 = 9.6736 | **9.67** | 4.5: pass |
| T43 honey-300 on bg-haze | 0.63204 / 0.060788 = 10.3974 | **10.39** | 4.5: pass |
| T44 coral-300 on bg-haze | 0.44709 / 0.060788 = 7.3549 | **7.35** | 4.5: pass |
| T45 tide-300 on bg-haze | 0.50137 / 0.060788 = 8.2478 | **8.24** | 4.5: pass |
| X7 coral-300 on haze worst | 0.44709 / 0.120568 = 3.7082 | **3.70** | 4.5: **fails**; status text never over a gradient |
| T51 text-primary on halo worst | 0.915573 / 0.081655 = 11.2127 | **11.21** | 4.5: pass |
| T52 text-secondary on halo worst | 0.62372 / 0.081655 = 7.6385 | **7.63** | 4.5: pass |
| T53 text-muted on halo worst | 0.36957 / 0.081655 = 4.5260 | **4.52** | 4.5: passes narrowly; prefer text-secondary near a featured image |
| T54 text-primary on CTA glow worst | 0.915573 / 0.132286 = 6.9212 | **6.92** | 4.5: pass |
| T55 text-secondary on CTA glow worst | 0.62372 / 0.132286 = 4.7149 | **4.71** | 4.5: pass |
| T55 / U16 gold-300 on CTA glow worst | 0.68983 / 0.132286 = 5.2147 | **5.21** | 4.5 / 3.0: pass. Lowest focus-ring ratio in the system. |
| T56 badge-bestseller gold-400 on bg-raised | 0.55225 / 0.06163 = 8.9607 | **8.96** | 4.5: pass (same pair as T33, badge-new) |
| T56 badge-bestseller gold-400 on bg-page | 0.55225 / 0.055403 = 9.9679 | **9.96** | 4.5: pass (same pair as T16) |
| X9 border-ghost on CTA glow worst | 0.36957 / 0.132286 = 2.7937 | **2.79** | 3.0: **fails**; no other control inside the footprint |
| X9 border-control on CTA glow worst | 0.25125 / 0.132286 = 1.8992 | **1.89** | 3.0: **fails**; same rule |
| X10 text-muted on CTA glow worst | 0.36957 / 0.132286 = 2.7937 | **2.79** | 4.5: **fails**, forbidden |
| X8 gold-300 on CTA glow over haze | 0.68983 / 0.198856 = 3.4690 | **3.46** | not permitted: glow off over haze |
| X8 border-ghost on CTA glow over haze | 0.36957 / 0.198856 = 1.8584 | **1.85** | not permitted |
| X8 text-secondary on CTA glow over haze | 0.62372 / 0.198856 = 3.1365 | **3.13** | not permitted |
| T41 text-secondary on glow worst | 0.62372 / 0.12573 = 4.9607 | 4.96 | margin check only; the glow never sits under text |
| T14 text-muted on bg-overlay | 0.36957 / 0.07149 = 5.1695 | 5.16 | 4.5: pass |
| U3 border-control on bg-overlay | 0.25125 / 0.07149 = 3.5144 | 3.51 | 3.0: pass |
| X3 text-muted on glow worst | 0.36957 / 0.12573 = 2.9393 | 2.93 | **fails, forbidden** |

## 3. Focus

- Every interactive element shows a visible focus indicator on `:focus-visible`: **2px solid gold-300 `#E8CF96`, offset 2px**. That is at least **5.21:1** against everything the ring can sit on. The lowest case is a primary CTA's own ring inside its glow, over bg-overlay (tokens.md U16). Without a CTA glow, the lowest is haze worst at 5.72:1 (U8). The CTA glow is switched off over haze (tokens.md §2.5 rule 9), so the ring never meets the 3.46:1 composite (X8).
- The offset is mandatory. On the ember CTA the ring sits on the page background, not on the button (gold-300 against ember-400 is only 1.15:1; tokens.md X5).
- Never remove an outline without this replacement. Mouse clicks may skip the ring (that is what `:focus-visible` does); keyboard focus never does.
- Inside clipped or arched frames, put the ring on the wrapping link, outside the clip, so it is never cut off.
- In sticky-header layouts, focused elements must not hide behind the header (WCAG 2.4.11): use `scroll-padding-top` equal to the header height (set in M1.12/M1.14).
- Focus order follows DOM order. Drawers and modals trap focus while open and return it to the trigger on close (detailed in their component specs). When they use `<dialog>.showModal()`, toasts render inside the open dialog so they stay visible and reachable (tokens.md §8).

## 4. Colour is never the only signal

- Links in running text are always underlined (tokens.md §2.3).
- Status messages always pair the colour with an icon and a text label ("Added to your bag", "Please enter a valid email"). Honey (warning) is close in hue to gold and ember, which is why the icon and label are mandatory.
- Form errors: coral border **plus** an icon **plus** an error message linked to the field with `aria-describedby`.
- Selected states (chips, sizes) add a 2px border or a check mark, not just a colour change.
- Sale and limited badges carry text ("Sale", "Limited"), not just a colour.

## 5. Forced colors (Windows High Contrast)

- Under `@media (forced-colors: active)`, the starfield, haze and glows are hidden (`display: none` on the decorative layers). Text sits on the system `Canvas` colour.
- Every button keeps a real border (transparent by default, see tokens.md §7), so it gets a visible system-colour edge.
- The focus ring uses `outline`, not `box-shadow`, so it survives forced colours.
- Icons are inline SVG using `currentColor`. So is the wordmark (`typography.md` §3), so it follows the system text or link colour.

## 6. Touch targets and pointer

- Minimum **44×44px** for every interactive target at every breakpoint (`--size-touch`), with at least 8px between adjacent targets.
- Primary CTAs on mobile: at least 48px tall, full width or close to it, in thumb reach.
- Hover-only affordances must have a non-hover equivalent: quick-add stays visible on touch, and image zoom is a bonus, never information.

## 7. Text and controls over imagery and effects

- Particles, falling stars and glows sit **behind** content (tokens.md §8). They never pass over text or product images.
- **The candle glow never sits under text or controls**, and only on solid bg-page or bg-sunken (tokens.md §2.5 rule 6).
- **The CTA glow appears only over solid ground, with nothing but the CTA's own focus ring and text-primary, text-secondary or link text inside its 26px footprint** (tokens.md §2.5 rule 9). Over haze it is switched off.
- Text over haze uses only text-primary or text-secondary, plus gold-300 links and small eyebrows. gold-400 is allowed over haze for large text only. text-muted is never used over a gradient.
- **Form controls never sit over a haze gradient**, only on solid bg-sunken, bg-page, bg-raised, bg-overlay or bg-haze (tokens.md §2.5 rule 7, U3, U11–U14).
- **Status text is never placed over a gradient** (tokens.md §2.5 rule 8, X7).
- Text over photography is avoided. Where a hero needs it, the spec must add a night-900 scrim of at least 60% under the text and state its computed ratio against the worst-case (lightest) image region.

## 8. Reduced motion

The policy is in `motion.md` §6. In short: drift, falling stars, twinkles, parallax, scrub and every translate or scale effect are removed. Reveals become instant. Drawers, modals and toasts become 150ms opacity-only fades. No content is ever hidden waiting for an animation. The hero's pre-hidden state has an inline-script timer fallback (`motion.md` §5.1) that reveals it after 2500ms even if the app bundle fails. Without JavaScript the class is never added, so nothing is hidden.

## 9. Theme

The site is dark-only (`color-scheme: dark`; reasons in tokens.md §2.1). Contrast has been verified for this single theme. If a light theme is ever added, it needs its own full contrast table.
