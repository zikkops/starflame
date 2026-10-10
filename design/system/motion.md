# Motion tokens and policy (M1.9)

Status: spec, **QA PASSED** (fix round 1), with post-pass minors 1–5 applied (changelog at the top of [`tokens.md`](./tokens.md); this file changes for minors 1 and 3). Part of the M1.9 design tokens; see [`tokens.md`](./tokens.md). Implemented in M1.11; the starfield specifics come in M1.18.

## 1. Principles

- **Calm.** Motion feels like candlelight and drifting stars: slow, soft and settling. No bounce, elastic, back or overshoot easings anywhere.
- **Products first.** Motion leads the eye to a product or a CTA. It never competes with them.
- **Only `transform` and `opacity` animate.** No animating `width`, `height`, `top`/`left`, `margin`, `box-shadow`, `filter`, `background-position` or colours on scroll. Hover colour changes on buttons and links are state transitions of `background-color`/`color` at `duration-fast`. They are not motion, and they never move layout. Glows use the opacity-pseudo-element pattern (§5).
- **No layout shift.** Anything that appears reserves its space first. Reveal animations start from their final layout position, offset only by `transform`.
- **Content is visible by default, and never flashes.** Server-rendered content is visible in the HTML. Hidden "pre-reveal" states are applied only by JS, and only when motion is allowed (the `no-preference` branch of `gsap.matchMedia()`, §6.3). Content that is already on screen when the page loads is never hidden after it has painted: the hero uses the head-script pattern in §5.1, and in-view sections simply skip their reveal. If JS fails, or the visitor prefers reduced motion, nothing is ever invisible.

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

Either way, every item keeps its own reveal; large groups just arrive closer together. (`n - 1`, not `n`: n items have n − 1 gaps.)

Drawers and sheets translate by 100% of their own size (`translateX(100%)` or `translateY(100%)`), not by a distance token.

## 5. Standard patterns

| Pattern | Trigger | Animates | Duration / easing |
|---|---|---|---|
| CTA hover glow | hover, focus-visible | `::after` carrying `shadow-glow-candle` goes from opacity 0 to 1. The fill changes colour to ember-300. **The no-glow CTA variant** (over haze, or with another control inside the 26px footprint; tokens.md §2.5 rule 9) has no `::after`: only the fill change. | fast / standard |
| CTA press | `:active` | `transform: scale(var(--motion-scale-press))` | fast / standard |
| Product image hover | pointer hover on the card | image `scale(1) → scale(1.03)` inside the arch; glints (`shadow-glow-starlight` pseudo) fade in | slower / standard |
| Hero entrance | page load (§5.1) | eyebrow, heading, copy, CTA: `opacity 0 → 1`, `y: 24 → 0` | slower / enter, stagger-loose |
| Section reveal | ScrollTrigger, `start: "top 85%"`, `once: true` | `opacity 0 → 1`, `y: 16 → 0`. Sections already past the start line when the page hydrates skip the reveal and stay visible (no pre-hidden state is set on them). | slower / enter, stagger-base |
| Drawer / sheet | open/close | panel `translateX(100%) → 0` (sheet: Y), scrim opacity 0 → 1 | enter slow / enter, exit base / exit |
| Modal | open/close | dialog `opacity 0 → 1`, `scale 0.98 → 1`; scrim opacity | base / enter, exit fast / exit |
| Toast | appears/dismisses | `opacity`, `y: 8 → 0` | base / enter, exit fast / exit |
| Candle glow breathing | always (ambient) | glow layer opacity 0.85 ↔ 1, yoyo | glow / ambient |
| Twinkle / falling star / drift | always (ambient) | opacity, transform on the starfield layer only | twinkle, falling-star, drift / ambient or linear |

Ambient loops pause when the tab is hidden (`document.visibilitychange`) and when their layer is offscreen. M1.18 defines the performance budget.

### 5.1 Hero entrance without a flash

The problem: the hero is server-rendered and paints visible. If GSAP hid it on hydration and then replayed it (`gsap.from` after hydration), visitors would see the content, see it vanish, then see it come back. That is worse than no animation. A plain CSS pre-hidden class is no good either: if the JS bundle fails, the hero stays invisible.

The approach (chosen): **a pre-hidden class set only by a tiny head script, with a timeout fallback.**

1. **Head script, before first paint.** A small synchronous inline script in the root layout's `<head>` runs before the body paints. Only if `matchMedia('(prefers-reduced-motion: no-preference)').matches`, it adds the class `hero-pending` to `<html>`, and starts a fallback timer: after **2500ms**, if the class is still there, it removes it. It doesn't depend on the app bundle.
2. **CSS.** `.hero-pending [data-hero-reveal] { opacity: 0; }`. Nothing else is hidden. Without JS, the script never runs and the hero is visible. With reduced motion, the class is never added.
3. **Hydration (GSAP, inside the `no-preference` branch of `gsap.matchMedia()`).**
   - If `hero-pending` is **gone** (the 2500ms fallback already fired on a slow device), skip the entrance. The hero is already visible and must not be hidden again.
   - Otherwise: `gsap.set(targets, { opacity: 0, y: 24 })`, then remove `hero-pending` from `<html>` (GSAP's inline styles now hold the hidden state, and the fallback timer finds nothing to do), then `gsap.to(targets, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.1 })`. Distance comes from `--motion-distance-lg`, duration from `--duration-slower`.
4. **What is never pre-hidden:** the hero product image and the candle glow behind it. They are visible from the first paint. Only `[data-hero-reveal]` elements (eyebrow, heading, supporting copy, CTA) are pre-hidden. Their space is reserved by normal layout, since opacity and transform don't affect layout.
   - **LCP requirement for the M2 hero spec (post-pass minor 3).** An element at opacity 0 doesn't count for Largest Contentful Paint until it becomes visible. So if the hero heading were the largest element, pre-hiding it would push LCP back to the end of the entrance. The M2 hero spec must meet one of these at every breakpoint, and **at 390px in particular**:
     - (a) **The hero product image is the largest element in the first viewport.** Its rendered area must clearly exceed the heading's text block (state both areas in the spec at 390px). The heading may then carry `data-hero-reveal`. Or:
     - (b) **The heading is not pre-hidden** (no `data-hero-reveal` on it). Only the eyebrow, supporting copy and CTA animate in.
   - The build review verifies the actual LCP element at 390px and at 1440px (Lighthouse or the Performance panel, mobile throttling). If the heading turns out to be the LCP element while it carries `data-hero-reveal`, the build fails and the hero switches to (b).
5. **Reduced motion:** no class, no timer, no entrance. The hero is simply there (§6.2).

Tech notes for M1.11 / the hero build: the head script must be inline and synchronous (not `next/script` with `afterInteractive`). Because it changes `<html>`'s class before React hydrates, `<html>` needs `suppressHydrationWarning`. If a Content Security Policy is added later, the inline script needs a nonce or hash. Name the class and attribute as above so the hero spec (M2) can refer to them.

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
| Hero entrance | Instant: the head script never adds `hero-pending`, so nothing is pre-hidden (§5.1) |
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
