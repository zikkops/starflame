# Shop page (M3.3)

Status: spec, **QA PASS** (fix round 1), with the post-pass minors applied (changelog below). Owner: design-agent. Query design by tech-agent in M3.4; built by tech-agent in M3.5.

Route: **`/shop`** (registry key `shop`, footer.md §3.2.1; `components/layout/site-routes.ts`). The header's and footer's Shop links go live in the same task that builds the page (M3.5, §18.1).

Builds on [`product-card.md`](../components/product-card.md) (the `shop` context: grid 2 / 3 / 3 / 4, `sizes`, the description rule, the `product-pages` and `quick-add` flags, `imageLoading`), [`layout-shell.md`](../components/layout-shell.md) (§2 landmarks and overlays, §3.4 `--scroll-offset`, §4 Container and Grid, §5 bands and spacing, §6.3 sticky bars under the header, §6.5 short viewports, §10 states), [`header.md`](../components/header.md) (§3 the registry rule, §5 the top-layer `<dialog>` pattern this sheet reuses, §6.1 `badge-count`, §7 current page, §13.4 invoker commands), [`footer.md`](../components/footer.md) (§3.2 the registry and `features` map), [`starfield.md`](../components/starfield.md) (§3.2 the 0.14 cap and its composite `#2D303F`, §4.5 markup rules), [`home.md`](./home.md) (§2 band conventions, §5.3 the section link to `/shop`, §12 metadata format), [`tokens.md`](../system/tokens.md) (§2.3 roles, §2.5 rules 1, 3, 7, 9, §3 contrast, §5 radii, §7 focus, §8 layers and the top layer, §9 touch targets, §9.1 the page-inline variables), [`typography.md`](../system/typography.md), [`motion.md`](../system/motion.md) (§2, §5 drawer pattern, §6), [`accessibility.md`](../system/accessibility.md), [`catalog.md`](../copy/catalog.md) / [`catalog.json`](../copy/catalog.json) (the facet values) and `lib/types/catalog.ts` (`ProductCard`, `SCENT_FAMILIES`, `PRODUCT_TYPES`) plus `lib/domain/derive-product.ts` (`sizeKeyOf`). The query plan it relies on is `design/tech/M1.4-data-models.md` §1 "M3 query plan". Nothing here loosens those files.

## Changelog

**Post-pass minors** (2026-10-10, after QA PASS). Only this file changes. No visitor-facing string changes.

1. §9.1, §3.1, §3.3, §4.1, check 20: the toolbar's minimum height is the **constant `3.75rem`**, no longer `var(--shop-toolbar-h)`. Before, the toolbar read the variable that its own ResizeObserver wrote, so it could grow but never shrink back. Also, `getComputedStyle` returns the declared `"3.75rem"`, not a resolved length, so the old comparison against "the variable's resolved value" couldn't work. Now the observer measures the toolbar's border box, compares the result with **the last value it wrote** (it never reads the variable back), and writes `--shop-toolbar-h` in px on the band. Only the scroll margins read that variable. Check 20 now covers the toolbar growing and then shrinking back.
2. §11.2, §18.2: the build no longer assumes that a search-param change remounts the page. In Next 16.4 the page segment's key is `"__PAGE__"` and the search is held separately, so the subtree is probably re-rendered, not remounted. The build now relies on neither. Focus moves run after the commit, on elements found at that point. URL-derived island state re-syncs from props or the URL. The sort-coalescing timestamp and the 500ms announcement timer live where a remount can't reset them (layout level or module scope).
3. Check 23: the "no `<!--$?-->`" assertion now covers only the results section and the heading block, because Next's own `<Suspense name="Next.MetadataOutlet">` (streamed metadata for non-bot user agents) may leave a pending marker elsewhere in `main`.
4. Checks 6 and 10: the wall-clock budgets (the 100ms button update, and the 100ms / 1000ms / 1.5s sort coalescing) move into new **`@perf`** sub-checks **6b** and **10b**, which run in the serial pass (CLAUDE.md). The functional assertions stay in checks 6 and 10.
5. Check 24: M3.4's provoked in-page failure gets its own `test.describe` with a narrow `test.use({ expectedIssues: [...] })`, which matches only the provoked request and its console line. The `tests/e2e/fixtures.ts` auto fixture would otherwise fail the test on the 5xx and the console error.
6. §3.2: quotes layout-shell §2.1 as now committed ("never paint inside `<main>`'s stacking context") and drops the hand-off sentence.

**Fix round 1: QA issues 1–17** (2026-10-10). Only this file changes.

