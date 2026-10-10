import type { OrderId, ProductSlug, Sku, UserId } from "./brand";
import type { ProductType } from "./catalog";
import type { CurrencyCode, Money } from "./money";
import type { Address } from "./user";

/** Allowed transitions: lib/domain/order-status.ts (ORDER_TRANSITIONS). */
export const ORDER_STATUSES = [
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_ACTORS = ["checkout", "payment", "admin"] as const;
export type OrderActor = (typeof ORDER_ACTORS)[number];

/** A snapshot taken at checkout. Later product edits never change it. */
export type OrderLine = {
  readonly productSlug: ProductSlug;
  readonly sku: Sku;
  readonly name: string;
  readonly variantLabel: string;
  readonly type: ProductType;
  /** Catalog image path at checkout, for the order history thumbnail. */
  readonly imagePath: string | null;
  readonly unitPrice: Money;
  readonly quantity: number;
  readonly lineTotal: Money;
};

export type OrderTotals = {
  readonly subtotal: Money;
  readonly shipping: Money;
  readonly tax: Money;
  readonly discount: Money;
  readonly total: Money;
};

export type OrderStatusChange = {
  readonly from: OrderStatus | null;
  readonly to: OrderStatus;
  readonly at: Date;
  readonly by: OrderActor;
};

/** Payment stays a stub until the user approves Stripe (M6). */
export type PaymentInfo = {
  readonly provider: "stub";
  readonly reference: string | null;
};

/** orders/{orderId}. Written only by Cloud Functions (Admin SDK). */
export type Order = {
  /** The document ID (not stored as a field). */
  readonly id: OrderId;
  /** Human-facing number, e.g. "SF-10042"; the format is decided in M6.1. */
  readonly orderNumber: string;
  /** null for guest checkout. */
  readonly userId: UserId | null;
  /** Contact email, for guests and signed-in customers alike. */
  readonly email: string;
  /**
   * SHA-256 (hex) of the random access token in the confirmation link. The token itself is
   * never stored. Guests, and anyone using an emailed link, see the order only through the server.
   */
  readonly accessTokenHash: string;
  readonly status: OrderStatus;
  readonly statusHistory: readonly OrderStatusChange[];
  readonly lines: readonly OrderLine[];
  readonly currency: CurrencyCode;
  readonly totals: OrderTotals;
  readonly shippingAddress: Address;
  readonly payment: PaymentInfo;
  /** Client-generated checkout attempt key; the Function refuses a second order for it. */
  readonly idempotencyKey: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
