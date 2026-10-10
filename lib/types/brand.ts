/**
 * Nominal ("branded") string types. A ProductSlug can't be passed where a Sku or a UserId is
 * expected, although all three are strings at runtime. Values are minted only by the guards in
 * lib/domain (ids.ts, schemas.ts), so a branded value has always been validated once.
 */
declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

/** Product document ID and URL segment, e.g. "moonrise". */
export type ProductSlug = Brand<string, "ProductSlug">;
/** Collection document ID and URL segment, e.g. "moonlit-terrace". */
export type CollectionSlug = Brand<string, "CollectionSlug">;
/** Variant SKU: the product slug, or the slug plus "-<size>", e.g. "moonrise-220". */
export type Sku = Brand<string, "Sku">;
/** Firebase Auth uid. */
export type UserId = Brand<string, "UserId">;
/** Firestore auto ID of an orders/{orderId} document. */
export type OrderId = Brand<string, "OrderId">;
/** Lowercase hex SHA-256 of a normalised email; newsletterSignups/{emailHash}. */
export type EmailHash = Brand<string, "EmailHash">;
