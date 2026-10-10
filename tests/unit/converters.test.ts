import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  FieldValue,
  Timestamp as AdminTimestamp,
  type QueryDocumentSnapshot as AdminSnapshot,
} from "firebase-admin/firestore";
import {
  serverTimestamp,
  Timestamp as ClientTimestamp,
  type QueryDocumentSnapshot as ClientSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";

import { deriveCatalog } from "../../lib/domain/derive-product";
import { DocumentValidationError } from "../../lib/firebase/converter-utils";
import { adminConverters } from "../../lib/firebase/converters.admin";
import { clientConverters } from "../../lib/firebase/converters.client";
import { storageObjectUrl } from "../../lib/firebase/storage-url";
import { readPublicFirebaseEnv } from "../../lib/firebase/env.public";
import { catalogProductInputs } from "../../scripts/seed/catalog";

const now = new Date("2026-10-09T12:00:00Z");

/** The converters only use id, ref.path and data(); a stub keeps these tests emulator-free. */
function adminSnap(path: string, data: unknown): AdminSnapshot {
  const id = path.split("/").at(-1) ?? "";
  // Test double: only the members the converter reads.
  return { id, ref: { path }, data: () => data } as unknown as AdminSnapshot;
}
function clientSnap(
  path: string,
  data: (o?: SnapshotOptions) => unknown,
): ClientSnapshot {
  const id = path.split("/").at(-1) ?? "";
  // Test double: only the members the converter reads.
  return { id, ref: { path }, data } as unknown as ClientSnapshot;
}

const moonrise = deriveCatalog(catalogProductInputs()).find(
  (p) => p.slug === "moonrise",
);
assert.ok(moonrise);
const product = {
  ...moonrise,
  createdAt: now,
  updatedAt: now,
  publishedAt: now,
};

describe("admin converters", () => {
  it("round-trips a product: Date ↔ Timestamp", () => {
    const data = adminConverters.product.toFirestore(product);
    assert.ok(data.createdAt instanceof AdminTimestamp);
    assert.equal(data.publishedAt.toMillis(), now.getTime());
    const back = adminConverters.product.fromFirestore(
      adminSnap("products/moonrise", data),
    );
    assert.deepEqual(back, product);
  });

  it("passes FieldValue sentinels through", () => {
    const data = adminConverters.product.toFirestore({
      ...product,
      updatedAt: FieldValue.serverTimestamp(),
    });
    assert.ok(data.updatedAt instanceof FieldValue);
    assert.ok(data.createdAt instanceof AdminTimestamp);
  });

  it("does not store the id field (order.id is the document ID)", () => {
    const data = adminConverters.userProfile.toFirestore({
      uid: "u1" as never, // Test value: a uid is minted by the guard in real code.
      displayName: null,
      defaultShippingAddress: null,
      createdAt: now,
      updatedAt: now,
    });
    assert.equal("uid" in data, false);
    assert.equal(
      adminConverters.userProfile.fromFirestore(adminSnap("users/u1", data))
        .uid,
      "u1",
    );
  });

  it("throws DocumentValidationError with the document path", () => {
    assert.throws(
      () =>
        adminConverters.product.fromFirestore(
          adminSnap("products/moonrise", { ...product, name: 1 }),
        ),
      (e: unknown) =>
        e instanceof DocumentValidationError &&
        e.docPath === "products/moonrise" &&
        /name: expected string/.test(e.message),
    );
  });
});

describe("client converters", () => {
  it("cart line: writes serverTimestamp(), reads with serverTimestamps: estimate", () => {
    const line = {
      productSlug: moonrise.slug,
      sku: moonrise.skus[0]!,
      quantity: 1,
      addedAt: now,
      updatedAt: now,
    };
    const data = clientConverters.cartLine.toFirestore({
      ...line,
      updatedAt: serverTimestamp(),
    });
    assert.ok(data.addedAt instanceof ClientTimestamp);
    let seen: SnapshotOptions | undefined;
    const back = clientConverters.cartLine.fromFirestore(
      clientSnap("users/u1/cart/moonrise-220", (o) => {
        seen = o;
        return { ...data, updatedAt: ClientTimestamp.fromDate(now) };
      }),
    );
    assert.equal(seen?.serverTimestamps, "estimate");
    assert.deepEqual(back, line);
  });
});

describe("storageObjectUrl", () => {
  it("builds the emulator URL from the public env (no hardcoded host)", () => {
    const env = readPublicFirebaseEnv({
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-starflames",
      NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
      NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: "127.0.0.1:6104",
      NEXT_PUBLIC_AUTH_EMULATOR_HOST: "127.0.0.1:6106",
      NEXT_PUBLIC_STORAGE_EMULATOR_HOST: "127.0.0.1:6107",
      NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST: "127.0.0.1:6103",
    });
    assert.equal(
      storageObjectUrl("products/moonrise/cat-moonrise.png", env),
      "http://127.0.0.1:6107/v0/b/demo-starflames.appspot.com/o/products%2Fmoonrise%2Fcat-moonrise.png?alt=media",
    );
  });
});
