import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { DocumentValidationError } from "../../lib/firebase/converter-utils";
import {
  publishedIds,
  readBestsellers,
  readCollectionBySlug,
  readCollections,
  readCollectionSlugs,
  readGiftSetContents,
  readProductBySlug,
  readProductCardsBySlugs,
  readProducts,
  readProductsByCollection,
  readPublishedProductSlugs,
  readRelatedProducts,
  type CatalogSource,
} from "../../lib/firebase/repositories/catalog-reads";
import {
  ARCHIVED_COLLECTION,
  ARCHIVED_PRODUCT,
  BROKEN,
  DRAFT_COLLECTION,
  DRAFT_PRODUCT,
  products,
  PROJECT_ID,
  publishedProducts,
  seedCatalog,
  slugsOf,
} from "./fixtures";

/**
 * The uncached repository reads against the Firestore emulator (`npm run test:repos`), on the
 * fixtures of ./fixtures.ts. The cached wrappers (catalog.ts) are in catalog-cache.test.ts.
 */

// No credentials in the emulator: skip google-auth-library's ~3 s metadata-server probe (M1.3).
process.env.METADATA_SERVER_DETECTION ??= "none";

const imageUrl = (path: string) => `https://img.test/${path}`;

/** Collects console.error lines while `run` runs. */
async function capturingErrors<T>(
  run: () => Promise<T>,
): Promise<{ result: T; logged: string[] }> {
  const logged: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => {
    logged.push(args.map(String).join(" "));
  };
  try {
    return { result: await run(), logged };
  } finally {
    console.error = original;
  }
}

