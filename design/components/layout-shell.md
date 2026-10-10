# Layout shell (M1.12)

Status: spec, **QA PASSED**, with post-pass minors 1–10, the M1.18 starfield wording update and the M2.1 home fix round 2 amendment to §5.1 applied (changelog below). Owner: design-agent. Implemented by tech-agent in M1.13.
Depends on [`tokens.md`](../system/tokens.md) (§2.5 rules 3, 4, 7–9; §4 semantic spacing; §7 focus; §8 z-index; §9 breakpoints, containers and the layout-shell variables), [`typography.md`](../system/typography.md) (§3 wordmark, §4 scale, §5 measures, §6.1 heading hierarchy), [`motion.md`](../system/motion.md) (§1, §6) and [`accessibility.md`](../system/accessibility.md) (§3, §5–§8). The implemented token names are taken from `app/globals.css` as built in M1.11 (`design/tech/M1.11-tokens-fonts.md`).

Plugs in later: the header ([`header.md`](./header.md), M1.14), the footer ([`footer.md`](./footer.md), M1.16) and the starfield ([`starfield.md`](./starfield.md), M1.18). This file only defines their **slots and contracts**. Their content, states and motion belong to their own specs.

## Changelog

**M2.1 home fix round 2: QA issues 1–7** (2026-10-10). Only issue 1 touches this file.

1. §5.1: a hero may now override its own **top and bottom** spacing (it said "top" only), and the collapse rule no longer zeroes the next band's top padding when the band before it already ends at 0. The intent is unchanged: exactly one `--section-y` between two adjacent bands of the same colour. Without this, a hero that ends in a feathered image (padding-bottom 0) followed by a plain band would have had no gap at all (`design/pages/home.md` §2.3). A build note for the collapse selector is added. Checked every spec that relies on §5.1: header.md §8.3 (a hero's top spacing only), footer.md §4.1 and §7 here (the last section keeps its bottom padding; on home the hero is never the last section), starfield.md §13.1 and §13.3 (the dev pages have no hero; their plain → solid collapse is unchanged), and the M1.13 shell test (no hero in it). None relied on the old wording. No value changes.

**Post-pass minors from M1.13/M1.15 reviews** (2026-10-09)

1. §6.2: the header counts as scrolled at **more than 8px** (at rest: 8px or less); the sentinel is rendered at the start of `main`, positioned at the top of the document.
2. §13.2: in a plain build, `/dev/tokens` is a 404 whose HTML is Next's empty `__next_error__` document; the shell appears only after hydration, from the RSC payload. Acceptable for a dev-only gate.
3. §13.1: the SiteShell row gives `main` `flex-[1_0_auto]` (not `flex-1`), matching §4.6.

**Post-pass minors from M1.13 review** (2026-10-09)

1. §10: the in-page error's "Try again" button calls `retry()`, not `reset()` (Next 16.4: re-fetches and re-renders the segment; approved tech pushback).
2. §5.3: from md the `hgroup` gets `md:flex-[1_1_20rem]`, so the link stays on the h2's row when the h2 wraps.
3. §4.1, §4.2, §4.5: the prose container's utility is `max-w-(--container-prose)`, not `max-w-prose` (Tailwind 4's built-in `max-w-prose` is a fixed 65ch). `max-w-content`, `max-w-wide` and `max-w-measure-*` don't collide with Tailwind built-ins and stay as they are.
4. §4.6, §13.1: the `min-height: 100vh` fallback is dropped; only `min-height: 100svh` remains. The CSS optimizer removes the fallback, because every browser Tailwind 4 supports has `svh`. This supersedes post-pass minor 9.

**M1.18 starfield fix round 2: §8.1 wording** (2026-10-09)

1. §8.1: "the layer (and its canvas) never resizes" now reads "the layer and its SVG never resize during scroll". The starfield has no canvas (starfield.md §5). No guarantee changes.

**M1.18 starfield fix round 1: §8 wording** (2026-10-09)

1. §8.1 and §8.3: server-rendered static SVG and spans are allowed in the starfield slot; the motion module loads after `load` plus idle. The cost is noted: about 5KB gzipped of HTML, plus the same markup again in the RSC payload, per first load. Matches starfield.md §5, §9 and §14.2. No other guarantee changes.

**Post-pass minor 10** (2026-10-09)

10. §10 (Not found): wording. A second React `<title>` in the nested not-found was rejected because React renders both titles, and which one the browser and search engines use is undefined.

**Post-pass minors 1–9** (2026-10-09)

1. §5.3: the section link now shares a row with the `hgroup` only, aligned with `items-baseline-last` (Tailwind 4.3.3, which emits `align-items: last baseline`). The intro sits below that row. The base (390) order is now eyebrow, h2, link, intro.
2. §10, §13.1: `app/global-error.tsx` puts the `jost`, `cormorant` and `cormorantItalic` `.variable` classes on its own `<html>` (importing `app/fonts.ts`), wraps its content in `<main id="main" tabIndex={-1}>`, and sets its title with a React `<title>`, because a `metadata` export isn't allowed there.
3. §10, §11: how each not-found file gets "Page not found · Starflames". The root `app/not-found.tsx` uses a `metadata` export. In `app/(site)/not-found.tsx` the title comes from the calling page's `generateMetadata`. Checked against `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md` and `error.md`.
4. §4.1: `--header-h`, `--scroll-offset`, `--page-inline-start`, `--page-inline-end` and the `max-height: 28rem` query are now registered in tokens.md §9, §11.0 (`:root` column) and §11.4.
5. tokens.md §8: the `z-starfield` row now says stars, constellation lines and particles only, with haze living in bands, and `top: 0` with a `100lvh` height (matches §8 here).
6. §5.2: 844px (390) and 900px (1440) are now stated as the reference viewport heights for the haze-spacing rule, not as a guarantee for every screen.
7. §5.1: the padding collapse applies to any two adjacent bands with the same background colour, not only to plain after plain.
8. §9.6: print adds `body { display: block; min-height: 0 }`, and notes that `background: transparent` also clears background images (intended).
9. §4.6, §13.1: `min-height: 100vh` comes before `min-height: 100svh` as a fallback.

---

## 1. Purpose and acceptance criteria

Purpose: one page frame that every customer-facing route uses. It gives a predictable landmark structure, a skip link that works with a sticky header, one container and grid system on the existing tokens, a section rhythm that keeps haze rare and products on solid ground, and fixed slots for the header, footer and starfield so they can never cause layout shift.

Acceptance criteria (from M1.12, refined):

1. **Document structure and landmarks** (§2): the `<body>` order, the skip link, the `<header>` (banner) slot, `<main id="main">` as the single focus target, the `<footer>` (contentinfo) slot, and the starfield layer slot (fixed, behind content, `aria-hidden`, `--z-starfield`). One `<h1>` per page, owned by the page and never by the shell.
2. **Skip link** (§3): copy "Skip to content", hidden until focused, the tokens focus ring, target `#main`, first tab stop. It still works with the sticky header: main never lands under the header (§3.4).
3. **Containers and grid** (§4): the page container per breakpoint (390 base, 768, 1024, 1440) on `--container-content`, `--gutter` and `--grid-gap`; a 4/8/12-column grid; a full-bleed escape for hero and haze bands; a prose container on `--container-prose` and the typography measures; exact token names; how a section composes them; ASCII diagrams at 390 and 1440.
4. **Section rhythm** (§5): `--section-y` per breakpoint, the section heading pattern (eyebrow + h2 + optional link), and how plain, solid and haze bands alternate (one haze band per view, never behind product grids).
5. **Sticky header contract** for M1.14 (§6): heights at 390 and 1440, reserved so there is no CLS; `--z-header`; background on scroll (opaque, contrast-safe); safe-area insets, with a decision on `viewport-fit=cover`.
6. **Footer contract** for M1.16 and **starfield contract** for M1.18 (§7, §8): slot, z-layer, performance-budget hook, no layout shift, reduced motion.
7. **Responsive and accessibility** (§9): 320px with no horizontal scroll; 200% and 400% zoom reflow; unique labels on repeated landmarks; reduced motion; forced colors; print basics.
8. **States** (§10): route loading (none), error boundary placement, not-found inside the shell, a minimal page still has header and footer.
9. **Copy** (§11): every string final.
10. **Data needs** (§12): none.
11. **Implementation notes** for M1.13 (§13): App Router file map, a `(site)` route group so `/dev` pages opt in or out, the dev token page keeps working, Server Components by default.
12. **IP guardrail** (§14).

