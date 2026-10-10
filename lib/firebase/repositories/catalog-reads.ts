import "server-only";

import type {
  DocumentSnapshot,
  Firestore,
  Query,
} from "firebase-admin/firestore";

import {
  giftSetLines,
  toProductCard,
  toProductDetail,
  type ImageUrlResolver,
} from "../../domain/derive-product";
import {
  asCollectionSlug,
  asProductSlug,
  SLUG_PATTERN,
} from "../../domain/ids";
import { ValidationError } from "../../domain/validate";
import type {
  Collection,
  CollectionSlug,
  GiftSetContentLine,
  Product,
  ProductCard,
  ProductDetail,
  ProductSlug,
  PublishStatus,
} from "../../types";
import { DocumentValidationError } from "../converter-utils";
import { adminCollections } from "../converters.admin";
import { COLLECTIONS } from "../paths";

/**
 * Uncached catalog reads (design/tech/M1.6-repositories.md). Pages use the cached wrappers in
 * ./catalog.ts; tests and scripts call these with their own Firestore. The Admin SDK skips the
 * security rules, so every read here returns published documents only: each query filters
 * `status == "published"`, and every document is checked again in memory.
 */

export type CatalogSource = {
  readonly db: Firestore;
  readonly imageUrl: ImageUrlResolver;
};

const PUBLISHED: PublishStatus = "published";
const BESTSELLER = "bestseller";

/** Upper bounds for caller-supplied sizes; a value outside them is a programming error. */
export const READ_LIMITS = { list: 50, slugs: 100 } as const;

/** The queries the reads run. The index-coverage test rebuilds each one from QUERY_SHAPES. */
export const catalogQueries = {
  products: (db: Firestore) =>
    adminCollections(db)
      .products.where("status", "==", PUBLISHED)
      .orderBy("sortOrder"),
  productsInCollection: (db: Firestore, slug: string) =>
    adminCollections(db)
      .products.where("collectionSlugs", "array-contains", slug)
      .where("status", "==", PUBLISHED)
      .orderBy("sortOrder"),
  bestsellers: (db: Firestore) =>
    adminCollections(db)
      .products.where("badges", "array-contains", BESTSELLER)
      .where("status", "==", PUBLISHED)
      .orderBy("sortOrder"),
  collections: (db: Firestore) =>
    adminCollections(db)
      .collections.where("status", "==", PUBLISHED)
      .orderBy("sortOrder"),
  productIds: (db: Firestore) =>
    db
      .collection(COLLECTIONS.products)
      .where("status", "==", PUBLISHED)
      .select("status"),
  collectionIds: (db: Firestore) =>
    db
      .collection(COLLECTIONS.collections)
      .where("status", "==", PUBLISHED)
      .select("status"),
};

export type QueryName = keyof typeof catalogQueries;

/** One query's shape. `{ param: true }` is the value the caller passes (the argument after db). */
export type QueryShape = {
  readonly collectionGroup: "products" | "collections";
  readonly where: readonly {
    readonly field: string;
    readonly op: "==" | "array-contains";
    readonly value: string | { readonly param: true };
  }[];
  readonly orderBy: readonly string[];
  /** The fields select() keeps (`status` for the slug lists), or null for whole documents. */
  readonly select: readonly string[] | null;
};

export const QUERY_SHAPES: Readonly<Record<QueryName, QueryShape>> = {
  products: {
    collectionGroup: "products",
    where: [{ field: "status", op: "==", value: PUBLISHED }],
    orderBy: ["sortOrder"],
    select: null,
  },
  productsInCollection: {
    collectionGroup: "products",
    where: [
      {
        field: "collectionSlugs",
        op: "array-contains",
        value: { param: true },
      },
      { field: "status", op: "==", value: PUBLISHED },
    ],
    orderBy: ["sortOrder"],
    select: null,
  },
  bestsellers: {
    collectionGroup: "products",
    where: [
      { field: "badges", op: "array-contains", value: BESTSELLER },
      { field: "status", op: "==", value: PUBLISHED },
    ],
    orderBy: ["sortOrder"],
    select: null,
  },
  collections: {
    collectionGroup: "collections",
    where: [{ field: "status", op: "==", value: PUBLISHED }],
    orderBy: ["sortOrder"],
    select: null,
  },
  productIds: {
    collectionGroup: "products",
    where: [{ field: "status", op: "==", value: PUBLISHED }],
    orderBy: [],
    select: ["status"],
  },
  collectionIds: {
    collectionGroup: "collections",
    where: [{ field: "status", op: "==", value: PUBLISHED }],
    orderBy: [],
    select: ["status"],
  },
};