describe("catalog repositories (Firestore emulator)", () => {
  let db: Firestore;
  let src: CatalogSource;
  let getAllCalls = 0;
  const app = initializeApp({ projectId: PROJECT_ID }, "repository-tests");

  before(async () => {
    db = getFirestore(app);
    await seedCatalog(db);

    // Count getAll round trips (gift sets and card batches must use exactly one).
    const counted = new Proxy(db, {
      get(target, key, receiver) {
        if (key === "getAll") getAllCalls += 1;
        const value: unknown = Reflect.get(target, key, receiver);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    src = { db: counted, imageUrl };
  });

  after(() => deleteApp(app));

  describe("lists", () => {
    it("readProducts: every published product by sortOrder; drafts, archived and invalid skipped", async () => {
      const { result, logged } = await capturingErrors(() => readProducts(src));
      assert.deepEqual(slugsOf(result), slugsOf(publishedProducts));
      assert.equal(result.length, 15);
      assert.equal(logged.length, 1);
      assert.match(
        logged[0] ?? "",
        /skipped invalid document products\/broken-candle \(field /,
      );
      assert.doesNotMatch(logged[0] ?? "", /must never be logged|Broken/);
    });

    it("cards carry only card fields, a resolved image and live Dates", async () => {
      const [card] = await capturingErrors(() => readProducts(src)).then(
        (r) => r.result,
      );
      assert.ok(card);
      assert.equal(card.slug, "moonrise");
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
      assert.ok(card.publishedAt instanceof Date);
      assert.equal("longDescription" in card, false);
      assert.equal("status" in card, false);
    });

    it("readProductsByCollection: primary and alsoIn members, published only, by sortOrder", async () => {
      const { result } = await capturingErrors(() =>
        readProductsByCollection(src, "starlit-library"),
      );
      assert.deepEqual(slugsOf(result), [
        "last-chapter",
        "margin-notes",
        "reading-nook-set",
      ]);
      const terrace = await capturingErrors(() =>
        readProductsByCollection(src, "moonlit-terrace"),
      );
      assert.deepEqual(slugsOf(terrace.result), ["moonrise", "late-bloom"]);
      assert.deepEqual(await readProductsByCollection(src, "no-such"), []);
      assert.deepEqual(await readProductsByCollection(src, "Bad/Slug"), []);
    });

    it("readBestsellers: published bestsellers by sortOrder, limited", async () => {
      const { result } = await capturingErrors(() => readBestsellers(src, 8));
      assert.deepEqual(slugsOf(result), ["moonrise"]);
      await assert.rejects(readBestsellers(src, 0), RangeError);
      await assert.rejects(readBestsellers(src, 51), RangeError);
      await assert.rejects(readBestsellers(src, 1.5), RangeError);
    });

    it("readRelatedProducts: products listed in the primary collection (primary or alsoIn), without the product, one limited query", async () => {
      const related = await readRelatedProducts(
        src,
        "last-chapter",
        "starlit-library",
        5,
      );
      assert.deepEqual(slugsOf(related), ["margin-notes", "reading-nook-set"]);
      const one = await readRelatedProducts(
        src,
        "last-chapter",
        "starlit-library",
        1,
      );
      assert.deepEqual(slugsOf(one), ["margin-notes"]);
      const first = await readRelatedProducts(
        src,
        "margin-notes",
        "starlit-library",
        1,
      );
      assert.deepEqual(slugsOf(first), ["last-chapter"]);
      assert.deepEqual(
        slugsOf(
          await capturingErrors(() =>
            readRelatedProducts(src, "moonrise", "moonlit-terrace", 4),
          ).then((r) => r.result),
        ),
        ["late-bloom"],
      );
    });

    it("readCollections: published collections by sortOrder", async () => {
      const result = await readCollections(src);
      assert.deepEqual(slugsOf(result), [
        "moonlit-terrace",
        "starlit-library",
        "ember-grove",
        "gift-sets",
      ]);
      assert.ok(result[0]?.createdAt instanceof Date);
    });

    it("slug lists for generateStaticParams: published IDs only, sorted", async () => {
      assert.deepEqual(
        await readPublishedProductSlugs(src),
        [...slugsOf(publishedProducts), BROKEN].sort(),
      );
      assert.deepEqual(await readCollectionSlugs(src), [
        "ember-grove",
        "gift-sets",
        "moonlit-terrace",
        "starlit-library",
      ]);
    });

    it("publishedIds: the status is checked again in memory", async () => {
      // No status filter here, so drafts and archived documents reach publishedIds.
      const all = await db.collection("products").select("status").get();
      assert.ok(all.docs.some((d) => d.id === DRAFT_PRODUCT));
      assert.ok(all.docs.some((d) => d.id === ARCHIVED_PRODUCT));
      assert.deepEqual(
        publishedIds(all.docs, String),
        [...slugsOf(publishedProducts), BROKEN].sort(),
      );
    });
  });

  describe("single documents", () => {
    it("readProductBySlug: the published product with resolved images", async () => {
      const product = await readProductBySlug(src, "reading-nook-set");
      assert.ok(product);
      assert.equal(product.name, "Reading Nook Set");
      assert.ok(product.images.length >= 1);
      for (const image of product.images) {
        assert.equal(image.src, imageUrl(image.storagePath));
      }
      assert.ok(product.updatedAt instanceof Date);
    });

    it("readProductBySlug: null for missing, draft, archived and non-slug IDs", async () => {
      for (const slug of [
        "no-such-candle",
        DRAFT_PRODUCT,
        ARCHIVED_PRODUCT,
        "",
        "Moonrise",
        "products/moonrise",
        "../moonrise",
        "a".repeat(81),
      ]) {
        assert.equal(await readProductBySlug(src, slug), null, slug);
      }
    });

    it("readProductBySlug: an invalid document throws DocumentValidationError", async () => {
      await assert.rejects(readProductBySlug(src, BROKEN), (error) => {
        assert.ok(error instanceof DocumentValidationError);
        assert.equal(error.docPath, `products/${BROKEN}`);
        return true;
      });
    });

    it("readCollectionBySlug: published only", async () => {
      const terrace = await readCollectionBySlug(src, "moonlit-terrace");
      assert.equal(terrace?.name, "Moonlit Terrace");
      assert.equal(await readCollectionBySlug(src, DRAFT_COLLECTION), null);
      assert.equal(await readCollectionBySlug(src, ARCHIVED_COLLECTION), null);
      assert.equal(await readCollectionBySlug(src, "no-such"), null);
      assert.equal(await readCollectionBySlug(src, "a/b"), null);
    });
  });

  describe("batched reads (no N+1)", () => {
    it("readProductCardsBySlugs: one getAll, first-seen order, published only", async () => {
      const before = getAllCalls;
      const cards = await readProductCardsBySlugs(src, [
        "quiet-shore",
        "moonrise",
        "quiet-shore",
        "no-such",
        DRAFT_PRODUCT,
        "Bad/Slug",
      ]);
      assert.deepEqual(slugsOf(cards), ["quiet-shore", "moonrise"]);
      assert.equal(getAllCalls - before, 1);
      // Decoded through the reference's converter (Dates, not Timestamps).
      assert.ok(cards[0]?.publishedAt instanceof Date);
      assert.deepEqual(await readProductCardsBySlugs(src, []), []);
      assert.equal(getAllCalls - before, 1);
      await assert.rejects(
        readProductCardsBySlugs(
          src,
          Array.from({ length: 101 }, (_, i) => `p-${i}`),
        ),
        RangeError,
      );
    });

    it("readGiftSetContents: lines in contents order with cards, in one getAll", async () => {
      const set = products.find((p) => p.slug === "little-constellation-set");
      assert.ok(set);
      const before = getAllCalls;
      const lines = await readGiftSetContents(src, set);
      assert.equal(getAllCalls - before, 1);
      assert.deepEqual(
        lines.map((l) => [l.product.slug, l.sku, l.quantity, l.variantLabel]),
        [
          ["late-bloom", "late-bloom-120", 1, "120 g"],
          ["margin-notes", "margin-notes-120", 1, "120 g"],
          ["quiet-shore", "quiet-shore-120", 1, "120 g"],
        ],
      );
    });

    it("readGiftSetContents: an unpublished content is left out and logged by slug", async () => {
      const set = products.find((p) => p.slug === "reading-nook-set");
      assert.ok(set);
      const { result, logged } = await capturingErrors(() =>
        readGiftSetContents(src, set),
      );
      assert.deepEqual(
        result.map((l) => l.product.slug),
        ["last-chapter"],
      );
      assert.deepEqual(logged, [
        "[repositories] gift set reading-nook-set: contents ink-and-cedar / ink-and-cedar-220 unavailable",
      ]);
      const moonrise = products.find((p) => p.slug === "moonrise");
      assert.ok(moonrise);
      const before = getAllCalls;
      assert.deepEqual(await readGiftSetContents(src, moonrise), []);
      assert.equal(getAllCalls, before);
    });
  });
});
