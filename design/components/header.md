# Site header (M1.14)

Status: spec, **QA PASSED**, with post-pass minors 1–12, post-pass check fix round 1 and the post-pass minors from M1.15/M1.17 reviews applied (changelog below). Owner: design-agent. Implemented by tech-agent in M1.15.
Builds on the header contract in [`layout-shell.md`](./layout-shell.md) §6 (box, `--header-h`, sticky, `--z-header`, opaque-on-scroll surface, safe areas, short viewports), §2 (landmarks, layers), §3.4 (`--scroll-offset`), §9 (labels, keyboard, print) and §11 (reserved labels). Reads the shared route registry defined in [`footer.md`](./footer.md) §3.2.1. Uses [`tokens.md`](../system/tokens.md) (§2.3 roles, §3 contrast, §7 focus, §8 top layer, §9 touch targets and §9.1 layout variables), [`typography.md`](../system/typography.md) (§3 wordmark, §4 `nav` and `h3` steps, §6.1, §7.4), [`motion.md`](../system/motion.md) (§2, §3, §5 drawer pattern, §6 reduced motion) and [`accessibility.md`](../system/accessibility.md) (§3–§7). Nothing here loosens those files.

## Changelog

**Post-pass minors from M1.15/M1.17 reviews** (2026-10-09)

1. §8.1, §8.3, §9: the scroll threshold is worded one way everywhere, matching §13.1 and layout-shell §6.2: the surface fades in **once the page is scrolled more than 8px** (was "at 8px of scroll" in §8.1, "the 8px threshold" in §8.3, "scroll past 8px" in §9). Wording only; no behaviour change.

**Post-pass minors from M1.13/M1.15 reviews** (2026-10-09)

1. §7.3: the More links (Search, FAQ, Contact us) also get `aria-current="page"`, the star marker and text-primary when current; the icon buttons never do.
2. §13.1: the scroll-state sentinel is rendered at the start of `main`, positioned at the top of the document; the header counts as scrolled at more than 8px.
3. §7.1: on `/search` at md+, the drawer's Search is hidden and the bar's Search icon takes no `aria-current`. Recorded: when Search is scheduled, the bar's Search icon gets `aria-current="page"` on /search (no visual change).
4. §13.1: the captureRoute call order is `captureRoute(page, "/dev/header", testInfo, { name, fullPage })`.

**Post-pass check fix round 1** (2026-10-09)

1. §3.4, §11.3, §13.1, §13.5: `/dev/header` is a **static** page. The GET form and its `?bag=` / `?current=` / `?signedIn=1` parameters are gone (`routeSlug()` strips queries, so the shots collided; each change was a fresh load, so the first-read rule made the live-region check impossible; `searchParams` made the page dynamic, against `app/dev/gate.ts`). A client `HeaderPreviewProvider` (no DOM) wraps `<SiteHeader preview />` and `<main>`, exactly as footer.md §3.6 does; the controls in `main` write its state and the header's client islands read it. The named gate shots are produced by Playwright actions and saved under explicit names: **captureRoute gains a `name` option and a `fullPage` option (tech, M1.13)**. `/dev/header` stays the single route in `ROUTES`. e2e checks 7 and 8 use the controls, not URLs.
2. §3.1, §3.2, §12, §13.1: footer.md §3.2.1 is the **single registry source**. §3.2 now refers to it and keeps only the header-only notes. The shared module is `components/layout/site-routes.ts` (the `RouteEntry` type and the per-placement helpers `headerPrimary()`, `headerMore()`, `headerAccount(signedIn)`, `headerBag()`); §12 lists the full field set. `nav-routes.ts` is removed.

**Post-pass minors 1–12** (2026-10-09)

1. §8.3: the desktop crescent sits under the Search/Account x-range (about x 1254–1307 at 1440), in the bar's bottom 8px, below the icon boxes. Wording fixed; the conclusion stands.
2. §5.7: the fallback note now gives the minimum versions (`@starting-style`, `allow-discrete`, `overlay`) and the mixed case in Safari and Firefox (exit outside the top layer, `::backdrop` gone at once): degraded, not broken.
3. §5.3, §13.1: `html { scrollbar-gutter: stable }` is set **permanently** in `globals.css`, with the reason. The scroll-lock rule keeps only `overflow: hidden`.
4. §5.5: focus return is explicit. The dialog's `close` handler calls `menuButton.focus()` (Safari doesn't focus a button on click or tap, so the native restore has nothing to return to), and the wordmark link's `focus()` in the lg case.
5. §5.2, §13.4: invoker commands stay optional. The `declare module "react"` augmentation with lowercase `command` / `commandfor` is given, and `aria-expanded` is derived from the dialog's `toggle` and `close` events. Support: Chrome 135, Firefox 144, Safari 26.2.
6. §13.4: the no-JS requirement is widened. The footer must carry **every** drawer-only link: the four primary links, FAQ, Contact us, the account link, and Search when it is live.
7. §5.6, §10.2: the drawer's Search link is hidden from md up (it is in the bar there). The §10.2 drawer order is now given per breakpoint.
8. §5.6: the drawer's inline-end padding is `var(--page-inline-end)`, so the close button lands exactly where the menu button was.
9. §3.4: extra `/dev/header` gate shots (390 with the menu open, the scrolled state, bag counts 3 and 120). The preview controls are a plain GET form, so each state is a URL. *(Superseded by post-pass check fix round 1, item 1: client controls and named shots.)*
10. §6.1: badge typography is `type-caption font-medium tabular-nums`. The overlap of "99+" with the bag glyph is measured and confirmed as intended.
11. §11.1, §15: "Bag" is kept, marked `[confirm with user]`.
12. §3.2, §15: the route decisions now recorded in `TASKS.md` are referenced (M3.6 `/collections` index, M8.1 `/our-story`, M8.3 `/collections/gift-sets`). `/search` has no task and is marked `[confirm with user: search at launch?]`.

---

## 1. Purpose and acceptance criteria

Purpose: one calm, always-present bar that gets a phone visitor from Instagram or Pinterest to the shop, a collection or their bag in one tap, and stays legible over everything that scrolls under it. The wordmark is the signature; products stay the focus.

Acceptance criteria (from M1.14, refined):

1. **Content per breakpoint** (§2): the wordmark (home link, accessible name "Starflames"); primary nav (Shop, Collections, Gift sets, Our story); utility actions (search, account, a bag with a live item count). What shows at 390, 768, 1024 and 1440. Mobile-first: a thumb-friendly bag and a menu button that opens a navigation drawer.
2. **Routes** (§3): every link points only to a built route (the M1.20 fixture fails on 404 prefetches). The target of every item for later milestones, and the **exact M1.15 state**.
3. **Mobile menu** (§5): open/close, focus containment, Esc, focus return, `aria-expanded` / `aria-controls`, scroll lock, top-layer `<dialog>` (tokens.md §8), motion with a reduced-motion fallback, and its content.
4. **Bag button** (§6): the gold `badge-count` badge (never ember), the accessible name, a polite live region for changes, the zero state, the 99+ cap, and the static M1.15 state.
5. **Desktop nav** (§7): `aria-current="page"` plus a visual cue that isn't colour alone, hover and focus, and the Collections dropdown decision.
6. **Search and account** (§3, §4.4): hidden until their milestone, with no reserved space.
7. **States and contrast** (§8): at rest vs scrolled; a contrast check for each state over the worst case beneath, including the hero images in `assets/images/hero/` and a mitigation within tokens.
8. **Copy, touch targets, keyboard order, forced colors, print** (§10, §11).
9. **Implementation notes** for M1.15 (§13): a Server Component shell plus small client islands, no layout shift, tokens used, e2e checks.
10. **IP guardrail** (§14).

---

## 2. Content and layout

### 2.1 What is in the bar, per breakpoint

"Built" means the item's route exists (§3). Items that aren't built are not rendered and take no space.

