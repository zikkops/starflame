import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import type {
  Collection,
  CollectionSlug,
  GiftSetContentLine,
  Product,
  ProductCard,
  ProductDetail,
  ProductSlug,
} from "../../types";
import { getAdminFirestore } from "../admin";
import { storageObjectUrl } from "../storage-url";
import { decodeFromCache, encodeForCache } from "./cache-codec";
import { CACHE_TAGS, type CacheTag } from "./cache-tags";
import * as reads from "./catalog-reads";

/**
 * The catalog repositories for Server Components, generateStaticParams and Route Handlers
 * (design/tech/M1.6-repositories.md). Each one is cached in two layers:
 *   - unstable_cache: the result is kept across requests until its tag is revalidated (CACHE_TAGS;
 *     M7's admin writes), and each build starts empty (scripts/clear-data-cache.mjs). Next 16.4
 *     without cacheComponents (off since M1.1) has no "use cache", so this is the cache for
 *     non-fetch data. Pages that read it inherit its tags.
 *   - React cache(): calls with the same arguments in one render share one promise (for
 *     example generateMetadata and the page, or the footer and a collection page).
 * Only published documents come back; a missing or unpublished one is null or left out.
 */

/** The first cache key part. scripts/check-client-bundle.mjs fails a build whose client chunks hold it. */
const REPOSITORY_CACHE_KEY = "starflames-catalog";

const source = (): reads.CatalogSource => ({
  db: getAdminFirestore(),
  imageUrl: (storagePath) => storageObjectUrl(storagePath),
});

/** The names in use. Every wrapper below has the same source text, so its name is its key. */
const cacheNames = new Set<string>();

/**
 * Wraps a read. `name` is part of the cache key: unstable_cache keys on the function's source
 * text, the key parts and JSON.stringify(arguments), so arguments must be JSON values. The
 * source text is the same for every wrapper, so a reused name would share entries with another
 * read: it throws when the module loads.
 */
function cachedRead<Args extends (string | number)[], R>(
  name: string,
  tag: CacheTag,
  read: (src: reads.CatalogSource, ...args: Args) => Promise<R>,
): (...args: Args) => Promise<R> {
  if (cacheNames.has(name)) {
    throw new Error(`[repositories] cache name "${name}" is used twice`);
  }
  cacheNames.add(name);
  const stored = unstable_cache(
    async (...args: Args) => encodeForCache(await read(source(), ...args)),
    [REPOSITORY_CACHE_KEY, name],
    { tags: [tag], revalidate: false },
  );
  return cache(async (...args: Args) =>
    decodeFromCache<R>(await stored(...args)),
  );
}

/** Every published product as a card, by sortOrder (the shop, M3.5, filters these in memory). */
export const getProducts: () => Promise<ProductCard[]> = cachedRead(
  "products",
  CACHE_TAGS.products,
  reads.readProducts,
);

/** The published product, or null (then the page calls notFound()). One document read. */
export const getProductBySlug: (slug: string) => Promise<ProductDetail | null> =
  cachedRead("product", CACHE_TAGS.products, reads.readProductBySlug);

/** The published products a collection lists (primary or alsoIn), by sortOrder. */
export const getProductsByCollection: (slug: string) => Promise<ProductCard[]> =
  cachedRead(
    "products-in-collection",
    CACHE_TAGS.products,
    reads.readProductsByCollection,
  );

/** Published products with the bestseller badge, by sortOrder; limit 1–50. */
export const getBestsellers: (limit: number) => Promise<ProductCard[]> =
  cachedRead("bestsellers", CACHE_TAGS.products, reads.readBestsellers);

const relatedProducts = cachedRead(
  "related",
  CACHE_TAGS.products,
  reads.readRelatedProducts,
);

/**
 * Up to `limit` (1–50) other published products listed in the product's primary collection
 * (primary or alsoIn), by sortOrder.
 */
export function getRelatedProducts(
  product: Pick<Product, "slug" | "collection">,
  limit: number,
): Promise<ProductCard[]> {
  return relatedProducts(product.slug, product.collection, limit);
}

// Slugs never contain a comma (SLUG_PATTERN), so a joined list is a stable cache argument.
const cardsBySlugs = cachedRead(
  "cards-by-slugs",
  CACHE_TAGS.products,
  (src, joined: string) =>
    reads.readProductCardsBySlugs(src, joined.split(",")),
);

/** Published products as cards, in first-seen order (one getAll, at most 100 slugs). */
export function getProductCardsBySlugs(
  slugs: readonly string[],
): Promise<ProductCard[]> {
  if (slugs.length === 0) return Promise.resolve([]);
  return cardsBySlugs(slugs.join(","));
}

/** A gift set's contents with their cards, in contents order (one getAll); [] for other types. */
export async function getGiftSetContents(
  product: Pick<Product, "slug" | "giftSetContents">,
): Promise<GiftSetContentLine[]> {
  const slugs = reads.giftSetContentSlugs(product);
  if (slugs.length === 0) return [];
  return reads.giftSetContentLines(
    product,
    await getProductCardsBySlugs(slugs),
  );
}

/** Every published collection, by sortOrder (nav, footer "Our collections", collection index). */
export const getCollections: () => Promise<Collection[]> = cachedRead(
  "collections",
  CACHE_TAGS.collections,
  reads.readCollections,
);

/** The published collection, or null. One document read. */
export const getCollectionBySlug: (slug: string) => Promise<Collection | null> =
  cachedRead("collection", CACHE_TAGS.collections, reads.readCollectionBySlug);

/** For the product page's generateStaticParams (dynamicParams = false, M1.13 PUSHBACK 2). */
export const getPublishedProductSlugs: () => Promise<ProductSlug[]> =
  cachedRead(
    "product-slugs",
    CACHE_TAGS.products,
    reads.readPublishedProductSlugs,
  );

/** For the collection page's generateStaticParams. */
export const getCollectionSlugs: () => Promise<CollectionSlug[]> = cachedRead(
  "collection-slugs",
  CACHE_TAGS.collections,
  reads.readCollectionSlugs,
);
