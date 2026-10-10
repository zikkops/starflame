import type { OrderStatus } from "../types";

/**
 * The order state machine. The M6 Functions (the only writers of orders) must enforce it; how
 * they get this file is an M6.1 decision (spec §1). parseOrder checks that statusHistory follows
 * it. cancelled = never paid (payment failed, expired or abandoned). refunded = paid, then the
 * full amount was returned. Named M6.1 decisions: partial refunds (refunds[] / amountRefunded)
 * and a payment that arrives after cancellation (cancelled → paid is refused here).
 *
 *   pending_payment ──► paid ──► processing ──► shipped ──► delivered
 *         │              └──────────┴──────────────┴───────────┴──► refunded
 *         └──► cancelled
 */
export const ORDER_TRANSITIONS: {
  readonly [S in OrderStatus]: readonly OrderStatus[];
} = {
  pending_payment: ["paid", "cancelled"],
  paid: ["processing", "refunded"],
  processing: ["shipped", "refunded"],
  shipped: ["delivered", "refunded"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export function isTerminal(status: OrderStatus): boolean {
  return ORDER_TRANSITIONS[status].length === 0;
}

/** Statuses a customer sees as "paid for" (order history, M5.7). */
export function isPaid(status: OrderStatus): boolean {
  return (
    status === "paid" ||
    status === "processing" ||
    status === "shipped" ||
    status === "delivered"
  );
}
