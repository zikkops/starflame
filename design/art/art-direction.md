# Art direction and shot list (M1.7b)

Status: spec, fix round 1 applied, awaiting QA re-review. The user approved the image spend (2026-10-09); generation starts only after QA passes this shot list. Owner: design-agent. §4.3 and §5 were updated by the M2.1 home spec's fix round 1, and §5 again by its fix round 2 (changelog below).
Companion files:
- [`shot-list.json`](./shot-list.json) is the canonical shot list. It holds every full, exact prompt, alt text, safe zones and the delivery path. The orchestrator pastes prompts from there.
- [`../copy/catalog.json`](../copy/catalog.json) is the products and collections these images illustrate.
- [`../system/tokens.md`](../system/tokens.md) (palette, §2.4–2.5 glow and haze rules, §5 arched frame, §6.3 image note) and [`../system/accessibility.md`](../system/accessibility.md) §7 (text over imagery).

## Changelog

**M2.1 home fix round 2: QA issues 1–7** (2026-10-10). Only issue 7 touches this file. No prompt, alt or delivery change.

1. §5, newsletter: the `newsletter-texture` entry in `shot-list.json` (`notGenerated[].reason`) still says tokens.md §2.5 rule 7 "requires the newsletter form to sit on solid bg-haze". That wording is **superseded**: rule 7 now reads "bg-haze (U14) or bg-sunken (U3)". The entry's conclusion (no photographic or textured band under the form) is unchanged. JSON has no comments and the file isn't reissued for one sentence, so the superseded note lives here, in §5, in the same way as the `glowPlacement` notes (§4.3).

**M2.1 home fix round 1: QA issues 2 and 11** (2026-10-10). No prompt, alt or delivery change.

