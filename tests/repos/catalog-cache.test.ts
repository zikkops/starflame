import assert from "node:assert/strict";
import { AsyncLocalStorage } from "node:async_hooks";
import { after, before, beforeEach, describe, it } from "node:test";

import { deleteApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import type * as CatalogModule from "../../lib/firebase/repositories/catalog";
import type { GiftSetContentLine } from "../../lib/types";
import { products, PROJECT_ID, seedCatalog, slugsOf } from "./fixtures";

/**
 * The cached repositories (catalog.ts) against the Firestore emulator, outside Next: what
 * unstable_cache does is driven through a fake incremental cache, the store Next itself uses
 * when no request is active (globalThis.__incrementalCache). This checks what the uncached
 * reads' tests can't: Dates on a cache miss and on a hit (JSON), one entry per function and
 * argument list, and the arguments each wrapper hands to its read. unstable_cache keys on the
 * callback's source text, which is the same for every wrapper, so the name is the only
 * separator: catalog.ts refuses a reused name when it loads (this file then fails to import).
 */

/** The parts of Next's IncrementalCache that unstable_cache calls outside a request. */
class FakeIncrementalCache {
  readonly isOnDemandRevalidate = false;
  readonly entries = new Map<string, unknown>();
  hits = 0;
  misses = 0;

  // The invocation key is kept as is, so the tests can read it.
  generateSimpleCacheKey(key: string): Promise<string> {
    return Promise.resolve(key);
  }

  get(key: string): Promise<{ value: unknown; isStale: false } | null> {
    const value = this.entries.get(key);
    if (value === undefined) {
      this.misses += 1;
      return Promise.resolve(null);
    }
    this.hits += 1;
    return Promise.resolve({ value, isStale: false });
  }

  set(key: string, value: unknown): Promise<void> {
    this.entries.set(key, value);
    return Promise.resolve();
  }

  reset(): void {
    this.entries.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /** [name, JSON arguments] of every entry, sorted. */
  keyParts(): [string, string][] {
    return [...this.entries.keys()]
      .map((key): [string, string] => {
        const match = /-starflames-catalog,([a-z-]+)-(.*)$/.exec(key);
        assert.ok(match?.[1] && match[2], `unexpected cache key ${key}`);
        return [match[1], match[2]];
      })
      .sort();
  }
}

const cache = new FakeIncrementalCache();
const globals = globalThis as {
  __incrementalCache?: unknown;
  AsyncLocalStorage?: unknown;
};

/** Runs `run` with console.error silenced: lists log the invalid fixture document (catalog.test.ts checks the line). */
async function quietly<T>(run: () => Promise<T>): Promise<T> {
  const original = console.error;
  console.error = () => {};
  try {
    return await run();
  } finally {
    console.error = original;
  }
}

const product = (slug: string) => {
  const found = products.find((p) => p.slug === slug);
  assert.ok(found, slug);
  return found;
};

describe("cached catalog repositories (catalog.ts, Firestore emulator)", () => {
  let catalog: typeof CatalogModule;
  const app = initializeApp({ projectId: PROJECT_ID }, "catalog-cache-tests");

  before(async () => {
    // catalog.ts reads its env like the app does; .env.example holds the emulator values and
    // never overrides a variable that is already set (FIRESTORE_EMULATOR_HOST from the emulators).
    process.loadEnvFile(".env.example");
    // Next's AsyncLocalStorage shim reads this global when it loads, and unstable_cache runs the
    // read inside one; then it looks for the cache here when no request is active.
    globals.AsyncLocalStorage ??= AsyncLocalStorage;
    globals.__incrementalCache = cache;
    await seedCatalog(getFirestore(app));
    catalog = await import("../../lib/firebase/repositories/catalog");
  });

  beforeEach(() => cache.reset());

  after(async () => {
    delete globals.__incrementalCache;
    await Promise.all(
      getApps()
        .filter((a) => a.name === app.name || a.name === "starflames-admin")
        .map((a) => deleteApp(a)),
    );
  });

  it("returns real Dates on a miss and on a hit", async () => {
    const miss = await quietly(() => catalog.getProducts());
    const hit = await quietly(() => catalog.getProducts());
    assert.equal(cache.misses, 1);
    assert.equal(cache.hits, 1);
    assert.equal(miss.length, 15);
    assert.ok(miss[0]?.publishedAt instanceof Date);
    assert.ok(hit[0]?.publishedAt instanceof Date);
    assert.deepEqual(hit, miss);

    const detailMiss = await catalog.getProductBySlug("moonrise");
    const detailHit = await catalog.getProductBySlug("moonrise");
    assert.ok(detailMiss?.updatedAt instanceof Date);
    assert.ok(detailHit?.updatedAt instanceof Date);
    assert.deepEqual(detailHit, detailMiss);

    await catalog.getCollections();
    const collections = await catalog.getCollections();
    assert.ok(collections[0]?.createdAt instanceof Date);
    assert.equal(cache.hits, 3);
  });

  it("keeps one entry per function and argument list", async () => {
    await catalog.getProductBySlug("moonrise");
    await catalog.getProductBySlug("quiet-shore");
    await catalog.getProductBySlug("moonrise");
    await catalog.getCollectionBySlug("moonrise");
    await catalog.getCollectionBySlug("moonlit-terrace");
    await quietly(async () => {
      await catalog.getProductsByCollection("moonlit-terrace");
      await catalog.getBestsellers(4);
      await catalog.getBestsellers(8);
    });
    await catalog.getPublishedProductSlugs();
    await catalog.getCollectionSlugs();
    assert.equal(cache.hits, 1);
    assert.deepEqual(cache.keyParts(), [
      ["bestsellers", "[4]"],
      ["bestsellers", "[8]"],
      ["collection", '["moonlit-terrace"]'],
      ["collection", '["moonrise"]'],
      ["collection-slugs", "[]"],
      ["product", '["moonrise"]'],
      ["product", '["quiet-shore"]'],
      ["product-slugs", "[]"],
      ["products-in-collection", '["moonlit-terrace"]'],
    ]);
    // A product and a collection read with the same argument stay apart.
    assert.equal(await catalog.getCollectionBySlug("moonrise"), null);
    assert.equal(
      (await catalog.getProductBySlug("moonrise"))?.slug,
      "moonrise",
    );
  });

  it("getRelatedProducts: products listed in the product's primary collection (primary or alsoIn), without the product", async () => {
    const lastChapter = product("last-chapter");
    const related = await catalog.getRelatedProducts(lastChapter, 5);
    assert.deepEqual(slugsOf(related), ["margin-notes", "reading-nook-set"]);
    assert.deepEqual(cache.keyParts(), [
      ["related", '["last-chapter","starlit-library",5]'],
    ]);
  });

  it("getGiftSetContents reads the content slugs as one cached batch, in contents order", async () => {
    const set = product("little-constellation-set");
    const expected = [
      ["late-bloom", "late-bloom-120", 1, "120 g"],
      ["margin-notes", "margin-notes-120", 1, "120 g"],
      ["quiet-shore", "quiet-shore-120", 1, "120 g"],
    ];
    const lineParts = (lines: readonly GiftSetContentLine[]) =>
      lines.map((l) => [l.product.slug, l.sku, l.quantity, l.variantLabel]);
    const miss = await catalog.getGiftSetContents(set);
    const hit = await catalog.getGiftSetContents(set);
    assert.deepEqual(lineParts(miss), expected);
    assert.deepEqual(lineParts(hit), expected);
    assert.ok(hit[0]?.product.publishedAt instanceof Date);
    assert.equal(cache.hits, 1);
    assert.deepEqual(cache.keyParts(), [
      ["cards-by-slugs", '["late-bloom,margin-notes,quiet-shore"]'],
    ]);
    // Other products and empty batches never reach the cache.
    assert.deepEqual(await catalog.getGiftSetContents(product("moonrise")), []);
    assert.deepEqual(await catalog.getProductCardsBySlugs([]), []);
    assert.equal(cache.entries.size, 1);
  });
});
