import { statSync } from "node:fs";
import { join } from "node:path";

/**
 * The year of the build under test: `next build` writes .next/BUILD_ID at the
 * end of the build that prerendered the static pages (and their © year, footer.md
 * §2.6). Not the test's clock, so a run that crosses New Year's midnight doesn't
 * fail. Both years are read in this machine's local time zone.
 */
export function buildYear(): number {
  const file = join(__dirname, "..", "..", "..", ".next", "BUILD_ID");
  return statSync(file).mtime.getFullYear();
}
