# Site footer (M1.16)

Status: spec, **QA PASSED**, with post-pass minors 1–3, the post-pass minors from M1.15/M1.17 reviews and the doc minors from the M1.17 review applied (changelog below). Owner: design-agent. Implemented by tech-agent in M1.17.
Builds on the footer contract in [`layout-shell.md`](./layout-shell.md) §7 (slot, `--z-content`, opaque bg-sunken, safe-area bottom inset, h2 headings, no layout shift, print), §2 (landmarks, layers), §4 (Container, Grid), §9 (labels, keyboard, forced colors, print) and §11 (reserved labels "Footer", "Legal", "Starflames on social media"; the last is replaced in the footer by the visible "Follow us" label, §2.5). Defines the shared route registry (§3.2) that the header ([`header.md`](./header.md)) also reads, and uses the header's link states and the no-JS requirement (header.md §7, §13.4), [`tokens.md`](../system/tokens.md) (§2.3 roles, §3 contrast, §4 spacing, §7 focus, §8 layers, §9 touch targets), [`typography.md`](../system/typography.md) (§3.3 footer wordmark height, §4 `h4` "footer column titles", §6.1, §7.4), [`motion.md`](../system/motion.md) and [`accessibility.md`](../system/accessibility.md) (§2 luminance working, §3–§6). Collection names come from [`catalog.md`](../copy/catalog.md) §3. Nothing here loosens those files.

Changelog:
- Fix round 1: QA issues 1–9 (2026-10-09). Search and account in the footer; drawer-only keys in AC3, §3.3 and e2e 4; the minimal preview is a path (`/dev/footer/minimal`); one shared registry table plus a `features` map; © year is the build year; current underline offset 0.4em; height maths; social glyphs in white per the platforms' rules; `@source` entries for the dev pages. Legal routes now reference M2.5a/b and M6.0a/b.
- Post-pass minors 1–3 (2026-10-09).
  1. §3.6, §10, §11.1: React context reaches only descendants, so a client **`FooterPreviewProvider`** that renders no DOM wraps both `<main>` and `<SiteFooter preview />` in the page fragment (the footer stays a direct child of `<body>`). `FooterPreviewControls` inside `main` consume it; a client `FooterSlotOutline` leaf reads the checkbox state from it and sets its own `hidden`. Same pattern as header.md §3.4 (`HeaderPreviewProvider`).
  2. §3.2.1, §3.2.3, §3.3, §11.1, §11.3 check 4: the sign-in fallback is a **key-specific rule in the footer-group helper** `footerGroup("help")` (the `footer` field has no "fallback" value; `account` and `sign-in` both carry `footer: "help"` and share one account slot). e2e check 4 takes the account slot's expected link from the helper's output and asserts that the footer never holds both. The registry module is named `components/layout/site-routes.ts`, with the helper names shared with header.md §13.1.
  3. §3.2.1: Search's milestone note now points to header.md §15 question 2.
