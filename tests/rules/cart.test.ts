import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";

import { deriveCatalog } from "../../lib/domain/derive-product";
import { CART_LIMITS } from "../../lib/types";
import { cartPath, COLLECTIONS } from "../../lib/firebase/paths";
import { catalogProductInputs } from "../../scripts/seed/catalog";
import {
  firestoreOf,
  OWNER_UID,
  PERSONAS,
  setUpRulesEnv,
  tearDown,
  type RulesEnv,
} from "./support/env";

/** The real catalog (17 products), published, plus probes to reach 21 distinct products. */
const catalog = deriveCatalog(catalogProductInputs()).map((p) => ({
  ...p,
  status: "published" as const,
}));
const probe = (slug: string, status: string) => ({
  slug,
  status,
  skus: [slug, `${slug}-220`],
});
const probes = Array.from({ length: 4 }, (_, i) =>
  probe(`rules-probe-${i + 1}`, "published"),
);
const draftProduct = probe("rules-probe-draft", "draft");
const archivedProduct = probe("rules-probe-archived", "archived");
/** 21 distinct published products, one SKU each. */
const lineSources = [...catalog, ...probes]
  .map((p) => ({ productSlug: p.slug, sku: p.skus[0]! }))
  .slice(0, 21);
const multiSku = catalog.find((p) => p.skus.length >= 2)!;
const moonrise = { productSlug: multiSku.slug, sku: multiSku.skus[0]! };

