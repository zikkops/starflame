# Motion tokens and policy (M1.9)

Status: spec, **QA PASSED** (fix round 1), with post-pass minors 1–5 applied (changelog at the top of [`tokens.md`](./tokens.md); this file changes for minors 1 and 3). Part of the M1.9 design tokens; see [`tokens.md`](./tokens.md). Implemented in M1.11; the starfield specifics come in M1.18. **Hero follow-ups from M2.2 applied** (changelog below), awaiting QA review.

## Changelog

**Post-pass minors from the hero follow-up review** (2026-10-10)

1. Changelog item 3 of the hero follow-ups now lists §4, which gained one sentence (the CSS hero entrance applies the stagger cap with `animation-delay`). Wording only; no rule changes.

**Hero follow-ups from M2.2** (2026-10-10)

1. **The hero entrance is CSS-only and starts at first paint** (§5.1, rewritten). tech-agent measured the M1.11 head-script + GSAP flow on a slow-4G / 4× CPU profile (M2.2 tech spec §1.11): the hero image painted at about 1.7 s, but the pre-hidden eyebrow, subcopy and CTA group waited for hydration (about 2.7–2.9 s) and finished entering at about 3.7 s. For a phone-first audience that is too long to wait for the message and the button. The entrance now runs as a CSS keyframe animation that starts when the hero first renders, needs no JS, and ends visible on its own. The same distance, duration, easing and stagger are kept, so it looks the same on fast connections.
2. **Retired:** the `hero-pending` head script, its 2500ms fallback timer and the `.hero-pending [data-hero-reveal] { opacity: 0 }` rule (§5.1, "Retired"). The hero no longer needs GSAP.
3. §1 ("Content is visible by default") names the hero entrance as the one CSS-driven pre-reveal state, and says why it is safe. §4 gains one sentence after the GSAP stagger note: the CSS hero entrance (§5.1) applies the same cap with `animation-delay`. §5 (the Hero entrance row) and §6.2 (the Hero entrance row) follow §5.1. Every other token, pattern and rule is unchanged.

## 1. Principles

- **Calm.** Motion feels like candlelight and drifting stars: slow, soft and settling. No bounce, elastic, back or overshoot easings anywhere.
- **Products first.** Motion leads the eye to a product or a CTA. It never competes with them.
- **Only `transform` and `opacity` animate.** No animating `width`, `height`, `top`/`left`, `margin`, `box-shadow`, `filter`, `background-position` or colours on scroll. Hover colour changes on buttons and links are state transitions of `background-color`/`color` at `duration-fast`. They are not motion, and they never move layout. Glows use the opacity-pseudo-element pattern (§5).
- **No layout shift.** Anything that appears reserves its space first. Reveal animations start from their final layout position, offset only by `transform`.
- **Content is visible by default, and never flashes.** Server-rendered content is visible in the HTML. Hidden "pre-reveal" states are applied only by JS, and only when motion is allowed (the `no-preference` branch of `gsap.matchMedia()`, §6.3). Content that is already on screen when the page loads is never hidden after it has painted: in-view sections simply skip their reveal. If JS fails, or the visitor prefers reduced motion, nothing is ever invisible.
  - **The one exception is the hero entrance (§5.1):** a CSS keyframe animation, declared only under `prefers-reduced-motion: no-preference`, that starts at the hero's first paint and ends visible by itself. It is not a static hidden class: it needs no JS to finish, so a failed bundle can't leave anything invisible, and because it starts at first paint, the content is never shown and then hidden.

## 2. Durations

| Token | Value | Use |
|---|---|---|
| duration-instant | 0ms | reduced-motion replacements, focus ring |
| duration-fast | 150ms | hover/press colour and opacity, link underline, small fades |
| duration-base | 250ms | buttons, chips, tooltips, dropdown open, toast fade |
| duration-slow | 400ms | drawer / sheet / modal enter |
| duration-slower | 700ms | section reveals, hero entrance |
| duration-glow | 5000ms | one breath of the candle-glow "breathing" loop (a slow opacity pulse 0.85 to 1) |
| duration-twinkle | 4000ms | base twinkle period; each star randomises to 3000–6000ms |
| duration-falling-star | 1400ms | one falling-star streak; at most one every 8–14s (M1.18 sets the exact rules) |
| duration-drift | 90000ms | the full slow drift cycle of the starfield parallax layer |