---

## 2. Document structure and landmarks

### 2.1 `<body>` order

Every customer-facing page renders this order. Numbers are DOM order.

| # | Element | Rendered by | Role / landmark | Notes |
|---|---|---|---|---|
| 1 | `<a class="skip-link" href="#main">Skip to content</a>` | root layout | link | **First element in `<body>`**, so it is the first tab stop and the first thing a screen reader reaches (§3). |
| 2 | `<svg aria-hidden="true">` wordmark sprite | root layout (exists, `WordmarkSprite`) | none (hidden) | Zero-size, not focusable (M1.11). Stays where it is, after the skip link. |
| 3 | `<div data-starfield data-decorative aria-hidden="true">` | `(site)` shell | none (hidden) | The fixed background layer (§8). Empty in M1.13; M1.19 fills it. |
| 4 | `<header>` | `(site)` shell | **banner** | Direct child of `<body>`, so it maps to the banner landmark. Contents: M1.14. |
| 5 | `<main id="main" tabindex="-1">` | `(site)` shell | **main** | The only `<main>` on the page. The page's content, including its `<h1>`, goes here. |
| 6 | `<footer>` | `(site)` shell | **contentinfo** | Direct child of `<body>` (never inside `main`, `article` or `section`, or it loses the role). Contents: M1.16. |
| 7 | overlay slot | later specs | none | Reserved, rendered **as the last children of `<body>`**: the page-level toast region (tokens.md §8, M5) and any overlay that does not use `<dialog>.showModal()`. Nothing renders here in M1.13. |

Rules:
- **One of each landmark**: one banner, one main, one contentinfo. No `role` attributes are needed; the native elements carry them.
- `main` and `footer` are **not** wrapped in an extra layout `<div>` that would break the "direct child of body" rule for the header and footer. (`<body>` is the flex column, §4.6.)
- **Overlays never render inside `<main>`.** `<main>` is a stacking context at `--z-content` (§2.3), so a drawer or toast inside it could never rise above the header. Drawers, sheets, the mobile menu and modals either use `<dialog>.showModal()` (top layer, tokens.md §8) or render in the overlay slot.

### 2.2 Headings

- **The shell renders no headings.** The header and the skip link contain none. The wordmark is never a heading (typography.md §3.4).
- **Each page owns exactly one `<h1>`**, inside `<main>`: the page's own subject (typography.md §6.1). Error and not-found states provide theirs (§10).
- Section headings inside a page are `<h2>`, then `<h3>` and so on, without skipping levels (§5.3).
- **The footer's headings start at `<h2>`** (it comes after `main` in the outline), never `<h1>`. M1.16 picks the levels and styles them as it needs (for example `h2` styled `type-h4`).

### 2.3 Layers (z-index tokens, tokens.md §8)

| Layer | Element | Position | z-index |
|---|---|---|---|
| Background | starfield slot | `fixed` | `--z-starfield` (0) |
| Content | `<main>`, `<footer>` | `relative` | `--z-content` (1) |
| In-page overlaps | dropdowns, popovers, a sticky filter bar inside `main` | as needed | `--z-raised` (10), within `main`'s context |
| Header | `<header>` | `sticky` | `--z-header` (30) |
| Drawers, modals, toasts | overlay slot or top layer | `fixed` | `--z-scrim-drawer` … `--z-toast` (40–60), or the top layer |
| Skip link (focused) | `.skip-link` | `fixed` | `--z-skip-link` (70) |

Why `main` and `footer` must be positioned: the starfield is a positioned element at z-index 0. Non-positioned blocks paint *below* positioned z-index 0 elements, so without `position: relative; z-index: var(--z-content)` on `main` and `footer`, the stars would paint over their text. This is the single most important line in the shell.

---

## 3. Skip link

### 3.1 Behaviour

- Markup: `<a href="#main" class="skip-link">Skip to content</a>`, a plain anchor (not `next/link`). It is the **first element in `<body>`**, so it is the first tab stop on every page.
- **Hidden until focused**: visually hidden with the standard clip pattern (Tailwind `sr-only`), never `display: none` or `visibility: hidden` (those remove it from the tab order and from screen readers). On `:focus` it becomes visible (`focus:not-sr-only` plus the styles below). It uses `:focus`, not only `:focus-visible`, so it is shown whenever it has focus.
- **Target**: `#main`. Activating it scrolls to `main` and moves focus there (`main` has `tabindex="-1"`, so browsers focus it on fragment navigation, and screen readers continue reading from the page content). The next Tab goes to the first focusable element inside `main`.
- It works without JavaScript.
- Visible on focus, it is `position: fixed`, so it overlays the header and **never shifts layout** when it appears.

### 3.2 Visible style (on focus)

| Property | Value |
|---|---|
| Position | `fixed`; `top: calc(env(safe-area-inset-top, 0px) + 0.5rem)` (spacing step 2); `left: var(--page-inline-start)` (§4.2) |
| Layer | `z-index: var(--z-skip-link)` |
| Size | `min-height: var(--size-touch)` (44px); padding block step 3 (12px), inline step 6 (24px) |
| Type | `type-button` (Jost 500, 16px), `text-text-primary` |
| Surface | `bg-bg-overlay`, 1px `border-border-ghost`, `rounded-pill`, `shadow-overlay` |
| Focus ring | the global one, unchanged: 2px solid `--color-focus-ring` (gold-300), 2px offset (tokens.md §7) |
| Motion | none; it appears instantly (motion.md §6.2 "focus ring: instant") |

Contrast pairs (all from tokens.md §3):

| Pair | Ratio |
|---|---|
| text-primary on bg-overlay | 12.80 (T4) |
| border-ghost on bg-overlay | 5.16 (U15) |
| focus ring gold-300 against what is around it: bg-page (header at rest) / bg-raised (header scrolled) | 12.45 / 11.19 (U7) |
| focus ring against the link's own bg-overlay fill | 9.64 (U7) |

Forced colors: the 1px border becomes a system-colour edge and the outline survives (accessibility.md §5). No extra rule.

### 3.3 Focus on `main`

- `main` is focused programmatically only (`tabindex="-1"`: never in the tab order).
- `#main:focus { outline: none; }` (and the same for `:focus-visible`). This is the **one documented exception** to "never remove an outline": `main` is not an interactive component, the ring would outline the whole page, and the visible proof that the skip worked is the scroll position plus the next Tab landing in content. Nothing else may copy this exception.

### 3.4 Sticky header: main never hides under it

The header is sticky (§6), so anything scrolled to the top of the viewport would sit under it. One mechanism handles this for the skip target, every in-page anchor, and keyboard focus:

