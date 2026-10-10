# Collection pages (M3.6)

Status: spec, first draft, awaiting QA review. Owner: design-agent. Built by tech-agent in M3.7 (static params and revalidation). `/collections/gift-sets` is enriched later by M8.3 / M8.4 through the hook in §11.

Routes (registry, footer.md §3.2.1; `components/layout/site-routes.ts`):

| Route | Registry key | Page |
|---|---|---|
| **`/collections`** | `collections` (label "Collections", header `primary`, footer `explore`) | the collections index (§4) |
| **`/collections/[slug]`** | — (one page per published collection) | a collection page (§3) |
| **`/collections/gift-sets`** | `gift-sets` (label "Gift sets", header `primary`, footer `explore`) | the same collection page template, plus the M8.3 hook (§11). There is no separate `/gift-sets` route (TASKS M8.3). |

The `collections` and `gift-sets` rows and `features["collection-pages"]` go live together in M3.7 (§13.1).

Builds on [`shop.md`](./shop.md) (§5.5 the collection facet and its option rule, §6 sold-out last, §7.2 the canonical `/shop?collection=…` URL, §11.4 the empty block pattern, §15 the metadata format, §18.2 `sortCards` and `shopQuery`), [`product-card.md`](../components/product-card.md) (§5.1 the `collection` context, §5.3 the grid 2 / 3 / 3 / 4 and its `sizes`, §11 `imageLoading`), [`home.md`](./home.md) (§4 the featured collections band: the collection card in §4.3, its links in §4.5 and its contrast in §4.7; §3.8 in-page anchors; §12 metadata), [`layout-shell.md`](../components/layout-shell.md) (§2 landmarks, §3.4 `scroll-padding-top`, §4 Container and Grid, §5.1 spacing and the hero override, §5.2 bands, §5.3 the section heading pattern, §10 not-found and error, §11 the reserved "Breadcrumb" label), [`header.md`](../components/header.md) (§7 current page; `currentHref()` in `site-routes.ts`), [`footer.md`](../components/footer.md) (§3.2 the registry and `features`, §3.4 "Our collections"), [`starfield.md`](../components/starfield.md) (§3.2 the 0.14 cap and its composite `#2D303F`, §4.5 markup rules), [`tokens.md`](../system/tokens.md) (§2.5 rules 3, 5, 7, §3 contrast, §5 `radius-arch`, §7 focus, §9 touch targets), [`typography.md`](../system/typography.md), [`motion.md`](../system/motion.md) (§1, §5, §6), [`accessibility.md`](../system/accessibility.md), [`catalog.md`](../copy/catalog.md) / [`catalog.json`](../copy/catalog.json) (the six collections) and [`art-direction.md`](../art/art-direction.md) (§4.2 the 3:4 mood images, §7 alt rules, §9.2 `/public` delivery). Nothing here loosens those files.

---

## 1. Purpose and acceptance criteria

Purpose: a visitor who taps a collection (on home, in the footer, or from a Pinterest pin of one of our mood images) lands in that place. They see its arched window, its name and one line of mood in the first screen of a phone, then the candles that belong to it on solid cards, then a quiet way on to the next place. The index page lays all the places out side by side as arched windows. It is calmer and simpler than the shop: no filters, and one step to the shop when someone wants to narrow things down.

Acceptance criteria (TASKS.md M3.6 and the orchestrator's task, refined):

1. **Routes:** a `/collections` index (§4) plus `/collections/[slug]` (§3), from the registry. Gift sets is `/collections/gift-sets`, with a hook for M8.3 (§11). Static params and revalidation are built in M3.7 (§13).
2. **Reuse, decided:** the product grid and card from the shop (product-card §5.3, `context="collection"`). **Filter and sort don't apply on collection pages**, with a link to the filtered shop instead (§2.1). There is no pagination (§2.2).
3. **Collection hero band** with its mood image, the LCP rule and `sizes`, plus the name, tagline, description and product count (§3.3–§3.5, §9).
4. **Product grid**; **empty collection**; **unknown slug → 404** (§3.6, §6).
5. **"Other collections" strip** (§3.7).
6. **Breadcrumbs** (§5.1) and **metadata / OG per collection** (§8).
7. **Motion:** reduced motion, and GSAP reveals only if they are consistent with home. **Decision: no reveals and no GSAP** (§7).
8. **Accessibility:** heading order, landmarks, keyboard order, focus, alt text, contrast pairs with ratios (§5).
9. **Copy:** from catalog.json where it exists; everything else new, final and IP-checked (§10, §15).
10. **Index tiles aligned with home's collection cards** (§4.3).
11. **Data needs** (§12), **images** (§9), **implementation notes** (§13), **dev preview** (§14), a **§-numbered e2e checklist** (§16).

---

## 2. Decisions

### 2.1 No filters or sort on collection pages (decision)

The collection page lists its products in the curated order (`sortOrder`, sold-out last) with no toolbar, no sheet, no sort and no chips.

- **Why:** a collection is already a filter: a curated set of three or four products today, and at most a dozen or so as the catalog grows. Filtering three cards by scent or price would mostly produce empty or one-card results. It would also bring the shop's whole client machinery (the dialog, the facet index, the history model and the live counts) onto a page that is otherwise fully static and mood-led. And `searchParams` would stop the page from being statically generated (M3.7's "static params"), so every Pinterest visit would become a per-request render.
- **The bridge:** the product section's heading row carries a section link, **"Filter and sort in the shop"** → **`/shop?collection={slug}`** (shop.md §7.2's canonical URL for that one facet value). It is rendered only when the `shop` registry row is live and the collection has at least one published product. Then the slug is guaranteed to be one of the shop's collection options (shop.md §5.5: published, and carried by at least one published product), so the link never lands on an ignored value. The shop opens already narrowed to this collection, with its chip, and every shop tool is there.
- **Order:** the shop's pure `sortCards(cards, "featured")` (shop.md §6, §18.2): `sortOrder` ascending, sold-out products after in-stock ones. So the collection page and the shop's collection view always list the same products in the same order.

### 2.2 No pagination (decision)

Every product of the collection is rendered in one grid. The largest seed collection has 4 products. A collection of up to **48 products** (two shop pages) stays a reasonable single page (12 rows at 4 per row). Past that, a later spec adds the shop's Show more (shop.md §10), which would need `searchParams` (§17 question 4). The cards' images are lazy (§9.3), so a long grid costs nothing until it is scrolled.

### 2.3 Image first on phones, beside the text from md (decision)

At base, the mood image (an arched window, 1:1) comes **before** the name, under the breadcrumb. From md the image sits in the start column and the text beside it.

- **Why image first at base:** a visitor from a Pinterest pin of the mood image should recognise what they tapped at once. With the image first, the first 664px screen at 390 holds the breadcrumb, the whole window, the eyebrow, the name and the tagline (§3.4.1). With the text first, the window would start at about y 420 and be cut in half by the fold.
- **Why 1:1 at base, not 3:4:** a 3:4 window at 350px wide is 467px tall, which would push the name below the fold. The square crop removes only the calm top quarter of the sky (art-direction.md §4.2: "the top 30% is calm, low-detail sky or shadow"), and the arch still frames the subject (§9.1).
- **Why there is no CTA button:** the band's job is mood. The way on to the products is a text link that names the count ("See all 3 products", §3.5), and ember stays unused, so it remains reserved for the shopping actions on the cards when quick add goes live (tokens.md §2.5 rule 1).

### 2.4 One template for all six, including Gift Sets

Gift Sets is a collection like the others (catalog.json), so `/collections/gift-sets` renders the same template. M8.3 may add content to it through two empty slots, and nothing else forks (§11).

---

## 3. The collection page `/collections/[slug]`

### 3.1 Bands

