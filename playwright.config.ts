import { existsSync } from "node:fs";
import { join } from "node:path";

import { defineConfig, devices } from "@playwright/test";

// Dedicated e2e port: not 3000/3001/3002 (other dev servers) and not 6100-6119 (emulators).
const PORT = 6130;
const BASE_URL = `http://127.0.0.1:${PORT}`;

// Same env source as the smoke script: .env.local if present (Next loads it itself),
// else .env.example. Variables already set (e.g. by emulators:exec) win.
// Paths are resolved from this file, so the cwd does not matter. (Playwright loads
// the config as CommonJS, so import.meta.dirname is not available here.)
const fromHere = (file: string): string => join(__dirname, file);
if (!existsSync(fromHere(".env.local"))) {
  process.loadEnvFile(fromHere(".env.example"));
}

// iPhone 14 metrics (390x664, DPR 3, touch, mobile, iPhone Safari UA) on Chromium.
const mobile = { ...devices["iPhone 14"], browserName: "chromium" as const };
const desktop = {
  ...devices["Desktop Chrome"],
  viewport: { width: 1440, height: 900 },
};

export default defineConfig({
  testDir: "tests/e2e",
  outputDir: "test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // "never": the default opens a report server on failure and blocks emulators:exec.
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    locale: "en-US",
    timezoneId: "UTC",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "mobile-390", use: mobile },
    { name: "desktop-1440", use: desktop },
    // Reduced-motion variants run only tests tagged @motion.
    {
      name: "mobile-390-reduced-motion",
      grep: /@motion/,
      use: { ...mobile, reducedMotion: "reduce" },
    },
    {
      name: "desktop-1440-reduced-motion",
      grep: /@motion/,
      use: { ...desktop, reducedMotion: "reduce" },
    },
  ],
  webServer: {
    // Production build, bound to loopback on the dedicated port. E2E_PREBUILT=1: the
    // caller has just built (npm run test:e2e builds once for both passes, scripts/e2e.ts).
    command: `${process.env.E2E_PREBUILT === "1" ? "" : "npm run build && "}npm run start -- --hostname 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    // Builds the dev-only pages (/dev/tokens) when this command builds (app/dev/gate.ts);
    // with E2E_PREBUILT=1 it only starts the server, and scripts/e2e.ts sets it for its build.
    env: { ENABLE_DEV_PAGES: "true" },
    // Never attach to a server we did not start; a busy port fails the run instead.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
