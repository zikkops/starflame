import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  catalogProblems,
  deriveCatalog,
} from "../../lib/domain/derive-product";
import { parseProduct } from "../../lib/domain/schemas";
import { SCENT_FAMILIES } from "../../lib/types";
import {
  CATALOG_KEYS,
  catalogCollectionInputs,
  catalogProductInputs,
  imageSize,
  loadCatalogJson,
} from "../../scripts/seed/catalog";

describe("catalog.json fixtures", () => {
  const json = loadCatalogJson();

  it("uses only keys the spec maps (spec §6)", () => {
    for (const p of json.products) {
      assert.deepEqual(
        Object.keys(p).sort(),
        [...CATALOG_KEYS.product].sort(),
        String(p.slug),
      );
      for (const v of p.variants as Record<string, unknown>[]) {
        assert.deepEqual(
          Object.keys(v).sort(),
          [...CATALOG_KEYS.variant].sort(),
          String(v.sku),
        );
      }
    }
    for (const c of json.collections) {
      assert.deepEqual(
        Object.keys(c).sort(),
        [...CATALOG_KEYS.collection].sort(),
        String(c.slug),
      );
    }
  });

  it("all 17 products and 6 collections pass the guards", () => {
    assert.equal(catalogProductInputs().length, 17);
    assert.equal(catalogCollectionInputs().length, 6);
  });

  it("image sizes come from manifest.json, not constants", () => {
    const products = catalogProductInputs();
    const sizes = new Set<string>();
    for (const p of products) {
      for (const img of p.images) {
        assert.deepEqual(
          { width: img.width, height: img.height },
          imageSize(json, img.id),
          img.id,
        );
        sizes.add(`${img.id.slice(0, 4)}${img.width}x${img.height}`);
      }
    }
    // cat-* originals; lif-* = col-* (1744 × 2336) minus the top 6.25%.
    assert.deepEqual([...sizes].sort(), ["cat-1792x2240", "lif-1744x2190"]);
    for (const c of catalogCollectionInputs()) {
      assert.deepEqual(
        { width: c.moodImage.width, height: c.moodImage.height },
        { width: 1744, height: 2336 },
        c.slug,
      );
    }
    assert.throws(() => imageSize(json, "no-such-shot"), /no-such-shot/);
  });

  it("has no whole-catalog problems", () => {
    const collections = catalogCollectionInputs().map((c) => c.slug);
    assert.deepEqual(catalogProblems(catalogProductInputs(), collections), []);
  });

  it("scent family slugs match SCENT_FAMILIES, in order", () => {
    assert.deepEqual(
      json.scentFamilies.map((f) => f.slug),
      [...SCENT_FAMILIES],
    );
  });

  it("every derived product round-trips through parseProduct", () => {
    const now = new Date("2026-10-09T00:00:00Z");
    for (const p of deriveCatalog(catalogProductInputs())) {
      const stored = { ...p, createdAt: now, updatedAt: now, publishedAt: now };
      assert.deepEqual(parseProduct(stored, p.slug), stored);
    }
  });
});
