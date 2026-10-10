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
  type Firestore,
} from "firebase/firestore";

import { COLLECTIONS } from "../../lib/firebase/paths";
import {
  firestoreOf,
  OWNER_UID,
  PERSONAS,
  setUpRulesEnv,
  tearDown,
  type RulesEnv,
} from "./support/env";

const address = {
  fullName: "Ana Lake",
  line1: "12 Harbour Road",
  line2: null,
  city: "Portland",
  region: "OR",
  postalCode: "97201",
  country: "US",
  phone: null,
};

/** A valid create payload: request.time stamps, all four keys. */
function profile(overrides: Record<string, unknown> = {}) {
  return {
    displayName: "Ana",
    defaultShippingAddress: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

let rules: RulesEnv;
let next = 0;

/** A fresh signed-in customer, so each create test starts without a profile. */
function newCustomer(): { db: Firestore; uid: string } {
  const uid = `customer-${++next}`;
  return { uid, db: firestoreOf(rules.env.authenticatedContext(uid)) };
}

before(async () => {
  rules = await setUpRulesEnv();
  await rules.env.clearFirestore();
  await rules.env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(firestoreOf(ctx), COLLECTIONS.users, OWNER_UID), {
      displayName: "Alice",
      defaultShippingAddress: address,
      createdAt: Timestamp.fromDate(new Date("2026-10-01T00:00:00Z")),
      updatedAt: Timestamp.fromDate(new Date("2026-10-01T00:00:00Z")),
    });
  });
});

after(() => tearDown(rules));

describe("users/{uid}: who can read and write", () => {
  for (const who of PERSONAS) {
    const allowed = who === "owner";
    it(`${who} ${allowed ? "can" : "cannot"} get alice's profile`, async () => {
      const db = firestoreOf(rules.as(who));
      const read = getDoc(doc(db, COLLECTIONS.users, OWNER_UID));
      await (allowed ? assertSucceeds(read) : assertFails(read));
    });

    it(`${who} ${allowed ? "can" : "cannot"} update alice's profile`, async () => {
      const db = firestoreOf(rules.as(who));
      const write = updateDoc(doc(db, COLLECTIONS.users, OWNER_UID), {
        displayName: `Alice (${who})`,
        updatedAt: serverTimestamp(),
      });
      await (allowed ? assertSucceeds(write) : assertFails(write));
    });

    it(`${who} cannot delete alice's profile`, async () => {
      const db = firestoreOf(rules.as(who));
      await assertFails(deleteDoc(doc(db, COLLECTIONS.users, OWNER_UID)));
    });

    it(`${who} cannot list users`, async () => {
      const db = firestoreOf(rules.as(who));
      await assertFails(getDocs(collection(db, COLLECTIONS.users)));
    });

    it(`${who} cannot create a profile under another uid`, async () => {
      const db = firestoreOf(rules.as(who));
      await assertFails(
        setDoc(doc(db, COLLECTIONS.users, "customer-new"), profile()),
      );
    });
  }
});

describe("users/{uid}: create validation", () => {
  it("allows a minimal profile (nulls)", async () => {
    const { db, uid } = newCustomer();
    await assertSucceeds(
      setDoc(doc(db, COLLECTIONS.users, uid), profile({ displayName: null })),
    );
  });

  it("allows a full address and an 80-character name", async () => {
    const { db, uid } = newCustomer();
    await assertSucceeds(
      setDoc(
        doc(db, COLLECTIONS.users, uid),
        profile({
          displayName: "a".repeat(80),
          defaultShippingAddress: {
            ...address,
            line2: "Flat 3",
            phone: "+1 503 555 0100",
          },
        }),
      ),
    );
  });

  const bad: [string, Record<string, unknown>][] = [
    ["an admin field", { admin: true }],
    ["a role field", { role: "admin" }],
    ["an email field", { email: "ana@example.com" }],
    ["a missing key", { defaultShippingAddress: undefined }],
    ["an empty name", { displayName: "" }],
    ["an 81-character name", { displayName: "a".repeat(81) }],
    ["a numeric name", { displayName: 7 }],
    ["a client createdAt", { createdAt: Timestamp.now() }],
    ["a client updatedAt", { updatedAt: Timestamp.now() }],
    [
      "a lowercase country",
      { defaultShippingAddress: { ...address, country: "us" } },
    ],
    [
      "a 3-letter country",
      { defaultShippingAddress: { ...address, country: "USA" } },
    ],
    [
      "a 21-character postal code",
      { defaultShippingAddress: { ...address, postalCode: "1".repeat(21) } },
    ],
    [
      "a 31-character phone",
      { defaultShippingAddress: { ...address, phone: "1".repeat(31) } },
    ],
    ["an empty line1", { defaultShippingAddress: { ...address, line1: "" } }],
    [
      "an extra address key",
      { defaultShippingAddress: { ...address, notes: "ring twice" } },
    ],
    [
      "a missing address key",
      {
        defaultShippingAddress: Object.fromEntries(
          Object.entries(address).filter(([k]) => k !== "line2"),
        ),
      },
    ],
    ["an address that is a string", { defaultShippingAddress: "12 Harbour" }],
  ];
  for (const [what, overrides] of bad) {
    it(`denies ${what}`, async () => {
      const { db, uid } = newCustomer();
      const data = Object.fromEntries(
        Object.entries(profile(overrides)).filter(([, v]) => v !== undefined),
      );
      await assertFails(setDoc(doc(db, COLLECTIONS.users, uid), data));
    });
  }
});

describe("users/{uid}: update validation", () => {
  it("keeps createdAt: changing it is denied", async () => {
    const db = firestoreOf(rules.as("owner"));
    await assertFails(
      updateDoc(doc(db, COLLECTIONS.users, OWNER_UID), {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("requires updatedAt == request.time", async () => {
    const db = firestoreOf(rules.as("owner"));
    await assertFails(
      updateDoc(doc(db, COLLECTIONS.users, OWNER_UID), { displayName: "A" }),
    );
  });

  it("cannot add an admin field by update", async () => {
    const db = firestoreOf(rules.as("owner"));
    await assertFails(
      updateDoc(doc(db, COLLECTIONS.users, OWNER_UID), {
        admin: true,
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it("can clear the address", async () => {
    const db = firestoreOf(rules.as("owner"));
    await assertSucceeds(
      updateDoc(doc(db, COLLECTIONS.users, OWNER_UID), {
        defaultShippingAddress: null,
        updatedAt: serverTimestamp(),
      }),
    );
  });
});
