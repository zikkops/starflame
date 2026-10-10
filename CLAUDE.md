# Starflames — themed candle e-shop

Starflames is a candle brand whose mood comes from starlit night skies, moonlit mountain cities, lakeside balconies and enchanted forests. The store sells themed candles of every kind: scented jars, pillars, tins, wax melts, gift sets, and seasonal or limited drops.

The main session is the **orchestrator**. It does not write specs or app code itself. It runs the loop below and delegates work to three subagents in `.claude/agents/`:

| Agent | Owns | Never does |
|---|---|---|
| `design-agent` | `/design`: design system, page specs, component specs, all copy | App code |
| `tech-agent` | App code, `/lib/firebase`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `/functions`, seed script, tests | Changing approved design decisions without logging pushback |
| `qa-agent` | Reviews of specs and builds; PASS/FAIL verdicts | Fixing code or specs |

## Stack

- **Next.js** (latest, App Router), **TypeScript strict**, **Tailwind CSS**
- **GSAP + ScrollTrigger** for motion; every animation respects `prefers-reduced-motion`
- **Firebase**
  - Firestore: `products`, `collections`, `orders`, `users`, `newsletterSignups`
  - Auth: customer accounts (email/password + Google); guest checkout allowed
  - Storage: product images, served through `next/image`
  - Cloud Functions: checkout session creation, order writes, payment webhooks. Stripe is planned; **payment stays stubbed until the user approves Stripe**
  - Admin SDK on the server (Server Components, Route Handlers, Functions); client SDK only where needed (Auth, cart sync)
  - **Firebase Emulator Suite for all local dev and tests**
- Typed data layer in `/lib/firebase` (repositories such as `getProducts`, `getProductBySlug`). **UI code never calls Firestore directly.**
- Seed script loads typed mock products into the emulator (production only after user approval)
- Cart: client state + `localStorage` for guests, synced to Firestore when signed in
- Env vars in `.env.local` (git-ignored) with a committed `.env.example`; no keys in code
- Playwright for smoke tests and screenshots (390px and 1440px); ESLint + Prettier
- Mobile-first: most visitors arrive from Instagram and Pinterest on phones

## Brand & design direction (design-agent's source of truth)

- **Mood:** a night sky over a glowing mountain city, a moonlit balcony over a lake, an enchanted forest with falling starlight
- **Palette:** deep midnight navy/indigo base, violet and dusky-pink haze, starlight gold accents, warm candle-glow amber for highlights and CTAs
- **Type:** an elegant script for the wordmark only, a refined serif for display headings, a clean readable sans for body and UI
- **Motifs:** crescent moon, small flame, four-point stars, constellation lines, arched frames for product imagery, subtle falling-star particles
- **Feel:** magical and luxurious but calm. Effects support the products and never bury them.

## IP guardrail (blocking; this is a commercial store)

The site is **inspired by an atmosphere**. It is not affiliated with any book series. Never use, in product names, collection names, copy, alt text, metadata, slugs, seed data or code identifiers:

- character names, place names, court names, or book titles from the series that inspired the mood
- the author's name
- direct or lightly paraphrased quotes from the books
- invented terms recognizably taken from the books (named peoples, factions, magic systems, titles)

All names and taglines must be original (for example collections such as "Moonlit Terrace" or "Starlit Library"). Generic words like "night", "court" in its ordinary sense, "starlight", "mountain", "dawn" are fine on their own, but avoid combinations that echo the books' specific terms (e.g. "Night Court", "Court of …", "High Lord/Lady"). design-agent writes all copy. qa-agent treats any violation as a blocking issue.

## The loop (repeat for every task in `TASKS.md`)

1. **Pick.** Orchestrator picks the next unchecked task and states its acceptance criteria.
2. **Spec.** design-agent writes or updates the spec in `/design` (layout, states, responsive behavior, motion, copy). For pure backend tasks, tech-agent writes a short technical spec instead in `/design/tech/` (data model, rules, functions).
3. **Spec review.** qa-agent reviews the spec: complete, consistent with the design system, accessible, buildable, secure. FAIL goes back to the spec author.
4. **Build.** tech-agent implements the approved spec.
5. **Build review.** qa-agent checks:
   - `npm run build`, `npm run lint` and `npx tsc --noEmit` all clean
   - Playwright smoke test passes against the emulators; screenshots at 390px and 1440px compared against the spec
   - Accessibility: contrast AA, keyboard navigation, visible focus states, alt text, reduced motion
   - Performance sanity: no layout shift from animations, images optimized
   - Firebase: security rules tested in the emulator (customers read/write only their own data; products are public read-only; orders writable only by Functions; admin actions require the `admin` custom claim); no secrets in client bundles; efficient Firestore reads (no N+1, indexes defined)
   - IP guardrail check on all copy
