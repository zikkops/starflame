# PROGRESS

Append-only. Never edit or delete past entries; add a new entry to correct one.

Entry format:

```
## <YYYY-MM-DD> <task id> — <task name>
- Agent: <design-agent | tech-agent | qa-agent | orchestrator>
- Step: <spec | spec review | build | build review | fix round N | close>
- Result: <what was done / files>
- QA verdict: <PASS | FAIL (n issues) | n/a>
- Notes: <pushback, new dependencies, open questions>
```

---

## 2026-10-08 M0 — Team setup (Step 0)
- Agent: orchestrator
- Step: setup
- Result: Created `CLAUDE.md`, `.claude/agents/design-agent.md`, `.claude/agents/tech-agent.md`, `.claude/agents/qa-agent.md`, `TASKS.md`, `PROGRESS.md`.
- QA verdict: n/a
- Notes: Environment is Windows 11, Node 24.19, npm 11.17, firebase-tools 15.28, Java 21. Not yet a git repo (M1.1 runs `git init`). Firebase project ID not provided yet, so the emulators use `demo-starflames`.

## 2026-10-08 M1.1 — Scaffold
- Agent: orchestrator
- Step: note
- Result: Custom subagent types aren't registered in this session (they need a reload), so each role runs as a general-purpose subagent bound to its `.claude/agents/*.md` file and its tool limits.
- QA verdict: n/a
- Notes: —

## 2026-10-08 M1.1 — Scaffold
- Agent: tech-agent
- Step: spec
- Result: `design/tech/M1.1-scaffold.md`. Pins: next 16.4.0, react 19.3, TS ~5.9.3 (typescript-eslint peer <6.1), ESLint ^9.39 (react/import/jsx-a11y plugin peers), Tailwind 4.3.3.
- QA verdict: n/a
- Notes: Planned dev deps: prettier, prettier-plugin-tailwindcss, eslint-config-prettier.

## 2026-10-08 M1.1 — Scaffold
- Agent: qa-agent
- Step: spec review
- Result: Versions, peer reasoning, CNA flags, Windows scripts, .gitignore/.env.example all verified.
- QA verdict: FAIL (1 blocking, 2 minor) — (1) CNA 16.4 with Turbopack emits `@tailwindcss/turbopack` + `turbopack.rules`, not `postcss.config.mjs`/`@tailwindcss/postcss`; (2) `--yes` relies on saved local CNA prefs; (3) contradictory package-lock wording.
- Notes: Routed to tech-agent, fix round 1.

## 2026-10-08 M1.1 — Scaffold
- Agent: tech-agent → qa-agent
- Step: fix round 1 → spec re-review
- Result: Tailwind via PostCSS (`@tailwindcss/postcss`), not CNA's Turbopack plugin; explicit `--no-src-dir --no-react-compiler --no-cache-components`; package-lock wording fixed.
- QA verdict: PASS (1 minor: no recorded baseline for the "docs unchanged" check). The orchestrator recorded SHA-256 hashes of CLAUDE.md, TASKS.md, .claude/ and design/ in the scratchpad before the build. PROGRESS.md is excluded because it is append-only.
- Notes: Spec approved → build.

## 2026-10-08 M1.1 — Scaffold
- Agent: tech-agent
- Step: build
- Result: Scaffolded per `design/tech/M1.1-scaffold.md` (CNA 16.4.0 in scratchpad, whitelist copied, Tailwind via PostCSS). typecheck, tsc, lint, build and format:check all exit 0. `git init -b main`, nothing staged.
- QA verdict: pending
- Notes:
  - New dev deps: prettier 3.9.9 (exact), prettier-plugin-tailwindcss ^0.8.1, eslint-config-prettier ^10.1.8.
  - Mechanical correction: `next.config.ts` uses `// config options here` instead of the spec's `/* config options here */`. Prettier 3.9.9 collapses the block-comment form to `{/* … */}`, so the exact spec text fails `format:check`. Same semantics.
  - npm 11 `allow-scripts` skipped `unrs-resolver`'s postinstall (dependency of eslint-import-resolver via eslint-config-next). Lint works without it; not approved, left for the orchestrator.
  - `npm audit`: 5 high (braces → micromatch → fast-glob → @next/eslint-plugin-next), dev-only, in eslint-config-next 16.4.0; the only "fix" downgrades to 14.x. Left as is.
  - PUSHBACK (M1.1): `next dev` in Next 16.3+ writes `AGENTS.md` at the repo root whenever it detects an AI coding agent (`agentRules`, on by default; see `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/agentRules.md`). The spec forbids AGENTS.md and also fixes `next.config.ts` to exact contents with no keys, so both can't hold when an agent (QA included) runs `npm run dev`. I deleted the generated file after my dev check. Proposed fix: add top-level `agentRules: false` to `next.config.ts` (stable, non-experimental option; in 16.4 it also removes an existing managed block on the next `next dev`). Not applied pending approval.

## 2026-10-08 M1.1 — Scaffold
- Agent: orchestrator → tech-agent
- Step: pushback resolution
- Result: Approved the tech-agent PUSHBACK. `next dev` in Next 16.3+ writes AGENTS.md by default (the `agentRules` option), so tech-agent set `agentRules: false` in `next.config.ts` and amended the spec to match. Checked: format:check, typecheck, lint and build pass; dev `/` returns 200; no AGENTS.md is created.
- QA verdict: n/a (build review next)
- Notes: The spec's hash differs from the pre-build baseline because of this approved amendment. The other baselined files are unchanged.

## 2026-10-08 M1.1 — Scaffold
- Agent: qa-agent → orchestrator
- Step: build review → close
- Result: Next 16.4.0 (App Router, Turbopack), React 19.3, TS 5.9.3 strict (+ noUncheckedIndexedAccess etc.), Tailwind 4.3.3 via PostCSS, ESLint 9 flat + eslint-config-prettier, Prettier 3.9.9 + tailwind plugin. Scripts: dev/build/start/lint/typecheck/format/format:check. Git on `main`.
- QA verdict: PASS (0 issues). Every check from typecheck through the IP grep passed, and no secrets or firebase imports were found. Playwright, rules tests and screenshots are out of scope until M1.5 and M1.20.
- Notes: New dev deps: prettier, prettier-plugin-tailwindcss, eslint-config-prettier. Accepted risk: `npm audit` reports 5 high findings from a single braces advisory (GHSA-vfj7-8cjw-p6xm), dev-only via eslint-config-next; `--omit=dev` = 0. Re-check when eslint-config-next releases a patch. npm 11 skipped the unrs-resolver postinstall; it's harmless, because the native binding is present.

## 2026-10-08 M1.1 — Scaffold
- Agent: orchestrator
- Step: note
- Result: No commit made. At the user's choice, per-task commits are paused and the user will commit and push later. No git identity is configured, and none was set. CLAUDE.md loop step 7 updated.
- QA verdict: n/a
- Notes: —

## 2026-10-08 M1.2 — Firebase config + Emulator Suite
- Agent: tech-agent
- Step: spec amendment (QA minors 1–5) → build
- Result: Built per `design/tech/M1.2-emulators.md`: firebase.json (ports 6100–6109), .firebaserc (demo-starflames only), deny-all placeholder firestore.rules/storage.rules, empty firestore.indexes.json, `/functions` package (nodejs24, `health` HTTPS function), root scripts (postinstall, functions:install, functions:build, emulators, typecheck), .env.example on the new ports.
- QA verdict: pending
- Notes:
  - New dev dep (stack-implied): firebase-tools 15.32.1 (exact) at the root. `/functions` deps: firebase-admin ^14.5.0, firebase-functions ^7.4.0; dev: typescript ~5.9.3, @types/node ^24. `/functions` is a separate npm package with its own lockfile (not a workspace).
  - Install-script policy (npm 11.17): `allowScripts` is advisory for unreviewed packages, so their scripts RUN by default (re2 really built `re2.node` before the deny). Policy is now explicit denial via `npm deny-scripts`, which npm 11.17 honors at install time. Root `allowScripts`: `protobufjs: false`, `re2: false` (cosmetic version warning; optional native regex with a JS fallback). `/functions` `allowScripts`: `protobufjs: false`, `@firebase/util: false` (its postinstall only bakes FIREBASE_WEBAPP_CONFIG for App Hosting, which we don't use). After a clean `npm ci`, `node_modules/re2/build/` is absent and every emulator check passes. Still unreviewed (so it runs): `unrs-resolver` from M1.1 (eslint-config-next); left for the orchestrator. Any new package with an install script must be approved or denied explicitly.
  - Root `postinstall` runs `npm --prefix functions ci`, so a fresh clone needs only `npm install`/`npm ci`. With `--ignore-scripts`, run `npm run functions:install` afterwards.
  - `emulator-data/` was deleted after verification (only probe data). The emulators write `firestore-debug.log` at the root (git-ignored); deleted too.

## 2026-10-09 M1.2 — Firebase config + Emulator Suite
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review → build → build review → minor fixes → close
- Result: `firebase.json`, `.firebaserc` (demo-starflames only), deny-all `firestore.rules`/`storage.rules`, empty indexes, `/functions` (TS strict, v2, Node 24, firebase-functions 7.4.0, firebase-admin 14.5.0) with a GET-only `health` probe (`cors: false`). Emulators run on 127.0.0.1:6100–6109 (UI 6101), avoiding another local project on the default ports. `npm run emulators` imports and exports via `emulator-data/`. firebase-tools 15.32.1 is a pinned devDep. Root `postinstall` installs /functions.
- QA verdict: spec PASS (5 minors, fixed in the spec before the build); build PASS (5 minors). Fixes: deny `unrs-resolver`, singleProjectMode wording, explicit `cors: false` (verified: no ACAO header), CLAUDE.md Commands (orchestrator). The orchestrator spot-checked the fixes: lint and tsc clean, no pending install scripts, clean state.
- Notes: Correction to the M1.1 entries: the unrs-resolver postinstall was NOT skipped. Under npm 11.17 `allowScripts` is advisory, so it ran. It is now denied explicitly. Install-script denies: root protobufjs, re2, unrs-resolver; functions protobufjs, @firebase/util. Future: `firebase-functions-test` peers firebase-admin ≤ ^13 (conflict with ^14), so it needs resolving when rules/functions tests land. Not committed (commits paused).

## 2026-10-09 M1.3 — Firebase SDK init in /lib/firebase
- Agent: tech-agent
- Step: spec amendment (QA minors 1–3) → build
- Result: Built per `design/tech/M1.3-sdk-init.md`: `lib/firebase/{env.public,env.server,admin,client}.ts` (replacing `.gitkeep`), `scripts/smoke-firebase.ts`, `scripts/check-client-bundle.mjs`, the ESLint `no-restricted-imports` block, two `.env.example` variables (`METADATA_SERVER_DETECTION=none`, `FIREBASE_ALLOW_NON_DEMO_PROJECT=false`), and scripts `smoke:firebase` and `check:client-bundle`. Spec code blocks match the repo files byte for byte. tsc, typecheck, lint, format:check, build, check:client-bundle and the smoke script against the emulators all pass; negative tests ran in a scratch copy.
- QA verdict: pending (build review)
- Notes:
  - New deps: firebase ^12.19.0 (12.19.0; not 13.0.0, released 2026-10-07), firebase-admin ^14.5.0 (14.5.0, same as /functions), server-only 0.0.1 (exact, stack-implied). New dev dep: tsx 4.23.15 (exact, stack-implied; runs the smoke script and the future M1.8 seed).
  - Install-script denials (root `allowScripts`): `@firebase/util` (postinstall only bakes FIREBASE_WEBAPP_CONFIG for App Hosting auto-init; unused) and `esbuild` (via tsx; postinstall only checks/downloads the platform binary, which the optional `@esbuild/<platform>` package already provides). After a clean `npm ci`, "No packages with unreviewed install scripts" and tsx runs.
  - Accepted risk: `npm audit --omit=dev` reports 4 high findings, all from `@grpc/grpc-js@1.9.16`, which `@firebase/firestore` pins to `~1.9.0` (firebase 13.0.0 pins it too). grpc-js is used only by the Node build of the client Firestore SDK, but that build does reach our server output: SSR of a client component that imports `client.ts` bundles the Node build, so grpc-js 1.9.16 lands in `.next/server/chunks/ssr` and the nft trace (confirmed in a scratch build). Accepted because the advisories (GHSA-m9gg-hp2v-232j, GHSA-f596-whhp-79r4) cover gRPC *server* behaviour (cert auth context, error messages), we run no gRPC server, and every `client.ts` getter throws on the server, so no channel is ever opened. The browser build uses WebChannel and never imports grpc-js. `/functions` audit: 0; Admin's own grpc-js is 1.14.6; no `overrides`. M5: keep client-SDK consumers out of SSR, or revisit when firebase 13 or a grpc-js bump in `@firebase/firestore` lands.
  - Production-setup task: deployments must not ship `.env.local`. `next build`/`next start` load it too, so `METADATA_SERVER_DETECTION=none` and the `*_EMULATOR_HOST` variables would apply.
  - Orchestrator: add `npm run smoke:firebase` and `npm run check:client-bundle` to the CLAUDE.md Commands list. Not committed (commits paused).

## 2026-10-09 M1.3 — Firebase SDK init
- Agent: qa-agent → orchestrator
- Step: build review → close
- Result: `lib/firebase/{env.public,env.server,admin,client}.ts`, `scripts/smoke-firebase.ts`, `scripts/check-client-bundle.mjs`, ESLint import boundary, deps firebase 12.19.0 / firebase-admin 14.5.0 / server-only / tsx.
- QA verdict: spec PASS (3 minors, amended before build); build PASS (3 minors). Minor 1 (CLAUDE.md `start` entry) was fixed by the orchestrator. Minors 2 (fail-fast wording) and 3 (smoke `finally` masking the original error) are carried into M1.20.
- Notes: The orchestrator removed the git-ignored QA leftovers (`emulator-data/`, `firestore-debug.log`). Not committed (commits paused).

## 2026-10-09 — Re-plan: visuals first, two tracks
- Agent: orchestrator
- Step: plan
- Result: At the user's request, visual tasks now come before backend tasks, and a design track and a tech track run in parallel, each one task at a time. M1.20 Playwright moves to the front of the tech track because visual QA needs screenshots. New order is in TASKS.md; the rule is in CLAUDE.md.
- QA verdict: n/a
- Notes: —

## 2026-10-09 M1.9 — Design tokens
- Agent: design-agent → qa-agent
- Step: spec → spec review
- Result: `design/system/tokens.md`, `motion.md`, `accessibility.md`. Night base, ivory text, gold accents and focus, ember-amber CTA, violet and rose haze. Dark-only.
- QA verdict: FAIL (1 blocking, 10 minor). Blocking: candle-glow composites were computed only over night-900; stacked over haze or raised surfaces, the text fails. Minors: haze composite G-channel error, missing UI and status pairs over haze, orphan `--color-cta-text`, plain vars inside @theme get dropped, reset the radius/shadow/ease defaults, hero entrance flash, GSAP stagger each/amount, top-layer dialog vs z-toast, `--font-sans` alias. QA independently recomputed 89 of 90 contrast ratios and found them correct.
- Notes: Routed to design-agent, fix round 1. The user has an exploratory home mockup (served at localhost:3002 from the scratchpad). Its hexes differ slightly from the spec; that's an open question for the user.

## 2026-10-09 M1.9 — Design tokens
- Agent: design-agent → qa-agent → orchestrator
- Step: fix round 1 → spec re-review → close
- Result: All 11 round-0 issues resolved. The candle glow is only allowed on bg-page/bg-sunken. Ceilings are per family. New U11–U15, T51–T53, X7 and rules 6–8. A :root vs @theme placement table. Theme resets. Hero-flash approach (sync head script + 2500ms fallback).
- QA verdict: PASS (5 minors). QA recomputed 108 sub-pairs with 0 mismatches. Minors: CTA-glow family ceiling over haze, add bg-sunken to rule 7, text-LCP risk for the hero heading at 390px (carried to the M2 hero spec), "CSS fallback" wording, gold-400 R_lin typo. design-agent fixes these as the first step of M1.10.
- Notes: Palette of record is design-agent's (the user hasn't chosen between it and the exploratory mockup; the orchestrator defaulted to the spec). Two open user questions: body-text ivory vs cool white, cart badge gold vs amber.