Exits run one step faster than enters (a drawer enters at `slow` 400ms and leaves at `base` 250ms) so dismissal feels responsive.

## 3. Easings

GSAP names are canonical in JS. The CSS equivalents are the standard cubic-bezier approximations of the same curves.

| Token | GSAP | CSS `cubic-bezier` | Use |
|---|---|---|---|
| ease-standard | `power2.out` | `cubic-bezier(0.215, 0.61, 0.355, 1)` | default for UI transitions, hovers, dropdowns |
| ease-enter | `power3.out` | `cubic-bezier(0.165, 0.84, 0.44, 1)` | elements arriving: reveals, drawer/modal enter, hero |
| ease-exit | `power2.in` | `cubic-bezier(0.55, 0.055, 0.675, 0.19)` | elements leaving: drawer/modal exit, toast dismiss |
| ease-in-out | `power2.inOut` | `cubic-bezier(0.645, 0.045, 0.355, 1)` | position-to-position moves (carousel slide, tab indicator) |
| ease-ambient | `sine.inOut` | `cubic-bezier(0.445, 0.05, 0.55, 0.95)` | loops: twinkle, glow breathing, drift yo-yo |
| ease-linear | `none` | `linear` | scroll-scrubbed parallax, the falling-star streak's travel |

## 4. Stagger, distance, scale

| Token | Value | Use |
|---|---|---|
| stagger-tight | 40ms | small groups: nav items, chips, badges |
| stagger-base | 60ms | card grids and list reveals |
| stagger-loose | 100ms | hero elements (eyebrow, heading, copy, CTA) |
| stagger-max-total | 400ms | cap on the total stagger spread of one group (from the first item's start to the last item's start). See the GSAP note below. |
| motion-distance-sm | 8px | hover lift, toast slide-in |
| motion-distance-md | 16px | section/card reveal (translateY from +16px to 0) |
| motion-distance-lg | 24px | hero entrance only |
| motion-scale-hover | 1.03 | product image zoom inside its arch frame on hover (the frame clips it, so there is no layout change) |
| motion-scale-press | 0.98 | button press (`:active`) |

**GSAP stagger with the cap.** In GSAP, when a stagger object has both `each` and `amount`, `amount` wins, so don't pass both. For a group of n items with step `s` (e.g. 0.06 for stagger-base) and cap 0.4s, use either:

- `stagger: { amount: Math.min(0.4, (n - 1) * s) }`: `amount` is the total spread across all n items, so this gives exactly `s` between items until the spread would pass 0.4s, after which the step shrinks evenly. Or:
- `stagger: (n - 1) * s <= 0.4 ? s : { amount: 0.4 }`: the same result, written as a conditional.

Either way, every item keeps its own reveal; large groups just arrive closer together. (`n - 1`, not `n`: n items have n − 1 gaps.) The CSS hero entrance (§5.1) applies the same cap with `animation-delay`.

Drawers and sheets translate by 100% of their own size (`translateX(100%)` or `translateY(100%)`), not by a distance token.

## 5. Standard patterns

