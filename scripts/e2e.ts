// npm run test:e2e runs this under `firebase emulators:exec`, through scripts/emulators-exec.ts
// (M1.20b). One build, then two Playwright passes: everything except @perf in parallel, then the
// @perf budgets alone on one worker, so CPU-bound budgets never share the machine with other
// tests. Both passes always run; the exit code is non-zero if the build or either pass fails.
// Extra arguments go to both passes: file filters (tests/e2e/x.spec.ts, x.spec.ts:42) and
// --project=<name> are supported; flags that would undo the split (--grep, --workers, ...) are
// refused. Node only (no shell), so it behaves the same on Windows.
// Before the build (M1.8): the env comes from .env.local, else .env.example (so the build bakes
// the NEXT_PUBLIC_* values, as the Playwright webServer's `next start` does), and the emulators
// are seeded (npm run seed), so pages that read the catalog prerender real data.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const require = createRequire(import.meta.url);
const playwrightCli = require.resolve("@playwright/test/cli");
const nextCli = require.resolve("next/dist/bin/next");
const tsxCli = require.resolve("tsx/cli");

// Variables already set (emulators:exec's *_EMULATOR_HOST) win; Next loads .env.local itself.
if (!existsSync(join(root, ".env.local"))) {
  process.loadEnvFile(join(root, ".env.example"));
}

function run(
  label: string,
  args: string[],
  env: Record<string, string>,
): number {
  // args[0] is the CLI script's full path; log the rest.
  console.log(`\n[e2e] ${label}: ${args.slice(1).join(" ")}\n`);
  const result = spawnSync(process.execPath, args, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.error) console.error(`[e2e] ${label}: ${result.error.message}`);
  // A signal (status null) counts as a failure.
  return result.status ?? 1;
}

const extra = process.argv.slice(2);
// Set per pass below: a user --grep would replace "--grep @perf", --workers would make the
// serial pass parallel, and --output would put both passes in one folder (emptied by the second).
const reserved = [
  "--grep",
  "-g",
  "--grep-invert",
  "--workers",
  "-j",
  "--output",
];
const refused = extra.filter((arg) =>
  reserved.some(
    (flag) =>
      arg === flag ||
      arg.startsWith(`${flag}=`) ||
      // Short flags with the value attached: -g@smoke, -j4.
      (flag.length === 2 && arg.startsWith(flag)),
  ),
);
if (refused.length > 0) {
  console.error(
    `[e2e] refused: ${refused.join(" ")}. scripts/e2e.ts sets --grep, --grep-invert, ` +
      "--workers and --output per pass. Supported: file filters (tests/e2e/x.spec.ts, " +
      "x.spec.ts:42) and --project=<name>. For any other selection, run " +
      "`npx playwright test ...` under emulators:exec by hand.",
  );
  process.exit(1);
}
// A filtered run may leave one pass empty; the full run must find tests in both.
const empty = extra.length > 0 ? ["--pass-with-no-tests"] : [];

// The emulators start empty (emulators:exec, no import): seed them before the build.
const seeded = run(
  "seed (npm run seed)",
  [tsxCli, "--conditions=react-server", join(root, "scripts/seed/index.ts")],
  {},
);
if (seeded !== 0) process.exit(seeded);
// The same build the webServer would make (`npm run build`, prebuild included): production, with
// the dev pages (app/dev/gate.ts), from an empty data cache (scripts/clear-data-cache.mjs).
const cleared = run(
  "clear data cache (.next/cache/fetch-cache)",
  [join(root, "scripts/clear-data-cache.mjs")],
  {},
);
if (cleared !== 0) process.exit(cleared);
const build = run("build", [nextCli, "build"], { ENABLE_DEV_PAGES: "true" });
if (build !== 0) process.exit(build);

// E2E_PREBUILT: the webServer only starts the server (playwright.config.ts).
const parallel = run(
  "parallel pass",
  [playwrightCli, "test", "--grep-invert", "@perf", ...empty, ...extra],
  { E2E_PREBUILT: "1" },
);
// Own output and report folders inside the first pass's: Playwright empties the folders it
// writes to, so the first pass's screenshots (test-results/screenshots) and report survive.
const perf = run(
  "@perf pass (serial)",
  [
    playwrightCli,
    "test",
    "--grep",
    "@perf",
    "--workers=1",
    "--output=test-results/perf",
    ...empty,
    ...extra,
  ],
  {
    E2E_PREBUILT: "1",
    PLAYWRIGHT_HTML_OUTPUT_DIR: join(root, "playwright-report", "perf"),
  },
);

console.log(
  `\n[e2e] parallel pass ${parallel === 0 ? "passed" : `FAILED (${parallel})`}, ` +
    `@perf pass ${perf === 0 ? "passed" : `FAILED (${perf})`}`,
);
process.exit(parallel !== 0 ? parallel : perf);
