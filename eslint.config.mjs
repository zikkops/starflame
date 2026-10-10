import { builtinModules } from "node:module";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

// Every Node builtin, bare and node:-prefixed (fs, node:fs, fs/promises, ...). Prefix-only
// modules (node:test, node:sqlite, node:sea) are listed with the prefix only, as Node has them.
const nodeBuiltins = builtinModules.flatMap((name) =>
  name.startsWith("node:") ? [name] : [name, `node:${name}`],
);

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // Only /lib/firebase talks to Firebase (CLAUDE.md: UI never calls Firestore).
    // UI and other lib code use the repositories (M1.6) and narrow client hooks instead.
    files: ["app/**", "components/**", "lib/**"],
    ignores: ["lib/firebase/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex:
                "^(firebase|firebase-admin)(/.*)?$|^@firebase/|^@google-cloud/",
              message:
                "Only lib/firebase may import Firebase SDKs. Use a repository or client hook from @/lib/firebase.",
            },
            {
              regex: "(^|/)firebase/(admin|client|env\\.(server|public))$",
              message:
                "SDK init modules are internal to lib/firebase. Use a repository or client hook instead.",
            },
            {
              regex: "(^|/)firebase/repositories/catalog-reads$",
              message:
                "The uncached reads are for tests and scripts. Use the cached repositories in @/lib/firebase/repositories/catalog.",
            },
          ],
        },
      ],
      // no-restricted-imports sees only static imports. Also catch a dynamic import() and an
      // import("...") type of a Firebase SDK (same specifiers as the first pattern above).
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportExpression[source.value=/^(firebase|firebase-admin)(\\/|$)|^@firebase\\/|^@google-cloud\\//]",
          message:
            "Only lib/firebase may import Firebase SDKs, dynamically too. Use a repository or client hook from @/lib/firebase.",
        },
        {
          selector:
            "TSImportType[argument.literal.value=/^(firebase|firebase-admin)(\\/|$)|^@firebase\\/|^@google-cloud\\//]",
          message:
            'Only lib/firebase may use import("...") types of Firebase SDKs. Use the domain types in @/lib/types.',
        },
      ],
    },
  },
  {
    // lib/types and lib/domain are pure (M1.4): usable in the browser, on the Next server, in the
    // seed and tests, and in Functions once M6.1 adds its build step. Flat config replaces, not
    // merges, rule options for these files, so repeat the SDK patterns. Web APIs that browsers
    // and Node share (globalThis.crypto.subtle, TextEncoder) are fine; Node builtins are not.
    files: ["lib/types/**", "lib/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: nodeBuiltins.map((name) => ({
            name,
            message:
              "lib/types and lib/domain must not import Node builtins; use Web APIs (globalThis.crypto.subtle).",
          })),
          patterns: [
            {
              regex:
                "^(firebase|firebase-admin)(/.*)?$|^@firebase/|^@google-cloud/",
              message: "lib/types and lib/domain must not import Firebase.",
            },
            {
              regex: "(^|/)lib/firebase(/|$)|^\\.\\./firebase(/|$)",
              message:
                "lib/types and lib/domain must not depend on lib/firebase; the converters depend on them.",
            },
            {
              regex: "^(server-only|client-only|next(/.*)?|react(/.*)?)$",
              message:
                "lib/types and lib/domain stay framework-free (browser, Next server, seed; Functions after M6.1).",
            },
          ],
        },
      ],
      // no-restricted-imports sees only static imports. A dynamic import() or an import("x")
      // type could still reach a banned module (require() is already an error through
      // @typescript-eslint/no-require-imports).
      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportExpression",
          message:
            "lib/types and lib/domain must not use dynamic import(); import statically from inside lib/types or lib/domain.",
        },
        {
          selector: "TSImportType",
          message:
            'lib/types and lib/domain must not use import("...") types; use a static `import type` from inside lib/types or lib/domain.',
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "coverage/**",
    "playwright-report/**",
    "test-results/**",
    "functions/lib/**",
  ]),
  // Must stay last: turns off ESLint rules that conflict with Prettier.
  prettier,
]);

export default eslintConfig;
