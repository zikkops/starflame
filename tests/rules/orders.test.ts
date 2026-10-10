import assert from "node:assert/strict";
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
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { COLLECTIONS } from "../../lib/firebase/paths";
import {
  ADMIN_UID,
  firestoreOf,
  OTHER_UID,
  OWNER_UID,
  PERSONAS,
  setUpRulesEnv,
  tearDown,
  type RulesEnv,
} from "./support/env";

/** Rules read only userId; the rest is a trimmed Order so the documents look real. */
function order(userId: string | null, day: number) {
  return {
    orderNumber: `SF-1000${day}`,
    userId,
    email: `${userId ?? "guest"}@example.com`,
    accessTokenHash: "0".repeat(64),
    status: "paid",
    currency: "USD",
    createdAt: Timestamp.fromDate(new Date(`2026-10-0${day}T12:00:00Z`)),
    updatedAt: Timestamp.fromDate(new Date(`2026-10-0${day}T12:00:00Z`)),
  };
}

const ORDERS = {
  alice1: order(OWNER_UID, 1),
  alice2: order(OWNER_UID, 2),
  bob: order(OTHER_UID, 3),
  admin: order(ADMIN_UID, 4),
  guest: order(null, 5),
};
type OrderKey = keyof typeof ORDERS;
/** Which persona owns which order; anonymous owns none, guests are nobody's. */
const OWN: Record<(typeof PERSONAS)[number], OrderKey | null> = {
  anonymous: null,
  owner: "alice1",
  other: "bob",
  admin: "admin",
};

let rules: RulesEnv;

before(async () => {
  rules = await setUpRulesEnv();
  await rules.env.clearFirestore();
  await rules.env.withSecurityRulesDisabled(async (ctx) => {
    const db = firestoreOf(ctx);
    for (const [id, data] of Object.entries(ORDERS)) {
      await setDoc(doc(db, COLLECTIONS.orders, id), data);
    }
  });
});

after(() => tearDown(rules));

describe("orders: a customer reads only their own orders", () => {
  for (const who of PERSONAS) {
    for (const id of Object.keys(ORDERS) as OrderKey[]) {
      const own = OWN[who] === id || (who === "owner" && id === "alice2");
      it(`${who} ${own ? "can" : "cannot"} get order ${id}`, async () => {
        const db = firestoreOf(rules.as(who));
        const read = getDoc(doc(db, COLLECTIONS.orders, id));
        await (own ? assertSucceeds(read) : assertFails(read));
      });
    }

    it(`${who} cannot list orders without the userId filter`, async () => {
      const db = firestoreOf(rules.as(who));
      await assertFails(getDocs(collection(db, COLLECTIONS.orders)));
    });

    it(`${who} cannot list guest orders (userId == null)`, async () => {
      const db = firestoreOf(rules.as(who));
      const q = query(
        collection(db, COLLECTIONS.orders),
        where("userId", "==", null),
      );
      await assertFails(getDocs(q));
    });

    it(`${who} cannot list alice's orders unless they are alice`, async () => {
      const db = firestoreOf(rules.as(who));
      const q = query(
        collection(db, COLLECTIONS.orders),
        where("userId", "==", OWNER_UID),
        orderBy("createdAt", "desc"),
      );
      if (who === "owner") {
        const snap = await assertSucceeds(getDocs(q));
        assert.deepEqual(
          snap.docs.map((d) => d.id),
          ["alice2", "alice1"],
        );
      } else {
        await assertFails(getDocs(q));
      }
    });
  }
});

describe("orders: no client writes ever", () => {
  for (const who of PERSONAS) {
    it(`${who} cannot create, update or delete an order`, async () => {
      const db = firestoreOf(rules.as(who));
      const own = OWN[who] ?? "guest";
      await assertFails(
        setDoc(doc(db, COLLECTIONS.orders, `new-${who}`), {
          ...order(who === "anonymous" ? null : OWNER_UID, 6),
          createdAt: serverTimestamp(),
        }),
      );
      await assertFails(
        updateDoc(doc(db, COLLECTIONS.orders, own), { status: "delivered" }),
      );
      await assertFails(deleteDoc(doc(db, COLLECTIONS.orders, own)));
    });
  }
});
