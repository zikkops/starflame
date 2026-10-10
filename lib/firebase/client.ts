import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from "firebase/firestore";
import {
  connectFunctionsEmulator,
  getFunctions,
  type Functions,
} from "firebase/functions";
import {
  connectStorageEmulator,
  getStorage,
  type FirebaseStorage,
} from "firebase/storage";

import { readPublicFirebaseEnv } from "./env.public";

/**
 * Browser-only Firebase client SDK. Importing this file has no side effects; each service is
 * created and connected to its emulator on the first getter call (in an effect or event
 * handler, never during render on the server).
 */

/** The emulators accept any API key; a demo project has no real one. Not a secret. */
const DEMO_API_KEY = "demo-api-key";

/** Must match the Functions region in /functions (default us-central1). */
const FUNCTIONS_REGION = "us-central1";

type ClientCache = {
  auth?: Auth;
  firestore?: Firestore;
  storage?: FirebaseStorage;
  functions?: Functions;
};

// Kept on globalThis so dev HMR, which re-evaluates this module but keeps the Firebase SDK
// instances alive, never calls connect*Emulator twice on the same instance (that throws).
const globalForFirebase = globalThis as typeof globalThis & {
  __starflamesFirebaseClient?: ClientCache;
};

function cache(): ClientCache {
  return (globalForFirebase.__starflamesFirebaseClient ??= {});
}

function assertBrowser(): void {
  if (typeof window === "undefined") {
    throw new Error(
      "lib/firebase/client is browser-only. Use the server repositories (Admin SDK) on the server.",
    );
  }
}

export function getClientApp(): FirebaseApp {
  assertBrowser();
  if (getApps().length > 0) return getApp();
  const env = readPublicFirebaseEnv();
  return initializeApp({
    apiKey: DEMO_API_KEY,
    projectId: env.projectId,
    authDomain: env.authDomain,
    storageBucket: env.storageBucket,
  });
}

export function getClientAuth(): Auth {
  const c = cache();
  if (!c.auth) {
    const auth = getAuth(getClientApp());
    const { host, port } = readPublicFirebaseEnv().emulators.auth;
    // disableWarnings: hides the emulator banner, which would overlay the layout in screenshots.
    connectAuthEmulator(auth, `http://${host}:${port}`, {
      disableWarnings: true,
    });
    c.auth = auth;
  }
  return c.auth;
}

export function getClientFirestore(): Firestore {
  const c = cache();
  if (!c.firestore) {
    const firestore = getFirestore(getClientApp());
    const { host, port } = readPublicFirebaseEnv().emulators.firestore;
    connectFirestoreEmulator(firestore, host, port);
    c.firestore = firestore;
  }
  return c.firestore;
}

export function getClientStorage(): FirebaseStorage {
  const c = cache();
  if (!c.storage) {
    const storage = getStorage(getClientApp());
    const { host, port } = readPublicFirebaseEnv().emulators.storage;
    connectStorageEmulator(storage, host, port);
    c.storage = storage;
  }
  return c.storage;
}

export function getClientFunctions(): Functions {
  const c = cache();
  if (!c.functions) {
    const functions = getFunctions(getClientApp(), FUNCTIONS_REGION);
    const { host, port } = readPublicFirebaseEnv().emulators.functions;
    connectFunctionsEmulator(functions, host, port);
    c.functions = functions;
  }
  return c.functions;
}
