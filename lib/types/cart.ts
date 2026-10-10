import type { ProductSlug, Sku } from "./brand";

export const CART_LIMITS = {
  /** Distinct SKUs per cart. Also keeps a sign-in merge inside one batch's rules get() budget. */
  maxLines: 20,
  maxQuantityPerLine: 10,
} as const;

/**
 * One cart line: users/{uid}/cart/{sku} when signed in, localStorage for guests (M5.4).
 * No price: prices are always read from products and re-validated by the checkout Function.
 */
export type CartLine = {
  readonly productSlug: ProductSlug;
  readonly sku: Sku;
  readonly quantity: number;
  readonly addedAt: Date;
  readonly updatedAt: Date;
};

export type Cart = {
  /** Oldest first (addedAt). */
  readonly lines: readonly CartLine[];
};