- Post-pass minors from M1.15/M1.17 reviews (2026-10-09).
  1. The intro, §1, §2.1, §2.5, §2.5.1, §3.5, §3.6, §4.2, §4.3, §4.4, §4.5, §4.6, §5.2, §6 (F13), §7.3, §7.4, §8.1–§8.4, §9, §11.1, §11.3 checks 1, 7 and 13, §11.4, §12, §13 question 8: the social row gets a **visible label, "Follow us"** (Instagram's brand rules allow another network next to Instagram only under a general "Follow us on…" call to action). `type-body-sm`, text-secondary (11.78:1 on bg-sunken), 8px above the icons. The list is now labelled by that visible text (`aria-labelledby`), replacing `aria-label="Starflames on social media"`. The label renders only with the list, so nothing changes on public M1.17 pages; `/dev/footer` shows it. **Requires a small tech follow-up: TASKS M8.8a.**
  2. §3.6, §9.1: `/dev/footer/minimal` gets its own intro string.
  3. §2.5.1, §13 question 6: the accepted glyph sources are recorded (Instagram: Meta's official white glyph SVG, unaltered; Pinterest: Pinterest's own CDN SVG, unaltered, white), with a pre-launch TODO to compare the Pinterest file with the official `P-Badge-White.eps`.
- Doc minors from M1.17 review (2026-10-10).
  1. Changelog, §11.1, §11.3 check 7: the "Follow us" tech follow-up is named **TASKS M8.8a** (it was "M1.17b or with the social-URL task").
  2. Changelog item 1 of the M1.15/M1.17 minors now lists every section the "Follow us" change touched (the intro, §3.5, §3.6, §4.2, §4.4, §4.5, §5.2, §7.3, §8.2–§8.4, §11.1, §11.3 check 1, §11.4 and §13 question 8 were missing), for traceability. No value or copy changed.

---

## 1. Purpose and acceptance criteria

Purpose: a quiet, solid base for every page. It signs off with the wordmark and the brand line, gives every visitor (including a phone visitor without JavaScript, who has no menu button) a plain list of links to every section of the shop, and holds the legal line. It never looks empty, even in M1 when almost no routes exist.

Acceptance criteria (from M1.16, refined):

1. **Structure** (§2): `<footer>` (contentinfo) on bg-sunken; the wordmark at footer size and a one-line brand line; three link groups (Explore, Our collections, Help) with `<h2>` headings; the newsletter teaser slot (position and size budget reserved, **not rendered** in M1.17); social links (Instagram, Pinterest, under a visible "Follow us" label; URLs `[confirm with user]`, **not rendered** until they exist); the legal row (© line, Privacy policy, Terms & conditions; links only when live).
2. **Route rule** (§3): one shared route registry (§3.2) with `live` flags, read by the header and the footer; the **exact M1.17 state** (wordmark, brand line, © line, in a designed minimal composition, §4.2); the full state on `/dev/footer` and the shipped state on `/dev/footer/minimal` for QA screenshots (§3.6).
3. **No-JS** (§3.3): every **drawer-only** registry key (a key the header shows only inside the menu drawer at some breakpoint: `shop`, `collections`, `gift-sets`, `our-story`, `faq`, `contact`, `search`, `account`) is in the footer as soon as it is live, with the registry's label and target. Plain server-rendered anchors, no script needed.
4. **Layout** at 390 / 768 / 1024 / 1440 on the layout-shell Container and Grid (§4); plain stacked lists, no accordion (§4.6); bottom safe-area inset; every link at least 44px tall.
5. **States** (§5): hover, focus-visible, current page (`aria-current="page"` plus a non-colour cue), visited (not distinct).
6. **Contrast** (§6): every text and UI pair on bg-sunken recomputed with the working.
7. **Starfield** (§7.1): not visible behind the footer; consistent with the layout-shell layers.
8. **Print** (§7.4): wordmark, brand line and © line print; navigation, socials and the newsletter slot don't.
9. **Copy** (§9): final strings only.
10. **Implementation notes** for M1.17 (§11): a static Server Component on the registry, the e2e checks.
11. **IP guardrail** (§12).

---

## 2. Structure

### 2.1 DOM (full state, every item live)

```
<footer class="relative z-(--z-content) bg-bg-sunken …">         contentinfo (layout-shell §2.1, §7)
  <div class="Container">
    [newsletter slot]                                              M2.6/M2.7 only (§2.4); not rendered in M1.17
    <div class="FooterMain">                                       the main row (§4)
      <div class="FooterBrand">
        <svg role="img" aria-label="Starflames"> <use …/> </svg>   wordmark, size "footer"; not a link (§2.2)
        <p class="FooterBrandLine">
          <svg aria-hidden="true" data-decorative>crescent</svg>
          Candles for long, starlit evenings.
        </p>
        <div class="FooterSocial" data-print="hide">               only when at least one URL exists (§2.5)
          <p id="footer-social-label">Follow us</p>
          <ul aria-labelledby="footer-social-label">
            <li><a href="…" aria-label="Starflames on Instagram">[icon]</a></li>
            <li><a href="…" aria-label="Starflames on Pinterest">[icon]</a></li>
          </ul>
        </div>
      </div>
      <nav aria-label="Footer">                                    only when at least one group has a live link
        <div class="FooterGroup" data-group="explore">
          <h2 id="footer-explore" class="type-h4">Explore</h2>
          <ul aria-labelledby="footer-explore"> Shop · Collections · Gift sets · Our story · Search </ul>
        </div>
        <div class="FooterGroup" data-group="collections">
          <h2 id="footer-collections" class="type-h4">Our collections</h2>
          <ul aria-labelledby="footer-collections"> Moonlit Terrace · Starlit Library · Ember Grove · Lakeside Hush · Comet Season </ul>
        </div>
        <div class="FooterGroup" data-group="help">
          <h2 id="footer-help" class="type-h4">Help</h2>
          <ul aria-labelledby="footer-help"> FAQ · Contact us · Shipping & returns · Your account </ul>
        </div>
      </nav>
    </div>
    <div aria-hidden="true" data-decorative class="StarlightRule"></div>
    <div class="FooterLegal">
      <p>© 2026 Starflames</p>
      <nav aria-label="Legal"><ul> Privacy policy · Terms & conditions </ul></nav>   only when a legal link is live
    </div>
  </div>
</footer>
```

Rules:
- The footer is a direct child of `<body>`, after `<main>`, exactly once per page (layout-shell §2.1). It has no `aria-label` (one contentinfo needs none).
- **Headings start at `<h2>`** (layout-shell §2.2). The three group headings are `<h2>`, styled `type-h4`. The brand block and the legal row have no heading (the social row's "Follow us" is a `<p>` label, not a heading, §2.5). The newsletter teaser, when it arrives, brings its own `<h2>` (M2.6), placed first in DOM order, so the outline is: page h1 … page h2s, then footer h2s.
- Groups are `<div>`s, not `<section>`s, so the footer adds no extra named regions (layout-shell §5.3 keeps regions to a page's main sections). Each `<ul>` is labelled by its heading, so a screen reader in list navigation still hears "Explore, list, 5 items".
- A group, a `<nav>`, the social row or the legal `<nav>` with no live items **is not rendered at all**: no empty headings, no empty lists, no empty landmarks, no orphan "Follow us" label.

### 2.2 The wordmark

- `<Wordmark size="footer" />` (`components/brand/Wordmark.tsx`): `--wordmark-h-footer`, **40px at base, 44px from md, 48px from xl** (typography.md §3.3). With the 4074 × 1235 viewBox that is about 132 / 145 / 158px wide.
- Colour `text-wordmark` (gold-300). Accessible name "Starflames" from the SVG (`role="img"`, `aria-label`), never inside a heading (typography.md §3.4).
- **Not a link.** The header's wordmark is always the home link, one Tab stop away from the skip link; a second home link at the bottom adds a tab stop and a duplicate announcement for no gain. The footer's wordmark is the brand's sign-off, read once as "Starflames" when a screen reader enters the footer.

### 2.3 Brand line

- `<p>`: a 16px crescent glyph (the header drawer's `components/icons` crescent, `aria-hidden="true"`, `data-decorative`, gold-400) then 8px (step 2) then **"Candles for long, starlit evenings."** The same line and glyph as the header drawer (header.md §5.6), so the brand speaks with one voice.
- `type-body-sm`, text-secondary, `inline-flex`, `align-items: center`, wraps freely (`flex-wrap`, the glyph stays on the first line). Plain text, not focusable.

### 2.4 Newsletter teaser slot (reserved for M2.6 / M2.7)

- **M1.17 state: not rendered. No element, no reserved space.** The footer is server-rendered, so the slot appearing in a later build moves nothing at runtime (CLS is about runtime shifts, not about differences between deployments). A static teaser, a "coming soon" line or a button that goes nowhere is not allowed.
- **Placement (reserved):** the **first child of the footer's Container**, above the main row, full container width at every breakpoint, followed by a `gradient-starlight-rule` (1px, step 12 = 48px above and below it). M2.6 owns everything inside the slot (its `<h2>`, intro, field, button, consent line and messages). The consent line links to the Privacy policy, which M2.5a/M2.5b build before M2.7.
- **Size budget for M2.6:** the slot's `min-block-size` is its tallest state (layout-shell §7: success or error never make the footer grow after submit). M2.6 must fit within **20rem (320px) at base and 12rem (192px) from md**, and set that exact `min-block-size` on the slot. If M2.6 needs more, it says so and design-agent updates this budget.
- **Ground:** bg-sunken is an allowed ground for form controls (tokens.md §2.5 rule 7; `border-control` 4.74:1, U3). No haze inside the footer. The primary CTA in the slot sits next to the email field, so it uses the **no-glow** variant (tokens.md §2.5 rule 9).
- **One signup form per page:** if a page already shows the full newsletter band (for example a home page section from M2.1), that page renders the footer **without** the slot (a `newsletter={false}` prop or equivalent, tech-agent's call). Two identical forms would duplicate field labels and IDs and split attention.
- It renders only when the signup actually works (the `newsletter` feature flag is live, §3.2.2).

### 2.5 Social links

- Instagram and Pinterest, in that order, as icon links in the brand block, under a visible label.
- **M1.17 state: hidden.** Both URLs are `null` until the user provides them `[confirm with user: Instagram and Pinterest profile URLs]`. A link renders only when its URL is set; the social row (label and list) renders only when at least one link does. No space is reserved.
- **Social row:** a wrapper `<div class="FooterSocial" data-print="hide">` holding the label, then the list. It is a flex column, start-aligned, with **8px (step 2)** between the label and the list at every breakpoint.
- **Visible label "Follow us"** (§9). Why: Instagram's brand rules don't allow other social networks in the same spot as Instagram unless it is a general "Follow us on…" call to action (§2.5.1); the label turns the two icons into exactly that. It also tells a sighted visitor what the two small marks are for.
  - Element: `<p id="footer-social-label">`, plain text, not focusable, **not a heading** (the brand block has no heading, §2.1; a one-line `h2` would add an outline entry for two icons).
  - Type `type-body-sm` (Jost 400, 14px at base, 15px from md, line-height 1.5: a 21px / 22.5px line), colour **text-secondary**, the same as the brand line just above it, so the brand block stays one quiet voice. Contrast on bg-sunken **11.78:1** (§6, F13).
  - Its start edge is the start edge of the Instagram button's 44px box (the content edge at base and lg+; the start of the social row at md, §4.3).
- **Accessible name of the list (decision): labelled by the visible label.** `<ul aria-labelledby="footer-social-label">`, so the list is announced "Follow us, list, 2 items", the same pattern as the link groups (a list named by its visible heading). This **replaces** `aria-label="Starflames on social media"`: one name, seen and heard alike, instead of a visible "Follow us" next to a different hidden name. "Starflames on social media" (reserved in layout-shell §11) is no longer used by the footer; layout-shell §11 is to be aligned at its next edit. The link names stay "Starflames on Instagram" / "Starflames on Pinterest", which carry the brand and the platform.
- **List:** `display: flex; gap: 0.5rem` (step 2). Each link: the icon-button box of header.md §4.3 (44 × 44, `rounded-pill`, `border: 1px solid transparent`, 24px glyph, `aria-hidden` glyph, `focusable="false"`), `aria-label` "Starflames on Instagram" / "Starflames on Pinterest". Its colour rules are this section's, not header.md's (below).
- Same tab: **no `target="_blank"`** (a new tab breaks the back button for phone visitors and needs an extra announcement). A plain external `<a>` (not `next/link`), so nothing is prefetched; `rel="me"`, which identifies the profile as the site's own. External links don't trigger the M1.20 404 fixture, which watches our origin, but e2e tests never follow them.

#### 2.5.1 Brand marks: what the platforms allow (checked 2026-10-09)

| Platform | Source | What it allows |
|---|---|---|
| Pinterest | business.pinterest.com/brand-guidelines | The primary logo is the white script "P" in a red circle. "The logo may also be black or white when color usage is limited." Other colours are not allowed ("Do not alter the logo color"). |
| Instagram | Meta brand resource centre (instagram-brand page; its glyph/"Brand Elements" subpages returned 404 or redirects when fetched) | Use only the logos downloaded from the Brand Resource Center, unaltered, and follow its guidelines; don't make the Instagram brand the most prominent feature; don't mention other social networks in the same spot as Instagram unless it is a general "Follow us on…" call to action (hence the "Follow us" label, §2.5). Instagram's published glyph rules allow the glyph in its gradient, in black or in white, and not in other colours. `[confirm before launch: re-check the Instagram glyph page when it is reachable]` |

**Decision:** both glyphs are shown in **solid white `#FFFFFF`** in every state. That is the one colour both platforms allow on a dark ground in a single-colour (monochrome) setting, and it keeps the two marks consistent. No gold, no text-secondary, no tint on hover.

- **Accepted glyph sources (recorded 2026-10-09):**
  - **Instagram:** the **official white glyph SVG from Meta's brand asset pack**, used unaltered (shape, proportions and white fill as supplied).
  - **Pinterest:** **Pinterest's own CDN SVG** (`s.pinimg.com/webapp/pinterest_favicon-…svg`), used unaltered in shape and proportion, rendered in the **white** single-colour version the guidelines allow. Accepted because Pinterest's official brand portal offers the badge only as EPS/PNG behind a login, and this SVG is Pinterest's own published artwork, not a redraw. **Pre-launch TODO:** compare it with the official `P-Badge-White.eps` from the portal (outline and proportions); if they differ, replace it with a conversion of the official file. `[confirm before launch]`
  - Neither glyph is redrawn or traced. Uniform scaling only (24px box).
- `#FFFFFF` is a fixed brand-mandated value for these two glyphs only, set inline on the SVG (`fill="#FFFFFF"`), not a design token, and not used anywhere else on the site.
- Hover and focus never change the glyph colour (§5.2): hover shows a 1px gold-300 outline on the 44px pill; focus shows the global ring.
- Size: 24px glyphs in small, quiet buttons, well below the wordmark in visual weight, so the brand marks are never the most prominent feature.
- In forced colors the system colours replace ours (user agent override, §7.3); in print the social row is hidden.

### 2.6 Legal row

- `<p>` **"© {year} Starflames"** `[confirm with user: legal trading name]`. **`{year}` is the year of the last build** (§10): the footer is a static Server Component (no `cacheComponents`, no revalidation in M1.17), so `new Date().getFullYear()` runs at build time and the value is frozen into the HTML. This is accepted: **a rebuild is part of the new-year routine** (any deploy in January updates it). If `cacheComponents` is ever enabled, the year comes from a small cached helper (`"use cache"` + `cacheLife("days")`) instead, so it updates within a day without a dynamic render. The layout-shell placeholder already ships "© 2026 Starflames".
- `<nav aria-label="Legal"><ul>`: **Privacy policy** (`/privacy`, built in M2.5b, spec M2.5a) and **Terms & conditions** (`/terms`, built in M6.0b, spec M6.0a), each rendered only when live (§3.2). In M1.17 neither is live, so the Legal nav is not rendered.

---

## 3. Routes and the M1.17 state

### 3.1 Rule (same for the header and the footer)

**A link is rendered only when its route is built**, read from the one route registry below (§3.2). tech-agent flips `live` in the task that builds the route, and the link appears in the header and the footer together with no other change. The M1.20 fixture fails a test on any 404, and Next prefetches visible `<Link>`s, so this rule is also what keeps the e2e suite green.

### 3.2 The route registry (single source for the header and the footer)

**header.md §3.2 adopts this table as its single source** (header.md post-pass check fix round 1): it reads these rows through the per-placement helpers (§11.1) and keeps only header-only notes. The header's wordmark link to `/` is always rendered and is not a registry entry. The module is `components/layout/site-routes.ts` (§11.1).

#### 3.2.1 Route entries

Entry shape:

```ts
type RouteEntry = {
  key: string;
  label: string;                 // visible text (footer, drawer); the header's icon buttons use it as their accessible name
  href: string;
  milestone: string | null;      // the task that builds the route; null = no task yet
  live: boolean;                 // true once the route is built
  footer?: "explore" | "help" | "legal";
  header?: "primary" | "more" | "account" | "bag";
};
```

Row order is the display order inside every footer group and every header placement, whatever subset is live.

| key | label | href | milestone | live (M1.17) | footer | header |
|---|---|---|---|---|---|---|
| `shop` | Shop | `/shop` | M3.5 | false | explore | primary |
| `collections` | Collections | `/collections` | M3.7 (index specced in M3.6) | false | explore | primary |
| `gift-sets` | Gift sets | `/collections/gift-sets` | M3.7 (enriched by M8.3/M8.4) | false | explore | primary |
| `our-story` | Our story | `/our-story` | M8.2 | false | explore | primary |
| `search` | Search | `/search` | `null` (header.md §15 question 2) | false | explore | more |
| `faq` | FAQ | `/faq` | M8.2 | false | help | more |
| `contact` | Contact us | `/contact` | M8.2 | false | help | more |
| `shipping-returns` | Shipping & returns | `/shipping-and-returns` | M6.0b (spec M6.0a) | false | help | — |
| `account` | Your account | `/account` | M5.7 | false | help (account slot, below) | account (signed in) |
| `sign-in` | Sign in | `/sign-in` | M5.2 | false | help (account slot, below) | account (signed out) |
| `bag` | Bag | `/bag` | M5.4 | false | — | bag |
| `privacy` | Privacy policy | `/privacy` | M2.5b (spec M2.5a) | false | legal | — |
| `terms` | Terms & conditions | `/terms` | M6.0b (spec M6.0a) | false | legal | — |

Header placements (how each renders is header.md's; read through `headerPrimary()`, `headerMore()`, `headerAccount(signedIn)` and `headerBag()`, header.md §3.2): `primary` = the bar's Primary nav from lg and the drawer's Primary nav below lg; `more` = the drawer's More nav (Search also renders as the bar's icon button from md, header.md §2.1); `account` = the bar's icon button from lg and the drawer's account link below lg, choosing `sign-in` or `account` by session; `bag` = the bar's bag button.

**The account slot: a key-specific rule in the footer-group helper.** The `footer` field has no "fallback" value: `account` and `sign-in` both carry `footer: "help"`, and `footerGroup("help")` applies one rule for these two keys only, letting at most one of them through into a single slot, last in Help. The footer is static and never reads the session.
- `account` live → **"Your account" → `/account`**; `sign-in` is dropped. **M5.7 must redirect signed-out visitors from `/account` to `/sign-in`** (the M5.2 sign-in page), so the one static link serves everyone.
- else `sign-in` live (the gap between M5.2 and M5.7) → **"Sign in" → `/sign-in`**.
- neither live → no slot.
- Never both.

#### 3.2.2 Feature flags (not routes)

Kept out of the route entries, in a separate map in the same module:

```ts
const features = {
  "collection-pages": { milestone: "M3.7", live: false }, // "Our collections" group from getCollections() (§3.4)
  newsletter:          { milestone: "M2.7", live: false }, // the footer teaser slot (§2.4)
} as const;
```

#### 3.2.3 Footer groups

| Group | Contents, in order | Live in M1.17? |
|---|---|---|
| Explore | `shop`, `collections`, `gift-sets`, `our-story`, `search` | none |
| Our collections | each collection's `name` → `/collections/{slug}` (§3.4), when `collection-pages` is live | no |
| Help | `faq`, `contact`, `shipping-returns`, then the account slot (`account`, else `sign-in`; the `footerGroup("help")` rule, §3.2.1) | none |
| Legal | `privacy`, `terms` | none |

- **Shipping & returns sits in Help, not in the legal row.** A customer looking for delivery times or a returns window scans "Help", not the fine print; the legal row stays two short links. (The task listed it with the legal links; this is the grouping change it allowed.)
- **Search** goes last in Explore: it is a way to find products, like the other Explore links. It has no task yet; when one is added, it fills in `milestone` and the footer follows the flag.
- **Bag** is not in the footer: it is always one tap away in the sticky bar (it is never drawer-only).

### 3.3 No-JS requirement

- Without JavaScript the header hides its menu button below lg (header.md §13.4), so on a phone the footer is the only navigation, and FAQ and Contact us are drawer-only at every width. **Every drawer-only key, `shop`, `collections`, `gift-sets`, `our-story`, `faq`, `contact`, `search` and `account` (through the account slot, which shows `sign-in` while `account` isn't live, §3.2.1), is in the footer as soon as it is live, with the registry's label and href.**
  - Drawer-only means: `primary` keys below lg, `more` keys (FAQ and Contact us at every width; Search at base), `account` below lg (header.md §2.1).
- Because both components read the same registry rows, a key that goes live appears in both at once; a new header placement that is drawer-only must also get a `footer` group (qa-agent checks this in each later review).
- They are server-rendered `<a href>` elements (`next/link` renders a real anchor), so they work with no script. `aria-current` is computed during the server render too (§5.1).
- Explore is the first group in the DOM and, at 390, sits in the first row of groups, high in the footer.
- The footer must never hide content behind script: no accordion, no "show more", no client-only list.

### 3.4 "Our collections": data, not a hard-coded list

- Once `collection-pages` is live (M3.7), the group lists the collections from the data layer: `getCollections()` (M1.6) in the footer's Server Component, **excluding `gift-sets`** (Explore already links it), sorted by `sortOrder`, **at most 6**. Today that is Moonlit Terrace, Starlit Library, Ember Grove, Lakeside Hush, Comet Season.
- Why data: Comet Season is limited, and M7 admin can add or archive collections, so a hard-coded list would go stale and could link to a removed page (a 404 the fixture would catch). Whatever the repository returns as public is exactly what is built.
- **While `collection-pages` is not live, `getCollections()` is not called.** M1.17's footer reads no data at all.
- The footer component never imports Firestore (CLAUDE.md); it calls the repository, server-side, and the result is cached with the page (static render plus the collection pages' revalidation, M3.7's call).
- If the repository fails, the group is omitted and the rest of the footer renders (a footer must never break a page).

### 3.5 Exact M1.17 state on public routes

- **Rendered:** the wordmark (footer size), the brand line with its crescent, the starlight rule and "© 2026 Starflames", in the **minimal composition** (§4.2).
- **Not rendered:** the Footer nav and all three groups, the social row (label and list), the Legal nav, the newsletter slot.
- **Links in the M1.17 footer: zero.** Nothing is focusable, nothing is prefetched.
- The footer switches from the minimal to the standard composition (§4.3) automatically, the first time any group, the social row or the newsletter slot has something to render. No other change is needed then.

### 3.6 Dev preview: `/dev/footer` and `/dev/footer/minimal`

Two dev-only pages (gated like `/dev/tokens` and `/dev/header` by `requireDevPages()`, `ENABLE_DEV_PAGES=true`) that render the footer directly (not `SiteShell`), so QA and the M1 gate get real screenshots of both compositions.

- **`/dev/footer`** (`app/dev/footer/page.tsx`): the full state. Every registry entry with a `footer` group as live (`footerGroup(group, { preview: true })`, so the account slot shows `account`, not `sign-in`), both social links with a placeholder URL `https://example.com/` (dev only, never shipped) under their "Follow us" label, the Legal nav, and "Our collections" from a **static fixture of the six catalog collections** (from the typed seed data in `/scripts/seed` or `design/copy/catalog.json`), not from Firestore, so the page never depends on emulator state. Gift Sets is filtered out as in §3.4.
- **`/dev/footer/minimal`** (`app/dev/footer/minimal/page.tsx`): exactly the public M1.17 footer. It has no controls and no provider, and its own intro string (§9.1).
- The two states are **separate paths, not a query parameter**, so each has its own screenshot file (`routeSlug()` in `tests/e2e/support/screenshot.ts` strips the query) and neither page reads `searchParams`. (captureRoute's `name` and `fullPage` options, added for header.md §3.4, aren't needed here: each footer state is its own path and a default full-page shot.)
- **Controls are client-side state, not query parameters** (on `/dev/footer` only), the same pattern as header.md §3.4:
  - The page returns a fragment:

    ```
    <FooterPreviewProvider>
      <main id="main" tabIndex={-1}> h1, intro, state links, <FooterPreviewControls />, content </main>
      <SiteFooter preview />
    </FooterPreviewProvider>
    ```

  - **`FooterPreviewProvider`** (client) holds the preview state (current path: None; show the slot: unticked) and renders **only the context provider, no DOM element**, so `<main>` and `<footer>` stay direct children of `<body>` and the footer keeps its contentinfo role. React context reaches only descendants, which is why the provider wraps **both** `<main>` (where the controls are) and `<SiteFooter>` (where the readers are). `SiteFooter` stays a Server Component, passed in as a child.
  - **`FooterPreviewControls`** (client, inside `main`) consumes the context and writes it: a "Current page" `<select>` (None, then every footer target) and a "Show the reserved newsletter space" checkbox.
  - **Readers:** in preview, `FooterLink` takes its current path from the context instead of `usePathname()`. The slot outline is a small client leaf, **`FooterSlotOutline`**, rendered by `SiteFooter` in preview only, at the slot's place (§2.4): it reads the checkbox state from the context and renders its box with `hidden={!showSlot}`. The server HTML therefore carries `hidden` (the default is unticked), and ticking the box removes it. The outline is an **empty outlined box** (1px dashed `border-divider`, the §2.4 `min-block-size`) with a dev-only caption; never on public routes.
  - With no provider (every public route and `/dev/footer/minimal`) the context is `null`, and the readers use their real sources.
- **Both pages stay static.** They read no `searchParams`, cookies or headers, so they are prerendered at build time and the `app/dev/gate.ts` comment ("The pages are static, so this runs once, at build time") stays accurate. Any later dev control must stay client-side for the same reason.
- A "Footer state" link pair at the top of each page switches between them: "Full" (`/dev/footer`) and "Minimal (as shipped in M1.17)" (`/dev/footer/minimal`); the current one has `aria-current="page"`. Both routes exist, so `next/link` is fine there.
- Footer links to unbuilt routes use **plain `<a href>`, not `next/link`**, on these pages only (header.md §3.4): nothing is prefetched, the fixture sees no 404, and tests never follow them.
- Each page renders its own `<main id="main" tabIndex={-1}>` with an `<h1>`, a short intro and (on `/dev/footer`) the controls, about 400px of plain content above the footer (so the footer sits low but the screenshot stays compact), and then the footer. `/dev/footer/minimal` returns the plain fragment `<main>` then `<SiteFooter>`. `app/dev/layout.tsx` returns its children unwrapped, so on both pages the footer is a direct child of `<body>` right after `main`. The preview has no header, which is fine here.
- Add `/dev/footer` and `/dev/footer/minimal` to the screenshot `ROUTES` list (M1.20). Expected files: `test-results/screenshots/dev-footer-<project>.png` and `test-results/screenshots/dev-footer-minimal-<project>.png`, for `mobile-390` and `desktop-1440`. Public `/` screenshots (`home-<project>.png`) show the minimal footer too.

---

## 4. Layout

All content sits in the layout-shell `Container` (`--page-inline-start` / `--page-inline-end`, content max 1280px). The background is full-bleed bg-sunken.

### 4.1 Vertical spacing (both compositions)

| | base (390) | md (768) | lg (1024) | xl (1440) |
|---|---|---|---|---|
| Padding top | 48 (step 12) | 64 (step 16) | 80 (step 20) | 96 (step 24) |
| Main row → starlight rule | 48 (step 12) | 48 | 64 (step 16) | 64 |
| Rule → legal row | 24 (step 6) | 24 | 24 | 24 |
| Padding bottom | `calc(2rem + env(safe-area-inset-bottom, 0px))` (32 + inset) | same | `calc(2.5rem + env(safe-area-inset-bottom, 0px))` (40 + inset) | same |

- The space between the last page section and the footer is that section's own `--section-y` bottom padding (layout-shell §5.1); the footer's top padding is in addition, since bg-sunken is a different colour from bg-page (a visible edge).
- The bottom safe-area inset is added to the padding (layout-shell §6.4), so the © line and legal links clear the home indicator on notched phones. The background runs under the inset.
- Side insets are already handled by `--page-inline-*` in the Container.
- **Starlight rule:** `block-size: 1px`, `background: var(--gradient-starlight-rule)`, full container width in the standard composition, `inline-size: min(100%, 20rem)` and centred in the minimal one. `aria-hidden="true"`, `data-decorative` (hidden in forced colors and print).

### 4.2 Minimal composition (M1.17 public state)

Used when the footer has **no** link group, social row or newsletter slot to render. Everything is centred (`text-align: center`, items centred in a flex column), at every breakpoint:

1. Wordmark (40 / 44 / 48px tall).
2. 16px (step 4).
3. Brand line: crescent + "Candles for long, starlit evenings." (centred; the crescent stays on the first line).
4. 48px (step 12) at base / 64px (step 16) from lg, then the starlight rule (20rem, centred), then 24px (step 6).
5. "© 2026 Starflames", centred.

Why this isn't an empty footer: it is a deliberate sign-off. The wordmark at 40–48px is the largest brand moment on the page after the header, the crescent and the fading gold rule carry the night motif, and the generous top padding gives the page a calm end rather than a cut-off. The footer still sits at the bottom of the screen on short pages (layout-shell §4.6).

Height (body-sm line-height 1.5: 14px × 1.5 = **21px** at 390, 15px × 1.5 = **22.5px** at 1440; the 16px crescent sits inside that line box):
- At 390: 48 + 40 + 16 + 21 + 48 + 1 + 24 + 21 + 32 = **251px** plus the bottom inset.
- At 1440: 96 + 48 + 16 + 22.5 + 64 + 1 + 24 + 22.5 + 40 = **334px** (about 335 after sub-pixel rounding) plus the bottom inset.

```
390, minimal (M1.17)
|<------------------------- 390 -------------------------->|
| 20 |<------------------- 350 ------------------->| 20 |
+----------------------------------------------------------+  bg-sunken, z 1
|                     ..... 48 .....                       |
|                      [Starflames]                        |  wordmark 40px tall, gold-300
|                     ..... 16 .....                       |
|          ( Candles for long, starlit evenings.           |  crescent + body-sm (21px line), text-secondary
|                     ..... 48 .....                       |
|                 ---------====---------                   |  starlight rule, 20rem, centred
|                     ..... 24 .....                       |
|                    © 2026 Starflames                     |  body-sm (21px line), text-muted
|                     ..... 32 + bottom inset .....        |
+----------------------------------------------------------+

1440, minimal: the same stack, centred in the 1280 content box; wordmark 48px, top 96, rule gap 64, bottom 40.
```

### 4.3 Standard composition (any group, socials or slot present)

Start-aligned. The main row uses the layout-shell Grid recipe; the `<nav>` uses its **own** Grid recipe with the same column count and gap as the columns it spans, so its columns line up exactly with the page grid (layout-shell §4.3: a nested grid always gets its own recipe).

| | base (390, 4 cols) | md (768, 8 cols) | lg (1024, 12 cols) | xl (1440, 12 cols) |
|---|---|---|---|---|
| Main row | flex column: brand block, then 40px (step 10), then nav | flex column: brand block, then 48px (step 12), then nav | `Grid` 12: brand block cols 1–4, nav cols 5–12 | same as lg |
| Brand block | column: wordmark, 16, brand line, 24 (step 6), social row | **row**: [wordmark, 16, brand line] at the start; the social row at the end, its bottom aligned with the brand line's bottom (`justify-between`, `items-end`) | column, as base | column, as base |
| Social row (label, then icons) | column: "Follow us", 8 (step 2), icons; label start = content edge | column: "Follow us", 8, icons; label start = the Instagram button's start edge (the social row is start-aligned inside itself, at the end of the brand row) | as base | as base |
| Nav grid | `grid-cols-4`, gap `--grid-gap` (16) columns, **32px (step 8) rows** | `grid-cols-8`, gap 24, rows 32 | `grid-cols-8` (inside cols 5–12), gap 24, rows 32 | `grid-cols-8`, gap 32, rows 32 |
| Explore | span 2 | span 3 | span 2 | span 2 |
| Our collections | span 2 | span 3 | span 3 | span 3 |
| Help | span 2 (second row) | span 2 | span 3 | span 3 |
| Legal row | column: © line, then 8px (step 2), then the Legal links (a wrapping row, 24px gap) | row: © line at the start, Legal links at the end (`justify-between`, wrap) | row | row |

- Social row height: label line + 8 + 44 = **73px** at 390 (21 + 8 + 44) and **74.5px** from md (22.5 + 8 + 44). The label is never wider than the two buttons together (96px; "Follow us" is about 62px at 14px and 66px at 15px), so the row's width is the buttons' width.
- Groups are auto-placed in DOM order with the spans above, so if one group isn't live the others simply pack from the start; nothing leaves a hole in the middle.
- Column widths (no insets): base span 2 = 167px; md span 3 = 249px, span 2 = 158px; lg brand 299px, span 2 = 137px, span 3 = 218px; xl brand 405px, span 2 = 187px, span 3 = 296px. The longest labels ("Shipping & returns", "Starlit Library", about 135–140px in `type-nav`) fit on one line from 390 up; at 320 (span 2 = 132px) "Shipping & returns" wraps to two lines, which is allowed (§8.4).
- Inside a group: `<h2>` (`type-h4`), then 8px (step 2), then the list. List items stack with **no gap**: each link is a 44px row (§4.5), so the rows themselves give the rhythm (about 28px of air between lines of text at 16px).
- Grid and flex children have `min-width: 0` (layout-shell §4.3).

```
390, standard (all live)
|<------------------------- 390 -------------------------->|
| 20 |<------------------- 350 ------------------->| 20 |
+----------------------------------------------------------+
|  ..... 48 .....                                          |
|  [newsletter slot, M2.6: full width, ≤ 20rem]            |  later only
|  ..... 48 ..... ---------====--------- ..... 48 .....    |
|  [Starflames]                                            |  40px
|  ..... 16 .....                                          |
|  ( Candles for long, starlit evenings.                   |
|  ..... 24 .....                                          |
|  Follow us                                               |  body-sm (21px line), text-secondary
|  ..... 8 .....                                           |
|  [ig 44] 8 [pin 44]                                      |
|  ..... 40 .....                                          |
|  Explore              |16| Our collections               |  h2, type-h4
|  Shop                 |  | Moonlit Terrace               |  44px rows
|  Collections          |  | Starlit Library               |
|  Gift sets            |  | Ember Grove                   |
|  Our story            |  | Lakeside Hush                 |
|  Search               |  | Comet Season                  |
|  ..... 32 .....                                          |
|  Help                                                    |
|  FAQ                                                     |
|  Contact us                                              |
|  Shipping & returns                                      |
|  Your account                                            |
|  ..... 48 .....                                          |
|  ------------------====------------------                |  starlight rule
|  ..... 24 .....                                          |
|  © 2026 Starflames                                       |
|  ..... 8 .....                                           |
|  Privacy policy   24   Terms & conditions                |  44px rows
|  ..... 32 + bottom inset .....                           |
+----------------------------------------------------------+

768, standard
| 32 |[Starflames]                                                       | 32 |
|    |                                                 Follow us         |
|    |( Candles for long, starlit evenings.            [ig] 8 [pin]      |
|    |..... 48 .....                                                     |
|    |Explore (span 3)        |Our collections (span 3) |Help (span 2)   |
|    |Shop                    |Moonlit Terrace          |FAQ             |
|    |…                       |…                        |…               |
|    |..... 48 ..... rule ..... 24 .....                                 |
|    |© 2026 Starflames                 Privacy policy  24  Terms & conditions|

1440, standard
| 80 |<--------------------------------- 1280 -------------------------------->| 80 |
+------------------------------------------------------------------------------------+
|    ..... 96 .....                                                                   |
|    [newsletter slot, M2.6: full width, ≤ 12rem]   (later only, then rule, 48 / 48)   |
|    [Starflames] 48px          | Explore    | Our collections   | Help              |
|    ( Candles for long,        | Shop       | Moonlit Terrace   | FAQ               |
|      starlit evenings.        | Collections| Starlit Library   | Contact us        |
|    ..... 24 .....             | Gift sets  | Ember Grove       | Shipping & returns|
|    Follow us                  | Our story  | Lakeside Hush     | Your account      |
|    [ig] 8 [pin]               | Search     | Comet Season      |                   |
|    |<-- cols 1–4, 405 -->|    |<- 2,187 ->|<--- 3, 296 ---->|<--- 3, 296 ---->|  |
|    ..... 64 ..... ---------------------====--------------------- ..... 24 .....     |
|    © 2026 Starflames                                  Privacy policy  24  Terms & conditions |
|    ..... 40 + inset .....                                                           |
+------------------------------------------------------------------------------------+
```

(1024 is the 1440 layout with 40px gutters, 24px gaps, 80px top padding and the column widths above.)

### 4.4 Alignment between rows

- The wordmark's start edge is the content edge (the Container's start padding), the same line as the header's wordmark and every section's content. At base, lg and xl the "Follow us" label and the Instagram button share that edge.
- At lg and xl the group headings share one top line (grid row start); the wordmark's top aligns with them.

### 4.5 Touch targets

- Every link (group links, legal links) has `min-block-size: var(--size-touch)` (44px) and `min-inline-size: var(--size-touch)`, `display: inline-flex; align-items: center`. Its padding-inline is 0, so the text starts on the column edge; the 44px minimum width matters only for short labels ("FAQ").
- Stacked rows are 44px each and touch without overlapping; the legal links in a row keep 24px (step 6) between them (more than the 8px minimum).
- Social links are 44 × 44 with 8px between them. The "Follow us" label is plain text, not a target.

### 4.6 Plain stacked lists, not an accordion (decision)

On mobile the groups are **always-open lists**, never accordions or disclosure widgets.

- **No JS needed.** This footer is the no-JS visitor's only navigation (§3.3). An accordion needs either script or `<details>`; closed `<details>` hides the very links the requirement is about.
- **Accessibility.** Lists under real headings are navigable by heading (H) and list (L) shortcuts with nothing to expand; no `aria-expanded` state to keep in sync; every link is one Tab away.
- **SEO.** Crawlers follow visible anchors regardless, but collapsed content is given less weight by some engines; open lists show every section of the shop as plain internal links.
- **Cost is small.** With three short groups in a two-column grid, the full footer at 390 (no newsletter slot) is about 940px tall (h4 line 27.5px, 44px link rows, the 29px "Follow us" label and gap): about one and a half screens at the very end of the page. An accordion would save a few hundred pixels and cost the no-JS links.
- Revisit only if a group ever passes about eight links (it would be its own spec change).

---

## 5. States

### 5.1 Footer links (group links and legal links)

`FooterLink`: the header's `NavLink` behaviour (most-specific current match, `aria-current`) with footer styles.

| State | Text colour | Underline | Notes |
|---|---|---|---|
| Default | text-secondary | none | navigation list, not running text (the always-underline rule is for links in prose, tokens.md §2.3, as in header.md §4.2) |
| Hover | text-primary, `duration-fast`, `ease-standard` | 1px, `currentColor`, `text-underline-offset: 0.4em` | the underline appears with the colour change; it is not animated |
| Focus-visible | unchanged colours | as its state | the global ring: 2px gold-300, 2px offset (tokens.md §7), around the 44px link box |
| Active (press) | as hover | as hover | no scale (text links don't press) |
| **Current** (`aria-current="page"`) | text-primary | **2px gold-300**, `text-underline-offset: 0.4em` | the line's presence is the non-colour cue (the same offset as header.md §7.1) |
| Current + hover | text-primary | stays 2px gold-300 | |
| Visited | **same as default** | — | a shop, not a document (tokens.md §2.3) |
| Disabled | never | — | an unbuilt route is not rendered (§3.1) |

- Type: group links `type-nav` (Jost 500, 15–16px). Legal links `type-body-sm` (Jost 400, 14–15px). The © line `type-body-sm`.
- **Current page:** `aria-current="page"` when the current path equals the link's target or starts with the target plus `/`, the **most specific** match only (header.md §7.1). So on `/collections/moonlit-terrace`, "Moonlit Terrace" (Our collections) is current and "Collections" (Explore) is not; on `/collections` only "Collections" is. The header and the footer can both mark the same page; that is expected (two navigations, each telling the truth).

### 5.2 Social links

The glyph is `#FFFFFF` in every state (§2.5.1); state is shown by the button's outline, never by recolouring the mark. The "Follow us" label has one state (static text) and never changes on hover or focus of the links.

| State | Glyph | Button box |
|---|---|---|
| Default | `#FFFFFF` | 1px transparent border |
| Hover | `#FFFFFF` (unchanged) | 1px border in gold-300 (`link`), `border-color` change at `duration-fast`, `ease-standard` |
| Focus-visible | `#FFFFFF` (unchanged) | the global ring (2px gold-300, 2px offset) outside the pill |
| Active | `#FFFFFF`, glyph `scale(var(--motion-scale-press))`, `duration-fast` (1 under reduced motion) | as hover |

Uniform scaling keeps the mark's shape and proportions unaltered.

### 5.3 Other states

| State | Behaviour |
|---|---|
| Loading | none: the footer is static server HTML and never shows a skeleton. Route changes keep it mounted (layout-shell §10). |
| Empty | the minimal composition (§4.2) is the designed empty state. |
| Error | if `getCollections()` fails (M3.7 on), that group is omitted (§3.4). The footer never throws. If the footer itself fails, `app/error.tsx` renders without it (layout-shell §10). |
| Newsletter states | owned by M2.6 inside the reserved slot (§2.4). |

---

## 6. Contrast on bg-sunken

Working as accessibility.md §2 (L + 0.05 values from its §2.4 table; bg-sunken night-950 `#070914`, L 0.00291, L + 0.05 = **0.05291**). Ratios rounded down to 2 decimals.

| # | Element | Foreground | Working | Ratio | Needs | Verdict |
|---|---|---|---|---|---|---|
| F1 | Group headings (`type-h4`, Cormorant 600, 22–24px; normal text) | text-primary moon-100 | 0.915573 / 0.05291 = 17.304 | **17.30** (T1) | 4.5 | Pass |
| F2 | Group links default, legal links, brand line | text-secondary night-200 | 0.62372 / 0.05291 = 11.788 | **11.78** (T6) | 4.5 | Pass |
| F3 | Link hover and current text | text-primary | as F1 | **17.30** | 4.5 | Pass |
| F4 | © line | text-muted night-300 | 0.36957 / 0.05291 = 6.984 | **6.98** (T11) | 4.5 | Pass |
| F5 | Wordmark | gold-300 (`text-wordmark`) | 0.68983 / 0.05291 = 13.037 | **13.03** (T23) | logo, exempt; passes anyway | Pass |
| F6 | Current underline (non-text cue), social button hover border | gold-300 | as F5 | **13.03** | 3.0 | Pass |
| F7 | Focus ring | gold-300 | as F5 | **13.03** (U7) | 3.0 | Pass |
| F8 | Crescent glyph (decorative) | gold-400 | 0.55225 / 0.05291 = 10.437 | **10.43** (layout-shell §5.3) | exempt | Pass |
| F9 | Hover underline (1px, currentColor = text-primary) | text-primary | as F1 | **17.30** | 3.0 | Pass |
| F10 | Starlight rule, peak gold-300 at 60% over night-950 (decorative) | composite (142, 128, 98) `#8E8062` | R 142: 0.556863 → 0.579965 → 0.270514; G 128: 0.501961 → 0.527925 → 0.215861; B 98: 0.384314 → 0.416411 → 0.122139. L = 0.057511 + 0.154384 + 0.008818 = 0.220713; 0.270713 / 0.05291 = 5.116 | **5.11** | exempt (decorative); no meaning | — |
| F11 | Dev preview only: slot outline `border-divider` night-600 | night-600 | (0.03948 + 0.05) / 0.05291 = 1.691 | 1.69 | decorative, dev-only | — |
| F12 | Social glyphs, every state (non-text, they identify the link) | `#FFFFFF` (brand-mandated, §2.5.1) | (1 + 0.05) / 0.05291 = 19.845 | **19.84** | 3.0 | Pass |
| F13 | Social row label "Follow us" (`type-body-sm`, 14–15px, normal text) | text-secondary night-200 | (L 0.57372 + 0.05) = 0.62372 / 0.05291 = 11.788 | **11.78** (T6) | 4.5 | Pass |

Decisions from the table:
- **Links are text-secondary**, not gold-300: a column of gold links would turn gold into a large area (tokens.md §2.5 rule 2) and compete with the wordmark. Hover and current lift to text-primary; current adds the gold line.
- **Headings are text-primary, not gold-400.** typography.md §7.4 allows Cormorant at 22–27px (h4) only in text-primary or as a gold *accent word*, not as a whole gold heading. Gold stays in the wordmark, the crescent, the rule, the current line and the social hover outline.
- **The "Follow us" label is text-secondary**, matching the brand line above it: it introduces the icons quietly and doesn't compete with the group headings (text-primary) or the wordmark (gold).
- **text-muted is used once**, for the © line (6.98:1 on solid bg-sunken; it is never over a gradient here).
- No new colour token. F10 and F11 are decorative composites; F12 is the platforms' own white, used only for their two marks.

---

## 7. Layers, motion, forced colors, print

### 7.1 Starfield and layers

- **The starfield does not show behind the footer.** The starfield is the fixed layer at `--z-starfield` (0); the footer is `position: relative; z-index: var(--z-content)` (1) with an **opaque** bg-sunken, so it paints over the layer completely (layout-shell §2.3, §7). This matches the layout-shell contract exactly; nothing in this spec changes a layer.
- The footer's only motif is its own crescent glyph and the starlight rule, inside its content (in flow, `data-decorative`), not behind text. No particles, glows or haze in the footer; `gradient-candle-glow` is not used here.
- **For M1.18/M1.19:** the footer covers the bottom of the viewport only when it is scrolled into view, so the starfield's "pause when fully covered" rule (layout-shell §8.3) doesn't apply because of the footer alone. No extra requirement.

### 7.2 Motion

- **None.** Nothing in the footer animates on load or scroll. Hover changes `color` (links) or `border-color` (social buttons) at `--duration-fast` (a state change, motion.md §1). The social link press uses `--motion-scale-press` (1 under reduced motion through the token remap, motion.md §6.3).
- No layout shift: server-rendered at its final size, no client-only content, no lazy images (the icons are inline SVG). Target: footer contribution to CLS is 0.

### 7.3 Forced colors

- bg-sunken becomes `Canvas`; text follows `CanvasText` / `LinkText`.
- The crescent and the starlight rule are hidden (`[data-decorative]`, existing rule).
- The current link keeps its underline (a text decoration survives); hover underline too. Social links keep their 1px border, which becomes a visible edge.
- Social glyphs: set `forced-color-adjust: auto` (the default) and give the SVG `fill: currentColor` under `@media (forced-colors: active)`, so the user's system colour replaces the white. That is the user agent honouring the visitor's setting, not a recolouring by the site.
- The "Follow us" label is plain text and follows `CanvasText`.
- The wordmark uses `currentColor`, so it follows `CanvasText` (it is not a link here).
- The focus ring is an outline and survives.

### 7.4 Print (decision)

- **Prints:** the wordmark (black, through `currentColor`), the brand line text and the © line. This identifies the shop on a printed order confirmation or care page.
- **Hidden** with `data-print="hide"`: the Footer nav, the Legal nav, the social row (its wrapper, so the "Follow us" label goes with the icons; layout-shell §9.6 already names the social list) and the newsletter slot (layout-shell §9.6). Link lists are useless on paper, and the legal pages are better printed on their own.
- The starlight rule and the crescent are `data-decorative`, so they are hidden by the existing print rule.
- The footer prints in normal flow after `main` (layout-shell §9.6: `body { display: block }`, no z-index); padding stays as on screen, so it may add about 2–3cm at the end of the last page, which is accepted. Optional, tech-agent's call: `break-inside: avoid` on the footer so its three lines aren't split across pages.

---

## 8. Accessibility

### 8.1 Landmarks and labels

- One contentinfo per page. Inside it: `<nav aria-label="Footer">` and `<nav aria-label="Legal">` (both from layout-shell §11; unique on the page alongside the header's "Primary" and "More").
- Social list: `<ul aria-labelledby="footer-social-label">`, named by the visible label **"Follow us"** (§2.5); links named "Starflames on Instagram", "Starflames on Pinterest". The visible label and the list's name are the same text, so what a sighted visitor reads is what a screen reader announces.
- No landmark is rendered empty (§2.1).

### 8.2 Headings

- `<h2>` for each group (Explore, Our collections, Help), styled `type-h4`; never `<h1>`, never a skipped level. The newsletter's own `<h2>` comes first when it exists (M2.6). "Follow us" is a label, not a heading. In M1.17 the footer has **no headings**.

### 8.3 Keyboard order

DOM order is visual order (layout-shell §9.4); after the last focusable element in `main`:

| State | Order |
|---|---|
| M1.17 public (minimal) | nothing: the footer has no focusable elements |
| Full | (newsletter field and button, M2.7) → Starflames on Instagram → Starflames on Pinterest → Shop → Collections → Gift sets → Our story → Search → each collection → FAQ → Contact us → Shipping & returns → Your account → Privacy policy → Terms & conditions |

Only live items take part (§3). The "Follow us" label is not focusable.

### 8.4 Text spacing, zoom, 320px

- No fixed heights around text: links use `min-block-size` and wrap; the brand line and the "Follow us" label wrap; group columns are fluid.
- Under the WCAG 1.4.12 override, labels may wrap to two lines inside their column (the 44px row grows); nothing is clipped. At 390 and 1440 the full footer was checked against the column widths in §4.3.
- At 320 the base layout holds (span 2 = 132px); "Shipping & returns" wraps. No horizontal scroll (no fixed widths, `min-width: 0`, `overflow-wrap: break-word`).
- 200% and 400% zoom use the base layout, as everywhere (layout-shell §9.2).

### 8.5 Screen-reader reading in M1.17

"Content info" landmark, then "Starflames, image", then "Candles for long, starlit evenings.", then "© 2026 Starflames". The crescent and the rule are hidden from assistive technology.

---

## 9. Copy (final)

| Where | String |
|---|---|
| Wordmark (accessible name, from the SVG) | **Starflames** |
| Brand line | **Candles for long, starlit evenings.** |
| Footer navigation (`<nav aria-label>`) | **Footer** (layout-shell §11) |
| Group heading 1 | **Explore** |
| Explore links | **Shop** · **Collections** · **Gift sets** · **Our story** · **Search** (the registry labels, §3.2) |
| Group heading 2 | **Our collections** |
| Our collections links | each collection's `name` from the data layer; today **Moonlit Terrace** · **Starlit Library** · **Ember Grove** · **Lakeside Hush** · **Comet Season** (catalog.md §3) |
| Group heading 3 | **Help** |
| Help links | **FAQ** · **Contact us** · **Shipping & returns** · **Your account** (or **Sign in** while only `sign-in` is live: the account slot, §3.2.1) |
| Social row label (visible `<p>`; also the list's accessible name through `aria-labelledby`) | **Follow us** |
| Instagram link (accessible name) | **Starflames on Instagram** |
| Pinterest link (accessible name) | **Starflames on Pinterest** |
| © line | **© {year} Starflames**, `{year}` = the build year (renders "© 2026 Starflames" for a 2026 build) `[confirm with user: legal trading name]` |
| Legal navigation (`<nav aria-label>`) | **Legal** (layout-shell §11) |
| Legal links | **Privacy policy** · **Terms & conditions** `[confirm with user: the titles must match the final legal documents (M2.5a, M6.0a)]` |

Notes:
- "Our collections" rather than a second "Collections", so the group heading never reads the same as the Explore link to the collections index.
- "Shipping & returns" uses the ampersand, like the catalog's product names; screen readers read it as "and".
- "Your account" is the header's signed-in label; the footer uses it for everyone because `/account` sends signed-out visitors to sign in (§3.2.1).
- "Follow us" is a general call to action, the form Instagram's brand rules allow when another network sits next to Instagram (§2.5.1). It has no full stop (a label, not a sentence) and names no platform itself; the link names do. It replaces the footer's use of "Starflames on social media" (layout-shell §11).
- "Bag" doesn't appear in the footer. If a later version adds it, it is "Bag", never "Cart" (header.md §11.1).
- The © sign is U+00A9 followed by a normal space.

### 9.1 Dev preview pages (`/dev/footer`, `/dev/footer/minimal`, dev-only)

| Where | String |
|---|---|
| `<h1>` | **Footer preview** |
| Intro (`/dev/footer`) | **Every footer link is shown here as if its page existed. Links to pages that aren't built yet go nowhere.** |
| Intro (`/dev/footer/minimal`) | **This is the footer exactly as it ships today: no links are live yet, so it shows only the sign-off.** |
| State links, label | **Footer state** |
| State links | **Full** · **Minimal (as shipped in M1.17)** |
| Current page control, label (`/dev/footer`) | **Current page** (option for none: **None**; the other options are the footer link labels) |
| Newsletter slot toggle, label (`/dev/footer`) | **Show the reserved newsletter space** |
| Slot caption (inside the outlined box) | **Reserved for the newsletter signup (M2.6, M2.7)** |

Note: the minimal page renders the real public footer, so its intro is true while no footer item is live. The task that makes the first footer item live (the first `live` flip with a `footer` group, the social URLs or the newsletter) also updates or retires this intro and the "Minimal (as shipped in M1.17)" state link.

---

## 10. Data needs

| Need | Source | When |
|---|---|---|
| Route registry: `key`, `label`, `href`, `milestone`, `live`, `footer`, `header` (the `RouteEntry` type); plus the `features` map | the shared static module `components/layout/site-routes.ts`, read through `footerGroup(group)` (§3.2, §11.1) | M1.17 |
| Current path | `usePathname()` in `FooterLink` (the header's `NavLink`, client leaf); on `/dev/footer`, the `FooterPreviewProvider` context (§3.6) | M1.17 (no links rendered yet; built and tested on `/dev/footer`) |
| Slot outline visibility (dev only) | the `FooterPreviewProvider` context, read by `FooterSlotOutline` (§3.6) | M1.17 |
| Collections for "Our collections": `collection.slug`, `collection.name`, `collection.sortOrder` | `getCollections()` (M1.6), server-side, only when `collection-pages` is live; excludes `gift-sets`; max 6 | M3.7 |
| Social profile URLs | a typed constant (for example `lib/site/social.ts`, location tech-agent's call): `{ instagram: string \| null, pinterest: string \| null }`, both `null` now | when the user provides them |
| Year for the © line | `new Date().getFullYear()` in the static Server Component, evaluated **at build time**: the year of the last build (§2.6). With `cacheComponents` on, a `"use cache"` + `cacheLife("days")` helper instead | M1.17 |
| Newsletter teaser | M2.6 / M2.7 | M2.7 |

The footer never imports Firestore; the collection list goes through the repository.

---

## 11. Implementation notes for tech-agent (M1.17)

### 11.1 Files (names are tech-agent's call, except the shared registry module, which both specs name)

| File | Kind | Holds |
|---|---|---|
| `components/layout/SiteFooter.tsx` | **Server** | replaces the M1.13 placeholder: the `<footer>`, the Container, the brand block, the groups, the legal row; chooses the minimal or standard composition (§4.2, §4.3) from what is live; optional `preview` prop (dev pages only: helpers called with `{ preview: true }`, social URLs, collection fixture, and the `FooterSlotOutline` leaf); optional `newsletter` prop (default `true`, M2.7 on) |
| `components/layout/site-routes.ts` | module | **the shared route registry** (header.md §13.1 reads the same module; there is no `nav-routes.ts`): the `RouteEntry` type and the §3.2.1 entries, the §3.2.2 `features` map, and the helpers. Footer: `footerGroup(group)`, the live entries of one footer group in row order, with the account-slot rule (§3.2.1). Header: `headerPrimary()`, `headerMore()`, `headerAccount(signedIn)`, `headerBag()` (header.md §3.2). Every helper takes `{ preview?: boolean }`; true treats every entry as live (dev pages only) |
| `components/layout/footer/preview-context.ts` | module (client) | the `FooterPreviewContext` (current path, show slot, and their setters), default `null`, so public routes are unaffected |
| `FooterLink` | Client (leaf) | reuse the header's `NavLink` with a `variant="footer"` (styles §5.1), or a thin wrapper; same matching rule; renders `next/link`, or plain `<a>` in preview; in preview reads the current path from `FooterPreviewContext` |
| `components/layout/footer/FooterSlotOutline.tsx` | Client (leaf, preview only) | the dashed slot outline and caption (§3.6); `hidden={!showSlot}` from the context |
| `components/icons/instagram.tsx`, `pinterest.tsx` | Server | the accepted glyph SVGs (§2.5.1), `fill="#FFFFFF"`, `currentColor` only under forced colors, `aria-hidden`, `focusable="false"` |
| `lib/site/social.ts` (or similar) | module | the two URLs, `null` for now |
| `app/dev/footer/page.tsx` | Server | the full state (§3.6): the fragment `<FooterPreviewProvider><main>…</main><SiteFooter preview /></FooterPreviewProvider>`; `requireDevPages()` in the page and its `generateMetadata`; no `searchParams` |
| `app/dev/footer/minimal/page.tsx` | Server | the shipped state (§3.6): `<main>` then `<SiteFooter>`, no provider; its own intro (§9.1); `requireDevPages()`; no `searchParams` |
| `app/dev/footer/FooterPreviewProvider.tsx` | Client | holds the preview state (None, unticked) and renders only `FooterPreviewContext.Provider`, no DOM element |
| `app/dev/footer/FooterPreviewControls.tsx` | Client | the Current page select and the slot checkbox, inside `main`; they consume and write the context |
| `app/dev/dev.css` | CSS | list `@source "./footer/page.tsx";`, `@source "./footer/minimal/page.tsx";` and `@source "./footer/FooterPreviewControls.tsx";` one by one: a directory source would be overridden by globals.css's `@source not` (see the file's own comment). `FooterSlotOutline` lives under `components/`, which globals.css already scans |
| `tests/e2e/screenshots.spec.ts` | test | add `/dev/footer` and `/dev/footer/minimal` to `ROUTES` |
| `app/globals.css` | CSS | print: make sure `[data-print="hide"]` covers the footer navs, the social row and the slot (the rule itself comes from M1.13/M1.15); the forced-colors rule for the social glyphs (§7.3) |

- **Server Component by default.** The only client code is the `FooterLink`/`NavLink` leaf (for `usePathname`) and, on the dev page, the preview provider, the controls and the slot outline. In M1.17 public pages render no `FooterLink` at all.
- **M1.17 makes no data call.** `getCollections()` is wired in M3.7, behind the `collection-pages` flag (§3.4).
- **Social row label (follow-up, TASKS M8.8a):** wrap the label and the list in the `FooterSocial` div (§2.1, `data-print="hide"`), add the `<p id="footer-social-label">Follow us</p>`, and swap the list's `aria-label` for `aria-labelledby="footer-social-label"`. Public pages are unaffected until a social URL is set; `/dev/footer` shows it.
- **Tokens used:** `--page-inline-*`, `--grid-gap`, `--size-touch`, `--wordmark-h-footer`, `--z-content`; colours `bg-sunken`, `text-primary`, `text-secondary`, `text-muted`, `text-wordmark`, `link` (gold-300), `text-accent` (gold-400, crescent), `focus-ring`, `border-divider` (dev outline only); `gradient-starlight-rule`; `radius-pill`; type `type-h4`, `type-nav`, `type-body-sm`; motion `--duration-fast`, `--ease-standard`, `--motion-scale-press`; spacing steps 2, 4, 6, 8, 10, 12, 16, 20, 24. **No new tokens** (the social glyphs' `#FFFFFF` is a brand-mandated literal, §2.5.1).

### 11.2 No layout shift

- Server-rendered at final size; composition chosen on the server; no client-only content; `aria-current` is rendered on the server too.
- The wordmark uses the shared sprite with its own `viewBox` (typography.md §3.2), so its width is known before paint.
- The newsletter slot (M2.7) sets its `min-block-size` on the server (§2.4).

### 11.3 e2e checks to add (tests/e2e, with the M1.20 fixture and helpers)

Public `/` (M1.17 state), at 390 and 1440:
1. Exactly one `contentinfo`. It contains an `img` named "Starflames", the text "Candles for long, starlit evenings." and "© {build year} Starflames". The **build year** is the year of the build under test, not the test's clock: read it from the build output (for example `statSync(".next/BUILD_ID").mtime.getFullYear()`), so a run that crosses New Year's midnight doesn't fail. It contains **no** `link`, **no** `navigation`, **no** heading, no `list` and no text "Follow us". The fixture reports no 404s.
2. The footer's computed `background-color` is bg-sunken (`#070914`), `position` is `relative` and `z-index` is `1`.
3. The footer's computed `padding-bottom` is at least 32px (base) / 40px (lg+).
4. Registry-driven no-JS check (grows as routes go live), in a `javaScriptEnabled: false` context at 390. The expected links come from the registry module's helpers, never a hard-coded list, so a new drawer item is covered automatically:
   - for every live entry returned by `headerPrimary()` and `headerMore()` (the drawer-only placements), the footer contains a visible link with that entry's exact `label` and `href`;
   - **the account slot:** the expected link is the account-slot entry that `footerGroup("help")` returns (`account` if live, else `sign-in` if live, else none). If there is one, the footer contains a visible link with its exact `label` and `href`; in every case the footer **never contains both** a `/sign-in` and an `/account` link.
   In M1.17 every set is empty, and the test asserts the footer still renders with JS off.
5. 320px: no horizontal scroll (`scrollWidth <= clientWidth`).

`/dev/footer` (full), at 390 and 1440 unless noted:
6. `navigation "Footer"` contains three `h2`s in order: Explore, Our collections, Help; there is no `h1` in the footer. Explore links are Shop, Collections, Gift sets, Our story, Search in that order; Our collections lists five links and **not** "Gift Sets"; Help is FAQ, Contact us, Shipping & returns, Your account (`href="/account"`).
7. `navigation "Legal"` contains Privacy policy and Terms & conditions; `list "Follow us"` (named through `aria-labelledby` by the visible "Follow us" text, which is not a heading) contains "Starflames on Instagram" and "Starflames on Pinterest", in that order, with no `target` attribute. The "Follow us" label is visible, above the list, and its left edge is within 1px of the Instagram link's left edge. Each glyph's computed `fill` is `rgb(255, 255, 255)` at rest, on hover and on focus. *(The label parts: TASKS M8.8a.)*
8. Every link in the footer has a bounding box at least 44 × 44.
9. `tabOrder()` over the footer matches §8.3 (full row). `hasVisibleFocus()` is true for each footer link.
10. Choose "Moonlit Terrace" in the Current page control: "Moonlit Terrace" has `aria-current="page"` and computed `text-decoration-line: underline` with `text-underline-offset` equal to 0.4em of its font size; "Collections" has no `aria-current`. Choose "FAQ": FAQ is current. Tick "Show the reserved newsletter space": the slot outline loses `hidden` and is visible; untick: hidden again. The `<footer>` and `<main>` are direct children of `<body>` throughout (the provider adds no element).
11. Layout: at 1440 the group headings share the same `top`; at 390 Explore and Our collections share a `top` and Help is below them.
12. Text-spacing override at 390 and 1440: no footer descendant overflows its column (`scrollWidth <= clientWidth` on each group).
13. Print emulation: the Footer and Legal navs, the social row (the "Follow us" label and the list) and the slot are hidden; the wordmark and the © line are visible.
14. `forcedColors: "active"`: the crescent and the rule are not displayed; social links have a visible border.

`/dev/footer/minimal`:
15. The DOM and the computed layout match the public `/` footer (same checks as 1–3), and the wordmark, brand line and © line are horizontally centred (their centre within 1px of the container's centre).

Screenshots: `dev-footer-<project>.png` (`/dev/footer`) and `dev-footer-minimal-<project>.png` (`/dev/footer/minimal`) for `mobile-390` and `desktop-1440`, plus the existing `home-<project>.png`.

### 11.4 Notes

- `/dev/footer` and `/dev/footer/minimal` must never ship in a plain production build (same gate as `/dev/tokens`). Both are static; keep them free of `searchParams`, cookies and headers (§3.6).
- The placeholder social URL (`https://example.com/`) exists only inside the dev page's preview data, never in `lib/site/social.ts`.
- When the user provides the social URLs, setting them in the constant is the whole change (once the "Follow us" follow-up is in); the M1.20 fixture doesn't fail on external origins, but tests must not navigate to them.
- When `collection-pages` goes live in M3.7, add an e2e check that every "Our collections" link returns 200 (the fixture covers prefetches).
- M5.7 must redirect signed-out visitors from `/account` to `/sign-in` (§3.2.1); its e2e adds that check.

---

## 12. IP guardrail

Every string here is plain shop language: "Explore", "Our collections", "Help", "Shop", "Collections", "Gift sets", "Our story", "Search", "FAQ", "Contact us", "Shipping & returns", "Your account", "Sign in", "Privacy policy", "Terms & conditions", "Follow us", "Starflames on Instagram / Pinterest", "Footer", "Legal", the © line and the dev preview labels ("Footer preview", "Footer state", "Full", "Minimal (as shipped in M1.17)", "Current page", "None", "Show the reserved newsletter space", the slot caption, and the two intros, including "This is the footer exactly as it ships today: no links are live yet, so it shows only the sign-off."). The brand line "Candles for long, starlit evenings." is the header's original line and describes atmosphere in generic words. The collection names come from the IP-checked catalog (catalog.md §7). Route slugs (`shipping-and-returns`, `privacy`, `terms`, `search`, `account`, `sign-in`, plus the header's), registry keys, feature-flag names (`collection-pages`, `newsletter`), helper names (`footerGroup`, `headerPrimary`, `headerMore`, `headerAccount`, `headerBag`), component and class names (`FooterPreviewProvider`, `FooterPreviewControls`, `FooterSlotOutline`, `FooterSocial`) and the id `footer-social-label` are generic English. Instagram and Pinterest are named only as the platforms they are, with their own unaltered marks in a colour their guidelines allow. No character, place, court or book names, no author name, no quotes or paraphrases, no invented terms and no "Court of …", "Night Court" or "High Lord/Lady" style combinations. I also left out any "not affiliated with …" line: it would have to point at the very thing the brand must not name (open question 4). Re-read for this after the post-pass minors from M1.15/M1.17 reviews ("Follow us", the minimal-page intro) and again after the doc minors from the M1.17 review (no copy changed), and confirmed.

---

## 13. Open questions

1. **Legal trading name** for the © line, and whether "© {year} Starflames" is enough or the full company name is needed. [confirm with user: legal trading name]
2. **Legal pages: resolved.** `TASKS.md` now has M2.5a/M2.5b (Privacy policy, `/privacy`, before the M2.7 newsletter consent line) and M6.0a/M6.0b (Terms & conditions `/terms`, Shipping & returns `/shipping-and-returns`). The legal **text** comes from the user (or their adviser), not from design-agent. [confirm with user: legal texts]
3. **Social profile URLs** for Instagram and Pinterest. Until they exist, the social links are hidden. [confirm with user: Instagram and Pinterest profile URLs]
4. **No affiliation disclaimer.** I deliberately didn't add a "not affiliated with …" line: to be meaningful it would have to name the series, which the guardrail forbids, and an unnamed one invites the question. If the user's adviser wants one, it goes in the Terms page (M6.0a), not the footer. [confirm with user]
5. **Newsletter in the footer and on the home page.** This spec allows one signup form per page (§2.4): a page with the full newsletter band omits the footer teaser. M2.1/M2.6 to confirm.
6. **Instagram glyph rules; glyph sources: accepted.** Meta's glyph subpages could not be fetched on 2026-10-09 (404s and redirects); the white-glyph choice follows Instagram's published black/white/gradient rule and Pinterest's fetched guidelines. Accepted sources (§2.5.1): Instagram = the official white glyph SVG from Meta's asset pack, unaltered; Pinterest = Pinterest's own CDN SVG (`s.pinimg.com/webapp/pinterest_favicon-…svg`), unaltered, white, because the official portal offers only EPS/PNG behind a login. Still open before launch: re-check the Instagram glyph page, and compare the Pinterest SVG with the official `P-Badge-White.eps`. [confirm before launch]
7. **Header follow-up: resolved.** header.md (post-pass check fix round 1) adopts §3.2.1 as its single registry source through `components/layout/site-routes.ts`, and `/dev/header` now uses client preview controls under a `HeaderPreviewProvider`, the same pattern as §3.6, so it stays static.
8. **layout-shell §11 label.** The footer no longer uses the reserved "Starflames on social media" (replaced by the visible "Follow us", §2.5). layout-shell.md §11 should be aligned at its next edit (design-agent; outside this task's files).
