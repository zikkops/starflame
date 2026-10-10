# Seed catalog copy (M1.7)

> **SAMPLE DATA.** This catalog is for the Firebase emulator (M1.8 seed) only. Prices, weights, burn times and scent notes are plausible placeholders, not real product facts. Nothing here goes to production without the user's approval.

Status: spec, fix round 1 applied, awaiting QA re-review. Owner: design-agent.
Structured twin: [`catalog.json`](./catalog.json). tech-agent types and seeds from the JSON (M1.4 types, M1.8 seed). This file is for reading and review. If the two ever disagree, the JSON wins and the mismatch is a `[design]` bug.
Image briefs: every `cat-*`, `col-*` and `lif-*` id points into [`../art/shot-list.json`](../art/shot-list.json).

## Changelog

**Fix round 1: QA issues 1–11** (2026-10-09)

1. **Silver Hour → Moonrise** (user decision). Slug `moonrise`, SKUs `moonrise-220` / `moonrise-380`, images `cat-moonrise` / `lif-moonrise`.
2. **Falling Star → Gilded Plum** (design-agent's pick; the user can veto). Slug `gilded-plum`, SKU `gilded-plum-6`, image `cat-gilded-plum`. Updated in the gift-box contents and copy and in §7. Its long description no longer talks about streaks of light or watching the sky. The Comet Season tagline is now "A limited run for the longest, brightest winter nights.", and the description and mood note lose the streak of light (the mood image now shows one faint comet, not shooting stars). "Frost" and "starlight" never appear together in Comet Season copy, names or image prompts.
3. **Night Garden → Late Bloom** (design-agent's pick; the user can veto). Slug `late-bloom`, SKU `late-bloom-120`, image `cat-late-bloom`. Updated in the Little Constellation Set and Margin Notes copy.
4. Provenance corrected (§1 item 3, §7): the orchestrator invented the mockup's names for an exploratory mockup; the user did not choose them.
5. New §6.1: derived fields for M1.4 (description only).
6. Midnight Balcony: the wellness-effect line ("clears your head") is replaced by a description of the scent.
7. Reading Nook Set: "pairs two Starlit Library jars" (the collection has three products).
8. Jar care: first-burn time given for both the 220 g and the 380 g jar.
9. Word counts recounted against the JSON (§4). Counting rule: whitespace-separated tokens, so "220 g" is two words, "&" is one, and a hyphenated word is one.
10. Comet Tail reclassified from Citrus to **Smoky & amber** (smoked vanilla and amber carry its base). The fixed family set is unchanged.
11. Bestseller badge: `badge-bestseller` now exists in tokens.md §2.3, reusing the New badge's outline style (T56).

## 1. Purpose and acceptance criteria

1. 4–6 original collections, each with slug, name, one-line tagline, a 40–70 word description and an imagery mood note. **Done: 6** (4 core, 1 limited seasonal, 1 gift sets).
2. 14–18 products across every type in the brief, each with slug, name, type, collection, short description (≤ 20 words), long description (60–110 words), scent family, top/heart/base notes, variants (weight, price, burn time), badges, care reference and image brief id. **Done: 17** (7 jars, 2 pillars, 3 tins, 2 wax melts, 3 gift sets; 2 limited drops plus a limited gift box).
3. Names from the exploratory home mockup: the orchestrator invented them for that mockup; the user did not choose them. Kept: the four collection names and Lantern Path (pillar). Replaced in fix round 1: Silver Hour → **Moonrise** (the user's choice), Night Garden → **Late Bloom** and Falling Star → **Gilded Plum** (design-agent's picks, open to the user's veto, §8).
4. Prices are integer minor units with `currency: "USD"` `[confirm with user]`.
5. Shared microcopy: candle care per type, and the gift-set contents format.
6. No unsupported claims. IP guardrail re-checked (§7).

## 2. Conventions

- **Currency:** USD placeholder `[confirm with user]`. Prices are stored in cents (3400 = $34.00) on every variant as `{ amount, currency }`.
- **Spelling:** US English in customer-facing copy (center, favorite, cozy), to match the USD default. If the user picks GBP or EUR, design-agent switches spelling in one pass.
- **Claims:** none of these appear anywhere: hand-poured, small batch, soy, coconut or any wax type, cotton or wood wick, natural, organic, vegan, non-toxic, clean-burning, eco, sustainable, wellness effects ("calming", "relaxing", "clears your head"). Add them only after the user confirms they are true `[confirm with user]`. Scent "accords" (e.g. "old paper accord") are normal perfumery language for a blended impression, not an ingredient claim.
- **Sizes reuse one image:** a product's 220 g and 380 g (or 7 × 10 and 7 × 15 cm) variants share its single catalog shot.
- **Badges:** `bestseller`, `new`, `limited`. Labels: "Bestseller", "New", "Limited". Styles are in tokens.md §2.3: `badge-bestseller` reuses the `badge-new` outline style (gold-400 border and text on bg-raised, T56 8.96:1), `badge-limited` is the gold-400 fill. Bestseller and New look alike, so the label text tells them apart.

### 2.1 Scent families (fixed set)

| Slug | Label | Products |
|---|---|---|
| `floral` | Floral | Moonrise, Late Bloom |
| `fresh` | Fresh | Midnight Balcony, Still Water, Lakelight |
| `citrus` | Citrus | Margin Notes, Quiet Shore |
| `woody` | Woody | Ink & Cedar, Lantern Path, Fir Hollow |
| `gourmand` | Gourmand | Last Chapter, Gilded Plum |
| `smoky-amber` | Smoky & amber | Moss & Ember, Comet Tail |

Gift sets have `scentFamily: null`. A filter derives their families from their contents (§6.1): Little Constellation Set → floral, citrus; Reading Nook Set → woody, gourmand; Comet Season Gift Box → smoky-amber, gourmand.

### 2.2 Standard sizes (sample)

| Type | Variant | Size | Weight | Price | Burn time |
|---|---|---|---|---|---|
| Jar | 220 g | 8 × 9 cm | 220 g | $34.00 | about 45–50 h |
| Jar | 380 g | 9.5 × 11 cm | 380 g | $48.00 | about 75–85 h |
| Pillar | 7 × 10 cm | ⌀ 7 × 10 cm | 350 g | $28.00 | about 50–60 h |
| Pillar | 7 × 15 cm | ⌀ 7 × 15 cm | 520 g | $38.00 | about 75–90 h |
| Travel tin | 120 g | 8 × 4.5 cm | 120 g | $18.00 | about 22–26 h |
| Wax melts | 6 cubes | clamshell | 80 g | $12.00 ($14.00 limited) | about 8 h of scent per cube |

Exceptions: Comet Tail (limited) comes in 220 g only at $36.00. Gift sets are priced below the sum of their contents (§4.6).

---

## 3. Collections

| # | Slug | Name | Tagline | Limited |
|---|---|---|---|---|
| 1 | `moonlit-terrace` | Moonlit Terrace | Cool stone, night flowers and a valley of lights below. | no |
| 2 | `starlit-library` | Starlit Library | Old pages, black tea and a window full of stars. | no |
| 3 | `ember-grove` | Ember Grove | Pine, moss and sparks drifting up into the dark. | no |
| 4 | `lakeside-hush` | Lakeside Hush | Still water, soft mist and the moon twice over. | no |
| 5 | `comet-season` | Comet Season | A limited run for the longest, brightest winter nights. | **yes** |
| 6 | `gift-sets` | Gift Sets | A little night sky, boxed and ready to give. | no |

### Moonlit Terrace
High above a sleeping valley, a stone terrace holds the last warmth of the day. Night flowers open along the balustrade, the air turns cool and clean, and far below the windows of a hillside town glow like a second sky. These are bright, airy florals and fresh night-air scents for slow evenings and open windows. *(56 words)*

**Mood note:** a pale carved stone balustrade on a high terrace at night; a valley and the warm window lights of a distant hillside town as soft bokeh; mountain silhouettes; a thin crescent moon; a starry indigo sky with violet and dusky-pink haze at the horizon; night-blooming jasmine. Cool and airy: moonlight-blue fill dominates and the candle is the only warm point. Image: `col-moonlit-terrace`.

### Starlit Library
A reading room after everyone has gone to bed: worn leather chairs, books stacked two deep, a pot of tea gone cool beside the last chapter. Through the tall window the stars keep watch. Warm woods, tea and soft gourmand notes for the hours when you read one page more than you meant to. *(54 words)*

**Mood note:** an old oak reading table; stacked antique leather books with plain, blank spines; an unlit brass reading lamp; a tall arched window onto a starry indigo sky; a cup of black tea; dust motes catching the candlelight. The warmest of the core collections: more amber on wood and leather, but shadows stay deep navy. Image: `col-starlit-library`.

### Ember Grove
Deep in an old pine wood, a path of lanterns leads to a clearing where moss grows thick over the stones. Sparks drift up from somewhere out of sight and blur into the stars between the branches. Resinous woods, soft smoke and green moss for evenings that feel like a quiet adventure. *(52 words)*

**Mood note:** a pine forest clearing at night; a flat mossy stone; ferns; tall dark trunks; a few tiny glowing points of drifting light between the trees, like sparks or falling starlight; a soft violet mist between the trunks; a narrow path fading into the dark. Greens stay deep and muted, never bright. Image: `col-ember-grove`.

### Lakeside Hush
A wooden jetty on a lake so still it holds the moon twice: once in the sky and once at your feet. Mist gathers over the reeds and the mountains go quiet. Clean, watery and gently citrus scents, made for the moment the day finally lets go of you. *(49 words)*

**Mood note:** the end of a weathered wooden jetty over a mirror-still lake; low mist on the water; reeds; dark mountains reflected; a crescent moon and its reflection; a folded ivory linen throw. The coolest palette of all: silver-blue and indigo, the candle a small warm point. Image: `col-lakeside-hush`.

### Comet Season (limited)
For a few weeks at the turn of the year, the nights are long, the windows frost at the edges and the house smells of orange peel and spice. Comet Season gathers bright, spiced, glowing scents for exactly that time. It is a limited edition: once these are gone, they won't be back this year. *(55 words)* `[confirm with user: limited-run wording and dates]`

**Mood note:** a deep windowsill; a window pane frosted at its edges; a winter night sky with one faint comet and its soft, short tail over snowy mountain silhouettes; dried orange slices, cinnamon sticks and a pine sprig. The warmest accents of the range: more amber and a few more pale gold glints, still on a deep navy night. Image: `col-comet-season`.

Comet Season wording rule (from QA): the sky never "falls" in this collection, and "frost" is never paired with "starlight" in its copy, names or image prompts.

### Gift Sets
Our gift sets pair candles that belong together, so choosing is the easy part. Each set arrives in a midnight-blue box with a ribbon, ready to hand over or to keep for yourself. Pick a trio of travel tins to explore, a reading pair for a book lover, or a limited box while the season lasts. *(56 words)* `[confirm with user: gift box and ribbon packaging]`

**Mood note:** an open matte midnight-navy gift box on an ivory linen-covered table at night; travel tins nestled in ivory crinkle paper; a thin gold satin ribbon; one tin lit beside the box; a dark window with faint stars behind. Soft, generous and warm, but uncluttered. Image: `col-gift-sets`.

---

## 4. Products

Word counts are given for the long descriptions (60–110), counted as whitespace-separated tokens ("220 g" is two words, "&" is one). Every short description is ≤ 20 words.

### 4.1 Moonlit Terrace

**Moonrise** · `moonrise` · Scented jar · Floral · Badge: Bestseller · Care: `care.jar` · Images: `cat-moonrise`, `lif-moonrise`
- Short: Night jasmine and bergamot on cool terrace air. An easy first candle.
- Long *(81)*: Moonrise is the moment the moon clears the mountains and turns the terrace stones pale. Bergamot and a little pear open it, bright and clean. Night-blooming jasmine and powdery iris follow, soft rather than sweet, settling on white musk and smooth woods that linger long after the flame is out. It fills a room without crowding it, which makes it an easy first candle and an easy gift. Light it as the evening comes in and let it set the pace.
- Notes: top Bergamot, Pear · heart Night-blooming jasmine, Iris · base White musk, Blond woods
- Variants: 220 g $34.00, about 45–50 h · 380 g $48.00, about 75–85 h

**Midnight Balcony** · `midnight-balcony` · Scented jar · Fresh · Badge: New · Care: `care.jar` · Image: `cat-midnight-balcony`
- Short: Violet leaf, rain-cooled stone and cedar. Fresh night air in a jar.
- Long *(74)*: Step out onto a balcony just after a summer shower, when the stone is still wet and the air smells green and new. Midnight Balcony opens on crushed violet leaf and a breath of cool night air, softens into freesia and a clean mineral note like rain on stone, then settles on dry cedarwood and ambrette. It is fresh without being sharp, cool and green at first, then soft and woody as it burns.
- Notes: top Violet leaf, Night air accord · heart Rain-on-stone accord, Freesia · base Cedarwood, Ambrette
- Variants: 220 g $34.00, about 45–50 h · 380 g $48.00, about 75–85 h

**Late Bloom** · `late-bloom` · Travel tin · Floral · Care: `care.tin` · Image: `cat-late-bloom`
- Short: Tuberose and honeysuckle opening after dark. A pocket-sized floral for travel and small rooms.
- Long *(81)*: Some flowers save their scent for the night. Late Bloom gathers them in a travel tin: dewy green leaves first, then creamy tuberose and honeysuckle, then a soft base of vanilla and moss, like a garden path after the lamps go out. The lilac-silver tin is small enough for a bedside table, a desk or a weekend bag, and the scent is gentle enough for a small room. It is also one of the three tins in the Little Constellation Set.
- Notes: top Dewy green leaves · heart Tuberose, Honeysuckle · base Vanilla, Moss
- Variant: 120 g $18.00, about 22–26 h

### 4.2 Starlit Library

**Ink & Cedar** · `ink-and-cedar` · Scented jar · Woody · Badge: Bestseller · Care: `care.jar` · Images: `cat-ink-and-cedar`, `lif-ink-and-cedar`
- Short: Black tea, old paper and cedarwood. The scent of a library after hours.
- Long *(76)*: Ink & Cedar smells like the corner of a library that nobody else has found. Black tea and a pinch of cardamom open it, warm and a little spicy. At its heart is a dry, papery accord and polished cedarwood, like shelves that have held books for a century. Vetiver and soft leather give it depth as it burns. It pairs naturally with Last Chapter, and the two share a box in the Reading Nook Set.
- Notes: top Black tea, Cardamom · heart Old paper accord, Cedarwood · base Vetiver, Soft leather
- Variants: 220 g $34.00, about 45–50 h · 380 g $48.00, about 75–85 h

**Last Chapter** · `last-chapter` · Scented jar · Gourmand · Care: `care.jar` · Image: `cat-last-chapter`
- Short: Honey, vanilla bean and chamomile over sandalwood. Warm, soft and made for reading late.
- Long *(72)*: You know the feeling: one more chapter, then another, until the tea is cold and the house is silent. Last Chapter is that feeling in a jar. A drop of golden honey opens it, then vanilla bean and soft chamomile wrap around you like a blanket, settling on creamy sandalwood and tonka. It is sweet without being sugary, cozy without being heavy, and it keeps you company until the very last page.
- Notes: top Honey · heart Vanilla bean, Chamomile · base Sandalwood, Tonka
- Variants: 220 g $34.00, about 45–50 h · 380 g $48.00, about 75–85 h

**Margin Notes** · `margin-notes` · Travel tin · Citrus · Care: `care.tin` · Image: `cat-margin-notes`
- Short: Bergamot, lemon peel and Earl Grey. A bright little tin for desks and journeys.
- Long *(79)*: Margin Notes is the scent of a fresh pot of tea beside an open notebook. Bergamot and lemon peel make it bright and awake, Earl Grey tea gives it a smooth, slightly floral middle, and cedar with a touch of white musk keeps it grounded. In a lilac-silver travel tin, it suits a desk on a slow afternoon, a guest room or a weekend away. It is part of the Little Constellation Set, alongside Late Bloom and Quiet Shore.
- Notes: top Bergamot, Lemon peel · heart Earl Grey tea · base Cedar, White musk
- Variant: 120 g $18.00, about 22–26 h

### 4.3 Ember Grove

**Lantern Path** · `lantern-path` · Pillar candle · Woody · Care: `care.pillar` · Images: `cat-lantern-path`, `lif-lantern-path`
- Short: Pine needle, cedar and a thread of smoke. An ivory pillar for long evenings.
- Long *(86)*: Picture a narrow path through the pines, lit by lanterns hung low on the branches. Lantern Path begins with crisp pine needle and a little juniper, moves into warm cedarwood with the faintest thread of birch smoke, and ends on soft amber resin. The ivory pillar stands on its own, so it looks as good unlit on a mantel as it does glowing on a table. Set it on a heat-resistant dish, and give it time: the first burn sets the shape of every burn after.
- Notes: top Pine needle, Juniper · heart Cedarwood, Birch smoke · base Amber resin
- Variants: 7 × 10 cm (350 g) $28.00, about 50–60 h · 7 × 15 cm (520 g) $38.00, about 75–90 h

**Moss & Ember** · `moss-and-ember` · Scented jar · Smoky & amber · Care: `care.jar` · Image: `cat-moss-and-ember`
- Short: Oakmoss, smoked cedar and glowing amber. A deep, smoky jar for cold nights.
- Long *(76)*: Moss & Ember is the clearing at the end of the path, where a fire has burned down to a red glow and the forest floor is soft underfoot. Black pepper gives it a bright, prickling start. Then comes the heart: damp green oakmoss and smoked cedar, earthy and calm. Amber and patchouli warm the base and stay in the room long after the candle is out. It is the darkest, richest scent in Ember Grove.
- Notes: top Black pepper · heart Oakmoss, Smoked cedar · base Amber, Patchouli
- Variants: 220 g $34.00, about 45–50 h · 380 g $48.00, about 75–85 h

**Fir Hollow** · `fir-hollow` · Wax melts · Woody · Care: `care.melt` · Image: `cat-fir-hollow`
- Short: Fir needle, juniper and soft moss, in six wax melts for your warmer.
- Long *(73)*: Fir Hollow is a sheltered dip in the forest where the trees grow close and the air is cool and green. Crushed fir needle and juniper berry open it, soft moss sits at the center, and cedar with the faintest hint of smoke rounds it off. Each clamshell holds six sage-green cubes. Warm one or two at a time in a wax warmer, and when the scent fades, swap in a fresh cube.
- Notes: top Fir needle, Juniper berry · heart Moss · base Cedar, Soft smoke
- Variant: 6 cubes, 80 g $12.00, about 8 h of scent per cube `[confirm with user]`

### 4.4 Lakeside Hush

**Still Water** · `still-water` · Scented jar · Fresh · Care: `care.jar` · Images: `cat-still-water`, `lif-still-water`
- Short: Water lily, white tea and driftwood. As calm as a lake at midnight.
- Long *(73)*: Still Water is the hour when the wind drops and the lake turns to glass. Cool lake air and a little pear open it. Water lily and white tea make a clear, gentle heart, and pale driftwood and soft musk settle underneath like the last of the mist. It is our quietest scent: light enough for a bedroom or a bath, but present enough to notice every time you walk into the room.
- Notes: top Lake air accord, Pear · heart Water lily, White tea · base Driftwood, Soft musk
- Variants: 220 g $34.00, about 45–50 h · 380 g $48.00, about 75–85 h

**Lakelight** · `lakelight` · Pillar candle · Fresh · Care: `care.pillar` · Image: `cat-lakelight`
- Short: Peach blossom, clean linen and lotus. A pale pillar that glows like moonlight on water.
- Long *(79)*: Lakelight is moonlight on the water seen from an open boathouse door, silver and soft. Peach blossom gives it a gentle, fresh start, a clean linen accord and lotus form the heart, and blond woods keep it light and warm underneath. The ivory pillar catches its own flame and glows through the wax as it burns down, which is why we named it after the lake. Stand it on a heat-resistant dish, away from drafts, for an even burn.
- Notes: top Peach blossom · heart Clean linen accord, Lotus · base Blond woods
- Variants: 7 × 10 cm (350 g) $28.00, about 50–60 h · 7 × 15 cm (520 g) $38.00, about 75–90 h

**Quiet Shore** · `quiet-shore` · Travel tin · Citrus · Badge: New · Care: `care.tin` · Image: `cat-quiet-shore`
- Short: Yuzu, fig leaf and cool driftwood. Bright, clean and travel-sized.
- Long *(72)*: Quiet Shore is the far side of the lake, where the path ends at a pebble beach and nobody else comes. Sparkling yuzu wakes it up, green fig leaf and a cool mineral note like wet pebbles give it shape, and pale driftwood keeps it soft. The lilac-silver tin is made for small spaces and short trips. Light it on a bathroom shelf, a bedside table or a desk by the window.
- Notes: top Yuzu · heart Fig leaf, Wet pebble accord · base Driftwood
- Variant: 120 g $18.00, about 22–26 h

### 4.5 Comet Season (limited)

**Gilded Plum** · `gilded-plum` · Wax melts · Gourmand · Badge: Limited · Care: `care.melt` · Images: `cat-gilded-plum`, `lif-comet-season`
- Short: Sugared plum, pink pepper and amber, with a gold shimmer. Limited to Comet Season.
- Long *(77)*: Gilded Plum is a small winter indulgence, as rich as a bowl of dark fruit set out for friends on a cold evening. Pink pepper sparkles at the top, sugared plum makes a deep, jammy heart, and amber and vanilla glow underneath. The pale lilac cubes carry a fine gold shimmer, so the melted wax glints in the warmer. It is limited to Comet Season, so when this batch is gone, it is gone for the year.
- Notes: top Pink pepper · heart Sugared plum · base Amber, Vanilla
- Variant: 6 cubes, 80 g $14.00, about 8 h of scent per cube `[confirm with user: shimmer, scent time]`

**Comet Tail** · `comet-tail` · Scented jar · Smoky & amber · Badges: Limited, New · Care: `care.jar` · Images: `cat-comet-tail`, `lif-comet-season`
- Short: Blood orange, clove and smoked vanilla. A glowing, spiced jar for the longest nights.
- Long *(79)*: Comet Tail is a bright streak across a winter sky, warm at its head and trailing smoke behind. Juicy blood orange opens it, clove and cinnamon bark build a spiced, glowing heart, and smoked vanilla and amber leave a long, warm trail. It is cheerful and cozy at once, made for long nights, snow on the sill and slow evenings at home. Comet Tail is a limited edition for Comet Season and comes in the 220 g jar only.
- Notes: top Blood orange · heart Clove, Cinnamon bark · base Smoked vanilla, Amber
- Variant: 220 g $36.00, about 45–50 h

### 4.6 Gift Sets

| Set | Contents | Separately | Set price |
|---|---|---|---|
| Little Constellation Set | Late Bloom tin, Margin Notes tin, Quiet Shore tin | $54.00 | $49.00 |
| Reading Nook Set | Ink & Cedar 220 g, Last Chapter 220 g | $68.00 | $60.00 |
| Comet Season Gift Box (limited) | Comet Tail 220 g, Gilded Plum melts | $50.00 | $45.00 |

**Little Constellation Set** · `little-constellation-set` · Gift set · Badge: New · Care: `care.tin` · Images: `cat-little-constellation-set`, `lif-little-constellation-set`
- Short: Three travel tins, three moods: Late Bloom, Margin Notes and Quiet Shore.
- Long *(79)*: Can't choose a favorite? Start with three. The Little Constellation Set brings together one travel tin from each of three collections: Late Bloom, a soft after-dark floral from Moonlit Terrace; Margin Notes, bright bergamot and Earl Grey from Starlit Library; and Quiet Shore, fresh yuzu and driftwood from Lakeside Hush. They arrive side by side in a midnight-blue gift box, ready to give, or to try one by one and find the scent that feels most like your evenings.

**Reading Nook Set** · `reading-nook-set` · Gift set · Also in: Starlit Library · Care: `care.jar` · Image: `cat-reading-nook-set`
- Short: Ink & Cedar and Last Chapter, two Starlit Library jars boxed together for a book lover.
- Long *(79)*: The Reading Nook Set pairs two Starlit Library jars, each in the 220 g size. Ink & Cedar, with black tea, old paper and cedarwood, is for the first chapter, when the evening is still young. Last Chapter, with honey, vanilla bean and sandalwood, is for the end of the night, when you promise yourself just one more page. Boxed together in midnight blue, it makes an easy gift for anyone who always has a book on the go.

**Comet Season Gift Box** · `comet-season-gift-box` · Gift set · Badge: Limited · Also in: Comet Season · Care: `care.jar` (plus `care.melt` for the melts) · Image: `cat-comet-season-gift-box`
- Short: Comet Tail jar and Gilded Plum wax melts, boxed together while the season lasts.
- Long *(79)*: The Comet Season Gift Box brings our two limited scents together. Comet Tail, a 220 g jar of blood orange, clove and smoked vanilla, is for lighting on the longest evenings. Gilded Plum, six shimmering wax melts of sugared plum, pink pepper and amber, is for the warmer on the nights in between. Both arrive in a midnight-blue box tied with gold ribbon. Like everything in Comet Season, it is limited, and it will not be restocked this year.

Gift-set packaging copy is `[confirm with user]`. A gift set's care section shows the care list of each type it contains (the Comet Season box shows both jar and melt care); `careNotesRef` names the primary one.

---

## 5. Shared microcopy

### 5.1 Labels

| Key | Text |
|---|---|
| Type labels | Scented jar · Pillar candle · Travel tin · Wax melts · Gift set (inline, lower case: scented jar, pillar candle, travel tin, wax melts, gift set) |
| Badges | Bestseller · New · Limited (sentence case in source; displayed uppercase by the eyebrow style, typography.md §6.3) |
| Scent section | Scent notes · Scent family · Top notes · Heart notes · Base notes |
| Specs | Burn time: "About {min}–{max} hours" · Wax melts: "About {hours} hours of scent per cube" · Gift sets: "Burn times are listed on each candle's own page." · Weight: "{weight} g" · Size · "{pieces} cubes" |

### 5.2 Candle care

Heading: **Caring for your candle**
Intro: A few small habits keep the flame steady and the scent full to the last evening.

**Jars (`care.jar`)**
1. Trim the wick to 5 mm before every burn.
2. On the first burn, let the wax melt all the way to the edge of the jar. This takes about 2 to 3 hours for the 220 g jar and 3 to 4 hours for the 380 g jar.
3. Burn for no more than 4 hours at a time, then let the candle cool before you light it again.
4. Keep it away from drafts, curtains and anything that can catch fire, and out of reach of children and pets.
5. Never leave a burning candle unattended. Stop when about 1 cm of wax is left in the jar.
6. The glass gets hot. Put the lid back on only once the flame is out and the jar has cooled.

**Pillars (`care.pillar`)**
1. Trim the wick to 5 mm before every burn.
2. Always stand the pillar on a heat-resistant dish or plate.
3. On the first burn, let the melt pool spread to about 1 cm from the edge, so the candle burns evenly.
4. Burn for no more than 4 hours at a time, then let it cool before you light it again.
5. Keep it away from drafts, curtains and anything that can catch fire, and out of reach of children and pets.
6. Never leave a burning candle unattended. Stop when about 2 cm of wax is left.

**Travel tins (`care.tin`)**
1. Trim the wick to 5 mm before every burn.
2. On the first burn, let the wax melt all the way to the edge of the tin. This takes about 1 to 2 hours.
3. Burn for no more than 4 hours at a time, then let the tin cool before you light it again.
4. The tin gets hot. Stand it on a heat-resistant surface and don't move it while it is lit.
5. Keep it away from drafts, curtains and anything that can catch fire, and out of reach of children and pets.
6. Never leave a burning candle unattended. Put the lid back on only once the flame is out and the tin has cooled.

**Wax melts (`care.melt`)**
1. Use one or two cubes at a time in a wax warmer made for melts.
2. Never heat wax melts over an open flame or in a pan.
3. Never leave a warmer unattended, and switch it off or put out its tea light when you leave the room.
4. Keep the warmer away from drafts and out of reach of children and pets. Melted wax is hot.
5. When the scent fades, let the wax cool and set before you lift it out and add fresh cubes.

Care copy is general good practice, not a certified safety statement. Before launch the user should check it against the labelling rules where they sell `[confirm with user]`.

### 5.3 Gift-set contents format

- Heading: **In the box**
- One line per item, in `giftSetContents` order:
  - `{name}, {typeLabelInline} ({weight} g)` → "Ink & Cedar, scented jar (220 g)"
  - quantity above 1: `{quantity} × {name}, {typeLabelInline} ({weight} g)` → "2 × Late Bloom, travel tin (120 g)"
  - wax melts: `{name}, wax melts ({pieces} cubes, {weight} g)` → "Gilded Plum, wax melts (6 cubes, 80 g)"
- Each name links to that product's page.
- Then: "Arrives in a midnight-blue gift box with a gold ribbon." `[confirm with user]`
- Optional value line: "Worth {total} if bought separately", where the total is the sum of the contents' current prices, computed by the data layer, never hard-coded `[confirm with user: compare-at pricing rules where they sell]`.

Example (Reading Nook Set):
> **In the box**
> Ink & Cedar, scented jar (220 g)
> Last Chapter, scented jar (220 g)
> Arrives in a midnight-blue gift box with a gold ribbon.
> Worth $68.00 if bought separately

---

## 6. Data needs (for tech-agent, M1.4 / M1.8)

- `Collection`: `slug`, `name`, `tagline`, `description`, `moodNote` (internal, not rendered), `isLimited`, `sortOrder`, `images.mood`.
- `Product`: `slug`, `name`, `type` (`jar | pillar | tin | wax-melt | gift-set`), `collection`, `alsoIn[]`, `shortDescription`, `longDescription`, `scentFamily | null`, `scentNotes { top[], heart[], base[] } | null`, `variants[]`, `badges[]` (`bestseller | new | limited`), `careNotesRef`, `giftSetContents[] | null`, `images { catalog, lifestyle[] }`, `sortOrder`.
- `Variant`: `sku`, `label`, `weightGrams`, `dimensionsCm { diameter, height } | null`, `price { amount, currency }`, `burnTimeHours { min, max } | null`, `warmTimeHoursPerPiece | null`, `pieces | null`.
- `GiftSetItem`: `productSlug`, `sku`, `quantity`. The seed should validate that every referenced slug and sku exists.
- Image ids resolve to files and alt text through `design/art/shot-list.json` (delivery spec in `design/art/art-direction.md` §9).
- `moodNote` is art direction only. Don't render it.

### 6.1 Data needs for M1.4: derived fields

These are not stored in `catalog.json`. The listing, filter and card specs will need them, and Firestore can't compute them at query time. This is a description of the need only; **tech-agent decides the implementation** (computed in the seed, in a converter, in a Function, or not stored at all).

| Field | Derived from | Needed for |
|---|---|---|
| `priceFrom` | the lowest `variants[].price.amount` (with its currency) | the card's "From $34.00" price, sorting by price, a price filter |
| `sizeKeys[]` | one normalised key per variant (for example `220g`, `380g`, `120g`, `7x10`, `7x15`, `6-cubes`, `set`) | a size filter |
| `collectionSlugs[]` | `collection` plus every `alsoIn` slug | a collection page that also lists `alsoIn` products (Reading Nook Set on Starlit Library, Comet Season Gift Box on Comet Season) with one query |
| `scentFamilies[]` | gift sets: the set of their contents' `scentFamily` values (§2.1); other products: `[scentFamily]` | a scent-family filter that also finds gift sets |

**Firestore limit to plan around:** a query may contain at most one `array-contains` or `array-contains-any` clause (and `array-contains` can't be combined with `array-contains-any`). So "collection X **and** scent family Y" can't be two array clauses in one query. With 17 products per catalog this is small either way; how to handle it (filter one dimension in memory, or another structure) is tech-agent's call. Any composite indexes go in `firestore.indexes.json`.

## 7. IP guardrail check (blocking)

I re-read every name, slug, tagline, description, note, care line and microcopy string for the guardrail, including every string changed in fix round 1:

- **Names and slugs** are ordinary English words and phrases: terrace, library, grove, lake, comet, lantern, cedar, chapter, margin, moss, fir, shore, constellation, reading nook, moonrise, late bloom, gilded plum. None is a character, place, court, people, faction, title or invented term from any book series. None uses "Court of …", "Night Court", "High Lord/Lady", "mate", or a named kind of magic.
- **Deliberately avoided:** one-word "star + fall" style compounds and any falling-sky framing (the series has a named star-shower celebration), so nothing in Comet Season falls, streaks down or is wished on; "frost" paired with "starlight" (that pairing echoes a series title); the "A … of X and Y" title construction the series' books use (plain two-ingredient names such as "Ink & Cedar" or "Moss & Ember" are ordinary candle naming and don't follow it; no pairing used here repeats a series title word pair); "silver" with the brand's "flames"; any "city of …" or "house of …" epithet; wings and winged imagery; seasonal court names (so no "Winter …", "Spring …", "Summer …" or "Autumn …" product names); and any phrasing about wishing or speaking to the stars.
- **Where the names came from.** The collection names, Lantern Path and the three replaced names were invented by the orchestrator for an exploratory mockup; the user did not choose them. In fix round 1, the user chose **Moonrise** to replace Silver Hour (which sat too close to a series title next to the brand name). design-agent chose **Late Bloom** and **Gilded Plum** (reasons and trademark notes in §8); the user can veto either.
- **Atmosphere** (night sky, mountains, a hillside town, a lake balcony, an enchanted-feeling forest) is described in my own words, with no quotes or close paraphrases.
- **Other trademarks:** "Night Garden" is gone (it is part of the title of a well-known children's TV series). "Moonrise" is a common English word; it is also the first word of a well-known film title, but the single word on a candle is generic. I know of no well-known trademark or title called "Late Bloom" or "Gilded Plum". A professional trademark search before launch is still advised for every product name and for "Starflames" itself (class 4, candles).

## 8. Open questions

1. **Currency.** USD is a placeholder; prices are sample levels. `[confirm with user]`
2. **Price levels.** Are $34/$48 jars, $28/$38 pillars, $18 tins and $12–14 melts the right tier? `[confirm with user]`
3. **Production and material claims** (hand-poured, small batch, wax type, wick, fragrance oils). None is used. `[confirm with user]`
4. **The two new names** `[confirm with user: veto or keep]`:
   - **Late Bloom** (replaces Night Garden; tuberose and honeysuckle tin). Flowers that open their scent after dark, said plainly, and a gentle nod to the night owls who light candles late. It keeps the moon out of the name, because Moonlit Terrace already holds Moonrise. No sky, no falling, no wishing. I know of no well-known trademark or title with this name (the nearest is the everyday idiom "late bloomer").
   - **Gilded Plum** (replaces Falling Star; plum, pink pepper and vanilla wax melts). It names the heart note and the gold shimmer, and it reads as a rich winter treat, so it fits Comet Season without borrowing the sky. No falling, star-shower, sky-fall or wish connotations. I know of no well-known trademark or title with this name. It depends on the shimmer being real (question 7): if the cubes have no shimmer, rename it or keep it for the amber glow only.
   - Rejected: "Moonflower" (a third moon name in one collection), "Sugared Plum" (it repeats the heart note word for word and sits close to the well-known "Sugar Plum" ballet character), "Winter Plum" (seasonal-court echo), any "Night…" or "Star…" compound.
5. **Gift packaging.** Is a midnight-blue box with a gold ribbon real? It appears in both copy and imagery. `[confirm with user]`
6. **Comet Season.** Dates, and whether the "won't be back this year" promise is right. `[confirm with user]`
7. **Gilded Plum shimmer** and the 8-hours-per-cube figure. `[confirm with user]`
