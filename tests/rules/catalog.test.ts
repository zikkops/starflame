import { after, before, describe, it } from "node:test";

import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { deriveCatalog } from "../../lib/domain/derive-product";
import { COLLECTIONS } from "../../lib/firebase/paths";
import {
  catalogCollectionInputs,
  catalogProductInputs,
} from "../../scripts/seed/catalog";
import {
  firestoreOf,
  PERSONAS,
  setUpRulesEnv,
  tearDown,
  type RulesEnv,
} from "./support/env";

const products = deriveCatalog(catalogProductInputs());
const collections = catalogCollectionInputs();
const published = { ...products[0]!, status: "published" as const };
const draft = { ...products[1]!, status: "draft" as const };
const archived = { ...products[2]!, status: "archived" as const };
const publishedCollection = {
  ...collections[0]!,
  status: "published" as const,
};
const draftCollection = { ...collections[1]!, status: "draft" as const };

let rules: RulesEnv;

before(async () => {
  rules = await setUpRulesEnv();
  await rules.env.clearFirestore();
  await rules.env.withSecurityRulesDisabled(async (ctx) => {
    const db = firestoreOf(ctx);
    for (const p of [published, draft, archived]) {
      await setDoc(doc(db, COLLECTIONS.products, p.slug), p);
    }
    for (const c of [publishedCollection, draftCollection]) {
      await setDoc(doc(db, COLLECTIONS.collections, c.slug), c);
    }
  });
});

after(() => tearDown(rules));

for (const [name, path, pub, unpublished] of [
  ["products", COLLECTIONS.products, published.slug, [draft, archived]],
  [
    "collections",
    COLLECTIONS.collections,
    publishedCollection.slug,
    [draftCollection],
  ],
] as const) {
  describe(`${name}: public read of published documents only`, () => {
    for (const who of PERSONAS) {
      it(`${who} can get a published document`, async () => {
        const db = firestoreOf(rules.as(who));
        await assertSucceeds(getDoc(doc(db, path, pub)));
      });

      for (const u of unpublished) {
        it(`${who} cannot get the ${u.status} document`, async () => {
          const db = firestoreOf(rules.as(who));
          await assertFails(getDoc(doc(db, path, u.slug)));
        });
      }

      it(`${who} can list with status == "published" ordered by sortOrder`, async () => {
        const db = firestoreOf(rules.as(who));
        const q = query(
          collection(db, path),
          where("status", "==", "published"),
          orderBy("sortOrder"),
        );
        await assertSucceeds(getDocs(q));
      });

      it(`${who} cannot list without the status filter`, async () => {
        const db = firestoreOf(rules.as(who));
        await assertFails(getDocs(collection(db, path)));
      });

      it(`${who} cannot list drafts`, async () => {
        const db = firestoreOf(rules.as(who));
        const q = query(collection(db, path), where("status", "==", "draft"));
        await assertFails(getDocs(q));
      });
    }
  });

  describe(`${name}: no client writes, admin claim included`, () => {
    for (const who of PERSONAS) {
      it(`${who} cannot create, update or delete`, async () => {
        const db = firestoreOf(rules.as(who));
        await assertFails(
          setDoc(doc(db, path, "new-doc"), {
            slug: "new-doc",
            status: "published",
          }),
        );
        await assertFails(
          updateDoc(doc(db, path, pub), { sortOrder: 0, status: "draft" }),
        );
        await assertFails(deleteDoc(doc(db, path, pub)));
      });
    }
  });
}

describe("products: Firestore query shapes the M3 plan relies on", () => {
  it("collectionSlugs array-contains + status + orderBy sortOrder is allowed", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    const q = query(
      collection(db, COLLECTIONS.products),
      where("collectionSlugs", "array-contains", published.collection),
      where("status", "==", "published"),
      orderBy("sortOrder"),
    );
    await assertSucceeds(getDocs(q));
  });

  it("badges array-contains + status + orderBy sortOrder is allowed", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    const q = query(
      collection(db, COLLECTIONS.products),
      where("badges", "array-contains", "bestseller"),
      where("status", "==", "published"),
      orderBy("sortOrder"),
    );
    await assertSucceeds(getDocs(q));
  });

  it("a get of a missing product is denied (no resource to check)", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    await assertFails(getDoc(doc(db, COLLECTIONS.products, "no-such-product")));
  });
});

describe("default deny", () => {
  for (const who of PERSONAS) {
    it(`${who} cannot read or write an unmatched path`, async () => {
      const db = firestoreOf(rules.as(who));
      await assertFails(getDoc(doc(db, "misc", "x")));
      await assertFails(setDoc(doc(db, "misc", "x"), { a: 1 }));
      await assertFails(
        setDoc(doc(db, "users", "alice", "wishlist", "x"), { a: 1 }),
      );
    });
  }
});
