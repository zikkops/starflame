import type { CollectionSlug, ProductSlug, Sku } from "./brand";
import type { CurrencyCode, Money } from "./money";

export const PRODUCT_TYPES = [
  "jar",
  "pillar",
  "tin",
  "wax-melt",
  "gift-set",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

/** Fixed set (catalog.md §2.1), in display order. Labels are copy and stay in catalog.json. */
export const SCENT_FAMILIES = [
  "floral",
  "fresh",
  "citrus",
  "woody",
  "gourmand",
  "smoky-amber",
] as const;
export type ScentFamily = (typeof SCENT_FAMILIES)[number];

export const BADGES = ["bestseller", "new", "limited"] as const;
export type Badge = (typeof BADGES)[number];

/** Keys into catalog.json microcopy.care (catalog.json careNotesRef without the "care." prefix). */
export const CARE_KEYS = ["jar", "pillar", "tin", "melt"] as const;
export type CareKey = (typeof CARE_KEYS)[number];

/** draft: admin only. published: public. archived: admin soft delete (M7), never shown. */
export const PUBLISH_STATUSES = ["draft", "published", "archived"] as const;
export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const IMAGE_ROLES = ["catalog", "lifestyle"] as const;
export type ImageRole = (typeof IMAGE_ROLES)[number];

export type ScentNotes = {
  readonly top: readonly string[];
  readonly heart: readonly string[];
  readonly base: readonly string[];
};

export type DimensionsCm = {
  readonly diameter: number;
  readonly height: number;
};

export type HoursRange = {
  readonly min: number;
  readonly max: number;
};

export type Variant = {
  readonly sku: Sku;
  /** Display label, e.g. "220 g", "7 × 10 cm", "6 cubes, 80 g". */
  readonly label: string;
  readonly weightGrams: number;
  readonly dimensionsCm: DimensionsCm | null;
  readonly price: Money;
  /** Candles only; null for wax melts and gift sets. */
  readonly burnTimeHours: HoursRange | null;
  /** Wax melts only. */
  readonly warmTimeHoursPerPiece: number | null;
  /** Wax melts only: cubes per pack. */
  readonly pieces: number | null;
  /** Admin toggle (M7). Quantity tracking, if any, is decided in M6.1. */
  readonly available: boolean;
};

/** A product image in Firebase Storage. Its URL is resolved at read time (lib/firebase/storage-url). */
export type ProductImage = {
  /** shot-list.json id, e.g. "cat-moonrise". */
  readonly id: string;
  /** Bucket-relative object path, e.g. "products/moonrise/cat-moonrise.png". */
  readonly storagePath: string;
  readonly alt: string;
  readonly role: ImageRole;
  /** Intrinsic pixel size of the stored file, for next/image. */
  readonly width: number;
  readonly height: number;
};

export type GiftSetItem = {
  readonly productSlug: ProductSlug;
  readonly sku: Sku;
  readonly quantity: number;
};

/** The authored fields: what the seed (M1.8) and the admin editor (M7) write. */
export type ProductInput = {
  readonly slug: ProductSlug;
  readonly name: string;
  readonly type: ProductType;
  /** Primary collection (exactly one). */
  readonly collection: CollectionSlug;
  /** Extra collections that also list the product. */
  readonly alsoIn: readonly CollectionSlug[];
  readonly shortDescription: string;
  readonly longDescription: string;
  /** null for gift sets: their families are derived from the contents. */
  readonly scentFamily: ScentFamily | null;
  readonly scentNotes: ScentNotes | null;
  readonly variants: readonly Variant[];
  readonly badges: readonly Badge[];
  readonly careKey: CareKey;
  readonly giftSetContents: readonly GiftSetItem[] | null;
  /** The catalog image first, then lifestyle images in display order. */
  readonly images: readonly ProductImage[];
  /** Default ("featured") order, ascending. */
  readonly sortOrder: number;
  readonly status: PublishStatus;
};

/** Denormalised fields, computed only by deriveProductFields (lib/domain/derive-product.ts). */
export type ProductDerived = {
  /** Lowest and highest variant price, in minor units of `currency`. */
  readonly priceFrom: number;
  readonly priceTo: number;
  readonly currency: CurrencyCode;
  /** One key per distinct size, in variant order: "220g", "7x10", "6-cubes", "set". */
  readonly sizeKeys: readonly string[];
  /** collection + alsoIn. */
  readonly collectionSlugs: readonly CollectionSlug[];
  /** [scentFamily], or for gift sets the union of their contents' families. */
  readonly scentFamilies: readonly ScentFamily[];
  /** Every variant SKU; lets the rules check that a cart line names a real SKU. */
  readonly skus: readonly Sku[];
  /** At least one variant is available. */
  readonly inStock: boolean;
  /** The catalog image, copied for cards. */
  readonly cardImage: ProductImage;
  /** Gift sets: what the contents cost separately ("Worth {total} if bought separately"). */
  readonly giftSetValue: Money | null;
};

export type ProductMeta = {
  readonly createdAt: Date;
  readonly updatedAt: Date;
  /** Set when the product is first published; used by the "newest" sort. */
  readonly publishedAt: Date | null;
};

/** products/{slug} */
export type Product = ProductInput & ProductDerived & ProductMeta;

/** A ProductImage with its URL resolved on the server (lib/firebase/storage-url.ts), for next/image. */
export type ResolvedImage = ProductImage & {
  readonly src: string;
};

/**
 * What a product card needs, plus the fields the shop filters and sorts on in memory (M1.4 query
 * plan). Built by toProductCard in the repositories (M1.6), never stored. The only product shape
 * a Client Component may receive.
 */
export type ProductCard = Pick<
  Product,
  | "slug"
  | "name"
  | "type"
  | "collection"
  | "collectionSlugs"
  | "shortDescription"
  | "badges"
  | "scentFamilies"
  | "priceFrom"
  | "priceTo"
  | "currency"
  | "sizeKeys"
  | "inStock"
  | "sortOrder"
  | "publishedAt"
> & {
  readonly cardImage: ResolvedImage;
  readonly variants: readonly Pick<
    Variant,
    "sku" | "label" | "price" | "available"
  >[];
};

/** A published product for its product page: every field, image URLs resolved (M1.6). Server only. */
export type ProductDetail = Omit<Product, "images" | "cardImage"> & {
  readonly images: readonly ResolvedImage[];
  readonly cardImage: ResolvedImage;
};

/** One line of a gift set's contents, resolved to the content product's card (M1.6). */
export type GiftSetContentLine = {
  readonly sku: Sku;
  readonly quantity: number;
  /** The content variant's label, e.g. "120 g". */
  readonly variantLabel: string;
  readonly product: ProductCard;
};

/** A static image in /public (art-direction §9.2), e.g. "/images/collections/col-ember-grove.jpg". */
export type StaticImage = {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
};

export type CollectionInput = {
  readonly slug: CollectionSlug;
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly isLimited: boolean;
  readonly sortOrder: number;
  readonly moodImage: StaticImage;
  readonly status: PublishStatus;
};

/** collections/{slug} */
export type Collection = CollectionInput & {
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/** Not stored in Firestore: catalog.json scentFamilies[] (copy). */
export type ScentFamilyInfo = {
  readonly slug: ScentFamily;
  readonly label: string;
  readonly sortOrder: number;
};
