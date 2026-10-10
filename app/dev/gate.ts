import "server-only";

import { notFound } from "next/navigation";

/**
 * Dev-only pages 404 in a production build unless it was built with
 * ENABLE_DEV_PAGES=true (only the e2e harness sets it: scripts/e2e.ts for the
 * npm run test:e2e build, the Playwright webServer when it builds itself). The
 * pages are static, so this runs once, at build time. Call it at the top of
 * every dev page and its generateMetadata: Next renders a layout and its page
 * in parallel, so a layout-only check would still put the page's content into
 * the 404 response.
 */
export function requireDevPages(): void {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEV_PAGES !== "true"
  ) {
    notFound();
  }
}
