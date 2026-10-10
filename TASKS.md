# TASKS

Milestone-ordered. One task at a time, through the full loop in `CLAUDE.md`. Spec owner: **D** = design-agent, **T** = tech-agent (technical spec). Stop for user review at the end of each milestone.

## M1 Foundation

- [x] M1.1 (T) Scaffold Next.js (App Router, TS strict, Tailwind, ESLint + Prettier), `.env.example`, `.gitignore`, `git init`, npm scripts
- [x] M1.2 (T) Firebase config + Emulator Suite (`firebase.json`, `demo-starflames`, Firestore/Auth/Storage/Functions emulators, `npm run emulators`)
- [x] M1.3 (T) Firebase SDK init in `/lib/firebase` (Admin server-only, client lazy) with emulator wiring

Visuals first (user request, 2026-10-09). Two parallel tracks; within a track, one task at a time. A build task starts only after its spec has passed QA.

**Design track**
- [x] M1.9 (D) Design tokens: color, spacing, radius, shadow, motion, breakpoints, with contrast table
- [x] M1.10 (D) Typography system: wordmark script, display serif, body sans, type scale
- [x] M1.7 (D) Seed catalog copy: original collections, product names, descriptions, scent notes (IP-checked) — moved up so images can be generated (user request 2026-10-09)
- [x] M1.7b (D) Art direction + image shot list: AI-generated imagery (Higgsfield, user-approved source) for products, collections and hero/mood; exact prompts, aspect ratios, IP/brand rules
- [x] M1.7c (orchestrator) Generate images on Higgsfield after the spend is approved; save originals to `assets/images/`
- [x] M1.12 (D) Layout shell spec: page container, grid, skip link, landmarks
- [x] M1.14 (D) Header spec: wordmark, nav, cart button, mobile menu (reopened and re-passed 2026-10-09)
- [x] M1.16 (D) Footer spec: links, newsletter teaser slot, socials, legal
- [x] M1.18 (D) Starfield background spec: layers, particles, falling stars, reduced-motion fallback

**Tech track**
- [x] M1.20 (T) Playwright setup: smoke test + 390/1440 screenshot harness (`npm run test:e2e`); also carries the M1.3 QA minors 2–3
- [x] M1.11 (T) Implement tokens + fonts in Tailwind/`next/font`; token preview page (dev only) — needs M1.9, M1.10
- [x] M1.13 (T) Implement layout shell — needs M1.12
- [x] M1.15 (T) Implement header — needs M1.14
- [x] M1.17 (T) Implement footer — needs M1.16
- [x] M1.19 (T) Implement starfield background (CSS + WAAPI per starfield.md; GSAP allowed but not required; no CLS, perf-budgeted) — needs M1.18
- [x] M1.4 (T) Domain types + Firestore data models + converters (Product, Variant, Collection, Order, User, Cart, NewsletterSignup)
- [x] M1.5 (T) Firestore + Storage security rules, `firestore.indexes.json`, rules test suite (`npm run test:rules`)
- [x] M1.20b (T) e2e reliability: run @perf/timing tests in a serial pass (workers 1) after the parallel pass; tag/rewrite starfield test 12; CLS diagnostics; waitForState timeout. Blocks the M1 gate
- [x] M1.6 (T) Repositories (`getProducts`, `getProductBySlug`, `getCollections`, `getCollectionBySlug`, ...)
- [x] M1.8 (T) Seed script with typed mock products + the generated imagery into the emulator (`npm run seed`) — needs M1.7. Acceptance also: lif crops + /public JPEG export + header size checks (M1.4); draft products seeded without images; the seed clears the Next data cache; the e2e build loads `.env.example` when `.env.local` is missing and seeds before building; a plain build without emulators fails loudly from the first task that calls a repository from a page (hand-off: `scripts/build-preflight.mjs`, M2.3/M2.4) (M1.6 pushback 1)

- [x] **M1 gate:** summary + screenshots to user

## M2 Home

- [ ] M2.1 (D) Home page spec (section order, copy, motion)
- [ ] M2.2 (T) Hero
- [ ] M2.3 (T) Featured collections — if this is the first page that reads a repository, enable `scripts/build-preflight.mjs` in `prebuild` (M1.8 hand-off; otherwise M2.4 does)
- [ ] M2.4 (T) Bestsellers (query + index) — enable `scripts/build-preflight.mjs` in `prebuild` if M2.3 did not (M1.8 hand-off)
- [ ] M2.5 (T) Brand story section
- [ ] M2.5a (D) Privacy policy page spec (route `/privacy`; legal text supplied by the user) — needed before the newsletter consent line
- [ ] M2.5b (T) Implement Privacy policy page
- [ ] M2.6 (D) Newsletter component spec (states, validation, consent copy)
- [ ] M2.7 (T) Newsletter signup saved to Firestore (rules-validated, duplicate-safe)
- [ ] **M2 gate:** summary + screenshots to user