6. **Fix rounds.** On FAIL, route each issue to the agent it is tagged for (`[design]` or `[tech]`) and re-review. **Max 3 rounds per task**, then stop and ask the user.
7. **Close.** On PASS: tick the task in `TASKS.md`, append to `PROGRESS.md`, and commit `feat: <task>` (author `zikkops <zikkops@users.noreply.github.com>`, set in this repo's local git config), then `git push` to `origin` (https://github.com/zikkops/starflame.git, branch `main`). Commits resumed at the user's request on 2026-10-10 after the initial `feat: M1 foundation` push.
8. **Milestone gate.** At the end of each milestone, stop and give the user a short summary plus screenshots before continuing.

### Orchestrator notes

- Subagents cannot call each other. The orchestrator passes context between them: the task ID, acceptance criteria, spec paths, and the exact QA issues to fix.
- qa-agent has no write tools. The orchestrator records its verdict in `PROGRESS.md`.
- tech-agent pushback goes in `PROGRESS.md` under the task; the orchestrator routes it to design-agent before building continues.

## Rules

- Small tasks. Never skip QA. Since 2026-10-09 (at the user's request), two tracks run in parallel: a **design track** (design-agent specs) and a **tech track** (tech-agent), each one task at a time. Never run two tech tasks at once (shared `package.json`, `.next`, emulator ports). Visual tasks come before backend tasks; see `TASKS.md`.
- No lorem ipsum or placeholder copy in shipped pages.
- **Ask the user before** adding any paid service, or any dependency beyond the stack above (small dev-only tooling that the stack implies, such as `@firebase/rules-unit-testing`, `firebase-functions-test`, `tsx`, Prettier plugins, ESLint configs, is fine; list it in `PROGRESS.md`).
- **Ask the user before** deploying anything, connecting to a real Firebase project, or touching production data. Until the user provides the Firebase project ID, use a `demo-starflames` project ID, which the emulators treat as offline-only.
- Never commit `.env.local`, service-account keys, or emulator export data containing real user info.

## Repo layout (target)

```
/app                 Next.js App Router routes
/components          UI components (no Firestore imports)
/lib/firebase        typed repositories, admin + client SDK init, converters
/lib/types           shared domain types (Product, Collection, Order, ...)
/lib/domain          pure domain logic: parser kit, schemas, deriveProductFields, order state machine, email hash (no Firebase/next/react/Node-builtin imports; ESLint-enforced)
/functions           Cloud Functions (TypeScript)
/scripts/seed        typed mock data + seed script
/design              design system, page specs, component specs, copy
/design/tech         technical specs for backend tasks
/tests/e2e           Playwright smoke tests
/tests/rules         Firestore/Storage rules tests (emulator)
/tests/unit          unit tests (node:test)
firestore.rules  storage.rules  firestore.indexes.json  firebase.json
```

## Commands (fill in as they are created)

- `npm install` / `npm ci` — also installs `/functions` via `postinstall` (`npm run functions:install` redoes just that)
- `npm run dev` — Next.js dev server
- `npm run start` — serve the production build (loads `.env.local`; deployments must never ship `.env.local`, see the M1.3 spec)
- `npm run emulators` — build functions, then start the Emulator Suite on 127.0.0.1:6100–6109 (UI at http://127.0.0.1:6101), importing from and exporting on exit to git-ignored `emulator-data/`
- `npm run functions:build` — compile `/functions` to `functions/lib`
- `npm run build` / `npm run lint` / `npx tsc --noEmit`
- `npm run build` runs `prebuild` first (`scripts/clear-data-cache.mjs`): it deletes `.next/cache/fetch-cache` so a build never bakes stale repository data. Always build through `npm run build` (or `npm run test:e2e`), never `npx next build`. `npm run seed` clears both data-cache folders; a running `next dev` also caches in memory, so hard-reload once after reseeding or changing repository code. Plain `npm run build` needs no emulators while no page reads data (M1); from the first task that calls a repository from a page (M2.3 if featured collections read Firestore, else M2.4) `prebuild` runs `scripts/build-preflight.mjs`, which fails at once unless `.env.local` exists and the Firestore emulator is running and seeded (`npm run emulators` + `npm run seed`); `npm run test:e2e` handles both itself
- `npm run typecheck` — Next typegen + root tsc + `/functions` tsc
- `npm run format` / `npm run format:check` — Prettier
- `npm run test:unit` — unit tests (node:test via tsx `--conditions=react-server`, `tests/unit/**/*.test.ts`) for domain types, guards, converters; no emulator needed
- `npm run smoke:firebase` — Admin SDK smoke test (Firestore/Auth/Storage write, read, cleanup); needs the emulators running
- `npm run check:client-bundle` — after `npm run build`, scans `.next/static` for server packages and non-`NEXT_PUBLIC_` env names
- `npm run wordmark:build` — regenerate `components/brand/wordmark-path.ts` from the vendored Pinyon Script woff2 (dev-only, uses Next's bundled fontkit; `-- --download` refreshes the font)
- Dev token page: `/dev/tokens`, built only when `ENABLE_DEV_PAGES=true` (set only by the e2e harness: `scripts/e2e.ts` for the `npm run test:e2e` build, and the Playwright webServer when it builds itself, e.g. `npx playwright test`). Run a plain `npm run build` before any production-like `npm run start`
- Tailwind scans only `app/` and `components/` (`source(none)` + `@source`). Add new code directories that carry class names to `app/globals.css`
- `npm run seed` — seed the Firestore + Storage emulators (emulators only; refuses non-demo projects, missing hosts and hosts that aren't loopback): 17 products + 6 collections from `catalog.json` plus a draft and an archived fixture (`scripts/seed/fixtures.ts`), 24 product images to Storage, then it clears Next's data cache. Idempotent (fixed timestamps; unchanged objects aren't re-uploaded); `npm run seed -- --reset` deletes products/collections and Storage `products/` first. Dev: copy `.env.example` to `.env.local` once, `npm run emulators` in one terminal, `npm run seed` in another, then `npm run dev`; with `next dev` running, hard-reload once after seeding (it caches in memory)
- `npm run images:build` — dev-only asset step (sharp): the 6 `lif-*` crops to `assets/images/product-lifestyle/` and the hero/collection JPEGs to `public/images/` (committed), with header size checks; writes only changed files
- `assets/` is local only (git-ignored except `assets/images/manifest.json`, which the catalog mapping and the tests read). On a fresh clone, copy `assets/images/` in from a machine that has the generated originals, then run `npm run images:build`; until then `images:build`, `seed`, `test:seed`, `test:e2e` and one `test:unit` test stop with that instruction (plain `npm run build` works)
- `npm run test:seed` — the seed against the emulators (`emulators:exec --only firestore,storage`): idempotency, documents, Storage metadata, fixtures, repositories over seeded data, CLI guards (don't run `npm run emulators` at the same time)
- `npm run test:rules` — Firestore + Storage rules tests (node:test + `@firebase/rules-unit-testing`) under `firebase emulators:exec --only firestore,storage` (via `scripts/emulators-exec.ts`, which exits with the tests' own code); files run one at a time (251 tests). Don't run it alongside `npm run emulators` or `test:e2e`
- `npm run test:repos` — catalog repository reads (`tests/repos/*.test.ts`: uncached reads, plus the cached `catalog.ts` through a fake incremental cache) against the Firestore emulator under `emulators:exec --only firestore` (don't run `npm run emulators` at the same time)
- `npm run test:e2e` — Playwright smoke tests + screenshots under `firebase emulators:exec` (don't run `npm run emulators` at the same time), via `scripts/emulators-exec.ts` and `scripts/e2e.ts`: after loading `.env.example` when `.env.local` is missing and running the seed, one production build (with `ENABLE_DEV_PAGES=true`), then a parallel pass (`--grep-invert @perf`) and a serial pass (`--grep @perf --workers=1`), each against `next start` on 127.0.0.1:6130; it fails if either pass fails. The exit code is the passes' own (firebase-tools can exit 2 after a green run, from its usage-tracking timeout; that exit is ignored and logged). Stop a run with Ctrl+C (it exits non-zero); Ctrl+Break can leave the Firestore emulator (Java) running on 6104–6105. Tag CPU or wall-clock budgets `@perf`; every other test must hold under parallel load. Reports: `playwright-report/` and `playwright-report/perf/` (the serial pass's failure artifacts in `test-results/perf/`). Filtered: `npm run test:e2e -- <spec files or file:line> [--project=<name>]` (both passes; `--grep`/`-g`, `--grep-invert`, `--workers`/`-j` and `--output` are refused). Screenshots: `test-results/screenshots/<route>-<project>.png` (e.g. `home-`, `404-`, `dev-tokens-`, `dev-header-`, plus named `dev-header-bag-3`/`-bag-120`/`-scrolled` and `dev-header-menu-open` (390 only), `dev-footer-`, `dev-footer-minimal-`; `captureRoute(page, route, testInfo, { name?, fullPage?, animations?, scale? })`) for projects `mobile-390`, `desktop-1440` and their `-reduced-motion` twins (`@motion`-tagged tests only)
- `npm run test:e2e:ui` — Playwright UI mode (seeds first)
- Notable e2e files: `header-scrollbar.spec.ts` (runs with a real classic scrollbar via `ignoreDefaultArgs: ["--hide-scrollbars"]`), `site-routes.spec.ts` (Node-only registry tests, no browser)
- `npm run test:e2e:install` — install Chromium for Playwright (`--no-remove`, so other projects' browsers are kept)

Install scripts: npm 11 `allowScripts` in `package.json` / `functions/package.json`. Every new package with an install script must be explicitly approved or denied.

Emulator ports 4000/4400/4500/8080/9099/9150 may be held by another local project. Never stop processes that aren't ours.

## Environment

Windows 11, Node 24, npm 11, firebase-tools 15, Java 21 (required by the emulators). Write npm scripts that work cross-platform (no bash-only syntax).