## 2026-10-09 M1.20 — Playwright setup
- Agent: tech-agent
- Step: spec amendment (QA minors 1–4) → build
- Result: Built per `design/tech/M1.20-playwright.md`: `playwright.config.ts` (4 Chromium projects: mobile-390, desktop-1440 and their `-reduced-motion` twins for `@motion` tests; production build on 127.0.0.1:6130), `tests/e2e/{fixtures,smoke.spec,screenshots.spec}.ts`, `tests/e2e/support/{screenshot,keyboard}.ts` (replacing `.gitkeep`), and scripts `test:e2e`, `test:e2e:ui`, `test:e2e:install`. Spec code blocks match the repo files byte for byte. tsc, typecheck, lint, format:check, build, check:client-bundle, smoke:firebase (under emulators:exec) and `npm run test:e2e` (6 passed, exit 0) all pass; negative tests ran in a scratch copy. Screenshots: `test-results/screenshots/home-{mobile-390,desktop-1440}[-reduced-motion].png`.
- QA verdict: pending (build review)
- Notes:
  - New dev dep: `@playwright/test` 1.63.0 (exact; stack tooling, not 1.64.0, released 2026-10-07). It brings `playwright` and `playwright-core` 1.63.0 and nothing else. No install scripts: "No packages with unreviewed install scripts", `allowScripts` unchanged.
  - Browsers: Chromium only, revision 1243 (Chrome for Testing 153 + headless shell), installed with `playwright install --no-remove chromium`, so another project's `chromium-1234` stays in `%LOCALAPPDATA%\ms-playwright`.
  - Carried M1.3 build-review minors 2 and 3 are done: the fail-fast wording in `design/tech/M1.3-sdk-init.md` (lines 56 and 769), and `scripts/smoke-firebase.ts` now runs each cleanup step through a non-throwing `cleanup()` helper, so a cleanup error can't mask the original one (the M1.3 §3 block is updated to match).
  - Option for the user: `@axe-core/playwright` (automated WCAG scan per route). It is a new dependency, so it was not added.
  - Orchestrator: add `test:e2e:ui` and `test:e2e:install` to the CLAUDE.md Commands list, and note that the e2e port is 6130. Not committed (commits paused).

## 2026-10-09 M1.20 — Playwright setup
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review → build → build review → close
- Result: `@playwright/test` 1.63.0, Chromium only. Projects mobile-390, desktop-1440 and reduced-motion twins. Production build on 127.0.0.1:6130 under emulators:exec. A fixture fails tests on console errors, page errors or HTTP ≥ 400, with an `expectedIssues` opt-out. Screenshots go to `test-results/screenshots/`. tabOrder and hasVisibleFocus helpers. The carried M1.3 items are done.
- QA verdict: spec PASS (4 minors, amended before build); build PASS (3 minors). Carried into M1.11: tabOrder wrap detection by element identity, config paths resolved from the config dir, port comment mentions 3002.
- Notes: The orchestrator removed the git-ignored `firestore-debug.log`. A stray `playwright@1.64.0` landed in the user npx cache from a QA probe; nothing was added to the project. `@axe-core/playwright` still needs the user's decision. Not committed (commits paused).

## 2026-10-09 M1.10 — Typography (+ M1.9 post-pass check)
- Agent: design-agent → qa-agent
- Step: spec → spec review
- Result: `design/system/typography.md`. Cormorant Garamond for display and Jost for body. The wordmark is an inline SVG outlined from Pinyon Script (no script webfont). 15 fluid clamp() steps. M1.9 post-pass minors applied (CTA-glow rule 9, family ceiling `#594E55`).
- QA verdict: M1.9 post-pass PASS (3 minors: `@theme inline` for font tokens, add `--font-display-italic`, add the wordmark height vars to `:root`). M1.10 FAIL (1 blocking: next/font 16.4 rejects `weight: '400 600'` ranges; 7 minors: narrowed-axis claim, style-array claim, latin-ext wording, missing open-questions section, no named wordmark tool, SVG size estimate, h3/h4 text-secondary conflict). QA measured about 64 KB of preloaded fonts and confirmed Jost tnum.
- Notes: Wordmark route decided by the orchestrator: a one-off dev script using Next's bundled fontkit (no new dependency), delivered by tech-agent in M1.11. Fix round 1 → design-agent.

## 2026-10-09 — Re-plan: real imagery
- Agent: orchestrator
- Step: plan
- Result: The user asked for real themed candle images and chose AI generation on their connected Higgsfield account, for the real site only (not the mockup). Balance 173.3 credits (starter plan). Cost check: gpt_image_2_5 0.25 credits per image, recraft_v4_1 1.25, soul_location ~0.12–1. Estimated total ~8–10 credits for about 25 images plus retries. M1.7 catalog moved up; added M1.7b (art direction + shot list, design-agent) and M1.7c (generation by the orchestrator after the user approves the spend).
- QA verdict: n/a
- Notes: Product images → Firebase Storage via seed (M1.8). Mood/hero/collection images → static assets. Generated images must contain no text, logos or other brands, and nothing recognisable from the book series.

## 2026-10-09 M1.10 — Typography
- Agent: design-agent → qa-agent → orchestrator
- Step: fix round 1 → spec re-review → close
- Result: Cormorant Garamond (roman 500–600 preloaded, italic 500 on demand) and Jost 400–600 via next/font, about 64 KB preloaded. The wordmark is an inline SVG `<symbol>`/`<use>` outlined from Pinyon Script with Next's bundled fontkit (dev-only, owner tech-agent in M1.11; manual export as fallback). 15 fluid clamp() steps verified at 390 and 1440. Thin-stroke rules. `@theme inline` font mapping. Open questions in §11.
- QA verdict: PASS (2 wording minors: the preload sentence at :370, the stale parenthetical at :392). M1.9 post-pass minors also PASS (1 wording minor: the status line). All three go to design-agent after M1.7/M1.7b.
- Notes: QA validated the exact next/font calls against Next 16.4.0's validator.

