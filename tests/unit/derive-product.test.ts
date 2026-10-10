import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  catalogProblems,
  DeriveError,
  deriveCatalog,
  deriveProductFields,
  giftSetLines,
  sizeKeyOf,
  toProductCard,
  toProductDetail,
} from "../../lib/domain/derive-product";
import { asCollectionSlug, asProductSlug } from "../../lib/domain/ids";
import type { ProductInput } from "../../lib/types";
import { catalogProductInputs } from "../../scripts/seed/catalog";

const inputs = catalogProductInputs();
const derived = new Map(deriveCatalog(inputs).map((p) => [p.slug, p]));
const get = (slug: string) => {
  const p = derived.get(asProductSlug(slug));
  assert.ok(p, slug);
  return p;
};

describe("deriveProductFields", () => {
  it("prices: from / to over the variants", () => {
    assert.equal(get("moonrise").priceFrom, 3400);
    assert.equal(get("moonrise").priceTo, 4800);
    assert.equal(get("comet-tail").priceFrom, 3600);
    assert.equal(get("comet-tail").priceTo, 3600);
    assert.equal(get("moonrise").currency, "USD");
  });

  it("size keys per type (catalog.md §6.1)", () => {
    assert.deepEqual(get("moonrise").sizeKeys, ["220g", "380g"]);
    assert.deepEqual(get("lantern-path").sizeKeys, ["7x10", "7x15"]);
    assert.deepEqual(get("late-bloom").sizeKeys, ["120g"]);
    assert.deepEqual(get("fir-hollow").sizeKeys, ["6-cubes"]);
    assert.deepEqual(get("reading-nook-set").sizeKeys, ["set"]);
  });

  it("collectionSlugs = collection + alsoIn", () => {
    assert.deepEqual(get("moonrise").collectionSlugs, ["moonlit-terrace"]);
    assert.deepEqual(get("reading-nook-set").collectionSlugs, [
      "gift-sets",
      "starlit-library",
    ]);
    assert.deepEqual(get("comet-season-gift-box").collectionSlugs, [
      "gift-sets",
      "comet-season",
    ]);
  });

  it("gift sets take their contents' families, in SCENT_FAMILIES order (catalog.md §2.1)", () => {
    assert.deepEqual(get("moonrise").scentFamilies, ["floral"]);
    assert.deepEqual(get("little-constellation-set").scentFamilies, [
      "floral",
      "citrus",
    ]);
    assert.deepEqual(get("reading-nook-set").scentFamilies, [
      "woody",
      "gourmand",
    ]);
    assert.deepEqual(get("comet-season-gift-box").scentFamilies, [
      "gourmand",
      "smoky-amber",
    ]);
  });

  it("gift-set value: the contents bought separately", () => {
    // catalog.json microcopy.giftSet.example: "Worth $68.00 if bought separately".
    assert.deepEqual(get("reading-nook-set").giftSetValue, {
      amount: 6800,
      currency: "USD",
    });
    assert.deepEqual(get("little-constellation-set").giftSetValue, {
      amount: 5400,
      currency: "USD",
    });
    assert.deepEqual(get("comet-season-gift-box").giftSetValue, {
      amount: 5000,
      currency: "USD",
    });
    assert.equal(get("moonrise").giftSetValue, null);
  });

  it("skus, inStock and cardImage", () => {
    assert.deepEqual(get("moonrise").skus, ["moonrise-220", "moonrise-380"]);
    assert.equal(get("moonrise").inStock, true);
    assert.equal(get("moonrise").cardImage.id, "cat-moonrise");
    assert.equal(
      get("gilded-plum").cardImage.storagePath,
      "products/gilded-plum/cat-gilded-plum.png",
    );
  });

  it("inStock is false when no variant is available", () => {
    const p = get("moonrise");
    const soldOut: ProductInput = {
      ...p,
      variants: p.variants.map((v) => ({ ...v, available: false })),
    };
    assert.equal(deriveProductFields(soldOut, () => undefined).inStock, false);
  });

  it("is deterministic", () => {
    const again = deriveCatalog(inputs);
    assert.deepEqual(again, [...derived.values()]);
  });

  it("throws on unresolved gift-set contents", () => {
    const set = inputs.find((p) => p.type === "gift-set");
    assert.ok(set);
    assert.throws(() => deriveProductFields(set, () => undefined), DeriveError);
  });

  it("sizeKeyOf keeps decimals", () => {
    const v = get("moonrise").variants[0];
    assert.ok(v);
    assert.equal(
      sizeKeyOf("pillar", {
        ...v,
        dimensionsCm: { diameter: 9.5, height: 11 },
      }),
      "9.5x11",
    );
  });

  const imageUrl = (path: string) => `https://img.test/${path}`;
  const stored = (slug: string) => ({
    ...get(slug),
    createdAt: new Date("2026-10-01T00:00:00Z"),
    updatedAt: new Date("2026-10-02T00:00:00Z"),
    publishedAt: new Date("2026-10-03T00:00:00Z"),
  });

  it("toProductCard keeps only card, filter and sort fields", () => {
    const card = toProductCard(stored("moonrise"), imageUrl);
    assert.deepEqual(Object.keys(card).sort(), [
      "badges",
      "cardImage",
      "collection",
      "collectionSlugs",
      "currency",
      "inStock",
      "name",
      "priceFrom",
      "priceTo",
      "publishedAt",
      "scentFamilies",
      "shortDescription",
      "sizeKeys",
      "slug",
      "sortOrder",
      "type",
      "variants",
    ]);
    assert.equal(
      card.cardImage.src,
      "https://img.test/products/moonrise/cat-moonrise.png",
    );
    assert.equal(card.variants.length, 2);
    assert.deepEqual(Object.keys(card.variants[0] ?? {}), [
      "sku",
      "label",
      "price",
      "available",
    ]);
  });
});