| Pattern | Trigger | Animates | Duration / easing |
|---|---|---|---|
| CTA hover glow | hover, focus-visible | `::after` carrying `shadow-glow-candle` goes from opacity 0 to 1. The fill changes colour to ember-300. **The no-glow CTA variant** (over haze, or with another control inside the 26px footprint; tokens.md §2.5 rule 9) has no `::after`: only the fill change. | fast / standard |
| CTA press | `:active` | `transform: scale(var(--motion-scale-press))` | fast / standard |
| Product image hover | pointer hover on the card | image `scale(1) → scale(1.03)` inside the arch; glints (`shadow-glow-starlight` pseudo) fade in | slower / standard |
| Hero entrance | the hero's first paint, CSS only (§5.1) | the `[data-hero-reveal]` elements (never the LCP element, never the image or the glow): `opacity 0 → 1`, `translateY(24px) → none` | slower / enter, stagger-loose (as `animation-delay`) |
| Section reveal | ScrollTrigger, `start: "top 85%"`, `once: true` | `opacity 0 → 1`, `y: 16 → 0`. Sections already past the start line when the reveal code sets up skip the reveal and stay visible (no pre-hidden state is set on them). | slower / enter, stagger-base |
| Drawer / sheet | open/close | panel `translateX(100%) → 0` (sheet: Y), scrim opacity 0 → 1 | enter slow / enter, exit base / exit |
| Modal | open/close | dialog `opacity 0 → 1`, `scale 0.98 → 1`; scrim opacity | base / enter, exit fast / exit |
| Toast | appears/dismisses | `opacity`, `y: 8 → 0` | base / enter, exit fast / exit |
| Candle glow breathing | always (ambient) | glow layer opacity 0.85 ↔ 1, yoyo | glow / ambient |
| Twinkle / falling star / drift | always (ambient) | opacity, transform on the starfield layer only | twinkle, falling-star, drift / ambient or linear |

Ambient loops pause when the tab is hidden (`document.visibilitychange`) and when their layer is offscreen. M1.18 defines the performance budget.

### 5.1 Hero entrance: CSS only, from first paint (revised after M2.2)

**The problems it solves.**

- **No flash.** The hero is server-rendered. If JS hid it on hydration and then replayed it (`gsap.from` after hydration), visitors would see the content, see it vanish, then see it come back. That is worse than no animation.
- **Never stuck hidden.** A static CSS class such as `.pre-hidden { opacity: 0 }` that JS later removes is no good: if the bundle fails, the hero stays invisible.
- **No wait for hydration (new in M2.2).** The M1.11 approach (a head script adds `hero-pending`, GSAP reveals on hydration, a 2500ms fallback timer) solved the first two, but it tied the message and the CTAs to the JS bundle. On slow 4G with a 4× CPU slowdown, tech-agent measured the image painting at about 1.7 s while the pre-hidden text waited until about 2.8 s and finished at about 3.7 s. Most visitors arrive on phones from Instagram and Pinterest, so that wait is not acceptable.

**The approach (chosen): a CSS keyframe animation that starts at the hero's first paint.** A CSS animation starts as soon as the element is first rendered, which is the first paint when the stylesheet and the hero HTML arrive together. It runs once and ends with the element in its normal, visible style. No JS is involved at any point.

