# Product card (M3.1)

Status: spec, **QA PASS** (fix round 1), with the post-pass minors applied (changelog in §17). Owner: design-agent. Built by tech-agent in M3.2. The quick-add action ships switched off and goes live with the client bag store (§4.1).

**Adopts and extends [`home.md`](../pages/home.md) §6** (the M2 baseline: anatomy, tokens, badges, price format, `alt=""`, the M2 non-interactive state) and the bestsellers band in home.md §5 (selection, grid, `sizes`, the M2 link and bag state). What changed against that baseline is listed in §12. Home picks the revision up with no change to home.md's copy or selection rule.

Builds on [`tokens.md`](../system/tokens.md) (§2.3 roles, §2.5 rules 1, 3, 5, 9, §3 contrast, §5 `radius-arch`, §6 shadows, §7 focus, §9 breakpoints and touch targets), [`typography.md`](../system/typography.md) (§4 scale, §5 wrapping, §6.3 caps, §6.4 numerals, §7.4 minimum sizes), [`motion.md`](../system/motion.md) (§4 `motion-scale-hover` / `-press`, §5 the product image hover pattern, §6 reduced motion), [`accessibility.md`](../system/accessibility.md) (§3 focus, §4 colour never alone, §6 touch targets and "quick-add stays visible on touch"), [`layout-shell.md`](./layout-shell.md) (§4 Container and Grid; one recorded exception in §5.3), [`header.md`](./header.md) (§6.2 the bag count announcement), [`footer.md`](./footer.md) (§3.2.2 the `features` map), [`starfield.md`](./starfield.md) (§4.5 markup rules), [`catalog.md`](../copy/catalog.md) / [`catalog.json`](../copy/catalog.json) (products, variants, badges, `microcopy.typeLabels`, `microcopy.badgeLabels`), [`art-direction.md`](../art/art-direction.md) (§4.1 catalog framing and the arch, §7 alt rules) and `lib/types/cart.ts` (`CART_LIMITS`). Nothing here loosens those files; the two recorded exceptions (§5.3 grid, §5.4 message lines) are explained where they occur.

---

## 1. Purpose and acceptance criteria

Purpose: one calm, solid card that shows a candle in its arched window and tells a phone visitor, at a glance, what it is, what it costs, what sizes it comes in and whether it is new, limited, a favourite or sold out. One tap on the card opens the product; one tap on the quick-add button puts it in the bag without leaving the grid. The photograph stays the focus: no glow, sparkle or text ever sits on it.

