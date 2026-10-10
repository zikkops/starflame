import type {
  CollectionSlug,
  EmailHash,
  OrderId,
  ProductSlug,
  Sku,
  UserId,
} from "../types";
import { map, str, type Parser } from "./validate";

/** Lowercase words joined by single hyphens: "moonrise", "ink-and-cedar", "lantern-path-7x10". */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// The casts below are the only place branded IDs are minted: each runs after validation.
export const productSlug: Parser<ProductSlug> = map(
  str({ max: 80, pattern: SLUG_PATTERN }),
  (s) => s as ProductSlug,
);
export const collectionSlug: Parser<CollectionSlug> = map(
  str({ max: 80, pattern: SLUG_PATTERN }),
  (s) => s as CollectionSlug,
);
export const sku: Parser<Sku> = map(
  str({ max: 100, pattern: SLUG_PATTERN }),
  (s) => s as Sku,
);
/** Firebase Auth uids are 1-128 characters; "/" would break document paths. */
export const userId: Parser<UserId> = map(
  str({ max: 128, pattern: /^[^/]+$/ }),
  (s) => s as UserId,
);
/** Firestore auto IDs: 20 alphanumeric characters. */
export const orderId: Parser<OrderId> = map(
  str({ pattern: /^[A-Za-z0-9]{20}$/ }),
  (s) => s as OrderId,
);
export const emailHash: Parser<EmailHash> = map(
  str({ pattern: /^[0-9a-f]{64}$/ }),
  (s) => s as EmailHash,
);

/** SKU convention: the product slug itself, or the slug plus "-<size>". */
export function skuBelongsTo(s: Sku, slug: ProductSlug): boolean {
  const value: string = s;
  return value === slug || value.startsWith(`${slug}-`);
}

/** For code paths that hold a plain string (route params, fixtures). Throws ValidationError. */
export const asProductSlug = (s: string): ProductSlug => productSlug(s, "slug");
export const asCollectionSlug = (s: string): CollectionSlug =>
  collectionSlug(s, "slug");
export const asSku = (s: string): Sku => sku(s, "sku");
export const asUserId = (s: string): UserId => userId(s, "uid");