/** Route params arrive unchecked; a non-slug (e.g. with "/") never becomes a document path. */
const isSlug = (value: string): boolean =>
  value.length <= 80 && SLUG_PATTERN.test(value);

function checkLimit(limit: number, max: number): void {
  if (!Number.isInteger(limit) || limit < 1 || limit > max) {
    throw new RangeError(
      `limit must be an integer from 1 to ${max}, got ${limit}`,
    );
  }
}

/** Logs the document path and the failing field only, never document data. */
function logSkipped(error: DocumentValidationError): void {
  const field =
    error.cause instanceof ValidationError ? error.cause.path || "(root)" : "?";
  console.error(
    `[repositories] skipped invalid document ${error.docPath} (field ${field})`,
  );
}

/** The decoded, published documents of a list. An invalid one is logged and skipped (M1.4 §1). */
function publishedOf<T extends { readonly status: PublishStatus }>(
  snapshots: readonly DocumentSnapshot<T>[],
): T[] {
  const out: T[] = [];
  for (const snapshot of snapshots) {
    let doc: T | undefined;
    try {
      doc = snapshot.data();
    } catch (error) {
      if (!(error instanceof DocumentValidationError)) throw error;
      logSkipped(error);
      continue;
    }
    if (doc?.status === PUBLISHED) out.push(doc);
  }
  return out;
}

async function listOf<T extends { readonly status: PublishStatus }>(
  query: Query<T>,
): Promise<T[]> {
  const snapshot = await query.get();
  return publishedOf(snapshot.docs);
}

/** One document by ID; null unless published. An invalid document throws (detail reads fail loud). */
async function publishedDoc<T extends { readonly status: PublishStatus }>(ref: {
  get(): Promise<DocumentSnapshot<T>>;
}): Promise<T | null> {
  const snapshot = await ref.get();
  const doc = snapshot.data();
  return doc?.status === PUBLISHED ? doc : null;
}

const cardsOf = (src: CatalogSource, products: readonly Product[]) =>
  products.map((product) => toProductCard(product, src.imageUrl));

/** Every published product, by sortOrder. The shop filters and sorts these in memory (M1.4). */
export async function readProducts(src: CatalogSource): Promise<ProductCard[]> {
  return cardsOf(src, await listOf(catalogQueries.products(src.db)));
}

export async function readProductBySlug(
  src: CatalogSource,
  slug: string,
): Promise<ProductDetail | null> {
  if (!isSlug(slug)) return null;
  const product = await publishedDoc(
    adminCollections(src.db).products.doc(slug),
  );
  return product ? toProductDetail(product, src.imageUrl) : null;
}

/** The products a collection lists (primary or alsoIn), by sortOrder. */
export async function readProductsByCollection(
  src: CatalogSource,
  slug: string,
): Promise<ProductCard[]> {
  if (!isSlug(slug)) return [];
  return cardsOf(
    src,
    await listOf(catalogQueries.productsInCollection(src.db, slug)),
  );
}

export async function readBestsellers(
  src: CatalogSource,
  limit: number,
): Promise<ProductCard[]> {
  checkLimit(limit, READ_LIMITS.list);
  return cardsOf(
    src,
    await listOf(catalogQueries.bestsellers(src.db).limit(limit)),
  );
}

/**
 * Other products listed in the product's primary collection (primary or alsoIn), by sortOrder:
 * one query with limit + 1, then the product itself is dropped.
 */
