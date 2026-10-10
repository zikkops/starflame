import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { deriveCatalog } from "../../lib/domain/derive-product";
import {
  parseCartLine,
  parseNewsletterSignup,
  parseOrder,
  parseProduct,
  parseProductInput,
  parseUserProfile,
} from "../../lib/domain/schemas";
import { ValidationError } from "../../lib/domain/validate";
import { catalogProductInputs } from "../../scripts/seed/catalog";

const now = new Date("2026-10-09T12:00:00Z");
/** Stands in for an SDK Timestamp: the guards only need toDate(). */
const ts = (d: Date) => ({ toDate: () => d });

const moonrise = deriveCatalog(catalogProductInputs()).find(
  (p) => p.slug === "moonrise",
);
assert.ok(moonrise);
const storedMoonrise = {
  ...moonrise,
  createdAt: ts(now),
  updatedAt: ts(now),
  publishedAt: null,
};

function rejects(fn: () => unknown, path: RegExp): void {
  assert.throws(
    fn,
    (e: unknown) => e instanceof ValidationError && path.test(e.message),
  );
}

describe("product guards", () => {
  it("accepts a stored product and turns timestamps into Dates", () => {
    const p = parseProduct(storedMoonrise, "moonrise");
    assert.ok(p.createdAt instanceof Date);
    assert.equal(p.createdAt.getTime(), now.getTime());
  });

  it("drops unknown fields", () => {
    const p = parseProduct({ ...storedMoonrise, legacy: true }, "moonrise");
    assert.equal("legacy" in p, false);
  });

  it("rejects bad data with the field path", () => {
    rejects(() => parseProduct(storedMoonrise, "other"), /^slug: /);
    rejects(
      () => parseProduct({ ...storedMoonrise, priceFrom: 34.5 }, "moonrise"),
      /^priceFrom: expected an integer/,
    );
    rejects(
      () =>
        parseProduct(
          { ...storedMoonrise, createdAt: "2026-10-09" },
          "moonrise",
        ),
      /^createdAt: expected a timestamp/,
    );
    rejects(
      () => parseProduct({ ...storedMoonrise, type: "candle" }, "moonrise"),
      /^type: expected one of/,
    );
    rejects(
      () =>
        parseProduct(
          {
            ...storedMoonrise,
            variants: [
              {
                ...moonrise.variants[0],
                price: { amount: 3400, currency: "EUR" },
              },
            ],
          },
          "moonrise",
        ),
      /^variants\[0\]\.price\.currency/,
    );
    rejects(
      () =>
        parseProduct({ ...storedMoonrise, badges: ["new", "new"] }, "moonrise"),
      /^badges: items must be unique/,
    );
  });

  it("enforces the cross-field rules", () => {
    const input = parseProductInput(moonrise);
    rejects(
      () => parseProductInput({ ...input, scentFamily: null }),
      /scentFamily must be null for gift sets/,
    );
    rejects(
      () => parseProductInput({ ...input, alsoIn: ["moonlit-terrace"] }),
      /alsoIn repeats collection/,
    );
    rejects(
      () =>
        parseProductInput({
          ...input,
          variants: [{ ...input.variants[0], sku: "other-220" }],
        }),
      /must be "moonrise" or start with "moonrise-"/,
    );
    rejects(
      () =>
        parseProductInput({ ...input, images: [...input.images].reverse() }),
      /images\[0\] must be the catalog image/,
    );
    rejects(
      () =>
        parseProductInput({
          ...input,
          images: [
            {
              ...input.images[0],
              storagePath: "products/other/cat-moonrise.png",
            },
          ],
        }),
      /must live under products\/moonrise\//,
    );
    rejects(
      () =>
        parseProductInput({
          ...input,
          variants: [{ ...input.variants[0], burnTimeHours: null }],
        }),
      /burnTimeHours is required for candles/,
    );
  });

  it("storagePath: png, jpeg, webp and avif only (as storage.rules allows)", () => {
    const input = parseProductInput(moonrise);
    const withPath = (storagePath: string) => ({
      ...input,
      images: [{ ...input.images[0], storagePath }, ...input.images.slice(1)],
    });
    const avif = "products/moonrise/cat-moonrise.avif";
    assert.equal(
      parseProductInput(withPath(avif)).images[0]?.storagePath,
      avif,
    );
    for (const ext of ["svg", "gif"]) {
      rejects(
        () =>
          parseProductInput(withPath(`products/moonrise/cat-moonrise.${ext}`)),
        /^images\[0\]\.storagePath: .* does not match/,
      );
    }
  });
});

