import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";

import { emailHash, isEmail, normaliseEmail } from "../../lib/domain/email";
import {
  canTransition,
  isTerminal,
  ORDER_TRANSITIONS,
} from "../../lib/domain/order-status";
import { ORDER_STATUSES } from "../../lib/types";

describe("order status machine", () => {
  it("covers every status", () => {
    assert.deepEqual(
      Object.keys(ORDER_TRANSITIONS).sort(),
      [...ORDER_STATUSES].sort(),
    );
  });

  it("allows the happy path and refunds after payment", () => {
    const path = [
      "pending_payment",
      "paid",
      "processing",
      "shipped",
      "delivered",
    ] as const;
    for (let i = 1; i < path.length; i++) {
      assert.ok(
        canTransition(path[i - 1]!, path[i]!),
        `${path[i - 1]} → ${path[i]}`,
      );
    }
    for (const s of ["paid", "processing", "shipped", "delivered"] as const) {
      assert.ok(canTransition(s, "refunded"));
    }
  });

  it("refuses skips, reversals and leaving a terminal state", () => {
    assert.equal(canTransition("pending_payment", "shipped"), false);
    assert.equal(canTransition("shipped", "paid"), false);
    assert.equal(canTransition("pending_payment", "refunded"), false);
    assert.equal(canTransition("paid", "cancelled"), false);
    assert.ok(isTerminal("cancelled") && isTerminal("refunded"));
  });
});

describe("email", () => {
  it("normalises and hashes like the rules will (lowercase hex SHA-256)", async () => {
    assert.equal(normaliseEmail("  Ana@Example.COM "), "ana@example.com");
    const expected = createHash("sha256")
      .update("ana@example.com")
      .digest("hex");
    assert.equal(await emailHash("  Ana@Example.COM "), expected);
  });

  it("isEmail is loose but rejects obvious junk", () => {
    assert.ok(isEmail("a@b.co"));
    assert.equal(isEmail("a@b"), false);
    assert.equal(isEmail("a b@c.de"), false);
  });
});
