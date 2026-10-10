import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import { pathToFileURL } from "node:url";

/**
 * The seed CLI's guards (`npm run test:seed`, emulators:exec): each run is refused before it
 * writes anything. A file of its own, with no seeding hook, so the guards report on a fresh
 * clone too (where seed.test.ts's hook stops at the missing assets/images; M1.8 QA minor).
 */

if (!process.env.FIREBASE_EMULATOR_HUB) {
  throw new Error(
    "Run the seed tests with `npm run test:seed` (firebase emulators:exec).",
  );
}
// The seed CLI's env source when there is no .env.local; never overrides emulators:exec's hosts.
process.loadEnvFile(".env.example");

const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");

describe("seed CLI: emulators only", () => {
  const cli = (env: Record<string, string>, args: string[] = []) =>
    spawnSync(
      process.execPath,
      [tsxCli, "--conditions=react-server", "scripts/seed/index.ts", ...args],
      { env: { ...process.env, ...env }, encoding: "utf8" },
    );

  it("refuses a missing emulator host", () => {
    const r = cli({ FIRESTORE_EMULATOR_HOST: "" });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /missing: FIRESTORE_EMULATOR_HOST/);
  });

  it("refuses an emulator host that isn't loopback, before any DNS lookup", () => {
    // tests/seed/forbid-dns.mjs reports (and fails) every DNS lookup in the process.
    const forbidDns = {
      NODE_OPTIONS: `--import=${pathToFileURL(resolve("tests/seed/forbid-dns.mjs")).href}`,
    };
    const control = spawnSync(
      process.execPath,
      ["-e", "require('node:dns').lookup('localhost', () => {})"],
      { env: { ...process.env, ...forbidDns }, encoding: "utf8" },
    );
    assert.match(control.stderr, /\[forbid-dns\] lookup localhost/);

    const r = cli({
      ...forbidDns,
      FIRESTORE_EMULATOR_HOST: "firestore.googleapis.com:443",
    });
    assert.equal(r.status, 1);
    assert.match(
      r.stderr,
      /Firestore emulator host "firestore\.googleapis\.com:443" is not a loopback address/,
    );
    assert.doesNotMatch(r.stderr, /forbid-dns/);
  });

  it("refuses a non-demo project, even with FIREBASE_ALLOW_NON_DEMO_PROJECT=true", () => {
    const r = cli({
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "real-project",
      FIREBASE_ALLOW_NON_DEMO_PROJECT: "true",
    });
    assert.equal(r.status, 1);
    assert.match(
      r.stderr,
      /emulators only; refusing non-demo project "real-project"/,
    );
  });

  // A successful CLI run clears the repo's Next cache (a running `next dev` included), so it is
  // left to scripts/e2e.ts, which runs `npm run seed`'s command before every e2e build.
  it("refuses an unknown argument", () => {
    const r = cli({}, ["--rest"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /unknown argument --rest/);
  });
});