function line(
  source: { productSlug: string; sku: string },
  overrides: Record<string, unknown> = {},
) {
  return {
    productSlug: source.productSlug,
    sku: source.sku,
    quantity: 1,
    addedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

let rules: RulesEnv;
let next = 0;

function newCustomer(): { db: Firestore; uid: string } {
  const uid = `cart-customer-${++next}`;
  return { uid, db: firestoreOf(rules.env.authenticatedContext(uid)) };
}

const lineRef = (db: Firestore, uid: string, sku: string) =>
  doc(db, cartPath(uid), sku);

before(async () => {
  assert.equal(lineSources.length, 21);
  assert.ok(multiSku, "the catalog has a product with two SKUs");
  rules = await setUpRulesEnv();
  await rules.env.clearFirestore();
  await rules.env.withSecurityRulesDisabled(async (ctx) => {
    const db = firestoreOf(ctx);
    for (const p of [...catalog, ...probes, draftProduct, archivedProduct]) {
      await setDoc(doc(db, COLLECTIONS.products, p.slug), p);
    }
    await setDoc(lineRef(db, OWNER_UID, moonrise.sku), {
      ...moonrise,
      quantity: 2,
      addedAt: Timestamp.fromDate(new Date("2026-10-01T00:00:00Z")),
      updatedAt: Timestamp.fromDate(new Date("2026-10-01T00:00:00Z")),
    });
  });
});

after(() => tearDown(rules));

describe("users/{uid}/cart: who can read and write", () => {
  for (const who of PERSONAS) {
    const allowed = who === "owner";
    const verb = allowed ? "can" : "cannot";
    const expect = (p: Promise<unknown>) =>
      allowed ? assertSucceeds(p) : assertFails(p);

    it(`${who} ${verb} get and list alice's cart`, async () => {
      const db = firestoreOf(rules.as(who));
      await expect(getDoc(lineRef(db, OWNER_UID, moonrise.sku)));
      await expect(getDocs(collection(db, cartPath(OWNER_UID))));
    });

    it(`${who} ${verb} add a line to alice's cart`, async () => {
      const db = firestoreOf(rules.as(who));
      const source = lineSources[1]!;
      await expect(setDoc(lineRef(db, OWNER_UID, source.sku), line(source)));
    });

    it(`${who} ${verb} change a quantity in alice's cart`, async () => {
      const db = firestoreOf(rules.as(who));
      await expect(
        updateDoc(lineRef(db, OWNER_UID, moonrise.sku), {
          quantity: 3,
          updatedAt: serverTimestamp(),
        }),
      );
    });

    it(`${who} ${verb} delete a line from alice's cart`, async () => {
      const db = firestoreOf(rules.as(who));
      // Non-owners target the existing line; the owner adds a line, then deletes it.
      const sku = allowed ? lineSources[2]!.sku : moonrise.sku;
      if (allowed) {
        await assertSucceeds(
          setDoc(lineRef(db, OWNER_UID, sku), line(lineSources[2]!)),
        );
      }
      await expect(deleteDoc(lineRef(db, OWNER_UID, sku)));
    });
  }
});

describe("users/{uid}/cart: line validation", () => {
  it("allows quantity 10", async () => {
    const { db, uid } = newCustomer();
    await assertSucceeds(
      setDoc(lineRef(db, uid, moonrise.sku), line(moonrise, { quantity: 10 })),
    );
  });

  const bad: [string, Record<string, unknown>][] = [
    ["quantity 0", { quantity: 0 }],
    ["quantity 11", { quantity: 11 }],
    ["a fractional quantity", { quantity: 1.5 }],
    ["a string quantity", { quantity: "2" }],
    ["a price field", { price: 100 }],
    ["a missing updatedAt", { updatedAt: undefined }],
    ["a client addedAt", { addedAt: Timestamp.now() }],
    ["a client updatedAt", { updatedAt: Timestamp.now() }],
    ["a sku that differs from the document ID", { sku: multiSku.skus[1] }],
  ];
  for (const [what, overrides] of bad) {
    it(`denies ${what}`, async () => {
      const { db, uid } = newCustomer();
      const data = Object.fromEntries(
        Object.entries(line(moonrise, overrides)).filter(
          ([, v]) => v !== undefined,
        ),
      );
      await assertFails(setDoc(lineRef(db, uid, moonrise.sku), data));
    });
  }

  it("denies a malformed SKU (document ID and field)", async () => {
    const { db, uid } = newCustomer();
    const sku = "Moonrise_220";
    await assertFails(
      setDoc(lineRef(db, uid, sku), line({ ...moonrise, sku })),
    );
  });

  it("denies a SKU the product doesn't have", async () => {
    const { db, uid } = newCustomer();
    const sku = `${moonrise.productSlug}-999`;
    await assertFails(
      setDoc(lineRef(db, uid, sku), line({ ...moonrise, sku })),
    );
  });

  it("denies a SKU named under another product", async () => {
    const { db, uid } = newCustomer();
    const other = lineSources.find(
      (s) => s.productSlug !== moonrise.productSlug,
    )!;
    await assertFails(
      setDoc(
        lineRef(db, uid, moonrise.sku),
        line({ productSlug: other.productSlug, sku: moonrise.sku }),
      ),
    );
  });

  for (const p of [draftProduct, archivedProduct]) {
    it(`denies a line for the ${p.status} product`, async () => {
      const { db, uid } = newCustomer();
      const source = { productSlug: p.slug, sku: p.skus[0]! };
      await assertFails(setDoc(lineRef(db, uid, source.sku), line(source)));
    });
  }

  it("denies a line for a missing product", async () => {
    const { db, uid } = newCustomer();
    const source = { productSlug: "no-such-product", sku: "no-such-product" };
    await assertFails(setDoc(lineRef(db, uid, source.sku), line(source)));
  });
});

describe("users/{uid}/cart: update validation", () => {
  it("allows a quantity change that keeps addedAt", async () => {
    const db = firestoreOf(rules.as("owner"));
    await assertSucceeds(
      updateDoc(lineRef(db, OWNER_UID, moonrise.sku), {
        quantity: 4,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("denies a quantity of 11, a changed addedAt and a missing updatedAt", async () => {
    const db = firestoreOf(rules.as("owner"));
    const ref = lineRef(db, OWNER_UID, moonrise.sku);
    await assertFails(
      updateDoc(ref, { quantity: 11, updatedAt: serverTimestamp() }),
    );
    await assertFails(
      updateDoc(ref, {
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
    await assertFails(updateDoc(ref, { quantity: 5 }));
  });

  it("denies an update once the product is unpublished, but still allows delete", async () => {
    const { db, uid } = newCustomer();
    const source = { productSlug: probes[3]!.slug, sku: probes[3]!.skus[0]! };
    await assertSucceeds(setDoc(lineRef(db, uid, source.sku), line(source)));
    await rules.env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(
        doc(firestoreOf(ctx), COLLECTIONS.products, source.productSlug),
        {
          status: "draft",
        },
      );
    });
    await assertFails(
      updateDoc(lineRef(db, uid, source.sku), {
        quantity: 2,
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(deleteDoc(lineRef(db, uid, source.sku)));
    await rules.env.withSecurityRulesDisabled(async (ctx) => {
      await updateDoc(
        doc(firestoreOf(ctx), COLLECTIONS.products, source.productSlug),
        {
          status: "published",
        },
      );
    });
  });
});

describe("users/{uid}/cart: the sign-in merge batch and the get() budget", () => {
  async function mergeBatch(
    sources: readonly { productSlug: string; sku: string }[],
  ) {
    const { db, uid } = newCustomer();
    const batch = writeBatch(db);
    for (const s of sources) batch.set(lineRef(db, uid, s.sku), line(s));
    await batch.commit();
    return getDocs(collection(db, cartPath(uid)));
  }

  it(`a ${CART_LIMITS.maxLines}-line batch over ${CART_LIMITS.maxLines} distinct products is allowed`, async () => {
    const snap = await assertSucceeds(
      mergeBatch(lineSources.slice(0, CART_LIMITS.maxLines)),
    );
    assert.equal(snap.size, CART_LIMITS.maxLines);
  });

  it("a batch over 21 distinct products is denied (21 product get()s > 20 accesses)", async () => {
    // Every one of the 21 lines is valid on its own: both 20-line halves pass.
    await assertSucceeds(mergeBatch(lineSources.slice(0, 20)));
    await assertSucceeds(mergeBatch(lineSources.slice(1, 21)));
    await assertFails(mergeBatch(lineSources.slice(0, 21)));
  });

  it("repeat get()s of one product count once: 21 lines over 20 products pass the rules", async () => {
    // Documents that rules don't count lines: the 20-line limit is the client's and the
    // checkout Function's (spec §1 Cart limit).
    const sources = [
      { productSlug: multiSku.slug, sku: multiSku.skus[0]! },
      { productSlug: multiSku.slug, sku: multiSku.skus[1]! },
      ...lineSources
        .filter((s) => s.productSlug !== multiSku.slug)
        .slice(0, 19),
    ];
    assert.equal(sources.length, 21);
    assert.equal(new Set(sources.map((s) => s.productSlug)).size, 20);
    const snap = await assertSucceeds(mergeBatch(sources));
    assert.equal(snap.size, 21);
  });
});