- New token **`--scroll-offset`** (§4.1) = `calc(var(--header-h) + env(safe-area-inset-top, 0px))`, set to `0px` where the header is not sticky (short viewports, §6.5).
- `html { scroll-padding-top: var(--scroll-offset); }`. Fragment navigation (the skip link, `#section` anchors) and the browser's focus scrolling both respect the scroll container's `scroll-padding`. This is what accessibility.md §3 prescribes (WCAG 2.4.11, focus not obscured).
- `#main { scroll-margin-top: 0; }`, stated explicitly. **Decision:** `scroll-margin-top` on the target is **not** added on top. `scroll-padding` on the scroller and `scroll-margin` on the target add up, so using both would leave a double gap above `main`. The token-driven offset lives in one place, `--scroll-offset`, applied as `scroll-padding-top`. (The task asked for `scroll-margin-top`; the outcome it wants, main never under the header, is met with the same token in the place that also covers keyboard focus. See open question 1.)
- Element-specific breathing room, if a later spec wants it (for example a FAQ answer anchor that should land 16px below the header), is a `scroll-margin-top` of a spacing step on that element only, never `--scroll-offset` again.
- `scroll-behavior` stays `auto` (no smooth scrolling on the skip link: it would delay the jump and is removed under reduced motion anyway).

Expected result, testable: at 390 and 1440, Tab once, Enter: `document.activeElement` is `main#main`, and `main`'s top edge is at or below the header's bottom edge.

---

## 4. Containers and grid

### 4.1 Tokens

Existing (exact names from `app/globals.css`):

