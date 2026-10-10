import {
  SCENT_FAMILIES,
  type CollectionSlug,
  type GiftSetContentLine,
  type GiftSetItem,
  type Money,
  type Product,
  type ProductCard,
  type ProductDerived,
  type ProductDetail,
  type ProductImage,
  type ProductInput,
  type ProductSlug,
  type ProductType,
  type ResolvedImage,
  type ScentFamily,
  type Variant,
} from "../types";

export class DeriveError extends Error {
  override name = "DeriveError";
}

/**
 * The size filter key of a variant: "220g", "380g", "120g", "7x10", "7x15", "6-cubes", "set"
 * (catalog.md §6.1). Stable, URL-safe, and the same across products of one size.
 */
export function sizeKeyOf(type: ProductType, variant: Variant): string {
  if (type === "gift-set") return "set";
  if (variant.pieces !== null) return `${variant.pieces}-cubes`;
  if (type === "pillar" && variant.dimensionsCm !== null) {
    const { diameter, height } = variant.dimensionsCm;
    return `${diameter}x${height}`;
  }
  return `${variant.weightGrams}g`;
}

/** Looks up another product's authored fields, for gift-set contents. */
export type ProductLookup = (slug: ProductSlug) => ProductInput | undefined;

function unique<T>(values: readonly T[]): T[] {
  return [...new Set(values)];
}

/**
 * Computes every denormalised field of a product. The only writer of ProductDerived: the seed
 * (M1.8) and admin writes (M7) call it on each write. When any product changes, M7 re-derives
 * every gift set too (their families and value depend on their contents; ≤200 docs).
 * Throws DeriveError when gift-set contents can't be resolved.
 */
export function deriveProductFields(
  product: ProductInput,
  lookup: ProductLookup,
): ProductDerived {
  const amounts = product.variants.map((v) => v.price.amount);
  const first = product.variants[0];
  const cardImage = product.images.find((i) => i.role === "catalog");
  if (!first || !cardImage) {
    throw new DeriveError(
      `${product.slug}: needs a variant and a catalog image`,
    );
  }

  let scentFamilies: ScentFamily[];
  let giftSetValue: Money | null = null;
  if (product.giftSetContents === null) {
    if (product.scentFamily === null) {
      throw new DeriveError(`${product.slug}: scentFamily is missing`);
    }
    scentFamilies = [product.scentFamily];
  } else {
    const families = new Set<ScentFamily>();
    let value = 0;
    for (const item of product.giftSetContents) {
      const content = lookup(item.productSlug);
      const contentVariant = content?.variants.find((v) => v.sku === item.sku);
      if (!content || !contentVariant) {
        throw new DeriveError(
          `${product.slug}: contents ${item.productSlug} / ${item.sku} not found`,
        );
      }
      if (content.scentFamily === null) {
        throw new DeriveError(
          `${product.slug}: contents ${item.productSlug} has no scent family (nested gift set?)`,
        );
      }
      if (contentVariant.price.currency !== first.price.currency) {
        throw new DeriveError(`${product.slug}: contents use another currency`);
      }
      families.add(content.scentFamily);
      value += contentVariant.price.amount * item.quantity;
    }
    // Fixed order (catalog.md §2.1), so equal inputs always give equal arrays.
    scentFamilies = SCENT_FAMILIES.filter((f) => families.has(f));
    giftSetValue = { amount: value, currency: first.price.currency };
  }

  return {
    priceFrom: Math.min(...amounts),
    priceTo: Math.max(...amounts),
    currency: first.price.currency,
    sizeKeys: unique(product.variants.map((v) => sizeKeyOf(product.type, v))),
    collectionSlugs: unique<CollectionSlug>([
      product.collection,
      ...product.alsoIn,
    ]),
    scentFamilies,
    skus: product.variants.map((v) => v.sku),
    inStock: product.variants.some((v) => v.available),
    cardImage,
    giftSetValue,
  };
}

/** Derives a whole catalog at once (seed): every product may reference any other. */
export function deriveCatalog(
  products: readonly ProductInput[],
): (ProductInput & ProductDerived)[] {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  return products.map((p) => ({
    ...p,
    ...deriveProductFields(p, (slug) => bySlug.get(slug)),
  }));
}