1. §4.3, hero glow placement: resolved by the home spec (`design/pages/home.md` §3.4). The home hero sets its text beside or above the image on bg-page, never over the left 45%, and the glow sits behind the opaque photo, showing only through the feathered edges. A 12.5% radius would be hidden entirely, so the glow is a circle of radius 30% of the image box (about 21–22.5% of the rendered image width), centred on the real candle; at 1440 it covers about x 39–81% of the source. Its footprint still clears every text box, control and haze layer at md, lg and xl (rule 6). The mobile hero renders no glow element. §4.3 now records this, and the `glowPlacement` notes in `shot-list.json` are the pre-M2 constraint, superseded by home.md §3.4 for the build (the image is already generated, so the JSON is not reissued).
2. §4.3, mobile hero: the home spec crops `hero-mobile` to a full-bleed 1:1 box (390 × 390 at 390) and never pre-hides the h1 (motion.md §5.1 option b), replacing the "350 × 437, option a" estimate.
3. §5, newsletter: the form sits on solid bg-haze **or bg-sunken** (tokens.md §2.5 rule 7 allows both; the home page uses bg-sunken because its brand story is the page's one haze band).

**Fix round 1: QA issues 1–8, plus the brand-story hold** (2026-10-09)

1. **Renames propagated** to ids, slugs, alt text, delivered paths, `generationOrder` and every table here, including batch A's lock-test ids: `cat-silver-hour` → `cat-moonrise`, `lif-silver-hour` → `lif-moonrise`, `cat-night-garden` → `cat-late-bloom`, `cat-falling-star` → `cat-gilded-plum` (catalog.md changelog). The Comet Season mood now shows one faint comet instead of shooting-star streaks. No Comet Season prompt contains both "frost" and "starlight": the shared lifestyle lighting block now says "pale-gold glints", and the melt tray is now "translucent satin-finish" instead of "translucent frosted" (§3.4, §8).
2. **Desktop hero glow placement** is specified and handed to M2: the candle glow is sized and positioned around the candle (about x 55–80% of the image) and kept clear of the left-45% heading box, per tokens.md §2.5 rule 6 (§4.3; `glowPlacement` in `shot-list.json`). The mobile hero gets the same kind of constraint.
3. **Closed, unlit vessel blocks** `jarClosed`, `tinClosed` and `meltPackClosed` are new (§3.7). They are reused word for word in `col-gift-sets`, `col-comet-season`, the three gift-set shots and `brand-story`. The few remaining adaptations are listed in §3.8, so the "word for word" rule is now true as written.
4. `lif-comet-season` `deliveredPath` is an array of its two Storage paths. Files in `/public` get a separate `servedUrl` (`/images/...`, no `/public` prefix) and are delivered as high-quality JPEG (§9.2).
5. New §9.4: tech notes for M1.5, M1.8 and M3 (Storage emulator and `next/image`, public read on `products/**`, JPEG/WebP for `/public`).
6. Two alts over 150 characters trimmed (`col-moonlit-terrace`, `cat-moonrise`).
7. §10 checklist item 4 now says "no bright points other than the specified moon".
8. "Winged figures" is gone from every `Avoid:` sentence, which now says "figures or creatures of any kind". Wings are rejected only in the §10 review checklist.
- **Brand story on hold:** `brand-story` has `hold: true` and is batch E, generated last and only if the user confirms they make the candles (§4.4, §6, open question 3).
- The tin block now says the lid lies "on the surface" (it said "on the floor"), so the same words work in the catalog sweep and on the gift-set table.

## 1. Purpose and acceptance criteria

Purpose: AI-generated photoreal imagery (Higgsfield, `gpt_image_2_5`) that makes Starflames look like one real, calm, luxurious brand at night. The products must be consistent enough to pass as photographs of the same product line.

Acceptance criteria:
1. A photographic visual language consistent with tokens.md: palette, lighting, lens, surfaces and props, and what to avoid (§2).
2. One fixed vessel design per product type, lit and closed, with no legible text and no third-party marks (§3).
3. Two shot styles: a 4:5 catalog shot for every product, and lifestyle shots in collection settings for hero products (§4).
4. A shot list of about 25–30 images, each with id, purpose, linked slug, aspect ratio, display target, crop and safe-zone notes, the full prompt with inline negative guidance, and alt text. It includes the home hero (desktop and mobile), one 3:4 mood image per collection, a catalog shot per product, 3–5 lifestyle shots and one brand-story image (§6, JSON).
5. A delivery spec for tech-agent: file names, formats, Storage vs `/public`, minimum resolution (§9).
6. An IP guardrail for imagery, plus a review checklist (§8, §10).

## 2. Visual language

**One sentence:** a quiet, real night, lit by a single candle. Deep midnight navy everywhere, a breath of violet and dusky-pink haze, a few pinpricks of starlight gold, and one warm amber flame that the eye goes to first.

### 2.1 Palette in the photograph (mapped to tokens)

| Role in the image | Token reference | How it shows up |
|---|---|---|
| Shadows, backdrop, night sky (about 75% of every frame) | night-900 `#0B0F24` to night-800 `#131A38`, edges near night-950 | Seamless backdrops are graded so their darkest areas sit close to bg-page and bg-raised, so a catalog image on a card shows no visible box (tokens.md §6.3). |
| Haze (about 10%) | violet-700 to violet-900, rose-700 to rose-800 | Low on the horizon or backdrop, soft and out of focus, never a saturated gradient. |
| Glints (2–3%) | gold-300 `#E8CF96`, moon-50 | Sparse, tiny, out of focus. Never a sparkle filter. (Lifestyle prompts call them "pale-gold glints"; catalog and hero prompts call them "starlight-gold glints". Same thing.) |
| Candle glow (the only warm light) | ember-300 to ember-500 | The flame, the glow through the glass, a soft pool on the surface. |
| Product materials | ivory (moon-100), champagne gold (gold-400/500), lilac silver, smoky midnight glass | Fixed per type (§3). |

The photo grade is **natural**: a believable warm white balance around the flame (about 2700 K), cool fill around 6500–7500 K. No teal-and-orange look, no crushed blacks with colour casts, and no oversaturation: the haze stays muted.

### 2.2 Lighting

- **Low-key.** The candle flame is always the key light (in melts and gift-set shots, a small tea light out of focus does that job).
- **Fill:** a faint cool moonlight-blue from the upper left.
- **Rim:** a subtle violet edge light from behind on the right, which separates dark glass from a dark backdrop.
- **Practical warmth:** a soft amber pool on the surface under the product.
- No studio softbox look, no hard shadows, no lens-flare streaks.

### 2.3 Lens and depth of field

| Shot | Lens look | Aperture | Camera height |
|---|---|---|---|
| Catalog: jar, pillar | 100mm | f/8 (whole product sharp) | slightly above, about 10° down |
| Catalog: tin | 100mm | f/8 | about 20° down (shows the wax and flame) |
| Catalog: melts | 100mm | f/8 | about 25° down (shows the cubes) |
| Catalog: gift set | 85mm | f/8 | about 30° down, into the open box |
| Lifestyle and collection mood | 50mm | f/2.8 (background soft) | eye level to the product |
| Hero | 85mm | f/2.8 | eye level to the product |
| Brand story | 35mm | f/4 | standing eye level |

### 2.4 Surfaces and props by setting

| Setting | Surfaces | Props (pick 1–3, never more) |
|---|---|---|
| Catalog | seamless matte midnight-navy sweep | one small scent-cue prop (§3.6) |
| Moonlit Terrace | pale carved stone balustrade | potted night jasmine; the valley, a hillside town as bokeh, a crescent moon |
| Starlit Library | old oak table | leather books with **blank spines**, a teacup, an unlit brass lamp, an arched window |
| Ember Grove | flat mossy stone, forest floor | ferns, pine trunks, drifting glowing points, violet mist |
| Lakeside Hush | weathered wooden jetty | folded ivory linen, reeds, a still lake, mist |
| Comet Season | painted-wood windowsill | dried orange, cinnamon, a pine sprig, a frosted pane, one faint comet |
| Gift Sets | ivory linen tablecloth | open midnight-navy box, ivory crinkle paper, gold satin ribbon |
| Brand story (on hold) | worn wooden worktable | brass jug, plain wick spools, unlabelled amber bottles, dried botanicals |

### 2.5 Always avoid

- **Any text** (labels, lids, book spines, bottles, boxes), letters, numbers, logos or brand marks of any company.
- **People:** no faces, no figures. Hands are not used in this set (no shot needs them).
- **Fantasy cheese:** figures or creatures of any kind, crests, emblems, heraldry, castles or towers, glowing runes, sparkle filters, neon colours, oversaturated or glossy CGI rendering.
- **Clutter:** more than three props, extra candles, smoke trails.
- **Real places:** real landmarks or recognisable buildings and skylines.
- **Safety-unfriendly scenes:** a candle near fabric folds, paper or foliage that it could touch. The tea light in gift shots stands *beside* the box, never in it.

## 3. Product consistency: the vessel bible

Every prompt that shows a vessel repeats that vessel's block word for word (`shot-list.json` → `blocks`): the lit blocks `jar`, `pillar`, `tin`, `waxMelt`, the closed blocks `jarClosed`, `tinClosed`, `meltPackClosed`, and `giftBox`. `{COLOUR}` (cube colour) is the only variable inside a block. The exceptions are listed in §3.8. Words must not drift between prompts. If a block changes after the lock test, every prompt that contains it changes too.

### 3.1 Jar (scented jars: 7 products)
- Straight-sided cylinder, about 8 cm wide × 9 cm tall (the 220 g size; the 380 g variant reuses the same image).
- **Smoky translucent midnight-blue glass** with a thick base. It glows softly where the flame shines through.
- Smooth **ivory wax**, a single wick, a small steady teardrop flame.
- **Plain matte ivory paper label** on the middle third, completely blank except for **one tiny embossed gold four-point star** at its centre.
- **Brushed champagne-gold metal lid**, leaning upright against the right side of the jar's base when lit; on the jar when closed (§3.7).

### 3.2 Pillar (2 products)
- Round, about 7 × 10 cm, **ivory wax**, softly textured matte surface, a single wick and a shallow clear melt pool.
- A narrow plain ivory paper band on the lower third with one tiny gold four-point star.
- Stands on a **small round brushed-brass dish**, which is a styling prop (see open question 4).

### 3.3 Travel tin (3 products)
- Round and shallow, about 8 × 4.5 cm, **brushed satin silver with a soft lilac tint**, ivory wax, a single wick.
- When lit, the matching lid lies flat on the surface to the right, top side up, with **one tiny embossed four-point star** and no other marks.

### 3.4 Wax melts (2 products)
- A **translucent satin-finish midnight-blue clamshell tray** with six square cavities (2 × 3), lid open and tilted back.
- Four cubes in the tray and two loose in front (six in total, matching the pack).
- A narrow ivory paper band with the gold star, lying flat to the left.
- Cube colour per product: Fir Hollow **soft muted sage green**; Gilded Plum **pale lilac with a fine, subtle gold shimmer**.
- Not lit. A small lit tea light in a brass cup, out of focus behind on the right, is the warm key light.

### 3.5 Gift box (3 products)
- A rigid box of **matte midnight-navy card**, about 25 cm wide, with its lid leaning upright against the back. The lid is plain except for **one tiny gold-foil four-point star**.
- Ivory crinkle paper inside; a thin gold satin ribbon over the front-left corner.
- Products inside are closed and unlit (§3.7); a tea light beside the box provides the glow.

### 3.6 Scent-cue props (catalog shots)

One small natural object at the front of the product (front left; front right for melts), never taller than a third of the product. It helps shoppers tell similar vessels apart, and keeps the series consistent.

| Product | Prop | Product | Prop |
|---|---|---|---|
| Moonrise | sprig of white jasmine | Fir Hollow | fir sprig, three juniper berries |
| Midnight Balcony | three violet leaves, one small wet grey stone | Still Water | one small white water lily |
| Late Bloom | cluster of cream honeysuckle | Lakelight | sprig of pale pink peach blossom |
| Ink & Cedar | cedar shavings, a pinch of black tea | Quiet Shore | two grey pebbles, one fig leaf |
| Last Chapter | pale wooden honey dipper, split vanilla pod | Gilded Plum | one small dark plum |
| Margin Notes | curl of lemon peel, pinch of tea leaves | Comet Tail | dried blood-orange slice, three cloves |
| Lantern Path | short pine sprig | Moss & Ember | small cushion of green moss |

Gift sets carry no prop: the ribbon does that job.

### 3.7 Closed, unlit vessels

Used wherever a product appears unlit with its lid on: inside gift boxes, beside a lit candle, or in a row on the brand-story table. Each block starts "Every closed … in this image:", so one block covers one or several identical vessels, and the prompt says how many there are in its own words.

| Block | Look | Used in |
|---|---|---|
| `jarClosed` | the §3.1 jar, unlit, with its champagne-gold lid on; same blank label and star | `cat-reading-nook-set` (2), `cat-comet-season-gift-box` (1), `brand-story` (3) |
| `tinClosed` | the §3.3 tin, unlit, with its lilac-silver lid on; star on the lid | `cat-little-constellation-set` (3), `col-gift-sets` (2) |
| `meltPackClosed` | the §3.4 tray with the lid closed, six cubes in `{COLOUR}` visible through it, the paper band wrapped around the tray | `col-comet-season`, `cat-comet-season-gift-box` (both Gilded Plum: pale lilac with a fine, subtle gold shimmer) |

### 3.8 Exceptions to "word for word"

These are the only places where a prompt doesn't use a block exactly as written (also in `shot-list.json` → `meta.blockExceptions`):

1. **`col-gift-sets`:** the open gift box is described in its own sentence, not with `giftBox`, because the lit tin in front of the box is the key light; `giftBox` adds a tea light, which would be a second flame. Its composition sentence is adapted for the box plus the lit tin. The vessels use `tinClosed` and `tin` verbatim.
2. **`col-comet-season`:** the composition sentence is adapted so the jar and the melt pack sit together in the central band. The vessels use `jar` and `meltPackClosed` verbatim.
3. **`brand-story`:** the three unlit jars use `jarClosed` verbatim; the two lit jars are described as "the same jars with their lids off", because the `jar` block describes a single product with its lid leaning beside it. Its opening, lighting, composition, mood and `Avoid:` sentences are its own (3:2, 35mm, two flames).
4. **`hero-desktop`, `hero-mobile`:** `jar`, `moodLifestyle` and `negLifestyle` are verbatim. The opening, scene, lighting and composition sentences are hero-specific (16:9 or 4:5, 85mm, the heading zone).
5. **`cat-gilded-plum`:** `negCatalog` plus one extra item, "glitter spilled outside the cubes".

Every other prompt is assembled from its blocks with nothing changed.

### 3.9 Marks and text

- **No legible text anywhere.** AI text garbles, and a fake word on a label looks worse than a blank one. The only mark is the tiny four-point star, which echoes the site's motif.
- **No third-party brands or logos**, not even on the tea-light cup, bottles or books.
- If a generation shows any letters, the image is rejected (§10). Don't fix it by retouching unless the fix is trivial (one stray glyph on the backdrop).

## 4. Shot styles

### 4.1 Catalog shot (every product)

- **4:5 vertical**, product centred on the seamless night backdrop, identical framing across the range.
- Jar and pillar: base at about 85% of the height; the product (flame included) fills the middle ~50% of the height and the central 50% of the width; the **top 25% is empty backdrop**.
- Tin and melts: base or front edge at about 80%; the content stays inside the central 60% of the width; the **top 35% is empty**.
- Gift sets: front edge at about 85%; inside the central 70% of the width; the top 25% is empty.
- **Why those margins (the arch).** `radius-arch` (tokens.md §5) gives a semicircle top whose radius is half the frame width. In a 4:5 frame (W × 1.25W), a column of half-width h around the centre is clipped only above y = 0.5W − √(0.25W² − h²):
  - central 50% (h = 0.25W): clipped above 0.067W, i.e. **the top 5.4% of the height**
  - central 60% (h = 0.3W): **the top 8%**
  - central 70% (h = 0.35W): **the top 11.4%**

  Every product zone above starts at 25% or lower, so the arch never touches a product, a flame or a prop. `radius-arch-soft` is shallower still, and a 1:1 centre crop (trimming 10% top and bottom) is also safe.
- Size variants reuse the product's one catalog image.

### 4.2 Lifestyle and collection mood (3:4)

- Each collection gets **one 3:4 mood image that includes its hero product** in the setting. That one generation serves twice:
  1. the collection image (card and collection header), in `/public`;
  2. a **4:5 lifestyle crop** for that product's gallery (remove the top 6.25% of the height), in Storage.
- The product is inside the central 60% of the width, with its base between 75% and 85% of the height. The top 30% is calm, low-detail sky or shadow with no bright points, so the arch and any heading nearby stay clean.
- This gives **six lifestyle shots** (Moonrise, Ink & Cedar, Lantern Path, Still Water, Comet Tail with Gilded Plum, Little Constellation Set) for zero extra generations.

### 4.3 Home hero

- **Desktop 16:9** (`hero-desktop`): Moonrise on a terrace balustrade above a lake valley at night. The candle is at about 68% of the width in the prompt (about 60% in the delivered photo, as measured by the home spec). **The left 45% is a dark, low-detail heading zone** (no moon, no town lights). The edges fall off to near night-900 so the image can be masked into bg-page.
- **Mobile 4:5** (`hero-mobile`): the same scene, centred, with the top 30% calm. The home spec (`design/pages/home.md` §3.2, §3.6) crops it to a **full-bleed 1:1 box** (390 × 390 at 390) and never pre-hides the h1 (motion.md §5.1 option b); the image is the expected LCP element.
- tokens.md §2.5 rule 6: the hero image sits on plain bg-page with `gradient-candle-glow` behind it and no haze overlapping that glow. The photo's own vignette to near-navy makes that seamless. The home hero has no haze at all (it is a `solid` band; home.md §2.1).
- **Glow placement (resolved by M2.1, `design/pages/home.md` §3.4):**
  - **Where the text goes decides the constraint.** The original constraint (a radius of about 12.5% of the image width, inside about x 55–80%) protected a heading set **over** the left 45%. The home spec never puts text over the image: the text sits beside it (lg+) or above it (below lg), on bg-page. The constraint that remains is rule 6 itself: the glow's whole `closest-side` circle stays clear of every text box, control and haze layer.
  - **Desktop (md and up):** the glow sits **behind** the opaque photo and shows only through the feathered edges (home.md §3.3). It is centred on the real candle (in the box: x 46.7% / y 57% at md, x 43.1% / y 57% at lg and xl) with a **radius of 30% of the image box width**, which is about 22.5% of the rendered image width at md and 21.1% at lg and xl (r ≈ 244 CSS px at 1440, covering about x 39–81% of the source). A 12.5% circle would sit entirely inside the photo's opaque area and never show. At every breakpoint the footprint is at least 100px clear of the text column (home.md §3.4, Clearances).
  - **Mobile:** no glow element is rendered below md. At 390 the circle couldn't reach the feathered bottom edge without also reaching the top edge next to the text; the photo's own glow carries the hero.
  - When the image is cropped (4:3 at 768–1023 px, trimming the left edge; 5:4 at lg+), the glow moves and scales with the candle. No box-shadow glow is stacked on the hero image (tokens.md §2.4).
  - The `glowPlacement` notes in `shot-list.json` record the pre-M2 constraint. For the build, home.md §3.4 and this section supersede them.
- Never pre-hide the hero image (motion.md §5.1 item 4).

### 4.4 Brand story (3:2), on hold

- A night worktable by a window: a row of jars (three closed, two lit), wick spools, a brass jug, unlabelled bottles, botanicals. Desktop text zone in the left 40% (plain dark wall). The mobile 4:5 crop takes 43–96% of the width.
- The scene implies the brand makes its own candles, and the user hasn't confirmed that. **The shot is kept but on hold** (`hold: true`, batch E): it is generated last, and only if the user confirms (open question 3). If they don't, it is not generated as written; design-agent writes a finished-candle still life with the same composition, and QA reviews that prompt first.

## 5. Text over imagery

- **Product images never carry text** (badges sit on the card, outside the product zone).
- **Collection, lifestyle and catalog images:** no text over them; headings sit on solid ground next to the image.
- **Hero and brand story** have a reserved dark zone (left 45% / left 40%). The preferred layout puts text beside the image on solid bg-page. If M2 or the brand-story spec places text over the zone, accessibility.md §7 applies: a night-900 scrim of at least 60% under the text, and the spec states the ratio against the lightest pixel of that zone in the final image. Text never sits over the candle, the town lights, the moon or any busy area.
- Status text, form controls and text-muted are never placed over photography (tokens.md §2.5 rules 4, 7, 8).
- **No newsletter texture.** The newsletter form must sit on solid ground, **bg-haze or bg-sunken** (tokens.md §2.5 rule 7; U14, U3; over a haze gradient it fails, U11–U12), so a photographic band under it is not allowed. On home it sits on bg-sunken (`design/pages/home.md` §2.1, §8). Its atmosphere comes from CSS haze or star motifs placed away from the form.
  - **Superseded wording in the JSON:** the `newsletter-texture` entry in `shot-list.json` (`notGenerated[].reason`) still says rule 7 "requires the newsletter form to sit on solid bg-haze". For every later spec and build, this section and rule 7 as it now reads (bg-haze or bg-sunken) supersede that sentence. The entry's conclusion, that no texture is generated for the newsletter, stands.

## 6. Shot list (summary)

Full prompts, alt text and paths are in `shot-list.json`. Display sizes are targets; the final `sizes` hints belong to each page or component spec.

| # | id | Purpose | Linked | Ratio | Display target | Batch |
|---|---|---|---|---|---|---|
| 1 | `hero-desktop` | home hero | moonrise | 16:9 | up to 1440 CSS px wide, 2x | B |
| 2 | `hero-mobile` | home hero | moonrise | 4:5 | 350–390 CSS px wide, up to 3x (LCP at 390) | B |
| 3 | `col-moonlit-terrace` | collection mood + lif-moonrise | moonlit-terrace | 3:4 | up to ~600 CSS px wide, 2x | D |
| 4 | `col-starlit-library` | collection mood + lif-ink-and-cedar | starlit-library | 3:4 | same | D |
| 5 | `col-ember-grove` | collection mood + lif-lantern-path | ember-grove | 3:4 | same | D |
| 6 | `col-lakeside-hush` | collection mood + lif-still-water | lakeside-hush | 3:4 | same | D |
| 7 | `col-comet-season` | collection mood + lif-comet-season | comet-season | 3:4 | same | D |
| 8 | `col-gift-sets` | collection mood + lif-little-constellation-set | gift-sets | 3:4 | same | D |
| 9 | `cat-moonrise` | product catalog (**lock: jar**) | moonrise | 4:5 | card 167–300 px; PDP up to ~640 px; 2–3x | A |
| 10 | `cat-lantern-path` | product catalog (**lock: pillar**) | lantern-path | 4:5 | same | A |
| 11 | `cat-late-bloom` | product catalog (**lock: tin**) | late-bloom | 4:5 | same | A |
| 12 | `cat-fir-hollow` | product catalog (**lock: melts**) | fir-hollow | 4:5 | same | A |
| 13 | `cat-midnight-balcony` | product catalog | midnight-balcony | 4:5 | same | C |
| 14 | `cat-ink-and-cedar` | product catalog | ink-and-cedar | 4:5 | same | C |
| 15 | `cat-last-chapter` | product catalog | last-chapter | 4:5 | same | C |
| 16 | `cat-moss-and-ember` | product catalog | moss-and-ember | 4:5 | same | C |
| 17 | `cat-still-water` | product catalog | still-water | 4:5 | same | C |
| 18 | `cat-comet-tail` | product catalog | comet-tail | 4:5 | same | C |
| 19 | `cat-margin-notes` | product catalog | margin-notes | 4:5 | same | C |
| 20 | `cat-quiet-shore` | product catalog | quiet-shore | 4:5 | same | C |
| 21 | `cat-lakelight` | product catalog | lakelight | 4:5 | same | C |
| 22 | `cat-gilded-plum` | product catalog | gilded-plum | 4:5 | same | C |
| 23 | `cat-little-constellation-set` | product catalog | little-constellation-set | 4:5 | same | C |
| 24 | `cat-reading-nook-set` | product catalog | reading-nook-set | 4:5 | same | C |
| 25 | `cat-comet-season-gift-box` | product catalog | comet-season-gift-box | 4:5 | same | C |
| 26 | `brand-story` | brand story (**on hold**) | our-story | 3:2 | up to 1280 CSS px wide, 2x; mobile 4:5 crop | E (hold) |
| — | 4 rerolls | reserve | — | — | — | as needed |

**Budget:** 25 generations in batches A–D plus 4 rerolls = **29**. `brand-story` (batch E, on hold) adds 1 only if the user confirms, for a maximum of **30**. Six lifestyle crops (`lif-*`) are derived, not generated. Size variants reuse their product's catalog image.

**Generation order:**
1. **Batch A, the lock test** (4 images: one per vessel type): `cat-moonrise`, `cat-lantern-path`, `cat-late-bloom`, `cat-fir-hollow`. Review against §10. Adjust only the block that failed, then spend a reroll on that type alone.
2. **Batch B, the hero** (2), once the jar is locked.
3. **Batch C, the remaining catalog** (13). The gift-set shots are the first test of `jarClosed`, `tinClosed` and `meltPackClosed`; review them against §10 item 2 before batch D.
4. **Batch D, the collection moods** (6).
5. **Batch E, the brand story** (1, **on hold**): last, and only if the user confirms they make the candles (§4.4).

**Consistency aid (orchestrator to check):** if Higgsfield's `gpt_image_2_5` accepts a reference image, pass the approved lock-test image of the same type (for example `cat-moonrise` for every jar shot, including the hero and moods) as a reference. That holds the vessel far better than words alone. Keep the text prompt unchanged either way.

## 7. Alt text rules

- **Catalog:** product name + type + "lit" when lit + the vessel in plain words + the prop. Example: "Moonrise scented jar candle, lit, in smoky midnight-blue glass with a blank ivory label and a gold lid beside it, next to a sprig of jasmine." The product-card spec (M3.1) decides whether the card image repeats the name already given by the link text (then `alt=""` on the card, with the full alt on the product page).
- **Length:** every alt in `shot-list.json` is 150 characters or fewer.
- **Mood, lifestyle, hero, brand:** describe what is shown, in plain words. No marketing claims, no brand-voice flourishes.
- **Decorative:** none of the generated images is decorative. Every one carries content, so none has empty alt. (The dropped newsletter texture would have been decorative.)
- **IP:** alt text uses only generic words (terrace, valley, lake, forest, library), never a named place or anything from the inspiring series.

## 8. IP guardrail for imagery (blocking)

- **Generic atmosphere only:** a night sky, mountains, a lake, a pine forest, a hillside town as soft bokeh lights, a stone terrace, an old reading room.
- **Never:** recognisable book covers or cover compositions; characters or any human or creature figure; crests, sigils, emblems, heraldry or patterned symbols; named or recognisable locations from any book series; a city built into a cliff with distinctive towers; real landmarks, skylines or buildings. (The §10 checklist adds the one shape prompts deliberately don't name.)
- **Motifs** stay the brand's generic set: a four-point star, a crescent moon, a small flame, and a single faint comet only in the Comet Season mood. No shooting-star showers: a once-a-year drop with stars falling from the sky would echo a named celebration in the series.
- **Comet Season wording:** no prompt, alt or note for Comet Season contains both "frost" and "starlight" (that pairing echoes a series title). The frosted window pane in `col-comet-season` stays, and that prompt's glints are "pale-gold". The melt tray is "satin-finish", so the Gilded Plum and Comet Season Gift Box catalog prompts, which keep the catalog lighting block's "starlight-gold glints", contain no frost.
- **Prompts** contain no series names, character names or terms (re-checked after fix round 1: every prompt uses only generic nouns).
- An image that drifts toward any of the "never" items is rejected (§10), even if it looks good.

## 9. Delivery spec (for tech-agent)

### 9.1 Originals
- Every generated and derived file is kept as an original PNG at `assets/images/<purpose>/<id>.png`, with purpose one of `hero`, `collection`, `product-catalog`, `product-lifestyle`, `brand`. Whether `assets/` is committed, git-ignored or stored with Git LFS is tech-agent's and the user's call; originals are large.
- sRGB colour profile. Keep the originals unedited apart from the derived crops.
- **Derived crops** (`lif-*`): crop the `col-*` original as `shot-list.json` → `derived[].crop` says (full width, remove the top 6.25%). Owner: whoever runs the asset step (orchestrator or tech-agent).

### 9.2 Where each image goes

| Images | Destination | `deliveredPath` (repo or bucket path) | `servedUrl` | Why |
|---|---|---|---|---|
| `cat-*`, `lif-*` | **Firebase Storage** (emulator during M1) | `products/<productSlug>/<id>.png`. `lif-comet-season` has an **array** of two paths, one under `comet-tail` and one under `gilded-plum`. | — (resolved from the bucket by the data layer) | Product data is seeded and later edited by an admin, so its images live with it. |
| `hero-*` | static `/public` | `public/images/hero/<id>.jpg` | `/images/hero/<id>.jpg` | Site chrome: versioned with the code, statically imported. |
| `col-*` | static `/public` | `public/images/collections/<id>.jpg` | `/images/collections/<id>.jpg` | The collection set is fixed in M1; the static import gives width, height and blur placeholders for free. |
| `brand-story` (on hold) | static `/public` | `public/images/brand/brand-story.jpg` | `/images/brand/brand-story.jpg` | Site chrome. |

- `deliveredPath` is where the file is put; `servedUrl` is the URL path the site uses. Next serves `public/` at the site root, so the `/public` prefix is never part of a URL.
- **Formats:** `/public` copies are **high-quality JPEG** (quality about 90, sRGB) exported from the PNG originals, which keeps the repo and the build light. Storage copies stay PNG in M1 (tech-agent may switch them to JPEG or WebP; then the paths change in one place, here and in the JSON).
- The seed (M1.8) stores per product image: `{ id, storagePath, alt, role: "catalog" | "lifestyle", width, height }`, taking `alt` from `shot-list.json`. For `lif-comet-season` it uses the path under the product's own slug. Collection documents store the `servedUrl` and alt for `images.mood`.
- `next/image` produces AVIF and WebP and the responsive sizes. Storage images need `remotePatterns` for the emulator host and, later, the production bucket (tech-agent's call; see §9.4). Static images in `/public` are imported so their dimensions are known before paint (no CLS).
- Frames keep their aspect ratio before load and show `bg-raised` as the empty colour, so there is no layout shift and no white flash.

### 9.3 Minimum resolution of originals

| Image | Minimum | Reason |
|---|---|---|
| `hero-desktop` | 2400 × 1350 | up to 1440 CSS px wide at about 1.7–2x |
| `hero-mobile` | 1200 × 1500 | 390 CSS px at 3x |
| `cat-*` | 1600 × 2000 | product page main image up to ~640 CSS px at 2x, plus zoom headroom |
| `col-*` (and the `lif-*` crops) | 1500 × 2000 (crop: 1500 × 1875) | ~600 CSS px at 2x; lifestyle gallery |
| `brand-story` | 2400 × 1600 | up to 1280 CSS px at about 1.9x |

If the model's native output is smaller, upscale 2x (Higgsfield has an upscale tool; it costs extra credits, so ask the user) or accept the native size for the M1 emulator sample and upscale before launch.

### 9.4 Tech notes for M1.5, M1.8 and M3

Notes only; the implementation is tech-agent's.

- **Storage emulator URLs and `next/image` (M1.8, M3).** The Storage emulator serves from a local address (127.0.0.1 on our port range), and the `next/image` optimizer refuses to fetch from local or private IPs by default. For **dev and emulator only**, either enable `images.dangerouslyAllowLocalIP` (if the installed Next version has it) together with a `remotePatterns` entry for the emulator host and port, or render Storage-emulator images with `unoptimized`. Neither setting may reach a production config.
- **Storage rules (M1.5).** Product images must be publicly readable: allow public read on `products/**`; writes stay admin-only (the `admin` custom claim) or seed-only through the Admin SDK. Rules tests should cover an anonymous read of a `products/` file.
- **`/public` copies.** Prefer high-quality JPEG (as specified in §9.2) or WebP over PNG for the static copies, so the repo stays small and the static import is fast. `next/image` still generates AVIF and WebP for the browser either way.

## 10. Review checklist (orchestrator, after each batch; QA in the build review)

Reject and reroll when any of these fails:
1. **Text:** any letter, number or glyph anywhere (label, lid, box, books, bottles, backdrop).
2. **Vessel:** it doesn't match §3 (wrong glass colour, a printed label, a lid that isn't champagne gold, a tin that reads plain steel or pink, a missing star, more or fewer than six cubes in a melt shot, a closed vessel shown open or lit, or a lit vessel shown closed).
3. **Flame:** more than one wick or flame on a product, or a smoking or guttering flame.
4. **Framing:** the product enters the top 25% (35% for tins and melts) or leaves its central width band; the hero's left 45% (mobile: top 30%) contains detail, or any bright point other than the specified moon (desktop: no moon in that zone; mobile: the one small crescent at about 72% across and 15% down).
5. **Palette:** saturated neon, a bright violet or pink cast over the product, or a backdrop visibly lighter than night-800 in its corners.
6. **IP and brand safety:** a figure or creature, **a wing or wing shape (including wing-like clouds or mist)**, a crest or symbol, a recognisable place or building, any third-party logo, or more than one comet or any shower of shooting stars. Wings are named only here, on purpose: naming them in a prompt, even as something to avoid, can prime the model to draw them.
7. **Safety:** a flame touching or near paper, fabric or leaves.
8. **Believability:** melted or warped glass, impossible reflections, a floating object.

Lock-test pass rule: all four batch A images pass items 1–4. Only then run batches B–D.

## 11. Open questions

1. **Spend.** Approved by the user (2026-10-09): 25 generations plus 4 rerolls on `gpt_image_2_5` (plus 1 for the brand story if released), about 0.25 credits each. Upscales would cost extra and need a separate yes. `[confirm with user: upscales]`
2. **AI images of real products.** These images are fine for emulator sample data. Before launch, if the real vessels differ (glass colour, lid, label), either re-generate to match the real product or replace with photography, so shoppers see what they will receive. `[confirm with user]`
3. **Brand story scene.** The worktable implies the candles are made in-house. The shot is on hold until the user confirms that; otherwise it becomes a finished-candle still life. `[confirm with user]`
4. **The brass dish** under the pillars is a styling prop. Either the product page says "dish not included", or the user sells or includes one. `[confirm with user]`
5. **Gift box, ribbon and tissue** appear in imagery and copy (catalog.md §5.3). Are they real? `[confirm with user]`
6. **Label design.** At launch the label is blank with a tiny star. A real label with the wordmark can be composited later in an editor (not by AI). `[confirm with user]`