1. **CSS (in the global stylesheet, so it is render-blocking and arrives with the first paint).**

   ```css
   @keyframes hero-reveal {
     from { opacity: 0; transform: translateY(var(--motion-distance-lg)); }
   }
   @media (prefers-reduced-motion: no-preference) {
     html:not([data-motion="off"]) [data-hero-reveal] {
       animation: hero-reveal var(--duration-slower) var(--ease-enter) backwards;
       animation-delay: calc(var(--reveal-order, 0) * var(--stagger-loose));
     }
   }
   ```

   - Only a `from` keyframe: the animation runs towards the element's own style (opacity 1, no transform).
   - `animation-fill-mode: backwards` holds the `from` state during the delay, so a later target doesn't show early and then jump. After the animation ends, nothing lingers: the element is in its normal style, with no inline styles and no `will-change`.
   - `--reveal-order` is 0, 1, 2… in DOM order, set on each target by the server (an inline custom property or a class; tech-agent's call). The spread `(n − 1) × stagger-loose` must stay within `stagger-max-total` (400ms); a hero has at most 3 targets (spread 200ms), so this always holds.
   - The values are the existing tokens: `--motion-distance-lg` (24px), `--duration-slower` (700ms), `--ease-enter` (`cubic-bezier(0.165, 0.84, 0.44, 1)`, the CSS twin of `power3.out`), `--stagger-loose` (100ms). The entrance therefore looks the same as the GSAP version on a fast connection.
2. **Hydration does nothing to the hero.** No client island touches `[data-hero-reveal]`. Hydration reuses the server DOM, so the animation isn't restarted. **A hydration mismatch inside the hero would re-create its DOM and replay the entrance after the content was already visible** (a flash), so the hero must stay a Server Component with deterministic markup.
3. **What is never animated:** the hero product image and the candle glow behind it. They are visible from the first paint. Only `[data-hero-reveal]` elements (eyebrow, supporting copy, CTA group, and the heading only if (a) below holds) animate. Their space is reserved by normal layout, since opacity and transform don't affect layout.
   - **LCP requirement for the M2 hero spec (post-pass minor 3).** An element at opacity 0 doesn't count for Largest Contentful Paint until it becomes visible. So if the hero heading were the largest element, animating it would push LCP back to the end of the entrance. The M2 hero spec must meet one of these at every breakpoint, and **at 390px in particular**:
     - (a) **The hero product image is the largest element in the first viewport.** Its rendered area must clearly exceed the heading's text block (state both areas in the spec at 390px). The heading may then carry `data-hero-reveal`. Or:
     - (b) **The heading is not animated** (no `data-hero-reveal` on it). Only the eyebrow, supporting copy and CTA animate in.
   - The build review verifies the actual LCP element at 390px and at 1440px (Lighthouse or the Performance panel, mobile throttling). If the heading turns out to be the LCP element while it carries `data-hero-reveal`, the build fails and the hero switches to (b).
4. **Links work at once.** Hero CTAs are plain links, so they work before hydration. Opacity doesn't block hit-testing, so they can be tapped even while they fade in.
5. **Reduced motion:** the animation is declared only inside `prefers-reduced-motion: no-preference`, so under `reduce` there is no entrance. The hero is simply there (§6.2). The global safety net (§6.3) would cut a stray animation to 0.01ms anyway.
6. **`html[data-motion="off"]`** (the in-page motion control, M8.8b): excluded by the selector. To suppress the entrance on a page load, the attribute must be set before first paint (M8.8b's own inline head script, from the stored preference). If it is switched on after the hero has painted, the entrance has already finished, and nothing further happens.
7. **Re-entry.** The animation plays whenever the hero element is newly inserted: on the first load and on a client-side navigation back to the page. Each time it starts from the hero's first paint in that view, so it is never a flash. A back/forward-cache restore doesn't replay it.
8. **Retired (M2.2).** The M1.11 `hero-pending` head script, its 2500ms fallback timer and the `.hero-pending [data-hero-reveal] { opacity: 0 }` rule are no longer used. tech-agent removes them and their tests in M2.2, unless something else depends on them (none is known). `suppressHydrationWarning` on `<html>` was there for that script. Keep it only if another head script (for example M8.8b's `data-motion` script) changes `<html>` before hydration.

Tech notes for the hero build: put the keyframes and the rule in the global stylesheet, not in a lazily loaded chunk, so they apply at first paint. Don't add `will-change`. Measure FCP, the last target's `animationend` and LCP on the slow-4G profile, and record them in the build review.

## 6. Reduced-motion policy (global)

Applies whenever `@media (prefers-reduced-motion: reduce)` matches. It is implemented once, globally, and every spec inherits it. A spec may state a stricter fallback, never a looser one.

### 6.1 Removed entirely

- Starfield drift and parallax, falling stars, twinkling (the starfield renders **one still frame**: the same stars, static, at their mid opacity)
- Candle-glow breathing (the glow stays on, static, at full designed opacity)
- ScrollTrigger scrub, pin and parallax effects
- Every translate and scale entrance: section reveals, hero entrance, toast slide, drawer slide, modal scale
- Product-image hover zoom, hover lift, press scale
- Smooth scrolling (`scroll-behavior: auto`)
- Any auto-advancing carousel (it must also never auto-advance without a pause control, regardless of preference)

### 6.2 Becomes an instant or opacity-only change

| Element | Reduced-motion behaviour |
|---|---|
| Section and card reveals | **Instant**: content is simply present. No fade, no pre-hidden state. |
| Hero entrance | Instant: the `hero-reveal` animation is declared only under `no-preference`, so nothing animates and nothing is hidden (§5.1) |
| Drawer / sheet / mobile menu | Panel appears in place; panel and scrim **opacity-only** fade over `duration-fast` (150ms), `ease-standard` |
| Modal | Opacity-only, 150ms |
| Toast | Opacity-only, 150ms |
| CTA hover glow | Kept as an opacity change of the glow pseudo-element, 150ms. It is a state change, not movement. (The no-glow variant has none.) |
| Button and link colour changes | Unchanged (150ms colour transitions) |
| Focus ring | Instant (it always is) |

### 6.3 Token remap (the recommended mechanism)

Inside the reduce media query, remap the motion tokens so components need no special cases. These are plain `:root` variables (§7), so the remap is an ordinary `:root` override inside `@media (prefers-reduced-motion: reduce)`.

| Token | Normal | Reduced |
|---|---|---|
| `--motion-distance-sm` / `-md` / `-lg` | 8 / 16 / 24px | `0px` |
| `--motion-scale-hover` / `--motion-scale-press` | 1.03 / 0.98 | `1` |
| `--duration-base`, `--duration-slow`, `--duration-slower` | 250 / 400 / 700ms | `150ms` (opacity-only effects stay soft; with distance 0 nothing moves) |
| ambient durations | as §2 | n/a: the loops are not started at all |

In JS, wrap every GSAP setup in `gsap.matchMedia()` with two branches: `"(prefers-reduced-motion: no-preference)"` (full motion, pre-reveal states set here only) and `"(prefers-reduced-motion: reduce)"` (the opacity-only versions above, or nothing). Starfield code checks the same query, and also listens for changes so that toggling the OS setting mid-session takes effect without a reload.

Safety net: a global CSS rule under the reduce query sets `animation-duration: 0.01ms; animation-iteration-count: 1;` on all elements, so a stray keyframe animation can't loop. Transitions are covered by the token remap rather than zeroed, so the 150ms opacity fades in §6.2 survive.

## 7. Tailwind v4 mapping (names and values)

| CSS variable | Where | Value |
|---|---|---|
| `--ease-standard` | `@theme` | `cubic-bezier(0.215, 0.61, 0.355, 1)` |
| `--ease-enter` | `@theme` | `cubic-bezier(0.165, 0.84, 0.44, 1)` |
| `--ease-exit` | `@theme` | `cubic-bezier(0.55, 0.055, 0.675, 0.19)` |
| `--ease-in-out` | `@theme` | `cubic-bezier(0.645, 0.045, 0.355, 1)` |
| `--ease-ambient` | `@theme` | `cubic-bezier(0.445, 0.05, 0.55, 0.95)` |
| `--ease-linear` | `@theme` | `linear` |
| `--duration-instant` / `-fast` / `-base` / `-slow` / `-slower` | `:root` | `0ms` / `150ms` / `250ms` / `400ms` / `700ms` |
| `--duration-glow` / `-twinkle` / `-falling-star` / `-drift` | `:root` | `5000ms` / `4000ms` / `1400ms` / `90000ms` |
| `--stagger-tight` / `-base` / `-loose` / `-max-total` | `:root` | `40ms` / `60ms` / `100ms` / `400ms` |
| `--motion-distance-sm` / `-md` / `-lg` | `:root` | `8px` / `16px` / `24px` |
| `--motion-scale-hover` / `--motion-scale-press` | `:root` | `1.03` / `0.98` |

- `--ease-*` is a native Tailwind v4 theme namespace (`ease-standard` utility), so it goes in `@theme`, after `--ease-*: initial;` clears Tailwind's default curves (tokens.md §11.0).
- Durations, staggers, distances and scales are **plain custom properties in `:root`** (or `@theme static`). A normal `@theme` block drops variables that no utility uses, so JS `getComputedStyle` would read them as empty. Use them as `duration-(--duration-base)`, or read them in JS via `getComputedStyle(document.documentElement)`.
- Optional, tech-agent's call: the `--transition-duration-*` theme key can give native `duration-base`-style utilities if tech-agent confirms it in the installed Tailwind version. If used, put it in `@theme static`, keep the `--duration-*` names in `:root` as the source, and remap both under reduced motion.
- A small shared TS constants module mirroring these values (seconds for GSAP) is recommended so JS and CSS can't drift; tech-agent decides.
