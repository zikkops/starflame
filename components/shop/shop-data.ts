import type { StaticImageData } from "next/image";

import catalog from "@/design/copy/catalog.json";
import catCometSeasonGiftBox from "@/public/images/products/cat-comet-season-gift-box.jpg";
import catCometTail from "@/public/images/products/cat-comet-tail.jpg";
import catFirHollow from "@/public/images/products/cat-fir-hollow.jpg";
import catGildedPlum from "@/public/images/products/cat-gilded-plum.jpg";
import catInkAndCedar from "@/public/images/products/cat-ink-and-cedar.jpg";
import catLakelight from "@/public/images/products/cat-lakelight.jpg";
import catLanternPath from "@/public/images/products/cat-lantern-path.jpg";
import catLastChapter from "@/public/images/products/cat-last-chapter.jpg";
import catLateBloom from "@/public/images/products/cat-late-bloom.jpg";
import catLittleConstellationSet from "@/public/images/products/cat-little-constellation-set.jpg";
import catMarginNotes from "@/public/images/products/cat-margin-notes.jpg";
import catMidnightBalcony from "@/public/images/products/cat-midnight-balcony.jpg";
import catMoonrise from "@/public/images/products/cat-moonrise.jpg";
import catMossAndEmber from "@/public/images/products/cat-moss-and-ember.jpg";
import catQuietShore from "@/public/images/products/cat-quiet-shore.jpg";
import catReadingNookSet from "@/public/images/products/cat-reading-nook-set.jpg";
import catStillWater from "@/public/images/products/cat-still-water.jpg";

/**
 * The shop's product list (user request, 2026-10-10): static, from
 * design/copy/catalog.json, not yet read from the data layer. Plain data, so
 * the page can pass it to the client-side filters.
 */

export type ShopBadge = "limited" | "new" | "bestseller";

export type ShopProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  type: string;
  typeLabel: string;
  scentFamily: string | null;
  collections: string[];
  /** Cents. */
  priceFrom: number;
  priceTo: number;
  sizes: string[];
  badges: ShopBadge[];
  sortOrder: number;
  image: StaticImageData;
};

export type FilterOption = { value: string; label: string };

const IMAGES: Record<string, StaticImageData> = {
  moonrise: catMoonrise,
  "midnight-balcony": catMidnightBalcony,
  "late-bloom": catLateBloom,
  "ink-and-cedar": catInkAndCedar,
  "last-chapter": catLastChapter,
  "margin-notes": catMarginNotes,
  "lantern-path": catLanternPath,
  "moss-and-ember": catMossAndEmber,
  "fir-hollow": catFirHollow,
  "still-water": catStillWater,
  lakelight: catLakelight,
  "quiet-shore": catQuietShore,
  "gilded-plum": catGildedPlum,
  "comet-tail": catCometTail,
  "little-constellation-set": catLittleConstellationSet,
  "reading-nook-set": catReadingNookSet,
  "comet-season-gift-box": catCometSeasonGiftBox,
};

const TYPE_LABELS: Record<string, string> = catalog.microcopy.typeLabels;
const BADGE_ORDER: ShopBadge[] = ["limited", "new", "bestseller"];

export const SHOP_PRODUCTS: ShopProduct[] = catalog.products.map((p, index) => {
  const amounts = p.variants.map((v) => v.price.amount);
  const badges = ((p as { badges?: string[] }).badges ?? []) as ShopBadge[];
  return {
    slug: p.slug,
    name: p.name,
    shortDescription: p.shortDescription,
    type: p.type,
    typeLabel: TYPE_LABELS[p.type] ?? p.type,
    scentFamily: p.scentFamily ?? null,
    collections: [p.collection, ...(p.alsoIn ?? [])],
    priceFrom: Math.min(...amounts),
    priceTo: Math.max(...amounts),
    sizes: p.variants.map((v) => v.label),
    badges: BADGE_ORDER.filter((b) => badges.includes(b)).slice(0, 2),
    sortOrder: index,
    image: IMAGES[p.slug]!,
  };
});

const PLURAL_TYPES: Record<string, string> = {
  jar: "Scented jars",
  pillar: "Pillar candles",
  tin: "Travel tins",
  "wax-melt": "Wax melts",
  "gift-set": "Gift sets",
};

export const TYPE_OPTIONS: FilterOption[] = Object.entries(PLURAL_TYPES).map(
  ([value, label]) => ({ value, label }),
);

export const SCENT_OPTIONS: FilterOption[] = [...catalog.scentFamilies]
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((s) => ({ value: s.slug, label: s.label }));

export const COLLECTION_OPTIONS: FilterOption[] = [...catalog.collections]
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .map((c) => ({ value: c.slug, label: c.name }));

export const PRICE_OPTIONS: FilterOption[] = [
  { value: "under-25", label: "Under $25" },
  { value: "25-40", label: "$25 to $40" },
  { value: "over-40", label: "Over $40" },
];

export const BADGE_LABELS: Record<ShopBadge, string> =
  catalog.microcopy.badgeLabels;
