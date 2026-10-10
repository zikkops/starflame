import {
  initializeTestEnvironment,
  type RulesTestContext,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { setLogLevel, type Firestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";

/**
 * Shared set-up for the rules tests. `npm run test:rules` runs them under
 * `firebase emulators:exec --only firestore,storage`, which loads firestore.rules and
 * storage.rules from firebase.json and sets the emulator hosts; the library finds them
 * through the hub. Rules are not passed here, so the tests check what the emulator loaded.
 */
export const PROJECT_ID = "demo-starflames";

/** The four personas every collection is tested with. */
export type Persona = "anonymous" | "owner" | "other" | "admin";
export const PERSONAS: readonly Persona[] = [
  "anonymous",
  "owner",
  "other",
  "admin",
];
/** The owner persona's uid; "other" is a second customer, "admin" carries the claim. */
export const OWNER_UID = "alice";
export const OTHER_UID = "bob";
export const ADMIN_UID = "admin-1";

export type RulesEnv = {
  readonly env: RulesTestEnvironment;
  readonly as: (who: Persona) => RulesTestContext;
};

export async function setUpRulesEnv(): Promise<RulesEnv> {
  if (!process.env.FIREBASE_EMULATOR_HUB) {
    throw new Error(
      "Run the rules tests with `npm run test:rules` (firebase emulators:exec).",
    );
  }
  // Denied writes are the point of most tests; keep the SDK from logging each one.
  setLogLevel("error");
  const env = await initializeTestEnvironment({ projectId: PROJECT_ID });
  const contexts: Record<Persona, RulesTestContext> = {
    anonymous: env.unauthenticatedContext(),
    owner: env.authenticatedContext(OWNER_UID),
    other: env.authenticatedContext(OTHER_UID),
    admin: env.authenticatedContext(ADMIN_UID, { admin: true }),
  };
  return { env, as: (who) => contexts[who] };
}

/**
 * The library hands out compat instances. Each wraps a modular instance (`_delegate`), which
 * the modular functions (doc, setDoc, ref, uploadBytes...) unwrap with getModularInstance.
 * The casts only bridge the two type families; the runtime objects are the documented usage.
 */
export function firestoreOf(ctx: RulesTestContext): Firestore {
  return ctx.firestore() as unknown as Firestore;
}
export function storageOf(ctx: RulesTestContext): FirebaseStorage {
  return ctx.storage() as unknown as FirebaseStorage;
}

/**
 * Deletes every app the environment created. Call it in `after()`: it closes the client SDK's
 * streams, so the test process exits on its own (a forced exit with an open gRPC stream crashed
 * with 0xC0000409 in the M1.4 probe).
 */
export async function tearDown(rules: RulesEnv): Promise<void> {
  await rules.env.cleanup();
}
