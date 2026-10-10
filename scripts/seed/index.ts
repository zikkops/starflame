/**
 * `npm run seed [-- --reset]`: seeds the Firestore and Storage emulators with the catalog
 * (design/tech/M1.8-seed.md). Emulators only: a non-demo project, a missing emulator host
 * (lib/firebase/env.server.ts) or one that isn't loopback is refused, and so is
 * FIREBASE_ALLOW_NON_DEMO_PROJECT=true.
 * Dev: `npm run emulators` in one terminal, then `npm run seed` in another.
 * Loads .env.local if present, else .env.example (variables already set in the shell win).
 */
import { existsSync } from "node:fs";

import { formatSummary, runSeed } from "./seed";

const USAGE = "usage: npm run seed [-- --reset]";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const unknown = args.filter((a) => a !== "--reset");
  if (unknown.length > 0) {
    throw new Error(`unknown argument ${unknown.join(" ")}\n${USAGE}`);
  }
  const envFile = existsSync(".env.local") ? ".env.local" : ".env.example";
  process.loadEnvFile(envFile);
  console.log(`# env file: ${envFile}`);
  const summary = await runSeed({ reset: args.includes("--reset") });
  console.log(formatSummary(summary));
}

// Explicit exit: firebase-admin keeps gRPC handles open after the last call.
main().then(
  () => process.exit(0),
  (error: unknown) => {
    console.error(
      "seed failed -",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  },
);
