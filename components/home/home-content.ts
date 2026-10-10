import type { StaticImageData } from "next/image";

import catalog from "@/design/copy/catalog.json";
import colCometSeason from "@/public/images/collections/col-comet-season.jpg";
import colEmberGrove from "@/public/images/collections/col-ember-grove.jpg";
import colGiftSets from "@/public/images/collections/col-gift-sets.jpg";
import colLakesideHush from "@/public/images/collections/col-lakeside-hush.jpg";
import colMoonlitTerrace from "@/public/images/collections/col-moonlit-terrace.jpg";
import colStarlitLibrary from "@/public/images/collections/col-starlit-library.jpg";
import catFirHollow from "@/public/images/products/cat-fir-hollow.jpg";
import catLanternPath from "@/public/images/products/cat-lantern-path.jpg";
import catLateBloom from "@/public/images/products/cat-late-bloom.jpg";
import catStillWater from "@/public/images/products/cat-still-water.jpg";
import catInkAndCedar from "@/public/images/products/cat-ink-and-cedar.jpg";
import catMidnightBalcony from "@/public/images/products/cat-midnight-balcony.jpg";
import catMoonrise from "@/public/images/products/cat-moonrise.jpg";
import catQuietShore from "@/public/images/products/cat-quiet-shore.jpg";

/**
 * Static home content (user request, 2026-10-10: the home page is built
 * without the data layer for now). Names, taglines, descriptions and prices
 * come from design/copy/catalog.json; alts from home.md §11.3.
 */

export type HomeCollection = {
  slug: string;
  name: string;
  tagline: string;
  isLimited: boolean;
  image: StaticImageData;
  alt: string;
};

export type HomeProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  price: string;
  badge: "bestseller" | "new";
  image: StaticImageData;
};

const COLLECTION_IMAGES: Record<
  string,
  { image: StaticImageData; alt: string }
> = {
  "moonlit-terrace": {
    image: colMoonlitTerrace,
    alt: "A lit candle in a smoky blue glass jar on a stone balustrade at night, above a valley of town lights, mountains, stars and a crescent moon.",
  },
  "starlit-library": {
    image: colStarlitLibrary,
    alt: "A lit candle in a smoky blue glass jar on an oak reading table beside old leather books and a cup of tea, under a tall window full of stars.",
  },
  "ember-grove": {
    image: colEmberGrove,
    alt: "A lit ivory pillar candle on a mossy stone in a pine forest at night, with violet mist and tiny drifting lights between the trees.",
  },
  "lakeside-hush": {
    image: colLakesideHush,
    alt: "A lit candle in a smoky blue glass jar on a wooden jetty beside a folded linen throw, over a still, misty lake reflecting the moon and mountains.",
  },
  "comet-season": {
    image: colCometSeason,
    alt: "A lit candle in a smoky blue glass jar and a pack of lilac wax melts on a winter windowsill, with a faint comet over snowy mountains.",
  },
  "gift-sets": {
    image: colGiftSets,
    alt: "An open midnight-blue gift box of lilac-silver travel tins on ivory linen, with a gold ribbon and one tin lit in front.",
  },
};

export const HOME_COLLECTIONS: HomeCollection[] = [...catalog.collections]
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .slice(0, 6)
  .map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    isLimited: c.isLimited,
    ...COLLECTION_IMAGES[c.slug]!,
  }));

const PRODUCT_IMAGES: Record<string, StaticImageData> = {
  moonrise: catMoonrise,
  "ink-and-cedar": catInkAndCedar,
  "midnight-balcony": catMidnightBalcony,
  "quiet-shore": catQuietShore,
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** home.md §5.1, seed result: two bestsellers, then two new arrivals. */
const BESTSELLER_PICKS: { slug: string; badge: HomeProduct["badge"] }[] = [
  { slug: "moonrise", badge: "bestseller" },
  { slug: "ink-and-cedar", badge: "bestseller" },
  { slug: "midnight-balcony", badge: "new" },
  { slug: "quiet-shore", badge: "new" },
];

export const HOME_BESTSELLERS: HomeProduct[] = BESTSELLER_PICKS.map(
  ({ slug, badge }) => {
    const p = catalog.products.find((product) => product.slug === slug)!;
    const amounts = p.variants.map((v) => v.price.amount);
    const min = Math.min(...amounts);
    const max = Math.max(...amounts);
    return {
      slug,
      name: p.name,
      shortDescription: p.shortDescription,
      price:
        min === max ? usd.format(min / 100) : `From ${usd.format(min / 100)}`,
      badge,
      image: PRODUCT_IMAGES[slug]!,
    };
  },
);

export const BADGE_LABELS = catalog.microcopy.badgeLabels;

/* ── Shop by type (user request, 2026-10-10: one row of 4 candle types) ─── */

export type HomeType = {
  type: "jar" | "pillar" | "tin" | "wax-melt";
  name: string;
  tagline: string;
  count: string;
  image: StaticImageData;
  alt: string;
};

const countOf = (type: string) =>
  catalog.products.filter((product) => product.type === type).length;
const scents = (n: number) => `${n} ${n === 1 ? "scent" : "scents"}`;

export const HOME_TYPES: HomeType[] = [
  {
    type: "jar",
    name: "Scented jars",
    tagline: "Smoky blue glass and a gold lid, for long evenings in.",
    count: scents(countOf("jar")),
    image: catStillWater,
    alt: "A lit candle in a smoky blue glass jar with a gold lid on a dark surface under a starry sky.",
  },
  {
    type: "pillar",
    name: "Pillar candles",
    tagline: "Tall, unhurried flames for a table, a window or a mantel.",
    count: scents(countOf("pillar")),
    image: catLanternPath,
    alt: "A lit ivory pillar candle on a gold dish beside a sprig of pine, under a starry sky.",
  },
  {
    type: "tin",
    name: "Travel tins",
    tagline: "Small, lidded and ready to go wherever the night does.",
    count: scents(countOf("tin")),
    image: catLateBloom,
    alt: "A lit candle in a lilac-silver travel tin beside its lid and a few white blossoms.",
  },
  {
    type: "wax-melt",
    name: "Wax melts",
    tagline: "Scented wax cubes for a melt warmer: all the scent, no wick.",
    count: scents(countOf("wax-melt")),
    image: catFirHollow,
    alt: "A tray of sage-green wax melt cubes beside a lit tealight, a sprig of pine and juniper berries.",
  },
];
