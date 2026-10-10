import assert from "node:assert/strict";

import type { Firestore } from "firebase-admin/firestore";

import { deriveCatalog } from "../../lib/domain/derive-product";
import { adminCollections } from "../../lib/firebase/converters.admin";
import type { PublishStatus } from "../../lib/types";
import {
  catalogCollectionInputs,
  catalogProductInputs,
} from "../../scripts/seed/catalog";

/**
 * The emulator data of the repository tests (`npm run test:repos`): the whole catalog, written
 * through the Admin converters, with some documents set to draft or archived and one invalid
 * document, so every read is checked for published-only results. Each test file seeds it again
 * in its own before(); the files run one at a time (--test-concurrency=1).
 */

export const PROJECT_ID = "demo-starflames";

export const DRAFT_PRODUCT = "midnight-balcony"; // moonlit-terrace, badge "new"
export const ARCHIVED_PRODUCT = "ink-and-cedar"; // a bestseller, and in the reading-nook-set contents
export const DRAFT_COLLECTION = "comet-season";
export const ARCHIVED_COLLECTION = "lakeside-hush";
export const BROKEN = "broken-candle"; // status published, but fails the product guard

const productStatus = (slug: string): PublishStatus =>
  slug === DRAFT_PRODUCT
    ? "draft"
    : slug === ARCHIVED_PRODUCT
      ? "archived"
      : "published";
const collectionStatus = (slug: string): PublishStatus =>
  slug === DRAFT_COLLECTION
    ? "draft"
    : slug === ARCHIVED_COLLECTION
      ? "archived"
      : "published";

export const products = deriveCatalog(catalogProductInputs()).map((p) => ({
  ...p,
  status: productStatus(p.slug),
}));
export const collections = catalogCollectionInputs().map((c) => ({
  ...c,
  status: collectionStatus(c.slug),
}));
export const publishedProducts = products
  .filter((p) => p.status === "published")
  .sort((a, b) => a.sortOrder - b.sortOrder);

export const slugsOf = (list: readonly { slug: string }[]) =>
  list.map((x) => x.slug);

/** The Firestore emulator host, after checking that the tests run under `npm run test:repos`. */
export function emulatorHost(): string {
  const host = process.env.FIRESTORE_EMULATOR_HOST;
  if (!host || !process.env.FIREBASE_EMULATOR_HUB) {
    throw new Error(
      "Run the repository tests with `npm run test:repos` (firebase emulators:exec).",
    );
  }
  return host;
}

/** Clears the emulator's Firestore and writes the fixtures. */
export async function seedCatalog(db: Firestore): Promise<void> {
  const cleared = await fetch(
    `http://${emulatorHost()}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    { method: "DELETE" },
  );
  assert.equal(cleared.ok, true, "clear the Firestore emulator");

  const refs = adminCollections(db);
  const at = new Date("2026-10-01T00:00:00Z");
  const batch = db.batch();
  for (const p of products) {
    batch.set(refs.products.doc(p.slug), {
      ...p,
      createdAt: at,
      updatedAt: at,
      publishedAt:
        p.status === "published" ? new Date(at.getTime() + p.sortOrder) : null,
    });
  }
  for (const c of collections) {
    batch.set(refs.collections.doc(c.slug), {
      ...c,
      createdAt: at,
      updatedAt: at,
    });
  }
  // Written without the converter: a published document the guard refuses.
  batch.set(db.collection("products").doc(BROKEN), {
    slug: BROKEN,
    name: "Broken",
    status: "published",
    sortOrder: 0,
    collectionSlugs: ["moonlit-terrace"],
    badges: ["bestseller"],
    privateNote: "must never be logged",
  });
  await batch.commit();
}