| # | Section | Band (layout-shell §5.2) | Element / id | Rendered |
|---|---|---|---|---|
| 1 | Collection hero: breadcrumb, mood image, eyebrow, name, tagline, count link, description | **`plain`**, as the page's **hero** band (it overrides its own top spacing, layout-shell §5.1) | `<section id="collection-intro" aria-labelledby="collection-heading" data-collection="{slug}">` | always |
| 2 | Products ("In this collection") | **`plain`** (top padding collapsed after band 1) | `<section id="collection-products" aria-labelledby="collection-products-heading">` | always (the empty state lives inside it, §6.1) |
| [2a] | M8.3 slot "after products" (§11) | M8.3 decides (never haze directly next to band 2's grid) | — | **not rendered** until M8.3 |
| 3 | Other collections strip ("More kinds of night") | **`plain`** (top collapsed) | `<section id="more-collections" aria-labelledby="more-collections-heading">` | when at least one other published collection exists (§3.7) |
| — | Footer | its own bg-sunken | `<footer>` | always |

- **Why every band is `plain`:** band 2 holds a product grid (plain or solid only, layout-shell §5.2), and the hero and the strip show arched mood windows that sit directly on the night, as on home (home.md §4.3: no card surface, over the starfield). The page has **no haze band**, so the one-haze-per-view rule holds trivially.
- **Why band 1 counts as a hero:** it is the page's first band and holds its h1 and its lead image, which is what layout-shell §5.1 means by a hero ("A hero may override its own top and bottom spacing (M2.1); no other band does"). It overrides **only its top**: 24px at base, 32px from md, so the window clears the fold at 390 (§3.4.1). Its bottom keeps `--section-y`, so the collapse rule gives exactly one `--section-y` between bands 1 and 2, and between bands 2 and 3. Band 3 is the last band before the footer, so it keeps its bottom padding.
- Every string sits inside the Container and inside an element (starfield.md §3.1, §4.5), so the 0.14 cap applies behind all text.

### 3.2 DOM

```
<main id="main">
  <section id="collection-intro" data-band="plain" aria-labelledby="collection-heading"
           data-collection="ember-grove">                                  hero band (top spacing 24 / 32)
    <div class="Container">
      <nav aria-label="Breadcrumb" class="Breadcrumb" data-print="hide">   §5.1
        <ol>
          <li><a href="/">Home</a> <svg star aria-hidden/></li>
          <li><a href="/collections">Collections</a> <svg star aria-hidden/></li>
          <li><span aria-current="page">Ember Grove</span></li>
        </ol>
      </nav>
      <div class="CollectionIntro">                                        stacked at base; Grid 8 / 12 from md
        <div class="ArchFrame CollectionIntro-media">                       1:1 at base, 3:4 from md; gold outline
          <Image src={moodImage.src} alt={moodImage.alt} fill sizes="…"
                 loading="eager" fetchPriority="high" />                   the LCP element (§9.2)
        </div>
        <div class="CollectionIntro-text">
          <hgroup>
            <p class="type-eyebrow">Collection</p>                         "Limited collection" when isLimited
            <h1 id="collection-heading" class="type-h1">Ember Grove</h1>
          </hgroup>
          <p class="type-body-lg CollectionIntro-tagline">Pine, moss and sparks drifting up into the dark.</p>
          <a class="TextLink" href="#collection-products" data-print="hide">See all 3 products <svg arrow-down aria-hidden/></a>
          [M8.3 slot "intro" (§11): not rendered until M8.3]
          <p class="type-body CollectionIntro-description">Deep in an old pine wood, …</p>
        </div>
      </div>
    </div>
  </section>

  <section id="collection-products" data-band="plain" aria-labelledby="collection-products-heading">
    <div class="Container">
      <div class="SectionHeading">                                          layout-shell §5.3
        <div class="SectionHeading-row">
          <hgroup>
            <p class="type-eyebrow">Ember Grove</p>
            <h2 id="collection-products-heading" class="type-h2">In this collection</h2>
          </hgroup>
          <a href="/shop?collection=ember-grove" data-print="hide">Filter and sort in the shop <svg arrow aria-hidden/></a>
        </div>
      </div>
      <ul class="ProductGrid">                                              product-card §5.3
        <li><ProductCard context="collection" headingLevel={3} … /></li> …
      </ul>
      [CollectionEmpty (§6.1), instead of the grid]
    </div>
  </section>

  <section id="more-collections" data-band="plain" aria-labelledby="more-collections-heading" data-print="hide">
    <div class="Container">
      <div class="SectionHeading"> eyebrow "Keep exploring" · h2 "More kinds of night" · link "See all collections" </div>
      <ul class="CollectionGrid" data-variant="strip"> <li><CollectionCard headingLevel={3} … /></li> × up to 4 </ul>
    </div>
  </section>
</main>
```

- DOM order is visual order at every breakpoint (image then text, at the start and end of the row from md). No `order` tricks.
- The jump link is a plain `<a href="#collection-products">` (not `next/link`): nothing to prefetch, and it works without JS (home.md §3.8).
- `data-collection="{slug}"` on the hero section is the e2e and M8.3 hook (§11). It carries no styles.

### 3.3 Components used

| Component | Spec | Props / variant here |
|---|---|---|
| `Breadcrumb` (new, shared; M4's product page reuses it) | §5.1 | `items: { label, href? }[]`; the last item has no `href` and is the current page |
| `CollectionIntro` (new) | §3.4, §3.5 | `collection` (`slug`, `name`, `tagline`, `description`, `isLimited`, `moodImage`), `productCount` |
| `ArchFrame` | home.md §4.3 | the collection-window variant: `radius-arch`, the 1px gold-400 outline at 40%; ratio 1:1 at base and 3:4 from md (§9.1) |
| `SectionHeading` | layout-shell §5.3 | eyebrow + h2 + optional section link |
| `ProductCard` | product-card.md | `context="collection"`, `headingLevel={3}`, `linked={features["product-pages"].live}`, `quickAdd={features["quick-add"].live}`, `imageLoading="lazy"` (every card; §9.3) |
| Product grid | product-card §5.3 | the shop grid recipe (2 / 3 / 3 / 4), the same `<ul>` as shop.md's `ShopGrid`, without `id="result-{n}"` (there is no Show more fragment) |
| `CollectionCard` | home.md §4.3, §4.5 (built in M2.3) | linked (the stretched name link, §4.5 "when live"); `headingLevel={3}` in the strip, `{2}` on the index; new optional `count` (the line in §4.3 here); `sizes` per grid variant (§9.4); `imageLoading` (§9.4) |
| `CollectionGrid` | home.md §4.4 + this spec | `variant: "home" \| "index" \| "strip"` (home's 2 / 3 / 3 / 6 stays as it is; index 2 / 3 / 3 / 3, §4.4; strip 2 / 4 / 4 / 4, §3.7) |
| `CollectionEmpty` (new) | §6.1, §6.3 | `variant: "collection" \| "index"`; the shop.md §11.4 block recipe |
| Header, footer, registry | header.md, footer.md | the `collections` and `gift-sets` rows and `features["collection-pages"]` go live (§13.1) |
| Starfield | starfield.md | unchanged; every band is plain |

Names are tech-agent's. Everything is a **Server Component**; these pages add **no client island of their own** (the product card's `QuickAdd` arrives with its flag, product-card §4.1).

### 3.4 Hero band layout

| | base (390; holds from 320) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Band top padding (the hero override) | 24 (step 6) | 32 (step 8) | 32 | 32 |
| Breadcrumb | its own row, 44px tall | same | same | same |
| Breadcrumb → content | 8 (step 2) | 24 (step 6) | 24 | 24 |
| Composition | stacked: **image, then text** | Grid 8: image cols 1–4, text cols 5–8 | Grid 12: image cols 1–5, text cols 7–12 | as lg |
| Image box | full content width, **1:1**: 350 × 350 | **3:4**: 340 × 453.3 | 3:4: 379.3 × 505.8 | 3:4: **514.7 × 686.2** |
| Text column width | 350 | 340 | 460 | 624 |
| Vertical alignment | — | `align-items: center` (the image and text centred on each other) | center | center |
| Image → eyebrow | 24 (step 6) | — (beside) | — | — |
| Eyebrow → h1 | 12 | 12 | 12 | 12 |
| h1 → tagline | 16 | 16 | 16 | 16 |
| Tagline → count link | 16 (the link's own 44px box adds room) | 16 | 16 | 16 |
| Count link → description | 16 | 16 | 16 | 16 |
| Band bottom | `--section-y` (64 / 80 / 96 / 128) | | | |

- **Type:** eyebrow `type-eyebrow` gold-400; h1 `type-h1` (34 → 52px), text-primary, `text-wrap: balance`, `max-w-measure-heading`; tagline `type-body-lg` (18 → 20px), text-secondary, `text-wrap: pretty`; description `type-body` (16 → 18px), text-secondary, `text-wrap: pretty`, `max-w-measure-prose` (65ch, set on the paragraph). Every collection name is 1 line at every width ("Moonlit Terrace", the longest at 15 characters, is about 214px at 34px).
- The text column is **never over the image** at any width: it sits below it at base, and beside it from md with the grid gap between (24 at md; one empty column plus two gaps at lg and xl: 104.7 / 141.3px).
- Nothing is truncated or clamped. If the text is taller than the image (md, with the longer descriptions), the band grows and the two stay centred. The image keeps its ratio.

#### 3.4.1 First viewport

- **390 × 664:** header 64 + 24 + breadcrumb 44 + 8 → the image spans **y 140–490**; + 24 → eyebrow 514–531 (16.9) + 12 → h1 543–580 (37.4) + 16 → tagline 596–654 (2 lines × 28.8; every seed tagline is 48–56 characters, 2 lines at about 38 per line). **The window, the name and the tagline are all in the first screen**, with 10px to spare. The count link (44px) follows just below the fold. At 320 the tagline may take 3 lines and slip below the fold; nothing depends on that.
- **1440 × 900:** header 80 + 32 + breadcrumb 44 + 24 → the image spans **y 180–866**, entirely in view. The text block (about 390px: eyebrow 18 + 12 + h1 57 + 16 + tagline 32, 1 line + 16 + link 44 + 16 + description 5–6 lines × 29.7) is centred on it, at about y 328–718.
- **768 × 1024 / 1024 × 768:** the image spans y 172–625 (md) and y 172–678 (lg).
- Line counts use the 0.51em Jost estimate (home.md §4.4) and are guidance only.

#### 3.4.2 Diagrams

```
390 (base), 390 x 664
+------------------------------------------+ 0
| HEADER 64                                |
+------------------------------------------+ 64
|  24                                      |
|  Home ✦ Collections ✦ Ember Grove        |  breadcrumb, 44 tall
|  8                                       |
|        .-''''''''''''''''-.              |
|      /                      \            |  arched window, 1:1, 350 x 350
|     |    (mood image)         |          |  y 140-490, eager, fetchpriority high
|     |                         |          |
|     +-------------------------+          |
|  24                                      |
|  COLLECTION                              |  eyebrow gold-400
|  Ember Grove                             |  h1 34px
|  Pine, moss and sparks drifting up       |  tagline body-lg, 2 lines (ends y ~654)
|  into the dark.                          |
|- - - - - - - - - - fold (664) - - - - - -|
|  See all 3 products ↓                    |  text link, 44 tall
|  Deep in an old pine wood, a path of …   |  description body, 7-9 lines
|  64                                      |
+------------------------------------------+
|  EMBER GROVE / In this collection        |  products band (top collapsed)
|  Filter and sort in the shop ->          |
|  48                                      |
|  [card][card]                            |  2 per row
|  [card]                                  |
|  64                                      |
|  KEEP EXPLORING / More kinds of night    |  strip
|  See all collections ->                  |
|  [arch][arch]                            |  2 per row, 2 rows
|  [arch][arch]                            |
|  64                                      |
+------------------------------------------+
| FOOTER                                   |
```

```
1440 (xl), 1440 x 900
| 80 |<---------------------------------- 1280 ---------------------------------->| 80 |
|    Home ✦ Collections ✦ Ember Grove                                               |  y 112-156
|    .-'''''''''''''''''-.                                                          |
|   /                     \          COLLECTION                                     |
|  |  arched window 3:4    |         Ember Grove                         (h1 52px)  |
|  |  514.7 x 686.2        |   141   Pine, moss and sparks drifting up into the dark.|
|  |  cols 1-5             |         See all 3 products ↓                           |
|  |  y 180-866            |         Deep in an old pine wood, … (5-6 lines)        |
|  |                       |         cols 7-12, 624 wide                            |
|  +-----------------------+                                                        |
|  128                                                                              |
|  EMBER GROVE / In this collection                     Filter and sort in the shop ->|
|  [card 296] [card] [card]                                                          |  4 per row
|  128                                                                              |
|  KEEP EXPLORING / More kinds of night                          See all collections ->|
|  [arch 296] [arch] [arch] [arch]                                                   |
```

### 3.5 Hero band content

| Element | Content | Notes |
|---|---|---|
| Eyebrow | **"Collection"**, or **"Limited collection"** when `isLimited` (Comet Season) | One word, so it never competes with the name. "Limited collection" replaces home's Limited badge here: in a hero, the eyebrow does the badge's job. |
| h1 | `collection.name` | the page's only h1 |
| Tagline | `collection.tagline` | from catalog.json |
| Count link | **"See all {n} products"** (n ≥ 3), **"See both products"** (n = 2), **"See the product"** (n = 1); not rendered at n = 0 | `href="#collection-products"`. The section-link recipe (layout-shell §5.3: gold-300, always underlined, `type-nav` size, 44px tall, inline-flex) with a 16px **down** arrow (`aria-hidden`, `currentColor`). It states the count and moves the visitor past the description in one tap. The landing heading clears the sticky header through `scroll-padding-top` (layout-shell §3.4). |
| Description | `collection.description` | from catalog.json, 3–4 sentences |

`{n}` is the number of published products whose `collectionSlugs` contain the slug (primary or `alsoIn`), the same set the grid shows (§12). Seed: Moonlit Terrace 3, Starlit Library 4 (with the Reading Nook Set, also in), Ember Grove 3, Lakeside Hush 3, Comet Season 3 (with the Comet Season Gift Box, also in), Gift Sets 3.

### 3.6 Products band

- **Heading** (layout-shell §5.3): eyebrow = `collection.name` (`type-eyebrow`, gold-400), h2 **"In this collection"** (`type-h2`, text-primary), section link **"Filter and sort in the shop"** → `/shop?collection={slug}` (§2.1; rendered only when `shop` is live and n ≥ 1). There is no intro paragraph. Base: eyebrow, 12, h2, 8, link; from md the link sits on the h2's row (last baseline), as layout-shell §5.3. Then 48px to the grid.
- **Grid:** product-card §5.3 exactly: 2 / 3 / 3 / 4 per row, gaps 16/32 · 24/40 · 24/48 · 32/48, cards 167 / 218.7 / 298.7 / 296px, the description from md only (product-card §3.7), the md list-grid exception as recorded there. With fewer cards than a row (every seed collection at xl), the grid packs from the start; nothing is centred or stretched (product-card §5.3).
- **Order:** `sortCards(cards, "featured")` (§2.1). Seed:

| Collection | Cards, in order |
|---|---|
| Moonlit Terrace | Moonrise, Midnight Balcony, Late Bloom |
| Starlit Library | Ink & Cedar, Last Chapter, Margin Notes, Reading Nook Set |
| Ember Grove | Lantern Path, Moss & Ember, Fir Hollow |
| Lakeside Hush | Still Water, Lakelight, Quiet Shore |
| Comet Season | Gilded Plum, Comet Tail, Comet Season Gift Box |
| Gift Sets | Little Constellation Set, Reading Nook Set, Comet Season Gift Box |

- Cards are unlinked until `product-pages` is live (M4.3) and carry no quick add until `quick-add` is live (product-card §4.1); the flags are read at the call site.

### 3.7 Other collections strip

- **Which (rule):** the published collections that **follow the current one in `sortOrder`, wrapping round to the start**, excluding the current one, **at most 4**. A pure function, `otherCollections(collections, currentSlug, 4)` (name tech-agent's), unit-tested. Every page shows different neighbours, and the six pages together show every collection several times. With fewer than 2 published collections the strip is not rendered (nothing to show).

| Page | Strip, in order |
|---|---|
| Moonlit Terrace | Starlit Library, Ember Grove, Lakeside Hush, Comet Season |
| Starlit Library | Ember Grove, Lakeside Hush, Comet Season, Gift Sets |
| Ember Grove | Lakeside Hush, Comet Season, Gift Sets, Moonlit Terrace |
| Lakeside Hush | Comet Season, Gift Sets, Moonlit Terrace, Starlit Library |
| Comet Season | Gift Sets, Moonlit Terrace, Starlit Library, Ember Grove |
| Gift Sets | Moonlit Terrace, Starlit Library, Ember Grove, Lakeside Hush |

- **Heading** (layout-shell §5.3): eyebrow **"Keep exploring"**, h2 **"More kinds of night"** (`type-h2`), section link **"See all collections"** → `/collections` (the `collections` row; live with this page).
- **Tiles:** home.md §4.3's collection card, linked (home.md §4.5 "when live"), `<h3>` names, plus the count line of §4.3 here. Gift Sets appears in the strip like any other collection.
- **Grid (`variant="strip"`):**

| | base (390) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Columns | 2 (Grid 4, span 2) | 4 (Grid 8, span 2) | 4 (Grid 12, span 3) | 4 (Grid 12, span 3) |
| Column / row gap | 16 / 32 | 24 / 40 | 24 / — | 32 / — |
| Tile width / frame (3:4) | 167 / 167 × 222.7 | 158 / 158 × 210.7 | 218 / 218 × 290.7 | 296 / 296 × 394.7 |
| Rows for 4 | 2 | 1 | 1 | 1 |

  - Why 4 in a row from md: a compact colonnade that closes the page without starting a second shop. At md the tile is narrow (158px): names still fit on one line ("Moonlit Terrace" at 22.7px is about 143px) and taglines wrap to 3–4 short lines, as home accepts at xl (home.md §4.4).
  - `sizes` in §9.4. All lazy.

### 3.8 States (collection page)

| Element | Default | Hover (fine pointer) | Focus-visible | Active | Disabled / loading / empty / error |
|---|---|---|---|---|---|
| Breadcrumb links | gold-300, underlined 1px at 0.2em | moon-100, underline stays, `--duration-fast` | the global ring | as hover | never disabled |
| Breadcrumb current item | text-secondary, no underline, not a link | — | not focusable | — | — |
| Count link, section links | the section-link recipe (layout-shell §5.3) | moon-100 | global ring | as hover | the count link isn't rendered at n = 0; "Filter and sort in the shop" isn't rendered at n = 0 or while `shop` isn't live |
| Hero image | visible from the first paint; the frame shows bg-raised until it decodes; no hover (it isn't interactive) | — | — | — | if the file fails: bg-raised inside the arch, the outline stays, the alt is exposed, the text is unchanged |
| Product cards | product-card §6 | product-card §6 (when linked) | product-card §6 | product-card §6 | sold out: product-card §6, listed last (§3.6) |
| Strip tiles | home.md §4.3 | image `scale(var(--motion-scale-hover))` inside the arch, the name underlined (home.md §4.5) | ring on the stretched `::after` round the whole tile | no scale | image failure: as the hero image |
| Page loading | **none**: the page is static (§13.2); a client navigation keeps the previous page on screen until this one is ready (layout-shell §10) | | | | |
| Empty collection | §6.1 | | | | |
| Unknown slug | §6.2 | | | | |
| Error | §6.4 | | | | |

---

## 4. The collections index `/collections`

### 4.1 Band and DOM

One **`plain`** band (layout-shell §5.2) with the normal `--section-y` padding (it has no hero image, so no override), the last band before the footer.

```
<main id="main">
  <section data-band="plain" aria-labelledby="collections-index-heading">
    <div class="Container">
      <nav aria-label="Breadcrumb"> <ol> <li><a href="/">Home</a> ✦</li> <li><span aria-current="page">Collections</span></li> </ol> </nav>
      <div class="IndexHeading">
        <hgroup>
          <p class="type-eyebrow">Scents of a place</p>
          <h1 id="collections-index-heading" class="type-h1">Our collections</h1>
        </hgroup>
        <p class="type-body max-w-measure-intro">Every collection begins with one place after dark: …</p>
      </div>
      <ul class="CollectionGrid" data-variant="index">
        <li><CollectionCard headingLevel={2} count={3} … /></li> × every published collection
      </ul>
      [CollectionEmpty variant="index" (§6.3), instead of the grid]
      <p class="IndexShopLine">Prefer to browse by scent, size or price? <a href="/shop">Shop all candles</a></p>   when `shop` is live
    </div>
  </section>
</main>
```

- Tile names are **`<h2>`** here (styled `type-h4`), because the index has no section h2 between the h1 and the tiles (typography.md §6.1: the style may differ from the level).
- The closing line is a `<p>` in `type-body`, text-secondary, with the link as a text link (gold-300, underlined, 44px tall inline-flex). It is rendered only when `shop` is live; without it the page simply ends with the grid.

### 4.2 Spacing

| Between | Space |
|---|---|
| Header → breadcrumb | `--section-y` (band padding) |
| Breadcrumb (44) → eyebrow | 8 at base, 24 from md |
| Eyebrow → h1 → intro | 12 / 16 |
| Intro → grid | 48 (step 12) |
| Grid → closing line | 48 |
| Last block → footer | `--section-y` |

First viewport at **390 × 664**: 64 + 64 + 44 + 8 + 16.9 + 12 + 37.4 + 16 + intro 105.6 (4 lines of `type-body`, about 43 characters per line) + 48 → the grid starts at **≈ 416px**, so the first two tiles' frames (222.7px tall) span **≈ 416–639px**, in view. At **1440 × 900**: 80 + 128 + 44 + 24 + 18.2 + 12 + 57.2 + 16 + 89.1 (3 lines) + 48 → the grid starts at **≈ 517px**; the first row's frames (540px tall) are in view from 517 to 900.

### 4.3 Tiles: home's collection card, plus a count

The tile **is home.md §4.3's collection card**, with its links live (home.md §4.5): the 3:4 arch with the 1px gold-400 outline at 40%, no card surface, the Limited badge above the name when `isLimited`, the name (`type-h4`, the stretched link to `/collections/{slug}`), the tagline (`type-body`, text-secondary). Its hover, focus and reduced-motion behaviour are home.md §4.5's.

**One addition, on the index and in the strip only:** a **count line** 8px (step 2) below the tagline: `<p class="type-body-sm">`, text-secondary, `tabular-nums`: **"{n} products"** / **"1 product"**; **not rendered at 0**. It sits outside the link, so the link's name stays the collection name alone. Home's featured band doesn't pass `count` and is unchanged.

### 4.4 Grid (`variant="index"`)

| | base (390) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Columns | 2 (Grid 4, span 2) | 3 (own 3-column list grid, as home.md §4.4 at md) | 3 (Grid 12, span 4) | **3** (Grid 12, span 4) |
| Column / row gap | 16 / 32 | 24 / 40 | 24 / 48 | 32 / 48 |
| Tile width | 167 | 218.7 | 298.7 | **405.3** |
| Frame (3:4) | 167 × 222.7 | 218.7 × 291.6 | 298.7 × 398.2 | 405.3 × 540.4 |
| Rows for 6 | 3 | 2 | 2 | 2 |

- **Why 3 at xl, not home's 6:** on home the six arches are one band among several, so a compact colonnade keeps the page moving (home.md §4.4). Here they are the whole page, and a 405px window shows the scene, which is what the visitor came to choose by. The anatomy, colours and links are identical to home's, so the two read as the same windows at two sizes.
- With fewer tiles than a row, the grid packs from the start.
- Order: `sortOrder`. **Every published collection is listed**, including Gift Sets, and including a published collection with no published product yet (its count line is omitted and its page shows §6.1). This matches the footer's "Our collections" group (footer.md §3.4), which lists published collections from the same read.

### 4.5 States (index)

| State | Behaviour |
|---|---|
| Default | §4.1–§4.4 |
| Hover / focus / active | home.md §4.5 (tiles); text links as §3.8 |
| Loading | none (static) |
| Empty (no published collection) | §6.3 |
| Error | §6.4 |
| An image fails | bg-raised inside the arch, the outline stays, the alt is exposed |

---

## 5. Accessibility

### 5.1 Breadcrumb

- `<nav aria-label="Breadcrumb">` (the label reserved in layout-shell §11) holding an `<ol>`. Items: **Home** → `/`, **Collections** → `/collections`, then the collection's `name` as the current item (a `<span aria-current="page">`, not a link). On the index: Home, then **Collections** as the current item.
- `type-body-sm font-medium`; links gold-300, underlined; the current item text-secondary. Each link is `inline-flex`, `min-block-size: 44px`, centred.
- **Separator:** an 8px four-point star (the `components/icons` shape), gold-400, inside the preceding `<li>` after the link, with 8px on each side, `aria-hidden="true"`. It is **not** `data-decorative`: it is the visual separator, so in forced colours it stays and takes the system text colour (`fill: currentColor` under `forced-colors: active`). Screen readers hear "Breadcrumb, navigation, list, 3 items".
- `display: flex; flex-wrap: wrap`, so at 320px a long trail wraps rather than scrolls. The seed's longest trail ("Home ✦ Collections ✦ Moonlit Terrace") is about 265px at 14px, so it fits on one line from 320.
- Links are `next/link` (both targets are built in the same task). `data-print="hide"`.
- Structured data (`BreadcrumbList`) is M8.5's, not this task's.

### 5.2 Landmarks and headings

Collection page:

```
banner
main
  navigation "Breadcrumb"
  region "Ember Grove"           h1 (in an hgroup with the eyebrow)
  region "In this collection"    h2 (in an hgroup with the name eyebrow) → h3 × n (product names)
                                 empty: h3 "Nothing in this collection just yet"
  region "More kinds of night"   h2 → h3 × up to 4 (collection names)
contentinfo (footer; its h2s follow)
```

The Breadcrumb nav sits inside `main` (first in the hero band, inside the "Ember Grove" region), so the reading order is: main → breadcrumb navigation → h1. Index page: main → breadcrumb → h1 "Our collections" → h2 × 6 (tile names); empty: h2 "No collections to show just now". No level is skipped, and each page has exactly one h1. Named regions: 3 on a collection page, 1 on the index (layout-shell §5.3 keeps it to about six).

### 5.3 Keyboard order

| Page | Order (after the skip link and the header) |
|---|---|
| Collection | Home → Collections (breadcrumb) → "See all {n} products" → "Filter and sort in the shop" → (card links and quick adds, when live) → "See all collections" → the strip's tile links (up to 4) → footer |
| Index | Home (breadcrumb) → each tile link (6) → "Shop all candles" → footer |

- The hero image, the tagline, the description, the counts and the eyebrows have no tab stops.
- After "See all {n} products", the fragment moves the focus-navigation starting point to `#collection-products`, so the next Tab is "Filter and sort in the shop" (home.md §3.8 pattern). No `tabindex` is added to the section.
- While cards are unlinked (until M4.3) the product grid has no tab stops.

### 5.4 Focus

- The global ring (2px gold-300, 2px offset) on every link. Tiles: the ring on the stretched `::after` round the whole tile, outside the arch clip (home.md §4.5).
- Nothing on these pages is sticky except the header; `scroll-padding-top` (layout-shell §3.4) keeps every focused element and the `#collection-products` target clear of it.

### 5.5 Touch targets

Breadcrumb links, the count link, section links and the closing shop link are at least 44px tall. Breadcrumb links are separated by the 24px separator area (8 + 8 + 8). Tiles and cards are whole-card targets (at 390 a strip tile is 167 × about 380px). Adjacent tiles are 16px+ apart.

### 5.6 Alt text

| Image | Alt |
|---|---|
| Hero mood image | `collection.moodImage.alt` (from shot-list.json via the seed, home.md §11.3). It describes the scene, which the name and tagline don't, so it is not empty. |
| Tiles (index and strip) | the tile's `moodImage.alt` (home.md §10.4) |
| Product cards | `alt=""` (product-card §8.6) |
| Separators, arrows, the arch outline, the empty-state crescent | decorative: `aria-hidden="true"` |

The six alts (home.md §11.3) are generic scene descriptions, IP-checked under art-direction.md §7–§8, and at most 150 characters.

### 5.7 Contrast

Every band is `plain`: text sits over bg-page with the starfield behind at the 0.14 cap, composite **`#2D303F`** (starfield.md §3.2, home.md §4.7), the worst case behind text. Product cards sit on bg-raised (product-card §8.7). **This spec introduces no new colour pair**; every ratio below is an existing row.

| Pair | Ratio | Needs | Source |
|---|---|---|---|
| Breadcrumb links, gold-300 over the cap | 8.58 | 4.5 | home.md §4.7 |
| Breadcrumb current item, text-secondary over the cap | 7.76 | 4.5 | home.md §4.7 |
| Breadcrumb separator, gold-400 over the cap (non-text, decorative; stated anyway) | 6.87 | — | home.md §4.7 |
| Eyebrows ("Collection", the name, "Keep exploring", "Scents of a place"), gold-400 over the cap | 6.87 | 4.5 | home.md §4.7 |
| h1 / h2, text-primary over the cap | 11.40 | 3.0 (large) | home.md §4.7 |
| Tagline (body-lg), description (body), index intro, closing line: text-secondary over the cap | 7.76 | 4.5 | home.md §4.7 |
| Count link, section links, "Shop all candles": gold-300 over the cap | 8.58 | 4.5 | home.md §4.7 |
| Link hover colour, moon-100 over the cap (moon-100 is text-primary, tokens.md §2.2) | 11.40 | 4.5 | home.md §4.7 |
| Tile name text-primary / tagline text-secondary / count text-secondary (body-sm) over the cap | 11.40 / 7.76 / 7.76 | 4.5 | home.md §4.7 |
| Limited badge text, text-inverse on gold-400 | 9.96 | 4.5 | T31 |
| Product cards | 5.99–14.85 | 4.5 | product-card §8.7 |
| Empty block: heading text-primary / body text-secondary / link gold-300 over the cap | 11.40 / 7.76 / 8.58 | 3.0 (h3/h2 styled `type-h3`, large) / 4.5 / 4.5 | shop.md §13.6 |
| Focus ring gold-300 over the cap | 8.58 | 3.0 | home.md §4.7 |
| Arch outline gold-400 at 40%, frame bg-raised, crescent glyph | decorative | — | home.md §4.7 |

Rules held: no text over any image (the text sits below or beside the window); no text-muted over the starfield; no form controls; no glow or particle over the images (tokens.md §2.5 rule 5); no ember on these pages.

### 5.8 Zoom, reflow, text spacing, forced colours, print

- **320px:** the hero window is 280 × 280; the h1 stays on one line (the longest name is about 214px); the product grid is 2-up at 132px (product-card §5.4); strip and index tiles are 2-up at 132px (names wrap, never truncated); no horizontal scroll.
- **200% / 400% zoom** (1280 × 800): the md / base layouts; at 400% the header isn't sticky (layout-shell §6.5). Nothing on these pages is sticky.
- **Text spacing (WCAG 1.4.12):** no fixed heights around text; the band grows; frames keep their ratios.
- **Forced colours:** links are underlined system-colour text; the breadcrumb separators show in the text colour; the arch outline and the crescent (`data-decorative`) disappear; images show as they are.
- **Print:** the breadcrumb, the count link, the section links and the strip are `data-print="hide"`; the hero image, the name, the tagline, the description and the product grid print (cards without the quick add, product-card §6).

---

## 6. Empty, not-found and error

### 6.1 Empty collection (published, but no published product)

- The hero band renders in full, **without the count link**.
- The products band keeps its eyebrow and h2 ("In this collection"), **without the section link**, and shows the `CollectionEmpty` block in the grid's place (the shop.md §11.3 / §11.4 recipe), start-aligned, `max-w-measure-intro`:
  - a 32px **crescent moon** glyph, gold-400, `aria-hidden`, `data-decorative`;
  - 16px below, **`<h3 class="type-h3">`** **"Nothing in this collection just yet"** (text-primary);
  - 12px below, `type-body`, text-secondary: **"Please check back soon, or browse every candle in the shop."**;
  - 24px below, the text link **"Shop all candles"** → `/shop` (gold-300, underlined, 44px tall).
  - While `shop` isn't live (only possible before M3.5 ships): the body reads **"Please check back soon, or head back to the home page for now."** and the link is **"Go to the home page"** → `/`.
- The strip renders as usual. No restock date or promise.

### 6.2 Unknown slug → 404

Any `/collections/{x}` where `{x}` is not a published collection's slug (unknown, misspelt, upper-case, draft or archived) returns **HTTP 404** with the shell's not-found content (layout-shell §10, §11): header and footer present, the h1 **"We can't find that page"**, its paragraph, the "Go to the home page" link, and the title **"Page not found · Starflames"**.

- Mechanism (M3.7's call, §13.2): with `dynamicParams = false`, a slug outside `generateStaticParams` is never rendered; with `dynamicParams = true`, the page's `generateMetadata` returns the not-found title when `getCollectionBySlug(slug)` is `null`, and the page calls `notFound()` (layout-shell §10's pattern). Either way, **a collection that was published at build time and is unpublished later** must 404 after the revalidation that follows (M7): the page and `generateMetadata` read the collection, and on `null` take the not-found path.
- No redirect from upper-case or near-miss slugs (slugs are lower-case by `SLUG_PATTERN`).

### 6.3 Empty index (no published collection)

- The breadcrumb, the eyebrow, the h1 and the intro stay. In the grid's place, the `CollectionEmpty` block in its index variant: the crescent, **`<h2 class="type-h3">`** **"No collections to show just now"** (an h2, because there is no section h2 above it), body **"Please check back soon, or browse every candle in the shop."**, link **"Shop all candles"** → `/shop` (or, while `shop` isn't live, the home-page body and link of §6.1). The closing line (§4.1) is not rendered in this state, so the shop link appears once.

### 6.4 Error

- These pages are static (§13.2). A repository failure **at build time fails the build** (the preflight, CLAUDE.md). **During an on-demand revalidation** Next keeps serving the last good page. So there is no collection-specific error UI. If a render still throws at request time, the existing `app/(site)/error.tsx` (layout-shell §10: "Something went wrong", "Try again", "Go to the home page") catches it inside the shell.
- The footer's "Our collections" group is omitted on its own if its read fails (footer.md §3.4).

---

## 7. Motion

**Decision: no scroll reveals and no GSAP on either route.** These pages have no motion of their own beyond hover state changes.

- **Why, and why it is consistent with home:** home's reveals are part of a scrolling story (hero, collections, bestsellers, brand story), and home loads GSAP after `load` plus idle only for that (home.md §9). A collection page is a destination reached by a tap: its first band holds the LCP image, which must never be hidden (motion.md §5.1 item 3), and its grid is the content, as on the shop, which has no reveals either (shop.md §12). Loading GSAP for one strip of four tiles would add JS on the routes Pinterest visitors land on, for very little. motion.md §1 ("Content is visible by default") is met without exception, so nothing can be stuck hidden and nothing flashes.
- **What moves:**

| What | Trigger | Animates | Duration / easing | Reduced motion and `html[data-motion="off"]` |
|---|---|---|---|---|
| Strip and index tile image | the tile's link hovered (fine pointer) | `scale(1) → scale(var(--motion-scale-hover))` (1.03) inside the arch, which clips it (home.md §4.5) | `--duration-slower` (700ms) / `--ease-standard`, back out the same | no zoom (`--motion-scale-hover` is 1, motion.md §6.3); the name's underline stays |
| Product card image | product-card §7 | — | — | product-card §7 |
| Link colours, underlines | hover | colour (a state change, motion.md §1) | `--duration-fast` | unchanged |
| Hero image | — | **never animated** (the LCP element) | — | — |

- **CLS:** every image box has its `aspect-ratio`; the counts and links are server-rendered; nothing is inserted after load; the hover zoom happens inside a clipped box. Target **CLS < 0.05** at 390 and 1440, and 0 from these pages' own elements.

---

## 8. Metadata (SEO)

### 8.1 Collection page (`generateMetadata`, reading the same `getCollectionBySlug(slug)` as the page, deduplicated by React `cache`)

| Field | Value |
|---|---|
| `<title>` (absolute, as shop.md §15) | **"{name} · Candle collection · Starflames"** (e.g. "Ember Grove · Candle collection · Starflames", 44 characters; the longest, Moonlit Terrace, is 48) |
| Meta description | **"{tagline} Shop the {name} collection at Starflames."** (e.g. "Pine, moss and sparks drifting up into the dark. Shop the Ember Grove collection at Starflames.", 95 characters; the longest, Moonlit Terrace, is 106) |
| Canonical | **`/collections/{slug}`** (the absolute URL arrives with M8.6) |
| Robots | indexable |
| Open Graph / Twitter | `og:title` and `og:description` as above, `og:type` `website`. **No `og:image` until M8.5 / M8.6** (as home.md §12 and shop.md §15; an absolute image URL needs the domain). §17 question 5 recommends the mood image. |
| Structured data | none (M8.5: `BreadcrumbList`, `CollectionPage`) |
| Unknown slug | **"Page not found · Starflames"** (§6.2) |

### 8.2 Index

| Field | Value |
|---|---|
| `<title>` | **"Our collections · Starflames"** |
| Meta description | **"Every Starflames candle collection, each inspired by one place after dark: a stone terrace, a reading room, a pine wood, a still lake and more."** (143 characters) |
| Canonical | **`/collections`** |
| Robots | indexable |
| OG | title and description as above; no `og:image` until M8.5 |

---

## 9. Images

### 9.1 Hero mood image: frame, crop and art direction

- Source: `collection.moodImage` (`src`, `alt`, `width`, `height`), the `col-*` JPEG in `public/images/collections/` (art-direction.md §9.2; **1744 × 2336, 3:4**). No new imagery is generated; the six existing mood images are used as delivered.
- **Frame:** the collection window (home.md §4.3): `radius-arch` (the semicircular top, radius = half the width), `overflow: hidden`, empty colour bg-raised, the 1px gold-400 inset outline at 40% opacity following the arch (decorative: a pseudo-element or an inset shadow, never content). No glow, no halo, no particle over or around it (tokens.md §2.5 rule 5).
- **Crop per breakpoint** (`next/image` `fill`, `object-fit: cover`):

| | Box | `object-position` | What it shows |
|---|---|---|---|
| base | **1:1** | `50% 100%` | the bottom 75% of the photo: the calm top quarter of the sky goes. The product's base (at 75–85% of the source height, art-direction.md §4.2) sits at about 67–80% of the box. |
| md+ | **3:4** | `50% 50%` | the whole photo (the 1744 × 2336 source is 0.747:1, so `cover` trims under 0.5% from the sides) |

- **Arch safety:** the subject is inside the central 60% of the width (art-direction.md §4.2). In the 3:4 frame (md+) the arch clips that band only in the top 7.5% of the height (0.1W of 1.333W), inside the photo's calm top 30%. In the 1:1 frame (base) it clips the band in the top 10% of the box (0.5W − √(0.25W² − 0.09W²) = 0.1W). After the crop, the calm sky fills only the top 6.7% of the box, so the clip can trim a sliver of background detail just below it (a window frame, a tree line), but nothing near the product, whose base sits at 67–80% of the box with the candle and its flame in the middle of the frame. So the arch never cuts the candle, its flame or a prop.
- Art direction for any future replacement image: keep art-direction.md §4.2's 3:4 rules (product in the central 60%, base at 75–85%, top 30% calm, no bright points there), so the 1:1 crop and the arch stay safe.

### 9.2 LCP and loading (hero)

- The hero image is the page's **LCP element** at every breakpoint: 350 × 350 = **122,500px²** at 390 (wholly in the first screen) against the h1's text block of about 350 × 37 = 13,000px²; **514.7 × 686.2 ≈ 353,200px²** at 1440 (wholly in view) against about 624 × 57.
- `loading="eager"`, **`fetchPriority="high"`**, `decoding="async"`; it is the page's only eager image. Never animated, never pre-hidden (motion.md §5.1 item 3). tech-agent checks the Next 16.4 docs for `preload` / `priority` with `next/image` and may preload it (home.md §14 note).
- **`sizes`** (the rendered width of the box; one source, so one string):
  `(min-width: 90rem) 515px, (min-width: 64rem) calc(41.67vw - 47px), (min-width: 48rem) calc(50vw - 44px), calc(100vw - 40px)`
  - Check: at 390, 350 (box 350); at 320, 280; at 768, 340 (box 340); at 1024, 379.7 (box 379.3: five of twelve columns, 5 × (944 − 264) / 12 + 96); at 1439, 552.6 (box 552.3); at 1440 and wider, 515 (box 514.7). The source's 1744px width covers 552px at 3×.
  - The base value uses the 20px gutters; under a landscape safe-area inset the box is a little narrower than the hint, which only over-fetches slightly.
- Static: tech-agent may map `moodImage.src` to a static import for a blur placeholder (home.md §14); width and height are in the data either way, so there is no CLS.

### 9.3 Product cards

`context="collection"`: product-card §5.3's `sizes` exactly, `(min-width: 90rem) 264px, (min-width: 64rem) calc((100vw - 128px) / 3 - 32px), (min-width: 48rem) calc((100vw - 112px) / 3 - 32px), calc((100vw - 56px) / 2 - 24px)`, and **every card lazy** (`imageLoading="lazy"`, no `fetchPriority`): the grid starts below the first screen at every Playwright size (at 1440 the hero band alone ends at about 994px), and the hero image is the LCP element. `alt=""` (product-card §8.6).

### 9.4 Collection tiles (index and strip)

| Grid | `sizes` | Check | Loading |
|---|---|---|---|
| Index (2 / 3 / 3 / 3) | `(min-width: 90rem) 406px, (min-width: 64rem) calc((100vw - 128px) / 3), (min-width: 48rem) calc((100vw - 112px) / 3), calc(50vw - 28px)` | 167 at 390; 218.7 at 768; 298.7 at 1024; 437 at 1439; 406 from 1440 (tile 405.3) | tiles **1–3 `eager`**, tile **1 `fetchPriority="high"`** (the first row at md+ and the likely LCP element; at base, tile 3 starts the second row, just below the fold, which costs one small image and keeps one rule); tiles 4+ lazy |
| Strip (2 / 4 / 4 / 4) | `(min-width: 90rem) 296px, (min-width: 64rem) calc(25vw - 38px), (min-width: 48rem) calc(25vw - 34px), calc(50vw - 28px)` | 167 at 390; 158 at 768; 218 at 1024; 321.8 at 1439; 296 from 1440 | all lazy |

Frame, crop and outline as home.md §4.3 (3:4, `object-position: 50% 100%`). The 1744px sources cover 437px at 3×.

---

## 10. Copy (final)

### 10.1 From the data (catalog.json; not repeated)

Collection `name`, `tagline`, `description`, `isLimited`; `moodImage.alt` (shot-list.json via the seed); product names and short descriptions on the cards; the "Limited" badge label (`microcopy.badgeLabels`).

### 10.2 Collection page

| Where | String |
|---|---|
| Breadcrumb `aria-label` | **Breadcrumb** (layout-shell §11) |
| Breadcrumb items | **Home** · **Collections** · {name} |
| Eyebrow | **Collection** / **Limited collection** (when `isLimited`) |
| Count link | **See all {n} products** (n ≥ 3) / **See both products** (n = 2) / **See the product** (n = 1) |
| Products eyebrow | {name} |
| Products h2 | **In this collection** |
| Products section link | **Filter and sort in the shop** |
| Empty collection, heading | **Nothing in this collection just yet** |
| Empty collection, body | **Please check back soon, or browse every candle in the shop.** |
| Empty collection, link | **Shop all candles** |
| Empty collection, body and link while `shop` isn't live | **Please check back soon, or head back to the home page for now.** · **Go to the home page** |
| Strip eyebrow | **Keep exploring** |
| Strip h2 | **More kinds of night** |
| Strip section link | **See all collections** |
| Tile count line | **{n} products** / **1 product** (not rendered at 0) |
| Title | **{name} · Candle collection · Starflames** |
| Meta description | **{tagline} Shop the {name} collection at Starflames.** |

### 10.3 Index

| Where | String |
|---|---|
| Breadcrumb items | **Home** · **Collections** |
| Eyebrow | **Scents of a place** |
| h1 | **Our collections** |
| Intro | **Every collection begins with one place after dark: a stone terrace, a reading room, a pine wood, a still lake. Choose the one that feels like your kind of evening.** |
| Closing line (when `shop` is live) | **Prefer to browse by scent, size or price?** followed by the link **Shop all candles** |
| Empty index, heading | **No collections to show just now** |
| Empty index, body / link | **Please check back soon, or browse every candle in the shop.** · **Shop all candles** (or the home-page pair of §10.2 while `shop` isn't live) |
| Title | **Our collections · Starflames** |
| Meta description | **Every Starflames candle collection, each inspired by one place after dark: a stone terrace, a reading room, a pine wood, a still lake and more.** |

### 10.4 Notes

- `{n}` is a numeral; "1 product" is singular, every other number plural. Counts say "products", not "candles", because collections hold wax melts and gift sets too (the shop's choice, shop.md §14.6). "Shop all candles" keeps the everyday sense used on home and in the shop.
- "See all collections" matches home's section link to the same page (home.md §4.2), so the link and its destination agree. "Our collections" matches home's eyebrow and the footer group heading.
- The index intro names four of the places in generic words, not the collection names, so it stays true when M7 adds or archives a collection.
- The middle dot in titles is U+00B7 with spaces; the breadcrumb separator is a glyph, not text. US spelling. No production, material or wellness claims; no restock promise (the empty state says "check back soon", which promises nothing).

---

## 11. Gift sets hook (for M8.3 / M8.4)

`/collections/gift-sets` is rendered by this template with no special case in M3.7. M8.3 enriches it **without a separate route and without forking the template**:

- **Two named slots**, both rendered by the template from a per-slug map (for example `collectionExtras: Partial<Record<CollectionSlug, { intro?: ComponentType; afterProducts?: ComponentType; metadata?: (base) => Metadata }>>`, tech-agent's names). The map is **empty in M3.7**, so the slots render nothing and take no space:
  - **`intro`**: inside the hero's text column, between the count link and the description (§3.2). For example the packaging line `microcopy.giftSet.packaging` ("Arrives in a midnight-blue gift box with a gold ribbon.") `[confirm with user]` in catalog.json.
  - **`afterProducts`**: one or more bands between the products band and the strip (§3.1 row 2a). For example "How a gift set arrives", or gift-message notes. M8.3 respects layout-shell §5.2: never haze directly next to the product grid, at most one haze band per view.
  - **`metadata`**: lets M8.3 refine the title and description for one slug (for example "Candle gift sets · Starflames").
- **Hooks already in the DOM:** `data-collection="gift-sets"` on the hero section (§3.2), for styles and tests.
- **The card's "Worth {total} if bought separately" line** (`giftSetValue`, catalog.json `microcopy.giftSet.worthSeparately`) is not shown in M3.6. If M8.3 wants it on the gift-set cards, it extends product-card.md (a card change, all contexts), not this page.
- **Header current page:** `currentHref()` picks the most specific matching href, so on `/collections/gift-sets` the header's **"Gift sets"** link is current and "Collections" is not; on every other collection page and on the index, "Collections" is current (header.md §7). The breadcrumb always reads Home › Collections › Gift Sets (the collection's own `name`).
- Everything else (the strip, the grid, the 404 rule, metadata defaults) applies to gift sets as written.

---

## 12. Data needs

| Need | Source (M1.6, `lib/firebase/repositories/catalog.ts`) | Fields |
|---|---|---|
| The collection | `getCollectionBySlug(slug)` (cached; `null` → §6.2) | `slug`, `name`, `tagline`, `description`, `isLimited`, `sortOrder`, `moodImage.src`, `.alt`, `.width`, `.height` |
| Its products | **`getProducts()`** filtered in memory to cards whose `collectionSlugs` include the slug, then `sortCards(cards, "featured")` (§2.1); or `getProductsByCollection(slug)` then `sortCards` (tech-agent's call: each is one cached read; `getProducts()` is shared by every collection page, the index and the shop) | the card fields (product-card §10), plus `collectionSlugs`, `inStock`, `sortOrder` |
| Strip and index tiles | `getCollections()` (cached; shared with the footer's "Our collections" read through React `cache`) | `slug`, `name`, `tagline`, `isLimited`, `sortOrder`, `moodImage.*` |
| Tile counts | `getProducts()`, counted per slug over `collectionSlugs` in one pass (`countByCollection(cards)`, pure) | `collectionSlugs` |
| Static params (M3.7) | `getCollectionSlugs()` | — |
| Flags | `site-routes.ts`: the `shop`, `collections` and `gift-sets` rows; `features["collection-pages"]`, `["product-pages"]`, `["quick-add"]` | `live` |

- **No N+1:** a collection page makes three cached reads (the collection, the products, the collections) whatever the strip shows; the index makes two. Counts never call a repository per collection.
- Drafts and archived products and collections never arrive (the repositories return published documents only).
- **The count and the grid agree by construction:** both are the published products whose `collectionSlugs` include the slug.
- Nothing reads `longDescription`, `scentNotes`, the gallery or variant details beyond `ProductCard`.
- **No new index** is needed for the `getProducts()` route (`products (status, sortOrder)` and `collections (status, sortOrder)` exist). If tech-agent prefers `getProductsByCollection`, it confirms that its query's index is in `firestore.indexes.json` (M1.6).

---

## 13. Implementation notes for tech-agent (M3.7)

### 13.1 What goes live

In M3.7, in `components/layout/site-routes.ts`: **`collections`** → `live: true`, **`gift-sets`** → `live: true`, and **`features["collection-pages"]`** → `live: true`. With no other change:

- **Header:** the Primary nav (lg+) and the drawer's Primary nav (below lg) gain **Collections** and **Gift sets** after Shop (header.md §3), with `aria-current` per §11 above. Update the header e2e expectations from M3.5 in the same task.
- **Footer:** Explore gains Collections and Gift sets; the **"Our collections"** group appears, from `getCollections()` without Gift Sets (footer.md §3.4).
- **Home** (if M2.3 has shipped): the collection cards become links and "See all collections" appears (home.md §4.5). If M3.7 lands before M2.3, M3.7 builds `CollectionCard` to home.md §4.3 / §4.5 itself, and M2.3 reuses it.
- Every link these add points at a route this task builds, so the M1.20 fixture sees no 404.

### 13.2 Routes, rendering and revalidation

- `app/(site)/collections/page.tsx` and `app/(site)/collections/[slug]/page.tsx`, Server Components with **static rendering**: no `searchParams`, cookies or headers. `generateStaticParams` from `getCollectionSlugs()`. No `export const revalidate`: the repositories use `revalidate: false` with the `collections` and `products` cache tags, so the pages inherit both, and M7's tag revalidation refreshes them (as home.md §14).
- `dynamicParams`: M3.7's call (the repositories note `dynamicParams = false` for the product page). The visible outcome in §6.2 is required either way, including for a slug unpublished after the build.
- **No `loading.tsx`** for these routes (nothing streams on a static page); no Suspense around the content.
- `generateMetadata` per §8, using layout-shell §10's not-found title pattern where the page can end in `notFound()`.
- A query string (`?utm_source=…`, `?fbclid=…`) on a collection URL changes nothing: the page doesn't read it.
- Static generation reads the repositories at build time, so the existing build preflight (CLAUDE.md: `.env.local` plus a running, seeded Firestore emulator) applies to these routes.

### 13.3 Components and CSS

- `Breadcrumb` in `components/layout/` (shared; M4 reuses it). `CollectionIntro`, `CollectionEmpty`, and the `CollectionGrid` variants in `components/catalog/` (or wherever M2.3 put `CollectionCard`; move it there if it is under `components/home/`, since three pages now use it). No new `@source` entry is needed (`components/` and `app/` are scanned).
- The hero image box: `aspect-ratio: 1 / 1` with `object-position: 50% 100%` below md; `3 / 4` with `50% 50%` from md (CSS, one `<Image fill>`).
- The hero band's top spacing override (24 / 32) and the normal bottom, with the collapse rule unchanged (§3.1). Mark it however the shell marks a hero override (tech-agent's call); it isn't flush-ending, so the products band collapses its top padding as usual.
- `sortCards` and the shop's canonical `shopQuery` (shop.md §18.2), called with a state holding only this collection, build the section link's `href`, so it is always canonical.
- Pure helpers, unit-tested: `otherCollections(collections, currentSlug, max)` (§3.7), `countByCollection(cards)` (§12), `countLinkLabel(n)` (§3.5: null at 0, "See the product", "See both products", "See all {n} products"), `collectionEyebrow(isLimited)`, and the metadata builders (§8).
- Starfield markup rules: no bare text nodes; no `pointer-events: none` on tiles, images or text (starfield.md §4.5).
- No GSAP, no client island of these pages' own, no new dependency.
- Screenshots: add **`/collections`**, **`/collections/moonlit-terrace`** and **`/collections/gift-sets`** to the `ROUTES` loop in `tests/e2e/screenshots.spec.ts` (no expected errors); the named shots are in §16 check 25.

---

## 14. Dev preview

The seed has no empty collection, no sold-out product and always six collections, so the empty states and sold-out ordering can't be seen on the real routes. Three **static** dev routes (no `searchParams`, so the existing build-time gate, `requireDevPages()` with `ENABLE_DEV_PAGES=true`, applies as for the other static dev pages), each inside `<SiteShell>` (layout-shell §13.2) and rendered with the real template components and synthetic data built in the page code from the repositories:

| Route | Renders | Checks it serves |
|---|---|---|
| `/dev/collection/sold-out` | the **Lakeside Hush** page with **Lakelight** set to every variant unavailable (`inStock: false`) | sold-out last: Still Water, Quiet Shore, Lakelight; the sold-out card state in the collection context |
| `/dev/collection/empty` | the **Moonlit Terrace** page with **no products** | §6.1: no count link, no section link, the empty block; the strip still shows |
| `/dev/collections/empty` | the index with **no collections** | §6.3 |

- Each starts with a dev banner (`<p>`, `type-caption`, text-muted, inside the first Container, above the breadcrumb or the heading block), so the page keeps one h1.
- `robots: noindex`. The synthetic data never leaves these pages. Their breadcrumb, strip and shop links point at the real routes, which the e2e build has (M3.7 builds them), so the M1.20 fixture sees no 404.

| Where | String |
|---|---|
| `/dev/collection/sold-out` banner | **Dev preview: the Lakeside Hush page with Lakelight sold out, for testing sold-out ordering. Not built for production.** |
| `/dev/collection/empty` banner | **Dev preview: a collection page with no published products. Not built for production.** |
| `/dev/collections/empty` banner | **Dev preview: the collections index with no published collections. Not built for production.** |
| Titles | **Collection preview: sold out · Starflames** · **Collection preview: empty · Starflames** · **Collections preview: empty · Starflames** |

---

## 15. IP guardrail

I re-read every string in §3.5, §6, §8, §10 and §14, the alt-text rules in §5.6 and the identifiers in §13 against CLAUDE.md:

- **New strings:** "Collection", "Limited collection", "See all {n} products", "See both products", "See the product", "In this collection", "Filter and sort in the shop", "Nothing in this collection just yet", "Please check back soon, or browse every candle in the shop.", "Keep exploring", "More kinds of night", "See all collections", "Scents of a place", "Our collections", the index intro ("Every collection begins with one place after dark: a stone terrace, a reading room, a pine wood, a still lake. Choose the one that feels like your kind of evening."), "Prefer to browse by scent, size or price?", "No collections to show just now", "Candle collection" in the titles, the meta descriptions and the dev banners and titles. They are ordinary shop words and generic atmosphere words (a place after dark, a stone terrace, a reading room, a pine wood, a still lake, an evening), in my own phrasing.
- **"More kinds of night"** extends the brand's own home heading ("Choose your kind of night", IP-checked in home.md §15). It is not a title, an epithet or a quote, and it names no group, place or court.
- **From the data, already checked** (catalog.md §7, art-direction.md §7–§8): the six collection names, taglines, descriptions and mood-image alts, and the product names.
- **Not used:** no character, place, court or book names; no author name; no quotes or close paraphrases; no invented terms (peoples, factions, magic systems, titles); no "Night Court", "Court of …" or "High Lord/Lady"; no "city of …" or "house of …" epithets; nothing about stars falling, star showers, wishing on stars or wings; "frost" is never paired with "starlight" (Comet Season's own description mentions frost and is unchanged data; nothing new here puts "starlight" next to it); no seasonal court names. The only glyphs are the brand's four-point star (the breadcrumb separator), the crescent moon (the empty states) and arrows.
- **No claims:** no hand-poured, small-batch, material or wellness claims; no restock promise.
- **Identifiers** (`collection-intro`, `collection-heading`, `collection-products`, `collection-products-heading`, `more-collections`, `more-collections-heading`, `collections-index-heading`, `data-collection`, `CollectionIntro`, `CollectionEmpty`, `CollectionGrid`, `Breadcrumb`, `otherCollections`, `countByCollection`, `countLinkLabel`, `collectionEyebrow`, `collectionExtras`, `afterProducts`, the dev routes) are generic English.

Confirmed clean.

---

## 16. E2E acceptance checklist (build review, M3.7)

On `mobile-390` and `desktop-1440` unless stated. Expected seed values come from §3.5–§3.7 and catalog.json; the tests read catalog.json (or the typed seed) for names, taglines and descriptions instead of repeating them. No check here has a wall-clock budget, so none is `@perf`.

1. **Routes.** `/collections` and each of the six `/collections/{slug}` return 200 with exactly one `<h1>` ("Our collections" / the collection's `name`). `/collections/no-such-collection` and `/collections/Ember-Grove` return **404** with a banner and a contentinfo, the h1 "We can't find that page" and the title "Page not found · Starflames". (Each 404 test sets `test.use({ expectedIssues: [...] })` with a pattern for that one URL only, as the existing 404 screenshot block does.)
2. **Metadata.** Each collection page's title is "{name} · Candle collection · Starflames", its description "{tagline} Shop the {name} collection at Starflames.", its canonical `/collections/{slug}`; no `noindex`; no `og:image`. The index: "Our collections · Starflames", §8.2's description, canonical `/collections`.
3. **Registry live.** At 1440 the header's Primary nav holds Shop, Collections, Gift sets; on `/collections` and `/collections/ember-grove` "Collections" has `aria-current="page"`; on `/collections/gift-sets` "Gift sets" has it and "Collections" doesn't. At 390 the drawer shows the same. The footer's Explore group has Collections and Gift sets, and its "Our collections" group lists Moonlit Terrace, Starlit Library, Ember Grove, Lakeside Hush, Comet Season (no Gift Sets), each linking to a page that returns 200. No 4xx/5xx and no console error (the M1.20 fixture) on any 200 page in these checks.
4. **Breadcrumb.** A `navigation` named "Breadcrumb" holds an `ol` of 3 items on a collection page (2 on the index); "Home" links to `/`, "Collections" to `/collections` (on collection pages); the last item is not a link and has `aria-current="page"`; the separators are `aria-hidden`; each link's box is at least 44px tall.
5. **Hero content.** Eyebrow "Limited collection" on `/collections/comet-season`, "Collection" on the other five; the tagline and description equal catalog.json's; the count link reads "See all 4 products" on Starlit Library and "See all 3 products" on the others, `href="#collection-products"`. Activating it scrolls `#collection-products`' heading to at or below the header's bottom edge, and the next Tab focuses "Filter and sort in the shop".
6. **Hero image.** One `<img>` in `#collection-intro` with `alt` equal to the collection's `moodImage.alt`, `loading="eager"`, `fetchpriority="high"`, and §9.2's `sizes` exactly. Its frame is 1:1 (±1px) at 390 and 3:4 (±1px) at 1440, its computed top-left and top-right radii equal half its width (±0.5px), and at 390 its box spans about y 140–490 (±4px). It is the only eager image on the page. The `largest-contentful-paint` entry's element is this `<img>` at 390 and 1440. No text box in `#collection-intro` overlaps the image box.
7. **First viewport at 390 × 664** (after `document.fonts.ready`): the h1's and the tagline's boxes end above y 664 on `/collections/ember-grove`.
8. **Product grid.** On each collection page the cards are in §3.6's order; each card heading is an `h3` inside `#collection-products`; 2 cards per row at 390 and up to 4 at 1440 (product-card §5.3 widths ±1px); every card `<img>` has product-card §5.3's `sizes` exactly and `loading="lazy"`, none has `fetchpriority`; at 390 every `.ProductCard-description` has computed `display: none`. While `product-pages` and `quick-add` are off, no `a` and no `button` inside the grid.
9. **Shop link.** "Filter and sort in the shop" has `href="/shop?collection={slug}"`; following it from `/collections/starlit-library` shows the shop's results heading "4 products" and one chip "Starlit Library".
10. **Strip.** On each page the strip's tiles are §3.7's table row, in order, each a link (its accessible name is the collection name alone) to `/collections/{slug}`; the Comet Season tile shows the "Limited" badge; each tile shows its count line ("3 products", "4 products" for Starlit Library); the tile names are `h3`; the strip's images have §9.4's strip `sizes` and are lazy; "See all collections" links to `/collections`. 4 tiles per row at 1440, 2 at 390.
11. **Index.** Six tiles in `sortOrder`, names as `h2`, counts as §4.3 (Starlit Library "4 products", the others "3 products"), the Limited badge on Comet Season, §9.4's index `sizes`; tiles 1–3 `loading="eager"`, tile 1 `fetchpriority="high"`, tiles 4–6 lazy; 2 per row at 390, 3 at 1440 (tile width 405.3 ±1px); the closing line's "Shop all candles" links to `/shop`.
12. **Empty collection** (`/dev/collection/empty`): no count link, no "Filter and sort in the shop"; the h2 "In this collection", then no grid `ul` in `#collection-products` and the h3 "Nothing in this collection just yet", its body and "Shop all candles" (`href="/shop"`); the strip shows Moonlit Terrace's four neighbours.
13. **Sold-out order** (`/dev/collection/sold-out`): the cards are Still Water, Quiet Shore, Lakelight, and Lakelight shows the "Sold out" badge (product-card check 7's state).
14. **Empty index** (`/dev/collections/empty`): the h1 and intro stay; no tile list; the h2 "No collections to show just now", its body and one "Shop all candles" link (no closing line).
15. **Keyboard order** (1440, `/collections/ember-grove`): Tab from the end of the header reaches, in order: Home → Collections → "See all 3 products" → "Filter and sort in the shop" → "See all collections" → the 4 strip tiles → the footer's first link. On `/collections`: Home → the 6 tiles → "Shop all candles" → the footer.
16. **Focus ring.** A focused strip tile's link has `outline-style: none` on itself and a 2px solid gold-300 outline with a 2px offset on its `::after`, whose box encloses the whole tile (home.md §4.5).
17. **Hover** (`desktop-1440`). Hovering a strip tile's link: after the transition, its image's computed transform is `matrix(1.03, 0, 0, 1.03, 0, 0)` and the tile's and frame's boxes are unchanged. Hovering the hero image changes nothing.
18. **Motion** (`@motion`). After load on both routes, no element in `main` has an inline `opacity` or `transform` style, and `document.getAnimations()` holds no animation on an element in `main` (no reveals). Under reduced motion (the `-reduced-motion` projects), hovering a tile link leaves its image's transform at identity, and the name is still underlined.
19. **No JavaScript** (`javaScriptEnabled: false`): every element in checks 4–11 is in the server HTML; the breadcrumb, tile, strip, shop and count links all work (the count link lands on `#collection-products`).
20. **CLS.** CLS < 0.05 on `/collections`, `/collections/ember-grove` and `/collections/gift-sets` at 390 and 1440 across load, scroll to the footer and a tile hover; no layout-shift entry is attributed to the hero, the grid or the tiles.
21. **Reflow.** At 320px wide on `/collections/moonlit-terrace` and `/collections`: no horizontal scroll; the h1 is one line; no name is truncated (`scrollWidth <= clientWidth`).
22. **Contrast spot checks.** The computed colours of the breadcrumb (links, current item), eyebrows, h1, h2s, tagline, description, count link, section links, tile names, taglines and counts, the Limited badge and the empty blocks match the tokens in §5.7.
23. **Drafts never shown** (product-card check 10, now on these routes): no "(draft fixture)" or "(archived fixture)" text and no `data-slug` of `fixture-draft-tin` or `fixture-archived-bestseller` on any collection page or the index, and every count equals the published-only counts in §3.5.
24. **Gift sets hook.** `/collections/gift-sets` has `#collection-intro[data-collection="gift-sets"]`, the same bands as every other collection page (hero, products, strip, in that order) and nothing between the products band and the strip.
25. **Screenshots.** `collections-<project>.png`, `collections-moonlit-terrace-<project>.png` and `collections-gift-sets-<project>.png` (the `ROUTES` loop, under the names `routeSlug` gives them), plus named shots: `collection-hero` (`/collections/ember-grove`, `fullPage: false`, 390 and 1440), `collection-comet-season` (full page), `dev-collection-empty`, `dev-collection-sold-out`, `dev-collections-empty` (full page). Compared with §3.4, §3.7, §4 and §6.

Unit tests (`npm run test:unit`): `otherCollections` (each row of §3.7's table; wrap-around; fewer than 4 others; the current slug missing; a single collection → empty), `countByCollection` (primary and `alsoIn` both counted; the seed counts), `countLinkLabel` (0 → none, 1, 2, 3, 4), `collectionEyebrow` (limited or not), and the metadata builders (the six seed titles and descriptions, and the lengths in §8.1).

---

## 17. Open questions (each with the default in force)

1. **No filters or sort on collection pages**, with a "Filter and sort in the shop" link to `/shop?collection={slug}` (§2.1). `[confirm with user]` Default: as written.
2. **Image first on phones** (the arched window above the name at 390, §2.3). `[confirm with user]` Default: image first; the alternative is text first with the window below, which puts half the window below the fold.
3. **The strip shows the next 4 collections in order, wrapping round** (§3.7), rather than all five others or a curated pick. Default: as written. D4.3 (collection curation in admin) may add a curated "related collections" field later.
4. **No pagination up to 48 products per collection** (§2.2). `[revisit when a collection passes 48 products]` Default: one grid.
5. **`og:image` per collection:** recommended for M8.5 / M8.6 to use the collection's mood image (its 3:4 shape suits Pinterest pins, where many visitors come from), with an absolute URL once the domain exists. `[M8.5 confirms]` Default: no `og:image` until then (§8.1).
6. **The index shows 3 arches per row at xl** (405px), while home keeps its single row of 6 (§4.4). Default: as written.
7. **An empty published collection is still listed** on the index, in the strip and in the footer, with its count line omitted and its page showing §6.1 (§4.4). The alternative is hiding collections with no published product, as the shop's facet does. Default: listed, matching footer.md §3.4.
8. **Gift Sets' eyebrow reads "Collection"** like the others until M8.3 (§3.5, §11). `[M8.3 may change it]` Default: as written.