Acceptance criteria (from TASKS.md M3.1 and the orchestrator's task, refined):

1. **Image in an arched frame**: 4:5, `radius-arch`, the `cat-*` catalog shot, no overlay (§3.1, §11).
2. **Name** (never truncated), **price** with **"From" pricing when the variant prices differ** (§3.4, §3.6).
3. **Variant hint**: the type plus the size count, or the single size (§3.5).
4. **Badges** only where the data supports them: Bestseller, New, Limited (authored), Sold out (derived from `inStock`). Sale is not supported by the data and is not shown (§3.3, §10).
5. **Quick add**: full behaviour and every state; hidden behind the `quick-add` feature flag until the bag store exists (§4.1); no dead or disabled button at any time, including before hydration and without JS (§4).
6. **States**: default, hover, focus-visible, pressed, loading image, image missing, sold out, draft never shown, plus every quick-add state (§6).
7. **Responsive sizes** in the bestsellers, shop and collection grids at 390 / 768 / 1024 / 1440, with the `next/image` `sizes` per context (§5).
8. **Motion**: subtle, transform and opacity only, no layout shift, an exact reduced-motion fallback (§7).
9. **Accessibility**: one link per card, no nested interactive elements, the accessible names, the focus ring, contrast pairs with ratios, alt-text rules (§8).
10. **Copy**: badge labels, quick-add labels and messages, sold-out text, price formatting, all final (§9).
11. **Data**: only fields of the `ProductCard` projection (`lib/types/catalog.ts`); nothing extra is needed (§10).
12. **A §-numbered e2e checklist** for the build review (§14).

---

## 2. Anatomy

### 2.1 DOM

```
<li>                                                           the grid item (the list belongs to the page or section)
  <article class="ProductCard" data-product-card data-slug="moonrise"
           [data-sold-out]>                                    bg-raised, radius-md, 1px border-divider, shadow-raised,
                                                               position: relative, flex column, padding 12 / 16
    <div class="ArchFrame ratio-4/5">                          radius-arch, overflow: hidden, bg-raised
      <svg class="FrameMotif" aria-hidden="true" data-decorative>flame</svg>   behind the image (§3.2)
      <Image alt="" fill sizes="…" … />                        the cat-* shot (§11)
    </div>
    <div class="ProductCard-text">                             12px (step 3) below the frame; flex column, flex: 1
      <ul class="Badges" aria-label="Labels">                  only if at least one badge shows (§3.3)
        <li class="badge-bestseller">Bestseller</li>
      </ul>
      <h3 class="type-h4 ProductCard-name">                    heading level from the context (§13.1)
        <a href="/products/moonrise" class="ProductCard-link">Moonrise</a>   only when linked (§8.2); else plain text
      </h3>                                                    sold out: "<span class="sr-only">, sold out</span>"
                                                               after the name, inside the <a> when linked (§8.2)
      <p class="type-body-sm ProductCard-hint">Scented jar · 2 sizes</p>
      <p class="type-body ProductCard-description">Night jasmine and …</p>   per context (§5.1)
      <div class="ProductCard-buy">                            margin-block-start: auto (min 12px)
        <p class="type-price">From $34.00</p>
        <div class="QuickAdd" data-quick-add data-ready data-state>   only when the quick-add flag is live and inStock (§4);
          <button …>…</button>                                 the root owns the 12px above the button and the card
          <p class="QuickAdd-message" id={useId()}>…</p>       padding around it (§8.4); message: error, limit, full only
        </div>
      </div>
    </div>
  </article>
</li>
```

- `<article>` keeps each card a self-contained unit for assistive tech without making it a landmark (home.md §6.1).
- **The link is the name, and nothing else is inside it** (apart from the visually hidden sold-out suffix, §8.2). Its `::after` is stretched over the whole card (`position: absolute; inset: 0` against the `<article>`), so the whole card is one tap target and one tab stop. The quick-add root and its `<button>` are **siblings** of the link's heading, never inside the `<a>`, and sit above the stretched pseudo-element (`position: relative; z-index: 1`), so there is no nested interactive content (§8.2).
- Every string is inside an element, never a bare text node (starfield.md §4.5). No `pointer-events: none` on the image or text.
- DOM order is visual order at every breakpoint.

### 2.2 Spacing inside the card

| Between | Space | Step |
|---|---|---|
| Card edge → content | 12px at base, 16px from md | 3 / 4 |
| Frame → text block | 12px | 3 |
| Badges → name | 8px | 2 |
| Name → hint | 4px | 1 |
| Hint → description | 8px | 2 |
| Description (or hint) → price | at least 12px (`margin-block-start: auto` on `.ProductCard-buy`, with a 12px minimum) | 3 |
| Price → quick add | 12px, as the quick-add root's `padding-block-start` (not a margin, so the strip belongs to the root, §8.4) | 3 |
| Quick add → inline message (error, limit and full states only) | 8px | 2 |

Grid rows stretch, so the cards in a row are equal height, and the auto margin pushes the buy block to the bottom: **prices and quick-add buttons line up across a row** whenever the cards in it have the same slots. A sold-out card has no quick add, so its price sits on the card's bottom edge, 56px lower than its neighbours' prices. That is accepted: the "Sold out" badge already tells the card apart, and a placeholder in the button's place would read as a dead control.

---

## 3. Content rules

### 3.1 The arched frame

- `aspect-ratio: 4 / 5`, `radius-arch` (`border-radius: 9999px 9999px 0 0`: a true semicircular top whose radius is half the frame width, tokens.md §5), `overflow: hidden`, empty colour **bg-raised**.
- **No outline** on product arches (the gold arch outline is the collection windows' signature, home.md §4.3). **No glow, halo or particle** on or around the image (tokens.md §2.5 rule 5). There is no "featured" variant in M3.1, so `shadow-glow-candle-soft` is not used.
- The image is `fill`, `object-fit: cover`, `object-position: 50% 50%`. The catalog shots keep every product below the top 25% (35% for tins and melts), and the arch clips only the top 5.4–11.4% of a 4:5 frame, so it never cuts a product, flame or prop (art-direction.md §4.1).
- **Nothing is ever placed over the image**: badges, the price and the quick-add button all sit in the text block below it.

### 3.2 The frame motif (loading and missing image)

- A **small flame** glyph (the brand motif, inline SVG from `components/icons`, `fill: currentColor`), **28px tall**, colour **night-500** `#3F4A8A` (decorative, tokens.md §2.2), centred in the frame at 50% / 55%. `aria-hidden="true"`, `focusable="false"`, `data-decorative` (hidden in forced colors and print).
- It sits **behind** the image in the frame's own stacking context. The catalog shots are opaque, so once the image has decoded it covers the glyph completely.
- So, with no JS and no extra state: **while the image loads**, the frame shows bg-raised with a faint flame; **if the image fails**, it keeps showing exactly that. The frame keeps its 4:5 box either way, so nothing shifts.
- The glyph is never animated (no flicker loop, motion.md §1: no ambient loops beyond the starfield).

### 3.3 Badges

| Badge | Source | Token | Look | Display order |
|---|---|---|---|---|
| Sold out | derived: `inStock === false` | `badge-sold-out` (new card recipe, below) | transparent on bg-raised, 1px **border-ghost** night-300, text **text-secondary** | 0 |
| Limited | `badges` contains `"limited"` | `badge-limited` | gold-400 fill, text-inverse | 1 |
| New | `badges` contains `"new"` | `badge-new` | transparent on bg-raised, 1px gold-400 border, gold-400 text | 2 |
| Bestseller | `badges` contains `"bestseller"` | `badge-bestseller` | the same outline style as New; the label tells them apart | 3 |

- **At most 2 badges per card**, in display order. Sold out always shows when it applies, so a sold-out card shows "Sold out" plus the first authored badge in display order (for example **Sold out, Limited**).
- **Pinned badge (home only, unchanged from home.md §6.2):** the bestsellers row passes each card's qualifying badge (`pinnedBadge`: `"bestseller"` or `"new"`). The card then shows the pinned badge plus the first other badge in display order, and shows the pair in display order. Home never shows sold-out cards (home.md §5.1), so the two rules never meet. Outside home, no badge is pinned.
- **`badge-sold-out` recipe** (new; it reuses existing roles, so no new colour token): `type-eyebrow` (source text "Sold out", uppercased by CSS), text-secondary, `border: 1px solid` border-ghost, transparent fill, padding 2px 8px, `radius-sm`, `min-block-size: 1.25rem`. It is the only grey badge, so it reads as a state, not a promotion. tech-agent adds it next to the other badge recipes (no new `--color-*` variable).
- **Not shown: Sale.** tokens.md has `badge-sale`, but the data has no compare-at price, so there is nothing true to show (§10, §16 question 3).
- Shared rules (home.md §6.2): a wrapping row (`flex-wrap`, gap 8px); `type-eyebrow`; labels from `microcopy.badgeLabels` plus "Sold out" (§9), written in sentence case and uppercased by CSS; never over the image; the list's `aria-label` is **"Labels"**, so screen readers hear "Labels, list, 2 items, Sold out, Limited" before the name.

Seed result outside home (every card is in stock in the seed):

| Product | Badges shown |
|---|---|
| Moonrise, Ink & Cedar | Bestseller |
| Midnight Balcony, Quiet Shore, Little Constellation Set | New |
| Gilded Plum, Comet Season Gift Box | Limited |
| Comet Tail | Limited, New |
| The other 9 | none (no badge list is rendered) |

### 3.4 Name

- `type-h4` (Cormorant Garamond 600, 22 → 24px, line-height 1.25), text-primary, `text-wrap: balance`. It wraps to 2–3 lines and is **never truncated or clamped** (typography.md §5). The longest seed name, "Little Constellation Set", takes 3 lines at base.
- The heading element is `<h3>` by default and `<h2>` where the page has no section `<h2>` above the grid (§13.1).
- When the card is linked, the name's text is the link's text, underlined only on hover (§6).
- **Sold out:** a visually hidden **", sold out"** follows the name inside the heading (inside the `<a>` when linked), so a visitor who jumps by heading or by link hears the state even though the badge list comes first (§8.2). Nothing changes visually.

### 3.5 Variant hint

One line of meta under the name, built from the type and the variants:

| Case (from `variants` and `sizeKeys`) | Format | Seed examples |
|---|---|---|
| More than one variant, and every variant is a different size (`sizeKeys.length === variants.length`) | **"{typeLabel} · {n} sizes"** | "Scented jar · 2 sizes" (6 jars), "Pillar candle · 2 sizes" (Lantern Path, Lakelight) |
| More than one variant, some sharing a size (not in the seed; for future variants such as a second colour) | **"{typeLabel} · {n} options"** | — |
| One variant | **"{typeLabel} · {variantLabel}"** | "Scented jar · 220 g" (Comet Tail), "Travel tin · 120 g", "Wax melts · 6 cubes, 80 g", "Gift set · Set of 3 tins", "Gift set · Set of 2 jars", "Gift set · Jar and wax melts" |

- `{typeLabel}` comes from `microcopy.typeLabels` (sentence case: Scented jar, Pillar candle, Travel tin, Wax melts, Gift set). `{n}` is a numeral. `{variantLabel}` is `variants[0].label` as authored.
- The separator is a middle dot U+00B7 with a space each side, as plain text (screen readers read it as a pause). The two parts are `<span>`s, and the line may wrap between them.
- `n` counts every variant, available or not: the hint describes the range; availability is the price's and the quick add's job (§3.6, §4.3).
- Style: `type-body-sm` (Jost 400, 14 → 15px, line-height 1.5), **text-muted** (5.99:1 on bg-raised, T13), `font-variant-numeric: lining-nums`. 1–2 lines (typography.md §7.4: body-sm is meta of at most 2 lines). At 143px of text width (base), the hints of 21–25 characters wrap to 2 lines; from md every seed hint is 1 line.

### 3.6 Price

- `type-price` (Jost 500, 16 → 18px, `tabular-nums`), text-primary.
- **Which variants it uses:** the **available** variants (`variants.filter(v => v.available)`). If none is available (sold out), all variants. That way the price on the card is always a price the quick add can actually charge (§4.3).
- **Format** (home.md §6.1, unchanged): `Intl.NumberFormat("en-US", { style: "currency", currency })` over the amount in minor units, divided by `10 ** maximumFractionDigits` from the formatter's `resolvedOptions()` (2 for USD). One shared helper, used by every surface that shows a price.
  - lowest === highest → **"{price}"**, for example "$18.00", "$36.00", "$60.00";
  - otherwise → **"From {lowest}"**, for example "From $34.00", "From $28.00".
- Currency USD and locale `en-US` `[confirm with user: currency]` (catalog.md §2). If the currency changes, only the helper's `currency` input changes.
- **Sold out:** the price is still shown (it helps the shopper decide whether to come back), in **text-secondary** (10.12:1, T8), so it reads as quieter than the live prices around it. The "Sold out" badge carries the meaning; the colour is never the only signal (accessibility.md §4).
- No sale price: there is no compare-at field (§3.3).

Seed prices (all variants available): Moonrise, Midnight Balcony, Ink & Cedar, Last Chapter, Moss & Ember, Still Water "From $34.00"; Lantern Path, Lakelight "From $28.00"; Late Bloom, Margin Notes, Quiet Shore "$18.00"; Fir Hollow "$12.00"; Gilded Plum "$14.00"; Comet Tail "$36.00"; Little Constellation Set "$49.00"; Reading Nook Set "$60.00"; Comet Season Gift Box "$45.00".

### 3.7 Short description

- `shortDescription` (≤ 20 words), `type-body` (Jost 400, 16 → 18px), text-secondary, `text-wrap: pretty`, never clamped (home.md §6.1).
- **Shown per context** (§5.1): always in the bestsellers row (home's decision); in the shop and collection grids **from md only**. At base the shop and collection cards are 2-up with 143px of text, where a description runs to 5–6 lines and pushes the quick add far below the photo; the name, the hint and the image carry the card there, and the product page has the full copy. `display: none` below md, so it is neither shown nor read there (no hidden-but-read text). e2e check 23 covers this.

---

## 4. Quick add

### 4.1 The flag: what ships in M3.2

- A new feature flag in the `features` map of `components/layout/site-routes.ts`:

  ```ts
  "quick-add": { milestone: "M5.4", live: false }, // product card quick add (product-card.md §4)
  ```

  footer.md §3.2.2, the map's documentation, lists this row and the `product-pages` row (added in M3.1 fix round 1).
- **While `quick-add` is not live (M3.2 until the bag store ships): no root, no button, no reserved space.** The card ends with the price. The card is server-rendered, so the button arriving in a later build shifts nothing at runtime (the same reasoning as home.md §5.4 and footer.md §2.4). A disabled "Add to bag" is never shown: on a card it reads as sold out.
- **tech-agent flips it in the task that ships the client bag store (M5.4, or M4.3 if built first)**, together with the `bag` registry row. Nothing else changes in the card then.
- **`/dev/product-card` renders the quick add as live** against an in-memory preview bag (§13.3), so M3.2 builds and tests every state now. `/dev/product-card/flags-off` renders the public M3.2 state (no links, no quick add).

### 4.2 When the quick add renders (flag live)

| Condition | Quick add |
|---|---|
| `inStock === true` | rendered |
| `inStock === false` (sold out) | **not rendered**, no space reserved (§2.2) |
| Before hydration, and without JS | **in the layout but invisible and inert** (below) |

**No dead button, ever (decision).** The bag is client-only, so the button can only work once its island has hydrated. The quick-add root is server-rendered (so its 12px strip and 44px button row are in the layout from the first paint, and nothing shifts) with `data-ready="false"`, which sets `visibility: hidden` on the root: the button is not painted, not focusable, not in the accessibility tree and not tappable (taps there fall through to the card link). When the island mounts, it sets `data-ready="true"`, and the button fades in (§7). Without JS it stays hidden, and the card's link to the product page still works. On a slow phone the visitor sees the card, its link and its price at once, and the button appears when it can actually do something, about the time the page becomes interactive.

The cost: without JS, each card shows an empty 44px strip under its price. Accepted, because the alternative is a button that does nothing.

### 4.3 What one tap adds

- **The cheapest available variant**; on a tie, the first in variant order. In the seed that is the 220 g jar, the 7 × 10 cm pillar, or the product's single variant. Its price is the card's "From" (or only) price, because the price uses the same available variants (§3.6).
- **Quantity 1** per tap. Each later tap adds one more of the same variant.
- The button **names what it adds**: a product with more than one variant shows **"Add {variantLabel}"** ("Add 220 g", "Add 7 × 10 cm"), so the shopper knows which size goes in the bag. A product with one variant shows **"Add to bag"**. Other sizes are one tap away on the product page; the hint ("2 sizes") says they exist.
- Payload to the bag store (the bag task owns the store and its API; names are tech-agent's): `{ slug, sku, quantity: 1 }`. The card can also pass a display snapshot (name, variant label, price, `cardImage.src`) if M5.3/M5.4 want it for the drawer; all of it is in `ProductCard`. **The client never sets a price that is trusted**: checkout re-prices on the server (D2.2, M6.1).
- **Limits** come from **`CART_LIMITS`** (`lib/types/cart.ts`): `maxQuantityPerLine` (10) and `maxLines` (20). The card never hard-codes either number: the copy interpolates them (§9). The store refuses an add that would break one, and reports which: **`limit`** (this SKU's line is already at `maxQuantityPerLine`) or **`full`** (this SKU is not in the bag yet and the bag already holds `maxLines` lines).
- **Focus stays on the button** after the tap. Quick add **does not navigate and, by default, does not open the cart drawer**, so a visitor can keep browsing the grid `[M5.3 confirms: quick add keeps the drawer closed]`.

### 4.4 States

The button is a **ghost button** (tokens.md §2.3), never the ember CTA: a grid shows many cards per view, and ember is for one primary CTA per viewport (tokens.md §2.5 rule 1). So it never carries the CTA glow, and rule 9 doesn't apply.

| State (`data-state`) | Trigger | Look | Label (visible) | Accessible name | Announced (polite, §8.5) |
|---|---|---|---|---|---|
| Hidden (`data-ready="false"`) | before hydration, no JS | `visibility: hidden` on the root (space kept) | — | not exposed | — |
| Default (`idle`) | ready | transparent fill, text-primary, 1px border-ghost, `rounded-pill`, `type-button`, full width of the text column, `min-block-size: 44px`, padding 8 / 12 (base) or 8 / 16 (md+) | "Add 220 g" / "Add to bag" | "Add 220 g to bag, Moonrise" / "Add to bag, Late Bloom" | — |
| Hover (`hover: hover` devices) | pointer over the button | fill bg-raised (as the card, so unchanged), border **border-accent** gold-400, `duration-fast` colour transition. The card's own hover (image zoom, card border) does **not** run (§6) | same | same | — |
| Focus-visible | keyboard | default look plus the global ring (2px gold-300, 2px offset) | same | same | — |
| Pressed | `:active` | fill bg-overlay, border-accent, `scale(var(--motion-scale-press))` | same | same | — |
| Pending (`pending`) | the store hasn't confirmed after **300ms** (not expected with the local store; possible once D2 syncs) | as default, `aria-disabled="true"`, `aria-busy="true"`; taps ignored | "Adding…" | "Adding to bag, Moonrise" (the visible ellipsis is `aria-hidden`, below) | — |
| Added (`added`) | the store confirms | as default, with a 20px **check** glyph in moss-300 before the label | "Added" | "Added to bag, Moonrise. Add another 220 g" / "Added to bag, Late Bloom. Add another" | "Added to your bag: Moonrise, 220 g." / "Added to your bag: Late Bloom." |
| Added → default | **2000ms** after the last confirmed add | back to default | as default | as default | — |
| Error (`error`) | the store reports a failure (for example storage is unavailable) | button back to default; **inline message** below it: 16px alert glyph + text, `type-body-sm`, error coral-300 | as default | as default (the message is linked with `aria-describedby`) | "Moonrise wasn’t added to your bag. Please try again." |
| Limit (`limit`) | the store refuses: this line is at `CART_LIMITS.maxQuantityPerLine` | as error, with its own message | as default | as default, described by the message | "Moonrise, 220 g wasn’t added: 10 is the most per item." / "Late Bloom wasn’t added: 10 is the most per item." |
| Bag full (`full`) | the store refuses: a new line, and the bag already has `CART_LIMITS.maxLines` lines | as error, with its own message | as default | as default, described by the message | "Moonrise wasn’t added. Your bag holds up to 20 different items." |
| Disabled | never | — | — | — | — |

Rules:

- **Repeated taps.** During "Added", a tap adds one more and restarts the 2000ms timer. A second tap within **300ms** of a confirmed add is ignored (an accidental double tap shouldn't add two).
- **The message** (error, limit, full) lives inside the quick-add root, below the button. It stays until the next tap on that card's button, then clears at that tap. Only one message per card. Its `id` comes from React's `useId()`, so every card's `aria-describedby` points at its own message even when a page shows the same product twice (the dev preview does). Its appearance can grow the card by one to three lines; that happens in response to the visitor's tap, so it doesn't count as layout shift (input-triggered shifts within 500ms are excluded), and it is the rare path.
- **The button never changes size between states.** Every label the button can show is rendered in the same grid cell (`display: grid; grid-template-areas: "label"`, each label in that area), and only the current one is visible (`visibility: hidden` on the others, and `aria-hidden="true"` on them). The cell is as tall as the tallest label, so "Add 7 × 10 cm" wrapping to two lines at 320px and "Added" on one line give the same button height. The visible text is never `display: none`-swapped.
- **Accessible name pattern** (WCAG 2.5.3, label in name): the name **starts with the visible label** and completes it with visually hidden text: `Add 220 g<span class="sr-only"> to bag, Moonrise</span>`. Visually hidden text (not `aria-label`) keeps it translatable.
- **The pending label's ellipsis is hidden from the name.** The visible label is "Adding…", but the ellipsis would otherwise run into the hidden text ("Adding… to bag, Moonrise") and some screen readers read U+2026 aloud as "dot dot dot". So the ellipsis sits in its own `aria-hidden` span: `Adding<span aria-hidden="true">…</span><span class="sr-only"> to bag, Moonrise</span>`. The accessible name is **"Adding to bag, Moonrise"**; it starts with the visible word "Adding", so label-in-name holds (punctuation is not part of the spoken label).
- The check, alert and any other glyphs are inline SVG, `aria-hidden="true"`, `currentColor` (moss-300 for the check, coral-300 for the alert).
- **Sold out at tap time** (the bag's stock check comes in D2.2): out of scope for the client-only store; the card shows the state it was rendered with.

---

## 5. Layout per context and breakpoint

### 5.1 Contexts

| Context | Where | Description | Heading level | Grid |
|---|---|---|---|---|
| `bestsellers` | home (M2.4); also the default for related products (M4.4 confirms) | always | h3 (under the section h2) | home.md §5.2: 2 / 2 / 4 / 4 |
| `shop` | `/shop` (M3.5) | from md | the page decides (§13.1) | §5.3: 2 / 3 / 3 / 4 |
| `collection` | `/collections/{slug}` (M3.7) | from md | the page decides | the same as `shop` |

The grid is a `<ul>` of `<li>`s (lists announce their counts), owned by the page or section, with `align-items: stretch`. Product grids sit on `plain` or `solid` bands only, never on haze (tokens.md §2.5 rule 3).

### 5.2 Bestsellers row (home; geometry unchanged from home.md §5.2)

| | base (390) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Grid | 2 per row (span 2 of 4) | 2 per row (span 4 of 8) | 4 in one row (span 3 of 12) | 4 in one row (span 3) |
| Column gap / row gap | 16 / 32 | 24 / 32 | 24 / — | 32 / — |
| Card width / padding | 167 / 12 | 340 / 16 | 218 / 16 | 296 / 16 |
| Image (4:5) | 143 × 178.75 | 308 × 385 | 186 × 232.5 | 264 × 330 |
| Card height, flag off (home.md §5.2 + the hint: hint lines × line-height + 8) | ≈ 473–548 (seed rows ≈ 520 and ≈ 521) | ≈ 613 | ≈ 493–521 | ≈ 597 |
| Card height, quick add live (+ 12 + 44) | ≈ 529–604 (seed rows ≈ 576 and ≈ 577) | ≈ 669 | ≈ 549–577 | ≈ 653 |

Working (home.md §5.2's card heights, plus the hint and its 8px gap; body-sm line 21 / 21.5 / 21.9 / 22.5px):

- **base:** "Scented jar · 2 sizes" (21 characters) wraps to 2 lines at 143px (about 20 per line): 42 + 8 = **+50**; "Travel tin · 120 g" (18) is 1 line: 21 + 8 = **+29**. Row 1 (Moonrise, Ink & Cedar) 470.35 + 50 = **520.35**; row 2 is as tall as Midnight Balcony (2-line name, 2-line hint; Quiet Shore beside it is shorter): 471.45 + 50 = **521.45**. The range runs from home's 443.95 + 29 = **472.95** (a 1-line name, 5 description lines, a 1-line hint) to 497.85 + 50 = **547.85**.
- **md:** 583.7 + 21.5 + 8 = **613.2** (the hint is 1 line at 308px).
- **lg:** 462.8 + 29.9 = **492.7** to 491.2 + 29.9 = **521.1** (1-line hints at 186px, about 25 characters per line).
- **xl:** 566.7 + 30.5 = **597.2**.
- Quick add adds 12 + 44 = 56 to every figure.

`sizes` (unchanged from home.md §6.5): `(min-width: 90rem) 264px, (min-width: 64rem) calc((100vw - 152px) / 4 - 32px), (min-width: 48rem) calc((100vw - 88px) / 2 - 32px), calc((100vw - 56px) / 2 - 24px)`. Check: 143 at 390, 308 at 768, 186 at 1024, 264 at 1440 and wider.

### 5.3 Shop and collection grid

| | base (390; holds from 320) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Grid | 2 per row (Grid 4, span 2) | **3 per row** (own 3-column list grid; a recorded exception, below) | 3 per row (Grid 12, span 4) | 4 per row (Grid 12, span 3) |
| Column gap (`--grid-gap`) / row gap | 16 / 32 (step 8) | 24 / 40 (step 10) | 24 / 48 (step 12) | 32 / 48 (step 12) |
| Card width | (350 − 16) / 2 = **167** | (704 − 48) / 3 = **218.7** | (944 − 48) / 3 = **298.7** | (1280 − 96) / 4 = **296** |
| Card padding | 12 | 16 | 16 | 16 |
| Image (4:5) | 143 × 178.75 | 186.7 × 233.3 | 266.7 × 333.3 | 264 × 330 |
| Text width / about characters per line (description) | 143 / — (no description) | 186.7 / ~22 | 266.7 / ~30 | 264 / ~29 |
| Description lines (seed: 66–94 characters) | not shown | 3–5 | 3–4 | 3–4 |
| Card height, flag off | ≈ 302–409 | ≈ 458–594 | ≈ 563–623 | ≈ 565–627 |
| Card height, quick add live (+ 56) | ≈ 358–465 | ≈ 514–650 | ≈ 619–679 | ≈ 621–683 |

**Exception to layout-shell §4 (recorded, deliberate): the md list grid.** At md the layout-shell Grid has 8 columns, which don't divide by 3. So from md up to lg the product `<ul>` is its own grid inside the same Container: `grid-template-columns: repeat(3, minmax(0, 1fr))`, `column-gap: var(--grid-gap)` (24px at md, the Grid's own gap), row gap 40px, and every `<li>` has `min-width: 0` (as Grid items do), so long names wrap instead of widening a column. It keeps the Container's gutters and the Grid's gap, so its outer edges and gutters line up with every other band on the page; only the column count differs. At base, lg and xl the list uses the Grid spans in the table. If layout-shell later gains a "list grid" entry, this exception folds into it.

Working (sizes interpolated as typography.md §4; card height = border 2 + padding × 2 + image + 12 + [badges + 8] + name + 4 + hint + [8 + description] + 12 + price [+ 12 + 44]):

- **Fixed part with the flag off** (no badge, 1-line name, 1-line hint, no description): base 2 + 24 + 178.75 + 12 + 27.5 + 4 + 21 + 12 + 20.8 = **302.05**; md 2 + 32 + 233.3 + 12 + 28.4 + 4 + 21.5 + 12 + 21.7 = **366.9**; lg 2 + 32 + 333.3 + 12 + 29.0 + 4 + 21.9 + 12 + 22.4 = **469.5**; xl 2 + 32 + 330 + 12 + 30.0 + 4 + 22.5 + 12 + 23.4 = **467.9**.
- **base top:** a badge (22.9 + 8), a 3-line name (+55: "Little" / "Constellation" / "Set" at about 15 characters per line) and a 2-line hint (+21): 302.05 + 30.9 + 55 + 21 = **408.95**.
- **md:** + 8 + 3 × 27.6 = 90.8 → **457.7**; top: + 8 + 5 × 27.6 = 146 (Late Bloom's 94-character description), a badge (+31.4), a 2-line name (+28.4) and a 2-line hint (+21.5) → **594.2**.
- **lg:** + 8 + 3 × 28.4 = 93.2 → **562.7**; top: + 8 + 4 × 28.4 = 121.6, plus a badge (+31.7) → **622.8**.
- **xl:** + 8 + 3 × 29.7 = 97.1 → **565.0**; top: + 8 + 4 × 29.7 = 126.8, plus a badge (+32.2) → **626.9**.
- Character estimates use 0.51em for Jost and about 0.42em for Cormorant (home.md §4.4). Line counts and heights are guidance only: nothing depends on them, nothing is clipped, and rows simply take their tallest card's height.

- **Why 3 per row at md:** 4 per row would leave 132px of text (a 6-line description), and 2 per row would make 17 products a 9-row scroll on a tablet. Three gives 186.7px of text, about the bestsellers' lg width (186px), which home already accepts.
- **Why 3 at lg and 4 at xl:** both give a card of about 296–299px, so the card looks the same on a laptop and a desktop, and the arch reads as a window, not a thumbnail.
- **Filters:** this grid assumes the full content width (filters in a bar and a sheet above the grid). **M3.3 decision ([`shop.md`](../pages/shop.md) §2.1): `/shop` keeps its filters in a toolbar and a filter sheet at every breakpoint, with no sidebar, so the grid keeps the full content width and the columns and `sizes` below apply unchanged.** If a later page puts a filter sidebar beside the grid at lg+, it re-derives the columns and the `sizes` below, and records the change in this file.
- With fewer cards than a row (a collection with 2 products), the grid packs from the start; nothing is centred or stretched wider.

`sizes`: `(min-width: 90rem) 264px, (min-width: 64rem) calc((100vw - 128px) / 3 - 32px), (min-width: 48rem) calc((100vw - 112px) / 3 - 32px), calc((100vw - 56px) / 2 - 24px)`.

- Check: at 390, (390 − 56) / 2 − 24 = **143**; at 768, (768 − 112) / 3 − 32 = **186.7**; at 1024, (1024 − 128) / 3 − 32 = **266.7**; at 1439, **405** (the largest card image in these grids); at 1440 and wider, **264**.
- The `cat-*` originals are 1792 × 2240, so even 405px at 3x (1215px) is covered.

### 5.4 Zoom, reflow, text spacing

- At 320px: cards are (280 − 16) / 2 = **132px** wide with 108px of text. Names wrap (never truncated), hints wrap to 2 lines, "Add 7 × 10 cm" may wrap to 2 lines inside the button (its height grows through `min-block-size`, never clipped). No horizontal scroll.
- **Exception to typography.md §7.4 (recorded): the inline quick-add message below 390px.** The messages are `type-body-sm` and 26–29 characters (§9). At 390 the text beside the 16px glyph is about 121px (about 17 characters per line), so each fits in 2 lines, within §7.4's cap. From 389px down to 320 the column narrows to about 88px of text and a message can take **3 lines**. Accepted there rather than switching to `type-body`: body would make it 4 lines at 320 and look like running text, while this is a short status line that appears only after the visitor's own tap, on the rare error path, and it is never clipped. No other body-sm text on the card exceeds 2 lines at 320 (the hint is at most 2).
- 200% / 400% zoom on a 1280 window give the md / base layouts.
- Under the WCAG 1.4.12 text-spacing override nothing has a fixed height around text: badges, the button and the card use `min-block-size` and padding; the frame keeps its ratio.

---

## 6. States (the card)

"Linked" means the `product-pages` flag is live (home.md §5.4; M4.3) or the dev preview renders the card with `linked`.

| State | Not linked (M3.2 until M4.3 on public pages) | Linked |
|---|---|---|
| Default | §2–§3; no `<a>`, no hover classes, no pointer cursor | the name is the stretched link; `cursor: pointer` on the card (the quick-add root sets `cursor: auto`, §8.4) |
| Hover (only under `@media (hover: hover) and (pointer: fine)`, and only while the **link** is hovered: `.ProductCard:has(.ProductCard-link:hover)`) | none | card border **border-accent** gold-400 (`duration-fast`); the image `scale(var(--motion-scale-hover))` inside the arch (§7); the name gets a 1px underline (0.2em offset) |
| Hover on the quick-add button or its root | (button only, §4.4) | the card's hover does **not** run (the pointer is over the quick add, not the link), so nothing suggests the tap would open the product |
| Focus-visible (the link) | — | the ring on the link's stretched `::after`: `outline: 2px solid` gold-300, `outline-offset: 2px`, around the whole card, outside the arch clip, with `border-radius: var(--radius-md)` on the `::after` so the ring follows the card's corners. The link's own global outline is switched off **in the same rule** (`.ProductCard-link:focus-visible { outline: none }` together with the `::after` outline, §13.1), so there is one ring, never a second ring round the name text. The card's hover look is **not** added on focus; the ring is the cue. |
| Pressed (`:active` on the link, any pointer) | — | border-accent at once (no transition), no scale on the card (home.md §6.3). This is the tap feedback on touch, where hover never runs. `-webkit-tap-highlight-color: transparent` |
| Loading image | the frame shows bg-raised and the faint flame (§3.2); the text block is final | same |
| Image missing (the file fails) | stays as loading: bg-raised + flame, the box unchanged; no broken-image icon (the `alt` is empty), no text | same |
| Sold out (`inStock === false`) | "Sold out" badge first (§3.3); the visually hidden ", sold out" after the name (§3.4); price in text-secondary (§3.6); no quick add (§4.2); the image at **opacity 0.64** (static, never animated), so the row reads quieter without hiding the candle | same, and the card still links to the product page |
| Draft or archived | **never rendered.** The repositories return published products only (`lib/firebase/repositories/catalog.ts`), and `ProductCard` has no status field, so the card has no code path for them. The e2e checks prove it (§14, check 10) | same |
| Empty (no products) | the card has no empty state; the page or section that owns the grid does (home.md §5.5 omits the section; M3.3 / M3.6 spec theirs) | same |
| Error | the card has no error state; a repository failure fails the build or keeps the last good page (home.md §4.6) | same |
| Reduced motion | — | no zoom (the scale token is 1); border, underline and ring unchanged |
| Forced colors | the border shows in the system colour; badges and the button keep their 1px borders; the focus ring is an outline, so it survives; the flame motif is hidden | same |
| Print | the card prints without the quick add (`data-print="hide"`) and without the shadow | same |

---

## 7. Motion

Everything here is `transform` or `opacity`, and nothing changes a box's size or position in the layout.

| What | Trigger | Values | Reduced motion (and `html[data-motion="off"]`) |
|---|---|---|---|
| Image zoom | the link hovered (fine pointer only, §6) | `transform: scale(1) → scale(var(--motion-scale-hover))` (1.03) on the `<img>` inside the arch (the frame clips it), `--duration-slower` (700ms), `--ease-standard`; back out with the same values | no zoom: `--motion-scale-hover` is 1 (motion.md §6.3) |
| Card border, name underline, button border and fill | hover | colour transitions, `--duration-fast` (150ms), `--ease-standard` (state changes, not motion, motion.md §1) | unchanged |
| Button press | `:active` | `scale(var(--motion-scale-press))` (0.98), `--duration-fast` | no scale (the token is 1), and `transform` is dropped from the button's `transition-property` |
| Quick add appears | hydration (`data-ready` false → true) | `opacity 0 → 1` on the root, `--duration-fast`, `--ease-standard`; `visibility` switches at the start | **`transition: none`** on `[data-quick-add]`: it appears at once |
| Quick-add label swap (Default ↔ Added, Adding…) | state change | the outgoing label `opacity 1 → 0` and the incoming `0 → 1` in the same cell, `--duration-fast`; `visibility` follows at the end of the fade-out | **`transition: none`** on every label: the swap is instant |
| Inline message | error, limit or full | appears without animation | same |
| Card reveal in a grid | owned by the page or section (home.md §9: the bestsellers reveal; M3.3 / M3.6 for the shop and collection grids) | the `<li>` is the reveal target (`opacity`, `y: 16 → 0`, `--stagger-base` within the 400ms cap); the card sets no pre-hidden state of its own | instant (motion.md §6.2) |

- **Why the quick add states its own `transition: none`:** motion.md §6.3 remaps the scale tokens, not the duration tokens (`--duration-fast` stays 150ms), so without this rule the fades would still run. The rule applies under **both** `@media (prefers-reduced-motion: reduce)` and `html[data-motion="off"]` (M8.8b), with the same declarations (§13.1). The button keeps its colour transitions (`color`, `background-color`, `border-color`), which are state changes, not motion.
- No `will-change` at rest. If tech-agent measures jank on the zoom, `will-change: transform` may be set **only while hovered**.
- No loops, no shimmer on the image, no sparkle on badges. `shadow-glow-starlight` (motion.md §5's optional glint on product hover) is **not used** on product cards: a glint near the photo is exactly what tokens.md §2.5 rule 5 keeps off products.
- **CLS:** the frame has an `aspect-ratio`, the quick-add root is in the layout from the first paint (§4.2), the labels share one cell (§4.4), and the zoom happens inside a clipped box. Target CLS < 0.05 on every page with cards, and **0** from the card itself.

---

## 8. Accessibility

### 8.1 Structure

- `<li>` → `<article>` → heading (`<h3>` by default, §13.1) styled `type-h4`. No heading level is skipped.
- The badge list comes first in the text block and is labelled "Labels". The name follows, then the hint, the description and the price as plain paragraphs, then the button.
- Reading order for a screen reader (linked, quick add live): "Labels, list, 1 item, Bestseller. Heading level 3, link, Moonrise. Scented jar · 2 sizes. Night jasmine and bergamot… From $34.00. Button, Add 220 g to bag, Moonrise."
- Sold out: "Labels, list, 2 items, Sold out, …. Heading level 3, link, Lakelight, sold out. Pillar candle · 2 sizes. … From $28.00." A visitor reading straight through hears "sold out" twice; that is the accepted cost of making it reach visitors who jump straight to the heading or the link, who would otherwise never hear it (the badge list sits before the heading).

### 8.2 One link per card

- **Exactly one `<a>` per card**, the name, with `href="/products/{slug}"` from the one `productHref(slug)` helper (home.md §5.4; route `[M4.1 confirms]`). Its accessible name is **the product name**, from its text content, plus **", sold out"** (visually hidden, inside the link) on sold-out cards: "Lakelight, sold out". The visible name is the start of the accessible name, so label-in-name (WCAG 2.5.3) holds. The price, hint and badges are not in the link, so the name stays short in a links list.
- When the card isn't linked, the same visually hidden suffix sits in the heading after the name, so heading navigation hears it too.
- The stretched `::after` makes the whole card the link's hit area. **No interactive element is inside the `<a>`.** The only other interactive element, the quick-add `<button>`, is outside the link and its root is stacked above the link's pseudo-element, so a tap on the button (or the root's strip around it) never follows the link, and a tap anywhere else on the card always does.
- The image has `alt=""` and is not inside the link element, so the link never has an image-only name.
- Not linked (flag off): no `<a>`, no `tabindex`, no `role`, nothing focusable in the card except the quick add when that is live.

### 8.3 Keyboard and focus

- Tab order per card, in DOM order: **the link, then the quick-add button.** A 17-card shop grid is 34 stops with both flags live; that is acceptable, and the page specs may add a "skip past the products" link if needed (M3.3).
- Enter on the link opens the product. Enter or Space on the button adds to the bag; focus stays on the button.
- **Focus rings:** the link's ring wraps the whole card (2px gold-300, 2px offset, on the `::after`, with radius-md corners); the link's own outline is off, so there is one ring. The button's ring is the global one round the button. The card ring sits on the band around the card; the button ring sits on bg-raised inside it. Both are fully visible: the 16px+ gaps between cards hold the card ring, and the 12px+ padding holds the button ring.
- Focus is never hidden behind the sticky header: `scroll-padding-top` (layout-shell §3.4) applies.

### 8.4 Touch targets and spacing

| Target | Size |
|---|---|
| Card link | the whole card minus the quick-add root (167 × ≥ 358px at 390 with quick add; 132px wide at 320) |
| Quick-add button | full text-column width (143px at 390, 108px at 320) × **at least 44px** |
| Between the button and the card link | **at least 12px of no-action space on every side**, which meets the ≥ 8px rule of accessibility.md §6 and tokens.md §9 (below) |
| Between the button and the next card | the card padding (12px+) plus the grid gap (16px+) |

**How the spacing rule holds with a stretched link (decision).** The link's `::after` covers the whole card, so without care the button would sit inside the link's hit area with 0px between them, and a near-miss would open the product page. Instead, the quick-add **root** (`position: relative; z-index: 1`, above the link's pseudo-element) owns a buffer round the button:

- **above:** the 12px between the price and the button is the root's `padding-block-start` (§2.2);
- **left, right and below:** the root reaches the card's padding edge (`margin-inline: calc(-1 * var(--card-padding)); padding-inline: var(--card-padding); margin-block-end: calc(-1 * var(--card-padding)); padding-block-end: var(--card-padding)`, where `--card-padding` is the card's 12px / 16px; names are tech-agent's). The negative margins and the matching padding cancel out, so the card's height and the button's position are unchanged.

A tap in that strip lands on the root, which does nothing (`cursor: auto` there). So the button is separated from the link's area by 12px (16px from md) on every side, the next card's link is a further card padding plus grid gap away, and the link keeps everything above the strip (the image, name, hint, description and price). Before hydration and without JS the root is `visibility: hidden`, so it takes no taps and they fall through to the link, which is the only working action then. e2e check 24 tests the hit zones.

### 8.5 Announcements

- The card has **no live region of its own** (17 regions in a grid would be noise).
- **"Added to your bag: {name}, {variantLabel}."** (or "Added to your bag: {name}." for single-variant products), and the error, limit and full lines in §4.4, are written to the **bag's own polite status region**, which M5.3 specs (its toast region, or one page-level `role="status"`), present and empty in the HTML from page load. M5.3 adopts these strings `[M5.3 confirms the region]`.
- The header's bag region separately announces the new count after 500ms ("Your bag has 3 items", header.md §6.2). The two together say what was added and how many items there are; neither repeats the other (header.md §6.2 already expects this split).
- The button's own name changes to "Added to bag, Moonrise. Add another 220 g" while it shows "Added", so a screen-reader user who stays on it hears the state and what another press will do.

### 8.6 Alt text

- **Card image: `alt=""`.** The name and the short description (or hint) that follow describe the product, and the full catalog alt ("Moonrise scented jar candle, lit, in smoky midnight-blue glass…", shot-list.json, ≤ 150 characters) is used on the product page, where the image is the subject (art-direction.md §7 leaves this to M3.1; home.md §6.1 already does it).
- The flame motif, the check and alert glyphs and the separator dot carry no information: the glyphs are `aria-hidden`, and the dot is text.
- `cardImage.alt` stays in the projection for the product page and the bag (M5.3 decides whether a bag line repeats the name).

### 8.7 Contrast (card on bg-raised `#131A38`; ratios from tokens.md §3)

| Pair | Ratio | Needs |
|---|---|---|
| Name, text-primary (h4, normal text) | 14.85 (T3) | 4.5 |
| Variant hint, text-muted (body-sm) | **5.99** (T13) | 4.5 |
| Short description, text-secondary (body) | 10.12 (T8) | 4.5 |
| Price, text-primary | 14.85 (T3) | 4.5 |
| Price when sold out, text-secondary | 10.12 (T8) | 4.5 |
| New / Bestseller badge text and border, gold-400 | 8.96 (T33, T56, U5) | 4.5 / 3.0 |
| Limited badge text, text-inverse on gold-400 / the fill against bg-raised | 9.96 (T31) / 8.96 | 4.5 / 3.0 |
| **Sold out badge** text, text-secondary / its border, border-ghost night-300 | **10.12** (T8) / **5.99** (U4) | 4.5 / 3.0 |
| Quick add label, text-primary on its transparent fill (bg-raised) | 14.85 (T3) | 4.5 |
| Quick add border, border-ghost (default) | 5.99 (U4) | 3.0 |
| Quick add border on hover, border-accent gold-400 | 8.96 (U5) | 3.0 |
| Quick add pressed: label text-primary on bg-overlay / border gold-400 against bg-overlay / the bg-overlay fill against bg-raised | 12.80 (T4) / 7.72 (T18) / decorative (the border carries the boundary) | 4.5 / 3.0 |
| "Added" check glyph, moss-300 (paired with the text "Added") | 9.54 (T42) | 3.0 |
| Error, limit and bag-full message text and glyph, coral-300 | 7.25 (T44) | 4.5 |
| Button focus ring, gold-300 on bg-raised | 11.19 (U7) | 3.0 |
| Card focus ring, gold-300 on the band around the card: bg-page / the plain band's starfield cap composite `#2D303F` | 12.45 (U7) / 8.58 (home.md §4.7) | 3.0 |
| Card hover border, gold-400 against bg-page (the band side) / bg-raised | 9.96 / 8.96 (U5) | 3.0 |
| Card border, border-divider night-600 | decorative (X6); never the only boundary of a control | — |
| Flame motif, night-500 | decorative | — |

Every pair is an existing row of tokens.md §3 (or home.md §4.7); this spec introduces no new colour pair. The sold-out image opacity affects only the photograph, not any text.

---

## 9. Copy (final)

| Key (tech-agent's naming) | String |
|---|---|
| Badge list label (`aria-label`) | **Labels** |
| Badge: bestseller / new / limited | **Bestseller** / **New** / **Limited** (`microcopy.badgeLabels`) |
| Badge: sold out | **Sold out** |
| Name suffix, sold out (visually hidden, after the name) | **, sold out** (comma, space, lower case) |
| Variant hint, several sizes | **{typeLabel} · {n} sizes** (for example "Scented jar · 2 sizes") |
| Variant hint, several options | **{typeLabel} · {n} options** |
| Variant hint, one variant | **{typeLabel} · {variantLabel}** (for example "Travel tin · 120 g") |
| Price, one price | **{price}** (for example "$18.00") |
| Price, a range | **From {price}** (for example "From $34.00") |
| Quick add, several variants (visible) | **Add {variantLabel}** (for example "Add 220 g") |
| Quick add, one variant (visible) | **Add to bag** |
| Quick add, accessible name, several variants | **Add {variantLabel} to bag, {name}** (visible part + hidden " to bag, {name}") |
| Quick add, accessible name, one variant | **Add to bag, {name}** (visible part + hidden ", {name}") |
| Pending (visible / name) | **Adding…** (U+2026, the ellipsis in an `aria-hidden` span) / **Adding to bag, {name}** (visible "Adding" + hidden " to bag, {name}"; §4.4) |
| Added (visible) | **Added** |
| Added, accessible name | **Added to bag, {name}. Add another {variantLabel}** / **Added to bag, {name}. Add another** |
| Added, announcement | **Added to your bag: {name}, {variantLabel}.** / **Added to your bag: {name}.** |
| Error, inline | **Not added. Please try again.** |
| Error, announcement | **{name} wasn’t added to your bag. Please try again.** |
| Limit, inline | **Limit reached: {maxQty} per item.** ("Limit reached: 10 per item.") |
| Limit, announcement | **{name}, {variantLabel} wasn’t added: {maxQty} is the most per item.** / **{name} wasn’t added: {maxQty} is the most per item.** |
| Bag full, inline | **Bag full: {maxLines} different items.** ("Bag full: 20 different items.") |
| Bag full, announcement | **{name} wasn’t added. Your bag holds up to {maxLines} different items.** |

- `{typeLabel}` from `microcopy.typeLabels`; `{variantLabel}` and `{name}` from the data, unchanged; `{n}` as a numeral. `{maxQty}` is `CART_LIMITS.maxQuantityPerLine` and `{maxLines}` is `CART_LIMITS.maxLines` (`lib/types/cart.ts`), as numerals; the strings never hard-code 10 or 20.
- "Item" in the limit copy means one product in one size (one bag line), which is what a shopper sees as one row in the bag; "different items" in the bag-full copy says the cap is on distinct products, not on quantity.
- Apostrophes are U+2019 in the shipped strings ("wasn’t"); the middle dot is U+00B7.
- The inline messages are 26–29 characters, so they fit 2 lines of `type-body-sm` at 390px and wider; below 390 they may take 3 (the recorded exception in §5.4).
- The "Sold out" label, the sold-out suffix and the quick-add strings are new card microcopy. They live in the card's copy module (tech-agent's location), next to the existing `microcopy.badgeLabels` and `microcopy.typeLabels`. catalog.json is not changed.
- US spelling; USD `[confirm with user: currency]`.
- No production, material or wellness claims; no "restock" or "back soon" promise on sold-out cards (Comet Season says it won't be restocked this year, catalog.md §3).

### 9.1 Dev preview copy (dev only, §13.3)

`/dev/product-card` (links and quick add on):

| Where | String |
|---|---|
| h1 | **Product card preview** |
| Intro | **Every product card state, for review. Dev only: this page is not built for production.** |
| Link to the other preview (plain `<a>`) | **See the cards with links and quick add off** → `/dev/product-card/flags-off` |
| h2, grid 1 | **Bestsellers row** |
| h2, grid 2 | **Shop grid** |
| h2, grid 3 | **States** |
| Control: result | **Quick add result** (select: **Added**, **Not added**, **Limit reached**, **Bag full**; default Added) |
| Control: delay | **Slow bag (1 second)** (checkbox, default off; shows the pending state) |
| Preview bag count | **Items in the preview bag: {n}** |
| States grid captions (below each card, `type-caption`, text-muted) | **Sold out** · **Image missing** · **Three labels, two shown** |

`/dev/product-card/flags-off` (the public M3.2 state):

| Where | String |
|---|---|
| h1 | **Product card preview: links and quick add off** |
| Intro | **The cards as public pages show them until product pages and the bag go live. Dev only: this page is not built for production.** |
| Link back (plain `<a>`) | **Back to the full preview** → `/dev/product-card` |
| h2s and captions | the same as `/dev/product-card` (**Bestsellers row**, **Shop grid**, **States**; the three captions) |

---

## 10. Data needs

All from `ProductCard` (`lib/types/catalog.ts`, built by `toProductCard`). **No new field is needed.** The quick-add limits come from `CART_LIMITS` (`lib/types/cart.ts`), not from the product.

| Field | Used for |
|---|---|
| `slug` | `productHref(slug)`, `data-slug`, the quick-add payload |
| `name` | the heading, the accessible names and announcements |
| `type` | the variant hint's `{typeLabel}` |
| `shortDescription` | the description (per context) |
| `badges` | Bestseller, New, Limited (§3.3) |
| `inStock` | the Sold out badge and suffix, the sold-out look, whether quick add renders |
| `variants[].sku`, `.label`, `.price.amount`, `.price.currency`, `.available` | the price from available variants (§3.6), the quick-add variant (§4.3), the hint's `{n}` and single `{variantLabel}` |
| `sizeKeys` | "sizes" vs "options" in the hint (§3.5) |
| `currency` | the price formatter (the variants' currency is the same; `deriveProductFields` enforces one currency) |
| `cardImage.src`, `.width`, `.height` | the image (`cardImage.alt` is not rendered on the card) |
| `priceFrom`, `priceTo` | not read by the card (it uses the available variants); they stay the shop's sort and filter keys |

Notes for tech-agent:

- **Price on the card vs `priceFrom`.** The card's price uses available variants; `priceFrom` / `priceTo` cover every variant. They differ only when the cheapest variant is unavailable and another isn't. Then the shop's price sort and filter (M3.4) use `priceFrom` while the card shows the higher price. That is rare and harmless in the seed (every variant is available). M3.4 decides whether to derive an `availablePriceFrom` instead; flagged, not required.
- **Sale:** no compare-at price exists, so no Sale badge and no struck-through price. If M7 or D3 adds one, a later spec adds the sale price per typography.md §6.4.
- **"New" is authored, not computed from `publishedAt`.** The card shows the badge as the data says.
- Drafts and archived products never reach the card (§6).

---

## 11. Images

| Property | Value |
|---|---|
| Source | `cardImage` (the `cat-*` catalog shot, PNG in Storage, 1792 × 2240, 4:5), URL resolved on the server (`storageObjectUrl`) |
| Frame | 4:5, `radius-arch`, bg-raised, no outline, no glow (§3.1) |
| Render | `next/image` with `fill` inside the frame, `object-fit: cover`, `object-position: 50% 50%` |
| `sizes` | per context: bestsellers §5.2, shop and collection §5.3 |
| `loading` | `lazy` by default. A page may pass `eager` for its first row's images (a shop or collection page whose first card image is its LCP element; M3.3 / M3.6 decide and set `fetchPriority="high"` on the first card only). Home's cards stay lazy (home.md §3.9: the hero is the page's only eager image). |
| Placeholder | none (remote images); the frame's bg-raised and flame motif cover the wait (§3.2) |
| Emulator | the M1.6 `remotePatterns` setup and art-direction.md §9.4 (local-IP note) apply unchanged |
| Alt | `""` (§8.6) |
| Art direction for mock imagery | unchanged: the existing catalog shots (art-direction.md §3, §4.1); every product sits below the top 25% (35% for tins and melts) inside its central width band, so the arch, the hover zoom (3% larger, still clipped by the arch) and the sold-out opacity never hide the product. No new images are needed for M3.1. |

---

## 12. What changed against the home.md §6 baseline

M2.4 builds the home bestsellers card to home.md §6; M3.2 extends that same component to this file. Home's copy, selection rule, grid and `sizes` are unchanged.

1. **New: the variant hint** under the name (§3.5), 4px below the name and 8px above the description. It adds one or two lines to every card, so the card heights in home.md §5.2 are superseded by §5.2 here once M3.2 lands.
2. **New: the Sold out badge**, the visually hidden sold-out suffix and the sold-out state (§3.3, §3.4, §6). They never appear on home (home excludes out-of-stock cards).
3. **New: quick add** (§4), behind the `quick-add` flag. Until the bag store ships nothing renders, so home.md e2e check 4 (no `a` and no `button` in `#bestsellers ul` while the flags are off) still holds after M3.2.
4. **New: the frame motif** for the loading and missing-image states (§3.2).
5. **Changed: the price** is computed from the available variants (§3.6). With the seed (every variant available) every home price is unchanged.
6. **Clarified: hover runs only while the link is hovered, on fine pointers** (§6), and the pressed state shows the accent border (home.md §6.3 said only "no scale on the card").
7. **Clarified: the description is per context** (§5.1); home keeps it at every breakpoint.
8. **Unchanged:** the anatomy otherwise, the tokens, `alt=""`, badge order (Sold out is added in front), the 2-badge limit and the pinned badge, the price format, the contrast pairs, the `product-pages` flag and `productHref`.

home.md §6 already says M3.1 adopts and extends it and that home then "picks up the revision with no spec change here", so home.md needs no content edit for this. home.md §6 carries a one-line pointer to this file (added in M3.1 fix round 1).

---

## 13. Implementation notes (M3.2)

### 13.1 Component API (names are tech-agent's)

`components/catalog/ProductCard.tsx`, a **Server Component** (no Firestore import), and `components/catalog/QuickAdd.tsx`, the **only client island** in the card. Whether the card is linked and whether it has a quick add are **server-side props**; nothing on the client adds or removes the `<a>` or the quick-add root.

| Prop | Type | Default | Notes |
|---|---|---|---|
| `product` | `ProductCard` | — | the projection, as returned by the repositories |
| `context` | `"bestsellers" \| "shop" \| "collection"` | — | sets the description rule (§5.1) and the `sizes` string (§5.2, §5.3) |
| `headingLevel` | `2 \| 3` | `3` | `2` where the page has no section `<h2>` above the grid (M3.3 / M3.6 decide) |
| `pinnedBadge` | `"bestseller" \| "new"` | none | home only (§3.3) |
| `linked` | `boolean` | `features["product-pages"].live` at the call site | renders the stretched link and the hover states |
| `quickAdd` | `boolean` | `features["quick-add"].live` at the call site | renders the `QuickAdd` island when `inStock` |
| `imageLoading` | `"lazy" \| "eager"` | `"lazy"` | §11 |

- Pure helpers in `lib/domain` or next to the component (no Firebase or React imports), each unit-tested: `cardBadges(product, pinnedBadge?)` (§3.3, including Sold out and the pinned rule), `variantHint(product, typeLabels)` (§3.5), `cardPrice(product)` (§3.6, available variants, sold-out fallback), `quickAddVariant(product)` (§4.3: cheapest available, ties by order), and the shared price formatter.
- `QuickAdd` receives only plain props (`slug`, `sku`, `name`, `variantLabel`, `multiVariant`) and talks to the bag store through one interface, `useBagActions()` (name tech-agent's), which the bag task implements. Its `add()` result distinguishes `added`, `error`, `limit` and `full` (§4.3, §4.4). In M3.2 the only implementation is the preview adapter (§13.3); on public pages the island isn't rendered because the flag is off.
- **Limits:** import `CART_LIMITS` from `lib/types/cart.ts` for the `{maxQty}` / `{maxLines}` copy; never repeat the numbers.
- **Message id:** `useId()` in `QuickAdd`, so each card's `aria-describedby` id is unique on the page.
- **Feature flags:** add `"product-pages": { milestone: "M4.3", live: false }` (if M2.4 hasn't already) and `"quick-add": { milestone: "M5.4", live: false }` to `features` in `components/layout/site-routes.ts` (footer.md §3.2.2 lists both rows, §4.1).
- **Stretched link CSS:** the `<article>` is `position: relative`; the link's `::after` is `content: ""; position: absolute; inset: 0; border-radius: var(--radius-md)` (the card's radius; not `inherit`, which would inherit the `<a>`'s 0). `QuickAdd`'s root is `position: relative; z-index: 1` with the buffer of §8.4. The card's own `overflow` stays visible (the arch frame does its own clipping), so the outline is never clipped.
- **Focus CSS (one rule pair, never one without the other):**

  ```css
  .ProductCard-link:focus-visible { outline: none; }
  .ProductCard-link:focus-visible::after {
    outline: var(--focus-ring-width) solid var(--color-focus-ring);
    outline-offset: var(--focus-ring-offset);
  }
  ```

  This is the "replacement" tokens.md §7 asks for when `outline: none` is used: the ring moves from the name text to the card. Variable names follow the tokens.md mapping.
- **Reduced-motion CSS (both triggers, same declarations):**

  ```css
  @media (prefers-reduced-motion: reduce) {
    [data-quick-add], [data-quick-add] .QuickAdd-label { transition: none; }
    [data-quick-add] button { transition-property: color, background-color, border-color; }
  }
  html[data-motion="off"] [data-quick-add],
  html[data-motion="off"] [data-quick-add] .QuickAdd-label { transition: none; }
  html[data-motion="off"] [data-quick-add] button { transition-property: color, background-color, border-color; }
  ```

- **Hover selector:** `.ProductCard:has(.ProductCard-link:hover)` inside `@media (hover: hover) and (pointer: fine)`. `:has()` is in every supported browser (Chrome 105, Safari 15.4, Firefox 121). Where it isn't, there is simply no card hover.
- **Ready state:** `data-ready="false"` in the server HTML, `true` in a mount effect. The CSS: `[data-quick-add][data-ready="false"] { visibility: hidden; opacity: 0 }`, on the root. Keep the server and first client render identical (no hydration mismatch).
- **Label cell:** the stacked-labels grid of §4.4; never swap labels with `display`. The pending label is `Adding<span aria-hidden="true">…</span><span class="sr-only"> to bag, {name}</span>` (§4.4).
- **Broken image:** `alt=""` images that fail render nothing in Chromium, Firefox and WebKit as far as design-agent knows; the build review confirms it. If any engine shows a broken-image icon, add an `onError` in a small client leaf that sets `visibility: hidden` on the `<img>` (the frame motif then shows); it isn't needed otherwise.
- `data-product-card`, `data-slug`, `data-sold-out`, `data-quick-add` (the root), `data-ready` and `data-state` (`idle | pending | added | error | limit | full`) are the e2e hooks.
- Tailwind scans `components/`, so no `@source` change is needed; the dev pages live in `app/dev/`, already scanned.

### 13.2 Home after M3.2

- The bestsellers band renders `<ProductCard context="bestsellers" pinnedBadge={…} />` and gets the hint automatically. No home.md copy changes (§12).

### 13.3 Dev previews: `/dev/product-card` and `/dev/product-card/flags-off`

- **Two static routes**, both gated like the other dev pages (`requireDevPages()`, `ENABLE_DEV_PAGES=true`); no `searchParams`, cookies or headers (the `/dev/footer` + `/dev/footer/minimal` pattern):
  - `/dev/product-card` renders every card with **`linked` and `quickAdd` true**;
  - `/dev/product-card/flags-off` renders the same grids with **`linked={false}` and `quickAdd={false}`**, exactly the public M3.2 state. It has no controls and no preview bag.
- Data: `getProducts()` from the seeded emulator (the e2e harness seeds before building), plus three **synthetic cards built in the page code** from real ones for the States grid:
  - **Lakelight** with every variant `available: false` and `inStock: false` (sold out);
  - **Still Water** with its `cardImage` replaced by a `ResolvedImage` (`lib/types/catalog.ts`) whose **`storagePath` is `products/dev-preview/dev-preview-missing-image.png`**, an object that is never uploaded, and whose **`src` is `storageObjectUrl(storagePath)`** (`lib/firebase/storage-url.ts`); `id`, `alt`, `role`, `width` and `height` are copied from Still Water's real `cardImage` (image missing). `ResolvedImage.src` is always a full URL, so the synthetic one is too: the request goes through the `remotePatterns` entry and `/_next/image` exactly like a real card's, and fails there. A raw relative `src` (the bare object path) is not allowed: `next/image` would throw, because it is neither a configured remote pattern nor a local file. `storageObjectUrl` percent-encodes the path, and `/_next/image` encodes the URL again, but `dev-preview-missing-image` has no characters that change under encoding, so the §13.3 pattern below still matches every request and log line for it;
  - **Comet Tail** with `badges: ["limited", "new", "bestseller"]` (three labels, two shown).

  Each has a caption (§9.1). The synthetic copies never leave these pages. The States grid uses `context="shop"`, so at 390 Lakelight and Still Water share the first row.
- **The missing image's expected errors.** `/_next/image` answers that request with a 4xx or 5xx and Chromium logs "Failed to load resource", which the M1.20 fixture (`tests/e2e/fixtures.ts`) would fail. Every test that loads either preview route (including the screenshot tests, below) sets `test.use({ expectedIssues: [/dev-preview-missing-image/] })` (one shared constant in the e2e support code). The pattern matches only that object's URL (both the "HTTP <status>: <url>" and the "Failed to load resource … [<url>]" lines carry it), so any other 4xx, 5xx or console error still fails the test.
- Layout: the three grids in §9.1 order, each an `<h2>` with a `<ul>` that carries **`data-preview-grid="bestsellers" | "shop" | "states"`**; the bestsellers grid uses home's selection (`selectHomeBestsellers`) and `context="bestsellers"`; the shop grid lists all 17 with `context="shop"` and `headingLevel={3}`. The synthetic cards share `data-slug` and names with their real twins, so **every e2e locator for a named card is scoped to its grid's `<ul>`**.
- On `/dev/product-card` only: `ProductCardPreviewProvider` (client, renders no DOM, the header.md §3.4 pattern) holds the two controls' state (result, slow bag) and provides the **preview bag adapter**: an in-memory store whose `add()` resolves with the chosen result (`added`, `error`, `limit` or `full`; after 1s when "Slow bag" is ticked) and keeps a count shown in the "Items in the preview bag" line. The page's own `role="status"` region (visually hidden, in the HTML from load) receives the §8.5 announcements here, standing in for M5.3's. The controls never add or remove links or quick adds (those are the two routes).
- Links on these pages are plain `<a href>` (not `next/link`), so the unbuilt `/products/{slug}` routes are never prefetched and the M1.20 fixture sees no 404. Tests never follow them. The cross-links between the two preview routes are also plain `<a>`, and both routes are built in the e2e build.
- **Screenshots: their own `test.describe`, not the `ROUTES` loop.** The `ROUTES` loop in `tests/e2e/screenshots.spec.ts` (:7–29) runs with the fixture's default `expectedIssues`, so the missing image would fail it. The two preview routes get their own `test.describe` block in the same file, with `test.use({ expectedIssues: [/dev-preview-missing-image/] })` (the shared constant), exactly as the 404 shot's block does (:32–40). Inside it:
  - one full-page shot per route, tagged `@motion` like the `ROUTES` shots, saved under the same names the loop would have used: **`dev-product-card-<project>.png`** and **`dev-product-card-flags-off-<project>.png`** (`captureRoute(page, route, testInfo, { name: "dev-product-card" })` and `{ name: "dev-product-card-flags-off" }`);
  - the named shots below, all on `/dev/product-card` (captureRoute `name` / `fullPage`):

| Shot (`name`) | Widths | Actions | `fullPage` |
|---|---|---|---|
| `dev-product-card-added` | 390, 1440 | click the first shop card's quick add; wait for `data-state="added"` | `false`, scrolled to that card |
| `dev-product-card-hover` | 1440 | hover the first shop card's link; wait 800ms (the zoom ends; `animations: "disabled"` doesn't cover transitions) | `false` |
| `dev-product-card-focus` | 390, 1440 | Tab to the first shop card's link | `false` |
| `dev-product-card-error` | 390 | set "Not added", click the first shop card's quick add | `false` |

---

## 14. E2E acceptance checklist (build review, M3.2)

On `/dev/product-card` unless stated; both `mobile-390` and `desktop-1440` unless stated. "The shop grid" and "the States grid" mean `ul[data-preview-grid="shop"]` and `ul[data-preview-grid="states"]`; every named-card locator is scoped to one of them. Every test on either preview route uses the `expectedIssues` pattern of §13.3.

1. **Routes.** `/dev/product-card` and `/dev/product-card/flags-off` return 200 in the e2e build and 404 in a plain build; each has one `<h1>` ("Product card preview" / "Product card preview: links and quick add off").
2. **One link per card.** On `/dev/product-card`: every `[data-product-card]` contains exactly one `a`; its accessible name equals the product name (or "{name}, sold out" on a sold-out card); its `href` is `/products/{slug}`; no `a`, `button`, `input` or `[tabindex]` is inside that `a`. On `/dev/product-card/flags-off`: no `a` in any card.
3. **Quick add off.** On `/dev/product-card/flags-off`: no `[data-quick-add]` and no `button` in any card, and each card's last element is the price. On `/`: home.md e2e check 4 still passes (no `a`, no `button` in `#bestsellers ul`).
4. **Prices** (shop grid): Moonrise "From $34.00", Lantern Path "From $28.00", Late Bloom "$18.00", Fir Hollow "$12.00", Comet Tail "$36.00", Reading Nook Set "$60.00".
5. **Variant hints** (shop grid): Moonrise "Scented jar · 2 sizes", Lakelight "Pillar candle · 2 sizes", Comet Tail "Scented jar · 220 g", Quiet Shore "Travel tin · 120 g", Fir Hollow "Wax melts · 6 cubes, 80 g", Little Constellation Set "Gift set · Set of 3 tins".
6. **Badges.** In the shop grid: Comet Tail shows "Limited" then "New"; Moonrise "Bestseller"; Late Bloom has no badge list. In the States grid: the three-label Comet Tail shows exactly 2 ("Limited", "New"). Everywhere: every badge list has `aria-label="Labels"`; no badge box intersects its card's image box. The bestsellers grid shows Moonrise, Ink & Cedar, Midnight Balcony, Quiet Shore with their qualifying badges.
7. **Sold out** (Lakelight in the States grid): the first badge is "Sold out"; no `[data-quick-add]`; the link is present and its accessible name, and the heading's, is "Lakelight, sold out", while its visible text is "Lakelight"; the image's computed opacity is 0.64; the price's colour is text-secondary. On `/dev/product-card/flags-off` the heading's accessible name is also "Lakelight, sold out".
8. **Frame.** Every image box has a 4:5 ratio (±1px); its computed top-left and top-right radii equal half its width (±0.5px); the `<img>` has `alt=""`, `loading="lazy"` and the `sizes` string of its context (§5.2 or §5.3, exactly).
9. **Image missing** (Still Water in the States grid). **First make the failure happen, then measure.** The image is lazy and below the fold, so without this step the check could pass before the request is ever made: set up `page.waitForResponse` for a `/_next/image` response whose URL matches `/dev-preview-missing-image/` and whose status is ≥ 400, scroll Still Water's card (in the States grid) into view, and await that response; also wait until Lakelight's `<img>` in the same grid is `complete` with `naturalWidth > 0`. Then: the frame's box equals the box of Lakelight's frame in the same grid (same row at 390; width and height ±0.5px) and has a 4:5 ratio (±1px), although Lakelight's image loaded and Still Water's failed; the frame's background is bg-raised; the flame motif is visible; no text appears inside the frame; and no layout-shift entry is attributed to that card.
10. **Drafts and archived never shown.** On `/`, `/dev/product-card` and `/dev/product-card/flags-off` (and `/shop` once M3.5 is live): no text containing "(draft fixture)" or "(archived fixture)", and no `data-slug` of `fixture-draft-tin` or `fixture-archived-bestseller`.
11. **Quick add adds.** In the shop grid, Moonrise's button has the accessible name "Add 220 g to bag, Moonrise"; Late Bloom's is "Add to bag, Late Bloom". Clicking Moonrise's: `data-state` becomes `added`, the visible label is "Added", the preview count goes up by 1, the status region's text is "Added to your bag: Moonrise, 220 g.", focus is still on the button, and after 2.0–2.5s `data-state` is `idle` again with the label "Add 220 g". A second click within 300ms of the first confirmed add doesn't change the count; a click during "Added" (after 300ms) adds 1 more.
12. **Button size is stable.** The button's bounding box is identical (±0.5px) in the idle, pending ("Slow bag"), added and idle-again states, at 390 and at 320px wide (where "Add 7 × 10 cm" may wrap).
13. **Error, limit and bag full** (Moonrise in the shop grid). With "Not added": the inline message reads "Not added. Please try again.", its colour is coral-300, the button's `aria-describedby` points at it, and the status region reads "Moonrise wasn’t added to your bag. Please try again."; the next click clears it. With "Limit reached": "Limit reached: 10 per item." and "Moonrise, 220 g wasn’t added: 10 is the most per item.", `data-state="limit"`. With "Bag full": "Bag full: 20 different items." and "Moonrise wasn’t added. Your bag holds up to 20 different items.", `data-state="full"`. The numbers in all four strings equal `CART_LIMITS` (the test imports it). Every `id` referenced by an `aria-describedby` on the page occurs exactly once.
14. **No dead button.** With JavaScript disabled: every `[data-quick-add]` root has `visibility: hidden`, its button isn't focusable (Tab skips it) and isn't in the accessibility tree; each card's link still works. With JS: the button becomes visible only after `data-ready="true"`.
15. **Keyboard and focus ring.** Tabbing through the first two shop cards visits link, button, link, button in DOM order. With the link focused: the link's own computed `outline-style` is `none`; `getComputedStyle(link, "::after")` has a 2px solid gold-300 outline with a 2px offset and `border-radius` equal to `--radius-md` on all four corners; and the outline box encloses the whole card.
16. **Hover** (`desktop-1440` only). Hovering a card's link: after the transition, the image's computed transform is `matrix(1.03, 0, 0, 1.03, 0, 0)` and the card's border colour is gold-400; the card's and the frame's bounding boxes are unchanged. Hovering the quick-add button instead: the image's transform stays `none` (or identity) and the button's border is gold-400.
17. **Reduced motion** (`@motion`, the `-reduced-motion` projects). Hovering a link leaves the image's transform at identity. For the quick add, triggered from the keyboard (focus the button, press Enter, so no hover transition runs): right after `data-ready` becomes `true`, and right after `data-state` changes to `added` and back to `idle`, `root.getAnimations({ subtree: true })` contains no transition on `opacity`, `visibility` or `transform`; the computed `transition-duration` of the root and of each label is `0s`.
18. **CLS.** On `/dev/product-card` and `/` at 390 and 1440, CLS < 0.05 across load, hydration (the quick add appearing) and a hover; layout-shift entries attributed to card elements total 0 (excluding the input-triggered inline message).
19. **Reflow.** At 320px wide: no horizontal scroll; no card name, hint or button label is truncated (`scrollWidth <= clientWidth` on each, and no `text-overflow: ellipsis`).
20. **Contrast spot checks.** The computed colours of the name, hint, description, price, each badge, the button label and border, and the error message match the tokens in §8.7 (so the ratios there hold).
21. **No unexpected errors** (the M1.20 fixture) on `/dev/product-card`, `/dev/product-card/flags-off` and `/`: no 4xx/5xx response and no console error other than the missing preview image's, which only the `/dev-preview-missing-image/` pattern excuses (on `/` nothing is excused).
22. **Screenshots:** `dev-product-card-<project>.png`, `dev-product-card-flags-off-<project>.png` and the named shots in §13.3 (all from the preview routes' own `test.describe`, with the `expectedIssues` pattern), compared with §2, §5 and §6.
23. **Description per context** (§3.7). At 390: in the shop grid every `.ProductCard-description` has computed `display: none`, and the shop grid's `ariaSnapshot()` does not contain Moonrise's description text; in the bestsellers grid Moonrise's description is visible and its text is in that grid's `ariaSnapshot()`. At 1440: the descriptions are visible, and in the accessibility tree, in both grids.
24. **Target spacing** (§8.4, `mobile-390`). For the first shop card's quick-add button, `document.elementFromPoint` at points 6px outside its top, left, right and bottom edges (on the edges' centre lines) returns **the card's `[data-quick-add]` root or a descendant of it**, never the link or the `<article>`. At the centre of that card's price and at the centre of its image, `elementFromPoint` returns the card's `a` (a hit on the stretched `::after` is reported as its link). No click is needed, so nothing navigates.

Unit tests (`npm run test:unit`): `cardBadges` (Sold out first, the 2-badge limit, the pinned rule and its home example), `variantHint` (each seed type, the "options" case), `cardPrice` (one price, a range, a range with the cheapest variant unavailable, sold out), `quickAddVariant` (cheapest available, a tie, the cheapest unavailable), the formatter ("$18.00", "From $34.00"), and the limit and bag-full strings built from `CART_LIMITS`.

---

## 15. IP guardrail

I re-read every string in §3, §4.4, §8.5, §9 and §9.1, including the fix round 1 additions and the post-pass minors:

- The strings are ordinary shop words: labels, bestseller, new, limited, sold out, sizes, options, from, add, added, adding, bag, "not added", "please try again", "limit reached", "per item", "the most per item", "bag full", "different items", "holds up to", and the dev pages' "preview", "grid", "states", "image missing", "links and quick add off", "back to the full preview".
- Product, type and variant names come from catalog.json, already IP-checked (catalog.md §7). Nothing new is named.
- The only motif is the small flame (a brand motif from CLAUDE.md).
- No character, place, court or book names; no author name; no quotes or close paraphrases; no invented terms; no "Night Court", "Court of …" or "High Lord/Lady"; no star-fall, wish or wing imagery; no maker, material or wellness claims; no restock promises.
- The identifiers (`quick-add`, `product-pages`, `data-product-card`, `data-preview-grid`, `badge-sold-out`, `ProductCard`, `QuickAdd`, `cardBadges`, `variantHint`, `cardPrice`, `quickAddVariant`, `useBagActions`, `flags-off`, `dev-preview-missing-image`, `dev-preview`) are generic English.

Confirmed clean.

---

## 16. Open questions

1. **Quick add picks the smallest size** ("Add 220 g") for products with several sizes; other sizes are on the product page. The alternative is a size picker on the card (more taps, more tab stops, a popover on a phone). `[confirm with user]` The default in force: the smallest available size, named on the button.
2. **No description on 2-up phone cards in the shop and collection grids** (§3.7, §5.1); home keeps it. `[confirm with user]` The default in force: hidden below md in those grids.
3. **Sale pricing** isn't in the data, so no Sale badge. Does the user plan sales or compare-at prices? If yes, a later task adds a field and the card shows the struck-through price. `[confirm with user]`
4. **Quick add keeps the cart drawer closed** and confirms in place (§4.3). M5.3 may choose to open the drawer instead. `[M5.3 confirms]`
5. **The per-line limit and the line cap** behind the limit and bag-full messages are `CART_LIMITS` (10 and 20 today). If M5.3 changes the numbers, the copy follows automatically. `[M5.3 confirms]`
6. **Product route** `/products/{slug}` `[M4.1 confirms]` (home.md §16 question 4).

---

## 17. Changelog

- **Post-pass minors** (after QA PASS, 2026-10-10):
  1. The synthetic Still Water image is a full `ResolvedImage`: `storagePath: "products/dev-preview/dev-preview-missing-image.png"` and `src: storageObjectUrl(storagePath)`, so the request goes through `remotePatterns` and `/_next/image` like a real card's; a raw relative `src` is ruled out because `next/image` would throw (§13.3).
  2. Check 9 now makes the failure happen before measuring: scroll Still Water's card into view and await the `/_next/image` response matching `dev-preview-missing-image` with a status ≥ 400 (and Lakelight's image loaded), because the lazy, below-the-fold image might otherwise never be requested (§14 check 9).
  3. The pending state's accessible name is "Adding to bag, {name}": the visible ellipsis sits in an `aria-hidden` span, so it never runs into the hidden " to bag, {name}" text (§4.4 table and rules, §9, §13.1).
  4. Check 24: a strip hit returns "the card's `[data-quick-add]` root or a descendant of it" (§14 check 24).
  5. The preview routes' screenshots don't join the `ROUTES` loop in `tests/e2e/screenshots.spec.ts` (:7–29). They get their own `test.describe` with `test.use({ expectedIssues })`, as the 404 shot does (:32–40), and keep the names `dev-product-card-<project>.png` / `dev-product-card-flags-off-<project>.png`; the named shots live in the same block (§13.3, check 22).
  6. Cross-reference only: §5.3's filters bullet records M3.3's decision (filters in a toolbar and a sheet at every breakpoint, no sidebar, shop.md §2.1), so the shop columns and `sizes` stand unchanged. No value changes.
- **Fix round 1** (QA FAIL on the first review):
  1. Links and quick add are server props only; the "Product links on" and "Quick add on" checkboxes are gone. A second static route, `/dev/product-card/flags-off`, renders `linked={false}` and `quickAdd={false}` (§4.1, §9.1, §13.1, §13.3; checks 1, 2, 3, 22).
  2. The missing image is a fixed never-uploaded object (`dev-preview-missing-image`); tests on both preview routes excuse only that URL through `expectedIssues`; check 21 now fails on any other 4xx/5xx or console error (§13.3, check 21).
  3. footer.md §3.2.2 rows and the home.md §6 pointer are supplied as replacement text to the orchestrator; references updated (§4.1, §12, §13.1).
  4. The link's `::after` uses `border-radius: var(--radius-md)`, not `inherit` (§6, §13.1, check 15).
  5. `.ProductCard-link:focus-visible { outline: none }` is stated only together with the `::after` outline; check 15 asserts the link's own outline is `none` (§6, §8.3, §13.1).
  6. The 8px target-spacing rule now holds: the quick-add root owns a 12px+ no-action buffer round the button above the stretched link (§2.1, §2.2, §8.4, check 24).
  7. The md shop grid is recorded as a deliberate exception to layout-shell §4 (own 3-column grid, same gap, `min-width: 0` items) (§5.3).
  8. Limits reference `CART_LIMITS`; a `full` state with copy is added; the limit copy no longer talks about "one order" (§4.3, §4.4, §9, §13.1, §13.3, check 13, §16 question 5 text).
  9. Under reduced motion and `html[data-motion="off"]`, `transition: none` on `[data-quick-add]` and its labels (§7, §13.1, check 17).
  10. A visually hidden ", sold out" follows the name inside the link (or heading), so heading and link navigation hear it (§3.4, §6, §8.1, §8.2, §9, checks 2 and 7).
  11. The inline message's 3 lines below 390px are a recorded exception to typography.md §7.4 (§5.4, §9).
  12. Named-card locators are scoped by `data-preview-grid`; check 9 compares against Lakelight's loaded frame; `aria-describedby` ids come from `useId()` (§4.4, §13.1, §13.3, checks 6, 7, 9, 13).
  13. New check 23 for the per-context description rule.
  14. New check 24 for the hit zones. The flag flips "in the task that ships the client bag store (M5.4, or M4.3 if built first)" (§4.1).