/**
 * Whole-catalog checks a single document can't make: unique slugs and SKUs, known
 * collections, and gift-set contents that exist. Returns every problem found.
 */
export function catalogProblems(
  products: readonly ProductInput[],
  collectionSlugs: readonly CollectionSlug[],
): string[] {
  const problems: string[] = [];
  const known = new Set(collectionSlugs);
  const slugs = new Set<string>();
  const skus = new Map<string, ProductInput>();
  for (const p of products) {
    if (slugs.has(p.slug)) problems.push(`duplicate slug ${p.slug}`);
    slugs.add(p.slug);
    for (const v of p.variants) {
      if (skus.has(v.sku)) problems.push(`duplicate sku ${v.sku}`);
      skus.set(v.sku, p);
    }
    for (const c of [p.collection, ...p.alsoIn]) {
      if (!known.has(c)) problems.push(`${p.slug}: unknown collection ${c}`);
    }
  }
  for (const p of products) {
    for (const item of p.giftSetContents ?? []) {
      const owner = skus.get(item.sku);
      if (!owner || owner.slug !== item.productSlug) {
        problems.push(
          `${p.slug}: contents ${item.productSlug} / ${item.sku} not found`,
        );
      } else if (owner.type === "gift-set") {
        problems.push(
          `${p.slug}: contents ${item.productSlug} is itself a gift set`,
        );
      }
    }
  }
  return problems;
}

/** Storage object path → URL. The repositories pass storageObjectUrl (lib/firebase/storage-url.ts). */
export type ImageUrlResolver = (storagePath: string) => string;

export function resolveImage(
  image: ProductImage,
  imageUrl: ImageUrlResolver,
): ResolvedImage {
  return { ...image, src: imageUrl(image.storagePath) };
}

/** The card projection: only what cards, filters and sorts need (no long copy, notes or gallery). */
export function toProductCard(
  product: Product,
  imageUrl: ImageUrlResolver,
): ProductCard {
  return {
    slug: product.slug,
    name: product.name,
    type: product.type,
    collection: product.collection,
    collectionSlugs: product.collectionSlugs,
    shortDescription: product.shortDescription,
    badges: product.badges,
    scentFamilies: product.scentFamilies,
    priceFrom: product.priceFrom,
    priceTo: product.priceTo,
    currency: product.currency,
    sizeKeys: product.sizeKeys,
    inStock: product.inStock,
    sortOrder: product.sortOrder,
    publishedAt: product.publishedAt,
    cardImage: resolveImage(product.cardImage, imageUrl),
    variants: product.variants.map(({ sku, label, price, available }) => ({
      sku,
      label,
      price,
      available,
    })),
  };
}

export function toProductDetail(
  product: Product,
  imageUrl: ImageUrlResolver,
): ProductDetail {
  return {
    ...product,
    images: product.images.map((image) => resolveImage(image, imageUrl)),
    cardImage: resolveImage(product.cardImage, imageUrl),
  };
}

/**
 * A gift set's contents joined to the content cards, in contents order. A line whose product
 * isn't among the cards (missing, unpublished or invalid) or whose SKU is no longer one of its
 * variants is dropped and reported in `missing`, so the caller can log it.
 */
export function giftSetLines(
  contents: readonly GiftSetItem[],
  cards: readonly ProductCard[],
): { lines: GiftSetContentLine[]; missing: GiftSetItem[] } {
  const bySlug = new Map(cards.map((card) => [card.slug, card]));
  const lines: GiftSetContentLine[] = [];
  const missing: GiftSetItem[] = [];
  for (const item of contents) {
    const product = bySlug.get(item.productSlug);
    const variant = product?.variants.find((v) => v.sku === item.sku);
    if (!product || !variant) {
      missing.push(item);
      continue;
    }
    lines.push({
      sku: item.sku,
      quantity: item.quantity,
      variantLabel: variant.label,
      product,
    });
  }
  return { lines, missing };
}