## 2026-10-09 M1.7 / M1.7b — Catalog copy + art direction
- Agent: design-agent → qa-agent
- Step: spec → spec review
- Result: `design/copy/catalog.{md,json}`: 6 collections, 17 products, USD sample prices. `design/art/art-direction.md` + `shot-list.json`: 26 shots + 4 rerolls, fixed vessel blocks, blank labels.
- QA verdict: M1.7 FAIL (2 blocking IP: "Falling Star" in a once-a-year falling-sky drop reads as the series' star-shower celebration; "Silver Hour" beside the brand echoes a book title; 9 minors). M1.7b FAIL (1 blocking: those names propagate into ids, alt text and paths; 7 minors). All structural validation passed.
- Notes: User decisions 2026-10-09: Silver Hour → **Moonrise**; design-agent chooses replacements for Falling Star and Night Garden (the latter a trademark collision with a children's TV title; user can veto); image spend (~30 × 0.25 = ~7.5 credits) **approved**, generation only after QA passes the fixed shot list. Tech minors carried to later tasks: M1.4 derived fields (`priceFrom`, `sizeKeys[]`, `collectionSlugs[]`, gift-set `scentFamilies`); M1.8/M3 `images.dangerouslyAllowLocalIP` for the Storage emulator (dev only) or `unoptimized`; M1.5 public read on `products/**`; prefer JPEG/WebP for /public copies. QA notes for the user: a trademark search for "Starflames" in class 4; never pair the brand with "silver"/"fall" names; never pair "frost" + "starlight" for Comet Season.

## 2026-10-09 M1.7 / M1.7b — Catalog + art direction (close) and M1.7c batch A
- Agent: design-agent → qa-agent → orchestrator
- Step: fix round 1 → spec re-review → close; generation batch A
- Result: Renames: Moonrise (user), Late Bloom, Gilded Plum (design-agent; the user can veto). Both specs PASS. Batch A generated on Higgsfield gpt_image_2_5 (flare, quality low, 1k, 4:5, 896×1120): cat-moonrise, cat-lantern-path, cat-late-bloom, cat-fir-hollow → `assets/images/product-catalog/`. Cost 1.0 credit (173.3 → 172.3).
- QA verdict: M1.7 PASS (2 minors: Comet Tail "streak" wording, typography.md status line). M1.7b PASS (2 minors: the wax-melt alt says six in the tray but it's 4 + 2; hero glow behind an opaque photo needs an M2 treatment). Orchestrator review of batch A against art-direction §10: no text or logos; single gold star on blank labels; vessel looks match the blocks. Fir Hollow: one loose cube reads more yellow than sage, and the clamshell lid is clear rather than midnight-blue (the tray is blue).
- Notes: Output is below the spec's 1600×2000 minimum (fine for emulator sample data). Cost options checked: 2k medium = 1 credit/image, 2k high = 2.75. gpt_image_2_5 accepts `image_references`, so later shots can use the approved lock-tests as references. Queued design minors for design-agent: typography §9.1 fallback column, viewBox padding wording, badge vars in tokens §11.2, @theme static note, Comet Tail wording, typography status line, melt alts.

## 2026-10-09 M1.11 — Tokens + fonts + wordmark + dev token page (build)
- Agent: tech-agent
- Step: spec amended for QA minors 4–7 (changelog in `design/tech/M1.11-tokens-fonts.md`) → build
- Result: Built per the amended spec: `app/globals.css` (tokens, `@theme static` colours, type utilities, base, reduced motion, forced colors), `app/fonts.ts` (Jost + Cormorant via next/font, no `fallback` option), `app/hero-pending.ts` + head script, `app/icon.svg`, `components/brand/Wordmark.tsx` + generated `wordmark-path.ts`, `scripts/wordmark/` (build script, vendored Pinyon Script woff2 + OFL.txt; dev input only, never bundled), `/dev/tokens` behind `app/dev/gate.ts` (`ENABLE_DEV_PAGES`, build time), new `lib/motion/tokens.ts`, `tests/e2e/tokens.spec.ts`; carried M1.20 minors (a)–(c) and the favicon allowlist removal, with the M1.20 §3 blocks resynced. `npm run wordmark:build` added. No new dependency.
- Checks: typecheck, `npx tsc --noEmit`, lint, format:check, build, check:client-bundle (lists ENABLE_DEV_PAGES), approve-scripts (nothing pending, root and functions), smoke:firebase (6 ok) all pass. `test:e2e` **32 passed** (30 + 2 for the motion drift test). Preload 64,364 B (budget 120,000). CLS 0.0000 on `/` and `/dev/tokens` at 390 and 1440 with fonts delayed 1 s. Global CSS 20.4 KB raw / 4.9 KB gz; dev CSS 19.3 KB / 3.3 KB (`/dev` only). Wordmark build twice → same sha256 `4abff3ea…108f4f`.
- Notes: **Deviation found in the build:** Tailwind's automatic source detection scanned `/design` and the Markdown files in the real repo (the prototype had none), putting dev-page and prose classes into every route's CSS (46.5 KB raw). Fixed with `@import "tailwindcss" source(none)` + `@source "../app"` / `"../components"`; new code dirs with class names must be added there. Accepted (orchestrator): a plain build still emits the dev CSS chunk, linked by the `/dev/tokens` 404 (dev utilities only, no content). Findings for design-agent (not pushback): Turbopack drops the metric-adjusted fallback when next/font gets `fallback` (typography.md §9.1 column → "appended in CSS"); viewBox padding wording; badge vars in tokens §11.2. M1.18/M2 GSAP reads motion values from `lib/motion/tokens.ts`, never `getComputedStyle` (minifier rewrites to `.15s` / 8-digit hex). `test:e2e` builds `/dev/tokens` into `.next`; run a plain `npm run build` before any `npm run start` meant to mirror production (done after this build). Orchestrator: add `npm run wordmark:build` to the CLAUDE.md Commands list.

## 2026-10-09 — Design-system post-pass minors (M1.11 review)
- Agent: design-agent
- Step: fix
- Result: typography.md: §9.1 fallback column ("none; stack appended in @theme inline"), §9.2 stacks, the Cormorant family-name sentence, measured sizes (64,364 B preloaded), viewBox "ink bounds + half stroke", status line. tokens.md: §11.2 badge note (no own vars), §11.0 `@theme static` approved, minifier-units note. No values changed.
- QA verdict: pending (folded into the M1.12 spec review)
- Notes: Leftover nit in typography §9.2 "Verify in M1.11" ("generated family name" → plain "Jost"). Shot-list and catalog minors (Comet Tail "streak", melt alt 4+2, M2 hero glow treatment) are deferred until image generation finishes.

## 2026-10-09 M1.11 — Tokens + fonts + wordmark + dev token page
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review → build → build review → close
- Result: `app/globals.css` (full theme, resets, `@theme static` colours, Tailwind `source(none)` scanning app/ and components/ only), `app/fonts.ts` (Jost + Cormorant roman preloaded, italic on demand), the Wordmark SVG sprite built by `npm run wordmark:build` (bundled fontkit, vendored OFL font), `app/icon.svg`, the hero-pending head script, `lib/motion/tokens.ts`, `/dev/tokens` (gated by ENABLE_DEV_PAGES). 32 e2e tests.
- QA verdict: spec PASS (7 minors: 4 tech fixed in the build, 3 design done in the post-pass); build PASS (3 minors carried into M1.13: the focus ring fades in via transition-colors (outline-color), so set outline-color in base or exclude it, plus a test; the drift test should check units; the dev CTA press transition). Measured: preload 64,364 B, CLS 0, global CSS 20.4 KB / 4.9 KB gz; all 15 type roles exact at 390/1440; body contrast 16.53.
- Notes: Not committed (commits paused).

## 2026-10-09 M1.7c — Image generation (Higgsfield)
- Agent: orchestrator → generation operator (general-purpose subagent)
- Step: generate + checklist review
- Result: 25 shots at gpt_image_2_5 / 2k / medium with the batch-A lock tests as image references (brand-story on hold). Files in `assets/images/{product-catalog,hero,collection}/` plus `assets/images/manifest.json`. All meet the minimum resolutions (catalog 1792×2240, hero-desktop 2688×1520, col 1744×2336). Credits 172.3 → 141.3 (31 used: 25 + 6 rerolls; cap 34). Total project spend so far: 32 credits.
- QA verdict: checklist review by the operator. 18 accepted, 7 flagged: hero-mobile (posterization; it's the LCP image), cat-little-constellation-set (framing), cat-reading-nook-set, cat-comet-season-gift-box (posterization, lid in the top 25%, clear melt pack), col-lakeside-hush, col-comet-season, col-gift-sets. No text, logos, figures or series content in any image.
- Notes: The orchestrator reviewed both heroes visually: desktop excellent; mobile shows clear banding. The desktop candle centre is at about x 60% (not 68%), so the M2 glow must follow the actual candle. Gallery for the user at http://localhost:3002/gallery (scratchpad server; serves only PNGs under assets/images). Open: fix the 7 flagged shots at higher quality (needs spend approval); a closed melt-pack reference image; lock-look framing vs §10 item 4 for design/QA to confirm.

## 2026-10-09 — Flagged images decision
- Agent: orchestrator
- Step: note
- Result: User decision: keep all 7 flagged images as development placeholders, with no extra spend now. **Pre-launch TODO:** regenerate hero-mobile (LCP), the 3 gift-set shots, col-lakeside-hush, col-comet-season and col-gift-sets at higher quality (2k high ≈ 2.75 credits each); make a closed-melt-pack reference; replace or match all AI vessels to the real products before launch.
- QA verdict: n/a
- Notes: —

## 2026-10-09 M1.12 — Layout shell spec (+ design-system post-pass check)
- Agent: design-agent → qa-agent → orchestrator
- Step: spec → spec review → close
- Result: `design/components/layout-shell.md`: (site) route group + SiteShell, skip link → sticky header (64/72/80px, opaque-on-scroll, un-sticky under max-height 28rem) → main#main → footer; fixed starfield slot (stars only, no haze); Container/Section/SectionHeading; 5 band types; `scroll-padding-top` on html; error/not-found inside the shell; print rules. New tokens: --header-h, --scroll-offset, --page-inline-start/end.
- QA verdict: PASS (9 design minors: section-link baseline alignment, global-error font variables + main + title, the (site)/not-found title mechanism, register the new tokens in tokens.md, the z-starfield row wording, the haze two-band claim, the same-background padding collapse, print `body{display:block;min-height:0}`, a 100vh fallback). The design-system post-pass minors are also verified (c8.js: 0 changes).
- Notes: Minors → design-agent. M1.13 tech spec starts in parallel and implements the QA-fixed behaviour.

## 2026-10-09 M1.4 — Data models
- Agent: tech-agent → qa-agent
- Step: spec → spec review
- Result: `design/tech/M1.4-data-models.md`: lib/types + lib/domain (guards, deriveProductFields, order state machine, email hash) + lib/firebase converters; branded IDs; slug-as-ID; a cart line per doc; guest order token hash; newsletter hash checked in rules; M3 in-memory filtering plus 4 composite indexes; 37 unit tests (node:test + tsx).
- QA verdict: FAIL (2 blocking: the collections query has no index or plan; the false claim that functions/ can import lib/domain (TS6059 rootDir, server-only), with no sharing mechanism named for M6. 6 minors: wrong lif/mood image sizes in the fixture + JPEG sizes + derivative task ownership; bare Node builtins not banned; state-machine gaps (partial refunds, late payment, history check); NFC not enforced by rules; the 20-get budget is at the limit; guest token lifetime/referrer). QA verified: build OK, 37/37, all 17 products validate, deriveProductFields hand-checked, emulator array-contains limits confirmed.
- Notes: Fix round 1 → a separate tech-agent instance (spec-only, its own scratch folder), parallel to M1.13 spec prototyping (no repo writes in either).

## 2026-10-09 M1.14 — Header spec (+ M1.12 post-pass re-check)
- Agent: design-agent → qa-agent → orchestrator
- Step: spec → spec review → close
- Result: `design/components/header.md`: a route registry with `live` flags (no dead links; in M1.15 public pages show the wordmark only; /dev/header shows the full header); 390: wordmark + bag + menu; 768 adds search; 1024+ centred nav + account; `<dialog>` drawer (showModal, CSS-only motion, :has() scroll lock); gold bag badge, 99+, polite live region; aria-current + gold underline; bg-scrim reserved for a hero-under-header case (worst case 7.23/5.45/4.92 over the moon).
- QA verdict: M1.14 PASS (12 design minors: crescent wording, the `overlay` fallback note, a permanent scrollbar-gutter, explicit focus return for Safari, invoker-command typings, widen the no-JS footer requirement to all drawer items, the Search duplicate at md, drawer padding = page-inline-end, extra /dev/header gate shots (menu open, scrolled, badges 3/120), the 99+ badge note, Bag vs Cart, route decisions). M1.12 post-pass PASS (1 optional wording minor).
- Notes: Route decisions recorded in TASKS.md (M3.6 /collections index, M8.1 /our-story, M8.3 /collections/gift-sets). For the user: "Bag" vs "Cart"; site search at launch (no milestone; may need a paid service). Header minors → design-agent after M1.16.

## 2026-10-09 M1.16 — Footer spec
- Agent: design-agent → qa-agent
- Step: spec → spec review
- Result: `design/components/footer.md`: bg-sunken footer; minimal M1.17 public state (wordmark, brand line, rule, ©); Explore/Our collections/Help groups via the header registry; socials hidden until URLs exist; legal row; full state at /dev/footer.
- QA verdict: FAIL (2 blocking: the footer omits Search and Account, which are drawer-only links, so no-JS visitors can't reach them; `/dev/footer?state=minimal` collides with `/dev/footer` in the screenshot slug. 8 minors: registry shape, the © year frozen at build time, dynamic dev page vs the gate comment, the underline offset 0.3 vs 0.4em, height maths, social glyph colour rules, the dev.css @source line, legal-page tasks). All contrast and grid maths verified.
- Notes: The orchestrator added the legal-page tasks M2.5a/M2.5b (Privacy) and M6.0a/M6.0b (Terms, Shipping & returns) to TASKS.md. Fix round 1 → a second design-agent instance (footer.md only), parallel to the instance on header.md + starfield.md. The registry table is defined in footer.md; header.md adopts it in its next pass.

## 2026-10-09 M1.16 — Footer spec (close)
- Agent: design-agent → qa-agent → orchestrator
- Step: fix round 1 → spec re-review → close
- Result: Search and "Your account" (with a "Sign in" gap fallback) added to the footer, so every drawer-only key is covered; `/dev/footer` + `/dev/footer/minimal` (static paths, client-side preview controls); one 13-row route registry (§3.2.1) + a `features` map; © = build year; social glyphs solid #FFFFFF (Pinterest rule verified; Instagram colour rule [confirm before launch]).
- QA verdict: PASS (2 minors: a FooterPreviewProvider must wrap both main and footer; the sign-in fallback rule in the footer-group helper and e2e check 4).
- Notes: Queued for design-agent after M1.18: the footer minors; header.md adopts the footer.md §3.2 registry and replaces `/dev/header?current=` with paths + client controls.

## 2026-10-09 M1.4 — Data models (spec approved)
- Agent: tech-agent → qa-agent
- Step: fix round 1 → spec re-review
- Result: 5 composite indexes (added collections status+sortOrder); Functions sharing deferred to M6.1 (prebuild copy into a git-ignored functions/src/shared; QA compiled lib/types+domain under the functions tsconfig); fixture image sizes come from manifest.json; the builtin-module ban; the order history-transition guard; NFC accepted risk; the cart get() budget rule; guest-token notes.
- QA verdict: spec PASS (0 issues). 39/39 unit tests; build OK on a full copy; email hash matches the rules in Node, Chromium and the emulator.
- Notes: The build is queued on the tech track after the visual tasks (M1.13 → M1.15 → M1.17 → M1.19), per the visuals-first order. Hand-offs recorded: M1.5 (5 indexes, a 20-line batch test, no extra get()), M1.8 (lif crops, /public JPEGs, header size checks), M6.1 (Functions sharing, partial refunds, late payment, guest token).

## 2026-10-09 M1.14 (reopened) + M1.18 — Header post-pass check, starfield spec
- Agent: design-agent → qa-agent
- Step: post-pass check / spec review
- Result: header.md minors 1–12 applied; starfield.md written (server SVG + CSS twinkle spans + WAAPI falling star, ≤3 KB gz island, 0.14 content-column cap, bright marks in gutters only, no GSAP).
- QA verdict: M1.14 post-pass FAIL (2 blocking: the `/dev/header?bag=…` GET form breaks screenshot naming, live-region test and static gating; header.md hasn't adopted the footer.md §3.2.1 registry, and M1.15 builds first). M1.18 FAIL (2 blocking: twinkling dim stars rendered as both circle and span (stacking to 0.26 → text-muted 2.99); `/dev/starfield?…` query preview. 12 minors: a pause hook, small-sky separation at 400% zoom, corridor-check gaps, layout-shell §8 wording, tokens stars role cap, Ribbon anchor at ≥1684px, a compositor check, streak shot animations, fullPage:false, short-viewport row, IO rootMargin px, a stale question). Contrast cap verified: no text/UI colour below AA at 0.14.
- Notes: M1.14 reopened in TASKS.md. Added M8.8b "Pause animations" control (WCAG 2.2.2, required before launch). M1.19 wording updated (CSS + WAAPI, GSAP optional). Shared tech change for M1.13: `captureRoute` gains `name` and `animations` options (plus fullPage:false). Fixes → two design-agent instances: (a) header.md + footer.md, (b) starfield.md + layout-shell.md + tokens.md.

## 2026-10-09 M1.13 — Layout shell (tech spec)
- Agent: tech-agent
- Step: spec (prototype green: 70 e2e passed)
- Result: `design/tech/M1.13-layout-shell.md`: (site) group + SiteShell, SkipLink, StarfieldSlot, Container/Section/SectionHeading, placeholder header/footer, error/not-found/global-error, viewport export, all 9 layout-shell post-pass fixes, the M1.11 minors (focus-ring outline-color in base + test; drift test units; dev CTA scale transition). CLS 0.0001/0.0000. Global CSS +2.3 KB gz.
- QA verdict: pending
- Notes: PUSHBACK 1 approved by the orchestrator: "Try again" uses Next 16.4 `retry()` (re-fetches) instead of `reset()`; layout-shell.md §10 wording → design-agent. PUSHBACK 2 recorded for M3/M4: a request-time `notFound()` in (site) streams an empty 404 without JS; use `generateStaticParams` + `dynamicParams = false` for product and collection slugs. To add at build: the `captureRoute` `name`/`fullPage`/`animations` options (needed by header.md and starfield.md shots).

## 2026-10-09 M1.14 / M1.16 — Header + footer post-pass re-check (close)
- Agent: design-agent → qa-agent → orchestrator
- Step: post-pass fix round 1 → re-check → close
- Result: /dev/header and /dev/footer are static, with client preview providers (no DOM) wrapping main + header/footer; named gate shots via Playwright actions + captureRoute options; one registry (footer.md §3.2.1) in `components/layout/site-routes.ts` with headerPrimary/More/Account/Bag + footerGroup helpers.
- QA verdict: M1.14 PASS (3 minors), M1.16 PASS (2 minors). Carried to the build tasks as implementation notes (no further design round): captureRoute options = `name`, `fullPage`, `animations` (single definition in the M1.13 tech spec/screenshot.ts); a hydration signal (bag name "Bag" on the server → "Bag, empty" after hydrate) and a deterministic coalescing test (one page.evaluate or page.clock); site-routes.ts Node-importable (no "use client", server-only or next/* imports); NavLink picks HeaderPreviewContext or FooterPreviewContext by variant. TASKS.md registry references updated by the orchestrator.
- Notes: M1.14 re-ticked.

## 2026-10-09 M1.18 — Starfield spec (fix round 1 → re-review)
- Agent: design-agent → qa-agent
- Step: fix round 1 → spec re-review
- Result: All 14 round-0 issues resolved (draw-once spans, static dev paths, motion-off hook, min-sky cutoff, corridor rules, compositor check, clamped constellations).
- QA verdict: FAIL (2 blocking: the streak-demo path refuses itself (trail into a caption/edge, spacer below the fold at 390, ~44° angle, first-launch timing vs the 4 s test); ResizeObserver's initial notification cancels every streak. 5 minors: dev page titles, measure the ≤4 ms budget (and a phone expectation), layer-delta allowance for main/header overlap, layout-shell "canvas" wording, `data-sf-last-skip` values.)
- Notes: Fix round 2 of 3 → design-agent.

## 2026-10-09 M1.18 — Starfield spec (close)
- Agent: design-agent → qa-agent → orchestrator
- Step: fix round 2 → re-review → close
- Result: The demo spacer is first in the first plain band (fixed 320/360px); the 20° demo path stays inside the spacer at 390 and 1440 (QA recomputed the full geometry to 0.1px); streak-blocked refuses only on `text`; the ResizeObserver compares sizes; streaks live in the slot (outside main); dev page titles; a measured per-attempt budget; layer delta ≤ 32+2; skip reasons edge → null → text.
- QA verdict: PASS (3 wording minors, carried to M1.19 as build notes: test 12 sets the viewport to 390×844 explicitly (the iPhone 14 project is 390×664, which also passes); "both projects run Chromium (mobile-390 emulates the viewport, not the CPU)"; drop the "head 2px adds 1px" note).
- Notes: All M1 design-track specs are complete. The design track holds until the M1 gate (no M2 specs before the user's review).

## 2026-10-09 M1.13 — Layout shell (spec review)
- Agent: qa-agent
- Step: spec review
- Result: 70/70 e2e on the prototype; widths, header heights, section-y, the focus-ring fix on all control types, retry() and the PUSHBACK 2 finding all verified in the browser and source.
- QA verdict: FAIL (1 blocking: `max-w-prose` is Tailwind's fixed 65ch, not `--container-prose`, giving a 702/624.7px prose width and sideways shift on font swap; 4 tech minors: captureRoute name/fullPage/animations missing, the 100vh fallback stripped by the optimizer, the plain-build /dev gate serving an empty error document (not the shell), the StarfieldSlot comment; 3 design minors: layout-shell §10 retry(), the §5.3 flex-basis note, `max-w-(--container-prose)` naming).
- Notes: Orchestrator decision: tech-agent applies the spec fixes and proceeds to build in one step; the QA build review verifies the fixes (the spec re-review is folded into the build review because the fixes are mechanical). Design minors → design-agent in parallel.

## 2026-10-09 M1.13 — Layout shell (fix round 1 + build)
- Agent: tech-agent
- Step: fix round 1 (QA issues 1–5) → build
- Result: Spec `design/tech/M1.13-layout-shell.md` fixed (changelog "Fix round 1: QA issues 1–5") and built into the repo; spec code blocks (23 files) and the four patches byte-match the repo. (1) Prose wrapper is `max-w-(--container-prose)` (680px); every container key checked against w-/min-w-/max-w- with Tailwind's compiler: only `max-w-prose` (built-in 65ch) collides; new shell.spec test: the 404 prose wrapper is 680px at 1440 with fonts blocked and loaded. (2) `captureRoute(page, route, testInfo, { scale, name, fullPage = true, animations = "disabled" })`, the single definition for M1.15/M1.19; callers updated, 404 shot uses `name: "404"`. (3) `100vh` fallback removed from the source (Tailwind 4's targets all support svh; the optimizer dropped it). (4) Plain-build `/dev/tokens` 404 documented as Next's empty `__next_error__` document (nested notFound), next to the §4.2 finding. (5) StarfieldSlot comment matches layout-shell.md §8.1. Files: new `app/(site)/{layout,page,not-found,error}.tsx`, `app/{not-found,error,global-error}.tsx`, `components/layout/*` (11), `tests/e2e/shell.spec.ts`, `tests/e2e/support/layout-shift.ts`; changed `app/layout.tsx`, `app/globals.css`, `app/fonts.ts`, `app/dev/tokens/page.tsx`, `tests/e2e/{screenshots,tokens}.spec.ts`, `tests/e2e/support/screenshot.ts`; deleted `app/page.tsx`.
- Checks: tsc, typecheck, lint, format:check, plain build, check:client-bundle, smoke:firebase (under emulators:exec, 6 ok), approve-scripts (nothing pending, root and functions) all pass. `test:e2e` **74 passed**. CLS 0.0001/0.0000 (390/1440). Global CSS 20,441 → 32,558 B raw, 4,884 → 7,185 B gz. Final plain build done; `/dev/tokens` is 404.
- Notes: No new dependency. Orchestrator's dev server on 3001 hot-reloaded the route move: `/` 200 (shell), unknown URL 404 (shell), `/dev/tokens` 200; 3002 200. For design-agent: header.md §13 shows the old `captureRoute(page, testInfo, …)` order. Orchestrator: CLAUDE.md "Screenshots" line gains `404-<project>.png`. Not committed (commits paused).

## 2026-10-09 M1.13 — Layout shell (close)
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec fix round 1 + build → build review (incl. spec re-review) → close
- Result: (site) group + SiteShell, SkipLink, StarfieldSlot (empty), Container (`max-w-(--container-prose)`), Section, SectionHeading, placeholder SiteHeader (always opaque until M1.15) and SiteFooter, PageMessage/NotFoundContent/ErrorContent, error (retry) / not-found / global-error, viewport export, focus-ring outline-color fix, `captureRoute(page, route, testInfo, {scale,name,fullPage,animations})`. 74 e2e.
- QA verdict: PASS (4 minors: layout-shell §13.2 /dev/tokens wording, §13.1 main `flex-[1_0_auto]`, header.md §13 captureRoute argument order (M1.15 follows the new definition), optional `allowedDevOrigins: ["127.0.0.1"]` for dev HMR). Measured: prose 680px with fonts blocked and loaded, CLS ≤ 0.0001, global CSS 7.2 KB gz.
- Notes: The orchestrator removed the git-ignored firestore-debug.log. Not committed (commits paused). Design wording minors are queued for the next design pass.

## 2026-10-09 M1.15 — Header (spec amendments + build)
- Agent: tech-agent
- Step: spec amended for the QA [tech] minors 2, 3, 6 (changelog "Amended after spec review: QA minors 2, 3, 6") → build
- Result: `design/tech/M1.15-header.md` built into the repo; its 19 code blocks byte-match the repo and the §3.3 patch gives `app/globals.css` sha256 `d3e20528…a51124`. (2) New test `4b.`: invoker commands removed (prototype props deleted, `commandfor`/`command` stripped before hydration), then open / close button / Esc via `showModal()`/`close()`: focus to "Close menu" and back to "Menu", aria-expanded true/false. (3) New test `19.` (desktop-1440): at 1000px with a 15px classic scrollbar the bar width (985) and the menu/close right edges (953/953) don't move while the drawer is open; at 1100px it closes and focuses `[data-home-link]`. (6) Measured section refreshed from the repo build. New files: `components/layout/site-routes.ts`, `components/layout/header/{preview-context,styles}.ts`, `components/layout/header/{NavLink,AccountLink,BagButton,MobileMenu,HeaderScrollState}.tsx`, `components/icons/glyphs.tsx`, `types/react-invokers.d.ts`, `app/dev/header/{page,HeaderPreviewProvider,HeaderPreviewControls}.tsx`, `tests/e2e/header.spec.ts`; replaced `components/layout/{SiteHeader,SiteShell}.tsx`, `next.config.ts` (allowedDevOrigins 127.0.0.1), `app/dev/dev.css`, `tests/e2e/screenshots.spec.ts`; patched `app/globals.css`.
- Checks: tsc, typecheck, lint, format:check, plain build, check:client-bundle (18 files), smoke:firebase (under emulators:exec, 6 ok), approve-scripts (nothing pending, root and functions) all pass. `test:e2e` **124 passed, 8 skipped** (was 74). Header CLS 0.0000 (390/1440). Global CSS 40,618 B raw / 8,490 B gz (+1.3 KB gz); layout chunk 17,781 B raw / 6,622 B gz (header islands +3.3 KB gz per route); `/dev/header` dev chunk 19,758 / 7,203 B. Final plain build done; `/dev/header` is 404.
- Notes: No new dependency. PUSHBACK (minor, design-agent wording, spec §4.1): the scroll sentinel is the first child of `<main>`, positioned at the document top; proposed layout-shell §6.2 / header.md §13.1 wording "rendered at the start of `main`, positioned at the top of the document". Orchestrator: CLAUDE.md "Screenshots" line gains `dev-header-<project>.png` and the named shots `dev-header-bag-3`, `dev-header-bag-120`, `dev-header-menu-open` (390 only), `dev-header-scrolled`. Dev server on 3001 hot-reloaded: `/` and `/dev/header` 200; 3002 200. Not committed (commits paused).

## 2026-10-09 M1.15 — Header (close)
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review → build → build review → close
- Result: `components/layout/site-routes.ts` (the footer.md §3.2.1 registry, zero imports); SiteHeader (server) + NavLink/AccountLink/BagButton/MobileMenu/HeaderScrollState islands; native `<dialog>` drawer (invokers + showModal fallback); scroll sentinel at the start of main; /dev/header with preview provider and controls; `allowedDevOrigins: ["127.0.0.1"]`. 124 passed / 8 skipped.
- QA verdict: spec PASS (6 minors; tech ones fixed in the build, design ones applied); build PASS (3 minors → M1.17 build: (1) a focus-return test round with a programmatic (unfocused) open, (2) run check 19 with `ignoreDefaultArgs: ["--hide-scrollbars"]` so a real classic scrollbar is exercised, (3) header.md §8.1 "fading in once scrolled more than 8px" → next design pass). Measured: CLS 0, +3.3 KB gz JS per route, global CSS 8.5 KB gz.
- Notes: The orchestrator removed firestore-debug.log. Port 3000 is now held by another local project (PID 53736), not ours.

## 2026-10-09 M1.17 — Footer (tech spec)
- Agent: tech-agent
- Step: spec (prototype: 170 passed / 10 skipped)
- Result: `design/tech/M1.17-footer.md`: a registry-driven SiteFooter (the minimal sign-off in M1.17), NavLink footer/legal variants, a `preview` data object, /dev/footer + /minimal, social glyphs (white, forced-colors fill-current), footer.spec checks 1–15, build-year ©. Carried the M1.15 minors: unfocused-open focus-return rounds in 4/4b; check 19 moved to header-scrollbar.spec.ts with `ignoreDefaultArgs: ["--hide-scrollbars"]`.
- QA verdict: pending
- Notes: PUSHBACK accepted for M1.17 by the orchestrator: the Pinterest glyph comes from Pinterest's own CDN SVG (`s.pinimg.com/webapp/pinterest_favicon-…svg`), unaltered, white, because the official asset portal offers only EPS/PNG behind a login. Not shipped publicly (URLs null). **Pre-launch TODO:** the user downloads `P-Badge-White.eps` to confirm the outline. The Instagram glyph is official (Meta asset pack). Design follow-ups: the Instagram "Follow us" cue next to other networks; the minimal dev page intro copy.

## 2026-10-09 — Footer/header wording minors (M1.15/M1.17 reviews)
- Agent: design-agent
- Step: fix
- Result: footer.md: a visible "Follow us" label above the social list (body-sm text-secondary, 11.78:1 on bg-sunken, `aria-labelledby`, replacing the aria-label); a /dev/footer/minimal intro; glyph sources recorded (Instagram official; Pinterest CDN SVG + a pre-launch EPS check). header.md: "more than 8px" wording aligned.
- QA verdict: pending (folded into the next design-touching review)
- Notes: The orchestrator added TASKS M8.8a (social links go live + build the "Follow us" label + layout-shell §11 label + glyph confirmation).

## 2026-10-09 M1.17 — Footer (spec amendments + build)
- Agent: tech-agent
- Step: spec amended for the QA [tech] minors 4–5 (changelog "Amended after spec review: QA minors 4–5") → build
- Result: `design/tech/M1.17-footer.md` built into the repo; its 19 code blocks byte-match the repo and the five patches give the listed sha256 (`app/dev/dev.css`, `tests/e2e/{screenshots,shell,header}.spec.ts`, `design/tech/M1.15-header.md`). (4) `lib/site/social.ts` comment now names `app/dev/footer/preview-data.tsx`. (5) `components/layout/site-routes.ts` (still zero imports) gains pure `footerAccountSlot(entries, options)` and `footerEntries(entries, group, options)`; `footerGroup` delegates (unchanged behaviour). New Node-side `tests/e2e/site-routes.spec.ts` (plain `@playwright/test`, no page): account live / only sign-in live / neither / both live (account wins, never both), plus the preview registry; runs once in mobile-390. New files: `components/layout/footer/{preview-context.ts,FooterSlotOutline.tsx}`, `components/icons/{instagram,pinterest}.tsx`, `lib/site/social.ts`, `app/dev/footer/{page,preview-data,FooterPreviewProvider,FooterPreviewControls,FooterPreviewIntro}.tsx`, `app/dev/footer/minimal/page.tsx`, `tests/e2e/{footer,header-scrollbar,site-routes}.spec.ts`, `tests/e2e/support/{build,header}.ts`; replaced `components/layout/{SiteFooter,site-routes}.ts(x)`, `components/layout/header/NavLink.tsx`; patched `app/dev/dev.css`, `tests/e2e/{screenshots,shell,header}.spec.ts`, `design/tech/M1.15-header.md`. `app/globals.css` unchanged.
- Checks: tsc, typecheck, lint, format:check, plain build (7 static routes incl. `/dev/footer`, `/dev/footer/minimal`, both 404 in the plain build), check:client-bundle (20 files), smoke:firebase (under emulators:exec, 6 ok), approve-scripts (nothing pending, root and functions) all pass. `test:e2e` **171 passed, 11 skipped** (was 124 / 8). Footer CLS 0.0000 (`/`, `/dev/footer`, 390/1440); minimal footer 251px (390) / 334px (1440); check 19 `clientWidth` 985 → 1000 under the lock; forced colors: glyph fill = LinkText `rgb(0, 0, 159)`. Layout chunk 18,379 B raw / 6,699 B gz (+104 B gz per route); `/` 10 chunks, 189,725 B gz; global CSS 43,998 B raw / 9,086 B gz (+0.55 KB gz); dev CSS 31,821 / 5,468 B; `FooterSlotOutline` only in the `/dev/footer` chunk. Final plain build done.
- Notes: No new dependency. PUSHBACK (spec §4 item 1, accepted for M1.17): Pinterest glyph from Pinterest's CDN SVG; pre-launch the user confirms against `P-Badge-White.eps`. Design-agent: Instagram "Follow us" cue (spec §4 item 2); minimal-page intro copy (item 3). Orchestrator: CLAUDE.md "Screenshots" gains `dev-footer-<project>.png` and `dev-footer-minimal-<project>.png`; Commands can note `header-scrollbar.spec.ts` (real classic scrollbars) and the Node-side `site-routes.spec.ts`. Dev server on 3001 hot-reloaded: `/`, `/dev/footer`, `/dev/footer/minimal` 200; 3002 200. Not committed (commits paused).

## 2026-10-09 M1.17 — Footer (close)
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review → build → build review → close
- Result: A registry-driven SiteFooter (minimal sign-off on public pages: 0 links, © build year); NavLink footer/legal variants; /dev/footer + /minimal (static, preview provider); social glyphs (official Instagram; Pinterest CDN SVG, white); `footerAccountSlot`/`footerEntries` pure helpers + Node-only `site-routes.spec.ts`; `header-scrollbar.spec.ts` with a real classic scrollbar. 171 passed / 11 skipped.
- QA verdict: PASS (1 tech minor → M1.19: the /dev/footer/minimal per-page intro string; 1 deferred to M8.8a: the Follow-us label tests). Design post-pass (Follow us label spec, minimal intro, glyph sources, header "more than 8px") PASS with 2 doc minors (name M8.8a in footer.md; changelog traceability) → next design pass. A refactor equivalence probe found 0 mismatches over 49,152 combos.
- Notes: Footer CLS 0, +104 B gz JS per route.

## 2026-10-09 M1.19 — Starfield (tech spec)
- Agent: tech-agent
- Step: spec (prototype: 230 passed / 30 skipped; one header-check-4 timing flake under machine load, 6/6 on repeat)
- Result: `design/tech/M1.19-starfield.md`: pure `starfield-data.ts` (seed 20261009), server `StarfieldLayer`, lazy `StarfieldIsland` → `starfield-motion.ts` (2.49 KB gz), CSS §10, five static dev pages, tests 1–19. var(--sf-lo/hi) keyframes composite (no literal fallback needed). Slot 2.6 KB gz; HTML +7.75 KB gz per first load (mostly the inlined RSC copy); CLS 0.
- QA verdict: pending
- Notes: PUSHBACK approved by the orchestrator: the per-attempt budget can't hold under a 4× CPU throttle (elementFromPoint scales ~15×). Each path check runs in its own task; test 15 asserts ≤16 ms per task and no long task (unthrottled, both projects) plus a median ≤4 ms in a serial run; 4× numbers are reported, not asserted. → design-agent updates starfield.md §9/test 15. Design notes queued: test 12 viewport, §9 wording, §13.3 note, plus the as-built deviations (solid band min-h-lvh — QA to judge, four-point star y, segment-shortened line gaps, dim span wrapper).

## 2026-10-10 M1.19 — Starfield (spec review)
- Agent: qa-agent (first attempt was cut off by an API access error; re-run with the registered qa-agent type)
- Step: spec review
- Result: The spec equals the prototype byte for byte; 230 passed / 30 skipped (deliberate project scoping), no flakes; serial perf: motion chunk 2,493 B gz, twinkle 0 layouts/paints, sf-attempt median ≤1 ms, layer deltas 12/33, CLS 0; contrast cap 0.14 verified (text-muted 4.60); dev pages 404 in a plain build; all as-built deviations accepted (the solid band min-h-lvh is only on the dev page's own Section).
- QA verdict: PASS (6 minors). Orchestrator decisions: build now (1) the demo `refused` flag (no launch if any step refused), (2) the sky's RSC copy as one pre-built string (≈ −2.5 KB gz per first load), (3) a loader ≤0.6 KB gz assertion, (6) the streak colour via token color-mix; (4) offset the upper four-point stars: start side 6–8%, end side 8–10% (orchestrator design call, recorded by design-agent); (5) design-agent syncs starfield.md with the approved pushback and as-built deviations.
- Notes: The 3001/3002 preview servers were restarted after the session break.

## 2026-10-10 M1.19 — Starfield (spec amendments + build)
- Agent: tech-agent
- Step: spec amendments (QA minors 1–4, 6, re-prototyped) → build
- Result: `design/tech/M1.19-starfield.md` changelog "Amended after spec review: QA minors 1–4, 6", built byte for byte (14 new files, 8 patches incl. a new `components/icons/glyphs.tsx` patch exporting `FOUR_POINT_STAR_D`). (1) the demo carries `refused` through `attempt(step, refused)` and launches only in its third check's task when no check refused; (2) the sky's inside is one pre-built string from the pure data module (`dangerouslySetInnerHTML`, one shared `{ __html }` object, so the RSC payload has one text row instead of two element trees); DOM byte-identical to the JSX version; `/` HTML 105,612 → 68,357 B raw, 14,576 → 12,049 B gz (−2.53 KB gz), `index.rsc` 9,972 → 8,263 B gz; (3) loader module asserted ≤ 0.6 KB gz (721 B raw / 437 B gz); (4) upper four-point stars start y 6–8% / end y 8–10% (drawn 6.7 / 8.7%); (6) streak via `color-mix(in srgb, var(--color-star-core) 90%, transparent)`.
- Checks: tsc, typecheck, lint, format:check, plain build, check:client-bundle (21 files), test:e2e 230 passed / 30 skipped (twice), serial `@perf` 15 passed / 1 skipped (motion chunk 2,508 B gz, slot 2,614 B gz, sf-attempt median 1.4 / 2.6 ms, CLS 0), smoke:firebase under emulators:exec, approve-scripts nothing pending (root, functions), final plain build: all PASS.
- QA verdict: pending (build review)
- Notes: No new dependency. Dev server on 3001 hot-reloaded: `/` and `/dev/starfield` 200 and render the new sky; 3002 200. Not committed (commits paused).

## 2026-10-10 M1.19 — Starfield (close)
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review → build → build review → close
- Result: A server-rendered seeded sky (one pre-built string via dangerouslySetInnerHTML from constant data, tag() rejects &<>"'), a lazy motion island (2.5 KB gz) + loader (437 B gz), the twinkle on the compositor, a WAAPI falling star with the per-task corridor check and the demo `refused` flag, static/paused states, `html[data-motion="off"]` hook, five static dev pages. 230 passed / 30 skipped; serial @perf 15/1. `/` HTML 12,049 B gz (−2.53 KB vs JSX). CLS 0. The design spec is synced to as-built (QA PASS).
- QA verdict: PASS (2 test minors → next tech task: the streak screenshot must assert a streak is present; a test for the refused-then-clear demo case). One run under machine load had 3 timing failures that passed on re-run.
- Notes: All M1 visual tasks are complete. The orchestrator removed firestore-debug.log.

## 2026-10-10 M1.4 — Domain types, data models, converters (build) + M1.19 test minors
- Agent: tech-agent
- Step: build (spec QA PASSED, fix round 1)
- Result: `design/tech/M1.4-data-models.md` §4 built byte for byte: `lib/types/` (brand, money, catalog, user, cart, order, newsletter, index), new `lib/domain/` (validate, ids, email, schemas, derive-product, order-status), `lib/firebase/` (paths, converter-utils, converters.admin, converters.client, storage-url), `tests/unit/` (fixtures/catalog + 5 test files); `lib/types/.gitkeep` deleted. §5: the purity ESLint block (Node builtins via `builtinModules`, Firebase, lib/firebase, server-only/client-only/next/react) and the `test:unit` script. Re-base: `eslint.config.mjs` and `package.json` were unchanged since the prototype, so the edits applied verbatim (no conflict, no pushback). The catalog, shot list and manifest are unchanged; the fixtures validate (17 products, 6 collections). M1.19 QA test minors: the `dev-starfield-streak` shot now waits for an attached streak and asserts exactly one streak animation frozen at 700 ms (retrying on the next attempt); new test "12. demo refused then clear" (a MutationObserver removes the text cover once `data-sf-last-skip` is `text`: one refused check, `data-sf-streaks` unchanged, then +1 on the next attempt; it fails when the `refused` carry is removed). The M1.19 tech spec's test block was updated, with the changelog line "Post-build test hardening from QA".
- Checks: tsc, typecheck (incl. functions), lint, format:check, test:unit 39/39 (no emulator), plain build, check:client-bundle (21 files, output unchanged), test:e2e 232 passed / 30 skipped, smoke:firebase under emulators:exec (6 ok), approve-scripts nothing pending (root, functions), final plain build: all PASS. In a scratch copy: the purity probe gives 12 lint errors with `./email` allowed; a failing test file makes test:unit exit 1. lib/types + lib/domain pass tsc under the exact functions/tsconfig options.
- QA verdict: pending (build review)
- Notes: No new dependency. Open items carried from the spec: design-agent questions (§2: gift-set care notes, sizeKey labels); M1.5 (five composite indexes, the 20-line cart batch rules test, no extra get()/exists() in cart rules); M1.8 (lif-* crops, col-* JPEG export to /public, header size checks); M6.1 (Functions sharing mechanism and converter, partial refunds, payment after cancellation, guest-token expiry/referrer/logging). For CLAUDE.md: `npm run test:unit` and `/lib/domain`. Not committed (commits paused).

## 2026-10-10 M1.4 — Data models (close)
- Agent: tech-agent → qa-agent → orchestrator
- Step: build → build review → close
- Result: lib/types (branded IDs, money, catalog, cart, order, newsletter), lib/domain (parser kit, schemas, deriveProductFields, order state machine with a history-transition guard, email hash via Web Crypto), lib/firebase converters (admin/client), paths, storage-url; ESLint purity block; `npm run test:unit` (39/39). Also the M1.19 test hardening (streak screenshot presence; refused-then-clear demo test). e2e 232 passed / 30 skipped.
- QA verdict: PASS (2 tech minors → M1.5: ban dynamic `import()` in lib/types + lib/domain via no-restricted-syntax ImportExpression (or narrow the wording); M1.4 spec §6.1 step 6 count → 232/30). Mutations confirmed the tests catch regressions; no domain code in client bundles.
- Notes: CLAUDE.md updated (test:unit, /lib/domain, /tests/unit). The orchestrator removed firestore-debug.log.

## 2026-10-10 M1.5 — Security rules (tech spec)
- Agent: tech-agent
- Step: spec (prototype: test:rules 243/243; 18 rule mutations each caught)
- Result: `design/tech/M1.5-security-rules.md`: default-deny Firestore + Storage rules; published-only public reads; no client writes to products/collections/orders; the owner profile (exact keys) and cart lines (exact keys, one product get() → published + sku in skus[]); orders readable by the owner only (guest never); newsletter create-only with the sha256 doc ID recomputed in rules; Storage `products/{slug}/{file}` public read, admin-claim writes (png/jpeg/webp/avif, <10 MB); 5 composite indexes + 8 single-field exemptions (validated offline: the emulator doesn't load indexes).
- QA verdict: pending
- Notes: New dev dep (stack-implied): `@firebase/rules-unit-testing` 5.0.2 exact (6.x needs firebase 13), no install scripts. The cart 20-line limit can't be counted in rules: enforced by the client cap + merge (M5), the checkout Function (M6), and the 20 get()/batch limit (tests cover 20 ok / 21 distinct denied / 21 lines over 20 products allowed). Hand-offs: M5 client cap 20, merge in one cart-only batch, read with orderBy(addedAt)+limit(20); M6 Function refuses >20 lines; M2.6/M2.7 show success on a duplicate signup, dedupe NFC at send time. The admin draft read was dropped (no client path needs it). Extra: ESLint bans ImportExpression + TSImportType in lib/types/domain; the schemas image guard gains avif. Known flake: the starfield @perf CLS test (0.000006) under parallel load; serial @perf 45/45.

## 2026-10-10 M1.5 — Security rules (spec review)
- Agent: qa-agent
- Step: spec review (adversarial)
- Result: 10 blocks byte-identical; test:rules 243/243; e2e 232/30; 110 own attack probes: all draft/cart/profile/order/newsletter/storage attacks denied as specified (SVG uploads denied; admin:"true" denied) except Storage listing.
- QA verdict: PASS (5 tech minors, all built now): (1) **storage `allow read` includes list → anon `listAll("products")` leaks draft slugs + images: change to `allow get` + a test**; (2) the M5.5 merge hand-off; (3) ESLint: ban dynamic `import()`/import types of firebase/firebase-admin/@firebase/@google-cloud in the app/components/lib block now; (4) the EvaluationException wording (2 expected entries in firestore-debug.log); (5) a unit test for the avif storagePath guard (39 → 40).
- Notes: **M5.5 hand-off (cart merge):** read the server cart first; for existing lines keep the stored `addedAt` (or update only quantity + updatedAt); clamp merged quantities to 10; drop unknown/unpublished SKUs before committing the single cart-only batch. Pre-launch: App Check + a budget alert (unauthenticated newsletter creates and cart writes are cost vectors).

## 2026-10-10 M1.5 — Security rules (spec amendment + build)
- Agent: tech-agent
- Step: spec amended after spec review (QA minors 1–5), then build
- Result: Spec amended: (1) Storage `products/**` is `allow get` (no list), with 8 new tests (4 personas × list of `products/`, a product folder or the root ✗; exact-path get of a draft's image ✓); (2) the §1 Cart M5.5 merge hand-off (read the server cart first, keep `addedAt`, clamp to 10, drop unknown/unpublished SKUs, then one cart-only batch); (3) the app/components/lib ESLint block gets `no-restricted-syntax` for `ImportExpression` and `TSImportType` of firebase, firebase-admin, @firebase/* and @google-cloud/*; (4) the §5.1 step 4 EvaluationException wording; (5) a `storagePath` unit test (avif ✓, svg/gif ✗). Built into the repo: `firestore.rules`, `storage.rules`, `firestore.indexes.json`, `tests/rules/` (support/env + 6 files), `eslint.config.mjs`, `lib/domain/schemas.ts` (avif), `tests/unit/schemas.test.ts`, `package.json` (`test:rules`, dev dep) + lockfile; M1.4 spec §3 Storage row, §6.1 step 6 count and changelog. All §3/§4 blocks byte-match the repo.
- Checks: tsc, typecheck, lint, format:check, test:unit 40/40, test:rules 251/251 (21 suites, exit 0, 19 s; the console has no EvaluationException; firestore-debug.log has only the 2 expected entries at line 98:23), ESLint probes in a scratch copy (10 errors per file in components/app/lib, 0 in lib/firebase, 3 in lib/domain and lib/types), offline index validation `5 8` (a bad `order` is rejected), plain build, check:client-bundle (21 files), smoke:firebase 6 ok, final plain build: all PASS. approve-scripts: nothing pending (root, functions). test:e2e: run 1 gave 229 passed / 3 failed / 30 skipped; run 2 gave 230 passed / 2 failed / 30 skipped. Every failure was a load-sensitive starfield timing test (12 demo timing, 15 CLS @perf, 15 per-attempt budget @perf). `starfield.spec.ts` run serially (`--workers=1`): 56 passed / 14 skipped.
- QA verdict: pending (build review)
- Notes: The dependency `@firebase/rules-unit-testing` 5.0.2 was logged with the spec; it is now installed (the lockfile adds 1 package, with no install scripts). Accepted and noted for M7: a draft's image can still be fetched by anyone who knows its exact path, and the path is predictable (`products/<slug>/<id>.<ext>`). Removed emulator debug logs.

## 2026-10-10 M1.5 — Security rules (close) + e2e reliability finding
- Agent: qa-agent → orchestrator
- Step: build review → close
- Result: All 5 minors verified (storage get-only with list-denied tests; ESLint dynamic-import ban probed; avif unit test). test:rules 251/251, test:unit 40/40, smoke, build, client-bundle, index validation all pass. 110-probe attack file re-run against the real rules: P108 (listAll) now denied; all others unchanged.
- QA verdict: M1.5 PASS (2 minors, done by the orchestrator: M7.4 acceptance in TASKS.md; the audit delta logged here). **npm audit:** 20 (4 moderate / 16 high); the +1 high is @firebase/rules-unit-testing 5.0.2 itself (dev-only, via its firebase peer → @grpc/grpc-js 1.9.16, no advisory of its own; fix = 6.x with firebase 13); `--omit=dev` unchanged at the 4 known grpc-js highs. Draft-image residual risk: no draft images can exist before M7.4; M7.4 must use a staging prefix or unguessable IDs; M1.8 seeds draft products without images.
- Notes: **e2e reliability: FAIL (blocks the M1 gate, not M1.5).** QA's two full runs: 231/1 and 227/5 failures, all starfield wall-clock/CPU budgets (test 12 demo timing, test 15 main-thread/paint/per-attempt/compositor/CLS) under parallel load; serial `--workers=1 --repeat-each=2` passed 104/104. New task M1.20b before M1.6: a serial @perf pass after the parallel pass (keep every budget), tag or rewrite test 12, CLS shift-source diagnostics (keep CLS === 0 strict), waitForState 10 s → ~20 s, optional `--retries=1` on the @perf pass only.

## 2026-10-10 M1.20b — e2e reliability (spec review)
- Agent: tech-agent → qa-agent
- Step: spec → spec review
- Result: `scripts/e2e.ts`: one build, then a parallel `--grep-invert @perf` pass + a serial `--grep @perf --workers=1` pass (separate output/report dirs); test 12 / refused-then-clear / the streak shot rewritten to be clock-independent; layoutShifts() diagnostics; waitForState 20 s. All @perf budgets unchanged (QA diffed). Mutation probes a–d all caught.
- QA verdict: FAIL (1 blocking: firebase-tools usage-telemetry `withTimeout(5000)` makes `emulators:exec` exit 2 after green passes (2 of 9 runs); 3 minors: user `--grep`/`--workers` overrides the pass flags; starfield.md §14.5 test 12 (c) wording; stale ENABLE_DEV_PAGES comments in gate.ts / playwright.config.ts / CLAUDE.md).
- Notes: The orchestrator prefers a project-scoped fix (wrapper exit code from a recorded pass result, or a per-process telemetry opt-out), not a change to the user's global Firebase CLI setting. Fix round 1 → tech-agent.

## 2026-10-10 M1.20b — e2e reliability (spec amendment + build)
- Agent: tech-agent
- Step: spec amended after spec review (QA minors 1–2), then build
- Result: (1) `scripts/emulators-exec.ts` survives Ctrl+C: no-op SIGINT/SIGBREAK listeners plus async `spawn` (tsx's CLI process kills a child whose event loop is blocked in `spawnSync` 30 ms after a SIGINT, so listeners alone were not enough). It waits for firebase's clean shutdown, removes its temp folder and exits non-zero (first non-zero of recorded/firebase, else 1). Ctrl+Break can't be survived on Windows (tsx/npm die and libuv's kill-on-close job takes their children), so folders are named `starflames-emulators-exec-<pid>-*` and each run sweeps those whose pid is gone. Verified with real console control events (GenerateConsoleCtrlEvent) in a scratch copy: old script leaked the folder; amended: Ctrl+C → 130 / 1 (command exiting 0 after Ctrl+C) / `npm run test:rules` 1 / `npm run test:e2e` mid-pass 1 (no @perf pass started), all folders removed, ports free; Ctrl+Break → folder left, swept by the next run. (2) §3 `--only nosuch` evidence reworded (firebase's code: 1, or 2). Built into the repo: package.json (`test:rules`, `test:e2e`), playwright.config.ts, .env.example, app/dev/gate.ts, scripts/e2e.ts, scripts/emulators-exec.ts, tests/e2e/starfield.spec.ts, tests/e2e/support/starfield.ts, tests/e2e/support/layout-shift.ts. Resynced spec blocks: M1.19 §5.1 (support/starfield.ts, starfield.spec.ts), M1.13 (layout-shift.ts), M1.20 §3 (`test:e2e`, playwright.config.ts), each with a changelog line.
- Checks: tsc, typecheck, lint, format:check, test:unit 40/40, test:rules 251/251 exit 0; test:e2e ×3 all exit 0 (parallel 217/29 skipped, @perf 15/1 skipped each; 100/98/97 s; 40 screenshots + both reports each); smoke:firebase 6 ok; plain build; check:client-bundle (21 files); negative check (throwaway failing spec, deleted) exit 1; `--only nosuch` exit 1; final plain build. All PASS. Spec blocks byte-checked.
- QA verdict: pending (build review)
- Notes: No new dependency. Known limit (firebase-tools): `emulators:exec` has no SIGBREAK handler, so Ctrl+Break can leave the Java emulators on 6104–6109 running; documented in §1.1 and in the proposed CLAUDE.md `test:e2e` line. CLAUDE.md lines (spec §2) are for the orchestrator. starfield.md §14.5/§13.2 wording is design-agent's.

## 2026-10-10 M1.20b — e2e reliability (close)
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → review FAIL → fix round 1 → review PASS → build → build review → close
- Result: `scripts/e2e.ts` (one build, a parallel `--grep-invert @perf` pass + a serial `--grep @perf --workers=1` pass, separate outputs; reserved flags refused) and `scripts/emulators-exec.ts` (async spawn; the inner records its exit code via EMULATORS_EXEC_DIR; the outer exits with the recorded code, so firebase-tools' usage-telemetry exit 2 after a green run is ignored and logged; Ctrl+C never exits 0; pid-named temp folders + sweep) for test:e2e and test:rules. Starfield test 12, refused-then-clear and the streak shot are clock-independent; layoutShifts() diagnostics; waitForState 20 s. All @perf budgets unchanged.
- QA verdict: PASS. 3 consecutive full runs exit 0 (217/29 + 15/1, 40 screenshots); forced GA-hang probe → exit 0 with the "ignored" line; failing spec → 1; real Ctrl+C → non-zero, clean; starfield.md wording rewrite verified (5 hunks only). 1 minor: the Ctrl+Break wording → CLAUDE.md fixed by the orchestrator (Firestore Java on 6104–6105); tech spec :53 → next tech task.
- Notes: The functions-emulator "User code failed to load … Timeout after 10000" was machine load (discovery timeout; require() takes 280 ms). **M6 note:** keep Admin SDK and Stripe client creation lazy, inside handlers. The orchestrator removed firestore-debug.log (QA's delete was blocked by permissions).

## 2026-10-10 M1.6 — Repositories (tech spec)
- Agent: tech-agent
- Step: spec (prototype: test:unit 64, test:repos 14 against the emulator, rules 251, e2e 232/30; 8 mutations caught)
- Result: `design/tech/M1.6-repositories.md`: server-only cached repositories (`lib/firebase/repositories/catalog.ts`; uncached `catalog-reads.ts` ESLint-blocked for UI): getProducts, getProductBySlug, getProductsByCollection, getBestsellers, getRelatedProducts (one query, limit+1), getProductCardsBySlugs/getGiftSetContents (one getAll each), getCollections, getCollectionBySlug, slug lists. ProductCard projection (~1 KB) and ProductDetail. Every query filters published, plus an in-memory check. A static index-coverage test. unstable_cache + React cache(), tags `products`/`collections` (a Date codec for cache hits); `prebuild` clears the data cache. next.config images: an env-built remotePatterns + `dangerouslyAllowLocalIP` for demo-* emulators only.
- QA verdict: pending
- Notes: PUSHBACKs (forward): (1) builds need seeded emulator data + NEXT_PUBLIC env from M2.4 on → added to M1.8 acceptance in TASKS.md; (2) new M7 products have no page until a rebuild (dynamicParams=false) → M7 must trigger a rebuild or revisit; (3) multi-instance production needs a shared cache handler for revalidateTag → production-setup task.

## 2026-10-10 M1.6 — Repositories (spec amendment + build)
- Agent: tech-agent
- Step: spec amended after spec review (QA minors 1–9; changelog "Amended after spec review: QA minors 1–9"), then build
- Result: (1) `cachedRead` throws on a reused cache name (every wrapper has the same callback source, so the name is the only key separator); new `tests/repos/catalog-cache.test.ts` drives `catalog.ts` through a fake `globalThis.__incrementalCache` + `globalThis.AsyncLocalStorage` against the Firestore emulator: Dates on miss and hit, one entry per function and argument list, the related and gift-set argument mapping. (2) The slug lists use `select("status")` and re-check the status in memory (exported `publishedIds`, tested on an unfiltered query). (3) Related-products wording ("products listed in the product's primary collection (primary or alsoIn)"). (4) A source scan in `tests/unit/repository-indexes.test.ts` keeps `.where(`/`.orderBy(` inside `catalogQueries`. (5) Stale-data notes (build only through `npm run build`/`test:e2e`; in dev, hard-reload or delete `.next/dev/cache/fetch-cache`). (6–9) Forward notes. The repos fixtures moved to `tests/repos/fixtures.ts`. Carried the M1.20b line 53 wording fix. New files: `lib/firebase/repositories/{catalog,catalog-reads,cache-codec,cache-tags}.ts`, `scripts/clear-data-cache.mjs`, `tests/repos/{fixtures,catalog.test,catalog-cache.test}.ts`, `tests/unit/{repository-indexes,cache-codec}.test.ts`. Changed: `next.config.ts` (emulator `images.remotePatterns` + `dangerouslyAllowLocalIP`, demo-* only), `scripts/check-client-bundle.mjs`, `scripts/e2e.ts`, `lib/types/catalog.ts`, `lib/domain/derive-product.ts`, `tests/unit/derive-product.test.ts`, `eslint.config.mjs`, `package.json`. New scripts: `test:repos`, `prebuild`.
- Checks: tsc, typecheck, lint, format:check; test:unit 65/65; test:repos 19/19; test:rules 251/251; smoke 6 ok; plain build; check:client-bundle (21 files); test:e2e exit 0 (parallel 217 passed / 29 skipped, @perf 15 / 1 skipped, 40 screenshots; `clear data cache` step logged); final plain build. All PASS. Spec blocks byte-checked (12 blocks + the §3.1 patch). Mutations (scratch copy): related args swapped, a reused cache name (with and without the throw), `publishedIds` without its status check, inline `.where(`/`.orderBy(`, plus QA's set: all caught except the harmless `JSON.stringify(error)` log.
- QA verdict: pending (build review)
- Notes: No new dependency. Deviation: the cache test lives in `tests/repos/` (run by `test:repos`), not `tests/unit/`, because `catalog.ts` reads through `getAdminFirestore()` and needs the emulator. The orchestrator's `next dev` on 3001 still serves / with 200 after the next.config change.

## 2026-10-10 M1.6 — Repositories (close)
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review → build → build review → close
- Result: Server-only cached repositories (catalog.ts over catalog-reads.ts; unstable_cache + React cache(); tags products/collections; Date codec; duplicate-name guard), ProductCard/ProductDetail, published-only queries + in-memory re-check (slug lists via select("status") + publishedIds), one getAll for gift sets/cards, related = one query; a static index-coverage test + source scan; next.config images for the Storage emulator only (demo-* + emulators); `prebuild` clears the data cache; `npm run test:repos`. test:unit 65, test:repos 19, rules 251, e2e 232/30.
- QA verdict: PASS (1 minor → M1.8: design/tech/M1.20b-e2e-reliability.md:80 Ctrl+Break wording). Mutation probes all caught; image optimizer: emulator 200, all others 400. Caveat: catalog-cache.test drives Next internals, so re-check on any Next upgrade.
- Notes: Forward notes recorded in the M1.6 spec (M5 cart cap ≤100 or chunk; M7 `{ expire: 0 }` for price/stock and `dynamicParams = true` is safe; production shared cacheHandler + versioned keys). CLAUDE.md updated (test:repos, prebuild).

## 2026-10-10 M1.8 — Seed script (spec review + user decisions)
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review
- Result: `design/tech/M1.8-seed.md`: `npm run seed` (emulator-only; refuses non-demo even with the allow flag; fixed timestamps; md5-skip uploads; `--reset` scoped to products/collections/Storage products/), seed-only fixtures (one draft, one archived), `npm run images:build` (lif crops + /public JPEGs via sharp), cache clearing, the e2e `.env.example` fallback + seed-before-build, the `build-preflight.mjs` hand-off, `npm run test:seed` (19).
- QA verdict: PASS (6 tech minors: refuse non-loopback emulator hosts; name the preflight hand-off task (TASKS.md updated by the orchestrator: M2.3 or M2.4); "under 1 s" + the section cite; production seed must exclude fixtures; CLAUDE.md wording merge; devOptional sentence). Safety probes: every non-demo / missing-host case refused with no DNS/TCP to Google.
- Notes: **User decisions 2026-10-10:** (1) `sharp` 0.35.5 devDependency **approved** (already installed under next; no install script); (2) **`assets/` stays local only** (git-ignored, ~137 MB originals + crops); a fresh clone needs the images copied in before seed/test:seed/test:e2e; `public/images/*.jpg` (4.4 MB) stays committed; (3) C2PA provenance stripping in served images is fine for now (revisit before launch with art §11.2).

## 2026-10-10 M1.8 — Seed script (spec amendment + build)
- Agent: tech-agent
- Step: spec amended (changelog "Amended after spec review: QA minors 1–6 + user decisions"), prototype updated, then build
- Result: (1) `runSeed` refuses Admin emulator hosts that aren't loopback (127.0.0.1/localhost/::1) from the string, before any DNS lookup or reachability check; new CLI test with a DNS-forbidding preload (`tests/seed/forbid-dns.mjs`); (2) preflight hand-off = first task that calls a repository from a page (M2.3 if featured collections read Firestore, else M2.4); (3) "under 1 s" + §1.6/§2.3 cite; (4) forward note: a production seed must exclude `scripts/seed/fixtures.ts`; (5) CLAUDE.md wording merged (spec §1.11); (6) devOptional sentence corrected. Carried M1.20b:80 wording applied. New: `scripts/seed/{index,seed,catalog,fixtures,images,image-size}.ts` (catalog mapping moved from `tests/unit/fixtures/`, 7 importers updated), `scripts/images/build-images.ts`, `tests/seed/seed.test.ts`, `tests/unit/seed-images.test.ts`, `tests/e2e/seed-images.spec.ts`; `scripts/e2e.ts` loads `.env.example` when `.env.local` is missing and seeds before the build. Generated by `npm run images:build`: 6 `lif-*` crops in `assets/images/product-lifestyle/` (local) and 8 JPEGs in `public/images/{hero,collections}/` (4,420,120 B, committed).
- New scripts: `npm run seed` (`-- --reset`), `npm run images:build`, `npm run test:seed`; `test:e2e:ui` seeds first.
- Dependency: `sharp` 0.35.5 exact devDependency (user-approved 2026-10-10). `npm ls sharp`: one copy (next's is deduped). Lock: root devDependencies entry; `sharp`, `sharp/node_modules/semver`, `@img/colour` flip optional → devOptional; `@img/sharp-*` stay optional. approve-scripts: nothing pending (root, functions).
- .gitignore: `/assets/**`, `!/assets/images/`, `!/assets/images/manifest.json` (assets local only; the manifest stays committed because the catalog mapping and the unit/rules/repository tests read it). Fresh clone: `images:build`, `seed`, `test:seed`, `test:e2e` and one unit test stop with "… copy assets/images/ from a machine that has the generated originals, then run `npm run images:build`."; plain build passes.
- Checks: tsc, typecheck, lint, format:check, test:unit 70/70, test:seed 20/20, test:repos 19/19, test:rules 251/251, smoke:firebase 6 ok, plain build (no emulators), check:client-bundle (21 files), test:e2e exit 0 (parallel 218 passed / 30 skipped, @perf 15 / 1 skipped, 40 screenshots), images:build re-run 0 written, fresh-clone simulation (message as above, test:unit 69/70, build passes), final plain build: all PASS. Spec blocks byte-checked (10 file blocks; 4 diffs reverse-apply).
- QA verdict: pending (build review)
- Notes: CLAUDE.md wording for the orchestrator is in spec §1.11.

## 2026-10-10 — GitHub
- Agent: orchestrator
- Step: setup
- Result: The user provided the GitHub remote. Repo-local git identity `zikkops <zikkops@users.noreply.github.com>` (user choice). Added README.md, committed everything as `feat: M1 foundation` (87c119b; 210 files, ~7.6 MB, no secrets, `assets/` originals excluded per the user's local-only decision) and pushed to `origin/main` (https://github.com/zikkops/starflame.git).
- QA verdict: n/a
- Notes: Per-task commits + push resumed (CLAUDE.md loop step 7 updated). The M1.8 build review was still running at commit time; its close gets its own commit.

## 2026-10-10 M1.8 — Seed script (close) — M1 complete
- Agent: tech-agent → qa-agent → orchestrator
- Step: spec → spec review → build → build review → close
- Result: `npm run seed` (emulator-only, loopback hosts only, fixed timestamps, md5-skip uploads, `--reset`), seed-only fixtures (draft + archived), `npm run images:build` (sharp: 6 lif crops, 8 /public JPEGs), cache clearing, e2e seeds before building with the `.env.example` fallback, `scripts/build-preflight.mjs` hand-off for M2.3/M2.4, `npm run test:seed` (20). `assets/` git-ignored except manifest.json.
- QA verdict: PASS (2 minors: the TASKS.md M1.8 wording (fixed at tick); optional: the seed CLI guard tests should run independently of the seeded hook on a fresh clone). Consolidated M1 run all green: tsc, typecheck, lint, format, unit 70, seed 20, repos 19, rules 251, smoke 6, plain build, client-bundle, e2e 218/30 + @perf 15/1, 40 screenshots; images:build idempotent; audit at the 20 baseline (sharp added none). Safety probes: zero DNS/TCP for every non-demo/non-loopback case. A real fresh `git clone` of HEAD gives the clear "copy assets/images" message.
- Notes: **M1 Foundation complete (23/23).** Stopping for the M1 gate. Items for the user at the gate: 7 flagged dev-placeholder images; C2PA stripping; assets/ local-only for other machines; pre-launch TODOs (Pinterest EPS, legal trading name, USD currency); 4 known high advisories in prod deps (firebase → grpc-js); the starfield brightness (0.14 cap) check; confirm the resumed-commits CLAUDE.md step 7 (user-instructed 2026-10-10).

## 2026-10-10 — M1 gate
- Agent: orchestrator
- Step: milestone gate
- Result: M1 summary + 26 screenshots (http://localhost:3002/m1) shown to the user. The user said "CONTINUE".
- QA verdict: n/a
- Notes: The user didn't answer the open questions, so the stated defaults apply: "Bag"; USD; © "Starflames"; starfield kept subtle (0.14 cap); no hand-poured/maker claim (brand-story image stays on hold); Gilded Plum shimmer kept as [confirm with user]; search later; socials hidden. **Blocked on the user:** M2.5a/M2.5b privacy policy text (legal text from the user/adviser) → M2.7 newsletter (consent links to /privacy) waits for it. M2 proceeds with M2.1–M2.6.

## 2026-10-10 M2.1 — Home page spec
- Agent: design-agent → qa-agent
- Step: spec → spec review
- Result: `design/pages/home.md` (859 lines): hero (feathered photo carries the glow; in-page anchor CTAs; LCP option b), featured collections (6 non-link cards until M3.7), bestsellers (2 bestsellers + 2 newest, honest eyebrow; the product card baseline for M3.1; no bag/links until M4/M5), brand story (SVG motif, no maker claims), newsletter omitted until M2.5a/b + M2.7. design-agent's report didn't arrive; the spec file was complete.
- QA verdict: FAIL (1 blocking: taglines/short descriptions use type-body-sm beyond its 2-line limit; 11 design minors: glow radius vs art-direction §4.3, CTA glow footprint contents, badge order on home, `moodImage` field name, hero hgroup DOM, the SVG stroke at base, the capped-width bleed edge, the h2 for a mixed bestseller row, the eyebrow/subcopy repetition, newsletter band vs art-direction/tokens wording, the collections top-padding rule; 1 tech note: add gsap in M2.2). Contrast, hero pixel sampling, LCP areas, sizes, haze and no-dead-link checks all pass.
- Notes: Defaults applied for the user questions (no answer yet): hero CTAs stay in-page jumps; newsletter on sunken; the 2+2 bestseller fill; product URL `/products/{slug}` (M4.1 confirms); hero-mobile regeneration pre-launch. Fix round 1 → design-agent.

## 2026-10-10 M2.1 — Home page spec (re-review, fix round 1)
- Agent: design-agent → qa-agent
- Step: fix round 1 → spec re-review
- Result: All 12 round-0 issues addressed (type-body on cards with 2-up bestsellers at md; the glow deviation documented in home + art-direction; the CTA/link 32px gap; the qualifying badge rule; moodImage; hgroup; SVG strokes; the capped box; "Favorites and new flames" / "Shop favorites"; subcopy; newsletter on sunken across tokens/art-direction; the hero bottom-padding override). Tokens values unchanged (c8.js).
- QA verdict: FAIL (1 blocking: layout-shell §5.1 allows a hero to override only its TOP spacing, and solid→plain collapses the next band's top, so home's bottom-0 override plus the collapse leaves no gap → amend layout-shell §5.1; 6 minors: card-height ranges, the longest description (Ink & Cedar, 6 lines at base), the lg card 218/186, the subcopy 4 lines at 390 (or text-wrap), the 2560 gap 414px, the shot-list/tokens haze wording).
- Notes: Fix round 2 of max 3 → design-agent. US English confirmed as the site's spelling (catalog.md:37).

## 2026-10-10 M2.1 — Home page spec (close)
- Agent: design-agent → qa-agent → orchestrator
- Step: spec → FAIL → fix round 1 → FAIL → fix round 2 → PASS → close
- Result: `design/pages/home.md`: hero (feathered photo, glow follows the candle, in-page CTAs "Shop favorites"/"Explore collections", LCP = image), featured collections (6 non-link arched cards until M3.7), bestsellers (2 + 2 newest, "Favorites and new flames" when mixed; the product card baseline for M3.1; no bag/links until M4/M5), brand story (SVG motif, no maker claims), newsletter omitted until M2.5a/b + M2.7. layout-shell §5.1 amended (a hero may override top and bottom spacing; the collapse keeps the next band's top when the hero ends at 0). tokens rule 7 / §2.6 and art-direction §4.3/§5 aligned.
- QA verdict: PASS (3 design minors → design-agent now: the Comet Season card sum 406.7; subcopy line counts at 768/1440 (2 lines, 45ch measure); collections xl sizes 187px).
- Notes: M2.2 carries: add `gsap` (stack-approved) and log it; fix the M1.13 collapse selector (hero `data-flush-end` so the collections band keeps its top padding) + shell test case; subcopy `max-w-measure-intro` + `text-wrap: pretty`.

## 2026-10-10 M2.2 — Hero (tech spec)
- Agent: tech-agent
- Step: spec (prototype: unit 74, seed 20 + a separate seed-cli file, e2e 269/35 + 15/1, 52 screenshots)
- Result: `design/tech/M2.2-hero.md`: HomeHero (art-directed `<picture>` via getImageProps, eager + fetchPriority high, CSS-mask feather, glow behind the image ≥md), `heroActions()` (no CTAs on `/` until M2.3/M2.4 add the target sections), `/dev/hero` with both CTAs, `primaryButtonClasses({glow})`, the HomeMotion island (gsap core, matchMedia, hero-pending, data-motion off), the collapse fix (`data-flush-end`), home SEO metadata. LCP = image at 390/1440; CLS 0.
- QA verdict: pending
- Notes: **New dependency (approved stack):** `gsap` 3.15.0 exact (no install script, no deps, GSAP Standard no-charge license; audit unchanged at 20). **Cost: +27.3 KB gz JS on `/`** — the orchestrator asked QA to weigh it against a CSS-only hero entrance. PUSHBACK 1 approved (layout-shell §5.1 rules): the hero keeps its bottom padding while it is the last band → design-agent adds the sentence to home §2.3. Note 2 (UX): on slow 4G + 4× CPU, the hero text/CTAs reveal at ~2.8 s vs the image at ~1.7 s → routed to design-agent (keep the CTA group un-hidden below md, or shorten the fallback).

## 2026-10-10 M2.2 — Hero (spec review) + design follow-ups
- Agent: qa-agent; design-agent
- Step: spec review; design follow-up
- Result: Tech checks all pass (byte-compare, 12 diffs, e2e 269/35 + 15/1, screenshots match home §3, LCP = image, CLS 0, contrast AA, no dead links, the collapse fix, metadata, gsap pin). design-agent (in parallel) rewrote motion.md §5.1 + home §3.6/§9 to a **CSS-only first-paint hero entrance** (keyframes `hero-reveal`, `--reveal-order`, no-preference only, outside data-motion off; retires the hero-pending head script + 2.5 s timer; gsap + ScrollTrigger lazy from M2.3), and added the PUSHBACK 1 padding sentence to home §2.3.
- QA verdict: FAIL (1 blocking [design]: the hydration-gated entrance reveals the text/CTAs 0.8–2.2 s after the LCP image on slow 4G and is nondeterministic → the CSS-only entrance (QA simulated: ends at FCP + 0.90 s); 5 tech minors: drop gsap on `/` for now; the 768@DPR2 hero fetches w=3840 (100 KB): state or tune `sizes`; a `/` starfield-paused check; the support/hero.ts comment; M2.3 hand-off caveats (e2e 13 flip; the collections band must be a later sibling); 1 design minor: starfield.md §9 "on /" wording).
- Notes: The orchestrator runs the QA spec review of design-agent's motion.md/home.md change and tech-agent's M2.2 spec revision in parallel. A harness note flagged QA's mention of `.claude/settings.local.json` in the prototype listing: a file-list mention only, nothing to act on.

## 2026-10-10 — Re-plan: visual site first
- Agent: orchestrator
- Step: plan
- Result: At the user's request, a priority block at the top of TASKS.md reorders the remaining work: Phase A home (M2.2–M2.5), Phase B shop & product (M3, M4), Phase C bag/checkout/info pages UI-only (M5.1/5.3/5.4 client-only bag, M6.2 checkout UI with the stub, M8.1–M8.8), Phase D backend (auth logic, bag sync, account/order history, checkout Functions, webhooks, email, admin, newsletter/legal pages, final QA). Screenshot gates after A, B, C. The design track writes specs ahead.
- QA verdict: n/a
- Notes: The user asked about speed; the faster QA mode (combined spec+build review for low-risk pages) was offered, not yet chosen, so the current rigor stays.

## 2026-10-10 — Re-plan: Phase D in depth
- Agent: orchestrator
- Step: plan
- Result: The user asked to "go deeper in everything else" after the visual site. Added a "Phase D in depth" block to TASKS.md (D1 accounts, D2 bag + inventory, D3 checkout/orders/state machine/shipping/tax, D4 admin audit + image pipeline, D5 newsletter double opt-in + consent, D6 hardening: security headers, App Check, axe audit, perf budgets, errors, backups, deploy plan). Full QA rigor on every Phase D task; the faster QA mode is not adopted.
- QA verdict: n/a
- Notes: Items needing user approval are flagged: Stripe, App Check on a real project, any monitoring service, deploy.

## 2026-10-10 — M2.2 Hero: spec fix round 1 → PASS
- Agent: tech-agent (spec fix), design-agent (CSS entrance minors), qa-agent (re-review)
- Step: spec review
- Result: design/tech/M2.2-hero.md revised to the CSS-only first-paint entrance (motion.md §5.1): @keyframes hero-reveal, [data-hero-reveal] with --reveal-order classes, gated on prefers-reduced-motion: no-preference and html:not([data-motion="off"]). Retired app/hero-pending.ts, the head script, suppressHydrationWarning and the .hero-pending rule. gsap dropped from M2.2 (moves to M2.3). Probe (slow 4G, 4× CPU, 390, /dev/hero, 5 runs): FCP 864 ms, last reveal animation end FCP + 889 ms (882–889; ≤ 1,000 ms), animationend FCP + 907 ms, LCP hero img 1,764 ms, CLS 0. First-load JS on / is unchanged from M1 (190,082 B gzipped). Prototype e2e: 266 passed / 34 skipped, @perf 15 passed.
- QA verdict: PASS (spec), 3 non-blocking minors: (1) [design] home.md §3.9 sizes 134vw over-fetches w=3840 at exactly 768@2x; 133.3vw would fetch w=2048 (−33%). (2) [tech] e2e 15's 1.5 s DOMContentLoaded bound is a wall-clock budget, so move it to @perf. (3) [tech] Known flake: one HTTP 500 for a static chunk from next start in prototype run 1 (shell.spec 400% zoom), not reproduced; investigate if it recurs.
- Notes: PUSHBACK 1 resolved. No new dependencies.

## 2026-10-10 — M3.1 Product card spec: review → FAIL (round 1)
- Agent: design-agent (spec), qa-agent (review)
- Step: spec review
- Result: design/components/product-card.md written. It uses only ProductCard projection fields, a stretched-name-link card with a sibling QuickAdd island behind features["quick-add"], badges Sold out/Limited/New/Bestseller (max 2), and shop/collection grids 2/3/3/4.
- QA verdict: FAIL. Blocking: (1) the "Product links on" client checkbox can't toggle a Server Component's <a>; (2) the synthetic missing-image card's Storage 4xx trips the M1.20 fixture, contradicting check 21. Minors 3–14: footer.md §3.2.2 rows + home.md §6 pointer, ::after radius, double focus ring, the 8px target-spacing exception, the 3-col list grid exception, CART_LIMITS + lines-full copy, reduced-motion transitions, sold-out for screen readers, message length at 320, locator scoping/unique ids, a description-rule e2e check, the M5.4/M4.3 flag wording.
- Notes: User questions (§16) have defaults in force; asked the user. design-agent has no Edit tool; the orchestrator applies its exact replacements to other files.

## 2026-10-10 — M2.2 Hero: build → PASS, closed
- Agent: tech-agent (build), qa-agent (build review)
- Step: close
- Result: Hero built per design/tech/M2.2-hero.md: HomeHero, hero-actions, ui/button, /dev/hero, home.spec.ts, a CSS-only entrance; app/hero-pending.ts retired. Sizes `(min-width: 64rem) 81vw, 133.3vw` (768@2x → w=2048, e2e 4b). e2e 15 split, with the 1.5 s bound in @perf 15b. M1.11/M1.13 tech specs carry the "superseded by M2.2" notes and the band blocks are resynced. QA re-ran build/lint/tsc/client-bundle/e2e (267 passed / 35 skipped; @perf 17/1), contrast AA, keyboard/focus, alt, reduced motion, CLS 0, LCP hero img, no gsap, no Firebase changes, IP clean. First-load JS on / is +0 B vs M1. The HTTP 500 flake was not seen.
- QA verdict: PASS. 1 non-blocking minor for M2.3: tests/e2e/home.spec.ts:383 test title says "press colour" but doesn't assert the active state (ember-500 + scale 0.98). Assert it or retitle.
- Notes: No new dependencies. CLAUDE.md Commands updated (dev-hero screenshots, home.spec.ts, /dev/hero, seed-cli tests). Stray firestore-debug.log deleted.

## 2026-10-10 — M3.1 Product card spec: fix round 1 → PASS, closed
- Agent: design-agent (fix round 1), qa-agent (re-review)
- Step: spec review
- Result: All 14 round-1 issues resolved: two static preview routes (/dev/product-card and /dev/product-card/flags-off) instead of client toggles; a fixed never-uploaded missing-image object with a narrow shared expectedIssues; the ::after ring with radius-md and the link outline none; a ≥12px no-action strip around quick add (check 24); the 3-col md grid exception; CART_LIMITS with full/limit states; reduced-motion transition none; visually hidden ", sold out"; the 320px message exception; scoped locators and useId; check 23 for the description rule. The orchestrator applied design's replacements to footer.md §3.2.2 (product-pages M4.3, quick-add M5.4 rows) and home.md §6 (pointer to product-card.md).
- QA verdict: PASS. 5 non-blocking minors routed to design-agent as post-pass: (1) the synthetic image is storagePath + storageObjectUrl, not a raw relative src (:625); (2) check 9 must scroll into view and wait for the ≥400 image response (:653); (3) the pending accessible name "Adding… to bag, {name}" (:219, :457); (4) check 24 "root or a descendant" (:668); (5) the preview routes get their own test.describe with test.use({ expectedIssues }) instead of joining ROUTES (:630).
- Notes: §16 user questions are pending with defaults in force (smallest size, no description on phone shop grids, no sale prices, /products/{slug}). M3.2 build is queued after Phase A on the tech track.