describe("toProductDetail and giftSetLines", () => {
  const imageUrl = (path: string) => `https://img.test/${path}`;
  const stored = (slug: string) => ({
    ...get(slug),
    createdAt: new Date(0),
    updatedAt: new Date(0),
    publishedAt: null,
  });

  it("toProductDetail resolves every image URL and keeps the rest", () => {
    const product = stored("reading-nook-set");
    const detail = toProductDetail(product, imageUrl);
    assert.equal(detail.longDescription, product.longDescription);
    assert.deepEqual(
      detail.images.map((i) => i.src),
      product.images.map((i) => imageUrl(i.storagePath)),
    );
    assert.equal(detail.cardImage.src, imageUrl(product.cardImage.storagePath));
  });

  it("giftSetLines joins contents to cards in contents order and reports gaps", () => {
    const set = stored("reading-nook-set");
    const contents = set.giftSetContents ?? [];
    const cards = ["last-chapter", "ink-and-cedar"].map((slug) =>
      toProductCard(stored(slug), imageUrl),
    );
    const all = giftSetLines(contents, cards);
    assert.deepEqual(
      all.lines.map((l) => [l.product.slug, l.sku, l.quantity, l.variantLabel]),
      [
        ["ink-and-cedar", "ink-and-cedar-220", 1, "220 g"],
        ["last-chapter", "last-chapter-220", 1, "220 g"],
      ],
    );
    assert.deepEqual(all.missing, []);
    const [first] = cards;
    assert.ok(first);
    const partial = giftSetLines(contents, [first]);
    assert.equal(partial.lines.length, 1);
    assert.deepEqual(
      partial.missing.map((m) => m.productSlug),
      ["ink-and-cedar"],
    );
  });
});

describe("catalogProblems", () => {
  it("finds duplicate SKUs, unknown collections and bad contents", () => {
    const moonrise = get("moonrise");
    const set = get("reading-nook-set");
    const problems = catalogProblems(
      [
        moonrise,
        { ...moonrise },
        {
          ...set,
          giftSetContents: [
            { ...set.giftSetContents![0]!, productSlug: asProductSlug("nope") },
          ],
        },
      ],
      [asCollectionSlug("moonlit-terrace")],
    );
    assert.ok(problems.includes("duplicate slug moonrise"));
    assert.ok(problems.includes("duplicate sku moonrise-220"));
    assert.ok(
      problems.includes("reading-nook-set: unknown collection gift-sets"),
    );
    assert.ok(
      problems.some((p) => p.startsWith("reading-nook-set: contents nope")),
    );
  });
});
