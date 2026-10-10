import assert from "node:assert/strict";
import { createHash } from "node:crypto";
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
} from "firebase/firestore";

import { emailHash } from "../../lib/domain/email";
import { COLLECTIONS } from "../../lib/firebase/paths";
import {
  firestoreOf,
  PERSONAS,
  setUpRulesEnv,
  tearDown,
  type RulesEnv,
} from "./support/env";

/** SHA-256 hex of the exact string, with no normalising (for deliberately bad inputs). */
const rawHash = (s: string): string =>
  createHash("sha256").update(s, "utf8").digest("hex");

function signup(email: string, overrides: Record<string, unknown> = {}) {
  return {
    email,
    source: "footer",
    consentVersion: "2026-10",
    createdAt: serverTimestamp(),
    ...overrides,
  };
}

let rules: RulesEnv;
let next = 0;
const freshEmail = (): string => `reader${++next}@example.com`;

const EXISTING = "existing@example.com";

before(async () => {
  rules = await setUpRulesEnv();
  await rules.env.clearFirestore();
  await rules.env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(
      doc(firestoreOf(ctx), COLLECTIONS.newsletterSignups, rawHash(EXISTING)),
      signup(EXISTING, { createdAt: Timestamp.now() }),
    );
  });
});

after(() => tearDown(rules));

describe("newsletterSignups: create-only, for anyone", () => {
  for (const who of PERSONAS) {
    it(`${who} can sign up with the hash from emailHash()`, async () => {
      const db = firestoreOf(rules.as(who));
      const email = freshEmail();
      await assertSucceeds(
        setDoc(
          doc(db, COLLECTIONS.newsletterSignups, await emailHash(email)),
          signup(email, { source: who === "owner" ? "home" : "footer" }),
        ),
      );
    });

    it(`${who} cannot sign up the same address twice (an update)`, async () => {
      const db = firestoreOf(rules.as(who));
      await assertFails(
        setDoc(
          doc(db, COLLECTIONS.newsletterSignups, rawHash(EXISTING)),
          signup(EXISTING),
        ),
      );
    });

    it(`${who} cannot get, list, update or delete signups`, async () => {
      const db = firestoreOf(rules.as(who));
      const ref = doc(db, COLLECTIONS.newsletterSignups, rawHash(EXISTING));
      await assertFails(getDoc(ref));
      await assertFails(getDocs(collection(db, COLLECTIONS.newsletterSignups)));
      await assertFails(updateDoc(ref, { source: "home" }));
      await assertFails(deleteDoc(ref));
    });
  }
});

describe("newsletterSignups: field validation", () => {
  it("accepts a non-ASCII address: Web Crypto and hashing.sha256 agree on UTF-8", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    const email = "zoë@example.com".normalize("NFC");
    await assertSucceeds(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, await emailHash(email)),
        signup(email),
      ),
    );
  });

  it("denies an ID that is not the email's hash", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    const email = freshEmail();
    await assertFails(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, rawHash("someone@example.com")),
        signup(email),
      ),
    );
    await assertFails(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, "random-id"),
        signup(email),
      ),
    );
  });

  it("denies an uppercase hex ID", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    const email = freshEmail();
    await assertFails(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, rawHash(email).toUpperCase()),
        signup(email),
      ),
    );
  });

  // Each bad email is hashed as sent, so only the email check itself can fail.
  const badEmails: [string, string][] = [
    ["an uppercase email", "Reader@Example.com"],
    ["an email with spaces around it", " reader@example.com "],
    ["an email without a dot in the domain", "reader@example"],
    ["an email with two @", "a@b@example.com"],
    ["an email with a space inside", "read er@example.com"],
    ["an email over 254 characters", `${"a".repeat(243)}@example.com`],
  ];
  for (const [what, email] of badEmails) {
    it(`denies ${what}`, async () => {
      const db = firestoreOf(rules.as("anonymous"));
      await assertFails(
        setDoc(
          doc(db, COLLECTIONS.newsletterSignups, rawHash(email)),
          signup(email),
        ),
      );
    });
  }

  it("allows an email of exactly 254 characters", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    const email = `${"a".repeat(242)}@example.com`;
    assert.equal(email.length, 254);
    await assertSucceeds(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, rawHash(email)),
        signup(email),
      ),
    );
  });

  const badFields: [string, Record<string, unknown>][] = [
    ["an unknown source", { source: "popup" }],
    ["an empty consentVersion", { consentVersion: "" }],
    ["a 41-character consentVersion", { consentVersion: "v".repeat(41) }],
    ["an extra field", { ip: "203.0.113.7" }],
    ["a missing createdAt", { createdAt: undefined }],
    ["a client createdAt", { createdAt: Timestamp.now() }],
  ];
  for (const [what, overrides] of badFields) {
    it(`denies ${what}`, async () => {
      const db = firestoreOf(rules.as("anonymous"));
      const email = freshEmail();
      const data = Object.fromEntries(
        Object.entries(signup(email, overrides)).filter(
          ([, v]) => v !== undefined,
        ),
      );
      await assertFails(
        setDoc(doc(db, COLLECTIONS.newsletterSignups, rawHash(email)), data),
      );
    });
  }
});

describe("newsletterSignups: accepted risk (M1.4 §1)", () => {
  it("NFC is not enforced: the NFD form of a signed-up address is stored as a second document", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    const nfc = "renée@example.com".normalize("NFC");
    const nfd = nfc.normalize("NFD");
    assert.notEqual(nfc, nfd);
    // Our client always sends NFC (emailHash() normalises). A raw-API caller can send NFD, which
    // passes trim/lowercase and hashes differently. The sender dedupes by NFC (M2.7 or later).
    await assertSucceeds(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, await emailHash(nfc)),
        signup(nfc),
      ),
    );
    await assertSucceeds(
      setDoc(doc(db, COLLECTIONS.newsletterSignups, rawHash(nfd)), signup(nfd)),
    );
    await rules.env.withSecurityRulesDisabled(async (ctx) => {
      const all = await getDocs(
        collection(firestoreOf(ctx), COLLECTIONS.newsletterSignups),
      );
      const stored = all.docs
        .map((d) => d.get("email") as string)
        .filter((e) => e.normalize("NFC") === nfc);
      assert.equal(stored.length, 2);
    });
  });

  it("through our client, NFD input is normalised first, so it is a duplicate (denied)", async () => {
    const db = firestoreOf(rules.as("anonymous"));
    const nfc = "chloé@example.com".normalize("NFC");
    const typed = nfc.normalize("NFD");
    await assertSucceeds(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, await emailHash(nfc)),
        signup(nfc),
      ),
    );
    // emailHash(typed) normalises to NFC, so it targets the existing NFC document: an update.
    assert.equal(await emailHash(typed), await emailHash(nfc));
    await assertFails(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, await emailHash(typed)),
        signup(nfc),
      ),
    );
  });

  it("the duplicate error is the same PERMISSION_DENIED as any other refusal", async () => {
    // The UI shows its success message for this error (M2.6/M2.7), so the form can't reveal
    // who is subscribed. The raw API can still tell (accepted, low-value leak).
    const db = firestoreOf(rules.as("anonymous"));
    const error = (await assertFails(
      setDoc(
        doc(db, COLLECTIONS.newsletterSignups, rawHash(EXISTING)),
        signup(EXISTING),
      ),
    )) as { code?: string };
    assert.equal(error.code, "permission-denied");
  });
});