| Item | base (320–767, designed at 390) | md (768–1023) | lg (1024–1439) | xl (1440+) |
|---|---|---|---|---|
| Wordmark home link | yes, start edge | yes | yes | yes |
| Primary nav (Shop, Collections, Gift sets, Our story) | in the menu drawer | in the menu drawer | **inline in the bar**, centred | inline, centred |
| Search | in the drawer | **icon button in the bar** (not repeated in the drawer, §5.6) | icon button | icon button |
| Account (Sign in / Your account) | in the drawer | in the drawer | **icon button in the bar** | icon button |
| Bag | **icon button in the bar** | icon button | icon button | icon button |
| Menu button | **yes, end edge** | yes, end edge | no (`display: none`) | no |

Why the nav moves inline only from lg: at md, the four links (about 380px with their padding) plus the wordmark, three icon buttons and the 32px gutters come to about 768px with no room left, and none at all under the text-spacing override. The bar never grows a second row (layout-shell §6.1). At 1024 the same content needs about 820px of 1024, and about 880px under the text-spacing override, so it fits.

### 2.2 Order and alignment

DOM order is visual order (layout-shell §9.4). From start to end:

1. Wordmark link
2. Primary `<nav aria-label="Primary">` (lg and up; below lg the bar's copy is `display: none` and the drawer holds the only Primary nav, layout-shell §9.3)
3. Utility group: Search, Account, Bag (each only when built and shown at that breakpoint)
4. Menu button (below lg)

Grid of the bar, inside the page `Container` (so the wordmark lines up with the content edge, layout-shell §6.1):

- **base and md:** `display: flex; align-items: center; justify-content: space-between`. Wordmark at the start; the utility group and the menu button together at the end with an 8px gap (step 2) between the 44px targets.
- **lg and xl:** `display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; column-gap: 2rem` (step 8). Wordmark in column 1 (start), the nav in column 2 (truly centred on the bar), the utility group in column 3, justified to the end. When a column is empty (M1.15) the grid still holds its shape.

Height: the bar is exactly `block-size: var(--header-h)` (64 / 72 / 72 / 80px), plus `padding-top: env(safe-area-inset-top, 0px)` on the `<header>`, and inline padding `--page-inline-start` / `--page-inline-end` through the `Container` (layout-shell §6.1, §6.4). Every item is vertically centred.

### 2.3 Diagrams (all items built, as from M8)

**390 (base):**

```
|<--------------------------- 390 ---------------------------->|
| 20 |<------------------------ 350 ------------------------>| 20 |
+----------------------------------------------------------------+
|    [Starflames]                           [bag 44]8[menu 44]   |  64px (+ top inset)
+----------------------------------------------------------------+
      wordmark 28px tall                     badge on the bag
```

**768 (md):**

```
| 32 |[Starflames]                    [search]8[bag]8[menu]| 32 |   72px
```

**1440 (xl):**

```
| 80 |[Starflames]     Shop  Collections  Gift sets  Our story     [search]8[account]8[bag]| 80 |   80px
       1fr (start)                 auto (centred)                    1fr (end)
```

### 2.4 Thumb reach

The bag and the menu button sit at the **end (right) edge**, the side a one-handed right thumb reaches most easily on a 390px phone, and the menu drawer opens from that same edge (§5.6). A top bar is never in the most comfortable thumb zone, so the header doesn't try to be the only route to the bag: it is always visible (sticky), its targets are 44×44 with 8px between them, and the in-page primary actions take the lower screen (the sticky "Add to bag" bar in M4, layout-shell §6.4). A bottom tab bar was considered and rejected: it would compete with the M4 sticky bar and the home indicator, and it adds a second permanent band of chrome to a calm design.

---

## 3. Routes and the M1.15 state

### 3.1 Rule

**An item is rendered only when its route is built.** The M1.20 fixture fails a test on any 404, and Next prefetches every visible `<Link>`, so a link to an unbuilt route breaks the e2e suite. Non-link placeholders ("coming soon" text in the bar) were considered and rejected: a visible nav item that does nothing reads as broken to a visitor, and a disabled-looking item in the primary nav weakens the shop.

So the header reads the one shared route registry, `components/layout/site-routes.ts` (defined in footer.md §3.2.1; §13.1). Each entry carries `key`, `label`, `href`, `milestone`, `live` and its `footer` and `header` placements (§12). tech-agent flips `live` in the same task that builds the route, and the item appears in the header and the footer together with no other change. No space is reserved for items that aren't live; the bar is server-rendered, so an item appearing in a later build never shifts anything at runtime.

### 3.2 Targets: the shared registry

**The single source is footer.md §3.2.1**: the `RouteEntry` type and the one table of keys, labels, hrefs, milestones, `live` flags and placements. This spec doesn't repeat that table. The header reads its rows through the per-placement helpers in the same module (§13.1):

| Header placement | Helper | Keys, in registry row order | Renders as |
|---|---|---|---|
| `primary` | `headerPrimary()` | `shop`, `collections`, `gift-sets`, `our-story` | the bar's Primary nav from lg (§4.2); the drawer's Primary nav below lg (§5.6) |
| `more` | `headerMore()` | `search`, `faq`, `contact` | the drawer's More nav (§5.6); Search also as the bar's icon button from md (§2.1) |
| `account` | `headerAccount(signedIn)` | `sign-in` (signed out), `account` (signed in) | the bar's icon button from lg; the drawer's account link below lg |
| `bag` | `headerBag()` | `bag` | the bar's bag button (§6) |

Each helper returns only live entries (or `null` for the single-entry helpers), in registry row order, so the nav order (Shop, Collections, Gift sets, Our story) is fixed whatever subset is live. The `{ preview: true }` option (dev pages only) treats every entry as live (§3.4). The route decisions behind the rows are recorded in `TASKS.md` (M3.6 `/collections` index, live with M3.7; M8.1 `/our-story`; M8.3 enriches `/collections/gift-sets`, no separate `/gift-sets` route). Search has no task `[confirm with user: search at launch?]` (§15 question 2).

Header-only notes:

- **The wordmark is not a registry entry.** Its link to `/` is always rendered.
- **Bag:** `/bag` is the bag page (M5.4). M5.3 may turn the click into opening the cart drawer, keeping `/bag` as the no-JS target; the registry row doesn't change.
- **Names:** the icon buttons use the entry's `label` as their accessible name (Search, Sign in, Your account). The bag's name is computed from the count (§6.2); its label "Bag" is the name before the count is known.

### 3.3 Exact M1.15 state on public routes

- The bar renders the **wordmark home link only**. No Primary nav (in the bar or the drawer), no search, no account, no bag, **no menu button** (a menu with no links would be a dead control).
- The scroll-state island (§8.1) ships in M1.15 and runs on every `(site)` page.
- The menu drawer, the nav, the icon buttons, the badge and the live region are all **built and tested in M1.15**, but only visible on the dev preview page (§3.4).
- Every `<a>` in the M1.15 header resolves to a built route (the wordmark's `/`).

### 3.4 Dev preview: `/dev/header`

A dev-only page (gated like `/dev/tokens`, `ENABLE_DEV_PAGES=true`, by `requireDevPages()` in the page and its `generateMetadata`) that renders the **full header**, every item as if live, so QA can review it and the M1 gate has real screenshots.

- Links to unbuilt routes are rendered as **plain `<a href>`, not `next/link`**, on this page only, so nothing is prefetched and the fixture sees no 404. Tests never follow them.
- **The page is static.** It reads no `searchParams`, cookies or headers, so it is prerendered at build time and the `app/dev/gate.ts` comment ("The pages are static, so this runs once, at build time") stays accurate. Every preview state is client-side, the same pattern as footer.md §3.6.
- **Structure.** `app/dev/header/page.tsx` returns a fragment:

  ```
  <HeaderPreviewProvider>
    <SiteHeader preview />
    <main id="main" tabIndex={-1}> h1, intro, <HeaderPreviewControls />, scroll filler </main>
  </HeaderPreviewProvider>
  ```

  `HeaderPreviewProvider` is a client component that holds the preview state and renders **only the context provider, no DOM element**, so `<header>` and `<main>` stay direct children of `<body>` (`app/dev/layout.tsx` returns its children unwrapped). React context reaches only descendants, which is why the provider wraps both: the controls inside `main` write the state, and the header's client islands read it. `SiteHeader` stays a Server Component, passed in as a child.
- **State** (defaults in brackets): bag count (0; options 0, 1, 3, 99, 120), current page (None; options in §11.3), signed in (unticked).
- **Who reads it.** `BagButton` takes its count from the context; `NavLink` takes its current path from the context instead of `usePathname()`; `AccountLink` (bar and drawer) picks its entry with `headerAccount(signedIn, { preview: true })`. With no provider (every public route) the context is `null`, and each island uses its real source.
- **`preview` prop:** a boolean. It makes `SiteHeader` call the registry helpers with `{ preview: true }` (every entry live) and render plain anchors. It carries no state.
- **Controls** (`HeaderPreviewControls`, client, inside `main`; dev-only copy, §11.3): an "Items in the bag" `<select>`, a "Current page" `<select>` and a "Signed in" checkbox.
- `main` holds an `<h1>`, the intro, the controls, and at least 2,000px of plain content so the scrolled state can be tested. The page has no footer, which is fine here.
- **`/dev/header` is the single route in the screenshot `ROUTES` list** (M1.20), giving `dev-header-<project>.png`.
- **Extra gate shots**, produced by Playwright actions on the loaded page (each shot starts from a fresh `page.goto("/dev/header")` and waits for hydration). **captureRoute gains a `name` option and a `fullPage` option (tech, M1.13):** `name` replaces `routeSlug(route)` in the file name, so each shot is saved as `test-results/screenshots/<name>-<project>.png`; `fullPage` defaults to `true`.

| Shot (`name`) | Width(s) | Playwright actions | `fullPage` |
|---|---|---|---|
| `dev-header-bag-3` | 390 and 1440 | select "3" in "Items in the bag"; wait for the badge text "3" | `true` (default) |
| `dev-header-bag-120` | 390 and 1440 | select "120" in "Items in the bag"; wait for the badge text "99+" | `true` (default) |
| `dev-header-menu-open` | 390 | click Menu; wait for `dialog#site-menu[open]`; captureRoute's `animations: "disabled"` finishes the slide-in | **`false`** |
| `dev-header-scrolled` | 390 and 1440 | `window.scrollTo(0, 200)`; wait for `data-scrolled="true"` (the disabled animations finish the surface fade) | **`false`** |

The menu-open and scrolled shots are viewport shots because what they show (a top-layer dialog over the viewport, a sticky bar over content at scroll 200) is the visitor's view of the viewport, not of the whole page.

---

## 4. Components

### 4.1 Wordmark home link

- `<a href="/">` (`next/link`) containing the outer `<svg role="img" aria-label="Starflames">` with `<use>` (typography.md §3.2, §3.4). Accessible name **"Starflames"**.
- Height `--wordmark-h-header` (28 / 32 / 36px). The link has `min-height: var(--size-touch)` and `padding-block` that centres the SVG (8px at base), no inline padding, so its start edge is the content edge.
- Colour `text-wordmark` (gold-300). Hover: `text-primary`, `duration-fast`, no underline. Focus: the global ring. Never `aria-current` (the home page's position is clear from its h1).

### 4.2 Primary nav (lg and up)

- `<nav aria-label="Primary"><ul>` with `<li><NavLink>` items, `display: flex; gap: 0.5rem` (step 2).
- Each link: `type-nav` (Jost 500, 15–16px), `white-space: nowrap`, `min-height: var(--size-touch)`, `padding-inline: 0.75rem` (step 3), inline-flex, centred. Not underlined at rest (navigation chrome, like the wordmark; the always-underline rule is for links in running text).
- States in §7.

### 4.3 Icon buttons (search, account, bag, menu)

Shared recipe:

| Property | Value |
|---|---|
| Box | `inline-size` and `block-size` `var(--size-touch)` (44px), inline-flex, centred, `rounded-pill`, `border: 1px solid transparent` (visible edge in forced colors, tokens.md §7) |
| Glyph | inline SVG, 24×24, `stroke="currentColor"`, 1.5px stroke, round caps and joins, `fill="none"`, `aria-hidden="true"`, `focusable="false"` |
| Colour | `text-text-primary` (U-pair 16.52 at rest, 14.85 scrolled) |
| Hover | glyph to gold-300 (`text-link`), `duration-fast`, `ease-standard` |
| Active | glyph `scale(var(--motion-scale-press))`, `duration-fast` (0.98; 1 under reduced motion) |
| Focus-visible | the global ring (2px gold-300, 2px offset) |
| Name | `aria-label` from §11 (icon-only, so the name is the whole label) |
| Disabled | never used: an action that can't work is hidden (§3.1) |

- **Search** is a link (`<a href="/search">`), since it goes to a page. Glyph: a magnifier.
- **Account** is a link. Glyph: a simple head-and-shoulders outline.
- **Bag** is a link to `/bag` (§3.2, §6). Glyph: a shopping bag with two handles, matching the site's "bag" wording.
- **Menu** is a `<button type="button">` (§5). Glyph: three horizontal strokes, the middle one shorter (a calm, slightly asymmetric mark). No hamburger-to-cross morph: the drawer's own close button takes its place (§5.6).

---

## 5. Mobile menu (below lg)

### 5.1 Element: a top-layer `<dialog>`

**Decision: a native `<dialog id="site-menu">` opened with `showModal()`**, not a custom element. Per tokens.md §8, it gives the inert background (the header, main and footer can't be focused or read), Esc to close, and focus containment for free, and it paints in the top layer above every z value, so no `--z-drawer` is needed. Its `::backdrop` is the scrim (`bg-bg-scrim`). It is rendered as the last element inside the header component's markup; being in the top layer when open, it never lives in the header's stacking context visually (layout-shell §6.3).

### 5.2 Menu button

```
<button type="button" aria-label="Menu" aria-expanded="false"
        aria-controls="site-menu" aria-haspopup="dialog" data-print="hide">
```

- `aria-expanded` is `"true"` while the dialog is open and `"false"` otherwise. It is **derived from the dialog's own events**, never only from the click handler: the `toggle` event (`event.newState` is `"open"` or `"closed"`) where the browser fires it on dialogs, and the `close` event everywhere, plus one read of `dialog.open` when the island mounts. So every way of opening (the JS path or a native invoker command, §13.4) and every way of closing keeps it right.
- `aria-controls="site-menu"` names the dialog.
- The name stays **"Menu"** in both states (the state is carried by `aria-expanded`).
- Rendered only when at least one drawer item is live (§3.3).

### 5.3 Opening

- Trigger: activating the menu button (click, Enter, Space).
- `dialog.showModal()`; then `aria-expanded="true"` (§5.2).
- **Initial focus: the close button**, the first focusable element in the dialog (native dialog focusing; no `autofocus` needed). Screen readers announce the dialog by its name, "Menu".
- **Scroll lock:** `html:has(#site-menu[open]) { overflow: hidden; }`. The page behind can't scroll. The drawer itself scrolls if it is taller than the viewport (`overflow-y: auto; overscroll-behavior: contain`), so a short landscape screen still reaches every link.
- **Scrollbar gutter: `html { scrollbar-gutter: stable; }`, set permanently** in `globals.css` (not only while the menu is open). Why this option:
  - With classic, space-taking scrollbars (Windows and Linux desktops), `overflow: hidden` removes the scrollbar, so without a reserved gutter the page would widen by about 15px and jump sideways when the menu opens.
  - Reserving the gutter only at lock time is wrong on a page that doesn't overflow: the gutter would then *appear* at lock time and shift the page the other way. Applying it "only when the page overflows" needs a JS measurement on every resize and content change, for no visible gain.
  - Permanent `stable` means the page width never changes when a scrollbar appears or disappears, including when a page grows past the viewport after content loads.
  - The cost is an empty strip at the end edge on short pages with classic scrollbars. It shows the `html` background (bg-page), so on the night theme it is invisible. Overlay scrollbars (iOS, Android, macOS by default) take no space, so the rule changes nothing there.

### 5.4 Focus containment

- `showModal()` makes everything outside the dialog inert, so Tab and Shift+Tab cycle through the dialog's focusables only (the browser's own UI may come between the last and the first, which is the native behaviour and acceptable).
- No custom focus trap is written.

### 5.5 Closing, and where focus goes

**Focus is moved explicitly.** The dialog's native focus restore returns focus to whatever was focused when it opened, but Safari doesn't focus a `<button>` on click or tap, so after a pointer open there was nothing focused to return to and focus would fall to `<body>`. So the island's `close` handler always sets focus itself: `menuButton.focus()`, or `wordmarkLink.focus()` in the lg case below (the menu button is hidden there). Both elements are held by refs in the island.

| Way to close | Behaviour | Focus after |
|---|---|---|
| Close button ("Close menu") | `dialog.close()` | `menuButton.focus()` in the `close` handler |
| **Esc** | native `cancel`, then close | `menuButton.focus()` |
| Tap or click on the scrim | close when the pointer-down **and** pointer-up both land outside the panel's rect (so a drag that starts on a link doesn't close it). `closedby="any"` may be used where supported; the JS check is the fallback. | `menuButton.focus()` |
| A link inside the drawer is activated | close, then the navigation proceeds | `menuButton.focus()` (the button stays in the bar on the new page; Next's route announcer reads the new page) |
| The route changes some other way (back/forward) | close | `menuButton.focus()` |
| The viewport grows to lg (≥ 64rem) while open | close at once, without animation | the menu button is now hidden, so `wordmarkLink.focus()` |

On every close, `aria-expanded="false"` (from the `close` event, §5.2) and the scroll lock lifts (the `:has()` rule stops matching).

### 5.6 Drawer layout

| Property | Value |
|---|---|
| Position | top layer, `position: fixed`, `inset-block: 0`, `inset-inline-end: 0`, `inset-inline-start: auto`, `margin: 0`, `max-block-size: none`, `max-inline-size: none` (reset the UA dialog box) |
| Width | `min(22rem, 100% - 3rem)`: 342px at 390 and 272px at 320, so a 48px strip of scrim stays tappable on the start side |
| Surface | `bg-bg-overlay`, `shadow-overlay`, `rounded-s-lg` (radius-lg on the leading edge only, tokens.md §5), `border-inline-start: 1px solid transparent` (forced colors) |
| Padding | block-start `env(safe-area-inset-top, 0px)`; inline-start step 6 (24px); **inline-end `var(--page-inline-end)`**; block-end `calc(1.5rem + env(safe-area-inset-bottom, 0px))` |
| Layout | flex column, full height |

Inline-end padding: `--page-inline-end` is already `max(var(--gutter), env(safe-area-inset-right, 0px))` (tokens.md §9.1), the same value that pads the bar's end edge, so no extra `max()` is needed. The drawer's end edge is the viewport's end edge, so the close button's end edge lands exactly where the menu button's was: 20px from the edge at 390, 32px at md, and under the notch inset in landscape. (With a classic desktop scrollbar the two can differ by the gutter width; that only happens on a narrow desktop window and is accepted.)

Content, top to bottom (each group only when it has live items):

1. **Top row**, `block-size: var(--header-h)`, items centred. The **close button** (icon button recipe, §4.3, glyph: a thin ×) sits at the end, at the same height and inline position as the menu button it replaces, so a second tap in the same spot closes the menu. Nothing at the start.
2. **Primary nav**: `<nav aria-label="Primary"><ul>` with the four links in the fixed order. Each link: `type-h3` (Cormorant 600, 24px at 390; typography.md §4.1 notes, §6.1: links styled h3, not headings), **text-primary** (Cormorant at 24px is text-primary only on dark, typography.md §7.4), `min-block-size: 3.5rem` (56px), full width, block-start aligned. Spacing step 6 (24px) below the top row.
3. Divider: a 1px `gradient-starlight-rule`, step 6 (24px) above and below.
4. **More**: `<nav aria-label="More"><ul>` with Search, FAQ, Contact us. `type-nav`, text-secondary, `min-block-size: var(--size-touch)`. **Search's `<li>` is `display: none` from md up** (`md:hidden`), because from md the Search icon button is in the bar (§2.1); a duplicate would be one more stop in the drawer for no gain. Below md it is the only route to search.
5. **Account**: one link ("Sign in" or "Your account", §11) with the account glyph before the label (20px, `aria-hidden`), `type-nav`, text-primary, 44px tall. Not in a `<nav>`. It stays in the drawer at md, where the bar has no account button.
6. **Brand line**, pushed to the bottom (`margin-block-start: auto`, at least step 8 above it): a 16px crescent-moon glyph in gold-400 (`aria-hidden`, `data-decorative`) and the line "Candles for long, starlit evenings." in `type-body-sm`, text-secondary. It is plain text, not focusable.

The bag stays in the bar and is not repeated in the drawer (the bar's bag button is one tap away after closing).

### 5.7 Motion

Pattern: motion.md §5 "Drawer / sheet". CSS only (no GSAP), using the dialog's own open state.

| What | Enter | Exit |
|---|---|---|
| Panel | `transform: translateX(100%)` → `none` over `--duration-slow` (400ms), `--ease-enter` | `none` → `translateX(100%)` over `--duration-base` (250ms), `--ease-exit` |
| Scrim (`::backdrop`) | `opacity: 0` → `1`, same duration and easing as the panel | `1` → `0`, same as the panel |

- Mechanism: the start state in `@starting-style` for `#site-menu[open]` and its `::backdrop`; the exit through `transition` on `transform`/`opacity` plus `overlay` and `display` with `transition-behavior: allow-discrete`, so the dialog stays in the top layer until its exit has finished. `overlay` and `display` are discrete switches, not animated properties, so motion.md §1 holds (only transform and opacity animate).
- **Support and fallbacks.** Minimum versions: `@starting-style` Chrome 117, Safari 17.5, Firefox 129; `transition-behavior: allow-discrete` Chrome 117, Safari 17.4, Firefox 129; a transition on `overlay` **Chromium 117 only**. So:
  - Chromium 117+: enter and exit animate exactly as specified.
  - Safari 17.5+ and Firefox 129+ (no `overlay`): the enter animates. On exit the dialog leaves the top layer at once, so the panel's slide-out runs **outside the top layer** (as a fixed element inside the header's stacking context), and the **`::backdrop` disappears at once** instead of fading. Focus, inert, Esc and the close itself all work. Degraded, not broken.
  - Browsers without `@starting-style` or discrete transitions open and close instantly, which is correct, just not animated.
- **Reduced motion** (motion.md §6.2, "Drawer / sheet / mobile menu"): the panel never moves (`transform: none` in both states); the panel and scrim fade with `opacity` 0 ↔ 1 over `--duration-fast` (150ms), `--ease-standard`.
- Nothing in the drawer is staggered; the links are simply there.
- No layout shift: the dialog is in the top layer and out of flow, and the permanent scrollbar gutter (§5.3) keeps the page width when the lock removes the scrollbar.

### 5.8 Contrast inside the drawer (bg-overlay)

| Pair | Ratio |
|---|---|
| Primary links, text-primary on bg-overlay | 12.80 (T4) |
| More links, text-secondary on bg-overlay | 8.72 (T9) |
| Brand line, text-secondary body-sm | 8.72 (T9) |
| Current marker (four-point star), gold-300 on bg-overlay | 9.64 (T22) |
| Link hover, gold-300 | 9.64 (T22) |
| Close glyph, text-primary | 12.80 (T4) |
| Focus ring | 9.64 (U7) |
| Crescent glyph gold-400 (decorative) | 7.72 (T18), exempt anyway |

---

## 6. Bag button

### 6.1 Badge

| Property | Value |
|---|---|
| Role | `badge-count` (tokens.md §2.3): fill **gold-400**, text **text-inverse**. Never ember (tokens.md §2.5 rule 1). |
| Text | the count, **`type-caption font-medium tabular-nums`**: the caption size (13px, the smallest size on the site, typography.md §7.4), weight 500, tabular figures so "1" and "8" take the same width and the badge doesn't change size between counts of the same digit length |
| Box | `min-inline-size: 1.25rem; min-block-size: 1.25rem` (20px), `padding-inline: 0.375rem` (6px), `rounded-pill`, text centred, `border: 1px solid transparent` (forced colors). `min-` sizes, never fixed sizes, so the text-spacing override can't clip it. |
| Position | `position: absolute` inside the 44px button, `inset-block-start: 0.25rem; inset-inline-end: 0.125rem`, over the bag glyph's top-end corner. Being absolute, it never changes the button's size. |
| Hidden from AT | `aria-hidden="true"`: the button's name already carries the count (§6.2). |
| Zero | **no badge at all** (not a "0"). |
| Cap | 1–99 shows the number; **100 or more shows "99+"**. |

Contrast: text-inverse on gold-400, **9.96** (T31). The badge fill as a shape against the header: gold-400 on bg-page 9.96 (at rest) and on bg-raised 8.96 (scrolled), the same pairs as T16 and T17 (U5 values).

**Overlap with the glyph, measured (and intended).** In the 44px button the 24px glyph occupies x 10–34, y 10–34. The badge spans y 4–24 and grows towards the start from 2px inside the end edge (x 42):

| Count | Badge width (about) | Badge x | What of the glyph it covers |
|---|---|---|---|
| 1–9 | 20px (the minimum) | 22–42 | the top-end corner: the end handle |
| 10–99 | 29px | 13–42 | both handles and the top-end of the body |
| 99+ | 36px | 6–42 | the full width of the glyph's top 14px (both handles); the lower 10px of the bag body stays visible |
| 99+ under the text-spacing override | about 41px | 1–42 | the same, still inside the button |

**Decision: the "99+" overlap is intended.** 100 or more items is the rare case the cap exists for; the lower body of the bag still reads as a bag; the button's name gives the real number ("Bag, 120 items"); and the badge stays **inside** the 44px button in every case, so it never overlaps the menu button or the 8px gap between them. Moving the badge outward (anchoring it at the glyph's centre and letting it grow towards the end) was considered and rejected: at "99+" it would cross the button's edge into the gap and onto the menu button's target.

### 6.2 Accessible name and announcements

- Name (`aria-label` on the link): **"Bag, empty"** for 0, **"Bag, 1 item"** for 1, **"Bag, {n} items"** for 2 and up, with the real number even above 99 ("Bag, 120 items").
- Before the count is known (server render and the first client frame), the name is **"Bag"** and no badge shows. Once the count is read, the name updates; nothing moves.
- **Live region:** a visually hidden `<span role="status">` (implicitly `aria-live="polite"`) inside the header, next to the bag link, present and empty in the server HTML. When the count **changes after it has first been read**, its text becomes "Your bag has 1 item", "Your bag has {n} items" or "Your bag is empty". The first read on page load is never announced. Rapid changes are coalesced: only the latest text is written, after 500ms without a further change.
- M5.3 (the cart drawer and toasts) must not announce the count a second time: its "Added to your bag" toast names the product, and this region gives the count.
- The live region lives in the header, so while a top-layer dialog is open it is inert; M5.3 handles announcements made while its own drawer is open, inside that drawer (tokens.md §8).

### 6.3 M1.15 state

The bag doesn't exist yet, so on public routes the bag button is **not rendered** (§3.3). On `/dev/header` it renders with the count from the `HeaderPreviewProvider` context, set by the "Items in the bag" control (0, 1, 3, 99, 120; §3.4), so the badge, the cap, the names and the live region can be tested. The first read (the default 0) is not announced; every later change through the control is. M5.4 connects it to the cart store and flips `live`.

---

## 7. Desktop nav states

### 7.1 Current page

- `NavLink` sets `aria-current="page"` when the current path equals the item's target, or starts with the target followed by `/` (so `/collections/moonlit-terrace` marks Collections).
- **Search on `/search` at md and up:** the drawer's Search link is hidden there (§5.6), and the bar's Search icon button takes no visible current-page cue. When Search is scheduled, the bar's Search icon gets `aria-current="page"` on /search (no visual change).
- **Only one item is current at a time, the most specific match.** On `/collections/gift-sets`, Gift sets is current, not Collections.
- Product pages and other routes outside the four targets mark no item (the breadcrumb, M3/M4, carries location there).
- **Visual, not colour alone:** the current link is text-primary with a **2px gold-300 underline** (`text-decoration-line: underline; text-decoration-thickness: 2px; text-underline-offset: 0.4em`). The other links have no underline at rest. The cue is the presence of the line, not its colour.

### 7.2 States table

| State | Text | Underline |
|---|---|---|
| Default | text-secondary (11.25 at rest T7, 10.12 scrolled T8) | none |
| Hover | text-primary (16.52 T2 / 14.85 T3), `duration-fast` | 1px, currentColor, same offset |
| Current (`aria-current`) | text-primary | 2px gold-300 (12.45 at rest / 11.19 scrolled as a non-text cue, U7 values) |
| Current + hover | text-primary | stays 2px gold-300 |
| Focus-visible | unchanged colours plus the global ring on the link box | as its state |
| Active (press) | as hover | as hover |

Underlines are not animated (no width or position transitions); they appear with the hover colour change.

### 7.3 In the drawer

The current link keeps text-primary (all drawer links are) and gains a **12px four-point star in gold-300** before its label (`aria-hidden="true"`), with `aria-current="page"` on the link. Hover: the label turns gold-300. The star is the non-colour cue. The More links (Search, FAQ, Contact us) follow the same rule: when current, they get `aria-current="page"`, the star marker and text-primary. The bar's icon buttons never get the star marker or the colour change.

### 7.4 Collections: no dropdown

**Decision: Collections is a plain link to the collections index**, at launch and for the foreseeable future. No dropdown and no mega menu.

- There are six collections (`design/copy/catalog.md` §3). An index page with their arched images shows them better than a text list, and costs one tap.
- Hover menus are fragile on touch and with keyboards (hover intent, `aria-expanded` disclosure, Esc handling, focus loss), and a mega menu would put product imagery under the header's opaque surface rules.
- Revisit only if the collection count passes about ten; that would be its own spec.

---

## 8. States and contrast

### 8.1 At rest vs scrolled

The surface mechanism is layout-shell §6.2 (an opaque `bg-raised` pseudo-element fading in once the page is scrolled more than 8px, `data-scrolled`, the no-JS and forced-colors rules). This spec adds the pairs for every element in the bar.

| Element | At rest: over bg-page + starfield | Scrolled: opaque bg-raised |
|---|---|---|
| Wordmark gold-300 | 12.45 (T20) | 11.19 (T21) |
| Nav default, text-secondary | 11.25 (T7) | 10.12 (T8) |
| Nav hover/current, text-primary | 16.52 (T2) | 14.85 (T3) |
| Current underline gold-300 | 12.45 | 11.19 |
| Icon glyphs text-primary | 16.52 | 14.85 |
| Icon hover gold-300 | 12.45 | 11.19 |
| Badge fill gold-400 (shape) | 9.96 | 8.96 |
| Badge text, text-inverse on gold-400 | 9.96 (T31) | 9.96 (T31) |
| Focus ring | 12.45 (U7) | 11.19 (U7) |

### 8.2 Worst case beneath, per state

- **Scrolled:** the surface is opaque, so nothing beneath (product photos, haze or dusk bands, the hero) affects contrast. The pairs above are the worst case.
- **At rest:** the header is in normal flow (layout-shell §6.1), so at scroll 0 **no content sits under it**: not the hero, not a haze band. A haze or dusk band that starts the page begins below the bar. What is beneath is bg-page and the fixed starfield only.
- **The starfield under the bar.** A star core (moon-50) directly behind a nav label would drop its contrast towards 1:1, and the starfield is fixed, so its top band is always behind the header. **Requirement for M1.18:** the starfield draws **no stars, constellation lines or particles in the top `var(--scroll-offset)` of the layer** (the header band, including the top safe area). This band is only ever seen at rest (once scrolled, the header is opaque), so a star-free strip there costs little and makes the at-rest pairs above exact. M1.18 may instead prove a composite there that keeps text-secondary at 4.5:1 or more, but the star-free band is the expected answer.

### 8.3 The hero images (`assets/images/hero/`)

Checked by reading `hero-mobile.png` (1792×2240, 4:5) and `hero-desktop.png` (2688×1520):

- Both have a deep navy sky across their top, with scattered star points and a **thin crescent moon high on the right**.
- **hero-mobile at 390** (full-bleed, 487.5px tall): the top 64px of the image (the bar's height) is the top 294 source pixels: navy sky with stars, and the **crescent at about x 283–302, y 41–59 CSS px**, which is exactly behind the bag and menu buttons (x 282–370 at 390).
- **hero-desktop at 1440** (full-bleed, 814px tall): the top 80px is sky with dense small stars; the **crescent at about x 1254–1307, y 75–134 CSS px**. Horizontally that is under the Search and Account x-range (at 1440: Search x 1212–1256, Account x 1264–1308, Bag x 1316–1360). Vertically it only enters the bar in its **bottom 8px** (y 72–80; the crescent starts at about y 75), **below the icon boxes** (y 18–62 in the 80px bar), and continues below the bar from there.
- **Worst-case region: the crescent moon** (and the brightest star cores), a near-white ivory. Taken conservatively as white `#FFFFFF`: text-primary over it is **1.14:1**, so any label or icon there fails outright.

**Decision:** the hero is never under the header at rest. By the layout-shell contract the hero starts below the bar (in flow), and when it scrolls under the bar the bar is already opaque (it turns opaque once the page is scrolled more than 8px). So with the contract as written, **header text never meets the hero image**, and no scrim is needed in M1.15.

**Mitigation, reserved for M2.1 only.** If the home hero spec ever wants the image to run up under a transparent header (pulling the first band up by `--scroll-offset`), the header gets an over-image variant (`data-over-image="true"`, not built in M1.15):

- Under the whole header box, a layer of **`bg-scrim`** (night-950 at 72%, an existing token), solid across the bar, optionally fading to transparent over 2rem **below** the bar's bottom edge, where there is no text.
- Composite of bg-scrim over white (the conservative worst case): (76, 78, 86) `#4C4E56`, L = 0.2126 × 0.07227 + 0.7152 × 0.076185 + 0.0722 × 0.09306 = **0.07657** (L + 0.05 = 0.12657).
- Pairs over it: text-primary 0.915573 / 0.12657 = **7.23** (pass), gold-300 wordmark and focus ring 0.68983 / 0.12657 = **5.45** (pass), text-secondary nav 0.62372 / 0.12657 = **4.92** (pass 4.5), badge fill gold-400 as a shape 0.55225 / 0.12657 = **4.36** (pass 3:1). text-muted is never used in the header.
- This meets accessibility.md §7 (a scrim of at least 60% night under text, with its ratio stated against the lightest image region).
- When scrolled, the opaque surface covers the scrim as usual.

---

## 9. Motion summary

| What | Trigger | Animates | Duration / easing | Reduced motion |
|---|---|---|---|---|
| Header surface | page scrolled more than 8px / back to 8px or less | `::before` opacity 0 ↔ 1 | `--duration-base` / `--ease-standard` (layout-shell §6.2) | 150ms opacity (token remap) |
| Drawer panel | open / close | `translateX(100%)` ↔ `none` | enter `--duration-slow` / `--ease-enter`; exit `--duration-base` / `--ease-exit` | no movement; opacity 150ms |
| Drawer scrim | open / close | `::backdrop` opacity | as the panel | opacity 150ms |
| Icon press | `:active` | glyph `scale(0.98)` | `--duration-fast` / `--ease-standard` | scale 1 (token remap) |
| Hover colours, underlines | hover | `color` (state change, not motion) | `--duration-fast` | unchanged |
| Badge | count changes | nothing: the number swaps in place | — | — |

No GSAP in the header. Nothing animates on page load. The badge never pulses or bounces (motion.md §1).

---

## 10. Accessibility

### 10.1 Structure

- `<header>` is the banner (layout-shell §2.1). It contains no headings.
- The bar's `<nav aria-label="Primary">` (lg and up) and the drawer's `<nav aria-label="Primary">` (below lg) are never in the accessibility tree together: the bar's is `display: none` below lg, and the drawer's is inside a closed dialog until opened (and the drawer can't be open at lg, §5.5).
- The drawer's second nav is "More". Every nav label is unique on the page (with the footer's "Footer" and "Legal").

### 10.2 Keyboard order

| Breakpoint | Order (after the skip link) |
|---|---|
| base | Wordmark → Bag → Menu |
| md | Wordmark → Search → Bag → Menu |
| lg, xl | Wordmark → Shop → Collections → Gift sets → Our story → Search → Account → Bag |
| Drawer open, base (below md) | Close menu → Shop → Collections → Gift sets → Our story → Search → FAQ → Contact us → Sign in / Your account (then wraps) |
| Drawer open, md (768–1023) | Close menu → Shop → Collections → Gift sets → Our story → FAQ → Contact us → Sign in / Your account (then wraps). No Search: it is in the bar (§5.6). |

Only live items take part (§3). M1.15 public: Wordmark only.

### 10.3 Touch targets

Every control is at least 44×44 (`--size-touch`): the wordmark link (44 tall), nav links (44 tall), icon buttons (44×44), drawer primary links (56 tall), drawer secondary and account links (44 tall), the close button (44×44). Adjacent targets in the bar keep 8px between them.

### 10.4 Text spacing, zoom, 320px

- No element in the header has a fixed `height` around text: the bar's `block-size` holds single-line, `nowrap` items; links and the badge use `min-` sizes and padding.
- Under the WCAG 1.4.12 override (line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em) the inline nav at 1024 measures about 880px of 1024, so it still fits on one line. At 390 and 1440 the bar keeps its height and nothing overflows.
- 200% zoom on a 1280px window is a 640px viewport (base layout, menu button); 400% is 320px (base layout, header not sticky under the 28rem height query, layout-shell §6.5).
- At 320 the full base bar (wordmark about 120px, bag, menu, gutters) fits with room to spare.

### 10.5 Forced colors

- The header's background is `Canvas` (layout-shell §6.2). The drawer's background becomes `Canvas` natively, and its transparent leading border becomes a visible system-colour edge.
- Icons and the wordmark use `currentColor`, so they follow `LinkText` / `ButtonText`.
- The current-page underline is a text decoration, so it stays visible in the forced text colour. The drawer's star marker is decorative and may disappear; `aria-current` and the forced underline (§7.1 rule also applied to drawer links under `forced-colors: active`: `text-decoration-line: underline`) carry the state there.
- The badge's transparent border becomes a visible edge around the number.
- The focus ring is an outline and survives.

### 10.6 Print

- The header prints `position: static` (layout-shell §9.6), with **only the wordmark** (it prints black through `currentColor`).
- `data-print="hide"` on the bar's nav, the utility group (search, account, bag), the menu button and the live region. The dialog is closed when printing from the page; `dialog:not([open])` is hidden anyway.

---

## 11. Copy (final)

### 11.1 Header and drawer

| Where | String |
|---|---|
| Wordmark link, accessible name (from the SVG) | **Starflames** |
| Primary nav label (`aria-label`, bar and drawer) | **Primary** (layout-shell §11) |
| Nav item 1 | **Shop** |
| Nav item 2 | **Collections** |
| Nav item 3 | **Gift sets** |
| Nav item 4 | **Our story** |
| Search, accessible name (bar) and drawer link text | **Search** |
| Account, signed out (bar name and drawer link text) | **Sign in** |
| Account, signed in (bar name and drawer link text) | **Your account** |
| Bag, name before the count is known | **Bag** `[confirm with user]` |
| Bag, name with 0 items | **Bag, empty** |
| Bag, name with 1 item | **Bag, 1 item** |
| Bag, name with n items | **Bag, {n} items** (the real number, also above 99) |
| Badge text | **{n}** for 1–99; **99+** for 100 and more |
| Live region, count changed to 0 | **Your bag is empty** |
| Live region, count changed to 1 | **Your bag has 1 item** |
| Live region, count changed to n | **Your bag has {n} items** |
| Menu button, accessible name | **Menu** |
| Drawer dialog, `aria-label` | **Menu** (layout-shell §11) |
| Close button, accessible name | **Close menu** |
| Drawer secondary nav, `aria-label` | **More** |
| Drawer secondary links | **FAQ** · **Contact us** |
| Drawer brand line | **Candles for long, starlit evenings.** |

Notes:
- The link labels are the registry's `label` values (footer.md §3.2.1); they are listed here so the header's copy is complete in one place. Changing one changes it in the header and the footer together.
- **"Bag", not "Cart"** `[confirm with user]`, in every visible and announced string, matching "Add to bag" and "Your bag" already used in typography.md §6.1 and §8 and the layout-shell's "bag button". "Cart" stays the internal name (code, data). If the user prefers "Cart", it is a copy-only change in this table (and the matching strings in M4/M5). See open question 1.
- Numbers are digits ("Bag, 3 items"). `{n}` is formatted with the locale's grouping ("Bag, 1,204 items").

### 11.2 Strings that don't appear in M1.15 public pages

All of §11.1 except the wordmark name is visible in M1.15 only on `/dev/header`. They are still final.

### 11.3 Dev preview page (`/dev/header`, dev-only)

| Where | String |
|---|---|
| `<h1>` | **Header preview** |
| Intro | **Every header item is shown here as if its page existed. Links to pages that aren't built yet go nowhere.** |
| Bag count control (`<select>`), label | **Items in the bag** |
| Bag count options | **0** · **1** · **3** · **99** · **120** |
| Current page control (`<select>`), label | **Current page** |
| Current page option for none | **None** |
| Current page, other options (text; the value is the entry's `href`) | **Shop** · **Collections** · **Gift sets** · **Our story** · **Search** · **FAQ** · **Contact us** · **A collection page (/collections/moonlit-terrace)** |
| Account control (checkbox), label | **Signed in** |
| Scroll filler heading | **Scroll to see the header change** |

---

## 12. Data needs

| Need | Source | When |
|---|---|---|
| Route registry: every `RouteEntry` field, `key`, `label`, `href`, `milestone`, `live`, `footer`, `header` (footer.md §3.2.1), read through the header's placement helpers; the module's `features` map is footer-only | the shared static module `components/layout/site-routes.ts` (§13.1), no Firestore | M1.15 |
| Current path | `usePathname()` in `NavLink` (client); on `/dev/header`, the `HeaderPreviewProvider` context (§3.4) | M1.15 |
| Bag count: the sum of `cart.items[].quantity` | the cart store (client state + `localStorage`, synced when signed in) through a `useCartCount()` hook; never Firestore from the header. On `/dev/header`, the preview context | M5.4 (preview in M1.15) |
| Signed in or not | the auth session (M5.2), read on the server if M5.2 provides a server session, else in a small client island. On `/dev/header`, the preview context | M5.2 (preview in M1.15) |

The header never imports Firestore (CLAUDE.md: UI code never calls Firestore directly).

## 13. Implementation notes for tech-agent (M1.15)

### 13.1 Files (names are tech-agent's call, except the shared registry module, which both specs name)

| File | Kind | Holds |
|---|---|---|
| `components/layout/SiteHeader.tsx` | Server | the `<header>`, the bar, the wordmark link, the bar's Primary nav, the utility group, the menu island; takes an optional boolean `preview` prop (`/dev/header` only): call the registry helpers with `{ preview: true }` and render plain anchors. All varying preview state comes from the context (§3.4), never from props |
| `components/layout/site-routes.ts` | module | **shared with the footer, defined in footer.md §3.2.1** (no `nav-routes.ts`): the `RouteEntry` type, the entries, the `features` map, and the helpers. Header placements: `headerPrimary()`, `headerMore()`, `headerAccount(signedIn)`, `headerBag()`; footer: `footerGroup(group)` (footer.md §11.1). Each returns live entries only, in row order (`null` when a single-entry helper has none), and takes `{ preview?: boolean }`, which treats every entry as live |
| `components/layout/header/preview-context.ts` | module (client) | the `HeaderPreviewContext` (bag count, current path, signed in, and their setters), default `null`, so public routes are unaffected |
| `components/layout/header/NavLink.tsx` | Client | `usePathname()`, the most-specific-match rule (§7.1), `aria-current`; renders `next/link`, or a plain `<a>` in preview mode, where it takes the current path from the preview context |
| `components/layout/header/AccountLink.tsx` | Client | the account link (bar icon button and drawer link variants); in preview it picks `headerAccount(signedIn, { preview: true })` from the context; on public routes its session source is M5.2's call (§12) |
| `components/layout/header/HeaderScrollState.tsx` | Client | the 8px sentinel (rendered at the start of `main`, positioned at the top of the document) and the `IntersectionObserver` setting `data-scrolled` on the header; the header counts as scrolled at more than 8px (layout-shell §6.2) |
| `components/layout/header/MobileMenu.tsx` | Client | the menu button and the `<dialog id="site-menu">`; its contents are server-rendered children; opens with `showModal()`; derives `aria-expanded` from the `toggle` and `close` events (§5.2); the `close` handler moves focus explicitly (§5.5); closes on scrim click, link click, path change and the lg media query |
| `components/layout/header/BagButton.tsx` | Client | name, badge, cap and the live region with the 500ms coalescing and the no-announce-on-first-read rule; in M1.15 the count comes only from the preview context |
| `components/icons/*` | Server | menu, close, search, account, bag, four-point star, crescent (inline SVG, `currentColor`) |
| `app/dev/header/page.tsx` | Server | §3.4: the fragment `<HeaderPreviewProvider><SiteHeader preview /><main>…</main></HeaderPreviewProvider>`; static, no `searchParams`; `requireDevPages()` in the page and its `generateMetadata` |
| `app/dev/header/HeaderPreviewProvider.tsx` | Client | holds the preview state (defaults 0, None, unticked) and renders only `HeaderPreviewContext.Provider`, no DOM element |
| `app/dev/header/HeaderPreviewControls.tsx` | Client | the three controls (§11.3), inside `main`; they write the context |
| `app/dev/dev.css` | CSS | `@source "./header/page.tsx";` and `@source "./header/HeaderPreviewControls.tsx";` listed one by one (a directory source is overridden by globals.css's `@source not`, see the file's comment) |
| `tests/e2e/support/screenshot.ts` | test | **captureRoute gains a `name` option and a `fullPage` option (tech, M1.13)**: `name` (file `<name>-<project>.png` instead of `routeSlug(route)`), `fullPage` (default `true`) |
| `tests/e2e/screenshots.spec.ts` | test | `/dev/header` as the single new `ROUTES` entry; the four named shots of §3.4 in their own tests (Playwright actions, then `captureRoute(page, "/dev/header", testInfo, { name, fullPage })`) |
| `app/globals.css` | CSS | `html { scrollbar-gutter: stable; }` (permanent, §5.3); the scroll-lock `:has()` rule (§5.3); the drawer's transitions and `@starting-style`; the reduced-motion overrides; the forced-colors underline for drawer links; print `data-print` handling (layout-shell §9.6) |

Server Component by default; the client islands above (and the dev page's provider and controls) are the only client code. They are small: no state library, no GSAP.

### 13.2 No layout shift

- The bar is server-rendered at its final height with every live item in place.
- Islands render the same box on the server and the client: the menu button is server-rendered (its handler hydrates); the bag button renders "Bag" with no badge until the count is read; the badge is absolutely positioned; `aria-label` and `data-scrolled` changes don't move layout.
- The dialog is out of flow; the permanent scrollbar gutter keeps the page width when the lock removes the scrollbar.
- Target: header contribution to CLS is 0; page CLS < 0.05 (layout-shell §13.3).

### 13.3 Tokens used

`--header-h`, `--scroll-offset`, `--page-inline-start` / `-end`, `--size-touch`, `--wordmark-h-header`, `--z-header`; colours `text-wordmark`, `text-primary`, `text-secondary`, `link` (gold-300), `badge-count`, `text-inverse`, `bg-raised` (scrolled surface), `bg-overlay` (drawer), `bg-scrim` (backdrop; and the reserved over-image variant), `border-divider`, `focus-ring`; `gradient-starlight-rule`; `shadow-raised`, `shadow-overlay`; `radius-pill`, `radius-lg`; type `type-nav`, `type-h3`, `type-body-sm`, `type-caption`; motion `--duration-fast` / `-base` / `-slow`, `--ease-standard` / `-enter` / `-exit`, `--motion-scale-press`. No new tokens.

### 13.4 Notes

- **Pre-hydration taps on the menu button do nothing** (the handler isn't attached yet). **Optional, tech-agent's call: invoker commands.** `<button commandfor="site-menu" command="show-modal">` opens the dialog natively, before hydration, where supported (**Chrome 135, Firefox 144, Safari 26.2**); elsewhere the attributes are ignored and the JS path opens it.
  - Write the attributes **lowercase** (`commandfor`, `command`), so React emits exactly the HTML attribute names. TypeScript needs a module augmentation, for example in `types/react-invokers.d.ts`:
    ```ts
    import "react";

    declare module "react" {
      interface ButtonHTMLAttributes<T> {
        command?: string;
        commandfor?: string;
      }
    }
    ```
  - Because the dialog can then open without the island's click handler, **`aria-expanded` is derived from the dialog's `toggle` and `close` events** and from a read of `dialog.open` on mount (§5.2), never set only in the click handler.
  - The click handler calls `showModal()` only when the dialog isn't already open and the browser has no native invoker support (feature test: `"commandForElement" in HTMLButtonElement.prototype`), so the open never runs twice.
- **Without JavaScript** the menu can't open, so hide the menu button under `@media (scripting: none)`. **Requirement for the footer (M1.16 / M1.17): the footer carries every link that is otherwise reachable only through the drawer**, each as soon as it is live: the four primary links (Shop, Collections, Gift sets, Our story), **FAQ**, **Contact us**, the **account link** ("Sign in" / "Your account"), and **Search** when it is live. Then a no-JS visitor at any width reaches every destination. (The bag stays in the bar at every width and works without JS.)
- Keep the dialog's DOM present (closed) in the server HTML so `aria-controls` always resolves.
- The live region and the bag link sit outside the dialog; the dialog makes them inert while it is open, which is fine (§6.2).
- `/dev/header` must never ship in a plain production build (same gate as `/dev/tokens`). It stays static: no `searchParams`, cookies or headers (§3.4).

### 13.5 e2e checks to add (tests/e2e, using the M1.20 fixture and helpers)

Public `/` (M1.15 state):
1. The banner has exactly one link, named "Starflames", `href="/"`; no `nav`, no "Menu" button, no bag link. The fixture reports no 404s.

`/dev/header` (full header), at 390 and 1440 unless noted. Every state change goes through the page's controls on one loaded page, never through the URL:
2. 1440: `nav[aria-label="Primary"]` is visible with Shop, Collections, Gift sets, Our story in that order; the menu button is hidden. 390: the bar's nav is hidden and the menu button is visible with `aria-expanded="false"` and `aria-controls="site-menu"`.
3. `tabOrder()` matches §10.2 for each width, including the two drawer rows (open the drawer at 390 and at 768).
4. 390: activating Menu opens the dialog (`dialog#site-menu[open]`), `aria-expanded="true"`, focus is on "Close menu"; Tab from the last drawer item wraps inside the dialog (never reaches `main`); Esc closes it, focus is back on Menu, `aria-expanded="false"`. Repeat with the close button and with a scrim click at the start-side strip.
5. 390: while the drawer is open, `getComputedStyle(document.documentElement).overflow` is `hidden` and a wheel/touch scroll doesn't change `scrollY`; after closing it is restored. The computed `scrollbar-gutter` on `html` is `stable` before, during and after.
6. `@motion`: in the reduced-motion projects the open dialog's computed `transform` is `none` throughout opening and its transition duration is 150ms.
7. Bag, through the "Items in the bag" control: after hydration, with the default 0, there is no badge, the name is "Bag, empty", and 600ms later the `role="status"` region is still empty (the first read is never announced). Select "1": badge "1", name "Bag, 1 item", and the status reads "Your bag has 1 item" (within 1s). Select "120": badge "99+", name "Bag, 120 items", status "Your bag has 120 items". Select "0": no badge, "Bag, empty", status "Your bag is empty". Coalescing: select "3" then "99" less than 100ms apart; a `MutationObserver` on the region sees only "Your bag has 99 items", never "Your bag has 3 items".
8. Current page and account, through the controls: choose "Gift sets" in "Current page": Gift sets has `aria-current="page"`, Collections has none, and at 1440 the current link's computed `text-decoration-line` is `underline` (at 390, in the open drawer, the link carries `aria-current` and the star marker). Choose "A collection page (/collections/moonlit-terrace)": Collections is current. Choose "None": no link has `aria-current`. Tick "Signed in": at 1440 the account button is named "Your account" with `href="/account"`, and at 390 the drawer's account link reads "Your account"; untick it: "Sign in", `href="/sign-in"`.
9. Scroll to 0: no `data-scrolled`; scroll to 200px: `data-scrolled="true"` and the surface pseudo-element's opacity reaches 1.
10. Every header control's bounding box is at least 44×44.
11. Header height equals `--header-h` before and after hydration (read once on `DOMContentLoaded`, once after `load`); no `layout-shift` entries attributed to header nodes.
12. 320px wide: no horizontal scroll (`scrollWidth <= clientWidth`).
13. Text-spacing override injected (the WCAG 1.4.12 bookmarklet values) at 390 and 1440: the bar keeps its height and its content doesn't overflow it.
14. `forcedColors: "active"` emulation: the header's computed background is the Canvas colour; the badge has a visible border.
15. Print emulation: the nav, utility group and menu button are hidden; the header is `position: static`; the wordmark is visible.
16. `hasVisibleFocus()` is true for the wordmark, each nav link, each icon button and the close button.
17. 768: with the drawer open, the "More" nav has no visible Search link; at 390 it has one. The close button's bounding box has the same right edge as the menu button's (±1px) at 390 and 768.
18. The `<header>` and `<main>` are direct children of `<body>` (the preview provider adds no element).

## 14. IP guardrail

Every string here is plain shop language: "Shop", "Collections", "Gift sets", "Our story", "Search", "Sign in", "Your account", "Bag", "Menu", "Close menu", "More", "FAQ", "Contact us", the bag counts, and the dev preview labels ("Header preview", "Items in the bag", "Current page", "None", "A collection page (/collections/moonlit-terrace)", "Signed in", "Scroll to see the header change"). The brand line "Candles for long, starlit evenings." is original and describes atmosphere in generic words. Route slugs (`shop`, `collections`, `gift-sets`, `our-story`, `faq`, `contact`, `search`, `sign-in`, `account`, `bag`), registry keys, helper names (`headerPrimary`, `headerMore`, `headerAccount`, `headerBag`, `footerGroup`) and component names (`HeaderPreviewProvider`, `HeaderPreviewControls`, `AccountLink`) are generic English. The only names are the brand's own and the catalog's original collection names ("Moonlit Terrace", from the IP-checked catalog). No character, place, court or book names, no author name, no quotes or paraphrases, no invented terms and no "Court of …" or "High Lord/Lady" style combinations. Re-read for this after the post-pass minors from M1.15/M1.17 reviews (spec wording only, no new visible strings) and confirmed.

## 15. Open questions

1. **"Bag" vs "Cart".** The task wording says "Cart, N items". This spec uses **"Bag"** in every visible and announced string, because the system already ships "Add to bag" and "Your bag" (typography.md) and the layout shell names a "bag button"; mixing the two words would confuse visitors. Switching is a copy-only change in §11. `[confirm with user]`
2. **Search has no task.** Nothing in `TASKS.md` builds search. Firestore can't do full-text search on its own; a real search usually means a paid or extra service (for example a hosted search index), which needs the user's approval (CLAUDE.md). Until a task exists, search stays hidden (bar, drawer and footer). `[confirm with user: search at launch?]`

Resolved (recorded in `TASKS.md`, 2026-10-09):
- The `/collections` index is specced in **M3.6** and goes live with M3.7.
- Gift sets stays `/collections/gift-sets`; **M8.3** enriches that collection page, with no separate `/gift-sets` route.
- **M8.1** specs the About page as "Our story" at `/our-story`.
