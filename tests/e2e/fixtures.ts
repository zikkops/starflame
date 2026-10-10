import { test as base, expect } from "@playwright/test";

// Not a bug, so never recorded: net::ERR_ABORTED, the browser cancelling a
// request itself (Next aborts prefetch and RSC fetches when a navigation
// supersedes them).
const IGNORED_FAILURE = /net::ERR_ABORTED/;

/**
 * Every test fails if the page logs a console error, throws an uncaught error,
 * or has a failed request or an HTTP status >= 400 (same origin or not).
 * Links on a tested page must point only to routes that are built: Next
 * prefetches each link, and an unbuilt route's 404 fails the test (M1.15 header).
 *
 * Opting out, for a test that provokes an error on purpose:
 * - `test.use({ expectedIssues: [/\/missing\b/] })` drops each issue that
 *   matches one of the patterns (no `g` flag). Match the URL: a 404 gives both
 *   an "HTTP 404: <url>" line and a "Failed to load resource … [<url>]" line;
 * - or clear the list mid-test with `pageIssues.length = 0`.
 */
export const test = base.extend<{
  expectedIssues: RegExp[];
  pageIssues: string[];
}>({
  expectedIssues: [[], { option: true }],
  pageIssues: [
    // The second parameter is not named `use`: the React Hooks lint rule would flag it.
    async ({ page, expectedIssues }, provide) => {
      const issues: string[] = [];
      page.on("console", (message) => {
        // For "Failed to load resource" the URL is only in the location.
        const source = message.location().url;
        if (message.type() === "error") {
          const where = source ? ` [${source}]` : "";
          issues.push(`console error: ${message.text()}${where}`);
        }
      });
      page.on("pageerror", (error) => {
        issues.push(`page error: ${error.message}`);
      });
      page.on("requestfailed", (request) => {
        const reason = request.failure()?.errorText ?? "unknown";
        if (!IGNORED_FAILURE.test(reason)) {
          issues.push(`request failed: ${request.url()} (${reason})`);
        }
      });
      page.on("response", (response) => {
        const status = response.status();
        if (status >= 400) {
          issues.push(`HTTP ${status}: ${response.url()}`);
        }
      });
      await provide(issues);
      const unexpected = issues.filter(
        (issue) => !expectedIssues.some((pattern) => pattern.test(issue)),
      );
      expect(unexpected, "console errors and failed requests").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
