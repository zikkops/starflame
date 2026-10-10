/**
 * Public (browser-safe) Firebase env. Reads NEXT_PUBLIC_* only.
 * Each variable is referenced literally so Next can inline it into client bundles;
 * a dynamic `process.env[name]` lookup would not be inlined.
 */

export class FirebaseEnvError extends Error {
  override name = "FirebaseEnvError";
}

export type HostPort = { host: string; port: number };

export type PublicFirebaseEnv = {
  projectId: string;
  storageBucket: string;
  authDomain: string;
  /** Always set for now: demo projects only exist in the emulators. */
  emulators: {
    firestore: HostPort;
    auth: HostPort;
    storage: HostPort;
    functions: HostPort;
  };
};

export type RawPublicFirebaseEnv = {
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: string | undefined;
  NEXT_PUBLIC_USE_FIREBASE_EMULATORS: string | undefined;
  NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST: string | undefined;
  NEXT_PUBLIC_AUTH_EMULATOR_HOST: string | undefined;
  NEXT_PUBLIC_STORAGE_EMULATOR_HOST: string | undefined;
  NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST: string | undefined;
};

const HINT =
  "Copy .env.example to .env.local (see design/tech/M1.3-sdk-init.md).";

/** "demo-" project IDs exist only in the Emulator Suite and can never reach production. */
export function isDemoProjectId(projectId: string): boolean {
  return projectId.startsWith("demo-");
}

export function requireValue(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new FirebaseEnvError(`${name} is not set. ${HINT}`);
  }
  return trimmed;
}

/** Parses "host:port" (no protocol), e.g. "127.0.0.1:6104". */
export function parseHostPort(
  name: string,
  value: string | undefined,
): HostPort {
  const raw = requireValue(name, value);
  const match = /^([A-Za-z0-9.-]+):(\d{1,5})$/.exec(raw);
  const port = match ? Number(match[2]) : NaN;
  if (!match || !match[1] || port < 1 || port > 65535) {
    throw new FirebaseEnvError(
      `${name} must be "host:port" without a protocol (e.g. 127.0.0.1:6104), got "${raw}".`,
    );
  }
  return { host: match[1], port };
}

export function readPublicFirebaseEnv(
  raw: RawPublicFirebaseEnv = {
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS:
      process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
    NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST:
      process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST,
    NEXT_PUBLIC_AUTH_EMULATOR_HOST: process.env.NEXT_PUBLIC_AUTH_EMULATOR_HOST,
    NEXT_PUBLIC_STORAGE_EMULATOR_HOST:
      process.env.NEXT_PUBLIC_STORAGE_EMULATOR_HOST,
    NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST:
      process.env.NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST,
  },
): PublicFirebaseEnv {
  const projectId = requireValue(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    raw.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  );
  const useEmulators = requireValue(
    "NEXT_PUBLIC_USE_FIREBASE_EMULATORS",
    raw.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
  );
  if (useEmulators !== "true" && useEmulators !== "false") {
    throw new FirebaseEnvError(
      `NEXT_PUBLIC_USE_FIREBASE_EMULATORS must be "true" or "false", got "${useEmulators}".`,
    );
  }
  if (!isDemoProjectId(projectId)) {
    // Production web config (apiKey, appId, real bucket) lands with the production-setup task.
    throw new FirebaseEnvError(
      `NEXT_PUBLIC_FIREBASE_PROJECT_ID is "${projectId}". Only "demo-*" projects are supported until the user approves a real project.`,
    );
  }
  if (useEmulators !== "true") {
    throw new FirebaseEnvError(
      `Project "${projectId}" is a demo project, which only exists in the emulators. Set NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true.`,
    );
  }
  return {
    projectId,
    storageBucket: `${projectId}.appspot.com`,
    authDomain: `${projectId}.firebaseapp.com`,
    emulators: {
      firestore: parseHostPort(
        "NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST",
        raw.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST,
      ),
      auth: parseHostPort(
        "NEXT_PUBLIC_AUTH_EMULATOR_HOST",
        raw.NEXT_PUBLIC_AUTH_EMULATOR_HOST,
      ),
      storage: parseHostPort(
        "NEXT_PUBLIC_STORAGE_EMULATOR_HOST",
        raw.NEXT_PUBLIC_STORAGE_EMULATOR_HOST,
      ),
      functions: parseHostPort(
        "NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST",
        raw.NEXT_PUBLIC_FUNCTIONS_EMULATOR_HOST,
      ),
    },
  };
}
