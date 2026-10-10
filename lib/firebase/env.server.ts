import "server-only";

import {
  FirebaseEnvError,
  isDemoProjectId,
  parseHostPort,
  requireValue,
  type HostPort,
} from "./env.public";

export type ServerFirebaseEnv =
  | {
      mode: "emulator";
      projectId: string;
      storageBucket: string;
      emulators: { firestore: HostPort; auth: HostPort; storage: HostPort };
    }
  | {
      /** Unlocked by FIREBASE_ALLOW_NON_DEMO_PROJECT=true. Credentials are not wired yet. */
      mode: "production";
      projectId: string;
    };

type RawServerEnv = Partial<Record<string, string>>;

const EMULATOR_VARS = [
  "FIRESTORE_EMULATOR_HOST",
  "FIREBASE_AUTH_EMULATOR_HOST",
  "FIREBASE_STORAGE_EMULATOR_HOST",
] as const;

/**
 * Server-only Firebase env. `firebase-admin` itself reads the *_EMULATOR_HOST variables
 * from process.env; this function only validates them, so a missing or partial emulator
 * config fails loudly instead of silently sending traffic to Google.
 */
export function readServerFirebaseEnv(
  raw: RawServerEnv = process.env,
): ServerFirebaseEnv {
  const projectId = requireValue(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    raw.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );

  if (!isDemoProjectId(projectId)) {
    if (raw.FIREBASE_ALLOW_NON_DEMO_PROJECT !== "true") {
      throw new FirebaseEnvError(
        `Refusing to initialise firebase-admin for non-demo project "${projectId}". ` +
          `Use a "demo-*" project ID, or set FIREBASE_ALLOW_NON_DEMO_PROJECT=true once the user has approved production.`,
      );
    }
    return { mode: "production", projectId };
  }

  const missing = EMULATOR_VARS.filter((name) => !raw[name]?.trim());
  if (missing.length > 0) {
    throw new FirebaseEnvError(
      `Demo project "${projectId}" needs every Admin emulator host; missing: ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and start the emulators with \`npm run emulators\`.`,
    );
  }

  return {
    mode: "emulator",
    projectId,
    storageBucket: `${projectId}.appspot.com`,
    emulators: {
      firestore: parseHostPort(
        "FIRESTORE_EMULATOR_HOST",
        raw.FIRESTORE_EMULATOR_HOST,
      ),
      auth: parseHostPort(
        "FIREBASE_AUTH_EMULATOR_HOST",
        raw.FIREBASE_AUTH_EMULATOR_HOST,
      ),
      storage: parseHostPort(
        "FIREBASE_STORAGE_EMULATOR_HOST",
        raw.FIREBASE_STORAGE_EMULATOR_HOST,
      ),
    },
  };
}