| Token | Where | Value | Utility |
|---|---|---|---|
| `--gutter` | `:root` | 1.25rem → md 2rem → lg 2.5rem → xl 5rem | `px-(--gutter)` |
| `--grid-gap` | `:root` | 1rem → md 1.5rem → lg 1.5rem → xl 2rem | `gap-(--grid-gap)` |
| `--section-y` | `:root` | 4rem → md 5rem → lg 6rem → xl 8rem | `py-(--section-y)` |
| `--size-touch` | `:root` | 2.75rem | `min-h-(--size-touch)` |
| `--container-content` | `@theme` | 80rem (1280px) | `max-w-content` |
| `--container-prose` | `@theme` | 42.5rem (680px) | `max-w-(--container-prose)` (not `max-w-prose`: Tailwind 4's built-in `max-w-prose` is a fixed 65ch) |
| `--container-wide` | `@theme` | 90rem (1440px) | `max-w-wide` |
| `--container-measure-prose` / `-intro` / `-heading` | `@theme` | 65ch / 45ch / 18ch | `max-w-measure-prose` / `max-w-measure-intro` / `max-w-measure-heading` |
| `--z-starfield`, `--z-content`, `--z-header`, `--z-skip-link` … | `:root` | tokens.md §8 | `z-(--z-header)` |

**New in M1.12** (plain `:root` variables, registered in tokens.md §9 and §11.4 and in the §11.0 `:root` column; tech-agent adds them to section 4 of `globals.css`):

| Token | base (390) | md (768) | lg (1024) | xl (1440) | Use |
|---|---|---|---|---|---|
| `--header-h` | 4rem (64px) | 4.5rem (72px) | 4.5rem (72px) | 5rem (80px) | the header bar's block size, excluding the top safe-area inset (§6.1) |
| `--scroll-offset` | `calc(var(--header-h) + env(safe-area-inset-top, 0px))`; **`0px`** under `@media (max-height: 28rem)` (§6.5) | | | | `html { scroll-padding-top }`; the `top` of any sticky bar inside `main` (e.g. the M3 filter bar) |
| `--page-inline-start` | `max(var(--gutter), env(safe-area-inset-left, 0px))` | | | | the container's start padding (follows `--gutter` per breakpoint) |
| `--page-inline-end` | `max(var(--gutter), env(safe-area-inset-right, 0px))` | | | | the container's end padding |

`--page-inline-*` exist because of `viewport-fit=cover` (§6.4): in landscape on a notched phone, the side inset (about 47px) is wider than the 20–32px gutter, so text must not run under the notch. Everywhere the page used `--gutter` for side padding, the shell uses these two instead. They reference `--gutter`, so the per-breakpoint overrides of `--gutter` still apply.

### 4.2 The page container

`Container` (component or utility, name tech-agent's call) is the only way content gets side padding and a maximum width.

| Property | Value |
|---|---|
| `margin-inline` | `auto` |
| `padding-inline-start` / `-end` | `var(--page-inline-start)` / `var(--page-inline-end)` |
| `max-width` | `calc(var(--container-content) + var(--page-inline-start) + var(--page-inline-end))`, so the **content box** caps at 1280px |
| `width` | `100%` (border-box, the preflight default) |

Resulting content width per breakpoint (no insets):

| Viewport | Gutter | Content width | Columns | Grid gap | Column width |
|---|---|---|---|---|---|
| 320 (minimum) | 20 | 280 | 4 | 16 | 58 |
| **390** (base design) | 20 | 350 | 4 | 16 | 75.5 |
| **768** (md) | 32 | 704 | 8 | 24 | 67 |
| **1024** (lg) | 40 | 944 | 12 | 24 | 56.67 |
| **1440** (xl) | 80 | 1280 | 12 | 32 | 77.33 |
| 1920 | (320 each side, from centring) | 1280 | 12 | 32 | 77.33 |

Above 1440 the content stays at 1280 and centres (tokens.md §9). The starfield and band backgrounds keep running full width.

Variants:
- **`prose`**: the same container, with an inner wrapper `max-w-(--container-prose) mx-auto` (680px, centred). Long-copy paragraphs inside also get `max-w-measure-prose` (65ch, about 640px at body 18px), set **on the text element** because `ch` is measured in the element's own font (typography.md §5). Section intros use `max-w-measure-intro`; display-1 and display-2 headings use `max-w-measure-heading`. At 390 the prose wrapper is simply the 350px content width.
- **`wide`**: for band decoration only (an illustration or haze art that should stop growing above 1440): `max-w-wide mx-auto`, no side padding. Text never goes in `wide`; it goes in a normal container inside it.

### 4.3 The grid

`Grid` (utility recipe): `grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-(--grid-gap)` inside a `Container`.

- Columns: **4** at base, **8** from md (768), **12** from lg (1024) and xl (1440).
- Gaps: `--grid-gap` for both columns and rows by default: 16 / 24 / 24 / 32px. A component may set a larger **row** gap from the spacing scale (for example product cards with their text block below the image); it never changes the column gap.
- Common spans (page specs pick; these are the vocabulary):

| Name | base (4) | md (8) | lg/xl (12) |
|---|---|---|---|
| full | 4 | 8 | 12 |
| half | 4 (stacks) | 4 | 6 |
| third | 4 (stacks) | 8 or 4 (page spec) | 4 |
| quarter | 2 | 4 | 3 |
| pair (two per row on mobile) | 2 | 4 | 3 or 4 |

- Grid items have `min-width: 0` so long words or images never push the grid wider than the container (the cause of most 320px horizontal scroll).
- No grid is nested inside another grid's span without its own `Grid` recipe.

### 4.4 Full-bleed: how sections compose

**`<main>` is full width and has no padding.** Every section is a full-width band, and its content goes inside a `Container`. So there is no "escape" hack (no negative margins, no `100vw`): a band's background is already edge to edge.

```
<main id="main">                      full width, no padding
  <section data-band="dusk">          full-bleed band: background edge to edge, py --section-y
    <div class="Container">           side padding --page-inline-*, content max 1280
      <div class="Grid"> … </div>     4 / 8 / 12 columns, gap --grid-gap
    </div>
  </section>
  <section data-band="plain"> … </section>
</main>
```

- **Full-bleed media** (a hero image or haze art that runs edge to edge) is placed in the band, **outside** the `Container`. It may extend under the side safe areas (it is imagery); any text over or beside it goes back inside a `Container`.
- **Never use `100vw`** for widths: it includes the scrollbar on desktop and causes horizontal scroll. Use `100%`.
- **Decorative overhang** (a glow or illustration that extends past its band) is clipped by the band itself (`overflow: clip` on the band), never by `overflow-x: hidden` on `html` or `body`: that hides real overflow bugs from QA and can break `position: sticky`.
- Each band sets `isolation: isolate` so its own decorative layers (negative z inside the band) stay behind its content and never mix with other bands.

### 4.5 Diagrams

**390 (base), 4 columns:**

```
|<------------------------- 390 -------------------------->|
| 20 |<------------------- 350 ------------------->| 20 |
+----------------------------------------------------------+
| HEADER  64px tall (+ safe-area-inset-top)                |  sticky, z 30
|      [Starflames]                       [menu] [bag]     |
+----------------------------------------------------------+
| MAIN                                                     |  z 1
|  ........................ 64 (--section-y) ............  |
|    [eyebrow]                                             |
|    [h2 Section heading                    ]              |
|    [link ->]                                             |
|  ........................ 48 (step 12) ................  |
|    +--------+  +--------+  +--------+  +--------+        |
|    | col 1  |16| col 2  |16| col 3  |16| col 4  |        |  75.5 each
|    +--------+  +--------+  +--------+  +--------+        |
|    |<-- pair: span 2 -->|  |<-- pair: span 2 -->|        |
|  ........................ 64 ..........................  |
+----------------------------------------------------------+
| FOOTER  bg-sunken (+ safe-area-inset-bottom)             |  z 1
+----------------------------------------------------------+
  starfield: fixed, full viewport, behind everything (z 0)
```

**1440 (xl), 12 columns:**

```
|<------------------------------------ 1440 ------------------------------------>|
| 80 |<--------------------------------- 1280 -------------------------------->| 80 |
+----------------------------------------------------------------------------------+
| HEADER 80px   [Starflames]        nav · nav · nav · nav            [bag]          |
+----------------------------------------------------------------------------------+
|  ................................ 128 (--section-y) ...........................  |
|    [eyebrow]                                                                     |
|    [h2 Section heading                                ]          [link ->]       |
|  ................................ 48 ..........................................  |
|    |c1|c2|c3|c4|c5|c6|c7|c8|c9|c10|c11|c12|   77.33 each, 11 gaps of 32         |
|    |<- span 3 ->|<- span 3 ->|<- span 3 ->|<- span 3 ->|   quarter               |
|    |<------- span 6 -------->|<------- span 6 -------->|   half                  |
|    |      |<- prose: max-w-(--container-prose) 680, centred ->|      |             |
|  ................................ 128 ..........................................  |
+----------------------------------------------------------------------------------+
| FOOTER bg-sunken                                                                 |
+----------------------------------------------------------------------------------+
```

(The header's exact contents and order per breakpoint are in [`header.md`](./header.md) §2; the diagrams above only show the slot.)

### 4.6 Page-height frame

- `<body>`: `min-height: 100svh; display: flex; flex-direction: column`. Only `min-height: 100svh` is set: a `min-height: 100vh` fallback would be removed by the CSS optimizer anyway, because every browser Tailwind 4 supports has `svh`. The skip link (hidden or fixed), the sprite (absolute) and the starfield (fixed) are out of flow, so the flex items are header, main and footer.
- `<main>`: `flex: 1 0 auto`, so on a short page (a 404, an empty bag) the footer sits at the bottom of the screen rather than in the middle.
- `100svh` (small viewport height), so the footer is reachable without scrolling even while the mobile browser's toolbars are showing.

---

## 5. Section rhythm

### 5.1 Vertical spacing

- Every section band has `padding-block: var(--section-y)`: **64 / 80 / 96 / 128px** at base / md / lg / xl.
- **Two adjacent bands with the same background colour collapse:** the second drops its top padding (`padding-block-start: 0`), so they are separated by exactly one `--section-y`, not two. "Same background colour" means `plain` or `solid` next to `plain` or `solid` (both are bg-page; `plain` only lets the stars show), or `sunken` after `sunken`. (Two haze-family bands are never adjacent, §5.2.) The collapse only removes a duplicate: if the first band already ends at 0 (a hero that overrides its bottom spacing, next point), the second keeps its top padding, so there is still exactly one `--section-y` between them. Between bands of different colours (for example `plain` → `sunken`, or anything next to `haze` or `dusk`), both paddings stay: the band's edge is visible, so the space reads as "content to edge" plus "edge to content".
- The first section in `main` starts `--section-y` below the header. A hero may override its own top and bottom spacing (M2.1); no other band does.
  - Build note (tech-agent's call): mark a band whose bottom padding is overridden to 0 (for example `data-flush-end` on the hero) and leave the band that follows it out of the collapse selector. The shell's band-collapse test gains that case: a flush-ending band followed by a `plain` band keeps the plain band's top padding at `--section-y`.
- The last section before the footer keeps its bottom padding. The footer's own top padding is M1.16's.
- Inside a section, spacing comes from the spacing scale: eyebrow → heading step 3 (12px), heading → intro step 4 (16px), heading block → content step 12 (48px) (typography.md §4 notes, tokens.md §4).

### 5.2 Bands

Each `<section>` carries `data-band` (the attribute name is tech-agent's call; the five values are the vocabulary):

| Band | Background | Starfield shows? | Haze family? | Product grids allowed? | Form controls allowed? |
|---|---|---|---|---|---|
| `plain` (default) | transparent (bg-page + the fixed starfield behind) | yes | no | **yes** | yes |
| `solid` | `bg-bg-page`, opaque | no | no | **yes** | yes |
| `sunken` | `bg-bg-sunken`, opaque | no | no | yes | yes |
| `haze` | `bg-bg-haze` (violet-900, solid) | no | **yes** | **no** | yes (U14: the newsletter) |
| `dusk` | `--gradient-haze-dusk`, optionally with `--gradient-haze-veil` or `--gradient-haze-blush` layered (tokens.md §2.4) | no | **yes** | **no** | **no** (tokens.md §2.5 rule 7) |

Rules (tokens.md §2.5 rules 3, 4, 7, 8, and §2.6):
- **Default to `plain`.** `solid` is for dense UI where stars behind the content would distract (checkout, filters, account tables). `sunken` is for a quiet strip next to the footer.
- **One haze-family band per view.** Two `haze`/`dusk` bands are never adjacent, and the non-haze content between them is at least as tall as the **reference viewport heights: 844px at 390** (a common large phone) **and 900px at 1440** (the e2e desktop viewport). At those reference sizes no screen shows parts of both. A taller window may show the edges of both, which is accepted. Each page spec states its band order and checks this at both widths.
- **Never behind product grids**: a section that contains product cards or a product grid is `plain` or `solid` only. Product cards themselves sit on `bg-raised` (tokens.md §2.5 rule 3).
- **Text over `dusk`** follows tokens.md §2.5 rule 4 and typography.md §6.7: text-primary or text-secondary; gold-300 for eyebrows and links; never text-muted; no status text and no form controls; a primary CTA there uses the no-glow variant (rule 9).
- **Band edges.** `dusk` begins at night-900 (the same as bg-page), so its top edge melts into a plain section above it. Its bottom stop (rose-800) meets the next section with a hard edge; the page spec either places it where a hard edge is intended or marks the junction with a `--gradient-starlight-rule` hairline.
- Haze is never in the fixed starfield layer (§8.2), so page specs control every haze placement through bands.

### 5.3 Section heading pattern

```
<section aria-labelledby="sec-bestsellers">
  <div class="Container">
    <div class="SectionHeading">
      <div class="SectionHeading-row">                             ← the hgroup and the link only
        <hgroup>
          <p class="type-eyebrow …">Loved by our customers</p>     ← optional eyebrow
          <h2 id="sec-bestsellers" class="type-h2">Bestsellers</h2>
        </hgroup>
        <a href="…">Shop all bestsellers</a>                        ← optional link
      </div>
      <p class="type-body-lg max-w-measure-intro">…</p>            ← optional intro, below the row
    </div>
    … content …
  </div>
</section>
```

(The strings above are layout labels only. Section copy comes from each page spec.)

- **Elements:** an optional eyebrow (`<p>` before the heading, grouped in `<hgroup>`, typography.md §6.1), the `<h2>` (style `type-h2` by default; a page spec may choose another style but not another level), an optional section link and an optional intro paragraph (`type-body-lg` or `type-body`, `max-w-measure-intro`). DOM order: `hgroup`, link, intro.
- **Landmark use:** a major section uses `<section aria-labelledby="<h2 id>">`, which makes it a named region. Keep it to the page's main sections (about six at most); sub-groups use `<div>`.
- **The row** holds only the `hgroup` and the link. The intro is never in it.
- **Layout at base (390):** the row is a column (`flex flex-col items-start`): eyebrow, 12px, h2, 8px (step 2; the link's 44px hit area adds its own space), link. Then 16px (step 4) to the intro. Then 48px to the content.
- **Layout from md (768):** the row becomes `md:flex-row md:flex-wrap md:justify-between md:items-baseline-last md:gap-x-6`, and the `hgroup` gets `md:flex-[1_1_20rem]` (flex-basis 20rem, with grow). That keeps the link on the h2's row when the h2 wraps; without it, a long h2's max-content width pushes the link onto its own line. In Tailwind 4.3.3, `items-baseline-last` emits `align-items: last baseline`, so the link's text baseline lines up with the **last line of the h2** (the `hgroup`'s last baseline), however many lines the heading wraps to. The link has `shrink-0` and only wraps under the heading when the row is too narrow. The intro follows below the row, 16px (step 4) after it. Then 48px to the content.
- **The section link** is a text link: `link` gold-300, always underlined (tokens.md §2.3), `type-nav` size, followed by a 16px arrow icon (inline SVG, `aria-hidden="true"`, `currentColor`). Its hit area is at least 44px tall (`min-h-(--size-touch)`, inline-flex, centred). Hover: `link-hover` (moon-100), underline stays, `duration-fast`. Focus: the global ring. **Its text names the destination** ("Shop all bestsellers", not "View all"), so it makes sense out of context (WCAG 2.4.4); page specs write it.
- **Colours and contrast by band:**

| Element | `plain` / `solid` (bg-page) | `sunken` (bg-sunken) | `haze` (bg-haze) | `dusk` (haze worst) |
|---|---|---|---|---|
| Eyebrow | text-accent gold-400, 9.96 (T16) | gold-400, **10.43** (new pair, below) | gold-400, 9.08 (T19) | **gold-300**, 5.72 (T38) |
| h2 | text-primary, 16.52 (T2) | 17.30 (T1) | 15.06 (T5) | 7.59 (T36) |
| Intro | text-secondary, 11.25 (T7) | 11.78 (T6) | 10.26 (T10) | 5.17 (T37) |
| Link | gold-300, 12.45 (T20) | 13.03 (T23) | **11.34** (new pair, below) | 5.72 (T38) |

New pairs (working as accessibility.md §2.4; L + 0.05 values from its table): gold-400 on bg-sunken = 0.55225 / 0.05291 = 10.437 → **10.43:1**; gold-300 on bg-haze = 0.68983 / 0.060788 = 11.348 → **11.34:1** (the same figure as U7's focus ring on bg-haze). Both pass 4.5:1.

---

## 6. Sticky header contract (for M1.14)

### 6.1 Box and reserved space

- `<header>` is `position: sticky; top: 0; z-index: var(--z-header)`, **in normal flow** (it takes up its own height; it does not overlay `main`). So `main` always starts directly below it and nothing jumps when it renders.
- Block size: `padding-top: env(safe-area-inset-top, 0px)` plus a bar of exactly **`block-size: var(--header-h)`**: **64px at 390**, 72px at md and lg, **80px at 1440**. Server-rendered at that height, so CLS from the header is 0.
- M1.14's content fits inside the bar on one line at every width: wordmark (`--wordmark-h-header`: 28 / 32 / 36px), navigation or menu button, bag button. Touch targets of 44px leave 10px above and below at 390. Where the navigation does not fit on one line, M1.14 switches to the menu button; the bar never grows a second row.
- Client-only parts (the bag count badge, a signed-in state) reserve their space in the server render, so hydration never moves anything.
- Inline padding: `--page-inline-start` / `--page-inline-end`, and the bar's content uses the same `Container` max width as the page, so the wordmark lines up with the content edge at every width.
- The header never hides on scroll and never transforms. (Hide-on-scroll was considered and rejected: it moves a landmark the visitor just used, and it would make `--scroll-offset` wrong half the time.)
- Because `--header-h` is in rem, it grows with the visitor's text-size setting, and so does `--scroll-offset`.

### 6.2 Background on scroll: opaque, never translucent

| State | When | Background | Bottom edge | Contrast for header text |
|---|---|---|---|---|
| **At rest** | the page is scrolled 8px or less | transparent: bg-page and the starfield show through | 1px transparent border | text-primary 16.52 (T2), link/wordmark gold-300 12.45 (T20), text-secondary 11.25 (T7) |
| **Scrolled** | more than 8px | **opaque `bg-bg-raised`** with `shadow-raised` | 1px `border-border-divider` | text-primary 14.85 (T3), gold-300 11.19 (T21), text-secondary 10.12 (T8) |

- At rest, the only thing behind the header is its own area of bg-page and the starfield (the header is in flow, so no content sits under it at scroll 0). Once anything can scroll under it, it is opaque.
- **No translucency and no `backdrop-filter`.** Product photography and haze bands pass under the header; with a translucent header, the contrast of the nav text would depend on whatever image happens to be underneath, which cannot be guaranteed. A backdrop blur is also costly on mid-range phones.
- **Mechanism (motion.md §1: only opacity animates):** the scrolled surface is a pseudo-element (`::before`, `inset: 0`, `z-index: -1` inside the header) that carries `bg-raised`, `shadow-raised` and the divider border at `opacity: 0`, and goes to `opacity: 1` over `--duration-base` with `--ease-standard`. Under reduced motion, `--duration-base` is remapped to 150ms (motion.md §6.3): an opacity change, which is allowed. The header's own `background-color` is never transitioned.
- **State hook:** the header carries `data-scrolled="true"` when the page is scrolled more than 8px. Set by a small client island with an `IntersectionObserver` on an 8px sentinel, rendered at the start of `main`, positioned at the top of the document (no `scroll` listener). On mount it reads the current position once, so a reload that restores a scroll position gets the right state on the first post-hydration frame.
- **Without JavaScript:** `@media (scripting: none)` shows the scrolled surface permanently (opaque), so text never ends up over content.
- **Forced colors:** `header { background-color: Canvas; }` under `@media (forced-colors: active)`, so content never shows through it; the 1px border becomes a system-colour edge.

### 6.3 Under the header

- Anything inside `main` that sticks (the M3 filter bar) uses `top: var(--scroll-offset)` and `z-index: var(--z-raised)`, so it stops directly below the header.
- Drawers and the mobile menu are opened from the header but render in the top layer (`<dialog>.showModal()`) or the overlay slot (§2.1), never inside the header's stacking context.

### 6.4 Safe areas: decision `viewport-fit=cover`

**Decision: yes, `viewport-fit=cover`**, with the insets handled by the shell.

- Why: the night sky should run edge to edge on notched phones in landscape (with the default `auto`, the browser letterboxes the page with plain bars), and later fixed bottom UI (a sticky "Add to bag" bar in M4, the cart sheet in M5) needs `env(safe-area-inset-bottom)` to clear the home indicator, which only reports real values under `cover`.
- The cost is that every edge must respect the insets. The shell does it once:

| Edge | Who pads | How |
|---|---|---|
| Top | header | `padding-top: env(safe-area-inset-top, 0px)` (§6.1) |
| Left / right | every `Container`, the header bar, the skip link | `--page-inline-start` / `--page-inline-end` (§4.1) |
| Bottom | footer | its bottom padding is M1.16's value **plus** `env(safe-area-inset-bottom, 0px)` (§7) |
| Bottom | any later fixed bottom bar or sheet | `padding-bottom: env(safe-area-inset-bottom, 0px)` on top of its own padding |

- The starfield and full-bleed band backgrounds intentionally extend under the insets (they are decoration). Text and controls never do.
- Viewport settings (in the root layout's `viewport` export): `width=device-width`, `initial-scale=1`, `viewport-fit=cover`, `theme-color` = bg-page (`#0B0F24`, so the browser chrome matches the night), `color-scheme: dark`. **Never** `maximum-scale` or `user-scalable=no`: zoom must always work (WCAG 1.4.4).

### 6.5 Short viewports and zoom

- Under `@media (max-height: 28rem)` (448px: a phone in landscape, or a desktop window at 200% zoom and above), the header is **not sticky** (`position: relative`) and `--scroll-offset` is `0px`. A sticky 64px bar would otherwise cover a large share of a short screen (WCAG 1.4.10 reflow; at 400% zoom on a 1280×800 window the viewport is 320×200 CSS px).
- The header's `z-index` and appearance are otherwise unchanged.

---

## 7. Footer contract (for M1.16)

- **Slot:** `<footer>` is a direct child of `<body>`, after `<main>` (contentinfo landmark). Only one per page.
- **Layer:** `position: relative; z-index: var(--z-content)`, so it paints above the starfield.
- **Surface:** opaque `bg-bg-sunken` (the footer base, tokens.md §2.3). The starfield does not show behind it; M1.16 may add its own decorative motifs inside it (behind its content, `aria-hidden`, `data-decorative`).
- **Width:** full-bleed background; content inside a `Container` (§4.2).
- **Spacing:** the footer's inner spacing is M1.16's, with one fixed rule: its bottom padding adds `env(safe-area-inset-bottom, 0px)`. The space between the last section and the footer is that section's `--section-y` bottom padding (§5.1).
- **Headings:** start at `<h2>` (§2.2). Its `<nav>` elements carry the labels in §11.
- **Controls on bg-sunken are allowed** (tokens.md §2.5 rule 7: `border-control` 4.74:1, U3), so the newsletter teaser can sit in the footer.
- **No layout shift:** the footer is server-rendered with static content. The newsletter teaser slot reserves the space of its tallest state (the success or error message never pushes the footer taller after submit; M2.6 sets the states within that space). No lazy-loaded images above the legal line.
- **Reduced motion:** the footer has no motion of its own at M1. Any later decorative motion follows motion.md §6.
- **Print:** stays, with the newsletter form and social icons hidden (§9.6).

---

## 8. Starfield contract (for M1.18)

### 8.1 Slot

```
<div data-starfield data-decorative aria-hidden="true"
     class="pointer-events-none fixed inset-x-0 top-0 h-lvh z-(--z-starfield)">
  <!-- M1.19: server-rendered static SVG and spans; the motion module loads after load + idle -->
</div>
```

- Rendered by the `(site)` shell as a direct child of `<body>`, before the header (DOM order 3 in §2.1).
- `aria-hidden="true"`: nothing in it is ever announced. `pointer-events: none`: it never intercepts a tap or click. No focusable content.
- `data-decorative`: removed under forced colors by the existing rule in `globals.css` section 8, and hidden in print (§9.6).
- **Height is `100lvh`** (the large viewport height), with `top: 0`, not `inset: 0`. On mobile the visible viewport changes height as the toolbars show and hide; sizing to the large viewport means the layer and its SVG never resize during scroll, so there is no redraw jank and no re-layout.
- In M1.13 the slot is rendered **empty**. bg-page on `html`/`body` already paints the night behind it.
- **From M1.19, server-rendered static SVG and spans are allowed inside the slot** (the static sky and its CSS twinkle, [`starfield.md`](./starfield.md) §5, §14.2), so the stars are there at first paint without JavaScript. **The motion module loads after `load` plus idle** (§8.3). Cost: about **5KB gzipped of HTML** (starfield.md §9 caps it at 16KB raw / 5KB gzipped), **plus the same markup again in the RSC payload**, per first load; client navigations don't resend the layout.

### 8.2 What M1.18 may and may not put in it

- Stars, constellation lines, sparse falling-star particles (motifs from the brief). **No haze gradients**: haze is placed only by bands (§5.2), so the "one haze band per view" and "never behind product grids" rules stay enforceable. A fixed full-viewport haze would be in every view and behind every product grid. (tokens.md §8 now says the same.)
- Over the layer sit plain sections, whose text lies directly over it. **M1.18 must state the starfield's worst-case composite behind text** and keep the weakest text permitted on bg-page, text-muted, at 4.5:1 or more against it (T12 is 6.67 on plain bg-page), or keep stars out of text boxes. Glows and particles never pass over text or product images (accessibility.md §7). The header adds one more requirement for the top band of the layer: [`header.md`](./header.md) §8.2.

### 8.3 Performance-budget hook

The shell guarantees, and M1.18/M1.19 must keep:

| Guarantee | How |
|---|---|
| No layout shift | The layer is `fixed` and out of flow; it never changes the document's size. Its size depends only on the large viewport. |
| Not an LCP candidate | Server-rendered static SVG and spans are allowed in the slot (§8.1). Nothing M1.19 renders there, on the server or later, may be a viewport-sized `<img>` or CSS `background-image` (those can be LCP candidates); inline SVG and small spans are not. The build review checks the LCP element at 390 and 1440. |
| Off the critical path | Server-rendered static SVG and spans are allowed; **the motion module loads after `load` plus idle** (a dynamic import), never in the root layout's initial bundle. The static markup's cost is about 5KB gzipped of HTML plus its RSC copy per first load (§8.1). |
| Reduced motion | Under `prefers-reduced-motion: reduce`, one still frame, no loop (motion.md §6.1); it listens for changes to the preference without a reload. |
| Pauses | Loops pause on `document.visibilitychange` (hidden) and when the layer is fully covered or offscreen (motion.md §5). |
| Testable state | The slot carries `data-starfield-state="static" \| "animating" \| "paused"` (set by M1.19), so Playwright can assert the reduced-motion and hidden-tab behaviour. |

M1.18 sets the numbers (JS size, frame budget, particle counts, device-pixel-ratio cap) and may only tighten the guarantees above.

---

## 9. Responsive behaviour and accessibility

### 9.1 What changes per breakpoint

| | base (390, holds from 320) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Columns / gap | 4 / 16 | 8 / 24 | 12 / 24 | 12 / 32 |
| Gutter | 20 | 32 | 40 | 80 |
| Content max | 100% − gutters | 100% − gutters | 100% − gutters | 1280 |
| `--section-y` | 64 | 80 | 96 | 128 |
| `--header-h` | 64 | 72 | 72 | 80 |
| Section heading | stacked: eyebrow, h2, link, then intro | link on the heading row (last baseline), intro below | same | same |

### 9.2 320px and reflow

- Everything holds from **320px** wide with no horizontal scroll: fluid widths only, `min-width: 0` on grid and flex children, `overflow-wrap: break-word` (already global), no `100vw`, no fixed pixel widths on text containers.
- **200% and 400% zoom** (1280×800 window): at 400% the layout viewport is 320 CSS px, so the base layout applies; the header is not sticky there (§6.5). Nothing is clipped or overlapping, and nothing needs two-dimensional scrolling except content that legitimately needs it (none in the shell).
- **Text spacing** (WCAG 1.4.12): the skip link and section heading use `min-height` and padding, never fixed heights. The header bar's fixed `block-size` holds single-line items; M1.14 must show it survives the text-spacing override at 390 and 1440 (or switch to the menu earlier).

### 9.3 Landmarks and labels

- One banner, one main, one contentinfo: no labels needed on those.
- **Every `<nav>` has a unique `aria-label`** (they repeat). The reserved labels are in §11. Whether the mobile menu reuses the header's `<nav>` or renders its own inside a dialog, only one "Primary" nav is in the accessibility tree at a time (the other is `display: none` or inside a closed dialog).
- Named regions: major sections via `aria-labelledby` on their h2 (§5.3).

### 9.4 Keyboard order

1. Skip link. 2. Header contents (M1.14 order). 3. Main content in DOM order. 4. Footer contents. The starfield and sprite contribute nothing. Visual order always matches DOM order (no `order` or `flex-direction: row-reverse` tricks that reorder focus).

### 9.5 Reduced motion and forced colors

- **Reduced motion:** the shell's only motion is the header surface's opacity fade (§6.2), which remains as a 150ms opacity change. The skip link is instant. The starfield is one still frame (§8.3). Smooth scrolling is never used.
- **Forced colors:** decorative layers hidden (`[data-decorative]`, existing rule). The header gets `background-color: Canvas` (§6.2). The skip link and buttons keep their borders and the outline focus ring.

### 9.6 Print basics

Under `@media print` (tech-agent adds a section 9 to `globals.css`):

- Hide: `[data-decorative]` (starfield, glows, motifs), the skip link, and anything marked `data-print="hide"` (M1.14 marks the menu button, bag button and nav; M1.16 marks the newsletter form and social icons).
- Colours: `color-scheme: light`; text in black and backgrounds removed (`color: #000; background: transparent; box-shadow: none` on everything, `!important` is acceptable inside the print block). The night theme would otherwise print ivory text on white paper. The wordmark follows `currentColor`, so it prints black. `background: transparent` is the shorthand, so it **also clears every `background-image`** (band gradients, haze art, any decorative CSS image). That is intended: decoration doesn't print. Content images are `<img>` elements and still print.
- Layout: `body { display: block; min-height: 0; }`, so the screen's flex column and full-viewport minimum (§4.6) don't stretch `main` to the paper height or push the footer onto a page of its own. The header is `position: static` (a sticky header would repeat or overlap on every page); `main` and `footer` lose their z-index; links stay underlined.
- Images print as they are (`max-width: 100%`). Page-break rules for cards and tables belong to their specs.

---

## 10. States

| State | Behaviour |
|---|---|
| **Default** | header (at rest) + main + footer, starfield behind. |
| **Scrolled** | header surface opaque (§6.2). |
| **Route loading** | **The shell shows nothing.** No `loading.tsx` at the shell level, no progress bar, no skeleton. With App Router prefetching, the current page stays on screen until the next one is ready, then swaps. Header and footer never unmount between routes (they live in the `(site)` layout). A later page spec may add a segment-level `loading.tsx` **inside `main`** for a slow route; the header and footer stay. Next's built-in route announcer announces the new page to screen readers. |
| **Error inside a page** | `app/(site)/error.tsx` (a Client Component). It renders **inside the shell**: header and footer stay, the error content replaces the page inside `main`, and it supplies the page's `<h1>` (copy in §11). Its "Try again" button calls `retry()` (Next 16.4: re-fetches and re-renders the segment; approved tech pushback). It sets no title of its own: the layout's metadata title stays (a second `<title>` would leave the document with two). |
| **Error in the shell itself** (the header or footer failed to render) | `app/error.tsx`, inside the root layout only: no header or footer (they are what failed). It renders its own `<main id="main" tabindex="-1">` with the same error content, so the skip link still works, and a "Go to the home page" link. Header and footer are Server Components with static data, which makes this rare. Like the in-page error, it sets no title of its own. |
| **Error in the root layout** | `app/global-error.tsx` (a Client Component), which replaces the root layout. It renders its own `<html lang="en">` with the **`jost`, `cormorant` and `cormorantItalic` `.variable` classes** (imported from `app/fonts.ts`, so `--font-body` and `--font-display` resolve exactly as under the root layout) and its own `<body>`, and it imports `globals.css` (the root layout's styles may not be loaded). Its content sits inside **`<main id="main" tabIndex={-1}>`**, the one main on that document (there is no skip link, since there is no header to skip). **Title:** a React `<title>Something went wrong · Starflames</title>` rendered in the component, which React hoists into `<head>`. A `metadata` export isn't possible: `global-error` must be a Client Component, and the Next docs name React `<title>` as the alternative (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`, "Global Error"). The root layout's title isn't present here, so this is the document's only `<title>`. Minimal content (§11), no header or footer. |
| **Not found** | Header and footer always present (a 404 is a page like any other). Two files render the same not-found content: `app/(site)/not-found.tsx` (a page in the group calls `notFound()`, e.g. an unknown product slug: renders inside the `(site)` layout) and `app/not-found.tsx` (an unmatched URL, and the `/dev` gate in production builds: renders inside the root layout only, so it **wraps its content in the shell itself**, §13.2). M8.7 restyles the 404 later; the copy in §11 ships until then. **Title "Page not found · Starflames"**, one shared constant: (a) `app/not-found.tsx` exports `metadata = { title: "Page not found · Starflames" }`; the root not-found supports a `metadata` export (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/not-found.md`, "Metadata"). (b) For `app/(site)/not-found.tsx`, those docs document `metadata` only for the root not-found and `global-not-found`, so the title comes from **the page that calls `notFound()`**: its `generateMetadata` runs the same lookup (deduplicated with React `cache`) and, when nothing is found, returns `{ title: "Page not found · Starflames" }` instead of calling `notFound()` itself; the page then calls `notFound()`. A React `<title>` inside the nested not-found was rejected: the layouts' metadata already renders a `<title>`, so React renders both titles, and which one the browser and search engines use is undefined. No `(site)` route calls `notFound()` in M1.13; the first one (M3 or M4) adds an e2e `toHaveTitle("Page not found · Starflames")` check. |
| **Empty / minimal page** | A page with one short section still shows header, main and footer; the footer sits at the bottom of the screen (§4.6). |

Error and not-found content layout: one `plain` section; `Container` with the `prose` wrapper; `<h1>` styled `type-h2` (typography.md §6.1 allows the style to differ from the level), text-primary; a paragraph in `type-body`, text-secondary; then the action(s) 24px below (spacing step 6): "Try again" as a ghost button (not ember: the CTA colour is reserved for shopping actions) and "Go to the home page" as a text link. Contrast: T2 16.52, T7 11.25, ghost border U4 6.67, link T20 12.45.

---

## 11. Copy (final)

| Where | String |
|---|---|
| Skip link | **Skip to content** |
| Header primary navigation (`<nav aria-label>`; M1.14) | **Primary** |
| Mobile menu dialog (`aria-label`, if M1.14 uses a dialog) | **Menu** |
| Footer navigation (`<nav aria-label>`; M1.16) | **Footer** |
| Footer legal links (`<nav aria-label>`, if separate; M1.16) | **Legal** |
| Social links list (`<ul aria-label>`; M1.16) | **Starflames on social media** |
| Breadcrumb (`<nav aria-label>`; M3, M4) | **Breadcrumb** |
| Error inside a page, `<h1>` | **Something went wrong** |
| Error inside a page, paragraph | **This page didn't load properly. Please try again, and if it keeps happening, come back a little later.** |
| Error, button | **Try again** |
| Error / not found, link | **Go to the home page** |
| Global error (`global-error.tsx`), `<h1>` | **Something went wrong** |
| Global error, paragraph | **Starflames couldn't load just now. Please try again in a moment.** |
| Not found, `<h1>` | **We can't find that page** |
| Not found, paragraph | **It may have moved, or the link may be out of date.** |
| Not found, `<title>` (both not-found files; mechanism in §10) | **Page not found · Starflames** |
| Global error, `<title>` (React `<title>`, §10; the in-shell error boundaries keep the layout's title) | **Something went wrong · Starflames** |

Notes:
- "Primary" rather than "Main" for the header nav, so screen readers don't announce "main navigation" right next to the "main" landmark.
- Screen readers add "navigation" to a `<nav>`'s label, so labels never include the word "navigation" or "menu" twice.
- The middle dot in titles is U+00B7 with a space on each side.

---

## 12. Data needs

**None.** The shell reads no data. Navigation, collections or the bag count belong to the header and footer specs (M1.14, M1.16, M5); if any of them reads data, it does so inside its own component, and the shell stays a static Server Component.

## 13. Implementation notes for tech-agent (M1.13)

### 13.1 File map (App Router)

| File | Holds |
|---|---|
| `app/layout.tsx` (root, exists) | `<html>`, `<head>` script, fonts, `metadata`; **adds** the `viewport` export (§6.4) and renders `<SkipLink />` first in `<body>`, then `<WordmarkSprite />`, then `{children}`. Every route under it, including `/dev`, therefore has the skip link, so **every layout or page under the root must render exactly one `<main id="main" tabIndex={-1}>`**. |
| `app/(site)/layout.tsx` (new) | `<SiteShell>{children}</SiteShell>` |
| `components/layout/SiteShell.tsx` (new) | Fragment: `<StarfieldSlot />`, `<SiteHeader />`, `<main id="main" tabIndex={-1} className="relative z-(--z-content) flex-[1_0_auto] …">{children}</main>` (`flex-[1_0_auto]`, not `flex-1`, matching §4.6), `<SiteFooter />`. A Server Component. |
| `components/layout/SkipLink.tsx`, `Container.tsx`, `Section.tsx` (band + spacing), `SectionHeading.tsx`, `StarfieldSlot.tsx` (new) | The pieces in §3–§5 and §8. Names and APIs are tech-agent's call; the behaviour is this spec's. All Server Components. |
| `components/layout/SiteHeader.tsx`, `SiteFooter.tsx` (new, placeholders) | M1.13 renders the slots with their contracts and minimal content: the header bar at `--header-h` with the wordmark home link (`aria-label` comes from the SVG, typography.md §3.4) and no nav yet; the footer on bg-sunken with the line "© 2026 Starflames" (the year from the build date). M1.15 and M1.17 replace their content. The scroll-state island (§6.2) comes with M1.15. |
| `app/(site)/page.tsx` (moved from `app/page.tsx`) | The home placeholder, **without its own `<main>`**: its h1 inside a `plain` section and a `Container`. |
| `app/(site)/error.tsx`, `app/(site)/not-found.tsx` (new) | §10 |
| `app/error.tsx`, `app/not-found.tsx` (new) | §10. `app/not-found.tsx` wraps the not-found content in `<SiteShell>` and exports `metadata` with the not-found title. |
| `app/global-error.tsx` (new) | §10: `'use client'`; imports `globals.css` and `{ jost, cormorant, cormorantItalic }` from `./fonts`; `<html lang="en" className={`${jost.variable} ${cormorant.variable} ${cormorantItalic.variable}`}>`, `<body>`, a React `<title>`, `<main id="main" tabIndex={-1}>` with the content. Update the comment in `app/fonts.ts` ("imported only by app/layout.tsx") to name `global-error.tsx` too. |
| A shared constant for the not-found title (location tech-agent's call) | used by `app/not-found.tsx` and by every `(site)` page's `generateMetadata` that can end in `notFound()` (§10). |
| `app/globals.css` | Section 4: the four new tokens (§4.1) and the short-viewport override. Section 7 (base): `html { scroll-padding-top: var(--scroll-offset); }`, `body` flex column + `min-height: 100svh` only (no `100vh` fallback, §4.6), `#main:focus` rule (§3.3). Section 8 (forced colors): the header `Canvas` rule. New section 9: print (§9.6), including `body { display: block; min-height: 0; }`. Header-surface styles may live with the header component. |

### 13.2 `/dev` pages: opt out by default, opt in by wrapping

- `app/dev/*` stays **outside** the `(site)` group, so dev pages get no header, footer or starfield by default (stable token-page screenshots).
- The token page (`app/dev/tokens/page.tsx`) keeps its own `<main>` and adds `id="main" tabIndex={-1}`, so the root skip link works there. Nothing else changes; the `requireDevPages()` gate and `dev.css` stay as they are.
- A dev page that wants the shell (for example a future layout preview for M1.13's own screenshots) renders `<SiteShell>` around its content and then does **not** render its own `<main>`. That is the opt-in.
- In a plain production build, `/dev/tokens` calls `notFound()` and is a 404 whose HTML is Next's empty `__next_error__` document: the root `app/not-found.tsx`, with the shell, appears only after hydration, from the RSC payload. That is acceptable for a dev-only gate. The dev page's content is still not in that response (the gate runs in the page as well as the layout, M1.11).

### 13.3 Other notes

- **Server Components by default.** Client Components only where needed: the error boundaries (`error.tsx` files must be), the header's scroll-state island (M1.15) and the starfield's child (M1.19).
- The root layout must not import the starfield's client code (§8.3).
- Tailwind already scans `components/`, so `components/layout/` needs no new `@source`.
- Keep `<html suppressHydrationWarning>` and the hero-pending script untouched.
- Suggested e2e checks (tech-agent's call): first Tab focuses the skip link, which is visible and has the name "Skip to content"; Enter focuses `main#main` and its top is not under the header (390 and 1440); exactly one banner, main and contentinfo; every `nav` has a unique name; no horizontal scroll at 320; an unknown URL returns 404 **with** banner and contentinfo and the title "Page not found · Starflames"; `/dev/tokens` still renders under `ENABLE_DEV_PAGES=true`; print emulation hides `[data-decorative]`; CLS < 0.05 with the header in place.

## 14. IP guardrail

Every string in this spec (§11) is plain, generic interface language: "Skip to content", "Primary", "Menu", "Footer", "Legal", "Breadcrumb", "Starflames on social media", and the error and not-found messages and titles. The only name is the brand's own. Token, band and component names (gutter, section, band, plain, solid, sunken, haze, dusk, starfield, shell) are generic English words, and so is the build-note attribute `data-flush-end`. No character, place, court or book names, no author name, no quotes or paraphrases, no invented terms and no "Court of …" style combinations. Re-read for this after the post-pass minors and again after the M2.1 fix round 2 amendment, and confirmed.

## 15. Open questions

1. **`scroll-margin-top` vs `scroll-padding-top`** (§3.4). AC2 names `scroll-margin-top` on `main`. This spec puts the token-driven offset on `html` as `scroll-padding-top` instead (accessibility.md §3 already prescribes it, and it also keeps keyboard-focused elements from hiding under the header), and sets `#main { scroll-margin-top: 0 }`, because using both would double the gap. The outcome AC2 asks for is the same. Orchestrator/QA: confirm this reading.
2. **Footer placeholder copy in M1.13**: "© 2026 Starflames" until M1.16 delivers the footer. [confirm with user: the legal trading name, if it differs from "Starflames"]
