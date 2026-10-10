/**
 * Dev-only smoke test for lib/firebase/admin against the running emulators.
 * Run `npm run emulators` in one terminal, then `npm run smoke:firebase` in another.
 * Loads .env.local if present, else .env.example (variables already set in the shell win).
 */
import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { connect } from "node:net";

import {
  getAdminAuth,
  getAdminFirestore,
  getAdminStorage,
} from "../lib/firebase/admin";
import {
  FirebaseEnvError,
  readPublicFirebaseEnv,
  type HostPort,
} from "../lib/firebase/env.public";
import { readServerFirebaseEnv } from "../lib/firebase/env.server";

const envFile = existsSync(".env.local") ? ".env.local" : ".env.example";
process.loadEnvFile(envFile);

function step(name: string): void {
  console.log(`ok - ${name}`);
}

/** Fails fast; otherwise the SDKs keep retrying against a closed port. */
function assertReachable(
  name: string,
  { host, port }: HostPort,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port, timeout: 2000 });
    const fail = (): void => {
      socket.destroy();
      reject(
        new Error(
          `${name} emulator is not reachable on ${host}:${port}. Start it with \`npm run emulators\`.`,
        ),
      );
    };
    socket.once("connect", () => {
      socket.end();
      resolve();
    });
    socket.once("timeout", fail);
    socket.once("error", fail);
  });
}

function checkGuards(): void {
  const hosts = {
    FIRESTORE_EMULATOR_HOST: "127.0.0.1:6104",
    FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:6106",
    FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:6107",
  };
  assert.throws(
    () =>
      readServerFirebaseEnv({
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "real-project",
        ...hosts,
      }),
    FirebaseEnvError,
  );
  assert.equal(
    readServerFirebaseEnv({
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "real-project",
      FIREBASE_ALLOW_NON_DEMO_PROJECT: "true",
    }).mode,
    "production",
  );
  assert.throws(
    () =>
      readServerFirebaseEnv({
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-starflames",
        FIRESTORE_EMULATOR_HOST: hosts.FIRESTORE_EMULATOR_HOST,
      }),
    /missing: FIREBASE_AUTH_EMULATOR_HOST, FIREBASE_STORAGE_EMULATOR_HOST/,
  );
  assert.throws(
    () =>
      readServerFirebaseEnv({
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-starflames",
        ...hosts,
        FIRESTORE_EMULATOR_HOST: "http://127.0.0.1:6104",
      }),
    /without a protocol/,
  );

  const publicEnv = {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-starflames",
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
    NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: "127.0.0.1:6104",
    NEXT_PUBLIC_AUTH_EMULATOR_HOST: "127.0.0.1:6106",
    NEXT_PUBLIC_STORAGE_EMULATOR_HOST: "127.0.0.1:6107",
    NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST: "127.0.0.1:6103",
  };
  assert.equal(readPublicFirebaseEnv(publicEnv).emulators.functions.port, 6103);
  assert.throws(
    () =>
      readPublicFirebaseEnv({
        ...publicEnv,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "real-project",
      }),
    FirebaseEnvError,
  );
  assert.throws(
    () =>
      readPublicFirebaseEnv({
        ...publicEnv,
        NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "false",
      }),
    /only exists in the emulators/,
  );
  step(
    "env guards: non-demo refused, partial or malformed emulator hosts refused",
  );
}

/** Runs one cleanup step. A failure is logged, not thrown, so it can't mask the original error. */
async function cleanup(
  name: string,
  run: () => Promise<unknown>,
): Promise<void> {
  try {
    await run();
  } catch (error: unknown) {
    console.error(
      `not ok - cleanup ${name}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

async function main(): Promise<void> {
  console.log(`# env file: ${envFile}`);
  checkGuards();

  const env = readServerFirebaseEnv();
  assert.equal(env.mode, "emulator");
  await assertReachable("Firestore", env.emulators.firestore);
  await assertReachable("Auth", env.emulators.auth);
  await assertReachable("Storage", env.emulators.storage);
  step(`emulator mode for ${env.projectId}, emulators reachable`);

  const nonce = randomUUID();
  const docRef = getAdminFirestore().collection("_smoke").doc(nonce);
  const file = getAdminStorage().bucket().file(`_smoke/${nonce}.txt`);
  const email = `smoke-${nonce}@example.test`;
  let uid: string | undefined;

  try {
    await docRef.set({ nonce, at: Date.now() });
    assert.equal((await docRef.get()).get("nonce"), nonce);
    step("Firestore write + read");

    uid = (await getAdminAuth().createUser({ email, password: `pw-${nonce}` }))
      .uid;
    assert.equal((await getAdminAuth().getUserByEmail(email)).uid, uid);
    step("Auth create user + lookup");

    await file.save(nonce, { contentType: "text/plain" });
    const [contents] = await file.download();
    assert.equal(contents.toString("utf8"), nonce);
    step("Storage upload + download");
  } finally {
    // Each step logs its own failure, so a cleanup error never hides the original one.
    await cleanup("Firestore doc", () => docRef.delete());
    const createdUid = uid; // a const keeps the narrowing inside the closure
    if (createdUid) {
      await cleanup("Auth user", () => getAdminAuth().deleteUser(createdUid));
    }
    await cleanup("Storage file", () => file.delete({ ignoreNotFound: true }));
  }

  assert.equal((await docRef.get()).exists, false);
  await assert.rejects(getAdminAuth().getUserByEmail(email), {
    code: "auth/user-not-found",
  });
  assert.equal((await file.exists())[0], false);
  step("cleanup verified");
}

// Explicit exit: firebase-admin keeps gRPC handles open after the last call.
main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error("not ok -", error instanceof Error ? error.message : error);
    process.exit(1);
  },
);