## M3 Catalog

- [ ] M3.1 (D) Product card spec (image arch, price, variants hint, badges, quick add)
- [ ] M3.2 (T) Implement product card
- [ ] M3.3 (D) Shop page spec: filters (scent family, type, size, collection, price), sort, empty state, mobile filter sheet
- [ ] M3.4 (T) Filter query design: Firestore queries, indexes, pagination, URL params
- [ ] M3.5 (T) Implement shop page
- [ ] M3.6 (D) Collection page spec — includes a `/collections` index page; routes are `/collections/[slug]` (route registry: footer.md §3.2.1)
- [ ] M3.7 (T) Implement collection pages (static params + revalidation)
- [ ] **M3 gate:** summary + screenshots to user

## M4 Product

- [ ] M4.1 (D) Product detail spec: gallery, scent notes (top/heart/base), burn time, size variants, add to cart, care info
- [ ] M4.2 (T) Implement gallery
- [ ] M4.3 (T) Implement product info, variants, add to cart (cart store stub)
- [ ] M4.4 (D) Related products spec
- [ ] M4.5 (T) Implement related products (efficient query)
- [ ] **M4 gate:** summary + screenshots to user

## M5 Accounts & cart

- [ ] M5.1 (D) Auth pages spec: sign up, sign in, Google, reset password, errors
- [ ] M5.2 (T) Implement Firebase Auth (email + Google), session handling for Server Components
- [ ] M5.3 (D) Cart drawer + cart page spec
- [ ] M5.4 (T) Cart store (client state + localStorage) + drawer + cart page
- [ ] M5.5 (T) Cart sync to Firestore on sign-in (merge strategy, rules)
- [ ] M5.6 (D) Account page spec: profile, order history, empty states
- [ ] M5.7 (T) Implement account page with order history
- [ ] **M5 gate:** summary + screenshots to user

## M6 Checkout

- [ ] M6.0a (D) Terms & conditions + Shipping & returns page specs (routes `/terms`, `/shipping-and-returns`; legal text supplied by the user)
- [ ] M6.0b (T) Implement Terms + Shipping & returns pages
- [ ] M6.1 (T) Checkout technical spec: Function contract, stubbed payment interface, order schema, idempotency, price re-validation server-side
- [ ] M6.2 (D) Checkout + confirmation page spec (guest and signed-in)
- [ ] M6.3 (T) Checkout Cloud Function + order creation (stub payment)
- [ ] M6.4 (T) Payment webhook Function (stub) + order status transitions
- [ ] M6.5 (T) Checkout page + confirmation page
- [ ] M6.6 (T) Order confirmation email hook (stub, no paid service)
- [ ] **M6 gate:** summary + screenshots to user. Ask about Stripe approval.

## M7 Admin

- [ ] M7.1 (T) Admin auth: custom claim script, route protection, rules tests
- [ ] M7.2 (D) Admin UI spec: product list, editor, image upload, order list/detail
- [ ] M7.3 (T) Product add/edit/archive
- [ ] M7.4 (T) Image upload to Storage — acceptance: unpublished images are not publicly gettable (staging prefix with admin-only get + copy on publish via Admin SDK, or unguessable IDs), with rules tests
- [ ] M7.5 (T) Orders view + status updates
- [ ] **M7 gate:** summary + screenshots to user

## M8 Polish

- [ ] M8.1 (D) About ("Our story", route `/our-story`), FAQ, Contact page specs + copy
- [ ] M8.2 (T) Implement About, FAQ, Contact
- [ ] M8.3 (D) Gift sets page spec — enrich `/collections/gift-sets` (no separate `/gift-sets` route; route registry: footer.md §3.2.1)
- [ ] M8.4 (T) Implement gift sets page
- [ ] M8.5 (D) SEO metadata + OG image spec (copy, IP-checked)
- [ ] M8.6 (T) Metadata, sitemap, robots, OG images
- [ ] M8.7 (D) 404 page spec
- [ ] M8.8 (T) Implement 404
- [ ] M8.8a (T) Social links go live: set the user-provided Instagram/Pinterest URLs in `lib/site/social.ts`, build the visible "Follow us" label (footer.md §2.5, check 7), confirm glyph sources (P-Badge-White.eps), update layout-shell.md §11 reserved label → "Follow us"
- [ ] M8.8b (D+T) Site-wide "Pause animations" control (WCAG 2.2.2; required before public launch; hooks into `html[data-motion="off"]` from M1.19)
- [ ] M8.9 Final full-site QA pass (all checks, all pages, both widths)
- [ ] **M8 gate:** final summary + screenshots to user