describe("cart, profile, order and newsletter guards", () => {
  it("cart line: sku is the document ID and belongs to the product", () => {
    const line = {
      productSlug: "moonrise",
      sku: "moonrise-220",
      quantity: 2,
      addedAt: ts(now),
      updatedAt: ts(now),
    };
    assert.equal(parseCartLine(line, "moonrise-220").quantity, 2);
    rejects(() => parseCartLine(line, "moonrise-380"), /^sku: /);
    rejects(
      () => parseCartLine({ ...line, quantity: 11 }, "moonrise-220"),
      /^quantity: 11 is outside 1\.\.10/,
    );
    rejects(
      () =>
        parseCartLine(
          { ...line, sku: "ink-and-cedar-220" },
          "ink-and-cedar-220",
        ),
      /does not belong/,
    );
  });

  it("user profile: uid comes from the document ID", () => {
    const p = parseUserProfile(
      {
        displayName: null,
        defaultShippingAddress: null,
        createdAt: ts(now),
        updatedAt: ts(now),
      },
      "uid123",
    );
    assert.equal(p.uid, "uid123");
    rejects(
      () =>
        parseUserProfile(
          {
            displayName: "",
            defaultShippingAddress: null,
            createdAt: ts(now),
            updatedAt: ts(now),
          },
          "u",
        ),
      /^displayName: length 0/,
    );
  });

  const address = {
    fullName: "A Customer",
    line1: "1 Main St",
    line2: null,
    city: "Springfield",
    region: "IL",
    postalCode: "62701",
    country: "US",
    phone: null,
  };
  const usd = (amount: number) => ({ amount, currency: "USD" });
  const order = {
    orderNumber: "SF-10001",
    userId: null,
    email: "guest@example.com",
    accessTokenHash: "a".repeat(64),
    status: "paid",
    statusHistory: [
      { from: null, to: "pending_payment", at: ts(now), by: "checkout" },
      { from: "pending_payment", to: "paid", at: ts(now), by: "payment" },
    ],
    lines: [
      {
        productSlug: "moonrise",
        sku: "moonrise-220",
        name: "Moonrise",
        variantLabel: "220 g",
        type: "jar",
        imagePath: "products/moonrise/cat-moonrise.png",
        unitPrice: usd(3400),
        quantity: 2,
        lineTotal: usd(6800),
      },
    ],
    currency: "USD",
    totals: {
      subtotal: usd(6800),
      shipping: usd(500),
      tax: usd(0),
      discount: usd(0),
      total: usd(7300),
    },
    shippingAddress: address,
    payment: { provider: "stub", reference: null },
    idempotencyKey: "checkout-1",
    createdAt: ts(now),
    updatedAt: ts(now),
  };
  const orderId = "AbCdEfGhIjKlMnOpQrSt";

  it("order: a guest order validates; id comes from the document", () => {
    const o = parseOrder(order, orderId);
    assert.equal(o.id, orderId);
    assert.equal(o.userId, null);
  });

  it("order: totals and history must add up", () => {
    rejects(
      () =>
        parseOrder(
          { ...order, totals: { ...order.totals, total: usd(7000) } },
          orderId,
        ),
      /totals\.total does not add up/,
    );
    rejects(
      () => parseOrder({ ...order, status: "shipped" }, orderId),
      /statusHistory must end/,
    );
    rejects(
      () =>
        parseOrder(
          { ...order, lines: [{ ...order.lines[0], quantity: 3 }] },
          orderId,
        ),
      /lineTotal is not unitPrice/,
    );
    rejects(() => parseOrder(order, "short"), /^\(id\): /);
  });

  it("order: statusHistory follows the state machine from null → pending_payment", () => {
    const step = (from: string | null, to: string) => ({
      from,
      to,
      at: ts(now),
      by: "payment",
    });
    const withHistory = (status: string, history: unknown[]) =>
      parseOrder({ ...order, status, statusHistory: history }, orderId);

    const refunded = withHistory("refunded", [
      step(null, "pending_payment"),
      step("pending_payment", "paid"),
      step("paid", "processing"),
      step("processing", "shipped"),
      step("shipped", "refunded"),
    ]);
    assert.equal(refunded.statusHistory.length, 5);
    assert.equal(
      withHistory("cancelled", [
        step(null, "pending_payment"),
        step("pending_payment", "cancelled"),
      ]).status,
      "cancelled",
    );

    // Must start at null → pending_payment.
    rejects(
      () => withHistory("paid", [step(null, "paid")]),
      /statusHistory\[0\]: null → paid is not an allowed step/,
    );
    rejects(
      () =>
        withHistory("paid", [
          step("pending_payment", "pending_payment"),
          step("pending_payment", "paid"),
        ]),
      /statusHistory\[0\]/,
    );
    // Each step must be allowed by canTransition.
    rejects(
      () =>
        withHistory("shipped", [
          step(null, "pending_payment"),
          step("pending_payment", "shipped"),
        ]),
      /statusHistory\[1\]: pending_payment → shipped/,
    );
    // Leaving a terminal state (late payment after cancellation: an M6.1 decision).
    rejects(
      () =>
        withHistory("paid", [
          step(null, "pending_payment"),
          step("pending_payment", "cancelled"),
          step("cancelled", "paid"),
        ]),
      /statusHistory\[2\]: cancelled → paid/,
    );
    // Each step's from must be the previous step's to.
    rejects(
      () =>
        withHistory("processing", [
          step(null, "pending_payment"),
          step("pending_payment", "paid"),
          step("shipped", "processing"),
        ]),
      /statusHistory\[2\]: shipped → processing/,
    );
  });

  it("newsletter: email must be normalised; id is the hash", () => {
    const hash = "b".repeat(64);
    const s = parseNewsletterSignup(
      {
        email: "a@example.com",
        source: "footer",
        consentVersion: "v1",
        createdAt: ts(now),
      },
      hash,
    );
    assert.equal(s.emailHash, hash);
    rejects(
      () =>
        parseNewsletterSignup(
          {
            email: "A@Example.com",
            source: "footer",
            consentVersion: "v1",
            createdAt: ts(now),
          },
          hash,
        ),
      /email is not normalised/,
    );
  });
});