export async function readRelatedProducts(
  src: CatalogSource,
  productSlug: string,
  collection: string,
  limit: number,
): Promise<ProductCard[]> {
  checkLimit(limit, READ_LIMITS.list);
  if (!isSlug(collection)) return [];
  const query = catalogQueries
    .productsInCollection(src.db, collection)
    .limit(limit + 1);
  const related = (await listOf(query)).filter((p) => p.slug !== productSlug);
  return cardsOf(src, related.slice(0, limit));
}

/**
 * Published products by slug, in first-seen order without duplicates: one getAll round trip
 * whatever the count (no N+1). Missing, unpublished and invalid documents are left out.
 */
export async function readProductCardsBySlugs(
  src: CatalogSource,
  slugs: readonly string[],
): Promise<ProductCard[]> {
  const unique = [...new Set(slugs)].filter(isSlug);
  if (unique.length > READ_LIMITS.slugs) {
    throw new RangeError(
      `at most ${READ_LIMITS.slugs} slugs per read, got ${unique.length}`,
    );
  }
  if (unique.length === 0) return [];
  const products = adminCollections(src.db).products;
  // Firestore#getAll is typed DocumentSnapshot<DocumentData>, but each snapshot decodes with its
  // reference's converter (the repository tests check this); the cast restores that type.
  const snapshots = (await src.db.getAll(
    ...unique.map((slug) => products.doc(slug)),
  )) as DocumentSnapshot<Product>[];
  return cardsOf(src, publishedOf(snapshots));
}

/** The content slugs to read for a gift set, in contents order; [] for other products. */
export function giftSetContentSlugs(
  product: Pick<Product, "giftSetContents">,
): ProductSlug[] {
  return (product.giftSetContents ?? []).map((item) => item.productSlug);
}

/** Joins a gift set's contents to their cards; a line that can't be shown is logged and left out. */
export function giftSetContentLines(
  product: Pick<Product, "slug" | "giftSetContents">,
  cards: readonly ProductCard[],
): GiftSetContentLine[] {
  const { lines, missing } = giftSetLines(product.giftSetContents ?? [], cards);
  for (const item of missing) {
    console.error(
      `[repositories] gift set ${product.slug}: contents ${item.productSlug} / ${item.sku} unavailable`,
    );
  }
  return lines;
}

/** A gift set's contents as lines with the content cards (one getAll); [] for other products. */
export async function readGiftSetContents(
  src: CatalogSource,
  product: Pick<Product, "slug" | "giftSetContents">,
): Promise<GiftSetContentLine[]> {
  const slugs = giftSetContentSlugs(product);
  if (slugs.length === 0) return [];
  return giftSetContentLines(
    product,
    await readProductCardsBySlugs(src, slugs),
  );
}

/** Every published collection, by sortOrder. */
export async function readCollections(
  src: CatalogSource,
): Promise<Collection[]> {
  return listOf(catalogQueries.collections(src.db));
}

export async function readCollectionBySlug(
  src: CatalogSource,
  slug: string,
): Promise<Collection | null> {
  if (!isSlug(slug)) return null;
  return publishedDoc(adminCollections(src.db).collections.doc(slug));
}

/**
 * The sorted IDs of the published documents among `docs` (read with select("status")): the
 * status is checked again in memory, like every other read. A non-slug ID is skipped (none can
 * be written).
 */
export function publishedIds<T>(
  docs: readonly Pick<DocumentSnapshot, "id" | "get">[],
  brand: (id: string) => T,
): T[] {
  return docs
    .filter((doc) => doc.get("status") === PUBLISHED)
    .map((doc) => doc.id)
    .filter(isSlug)
    .sort()
    .map(brand);
}

async function idsOf<T>(query: Query, brand: (id: string) => T): Promise<T[]> {
  const snapshot = await query.get();
  return publishedIds(snapshot.docs, brand);
}

/** For generateStaticParams: every published product's slug, sorted. Reads only `status`. */
export async function readPublishedProductSlugs(
  src: CatalogSource,
): Promise<ProductSlug[]> {
  return idsOf(catalogQueries.productIds(src.db), asProductSlug);
}

/** For generateStaticParams: every published collection's slug, sorted. */
export async function readCollectionSlugs(
  src: CatalogSource,
): Promise<CollectionSlug[]> {
  return idsOf(catalogQueries.collectionIds(src.db), asCollectionSlug);
}