1. [blocking] §11.2 rewritten: **no `loading.tsx` for `/shop`** and no Suspense boundary around its content, so a document request never streams a fallback and in-page changes never show one. `ShopSkeleton`, `/dev/shop/loading`, its copy, its screenshot and the "Loading products" announcement are **dropped**. §1 criterion 8, §2.4, §3.3, §13.5, §13.6, §14.4, §17, §18.2, §18.3 and §19 follow; check 23 is now "no streamed fallback"; check 28 loses `dev-shop-loading`.
2. [blocking] One history model (§8.6, §7.4): **opening the sheet pushes no history entry.** Back while it is open is a normal Back (the sheet closes and the previous URL's state applies, or the visitor leaves `/shop`); Android's system Back on a modal dialog is a close request and closes it like Esc, URL unchanged. Check 12 rewritten per case.
3. §12: the sheet's **exit** transition is declared only under `@supports (overlay: auto)`. Elsewhere (Safari, Firefox) the sheet closes instantly, so it never slides under the sticky toolbar and header inside `main`'s stacking context. The enter still animates everywhere. Check 21 extended.
4. §8.2: the inline padding uses `var(--page-inline-start)` / `var(--page-inline-end)` below md and `1.5rem` / `max(1.5rem, var(--page-inline-end))` from md; the md+ head adds `env(safe-area-inset-top)`, as header.md §5.6.
5. §13.3: the scroll margin also covers `[id^="result-"]`, so the no-JS Show more fragment lands below the toolbar. Check 19 extended.
6. §8.5: "Show 0 products" is reachable by unchecking within a facet, not only from a zero-results URL; Apply at 0 stays enabled and leads to §11.3.
7. §9.3, §7.4: sort-select changes within 1s of the previous one **replace** instead of push; the announcement is debounced to the last change. Check 10 extended.
8. §9.1, §9.4, §13.3: the toolbar height is a rem variable, `--shop-toolbar-h` (3.75rem), kept equal to the measured height by the toolbar island; the scroll margin is derived from it. *(Post-pass minor 1 refines this: the toolbar's own minimum is the constant 3.75rem, and only the scroll margins read the variable.)*
9. §9.1: the stuck observer measures `--scroll-offset` through a probe element and is recreated when the probe resizes. Check 20 extended.
10. §7.3: unknown query keys (`utm_*`, `fbclid`, anything else) are **kept** by the canonicalising `replaceState`; new open question §22.9. Check 11 updated.
11. §5.6, §14.3: the bucket labels use a **whole-unit** USD formatter ("$25", never "$25.00").
12. §15: robots is `noindex, follow` only when the **parsed state differs from the default**. Check 1 updated.
13. Check 23 (the skeleton h1 comparison) is gone with the skeleton (issue 1), so the dev banner offset no longer matters.
14. §5.1, §5.5, §7.1, §7.3: one rule for every facet: an option exists only if at least one published product carries it; a published collection with no published product has no option, and its slug in a URL is ignored.
15. §11.5, §18.2: an in-page change must never render `error.tsx`; M3.4 chooses and records the mechanism (options listed).
16. §8.2: the sheet is a **flex column** with `min-block-size: 0` on the scrolling body, as the header drawer.
17. §19: the dev shop route's gate is fixed **at build time** (tech's mechanism), so CLAUDE.md's "built only when `ENABLE_DEV_PAGES=true`" stays true.
- §22.1 now also lists optional type links at lg+ as a possible addition (not built).

---

## 1. Purpose and acceptance criteria

Purpose: one calm page that shows every candle on solid cards, and lets a phone visitor narrow seventeen (later about two hundred) products to the few that suit them in two or three taps, with a thumb-sized "Show 3 products" button, a link they can share, and a Back button that does what they expect. Products stay the focus: the filters live in one sheet, out of the way, at every width.

Acceptance criteria (TASKS.md M3.3 and the orchestrator's task, refined):

1. **Filters** for scent family, type, size, collection and price, derived from the 17 products' real fields, with option counts (§5). Any facet the data lacks is flagged for tech-agent (§5.7: none is missing; two notes).
2. **Sort** with a stated default (§6).
3. **URL params contract**: shareable, canonical, Back and Forward restore state, invalid values handled (§7).
4. **Result count, applied-filter chips, clear-all** (§9).
5. **Pagination or load more**, chosen and justified, scaling past 17 (§10).
6. **Mobile filter sheet**: focus containment, Esc, focus return, scroll lock, Reset and Apply, a live result count (§8).
7. **Desktop layout** (§2.1 decision, §4).
8. **States**: default, hover, focus-visible, active, disabled, loading, pending, zero results, empty catalog, error, success (§11). Refined in fix round 1: the loading state is **no skeleton and no streamed fallback** (§11.2), because a route-level skeleton on a `searchParams` page streams before the results and breaks the no-flash, no-JS and in-page requirements. There is no CLS from loading because nothing is swapped.
9. **Motion** with the exact reduced-motion fallback; transform and opacity only; no layout shift (§12).
10. **Accessibility**: heading order, landmarks, fieldset/legend, `aria-live` counts, keyboard order, focus, contrast pairs with ratios (§13).
11. **Copy**: heading, intro, metadata, every label, empty and error copy, all final (§14, §15).
12. **Data needs** (§16), **images** (§17), **implementation notes** (§18), a **dev preview** (§19) and a **§-numbered e2e checklist** (§20).

---

## 2. Decisions

### 2.1 Filters in a sheet at every breakpoint, not a desktop sidebar (decision)

A toolbar above the grid holds a **Filters** button that opens one **filter sheet** (a top-layer `<dialog>`): a bottom sheet below md, an end-side drawer from md up. The grid keeps the full content width at every breakpoint.

- **Why not a sidebar at lg+.** A sidebar takes 3 of 12 columns. At lg the grid would drop from 3 cards of 298.7px to 3 cards of 218px (the md card), and product-card.md §5.3's columns and `sizes` would have to be re-derived. It would also put about 26 checkboxes (6 + 5 + 6 + 6 + 3 options) in the tab order before the first product, need a second copy of every control for the phone sheet (two forms, two sets of ids, two places to keep in sync) and give two different interaction models (instant on desktop, staged on phone).
- **Why not a bar of dropdowns.** Five popover panels with disclosure state, Esc handling, outside-click and focus return are fragile on touch and with a keyboard, for the same reasons header.md §7.4 rejects a Collections dropdown.
- **What the sheet gives.** One form, one set of controls, one interaction model on every device: pick options, watch the live count, press "Show 3 products". Phone visitors from Instagram and Pinterest get the button in thumb reach; desktop visitors get a drawer from the same edge as the menu drawer. The grid stays wide and calm, with the products as the focus. product-card.md §5.3 applies **unchanged** (it records this decision).
- Sort is a visible `<select>` in the toolbar from md up. Below md there is no room for both controls on one line at 320–390px (the button with its badge is about 210px, and a labelled select with "Price: high to low" about 240px), so sort moves into the sheet as a radio group, and the button there reads "Filter and sort" (§4.2, §8.3).

### 2.2 Staged changes, applied together (decision)

Inside the sheet, choices are **staged**: nothing changes on the page until the visitor presses **Show {n} products**. While they choose, every option's count and the button's number update at once (§8.5). Closing the sheet any other way (Close, Esc, the scrim, Back) **discards** the staged changes. Why: on a phone, re-rendering the grid behind the sheet after every tap is invisible work that costs battery and announcements; one apply gives one history entry and one announcement.

Everything outside the sheet applies at once: the sort select (md+), removing a chip, Clear all, Show more.

### 2.3 Show more, not numbered pages and not infinite scroll (decision)

The grid shows **24 products**, then a **Show more products** link adds the next 24 below. 24 fills whole rows at every breakpoint (2, 3, 3 and 4 per row: 12, 8, 8 and 6 rows). The 17-product seed is one page, so the control doesn't render today; the dev preview tests it (§19).

- **Why not numbered pages:** a phone visitor who taps "2" lands at the top of a new grid and loses their place; the page numbers are small targets; and "page 3 of 9" says little to a shopper browsing scents.
- **Why not infinite scroll:** the footer becomes unreachable (it holds every link a no-JS visitor needs, footer.md §1), keyboard and screen-reader users lose their position, and nothing marks the end of the catalog.
- **Shareable and Back-safe:** the URL carries `page` (§7). `?page=2` means "the first 48 results", so a refresh, a shared link or Back from a product page (M4) shows the same cards. Show more **replaces** the history entry instead of pushing one, so Back leaves the shop (or returns to the previous filter state) rather than un-loading cards one step at a time.
- **No JS:** Show more is a real link to `?page={next}#result-{first new}`, so it works without JavaScript and lands on the first new card.

### 2.4 Server-rendered results for every URL (requirement for M3.4)

A direct load of any `/shop?…` URL (a shared Pinterest link, a refresh, Back from another site) renders the **filtered, sorted results in the server HTML**: no flash of the full catalog, no client-only filtering on first paint, no streamed fallback before the results (§11.2), no layout shift. M3.4 designs the mechanism (the expected one is M1.4's plan: one cached `getProducts()` read, filtered, sorted and sliced in memory on the server from `searchParams`; §18.2).

---

## 3. Page structure

### 3.1 Bands

| # | Content | Band (layout-shell §5.2) | Element |
|---|---|---|---|
| 1 | Page heading, toolbar, count, chips, grid, Show more | **`plain`** (one band for the whole page) | `<div data-band="plain">` |
| — | Footer | its own bg-sunken | `<footer>` |

- **Why one `plain` band:** the filters live in the sheet, so the page itself holds only a toolbar, chips and a product grid, which layout-shell §5.2 allows on `plain` (product grids: yes; form controls: yes). The stars show around the heading and between cards; the cards sit on bg-raised (tokens.md §2.5 rule 3). There is **no haze band** on this page (nothing is ever behind a product grid).
- Spacing: the band's `padding-block` is `--section-y` (64 / 80 / 96 / 128px); it is the last band before the footer, so it keeps its bottom padding (layout-shell §5.1).
- All text sits inside the Container and inside elements, never bare text nodes (starfield.md §3.1, §4.5), so the 0.14 cap applies behind it.
- The band element also carries the page's `--shop-toolbar-h` variable (§9.1): the toolbar island writes it, and only the results' scroll margins read it.

### 3.2 DOM

```
<main id="main">
  <div data-band="plain" class="ShopBand">                                    carries --shop-toolbar-h (§9.1)
    <div class="Container">
      <div class="ShopHeading">
        <hgroup>
          <p class="type-eyebrow">Every scent, every size</p>                  text-accent gold-400
          <h1 id="shop-heading" class="type-h1">Shop all candles</h1>          text-primary, text-wrap: balance
        </hgroup>
        <p class="type-body max-w-measure-intro">Jars, pillars, …</p>          text-secondary, text-wrap: pretty
      </div>
    </div>

    <span data-toolbar-sentinel aria-hidden="true"></span>                    1px, for the stuck state (§9.1)
    <div class="ShopToolbar" data-shop-toolbar data-stuck="false"
         data-print="hide">                                                    full-bleed, sticky (§9.1)
      <span data-scroll-offset-probe aria-hidden="true"></span>               absolute, invisible (§9.1)
      <div class="Container ShopToolbar-row">
        <button class="FilterButton" type="button" aria-haspopup="dialog"
                aria-controls="shop-filters" aria-expanded="false"
                command="show-modal" commandfor="shop-filters">…</button>      §9.2
        <form class="SortForm" method="get" action="/shop">                    md+ only (§9.3)
          <label for="shop-sort">Sort by</label> <select id="shop-sort" name="sort">…</select>
          [hidden inputs: the applied filters]  [<button type="submit">Apply</button>: no-JS only]
        </form>
      </div>
    </div>

    <div class="Container">
      <section class="ShopResults" aria-labelledby="results-heading" [aria-busy]>
        <h2 id="results-heading" class="type-body-sm" tabindex="-1">17 products</h2>      §9.4
        <div class="AppliedFilters" data-print="hide">                         only with ≥ 1 filter (§9.5)
          <ul aria-label="Applied filters">
            <li><a href="/shop?…">Travel tins<span class="sr-only">, remove filter</span> [×]</a></li> …
          </ul>
          <a class="ClearAll" href="/shop?…">Clear all filters</a>
        </div>
        <ul class="ShopGrid">                                                  product-card.md §5.3
          <li id="result-1"> <ProductCard context="shop" headingLevel={3} … /> </li> …
        </ul>
        [ShopEmpty: zero results (§11.3), instead of the grid]
        <div class="ShowMore" data-print="hide">                               only when more results exist (§10)
          <p>Showing 24 of 51 products</p>
          <a href="/shop?page=2#result-25">Show more products</a>
        </div>
      </section>
      <p role="status" class="sr-only" data-shop-status></p>                   page-level polite region, empty in the HTML
    </div>
  </div>

  <dialog id="shop-filters" aria-labelledby="shop-filters-title">             top layer when open (§8)
    <form method="get" action="/shop"> … </form>
  </dialog>
</main>
```

- **The `<dialog>` sits inside `main`'s markup but paints in the top layer** when open (`showModal()`), above every stacking context, including the header's. While closed it is `display: none`, so its controls are not in the accessibility tree. It is server-rendered (not portalled) so that its invoker command works without JS (§8.7). layout-shell §2.1 now reads: "**Overlays never paint inside `<main>`'s stacking context.** … Drawers, sheets, the mobile menu and modals either use `<dialog>.showModal()` (top layer, tokens.md §8; the `<dialog>` element may then sit anywhere in the DOM, including inside `main`, because the top layer paints above every stacking context, e.g. the shop filter sheet, shop.md §3.2) or render in the overlay slot." The one moment the dialog is *not* in the top layer is a non-`overlay` browser's exit, which is why that exit is instant (§12).
- The chips and Clear all are **links in the server HTML and stay links after hydration** (JS intercepts their clicks); the element never changes type, so there is no hydration mismatch (§9.5).
- No `<Suspense>` boundary wraps any of this (§11.2).
- DOM order is visual order at every breakpoint.

### 3.3 Components used

| Component | Spec | Props / variant here |
|---|---|---|
| `ProductCard` | [product-card.md](../components/product-card.md) | `context="shop"`, `headingLevel={3}`, `linked={features["product-pages"].live}` (false until M4.3), `quickAdd={features["quick-add"].live}` (false until M5.4), `imageLoading="eager"` for results 1–4 and `"lazy"` after, plus `fetchPriority="high"` on result 1 only (§17; product-card §11 anticipates it; the prop name is tech-agent's) |
| `Container`, band, Grid spans | [layout-shell.md](../components/layout-shell.md) §4, §5 | one `plain` band; the grid's own recipe is product-card §5.3 |
| Header, footer, registry | [header.md](../components/header.md), [footer.md](../components/footer.md) | the `shop` row goes `live` (§18.1) |
| Starfield | [starfield.md](../components/starfield.md) | unchanged; the plain band shows it |
| `ShopToolbar` | this spec §9.1 | sticky; `data-stuck`; writes `--shop-toolbar-h` |
| `FilterButton` | §9.2 | `appliedCount` (0–n), label per breakpoint |
| `SortSelect` | §9.3 | `value` (`featured` default) |
| `ResultsHeading` | §9.4 | `total` |
| `AppliedFilters` (chips + Clear all) | §9.5 | `chips: { facet, value, label, href }[]`, `clearHref` |
| `ShopGrid` | product-card §5.3 | `cards`, `firstIndex` |
| `ShowMore` | §10 | `shown`, `total`, `nextHref` |
| `FilterSheet` | §8 | `facets`, `state` (from the URL), `facetIndex` (§18.2) |
| `FacetFieldset`, `FacetCheckbox`, `SortRadio` | §8.4 | `legend`, `options: { value, label, count, checked, disabled }[]` |
| `ShopEmpty` (zero results, empty catalog) | §11.3, §11.4 | `variant: "zero" \| "catalog"` |
| `ShopError` | §11.5 | — |

These shop components live in `components/shop/` (tech-agent's names). They are local to this page; M3.6's collection pages may reuse `ShopGrid` and `ShowMore`, not the filters. There is no skeleton component (§11.2).

---

## 4. Layout per breakpoint

### 4.1 Vertical rhythm (all breakpoints)

| Between | Space | Step |
|---|---|---|
| Header → band content | `--section-y` (band padding) | — |
| Eyebrow → h1 | 12px | 3 |
| h1 → intro | 16px | 4 |
| Intro → toolbar | 32px | 8 |
| Toolbar | at least **3.75rem** (60px): 44px controls + 8px above and below; `--shop-toolbar-h` carries its measured height (§9.1) | 2 |
| Toolbar → results heading | 16px | 4 |
| Results heading → chips row | 12px | 3 |
| Chips row (or heading, when no chips) → grid | 24px | 6 |
| Grid → Show more block | 48px | 12 |
| Progress line → Show more link | 12px | 3 |
| Last block → footer | `--section-y` (band padding) | — |

The page heading block is not the section-heading pattern (it holds the page's h1, not a section h2), but it uses the same eyebrow, heading and intro spacing (layout-shell §5.3, typography.md §4 notes).

### 4.2 Per breakpoint

| | base (390; holds from 320) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Heading block | eyebrow, h1 (`type-h1` 34px, 1 line), intro (3 lines at 350px) | intro 2–3 lines (`max-w-measure-intro`) | same | intro 2–3 lines at 45ch (about 486px) |
| Toolbar, start | **Filter and sort** button | **Filters** button | same | same |
| Toolbar, end | — (sort is in the sheet) | **Sort by** label + select | same | same |
| Results heading | its own line, below the toolbar | same | same | same |
| Chips | a wrapping row; Clear all as the last item | same | same | same |
| Grid | product-card §5.3: **2 per row**, gap 16 / 32, card 167 | **3 per row**, gap 24 / 40, card 218.7 | **3 per row**, gap 24 / 48, card 298.7 | **4 per row**, gap 32 / 48, card 296 |
| Show more | progress line, then a full-width ghost link button | centred, auto width (min 16rem) | same | same |
| Filter sheet | **bottom sheet**, full width (§8.2) | **end drawer**, `min(26rem, 100% − 3rem)` | same | same |

### 4.3 First viewport

The first row of cards is in view at the Playwright sizes, so their images are the likely LCP candidates and load eagerly (§17).

- **390 × 664** (no chips): header 64 + band 64 + eyebrow 16.9 + 12 + h1 37.4 + 16 + intro 79.2 (3 × 26.4) + 32 + toolbar 60 + 16 + heading 21 + 24 → the grid starts at **≈ 442px**; the first two card images span **≈ 455–634px**, inside the 664px viewport.
- **1440 × 900** (no chips): header 80 + band 128 + eyebrow 18.2 + 12 + h1 57.2 + 16 + intro 89.1 (3 × 29.7, the longer case) + 32 + toolbar 60 + 16 + heading 22.5 + 24 → the grid starts at **≈ 555px**; the first four images span **≈ 572–902px**: all but their bottom 2px are in the 900px viewport (with a 2-line intro, all of them).
- With chips, the grid moves down by 12 + 44px per chip row. That is the visitor's own choice, after load.
- Line counts use the 0.51em Jost estimate (home.md §4.4) and are guidance only.

### 4.4 Diagrams

```
390 (base)
+------------------------------------------+ 0
| HEADER 64                                |
+------------------------------------------+ 64
|  64 (band padding, stars behind)         |
|  EVERY SCENT, EVERY SIZE                 |  eyebrow, gold-400
|  Shop all candles                        |  h1, 34px
|  Jars, pillars, travel tins, wax melts   |  intro, body 16px, 3 lines
|  and gift sets. Filter by scent, size or |
|  collection to find your kind of night.  |
|  32                                      |
|==========================================|  toolbar, sticky under the header (60)
| [≡ Filter and sort  2]                   |  ghost pill + badge-count
|==========================================|
|  17 products                             |  results h2, body-sm, text-secondary
|  [Travel tins ×] [Citrus ×] Clear all    |  chips (only with filters)
|  +-----------+  +-----------+            |
|  |  arch     |16|  arch     |            |  2 per row, card 167
|  |  4:5      |  |  4:5      |            |
|  | name      |  | name      |            |
|  | hint      |  | hint      |            |
|  | price     |  | price     |            |
|  +-----------+  +-----------+            |
|  … 32 row gap …                          |
|  Showing 24 of 51 products               |  only when more exist
|  [ Show more products ............. ]    |
|  64                                      |
+------------------------------------------+
| FOOTER                                   |
```

```
1440 (xl)
| 80 |<----------------------------- 1280 ----------------------------->| 80 |
|    EVERY SCENT, EVERY SIZE                                               |
|    Shop all candles                                    (h1, 52px)        |
|    Jars, pillars, travel tins, wax melts and gift sets. Filter by …     |
|============================================================================|
|    [≡ Filters 2]                                   Sort by [Featured  v] |  toolbar 60
|============================================================================|
|    17 products                                                           |
|    [Travel tins ×] [Citrus ×]  Clear all filters                         |
|    +--------+ 32 +--------+ 32 +--------+ 32 +--------+                  |
|    | 296    |    |        |    |        |    |        |   4 per row      |
|    +--------+    +--------+    +--------+    +--------+                  |
```

---

## 5. Filters (facets)

### 5.1 Logic

- **OR within a facet, AND across facets** (M1.4 query plan). "Floral" + "Citrus" shows products that are floral or citrus; adding "Travel tins" keeps only the tins among them.
- **Option counts** (shown after each label, "(3)"): the number of products that match **every other facet's current selection and this option**. So a facet's own counts don't collapse when one of its options is chosen, and every count says what checking that option would show within the other filters.
- **Zero counts:** an unchecked option whose count is 0 is **`disabled`** (native), shown with its "(0)" in text-disabled, so a visitor can't walk into an empty result by *checking* an option. A checked option is never disabled, so it can always be unchecked. Zero results can still arrive through a URL (an old or shared link) or by unchecking (§8.5), which is what the zero-results state (§11.3) is for.
- **Options come from the data, not a fixed list; one rule for every facet:** an option exists only if **at least one published product carries it** (counted with no other filters), and, for a collection, only if the collection is also published (§5.5). That applies to scent families, types, labelled sizes, collections and price buckets alike. A new collection or a new size key appears with no code change (sizes need a label, §5.4); a collection or bucket that no published product reaches has no option. **The option set is also the set of valid URL values** for that facet (§7.3).
- **Option order:** each facet's display order below. The same order is used for chips and for the URL (§7).
- **Sold-out products** match filters like any other product (the card shows its sold-out state, product-card §6) and sort after every in-stock product (§6).

### 5.2 Scent family

| URL value (`SCENT_FAMILIES`) | Label (catalog.json `scentFamilies[].label`) | Seed count | Seed products |
|---|---|---|---|
| `floral` | Floral | 3 | Moonrise, Late Bloom, Little Constellation Set |
| `fresh` | Fresh | 3 | Midnight Balcony, Still Water, Lakelight |
| `citrus` | Citrus | 3 | Margin Notes, Quiet Shore, Little Constellation Set |
| `woody` | Woody | 4 | Ink & Cedar, Lantern Path, Fir Hollow, Reading Nook Set |
| `gourmand` | Gourmand | 4 | Last Chapter, Gilded Plum, Reading Nook Set, Comet Season Gift Box |
| `smoky-amber` | Smoky & amber | 3 | Moss & Ember, Comet Tail, Comet Season Gift Box |

Matches on `scentFamilies`. Gift sets carry the union of their contents' families (`deriveProductFields`), so a scent filter finds them too.

### 5.3 Type

| URL value (`PRODUCT_TYPES`) | Label (plural; new shop copy) | Seed count |
|---|---|---|
| `jar` | Scented jars | 7 |
| `pillar` | Pillar candles | 2 |
| `tin` | Travel tins | 3 |
| `wax-melt` | Wax melts | 2 |
| `gift-set` | Gift sets | 3 |

### 5.4 Size

| URL value (`sizeKeys`, `sizeKeyOf`) | Label (new shop copy) | Seed count | Seed products |
|---|---|---|---|
| `120g` | 120 g | 3 | the three travel tins |
| `220g` | 220 g | 7 | the six two-size jars and Comet Tail |
| `380g` | 380 g | 6 | the six two-size jars |
| `7x10` | 7 × 10 cm | 2 | Lantern Path, Lakelight |
| `7x15` | 7 × 15 cm | 2 | Lantern Path, Lakelight |
| `6-cubes` | 6 cubes | 2 | Fir Hollow, Gilded Plum |
| `set` | **not shown** | — | the three gift sets |

- **The `set` key is not a size option.** A gift set holds several sizes, so "Set" isn't a size a shopper picks; "Gift sets" is in the Type facet. Choosing any size therefore leaves gift sets out of the results (they match no shown size). That is the honest reading of "a 220 g candle".
- Sizes are type-agnostic keys (a future 220 g tin shares `220g` with the jars), so the labels name only the size.
- The labels are a map in the shop's copy module (`sizeLabels`, tech-agent's location), in the order above. **A key with no label is not shown** (and a unit test fails on any seed key other than `set` without a label), so a new size needs one new label, never a code change elsewhere.
- Lining figures; "×" is U+00D7 with a space each side, as in the variant labels.

### 5.5 Collection

| URL value (collection slug) | Label (collection `name`) | Seed count | Seed products |
|---|---|---|---|
| `moonlit-terrace` | Moonlit Terrace | 3 | Moonrise, Midnight Balcony, Late Bloom |
| `starlit-library` | Starlit Library | 4 | Ink & Cedar, Last Chapter, Margin Notes, Reading Nook Set (also in) |
| `ember-grove` | Ember Grove | 3 | Lantern Path, Moss & Ember, Fir Hollow |
| `lakeside-hush` | Lakeside Hush | 3 | Still Water, Lakelight, Quiet Shore |
| `comet-season` | Comet Season | 3 | Gilded Plum, Comet Tail, Comet Season Gift Box (also in) |
| `gift-sets` | Gift Sets | 3 | the three gift sets |

- Matches on `collectionSlugs` (primary collection plus `alsoIn`), so an "also in" product is found under both.
- Options are the **published** collections (`getCollections()`), in collection `sortOrder`, **that at least one published product carries** (§5.1). A published collection with no published product (a new collection before its candles launch) has no option. A product whose collection is unpublished is still listed in the shop; it just has no option of its own.

### 5.6 Price

| URL value | Label (USD; new shop copy) | Range in minor units (inclusive) | Seed count |
|---|---|---|---|
| `under-25` | Under $25 | 0 – 2499 | 5 (the three tins $18, Fir Hollow $12, Gilded Plum $14) |
| `25-40` | $25 to $40 | 2500 – 4000 | 9 (the six two-size jars $34–48, Lantern Path and Lakelight $28–38, Comet Tail $36) |
| `over-40` | Over $40 | 4001 and up | 9 (the six two-size jars, Comet Season Gift Box $45, Little Constellation Set $49, Reading Nook Set $60) |

- **Match rule: the product's price range overlaps the bucket** (`priceFrom ≤ max && priceTo ≥ min`; M1.4 plan). A $34–48 jar comes in two sizes, one in each bucket, so it is honestly found under both.
- Three buckets fit the seed's spread ($12–$60) and stay meaningful up to a few hundred products; the boundaries are a small config, so M7 or a later spec can move them without a design change.
- **Labels use whole units.** The card's price formatter (product-card §3.6) prints cents ("$25.00"), which is right for prices and wrong for bucket names. The bucket labels are built from their boundary values (2500, 4000) with a **whole-unit** variant of the same formatter: `Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 })` (or the shared formatter with a `wholeUnits` option; tech-agent's name), giving **"Under $25"**, **"$25 to $40"**, **"Over $40"**. A unit test asserts the three labels exactly and that every bucket boundary is a whole number of dollars (a boundary like 2499 is never formatted; "Under" uses the next bucket's minimum, 2500).
- `[confirm with user: currency]`: the buckets are USD. Another currency means new boundaries and labels.
- The card's own price uses the available variants while the bucket uses `priceFrom` / `priceTo` (product-card §10 note); they differ only when a cheapest variant is unavailable.

### 5.7 Data check for tech-agent (M3.4)

Every facet is supported by fields `ProductCard` already carries: `scentFamilies`, `type`, `sizeKeys`, `collectionSlugs`, `priceFrom` / `priceTo`; plus `inStock`, `sortOrder` and `publishedAt` for sorting. **No facet lacks data.** Two notes:

1. **Size labels are copy, not data** (M1.4 §2 question b): `sizeKeys` are machine keys, so the shop needs the `sizeLabels` map (§5.4, §14.3). `set` is deliberately not an option.
2. **`publishedAt` for "Newest"** may be `null` (drafts never reach the shop, but a migrated product might lack it). Nulls sort last. If the seed gives every product the same `publishedAt`, "Newest" falls back to featured order; the e2e checks derive the expected order from the data, never from a hard-coded list (§20 check 10).

---

## 6. Sort

| URL value | Label | Order | Ties |
|---|---|---|---|
| `featured` (**default**, omitted from the URL) | Featured | `sortOrder` ascending (the curated order) | — |
| `newest` | Newest | `publishedAt` descending, `null` last | `sortOrder` |
| `price-asc` | Price: low to high | `priceFrom` ascending | `sortOrder` |
| `price-desc` | Price: high to low | `priceFrom` descending | `sortOrder` |

- **Every sort puts sold-out products after in-stock ones**, keeping the sort's order within each group. A shopper scrolling a sorted list shouldn't meet a candle they can't buy among the first results. (The seed has no sold-out product; the dev preview does, §19.)
- **Price sorts use `priceFrom`**, the "From" price on the card, so the order always matches the prices the shopper sees ("From $34.00" jars sit between Comet Tail at $36.00 and the $28.00 pillars in high-to-low order, which is what the cards say).
- Seed results: `price-asc` starts Fir Hollow ($12), Gilded Plum ($14), Late Bloom, Margin Notes, Quiet Shore ($18, by `sortOrder`); `price-desc` starts Reading Nook Set ($60), Little Constellation Set ($49), Comet Season Gift Box ($45), Comet Tail ($36).
- **Where it lives:** md+, the toolbar `<select>`, applied on change (§9.3). Below md, the sheet's "Sort by" radio group, applied with the filters (§8.3). Both write the same `sort` param.

---

## 7. URL params contract

### 7.1 Parameters

| Param | Values | Repeats? | Default (omitted) | Example |
|---|---|---|---|---|
| `scent` | the shown `SCENT_FAMILIES` options (§5.1, §5.2) | yes, one per value | none | `scent=floral&scent=citrus` |
| `type` | the shown `PRODUCT_TYPES` options (§5.3) | yes | none | `type=tin` |
| `size` | the shown, labelled size keys (§5.4) | yes | none | `size=220g` |
| `collection` | the shown collection slugs (§5.5) | yes | none | `collection=starlit-library` |
| `price` | the shown buckets of `under-25`, `25-40`, `over-40` (§5.6) | yes | none | `price=under-25` |
| `sort` | `featured`, `newest`, `price-asc`, `price-desc` | no | `featured` | `sort=price-asc` |
| `page` | integer ≥ 2 | no | 1 | `page=2` |

- **Repeated keys, not comma lists**, because that is what a plain `<form method="get">` with checkboxes submits, so the no-JS path and the JS path produce the same kind of URL.
- Example: **`/shop?scent=floral&scent=citrus&type=tin&sort=price-asc`**.

### 7.2 Canonical form

One state has exactly one canonical URL. Every URL the page writes with JS, and every `href` it renders, is canonical:

1. Keys in this order: `scent`, `type`, `size`, `collection`, `price`, `sort`, `page`.
2. Values within a key in the facet's display order (§5), each once.
3. Defaults omitted (`sort=featured`, `page=1`); a key with no values omitted; `/shop` with no query is the default state.
4. Lower case only; values are matched exactly.

A no-JS form submit produces the browser's own order (and may carry `sort=featured`); the server reads it the same way (§7.3), and the address bar keeps it until the next JS-written URL. That is accepted.

### 7.3 Reading a URL (server and client, one pure parser)

- **Unknown keys** (`utm_source`, `fbclid` and other tracking keys from Instagram and Pinterest, anything else) are ignored for state.
- **Unknown or invalid values** (`type=candle`, `scent=Floral`, `collection=` a slug that is not a shown option: unpublished, missing, or a collection no published product carries; `sort=cheapest`) are ignored; the rest of the state still applies. An invalid value is never an error page. The valid values of each facet are exactly its shown options (§5.1).
- **Duplicates** are de-duplicated.
- **`page`**: a non-integer, 0, 1 or a negative number means 1; a page past the last means the last page (with 0 results, page 1).
- **Filters that select nothing** (a valid combination with 0 results) are kept: the page shows the zero-results state (§11.3) with the chips, so the visitor sees why.
- **Canonicalising the address bar:** after hydration, if the URL's recognised state, written canonically, differs from the recognised part of the current query, the client calls `history.replaceState` with the canonical query (no navigation, no re-render, no history entry). **Unknown keys are kept**, unchanged and in their original order, after the canonical keys (`?scent=citrus&type=tin&fbclid=abc`), so a landing page view still carries its `utm_*` attribution for whatever analytics M8 chooses (§22.9). URLs the page writes later (Apply, chips, Clear all, Show more, sort) carry the canonical state only.

### 7.4 Writing the URL (history)

| Action | URL change | History |
|---|---|---|
| Open or close the sheet (any way) | none | **none** (§8.6) |
| Apply in the sheet ("Show {n} products") | the staged state, canonical; `page` dropped | **push** (one entry per apply); if the staged state equals the current one, the sheet just closes (no entry, no announcement) |
| Sort select change (md+) | `sort`; `page` dropped | **push**; but a change within **1000ms** of the previous sort-select change **replaces** instead (§9.3), so a run of arrow-key changes is one entry |
| Remove a chip | that value removed; `page` dropped | **push** |
| Clear all filters | every filter removed, `sort` kept; `page` dropped | **push** |
| Show more | `page` + 1 | **replace** (§2.3) |
| Canonicalising on load | as §7.3 | **replace** |

- **Back and Forward** restore the state from the URL: the results, the count, the chips, the toolbar badge and the sort select all follow it. If the sheet is open, it closes and its staged changes are discarded (§8.6). The page status announces the new count (§13.5). The scroll position is the browser's restoration.
- Client navigations use `scroll: false`; the page then scrolls only as §9.4 says (to the results heading, and only if it is above the viewport).

---

## 8. The filter sheet

### 8.1 Element: a top-layer `<dialog>` (the header.md §5 pattern)

**`<dialog id="shop-filters" aria-labelledby="shop-filters-title">`**, opened with `showModal()`. As header.md §5.1: the inert background, Esc and focus containment come from the platform; it paints in the top layer, so no `--z-drawer` is needed; its `::backdrop` is the scrim (`bg-scrim`). No custom focus trap is written.

Inside it, one **`<form method="get" action="/shop">`** holds every control, so with or without JS the sheet submits the same state (§7.1).

### 8.2 Layout

| | base (below md) | md and up |
|---|---|---|
| Kind | **bottom sheet** | **end-side drawer** (the menu drawer's edge, header.md §5.6) |
| Position | `position: fixed; inset-inline: 0; inset-block-end: 0; inset-block-start: auto; margin: 0`; UA box reset (`max-inline-size: none; max-block-size: none` before the values below) | `inset-block: 0; inset-inline-end: 0; inset-inline-start: auto; margin: 0` |
| Size | `inline-size: 100%`; `max-block-size: calc(100% - 3rem)`, so a 48px strip of scrim stays tappable above it | `inline-size: min(26rem, 100% - 3rem)` (416px); `block-size: 100%` (full height) |
| Surface | `bg-bg-overlay`, `shadow-overlay`, top corners `radius-xl` (tokens.md §5: the bottom sheet's top corners), `border-block-start: 1px solid transparent` (forced colors) | `bg-bg-overlay`, `shadow-overlay`, `rounded-s-lg` (leading edge), `border-inline-start: 1px solid transparent` |
| Structure | **a flex column**, as the header drawer (header.md §5.6): `#shop-filters[open] { display: flex; flex-direction: column }` (the closed dialog stays `display: none`); the `<form>` is its one child, itself `display: flex; flex-direction: column; flex: 1 1 auto; min-block-size: 0`. Inside the form: **head** (`flex: none`), **body** (`flex: 1 1 auto; min-block-size: 0; overflow-y: auto; overscroll-behavior: contain`), **foot** (`flex: none`). The dialog's `max-block-size` bounds the column, `min-block-size: 0` lets the body shrink below its content, so the head and foot stay put and only the body scrolls. | same; the column is bounded by the definite `block-size: 100%` |
| Inline padding (head, body and foot) | start **`var(--page-inline-start)`**, end **`var(--page-inline-end)`** (both `max(20px, the safe-area inset)` at base, tokens.md §9.1), since the sheet touches both viewport edges | start **`1.5rem`** (24px, step 6: the drawer's start edge is at least 48px from the viewport edge, so no inset can reach it); end **`max(1.5rem, var(--page-inline-end))`**, so Close clears a landscape notch |
| Head, block-start | — (the sheet's top is 48px below the viewport's top) | **`padding-block-start: env(safe-area-inset-top, 0px)`**, added to the head's 4rem (header.md §5.6) |

At 390 × 664 the sheet is 616px tall: head 64, foot about 73, so the body shows about 480px of options at a time and scrolls.

**Head** (`block-size: 4rem` plus the md+ safe-area padding above, `box-sizing: content-box`; items centred; a 1px `border-divider` along its bottom):

- `<h2 id="shop-filters-title" class="type-h3">`: **"Filter and sort"** below md, **"Filters"** from md (two spans, one `md:hidden`, one `hidden md:inline`, so the accessible name always matches what is shown). `type-h3` is Cormorant 600, 24px at base: text-primary only (typography.md §7.4).
- The **close button** at the end: the icon-button recipe (header.md §4.3), a thin × glyph, accessible name **"Close filters"**, `type="button"`, `command="close" commandfor="shop-filters"` plus the JS handler (§8.6).

**Body** (padding-block-end 24px): the fieldsets in this order, each separated by a 1px `border-divider` line with 24px above and below:

1. **Sort by** (radio group; **below md only**, `md:hidden`, §8.3)
2. **Scent family**
3. **Type**
4. **Size**
5. **Collection**
6. **Price**

**Foot** (a 1px `border-divider` along its top; padding-block 12px, plus `env(safe-area-inset-bottom, 0px)` at the bottom; `display: flex; gap: 12px; align-items: center`):

- **Reset** (ghost button, auto width, `min-block-size: 44px`, padding 8 / 16, `type="button"`): shown only when the staged state has at least one filter, or (below md) a non-default sort. When it isn't shown, the primary button takes the full width. It never renders as a dead or disabled button.
- **Show {n} products** (the **primary ember CTA**, `flex: 1`, `min-block-size: 48px`, `rounded-pill`, `type-button`, text-inverse, `type="submit"`): the sheet's one primary action, in thumb reach at the bottom of the screen. **No-glow variant** (tokens.md §2.5 rule 9: Reset sits within 26px of it).

### 8.3 Sort inside the sheet (below md)

- `<fieldset>` with `<legend>` **"Sort by"** and four `<input type="radio" name="sort">` options in §6 order: Featured, Newest, Price: low to high, Price: high to low. Its initial value is the URL's sort.
- From md the fieldset is `display: none` (the toolbar's select is the sort control there). Hidden inputs still submit, so the form always sends the radio group's value; from md that value is the URL's sort, unless the visitor changed it below md and then widened the window, in which case Apply uses the staged radio value. That edge case is accepted.

### 8.4 Fieldsets and options

```
<fieldset class="Facet">
  <legend class="type-eyebrow">Scent family</legend>                 gold-400 on bg-overlay; sentence case, uppercased by CSS
  <div class="Facet-options">                                        12px below the legend; a single column
    <label class="FacetOption">                                      min-block-size 44px; flex; gap 12px; align-items: center
      <input type="checkbox" name="scent" value="floral">            20 × 20 (below)
      <span class="FacetOption-label">Floral</span>                  type-body, text-primary
      <span class="FacetOption-count">(3)</span>                     type-body-sm, text-muted, tabular-nums
    </label>
    …
  </div>
</fieldset>
```

- **One `<fieldset>` and `<legend>` per facet**, so a screen reader announces "Scent family, group" on entering it, and each option's name is its label plus its count ("Floral (3)").
- The whole label row is the hit target: 44px tall, full width of the body, with the checkbox at the start.
- **Checkbox** (`appearance: none`, 20 × 20px, `radius-xs`, `flex-shrink: 0`):
  - unchecked: transparent fill, 1px **border-control** (3.51:1 on bg-overlay, U3);
  - checked: **gold-400** fill and border, with a check mark in **text-inverse** (an inline SVG mask or background image; 9.96:1 on gold-400, T31). The check mark is the non-colour cue (accessibility.md §4);
  - hover (fine pointer): border gold-400;
  - focus-visible: the global ring (2px gold-300, 2px offset) on the checkbox;
  - disabled (count 0, unchecked): border **border-divider**, no fill, label and count in **text-disabled**, `cursor: default`;
  - forced colors: `appearance: auto` (the native checkbox in system colours).
- **Radio** (the sort group): the same 20px box as a circle; checked shows a 2px gold-400 ring and a 10px gold-400 dot (the dot is the non-colour cue); otherwise as the checkbox.
- Counts are recomputed on every staged change (§8.5), so they always describe the staged state.
- No facet has more than 6 options today. If one ever passes 8, its list shows the first 8 and a "Show all {n}" disclosure, which a later spec writes; not needed now.

### 8.5 The live result count

- On every staged change (a checkbox, a radio, Reset), the sheet recomputes, **without a network request and within 100ms**: the number of results for the staged state, every option's count and the disabled state (§5.1). It runs over a compact facet index that the page passes to the sheet (§18.2).
- The primary button's text updates at once: **"Show 12 products"**, "Show 1 product", "Show 0 products".
- **When "Show 0 products" happens.** Checking an option can't reach 0 (zero-count options are disabled), but **unchecking** can: within a facet, unchecking one of several chosen options narrows the OR, and the remaining combination may match nothing. Example from the seed: check Fresh, Floral and Travel tins (1 result, Late Bloom), then uncheck Floral: Fresh ∩ tins = 0. The sheet may also open on a zero-results URL. In every case the button stays **enabled** (never a dead control): Apply writes that state (push, §7.4), closes the sheet and shows the zero-results state (§11.3) with the chips that caused it. The 0 in the button, the live status ("No products match.") and the disabled options around it are the warning.
- A visually hidden **`role="status"`** region inside the dialog (present and empty when the dialog opens) receives **"12 products match."** / "1 product matches." / "No products match." 500ms after the last change (rapid taps coalesce; only the latest text is written). It lives inside the dialog because the page's own region is inert while the dialog is open (tokens.md §8).
- The primary button's text changes never move the options: it sits in the fixed foot.

### 8.6 Opening, closing, focus, scroll lock

**History model (decision, fix round 1): opening the sheet pushes no history entry.** The sheet is a temporary view over the current URL, like the menu drawer. Why not push an entry on open: every non-Back close (Close, Esc, scrim, Apply) would then have to consume it with `history.back()`, which is asynchronous, races the Apply push and the Next router, and leaves a dead entry whenever it fails; Forward would also reopen nothing. Back while open therefore behaves as Back always does on this page, and the sheet simply closes with it.

| Action | Behaviour | Focus after |
|---|---|---|
| **Open:** the Filters button (click, Enter, Space) | the staged state is reset to the URL's state; `showModal()`; the button's `aria-expanded` becomes `"true"` (derived from the dialog's `toggle` and `close` events, header.md §5.2). No history entry. | **the Close button** (the first focusable in the dialog; native dialog focusing). The dialog is announced by its name, "Filter and sort" or "Filters". |
| **Show {n} products** | the form submits: with JS, the client writes the canonical URL (push, §7.4), closes the dialog and updates the results; without JS, a GET navigation | the Filters button, after the new results have committed (§18.2); then the page status announces the result (§13.5) |
| **Close button** | `dialog.close()`; staged changes discarded | `filterButton.focus()` |
| **Esc** | native `cancel`, then close; staged changes discarded | `filterButton.focus()` |
| **Tap or click on the scrim** | close when pointer-down **and** pointer-up both land outside the panel's rect (so a drag that starts on an option doesn't close it); staged changes discarded. `closedby="any"` may be used where supported; the JS check is the fallback. | `filterButton.focus()` |
| **Back / Forward as navigation** while open (the browser's Back button, the iOS edge swipe, Alt+←, `history.back()`) | the URL moves to the previous (or next) entry. On the `popstate` (or the router's equivalent), the island closes the dialog at once (no exit animation), discards the staged changes, and the page follows that entry's state like any Back (§7.4). If the previous entry is another page, the visitor simply leaves `/shop`. | the Filters button, when the visitor is still on `/shop` |
| **Back as a close request** while open (Android's system Back gesture or button on a modal dialog, which Chromium fires as `cancel`, like Esc) | handled exactly as **Esc**: closes, discards; the URL and history are unchanged | `filterButton.focus()` |
| **Reset** | clears every staged filter and (below md) sets the staged sort to Featured; counts and the button update; the URL is unchanged until Apply | stays in the dialog: Reset disappears (nothing is staged), so focus moves to the first enabled option of the first visible fieldset |

- **Focus is always moved explicitly on close** (`filterButton.focus()`), for the same reason as header.md §5.5: Safari doesn't focus a button on click or tap, so the native restore can have nothing to return to.
- **Focus containment:** `showModal()` makes the page inert; Tab and Shift+Tab cycle through the Close button, the options and the foot buttons.
- **Scroll lock:** `html:has(#shop-filters[open]) { overflow: hidden; }`. `html { scrollbar-gutter: stable }` is already set permanently (header.md §5.3), so the page doesn't move sideways when the scrollbar goes. The sheet's body scrolls on its own (`overscroll-behavior: contain`).
- **Resizing across md while open:** the sheet changes from bottom sheet to drawer by CSS alone and stays open; the Sort fieldset hides or shows (§8.3).

### 8.7 Without JavaScript

- The Filters button carries **invoker commands** (`command="show-modal" commandfor="shop-filters"`), and the Close button `command="close"`, so the sheet opens and closes without JS in browsers that support them (Chrome 135, Firefox 144, Safari 26.2; header.md §13.4). The JS handlers do the same and add the focus, `aria-expanded` and scrim behaviour. Where neither works, the visitor still has the full grid, the chips and Clear all (plain links), Show more (a plain link) and the footer.
- The server renders the primary button as **"Show products"** (no number, since the staged state isn't known without JS); JS replaces it with the live count when the dialog opens. The dialog is closed at hydration, so the text change never shifts anything on screen.
- **Reset without JS:** a `<button type="reset">` would only restore the URL's state, so under `@media (scripting: none)` the Reset button is hidden and a plain link **"Clear all filters"** to the current URL without filters (sort kept) takes its place in the foot.
- The submit is a normal GET to `/shop` with repeated params, which the server reads like any other URL (§7.3), and the response is the complete page (no streamed fallback, §11.2).
- On a browser without invoker commands, the Filters button does nothing until hydration finishes (usually well under a second after first paint on 4G). Accepted: the alternative, hiding the page's main control until hydration, is worse.

---

## 9. Toolbar, results heading, chips

### 9.1 The toolbar (sticky)

- A **full-bleed** strip (outside the Container, inside the band, so its surface spans the viewport) with a Container inside: `display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-block: 0.5rem; min-block-size: 3.75rem`.
- **Its minimum height is a constant, `3.75rem`** (60px at the default root size: 44px controls plus 8px above and below). The toolbar never has a fixed height: if larger text or WCAG 1.4.12 text spacing makes its content taller, it grows, and when the content gets smaller again it shrinks back to `3.75rem`. Nothing the toolbar measures feeds back into its own size.
- **Height variable, read only by the scroll margins:** `--shop-toolbar-h: 3.75rem` is declared on the band (`.ShopBand`) as the starting value, and every scroll margin that clears the toolbar is derived from it (§9.4, §13.3). The toolbar island keeps it equal to the toolbar's real height with a `ResizeObserver` on the toolbar:
  - on each entry it takes the toolbar's **border-box** block size (`entry.borderBoxSize[0].blockSize`, in px);
  - it compares that with **the last value it wrote** (none at mount, so the first observation is always written). It never reads the variable back: `getComputedStyle` returns the declared string (`"3.75rem"`), not a resolved length, so it can't be compared;
  - when the two differ by more than 0.5px, it writes `--shop-toolbar-h: {measured}px` as an inline style on the band and remembers that value.
  
  The variable never sizes any box (not even the toolbar's), so writing it causes no layout shift.
- **Sticky under the header:** `position: sticky; top: var(--scroll-offset); z-index: var(--z-raised)` (layout-shell §6.3). Under the short-viewport query `@media (max-height: 28rem)` it is `position: relative` (and `--scroll-offset` is 0 there anyway). The band's `overflow: clip`, if set, doesn't break sticky (clip doesn't create a scroll container).
- **Stuck surface (opaque, never translucent; the header's mechanism, layout-shell §6.2):** at rest the toolbar is transparent over the plain band (stars behind, at the 0.14 cap in the content column). When it is stuck, a `::before` (`inset: 0; z-index: -1`) carrying **bg-raised**, `shadow-raised` and a 1px `border-divider` bottom edge goes from `opacity: 0` to `1` over `--duration-base`, `--ease-standard`, so it reads as one piece of chrome with the scrolled header above it, and products never show through behind the controls.
  - **State hook:** `data-stuck="true"`, set by a small client island with an `IntersectionObserver` on the 1px sentinel just above the toolbar, with a negative top `rootMargin` of **the header offset plus 1px**. No `scroll` listener. On mount it reads the state once.
  - **Measuring the header offset:** `getComputedStyle` on `--scroll-offset` returns the unresolved `calc(var(--header-h) + env(…))`, and the header is 64 / 72 / 80px by breakpoint, so the island measures a **probe**: `<span data-scroll-offset-probe aria-hidden="true">` inside the toolbar, `position: absolute; inset-block-start: 0; inset-inline-start: 0; inline-size: 0; block-size: var(--scroll-offset); visibility: hidden; pointer-events: none`. Its `getBoundingClientRect().height` is the resolved offset in px (0 under the short-viewport query, where `--scroll-offset` is 0). A `ResizeObserver` on the probe fires whenever that value changes (a breakpoint, a rotation, the short-viewport query, a safe-area change); on each change the island **disconnects the IntersectionObserver and creates a new one** with the new `rootMargin`, then reads the state once. Out of flow and zero width, the probe never affects layout or the accessibility tree.
  - **Without JS:** `@media (scripting: none)` shows the surface permanently.
  - **Forced colors:** `background-color: Canvas` on the toolbar.
- The toolbar never hides on scroll.

### 9.2 The Filters button

| Property | Value |
|---|---|
| Element | `<button type="button" aria-haspopup="dialog" aria-controls="shop-filters" aria-expanded="false">` plus the invoker attributes (§8.7) |
| Recipe | **ghost button** (tokens.md §2.3): transparent fill, text-primary, 1px border-ghost, `rounded-pill`, `type-button`, `min-block-size: 44px`, padding 8 / 16, `inline-flex`, gap 8px |
| Content | a 20px **sliders glyph** (three horizontal lines with round knobs; inline SVG, `currentColor`, `aria-hidden`), the label, then the **applied-count badge** when 1 or more filters are applied |
| Label | **"Filter and sort"** below md; **"Filters"** from md (two spans, one shown per breakpoint) |
| Badge | the `badge-count` recipe from header.md §6.1 (gold-400 fill, text-inverse, `type-caption font-medium tabular-nums`, min 20 × 20, `rounded-pill`, `border: 1px solid transparent`), **inline** after the label (not absolute), `aria-hidden="true"`. It counts applied filter values (not the sort). Zero: no badge. |
| Accessible name | the visible label, plus a visually hidden **", {n} applied"** when n ≥ 1: "Filters, 2 applied", "Filter and sort, 1 applied". It starts with the visible label (WCAG 2.5.3). |
| Hover | fill bg-raised, border **border-accent** gold-400, `duration-fast` |
| Focus-visible | the global ring |
| Active | fill bg-overlay, border-accent, `scale(var(--motion-scale-press))` |
| Disabled | never |

The badge is server-rendered from the URL, so it is right in the first paint and hydration changes nothing.

### 9.3 The sort select (md and up)

- A `<form class="SortForm" method="get" action="/shop">` holding `<label for="shop-sort">Sort by</label>` and `<select id="shop-sort" name="sort">` with the four options of §6, plus hidden inputs carrying the applied filters (so the no-JS submit keeps them).
- **With JS:** a change applies at once: write the canonical URL (§7.4), update the results, keep focus on the select, and announce "Sorted by price, low to high." (§13.5).
  - **Coalescing.** In Chromium on Windows (and some other engines), the arrow keys on a *closed* `<select>` change its value and fire `change` on every press, so a visitor stepping from Featured to Price: high to low fires three changes. So: the first change **pushes**; any change within **1000ms** of the previous sort-select change **replaces** that entry instead (the window restarts on each change). The results follow every change (a transition supersedes the one before; only the latest commits). The page-status announcement is written **500ms after the last change** (the §13.5 debounce), so the run gives **one** history entry and **one** announcement, naming the final sort. The timestamp and the timer live where a re-render or a remount can't reset them (§18.2).
- **Without JS:** an **"Apply"** submit button (ghost recipe, 44px) is shown next to the select under `@media (scripting: none)` only.
- Label: `type-body-sm`, text-secondary, 8px before the select, on the same line.
- Select: `appearance: none`, `type-body` (16px, so iOS never zooms on focus), text-primary, fill **bg-sunken**, 1px **border-control**, `radius-sm`, `min-block-size: 44px`, padding 8px 40px 8px 12px, `min-inline-size: 12rem`, with a 16px chevron glyph (text-secondary, `aria-hidden`, `pointer-events: none`) 12px from its end edge. Hover: border-accent. Focus-visible: the global ring. Forced colors: `appearance: auto`.
- Below md the whole SortForm is `display: none` (sort is in the sheet).

### 9.4 The results heading

- **`<h2 id="results-heading" tabindex="-1">`**, `type-body-sm font-medium`, text-secondary: **"17 products"**, **"1 product"**, **"0 products"**. It is the total for the current filters, not the number shown so far (the Show more block says that, §10).
- It names the results region (`<section aria-labelledby="results-heading">`) and is the h2 the cards' h3s sit under (product-card §13.1, `headingLevel={3}`).
- `tabindex="-1"`: a programmatic focus target only (after Clear all, or after the last chip is removed). It keeps the global focus ring when focused.
- **Scroll margin:** `scroll-margin-top: calc(var(--shop-toolbar-h) + 1rem)` (the toolbar plus step 4; 76px at the default size), on top of the html `scroll-padding-top` for the header, so a scroll to it lands just below the sticky toolbar (§13.3 applies the same margin to every focusable and every result item in the results).
- **Scroll after an applied change:** after Apply, a sort change, a chip removal or Clear all, if the results heading is above the visible area (under the toolbar), the page scrolls instantly (`scroll-behavior: auto`) so the heading sits just below the toolbar. If it is already in view, nothing scrolls.

### 9.5 Applied-filter chips and Clear all

- Shown only when at least one filter is applied. A wrapping row (`display: flex; flex-wrap: wrap; gap: 8px`), with the chips in a `<ul aria-label="Applied filters">` and **Clear all filters** after the list, in the same row.
- **One chip per applied value**, in facet order then option order (§5): "Floral", "Citrus", "Travel tins", "220 g", "Starlit Library", "Under $25".
- **Chip: a link, always.** `<a href="{the canonical URL without this value}">`, rendered by the server and kept as a link after hydration; with JS, its click is intercepted (a client navigation with the focus handling below). So it works without JS and never changes element type on hydration.
  - `min-block-size: 44px`, padding 8 / 12 / 8 / 16, `rounded-pill`, transparent fill, 1px **border-accent** gold-400, text-primary, `type-body-sm font-medium`, no underline, then a 16px × glyph (`aria-hidden`, `currentColor`) 8px after the text.
  - Accessible name: the label plus a visually hidden **", remove filter"**: "Travel tins, remove filter" (it starts with the visible text).
  - Hover: fill bg-raised, the × in gold-300. Focus-visible: the global ring. Active: `scale(var(--motion-scale-press))`.
  - **Activation:** removes that one value (push, §7.4); focus moves to the chip that now takes its place (the next one), or the previous one if it was the last, or the results heading if no chip is left.
- **Clear all filters:** also a link, `<a href="{the canonical URL with every filter removed, sort kept}">`, styled as a text link (gold-300, always underlined 1px at 0.2em, `type-body-sm font-medium`, `min-block-size: 44px`, inline-flex). Activation: every filter removed (push); focus moves to the results heading. Hover: moon-100, underline stays.
- The chips are server-rendered from the URL, so they never pop in after hydration.

---

## 10. Show more (pagination)

| Item | Value |
|---|---|
| Page size | **24** (§2.3) |
| Shown when | `total > shown` |
| Progress line | `<p>` `type-body-sm`, text-secondary: **"Showing {shown} of {total} products"** |
| Control | `<a href="/shop?{canonical state}&page={next}#result-{shown + 1}">` **"Show more products"**, styled as a ghost button (the Filters button's recipe without glyph or badge): full width at base, centred with `min-inline-size: 16rem` from md |
| With JS | the click is handled on the client: the next 24 results are appended below the existing ones (nothing above moves), the URL is **replaced** with `page + 1`, and focus moves to the first new card (below); the page status announces "Showing 48 of 51 products." |
| Without JS | a normal navigation to `?page={next}`, which renders the first `{next} × 24` results; the `#result-{n}` fragment scrolls to the first new card, which lands below the sticky toolbar (its `<li>` carries the results' scroll margin, §13.3) |
| Last page | the block is not rendered |
| Focus target | the first new card's link when cards are linked (M4.3+); until then its `<h3>`, made a programmatic target with `tabindex="-1"` for this one move. Every grid `<li>` carries `id="result-{n}"` (1-based, continuous across steps). |

- A filter or sort change always resets to page 1.
- The grid's `<ul>` stays one list, so a screen reader's "list, 48 items" is right after each step.
- Scale: with M1.4's planned ≤ 200 products, a fully expanded grid is 9 steps. The server render of `?page=9` is up to 216 cards, still from one cached read.

---

## 11. States

### 11.1 Control states (summary)

| Control | Default | Hover | Focus-visible | Active | Disabled | Other |
|---|---|---|---|---|---|---|
| Filters button | ghost, badge if n ≥ 1 | fill bg-raised, border gold-400 | global ring | fill bg-overlay, press scale | never | `aria-expanded` true while the sheet is open |
| Sort select (md+) | bg-sunken, border-control | border gold-400 | global ring | native | never | — |
| Chip (link) | border gold-400 | fill bg-raised, × gold-300 | global ring | press scale | never | removed on activation |
| Clear all (link) | gold-300, underlined | moon-100 | global ring | — | never | not rendered with no filters |
| Show more (link) | ghost | fill bg-raised, border gold-400 | global ring | fill bg-overlay, press scale | never | not rendered on the last page |
| Facet checkbox | border-control | border gold-400 | global ring | — | count 0 and unchecked: border-divider, text-disabled | checked: gold-400 fill + check |
| Sort radio (sheet) | border-control | border gold-400 | global ring | — | never | checked: gold-400 ring + dot |
| Close (sheet) | icon button, text-primary | glyph gold-300 | global ring | press scale | never | — |
| Reset (sheet) | ghost | fill bg-raised, border gold-400 | global ring | press scale | never | rendered only when something is staged |
| Show {n} products | ember-400, text-inverse | ember-300 (no glow) | ember-400 + ring | ember-500, press scale | never (enabled at 0, §8.5) | "Show products" before JS |

### 11.2 Loading: no skeleton and no streamed fallback (decision, fix round 1)

- **`/shop` has no `loading.tsx`, and no `<Suspense>` boundary wraps the page's content.** Why: in Next 16 a segment's `loading.tsx` wraps its page in a Suspense boundary, and the response starts streaming as soon as that fallback renders (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`). On a page that reads `searchParams` this would (1) send the skeleton first on every direct load and swap the results in by inline script, which is the flash §2.4 forbids; (2) leave a no-JS visitor, or one whose script fails, on the skeleton; and (3) risk showing the fallback on in-page applies, whenever the router treats a search-param change as a new page state. (Whether it does is a router detail the build doesn't rely on either way, §18.2.)
- **Document requests** (a shared link, a refresh, Back from another site, the no-JS form submit): the server finishes the page from the cached reads before it sends `main`, so the HTML holds the final results, chips, badge and count. Nothing is swapped, so there is nothing to shift.
- **Arriving from another page in the app** (the header's Shop link, home's "Shop all candles"): the client router waits for the page's payload while the previous page stays on screen and interactive, then shows the shop in one commit; Next's route announcer reads the new title. The render is from cached reads and is expected well under 500ms. No intermediate state is drawn.
- **In-page changes** (Apply, sort, chips, Clear all, Show more, Back/Forward within `/shop`): the old results stay until the new ones commit, with the pending treatment if it takes over 300ms (§11.6).
- **There is no skeleton component.** `ShopSkeleton` and `/dev/shop/loading` from the first draft are dropped.
- **Keep it so.** No `loading.tsx` may sit in `app/(site)/shop/`, `app/(site)/` or `app/` (none exists today). If a later task needs one above `/shop`, it must keep `/shop` outside that segment (for example in its own route group) and log it in `PROGRESS.md`. This assumes Cache Components stays off (it is off in `next.config.ts` today); with it on, a `searchParams` read requires a Suspense boundary, and M3.4 must revisit this section before enabling it.

### 11.3 Zero results (valid filters that match nothing)

Reached through a URL (an old or shared link), or by applying a staged state that unchecking narrowed to nothing (§8.5). Example: `/shop?type=wax-melt&collection=lakeside-hush`.

- The toolbar, the results heading ("0 products") and the chips stay, so the visitor sees which filters caused it and can remove one with a tap.
- In the grid's place (no `<ul>`), a `ShopEmpty` block, start-aligned in the Container, `max-w-measure-intro`:
  - a 32px **crescent moon** glyph, gold-400, `aria-hidden`, `data-decorative`;
  - 16px below, **`<h3 class="type-h3">`** "No candles match these filters" (text-primary);
  - 12px below, `type-body`, text-secondary: "Try removing a filter, or clear them all to see every candle.";
  - 24px below, **"Clear all filters"** as a link styled as a ghost button (the same target as §9.5).
- The page status announces "No products match your filters." after an applied change; on a direct load nothing is announced (the heading says it).

### 11.4 Empty catalog (no published products at all)

- No toolbar, no results heading, no chips, no sheet: there is nothing to filter.
- After the heading block, the `ShopEmpty` block in its catalog variant: the crescent glyph, **`<h2 class="type-h3">`** "Nothing on the shelves just now" (an h2 here, because there is no results h2 above it), `type-body` text-secondary "Please check back soon, or head back to the home page for now.", then the text link **"Go to the home page"** (gold-300, underlined, 44px tall).
- No restock date or promise.

### 11.5 Error

- A repository failure while rendering `/shop` on a **document request or an arrival from another page** is caught by **`app/(site)/shop/error.tsx`** (a Client Component, inside the shell: header and footer stay; layout-shell §10). It replaces the page inside `main` and supplies the page's h1. It uses layout-shell §10's error layout (one `plain` section, the prose Container, h1 styled `type-h2`, a paragraph, then the actions 24px below), with the shop's own copy:
  - h1 **"The shop didn’t load"**;
  - paragraph **"We couldn’t show the candles just now. Please try again, and if it keeps happening, come back a little later."**;
  - **"Try again"** (ghost button, calls `retry()`, as layout-shell §10) and **"Go to the home page"** (text link).
- It sets no title of its own (the layout's title stays; layout-shell §10).
- Invalid URL params are never an error (§7.3).
- **An in-page change never shows the error boundary.** If Apply, a sort change, a chip, Clear all or Show more fails, the current results stay on screen (the pending dim, if shown, is removed), the URL is left at the new state only if the results for it rendered, nothing new is announced, and the next action retries. Next renders `error.tsx` whenever a Server Component throws while rendering a client navigation's payload, so a plain `router.push` to a failing render would replace the results. **M3.4 chooses the mechanism and records it**, with a test that proves the rule. Acceptable options:
  1. in-page changes render on the client from data already sent (the facet index plus the card data), so no server render runs on an in-page change;
  2. the next results come through a call whose failure is catchable inside the transition (for example a Server Action or a Route Handler returning the page of cards), with the URL then written by `history.pushState` / `replaceState` (which Next's router integrates with), not through `router.push`;
  3. another mechanism with the same visible outcome.
- Back/Forward to an entry whose server render fails may show the error boundary (its "Try again" recovers). That is accepted: the visitor asked for a different page state, and there are no "current results" to keep for it.

### 11.6 Pending (an applied change that takes longer than 300ms)

- Expected to be rare: the results should update within 500ms of the input on a 4G phone (M3.4, §18.2).
- If the new results aren't on screen **300ms** after the input, the results section gets `aria-busy="true"` and the grid's `<ul>` goes to **`opacity: 0.5`** over `--duration-fast` (an opacity change only; nothing moves). The heading keeps the old count until the new results render, then everything changes in one commit.
- No spinner, no skeleton, no layout change.

### 11.7 Success

- After Apply, a chip removal, Clear all or a sort change: the new results, the new count in the heading, the chips and the badge appear together; the page status announces the outcome (§13.5). No toast and no extra message: the result is the confirmation.

---

## 12. Motion

Everything is `transform` or `opacity`, nothing changes a box's size or position in the layout, and **the page loads no GSAP** (CSS only, like the header).

| What | Trigger | Animates | Duration / easing | Reduced motion (and `html[data-motion="off"]`) |
|---|---|---|---|---|
| Sheet panel, base, **enter** | open | `translateY(100%)` → `none` | `--duration-slow` (400ms) / `--ease-enter` | **no movement** (`transform: none`); the panel fades `opacity` 0 → 1 over `--duration-fast` (150ms), `--ease-standard` |
| Sheet panel, md+, **enter** | open | `translateX(100%)` → `none` | as above | as above |
| Sheet panel, **exit**, where `overlay` can transition (`@supports (overlay: auto)`: Chromium 117+) | close | `none` → `translateY(100%)` (base) / `translateX(100%)` (md+) | `--duration-base` (250ms) / `--ease-exit` | opacity 1 → 0 over `--duration-fast`, `--ease-standard`; no movement |
| Sheet panel, **exit**, elsewhere (Safari, Firefox today) | close | **nothing: the sheet disappears at once** | — | the same (instant) |
| Scrim (`::backdrop`) | open / close | `opacity` 0 ↔ 1 | as the panel, in each case above (the exit fade only under `@supports (overlay: auto)`, otherwise instant) | opacity, 150ms; the exit only under `@supports`, otherwise instant |
| Close on Back / Forward as navigation (§8.6) | `popstate` | nothing: closed at once | — | the same |
| Toolbar stuck surface | stuck / unstuck | `::before` `opacity` 0 ↔ 1 | `--duration-base` / `--ease-standard` | opacity, 150ms (the token remap, motion.md §6.3) |
| New results (after an applied change) | the result set changes | the grid `<ul>` (keyed by the canonical query) fades in, `opacity` 0 → 1 | `--duration-fast` (150ms) / `--ease-standard` | **none**: the results are simply there (motion.md §6.2: reveals are instant) |
| Cards added by Show more | append | each new `<li>`: `opacity` 0 → 1 | `--duration-fast` / `--ease-standard`, no stagger | none |
| Pending dim | §11.6 | the grid `<ul>` `opacity` 1 → 0.5 and back | `--duration-fast` | the same opacity change (a state change, not movement) |
| Buttons, chips, checkboxes | hover / press | colour (state change); press `scale(var(--motion-scale-press))` | `--duration-fast` | colour unchanged; no scale (the token is 1) |
| Card image hover zoom | product-card §7 | — | — | product-card §7 |

- **Sheet mechanism:** header.md §5.7's pattern, with one deliberate difference. The enter is the same: the start state in `@starting-style` for `#shop-filters[open]` and its `::backdrop`, with the enter transition declared on the **open** state. The **exit transition is declared on the closed state only inside `@supports (overlay: auto)`**, so it runs only where the dialog can stay in the top layer while it leaves. **Why it differs from the header:** without a transition on `overlay` (Safari, Firefox), a closing dialog leaves the top layer at once and its exit runs in the stacking context of its DOM parent. The menu dialog's parent is the header (above everything), but this dialog sits inside `main` (`z-content`, 1), so its slide-out would pass **under** the sticky toolbar and the header for 250ms, on exactly the iOS and Instagram in-app browsers most visitors use. Closing instantly there is calm and correct; the enter (in the top layer from the first frame) still animates everywhere.
- Sketch of the required cascade (selector and attribute names are tech-agent's; the declarations, the `@supports` placement and the reduced-motion values are the requirement):

  ```css
  /* Closed state: the exit target. No transition by default, so the close is instant. */
  #shop-filters { transform: translateY(100%); }                 /* md+: translateX(100%) */
  #shop-filters::backdrop { opacity: 0; }

  /* Open state and its enter transition (every engine with @starting-style). */
  #shop-filters[open] { transform: none; }
  #shop-filters[open]::backdrop { opacity: 1; }
  #shop-filters[open], #shop-filters[open]::backdrop {
    transition-property: transform, opacity, overlay, display;
    transition-duration: var(--duration-slow);
    transition-timing-function: var(--ease-enter);
    transition-behavior: allow-discrete;
  }
  @starting-style {
    #shop-filters[open] { transform: translateY(100%); }          /* md+: translateX(100%) */
    #shop-filters[open]::backdrop { opacity: 0; }
  }

  /* Exit transition only where `overlay` itself can transition. */
  @supports (overlay: auto) {
    #shop-filters, #shop-filters::backdrop {
      transition-property: transform, opacity, overlay, display;
      transition-duration: var(--duration-base);
      transition-timing-function: var(--ease-exit);
      transition-behavior: allow-discrete;
    }
  }
  ```

- **Reduced-motion CSS, both triggers, the same declarations** (the product-card §13.1 pattern; the discrete `overlay` and `display` stay in the transition lists, so the dialog still leaves the top layer after its fade where the exit runs):

  ```css
  @media (prefers-reduced-motion: reduce) {
    #shop-filters, #shop-filters[open] { transform: none; }
    #shop-filters { opacity: 0; }
    #shop-filters[open] { opacity: 1; }
    @starting-style { #shop-filters[open] { transform: none; opacity: 0; } }
    #shop-filters[open], #shop-filters[open]::backdrop {
      transition-property: opacity, overlay, display;
      transition-duration: var(--duration-fast);
      transition-timing-function: var(--ease-standard);
    }
    @supports (overlay: auto) {
      #shop-filters, #shop-filters::backdrop {
        transition-property: opacity, overlay, display;
        transition-duration: var(--duration-fast);
        transition-timing-function: var(--ease-standard);
      }
    }
    [data-shop-results-enter], [data-shop-results-enter] > li { animation: none; }
  }
  ```

  `html[data-motion="off"]` repeats **every rule of that block verbatim**, each selector prefixed with `html[data-motion="off"] ` (inside `@starting-style` and `@supports` too). Outside `@supports (overlay: auto)` the reduced-motion close is instant, like the default one.
- **The close on Back/Forward-as-navigation is instant at every setting** (the island sets a `data-closing-instant` hook, or equivalent, that removes the closed state's transition for that one close), because the page behind is about to change state.
- **No scroll reveals on this page.** The grid is the page's content, not a story; cards are present from the first paint. (product-card §7 leaves the shop grid's reveal to this spec: there is none.)
- **The results fade never hides content that has already painted.** It runs only on a `<ul>` that the client has just inserted (after an applied change or Show more); the server render carries no animation, so a direct load never fades, and the old results stay visible until the new list replaces them.
- **CLS:** the toolbar is in flow from the first paint and grows only with its own content; its stuck surface is a pseudo-element's opacity; the badge, chips, sort value and count are server-rendered from the URL; nothing is streamed and swapped (§11.2); the sheet is in the top layer; the primary button's text changes only inside the fixed foot of a dialog; the grid's own boxes come from product-card. Target: **CLS < 0.05** at 390 and 1440 across load, opening and closing the sheet, and an apply; layout-shift entries outside the 500ms after an input total 0.

---

## 13. Accessibility

### 13.1 Landmarks and headings

- One `main` (the shell's). Inside it: the `<h1>` "Shop all candles" (in an `<hgroup>` with its eyebrow), then the results region `<section aria-labelledby="results-heading">` with the `<h2>` count, then each card's `<h3>` (product-card §8.1). In the zero-results state the empty block's heading is an `<h3>` under that h2; in the empty-catalog state it is an `<h2>` (§11.4). No level is skipped.
- The sort form at md+ is a plain `<form>` without an accessible name, so it is not a landmark (one control doesn't need one).
- The sheet's `<dialog>` is named by its `<h2>` ("Filter and sort" / "Filters"); its form needs no name of its own. Inside: one `<fieldset>`/`<legend>` per facet and for the sort group.
- The applied chips are a `<ul aria-label="Applied filters">` ("Applied filters, list, 2 items").

### 13.2 Keyboard order

| State | Order (after the skip link and the header) |
|---|---|
| base, page | Filter and sort → chips (each) → Clear all filters → (card links and quick adds, when live) → Show more products → footer |
| md+, page | Filters → Sort by (select) → [Apply, no-JS only] → chips → Clear all filters → (cards) → Show more products → footer |
| Sheet open | Close filters → (base: the Sort by radio group, one tab stop, arrow keys between options) → each facet's checkboxes in order (disabled ones are skipped) → Reset (when shown) → Show {n} products → back to Close filters |

- Space toggles a checkbox; arrow keys move within the radio group; Enter on "Show {n} products" submits; Esc closes the sheet; Enter on a chip or Clear all follows it. Arrow keys on the closed sort select change the sort, coalesced as §9.3.
- While cards are not linked (until M4.3) the grid has no tab stops at all, so the page is short to tab through. Once links and quick add are live, a 24-card page is up to 48 stops between the chips and Show more; product-card §8.3 allows a "skip past the products" link, and this spec doesn't add one: the results region, its heading and the footer are reachable with landmark and heading navigation, and the cards come in the order a sighted visitor scans them. `[revisit at M4.3 if the build review finds it tedious]`

### 13.3 Focus

- Every control has the global ring (2px gold-300, 2px offset; tokens.md §7). The rings sit on the plain band (at rest: over the starfield cap, 8.58:1; on the stuck toolbar: bg-raised, 11.19:1) or on bg-overlay in the sheet (9.64:1).
- Focus moves are listed where they happen: the sheet (§8.6), chips and Clear all (§9.5), Show more (§10). Focus is never left on a removed element and never dropped to `<body>`.
- **Nothing focused or targeted hides under the sticky header or toolbar** (WCAG 2.4.11): html `scroll-padding-top` covers the header; one rule gives every focusable **and every result item** inside the results region `scroll-margin-top: calc(var(--shop-toolbar-h) + 1rem)` (76px at the default size; derived from the measured toolbar, §9.1): `.ShopResults :is(a, button, [tabindex], [id^="result-"])`. So tabbing back up through the grid scrolls each target clear of the toolbar, and a no-JS `#result-{n}` fragment (§10) lands the `<li>` just below it. The results heading has the same margin (§9.4).

### 13.4 Touch targets

Every control is at least 44 × 44 (`--size-touch`): the Filters button, the select, chips (44 tall), Clear all (44 tall), Show more (44), the sheet's option rows (44 tall, full width), the radio rows (44), Close (44 × 44), Reset (44) and the primary button (48 tall, the mobile CTA minimum). Adjacent targets keep at least 8px between them (chips gap 8; foot gap 12). Option rows are stacked label boxes whose hit areas touch: that is the standard form pattern, where each row is one large target for its own checkbox, not two small targets next to each other.

### 13.5 Announcements (`aria-live`)

| When | Region | Text |
|---|---|---|
| Applied change with ≥ 1 filter (Apply, chip removal, Back/Forward) | the page's `role="status"` (§3.2), 500ms after the results render | **"{n} products match your filters."** / **"1 product matches your filters."** / **"No products match your filters."** |
| Applied change with no filters (Clear all, removing the last chip, Apply after Reset, Back/Forward to the default) | page status | **"Showing all {n} products."** |
| Sort change (md+) | page status, 500ms after the last change of a run (§9.3) | **"Sorted by featured."** / **"Sorted by newest."** / **"Sorted by price, low to high."** / **"Sorted by price, high to low."** |
| Show more | page status | **"Showing {shown} of {total} products."** |
| Staged change in the sheet | the dialog's own `role="status"` (§8.5), 500ms debounce | **"{n} products match."** / **"1 product matches."** / **"No products match."** |

- The initial page load announces nothing. A Back/Forward that lands on the same state announces nothing. Arriving from another page is read by Next's route announcer (the title), not by this region.
- Only the latest text is written; rapid changes coalesce. The page region is outside the dialog, so it is written only after the dialog has closed.

### 13.6 Contrast

The page is one `plain` band: at rest, text and controls sit over bg-page with the starfield behind at the 0.14 cap, whose composite **`#2D303F`** (L 0.030308, L + 0.05 = 0.080308; starfield.md §3.2, home.md §4.7) is the worst case behind text. When the toolbar is stuck its controls sit on bg-raised. The sheet is bg-overlay.

| Pair | Ratio | Needs | Source |
|---|---|---|---|
| Eyebrow gold-400 over the cap | 6.87 | 4.5 | home.md §4.7 |
| h1 text-primary over the cap | 11.40 | 3.0 (large) | home.md §4.7 |
| Intro text-secondary over the cap | 7.76 | 4.5 | home.md §4.7 |
| Results heading text-secondary over the cap / on bg-page | 7.76 / 11.25 | 4.5 | home.md §4.7 / T7 |
| Filters button label text-primary over the cap / stuck, on bg-raised | 11.40 / 14.85 | 4.5 | home.md §4.7 / T3 |
| Filters button border, border-ghost, over the cap / on bg-raised | **4.60** (new) / 5.99 | 3.0 | below / U4 |
| Filters button hover border gold-400 over the cap / on bg-raised | 6.87 / 8.96 | 3.0 | as the eyebrow / U5 |
| Badge fill gold-400 (shape) over the cap / on bg-raised; badge text text-inverse on gold-400 | 6.87 / 8.96; 9.96 | 3.0; 4.5 | — / U5; T31 |
| "Sort by" label text-secondary over the cap / on bg-raised | 7.76 / 10.12 | 4.5 | — / T8 |
| Select text text-primary on its bg-sunken fill | 17.30 | 4.5 | T1 |
| Select border, border-control, over the cap / on bg-raised | **3.12** (new) / 4.07 | 3.0 | below / U3 |
| Select chevron text-secondary on bg-sunken | 11.78 | 3.0 | T6 |
| Chip label text-primary over the cap | 11.40 | 4.5 | home.md §4.7 |
| Chip border gold-400 over the cap | 6.87 | 3.0 | — |
| Clear all, link gold-300 over the cap | 8.58 | 4.5 | home.md §4.7 |
| Progress line text-secondary over the cap | 7.76 | 4.5 | — |
| Show more border, border-ghost, over the cap / label text-primary | 4.60 / 11.40 | 3.0 / 4.5 | below |
| Zero / empty heading text-primary, body text-secondary, home link gold-300, over the cap | 11.40 / 7.76 / 8.58 | 3.0 (h3 style is large) / 4.5 / 4.5 | — |
| Crescent glyph gold-400 | decorative | — | — |
| Focus ring gold-300 over the cap / bg-raised / bg-overlay | 8.58 / 11.19 / 9.64 | 3.0 | — / U7 / U7 |
| **Sheet:** title text-primary on bg-overlay | 12.80 | 3.0 (h3 style, large) | T4 |
| Legends gold-400 on bg-overlay | 7.72 | 4.5 | T18 |
| Option labels text-primary / counts text-muted on bg-overlay | 12.80 / 5.16 | 4.5 | T4 / T14 |
| Disabled option label and count, text-disabled on bg-overlay | 5.16 (exempt, passes anyway) | — | T14 |
| Checkbox and radio border, border-control, on bg-overlay | 3.51 | 3.0 | U3 |
| Checked fill gold-400 against bg-overlay / check mark text-inverse on gold-400 | 7.72 / 9.96 | 3.0 | T18 / T31 |
| Hover border gold-400 on bg-overlay | 7.72 | 3.0 | T18 |
| Close glyph text-primary on bg-overlay | 12.80 | 3.0 | T4 |
| Reset label text-primary / border border-ghost on bg-overlay | 12.80 / 5.16 | 4.5 / 3.0 | T4 / U15 |
| Primary button label text-inverse on ember-400 / ember-300 (hover) / ember-500 (active) | 10.81 / 12.99 / 8.85 | 4.5 | T27 / T28 / T29 |
| Primary button shape, ember-400 against bg-overlay | **8.38** (new) | 3.0 | below |
| Dividers, border-divider | decorative (X6) | — | — |

New pairs (working as accessibility.md §2.4, with its L + 0.05 values):

- The cap's luminance: `#2D303F` = (45, 48, 63): R_lin 0.026246, G_lin 0.029557, B_lin 0.049707 → L = 0.005580 + 0.021139 + 0.003589 = **0.030308** (L + 0.05 = 0.080308).
- border-ghost night-300 over the cap: 0.36957 / 0.080308 = 4.6019 → **4.60:1** (≥ 3.0).
- border-control night-400 over the cap: 0.25125 / 0.080308 = 3.1286 → **3.12:1** (≥ 3.0). The thinnest margin on the page, and only at a star's 0.14 peak directly behind the select's edge; on plain bg-page it is 4.53 (U3), and on the stuck toolbar 4.07.
- ember-400 (CTA shape) against bg-overlay: 0.59918 / 0.07149 = 8.3813 → **8.38:1** (≥ 3.0).

Rules held: text-muted appears only inside the sheet, on solid bg-overlay, never over the starfield or a gradient; form controls sit only on the plain band or on solid surfaces (tokens.md §2.5 rule 7); the CTA glow is off in the sheet (rule 9); ember appears only on the sheet's one primary button (rule 1); there is no gradient on the page, so no status text over one (rule 8).

### 13.7 Zoom, reflow, text spacing, forced colors, print

- **320px:** the toolbar holds the "Filter and sort" button (about 210px with a badge) on one line; chips wrap; the grid is 2-up at 132px (product-card §5.4); the sheet is full width with 20px padding; no horizontal scroll.
- **200% / 400% zoom** (1280 × 800): the md / base layouts. At 400% the viewport is 320 × 200 CSS px and the 28rem height query applies: the header and the toolbar are not sticky, and **the sheet scrolls as one block**: under that query the `<form>` gets `overflow-y: auto; overscroll-behavior: contain` and the body becomes `flex: none; overflow: visible`, so head, body and foot scroll together instead of a fixed 64px head and 73px foot leaving about 15px for the options. Every option and both foot buttons stay reachable by scrolling.
- **Text spacing (WCAG 1.4.12):** no fixed heights around text: buttons, chips, option rows and the toolbar use `min-block-size` and padding; the toolbar may grow if a label wraps (it doesn't at the stated widths), and `--shop-toolbar-h` follows its measured height (§9.1), so the scroll margins still clear it.
- **Forced colors:** buttons and chips keep their 1px borders (system colours); checkboxes, radios and the select use `appearance: auto`; the toolbar and sheet get `Canvas` backgrounds; the badge's transparent border becomes an edge; the focus ring is an outline; decorative glyphs (`data-decorative`) are hidden.
- **Print:** the toolbar, chips, Show more and the sheet are `data-print="hide"`; the heading block, the results heading and the grid print (product-card §6: cards print without the quick add).

---

## 14. Copy (final)

### 14.1 Page

| Where | String |
|---|---|
| Eyebrow | **Every scent, every size** |
| h1 | **Shop all candles** |
| Intro | **Jars, pillars, travel tins, wax melts and gift sets. Filter by scent, size or collection to find your kind of night.** |
| Filters button, below md (visible) | **Filter and sort** |
| Filters button, md+ (visible) | **Filters** |
| Filters button, hidden suffix when n ≥ 1 | **, {n} applied** ("Filters, 2 applied") |
| Sort label (md+) | **Sort by** |
| Sort options | **Featured** · **Newest** · **Price: low to high** · **Price: high to low** |
| Sort submit, no-JS only | **Apply** |
| Results heading | **{n} products** / **1 product** / **0 products** |
| Applied chips list (`aria-label`) | **Applied filters** |
| Chip, hidden suffix | **, remove filter** |
| Clear all | **Clear all filters** |
| Progress line | **Showing {shown} of {total} products** |
| Show more | **Show more products** |

### 14.2 Filter sheet

| Where | String |
|---|---|
| Title, below md / md+ | **Filter and sort** / **Filters** |
| Close button (accessible name) | **Close filters** |
| Legends | **Sort by** (below md) · **Scent family** · **Type** · **Size** · **Collection** · **Price** |
| Sort radios | **Featured** · **Newest** · **Price: low to high** · **Price: high to low** |
| Option count | **({n})** after the label, e.g. "Floral (3)" |
| Reset | **Reset** |
| Reset replacement, no-JS only (link) | **Clear all filters** |
| Primary button | **Show {n} products** / **Show 1 product** / **Show 0 products** |
| Primary button, server render (before JS) | **Show products** |
| Sheet status | **{n} products match.** / **1 product matches.** / **No products match.** |

### 14.3 Option labels (new shop copy; the rest come from the data)

| Facet | Labels |
|---|---|
| Scent family | from catalog.json `scentFamilies[].label`: Floral · Fresh · Citrus · Woody · Gourmand · Smoky & amber |
| Type (`typeLabelsPlural`, new) | jar **Scented jars** · pillar **Pillar candles** · tin **Travel tins** · wax-melt **Wax melts** · gift-set **Gift sets** |
| Size (`sizeLabels`, new) | 120g **120 g** · 220g **220 g** · 380g **380 g** · 7x10 **7 × 10 cm** · 7x15 **7 × 15 cm** · 6-cubes **6 cubes** |
| Collection | from the data: each shown collection's `name` (§5.5) |
| Price (`priceBuckets`, new; labels built with the **whole-unit** formatter, §5.6) | under-25 **Under $25** · 25-40 **$25 to $40** · over-40 **Over $40** (never "$25.00") |

The new maps live in the shop's copy module (tech-agent's location), not in catalog.json (whose keys are mapped by M1.4's fixture test), the same choice product-card §9 made for its microcopy. The bucket config holds the label templates ("Under {min of next}", "{min} to {max}", "Over {max of previous}") and the boundaries; the formatter fills them.

### 14.4 Announcements

As §13.5: **"{n} products match your filters."** / **"1 product matches your filters."** / **"No products match your filters."** / **"Showing all {n} products."** / **"Sorted by featured."** / **"Sorted by newest."** / **"Sorted by price, low to high."** / **"Sorted by price, high to low."** / **"Showing {shown} of {total} products."**.

### 14.5 Empty, zero and error

| Where | String |
|---|---|
| Zero results, heading | **No candles match these filters** |
| Zero results, body | **Try removing a filter, or clear them all to see every candle.** |
| Zero results, link button | **Clear all filters** |
| Empty catalog, heading | **Nothing on the shelves just now** |
| Empty catalog, body | **Please check back soon, or head back to the home page for now.** |
| Empty catalog, link | **Go to the home page** |
| Error, h1 | **The shop didn’t load** |
| Error, paragraph | **We couldn’t show the candles just now. Please try again, and if it keeps happening, come back a little later.** |
| Error, button | **Try again** |
| Error, link | **Go to the home page** |

### 14.6 Notes

- `{n}`, `{shown}`, `{total}` are numerals; one is singular ("1 product"), every other number plural ("0 products").
- Apostrophes are U+2019 ("didn’t", "couldn’t", "shop’s"); "×" in sizes is U+00D7; the title separator is U+00B7.
- US spelling, USD `[confirm with user: currency]`. No production, material or wellness claims; no restock promises.
- "Shop all candles" matches the home section link that leads here (home.md §5.3), so the link text and the page it opens agree. Wax melts and gift sets are included under "candles" in the everyday sense, as on home.

---

## 15. Metadata (SEO)

| Field | Value |
|---|---|
| `<title>` (absolute, as home.md §12) | **Shop all candles · Starflames** |
| Meta description (≈ 150 characters) | **Every Starflames candle in one place: scented jars, pillars, travel tins, wax melts and gift sets. Filter by scent family, size, collection and price.** |
| Canonical | **`/shop`** for every query (filters, sort and pages are views of one page; the absolute URL arrives with M8.6) |
| Robots | Based on the **parsed state** (§7.3), not on which keys are present: when it **equals the default state** (no filter, `sort` featured, page 1), indexable; when it **differs**, **`noindex, follow`** (the cards' links are still followed). So `/shop?type=candle`, `/shop?sort=featured`, `/shop?page=1`, `/shop?page=5` (clamped to 1 with 17 products) and `/shop?utm_source=x` are indexable; `/shop?type=tin`, `/shop?sort=newest` and `/dev/shop?page=2` are `noindex, follow`. |
| Open Graph / Twitter | `og:title` and `og:description` as above; **no `og:image`** until M8.5/M8.6 (as home.md §12) |
| Structured data | none (M8.5) |

Set in the page's `generateMetadata` (it reads the same parsed state as the page, deduplicated with React `cache`, and uses the pure `isDefaultShopState(state)`, §18.2).

---

## 16. Data needs

| Need | Source | Fields |
|---|---|---|
| Cards | `getProducts()` (M1.6; one cached read of every published card, by `sortOrder`) | the card's own fields (product-card §10), plus for filtering and sorting: `type`, `scentFamilies`, `sizeKeys`, `collectionSlugs`, `priceFrom`, `priceTo`, `inStock`, `sortOrder`, `publishedAt` |
| Collection options | `getCollections()` (cached) | `slug`, `name`, `sortOrder` |
| Scent family labels | catalog.json `scentFamilies` (copy) | `slug`, `label`, `sortOrder` |
| Type, size and price labels | the shop copy module (§14.3) | — |
| Flags | `site-routes.ts` `features["product-pages"]`, `features["quick-add"]`; the `shop` registry row | `live` |

- Drafts and archived products never arrive (the repositories return published products only; product-card §6, check 10).
- No N+1: two cached reads per render, shared with the footer's `getCollections()` through React `cache`.
- Nothing reads `longDescription`, `scentNotes`, the gallery or variant details beyond `ProductCard`.

---

## 17. Images

- The only images are the product cards' (product-card §11): the 4:5 arched frame, `alt=""`, and the shop context's **`sizes`** exactly as product-card §5.3: `(min-width: 90rem) 264px, (min-width: 64rem) calc((100vw - 128px) / 3 - 32px), (min-width: 48rem) calc((100vw - 112px) / 3 - 32px), calc((100vw - 56px) / 2 - 24px)`.
- **Loading:** results **1–4** are `loading="eager"` (they cover the first row at every breakpoint: 2, 3, 3 or 4 cards, §4.3); result **1** also gets **`fetchPriority="high"`**; every other card, and every card added by Show more, is lazy. At base, results 3 and 4 sit just below the fold; loading them early costs two small images and keeps one rule for every width.
- No hero, no mood image and no new art direction: the page's colour comes from the products. The zero/empty crescent is an inline SVG glyph, not an image.
- Mock imagery: the existing `cat-*` shots (art-direction.md §3, §4.1); nothing new to generate.

---

## 18. Implementation notes for tech-agent

### 18.1 The Shop link goes live with the page (M3.5)

- Flip **`shop`** to `live: true` in `SITE_ROUTES` (`components/layout/site-routes.ts`) in M3.5. With no other change (header.md §3.1, footer.md §3.2):
  - **Header, lg+:** the Primary nav renders with one link, **Shop**, with `aria-current="page"` and its 2px gold-300 underline on `/shop` (header.md §7).
  - **Header, below lg:** the **menu button now renders** (a drawer item is live, header.md §5.2), and the drawer's Primary nav holds Shop (marked with the four-point star on `/shop`). The M1.15 "wordmark only" public-header e2e expectations change accordingly; update them in the same task.
  - **Footer:** the Explore group appears with Shop (footer.md §3.3).
  - **Home:** the bestsellers section link "Shop all candles" → `/shop` appears once M2.4 is built (home.md §5.3, §5.4).
- Every link these add points at `/shop`, which now exists, so the M1.20 fixture sees no 404.

### 18.2 For M3.4 (query design)

- **Pure state module** in `lib/domain` (no Firebase, Next or React imports), unit-tested: `facetOptions(cards, collections, labels)` (the §5.1 option rule, also the valid URL values), `parseShopParams(searchParams, facetOptions) → ShopState` (§7.3 rules), `isDefaultShopState(state)` (§15 robots), `shopQuery(state) → string` (canonical, §7.2), `canonicalSearch(currentSearch, state)` (the canonical keys followed by the unknown keys kept as they were, §7.3), `filterCards(cards, state)`, `facetCounts(cards, state)` (§5.1 rule), `sortCards(cards, sort)` (§6, sold-out last), `paginate(cards, page, 24)`. The server render and the client sheet use the same functions, so a count in the sheet always equals the results after Apply.
- **Server:** the page reads `searchParams` (so it renders per request, from the cached `getProducts()` / `getCollections()`; no Firestore read per visit) and renders the filtered, sorted page of cards (§2.4). The M1.4 plan (one cached query, everything in memory) holds up to its scale-out trigger (about 500 products).
- **No `loading.tsx` and no Suspense around the page content** (§11.2). The client islands take the parsed state as props from the page; none needs `useSearchParams` for its first render. Verify with the "no streamed fallback" check (§20 check 23).
- **Client:** for the live counts, the sheet needs a **compact facet index** of every published product (`slug`, `type`, `scentFamilies`, `sizeKeys`, `collectionSlugs`, `priceFrom`, `priceTo`, `inStock`; about 100–150 bytes each, so about 25 KB at 200 products), passed once as a prop to the sheet island. Not the full cards.
- **Applied changes:** the results must update within **500ms** of the input on a 4G phone, or keep the old results with the pending treatment (§11.6) and swap in one commit. Use a transition (`useTransition` with the navigation inside it) or an equivalent, so the old results stay until the new ones commit. Tech-agent chooses between a server round trip per change and rendering the cards on the client from data already sent, and **the choice must satisfy §11.5's rule that an in-page failure never renders `error.tsx`**; record the choice and its test in M3.4.
- **Re-render or remount: the build relies on neither.** Whether a search-param change remounts the page's subtree or only re-renders it is a router detail. In Next 16.4 the page segment's key is `"__PAGE__"` and the search is held separately, so it is probably a re-render, but nothing below may depend on that:
  - **Focus moves run after the commit, on elements found then.** Every focus move in §8.6, §9.5 and §10 runs once the new results have committed, on the element looked up at that point (by id, or a ref read from the committed tree), never on a node held from before the change. The tests in §20 assert `document.activeElement` after the results have updated.
  - **URL-derived island state re-syncs from props or the URL on every change**, never from a `useState` initialised once at mount: the sort select's value (controlled from the parsed state), the Filters button's badge and accessible name, the chips, and the sheet's staged state (reset from the URL state each time the sheet opens, §8.6). A re-render with new props must show the new state, and so must a remount.
  - **The sort-coalescing timestamp (§9.3) and the 500ms page-announcement timer (§13.5) live where a remount can't reset them:** in a layout-level client component (for example a provider in `app/(site)/shop/layout.tsx`, which persists across search-param changes) or at module scope. Not in the page's own component state.
- **Sort coalescing** (§9.3): the 1000ms push-or-replace window and the 500ms announcement debounce, kept where the previous point says.
- **Show more** may append on the client from a server-rendered next page or from data already sent; either way the URL is **replaced** (§7.4) and the no-JS link works (§10).
- **History:** push for applied changes, replace for Show more, sort runs and canonicalisation (§7.4); opening the sheet writes nothing. Back/Forward re-derive everything from the URL; on `popstate` the sheet closes instantly and discards (§8.6). The Android close request arrives as the dialog's `cancel` and needs no extra code.
- **Indexes:** none new (the `products (status, sortOrder)` and `collections (status, sortOrder)` indexes exist).

### 18.3 For M3.5 (build)

- Route: `app/(site)/shop/page.tsx` (Server Component) and `error.tsx` (§11.5). **No `loading.tsx`** (§11.2). `generateMetadata` per §15 (absolute title; robots from `isDefaultShopState`).
- Islands (client): the toolbar's stuck state and `--shop-toolbar-h` measurement (§9.1), `FilterButton` + `FilterSheet` (one island is fine), `SortSelect`, `AppliedFilters` (click interception over the server-rendered links), `ShowMore`, the page status writer. The heading block, results heading and grid stay Server Components (unless M3.4 chose client rendering of the results). Hydration must not change any markup: all state comes from the URL on the server, and links stay links.
- Reuse the header's dialog code where it fits (the `toggle`/`close`-derived `aria-expanded`, the scrim pointer check, the explicit focus return, the `@starting-style` CSS), **except the exit transition, which this sheet declares only under `@supports (overlay: auto)`** (§12). Invoker commands as header.md §13.4 (the `declare module "react"` augmentation).
- The sheet's flex-column structure and the short-viewport single scroller as §8.2 and §13.7.
- `ProductCard`: `context="shop"`, `headingLevel={3}`, the flags at the call site, `imageLoading="eager"` for results 1–4, and a pass-through for `fetchPriority="high"` on result 1 (product-card §11 anticipates it; add the prop if M3.2 didn't).
- `<li id="result-{n}">` on every grid item (1-based, continuous across Show more), covered by the results' scroll margin (§13.3).
- The band is `plain`; no `@source` change is needed (`components/shop/` is under `components/`; the dev pages in `app/dev/shop/` are under `app/`).
- No GSAP, no new dependency.
- Starfield markup rules: no bare text nodes in the band; no `pointer-events: none` on cards or text (starfield.md §4.5). (The probe's `pointer-events: none` is on an empty, invisible span, not on text.)
- Screenshots: add **`/shop`** to the `ROUTES` loop in `tests/e2e/screenshots.spec.ts` (it has no expected errors); the named shots and the dev routes are in §19 and §20 check 28.

---

## 19. Dev preview

The seed has 17 products and no sold-out product, so Show more, sold-out ordering, the empty catalog and the error state can't be seen on `/shop`. Three dev routes, gated by `requireDevPages()` in the page and its `generateMetadata`, each rendered inside `<SiteShell>` (the opt-in, layout-shell §13.2) so they look like the real page:

| Route | Renders | Notes |
|---|---|---|
| `/dev/shop` | the real shop UI over a **synthetic catalog of 51 cards**: the 17 seed cards, plus two copies of each with `slug` `{slug}-copy-2` / `{slug}-copy-3`, `name` "{name} (copy 2)" / "{name} (copy 3)" and `sortOrder` continuing after the seed (18–51); **"Lakelight (copy 3)"** has every variant unavailable (`inStock: false`) | Show more (24 → 48 → 51), sold-out last in every sort, facets and counts over 51 cards. The copies share images with their originals. Cards use the public flags (unlinked), so nothing links to unbuilt product pages. Its Show more and chip links point at `/dev/shop?…`, not `/shop`. Like `/shop`, no `loading.tsx`. |
| `/dev/shop/empty` | the shop over **0 cards** | the empty-catalog state (§11.4) |
| `/dev/shop/error` | the `ShopError` component, statically (no error is thrown) | §11.5; its "Try again" calls a no-op `retry` |

- Each page starts with a dev banner (`<p>`, `type-caption`, text-muted, inside the Container, above the heading block), so the page keeps a single `<h1>` (the shop's, or the error's).
- **Rendering and the gate (fixed at build time).** `/dev/shop` uses the same rendering as `/shop`, so it reads `searchParams` and renders per request; `requireDevPages()` then runs on every request. CLAUDE.md says the dev pages are "built only when `ENABLE_DEV_PAGES=true`", so **the gate's outcome must be decided at build time**, not by the `next start` process's environment: a build made without the flag serves 404 for every `/dev/shop*` route even if the server is started with `ENABLE_DEV_PAGES=true`, and a build made with it serves them. Tech-agent chooses the mechanism (for example, `next.config.ts` maps the build's `ENABLE_DEV_PAGES` into an inlined constant that `app/dev/gate.ts` reads, so the value is compiled into the server bundle; or a module generated at build time) and confirms that `npm run check:client-bundle` still passes, since the constant must only reach server code. It updates the `app/dev/gate.ts` comment ("The pages are static, so this runs once, at build time") to describe the build-time constant. With that, CLAUDE.md stays accurate and needs no change. If no build-time mechanism works, tech logs pushback in `PROGRESS.md` before building and the orchestrator brings the CLAUDE.md wording to the user. The other two routes are static.
- The synthetic data is built in the page code from `getProducts()` and never leaves these pages.

Dev copy:

| Where | String |
|---|---|
| `/dev/shop` banner | **Dev preview: the shop over 51 sample products (the seed three times, one sold out), for testing Show more and sold-out ordering. Not built for production.** |
| `/dev/shop/empty` banner | **Dev preview: the shop with no published products. Not built for production.** |
| `/dev/shop/error` banner | **Dev preview: the shop’s error state. Not built for production.** |
| Synthetic names | **{name} (copy 2)** · **{name} (copy 3)** |
| Titles (`generateMetadata`) | **Shop preview · Starflames** · **Shop preview: empty · Starflames** · **Shop preview: error · Starflames** |

---

## 20. E2E acceptance checklist (build review, M3.5)

On `/shop` unless stated; `mobile-390` and `desktop-1440` unless stated. Expected seed values come from §5; orders that depend on `publishedAt` are derived from the data in the test, never hard-coded. Every focus assertion is made after the new results have rendered (§18.2). Wall-clock budgets are only in the `@perf`-tagged sub-checks (6b, 10b), which run in the serial pass (CLAUDE.md); every other check waits with Playwright's auto-waiting assertions and must hold under parallel load.

1. **Route and metadata.** `/shop` returns 200 with exactly one `<h1>` "Shop all candles"; the title is "Shop all candles · Starflames"; the meta description is §15's; the canonical is `/shop`; no `noindex`. `/shop?type=tin` and `/shop?sort=newest` have `noindex, follow` and the canonical `/shop`; `/shop?utm_source=x`, `/shop?sort=featured`, `/shop?page=1` and `/shop?type=candle` have no `noindex` (the parsed state is the default).
2. **Shop link live.** At 1440 the header's Primary nav has a "Shop" link with `aria-current="page"`; at 390 the menu button exists and the drawer's Shop link is current; the footer's Explore group has Shop. No 4xx/5xx and no console error (the M1.20 fixture) on `/shop`, `/` and every URL in these checks.
3. **Default state.** 17 cards in `sortOrder`; the results heading reads "17 products"; no chips, no Clear all, no Show more; the Filters button's accessible name is "Filter and sort" (390) / "Filters" (1440) with no badge; at 1440 the sort select shows "Featured".
4. **Grid and images.** 2 cards per row at 390 and 4 at 1440 (product-card §5.3 widths ±1px); every card `<img>` has §17's `sizes` exactly; results 1–4 have `loading="eager"`, result 1 has `fetchpriority="high"`, results 5+ are lazy; each card heading is an `h3` inside the results `section`.
5. **Facet options and seed counts.** Open the sheet: the legends are Sort by (390 only), Scent family, Type, Size, Collection, Price; the options and counts equal §5.2–§5.6 (for example "Woody (4)", "Scented jars (7)", "220 g (7)", "Starlit Library (4)", "Under $25 (5)"); there is no "Set" size option; the price labels are exactly "Under $25", "$25 to $40", "Over $40".
6. **Apply through the sheet.** Check "Travel tins": the primary button reads "Show 3 products", and the sheet status reads "3 products match." (both with auto-waiting assertions, no time budget). Press it: the URL is `/shop?type=tin`, the grid shows Late Bloom, Margin Notes, Quiet Shore in that order, the heading reads "3 products", one chip "Travel tins" exists, the Filters button's name is "Filters, 1 applied" (1440) / "Filter and sort, 1 applied" (390) with the badge "1", focus is on the Filters button, and the page status reads "3 products match your filters.".
   - **6b `@perf`** (serial pass). With the sheet open, checking "Travel tins" changes the primary button's text to "Show 3 products" within **100ms** of the click (measured in the page: a `MutationObserver` on the button records `performance.now()` against the click's timestamp), with no network request between the two (§8.5); the sheet status text appears 500ms (±150ms) after the click.
7. **OR within, AND across.** `/shop?scent=floral&scent=citrus` shows 5 cards: Moonrise, Late Bloom, Margin Notes, Quiet Shore, Little Constellation Set. `/shop?scent=woody&type=jar` shows only Ink & Cedar, and the heading reads "1 product". `/shop?size=220g` shows 7 cards and no gift set.
8. **Live counts, disabled options, Show 0.** With "Travel tins" staged: Scent family shows "Floral (1)" and "Citrus (2)", and Fresh, Woody, Gourmand and Smoky & amber show "(0)" and are `disabled`; Tab skips them. A checked option is never disabled. Then, from a fresh sheet: check Fresh, Floral and Travel tins ("Show 1 product"), uncheck Floral: the button reads "Show 0 products" and is enabled; pressing it leads to `/shop?scent=fresh&type=tin` with the zero-results state (check 16's elements) and both chips.
9. **Price buckets.** `?price=under-25` 5 cards, `?price=25-40` 9, `?price=over-40` 9; Moonrise appears in both of the last two.
10. **Sort.** `?sort=price-asc` starts Fir Hollow, Gilded Plum, Late Bloom, Margin Notes, Quiet Shore; `?sort=price-desc` starts Reading Nook Set, Little Constellation Set, Comet Season Gift Box, Comet Tail; `?sort=newest` follows `publishedAt` descending with ties by `sortOrder` (computed from the data). At 1440, choosing "Price: low to high" in the select changes the URL to `/shop?sort=price-asc` (one new history entry), keeps focus on the select, and the page status reads "Sorted by price, low to high.". At 390, the sheet's Sort by radios do the same through Apply.
    - **10b `@perf`** (serial pass; the timings are wall-clock). **Coalescing:** from `/shop` at 1440, three `selectOption` changes 100ms apart (Newest, Price: low to high, Price: high to low) leave the URL `/shop?sort=price-desc`, `history.length` one higher than before the first, and exactly one page-status text, "Sorted by price, high to low."; a fourth change made 1.5s after the third adds one more entry.
11. **Canonical URLs.** Loading `/shop?type=tin&scent=citrus&scent=citrus&type=candle&sort=featured&fbclid=abc` renders the same 2 cards as `/shop?scent=citrus&type=tin` (Margin Notes, Quiet Shore), and after hydration `location.search` is `?scent=citrus&type=tin&fbclid=abc` (the unknown key kept, after the canonical keys) with `history.length` unchanged; `/shop?utm_source=pin&type=tin` becomes `?type=tin&utm_source=pin`. `?page=abc` and `?page=0` render page 1; `?sort=cheapest` renders featured order. Every chip and Clear all `href` on these pages is canonical and carries no unknown key.
12. **Back and Forward.**
    - **Applied states:** from `/shop`, apply Travel tins, then open the sheet again and apply Citrus as well. Back shows the Travel tins state (3 cards, its chip, and the sheet's Travel tins checked on reopening); Back again shows 17 cards; Forward twice restores the two-filter state.
    - **The sheet writes no history:** opening the sheet and closing it with Close, Esc or the scrim leaves `location.href` and `history.length` unchanged.
    - **Back as navigation while open:** on `/shop?type=tin` reached by an apply from `/shop`, open the sheet, check Citrus, then `page.goBack()`: the dialog is closed (no `dialog[open]`), the URL is `/shop`, 17 cards and no chip are shown, reopening the sheet shows nothing checked (the staged Citrus was discarded), and focus is on the Filters button.
    - **Back as a close request** (Android system Back) is the dialog's `cancel`, covered by Esc in check 13; the build review confirms it by hand on an Android phone (Chrome): the sheet closes and the URL stays.
13. **Sheet accessibility.** Opening: a `dialog` named "Filter and sort" (390) / "Filters" (1440) is open, the Filters button has `aria-expanded="true"`, focus is on "Close filters", and `html` has computed `overflow: hidden`; `document.documentElement.clientWidth` is unchanged. Tab and Shift+Tab stay inside the dialog. Esc closes it: the staged change is discarded (URL unchanged), `aria-expanded="false"`, focus is on the Filters button. A click on the scrim closes it the same way; a drag that starts on an option and ends on the scrim doesn't. At 1440 the drawer's head has `padding-block-start` resolving from `env(safe-area-inset-top)` (0 in the harness) and its inline-end padding is ≥ 24px.
14. **Reset.** With Travel tins applied, open the sheet: Reset is visible; press it: every checkbox is unchecked, the primary button reads "Show 17 products", the URL is unchanged, Reset is gone and focus is on the first enabled option of the first visible fieldset. With nothing staged, Reset is not rendered.
15. **Chips and Clear all.** With `?scent=citrus&type=tin`: the chips are links named "Citrus, remove filter" and "Travel tins, remove filter"; activating "Citrus" leaves `?type=tin` and moves focus to the "Travel tins" chip; activating it leaves `/shop` and moves focus to the results heading. With two filters and `sort=price-asc`, Clear all filters leaves `/shop?sort=price-asc`, focus on the results heading, and the page status reads "Showing all 17 products.".
16. **Zero results.** `/shop?type=wax-melt&collection=lakeside-hush`: the heading reads "0 products", there is no grid `ul`, the h3 "No candles match these filters" and its body are shown, both chips are shown, and the block's "Clear all filters" leads to `/shop` with 17 cards.
17. **Empty catalog** (`/dev/shop/empty`): no toolbar, no results heading, no Filters button; the h2 "Nothing on the shelves just now", its body and the "Go to the home page" link (`href="/"`).
18. **Show more** (`/dev/shop`). 24 cards; "Showing 24 of 51 products"; the link's `href` ends `?page=2#result-25`. Click: 48 cards, `location.search` contains `page=2`, `history.length` unchanged, focus on the 25th card's heading, page status "Showing 48 of 51 products.". Click again: 51 cards, no Show more block, focus on the 49th. A direct load of `?page=2` renders 48 cards. "Lakelight (copy 3)" (sold out) is the last card in featured, newest and both price sorts.
19. **No JavaScript** (`javaScriptEnabled: false`). `/shop?type=tin` renders the 3 cards, the chip and the badge in the server HTML; the chip is a link to `/shop`. At 1440 the sort form shows its "Apply" button, and choosing "Price: high to low" then Apply navigates to a URL whose state is `type=tin` + `sort=price-desc` (the 3 tins, all $18, in `sortOrder`). The Filters button opens the sheet through its invoker command (Chromium in the harness supports `command`); checking "Citrus" and pressing "Show products" navigates to a URL whose state is `scent=citrus` + `type=tin` (2 cards; the address bar may carry `sort=featured`, §7.2). The sheet's foot shows the "Clear all filters" link instead of Reset. On `/dev/shop`, following "Show more products" lands on `?page=2#result-25` with the 25th `<li>`'s top ≥ the toolbar's bottom (±1px) at both widths.
20. **Sticky toolbar.** After `scrollTo(0, 800)`: the toolbar's top edge equals the header's bottom edge (±1px), `data-stuck="true"`, and its surface's computed opacity is 1 once the transition ends; at scroll 0 `data-stuck="false"`. Resizing the viewport from 1440 to 390 wide (header 80 → 64px) at scroll 0 and then scrolling by 1px past the stick point flips `data-stuck` to `"true"` at the new offset (the observer was recreated). At a 390 × 400 viewport (the 28rem height query) the toolbar is `position: relative`. Tabbing back up through the grid on `/dev/shop` never leaves the focused element under the toolbar or the header (its box top ≥ the toolbar's bottom). **Toolbar height, grow and shrink:** at rest the toolbar's border box is 60px tall (±0.5px), its computed `min-block-size` is `60px`, and the band's inline `--shop-toolbar-h` is `60px`. A test style that makes the Filters label wrap (for example `font-size: 3rem` on it) makes the toolbar taller, and the variable follows the new border-box height (±0.5px); removing the style returns the toolbar to 60px (it shrinks back) and the variable to `60px`. In each of the three states the results heading's computed `scroll-margin-top` equals the variable plus 16px.
21. **Motion** (`@motion`).
    - **Reduced motion** (the `-reduced-motion` projects): opening and closing the sheet, the panel's computed `transform` is `none` at every sampled frame, and the only transitions on it are `opacity` (150ms) and the discrete `overlay` / `display`. After an apply, `getAnimations({ subtree: true })` on the results grid has no running animation.
    - **Exit placement** (both project kinds): in the page's CSSOM, every rule that gives `#shop-filters` (closed, not `[open]`) or its `::backdrop` a non-empty `transition-property` sits inside a `CSSSupportsRule` whose `conditionText` is `(overlay: auto)`. After `page.goBack()` with the sheet open (check 12), `dialog#shop-filters` has no running animation or transition on the next frame.
22. **CLS.** CLS < 0.05 on `/shop` and `/shop?type=tin` at 390 and 1440 across load, scroll (the toolbar sticking), opening the sheet, applying and closing; no layout-shift entry without a recent input is attributed to the toolbar, chips, heading or grid.
23. **No streamed fallback.** A document request (`request.get`) for `/shop?type=tin` returns HTML whose `<main>` contains the results heading "3 products" and the three card names (Late Bloom, Margin Notes, Quiet Shore), and no element with `aria-busy`. **No pending Suspense marker inside the results:** load the response HTML into a JavaScript-disabled page (`page.setContent(html)`) and walk the comment nodes (a `TreeWalker` with `NodeFilter.SHOW_COMMENT`) inside `section[aria-labelledby="results-heading"]` and inside the heading block (`.ShopHeading`, or the element that holds the `<h1>`): none has the data `$?`. The rest of `main` is not checked, because Next's own `<Suspense name="Next.MetadataOutlet">` (streamed metadata for non-bot user agents) may leave a pending marker there; that boundary is allowed and is no fallback of ours. There is no `loading.tsx` under `app/(site)/shop/`, `app/(site)/` or `app/` (a Node-only file check). During an apply with the in-page data request delayed by 1s (if M3.4 makes a request per change; `page.route` adds the delay), the old grid stays in the DOM and visible (dimmed after 300ms, §11.6) until the new one replaces it, and no element reading "Loading" appears.
24. **Error** (`/dev/shop/error`): one h1 "The shop didn’t load", the paragraph, a "Try again" button and a "Go to the home page" link; the header and footer are present. Plus M3.4's test that an in-page failure keeps the current results and never renders the error boundary (§11.5). **That test provokes a failure on purpose**, which gives a 5xx response and/or a console error that the `tests/e2e/fixtures.ts` auto fixture would fail on. So it sits in its **own `test.describe`** with a narrow `test.use({ expectedIssues: [...] })`: one pattern for the provoked request's URL (it matches both the "HTTP 5xx: <url>" line and the "Failed to load resource … [<url>]" line; give the provoked request a unique marker, for example a test-only query parameter set by the `page.route` handler, if its URL isn't unique on its own), and, only if M3.4's mechanism logs one, one pattern for that exact console message. Nothing broader (no `/HTTP 500/` or `/console error/` catch-all), so any other 4xx, 5xx or console error still fails the test. The other tests in this file keep the fixture's default (no expected issues).
25. **Reflow.** At 320px wide on `/shop?scent=citrus&type=tin&size=120g&collection=lakeside-hush`: no horizontal scroll; the toolbar is one 60px row; the four chips wrap; with the sheet open, every option row is reachable by scrolling and the primary button is fully visible.
26. **Contrast spot checks.** The computed colours of the eyebrow, h1, intro, results heading, Filters button (text, border, badge), select (text, fill, border), chips, Clear all, and in the sheet the title, legends, labels, counts, disabled labels, checkbox borders and checked fill, Reset and the primary button match the tokens in §13.6.
27. **Keyboard order at 1440.** Tab from the end of the header reaches, in order: Filters → Sort by select → each chip → Clear all filters → (Show more on `/dev/shop`) → the footer's first link. No card has a tab stop while `product-pages` and `quick-add` are off.
28. **Screenshots.** `shop-<project>.png` (the `ROUTES` loop) plus named shots: `shop-filtered` (`/shop?scent=citrus&type=tin`, full page), `shop-zero` (`/shop?type=wax-melt&collection=lakeside-hush`, full page), `shop-sheet-open` (390 and 1440; open the sheet and check Travel tins; `fullPage: false`), `shop-stuck` (scrolled 800px; `fullPage: false`), `dev-shop-paginated` (`/dev/shop` after one Show more; full page), `dev-shop-empty`, `dev-shop-error` (full page). Compared with §4, §8, §9 and §11.
29. **Drafts never shown** (product-card check 10, now on `/shop` too): no "(draft fixture)" or "(archived fixture)" text and no `data-slug` of `fixture-draft-tin` or `fixture-archived-bestseller`, and every facet count equals the published-only counts in §5.

Unit tests (`npm run test:unit`): `facetOptions` (the one §5.1 rule for every facet: a published collection with no published product has no option; an unpublished collection has none; a bucket no product reaches has none), `parseShopParams` (every §7.3 rule: unknown keys and values, duplicates, case, `page` edge cases, unpublished and product-less collections ignored), `isDefaultShopState` (`type=candle`, `sort=featured`, `page=1` and a clamped page are default; any valid filter, a non-default sort or page ≥ 2 is not), `shopQuery` (key and value order, defaults omitted, round trip with the parser), `canonicalSearch` (unknown keys kept in order after the canonical keys), `filterCards` (OR within, AND across, gift-set scent families, `set` never matched by a size, price overlap at the 2499 / 2500 / 4000 / 4001 boundaries), `facetCounts` (the §5.1 rule, including counts for a facet that has its own selection), `sortCards` (each sort, ties by `sortOrder`, `null` `publishedAt` last, sold-out last), `paginate` (24, the last page, clamping), and the label maps (every seed size key except `set` has a label; every type has a plural label; the three price labels are exactly "Under $25", "$25 to $40", "Over $40", and every bucket boundary used in a label is a whole number of dollars).

---

## 21. IP guardrail

I re-read every string in §14, §15 and §19 against CLAUDE.md (again after fix round 1, which adds no visitor-facing string and removes the skeleton's "Loading products" and its dev banner and title; and again after the post-pass minors, which change no visitor-facing string):

- **New strings:** "Every scent, every size", "Shop all candles", the intro ("Jars, pillars, travel tins, wax melts and gift sets. Filter by scent, size or collection to find your kind of night."), the toolbar, sheet, chip, count and Show more labels, the announcements, "No candles match these filters", "Nothing on the shelves just now", "The shop didn’t load" and its paragraph, the meta description, and the dev banners and titles. They are ordinary shop and interface words. "Find your kind of night" echoes the brand's own home heading ("Choose your kind of night", already IP-checked in home.md §15); it is generic atmosphere wording, not a title, epithet or quote.
- **From the data, already checked** (catalog.md §7): the scent family labels, the collection names (Moonlit Terrace, Starlit Library, Ember Grove, Lakeside Hush, Comet Season, Gift Sets) and the product names in the examples.
- **Not used:** no character, place, court or book names; no author name; no quotes or close paraphrases; no invented terms (peoples, factions, magic, titles); no "Night Court", "Court of …" or "High Lord/Lady"; no "city of …" or "house of …" epithets; nothing about stars falling, star showers, wishing on stars or wings; "frost" is never paired with "starlight"; no seasonal court names. The only motif glyphs are the crescent moon and the small flame (brand motifs).
- **No claims:** no hand-poured, small-batch, material or wellness claims; no restock promise in the empty states.
- **Identifiers** (`shop-filters`, `data-shop-toolbar`, `data-stuck`, `data-scroll-offset-probe`, `data-shop-results-enter`, `data-closing-instant`, `--shop-toolbar-h`, `results-heading`, `result-{n}`, `sizeLabels`, `typeLabelsPlural`, `priceBuckets`, `facetOptions`, `parseShopParams`, `isDefaultShopState`, `shopQuery`, `canonicalSearch`, `facetCounts`, `copy-2`) are generic English.

Confirmed clean.

---

## 22. Open questions (each with the default in force)

1. **Filters in a sheet on desktop too** (no sidebar, §2.1). `[confirm with user]` Default: the sheet at every width, with the sort select visible in the toolbar from md. A possible later addition, **not built**: at lg+, a short row of type links or pills (Scented jars, Pillar candles, Travel tins, Wax melts, Gift sets) beside the toolbar for one-click narrowing, each a canonical link like the chips. It would need its own spec section (keyboard order, active state, how it relates to the sheet's Type fieldset).
2. **Price buckets** Under $25 / $25 to $40 / Over $40, in USD (§5.6). `[confirm with user: currency and price points]` Default: as written.
3. **Sold-out products sort last** in every sort (§6), rather than being hidden or left in place. `[confirm with user]` Default: shown, last.
4. **Show more in steps of 24** (§2.3, §10), rather than numbered pages. Default: Show more.
5. **Gift sets don't match a size filter** (§5.4). Default: as written; "Gift sets" is in Type.
6. **Filtered and sorted views are `noindex`, canonical `/shop`** (§15). `[M8.5 confirms]` Default: as written.
7. **No "In stock only" or "Limited / New" filter** at launch (not in the task's list). Add later if the catalog grows sold-out items or more drops. Default: not included.
8. **A "skip past the products" link** is not added (§13.2). `[revisit at M4.3]` Default: none.
9. **Tracking keys in the address bar** (§7.3). `[revisit at M8 with the analytics decision]` Default: the canonicalising `replaceState` keeps `utm_*`, `fbclid` and every other unknown key, so a landing page view keeps its attribution; URLs the page writes afterwards carry the canonical state only. Once analytics is chosen, M8 decides whether to strip them after the page view is recorded.
