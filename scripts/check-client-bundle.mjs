// Fails if the client bundle (.next/static) contains server-only Firebase code or the name of
// any server-only env var. Run after `npm run build`: `npm run check:client-bundle`.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const STATIC_DIR = ".next/static";
if (!existsSync(STATIC_DIR)) {
  console.error(`${STATIC_DIR} not found. Run \`npm run build\` first.`);
  process.exit(1);
}

// Server-only packages that must never reach the browser.
const PACKAGE_MARKERS = [
  "firebase-admin",
  "google-auth-library",
  "@google-cloud/",
  "gcp-metadata",
];

// Strings that only the server-only repositories contain (lib/firebase/repositories): their log
// prefix and their cache key. A client chunk holding one has bundled repository code (M1.6).
const CODE_MARKERS = ["[repositories]", "starflames-catalog"];

// Every non-NEXT_PUBLIC_ variable named in .env.example (new ones are covered automatically).
const serverEnvNames = readFileSync(".env.example", "utf8")
  .split(/\r?\n/)
  .map((line) => /^\s*#?\s*([A-Z][A-Z0-9_]*)=/.exec(line)?.[1])
  .filter((name) => name !== undefined && !name.startsWith("NEXT_PUBLIC_"));
// Match the bare name only, not as the tail of a NEXT_PUBLIC_ name.
const envPattern = new RegExp(
  `(?<![A-Z0-9_])(${serverEnvNames.join("|")})(?![A-Z0-9_])`,
);

const files = readdirSync(STATIC_DIR, { recursive: true, withFileTypes: true })
  .filter(
    (entry) => entry.isFile() && /\.(js|mjs|css|map|json)$/.test(entry.name),
  )
  .map((entry) => join(entry.parentPath, entry.name));

const problems = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const marker of [...PACKAGE_MARKERS, ...CODE_MARKERS]) {
    if (text.includes(marker)) problems.push(`${file}: contains "${marker}"`);
  }
  const envHit = envPattern.exec(text);
  if (envHit) problems.push(`${file}: contains server env name "${envHit[1]}"`);
}

if (problems.length > 0) {
  console.error(`Client bundle check FAILED:\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(
  `Client bundle check passed: ${files.length} files, no server packages or repository code, ` +
    `no server env names (${serverEnvNames.join(", ")}).`,
);
