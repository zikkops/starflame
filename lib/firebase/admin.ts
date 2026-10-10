import "server-only";

import { getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

import { readServerFirebaseEnv } from "./env.server";

/** Named app, so it never collides with a default app created by other tooling. */
const ADMIN_APP_NAME = "starflames-admin";

/**
 * Lazy singleton. firebase-admin keeps its app registry in its own module scope, and Next
 * loads firebase-admin as an external Node package (it is on Next's built-in
 * serverExternalPackages list), so the registry survives dev HMR of our modules.
 * Looking the app up by name first makes re-evaluation of this file harmless.
 */
export function getAdminApp(): App {
  const existing = getApps().find((app) => app.name === ADMIN_APP_NAME);
  if (existing) return existing;

  const env = readServerFirebaseEnv();
  if (env.mode === "production") {
    // Planned shape (production-setup task, after user approval):
    //   initializeApp({ projectId: env.projectId, credential: applicationDefault(), storageBucket }, ADMIN_APP_NAME)
    // No service-account keys: ADC comes from the hosting runtime.
    throw new Error(
      `firebase-admin production credentials are not implemented yet (project "${env.projectId}").`,
    );
  }

  // Emulator mode: no credential. firebase-admin routes Firestore, Auth and Storage to the
  // hosts in FIRESTORE_EMULATOR_HOST / FIREBASE_AUTH_EMULATOR_HOST / FIREBASE_STORAGE_EMULATOR_HOST.
  return initializeApp(
    { projectId: env.projectId, storageBucket: env.storageBucket },
    ADMIN_APP_NAME,
  );
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(getAdminApp());
}
