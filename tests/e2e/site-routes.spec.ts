import { expect, test } from "@playwright/test";

import {
  footerAccountSlot,
  footerEntries,
  footerGroup,
  type RouteEntry,
  SITE_ROUTES,
} from "../../components/layout/site-routes";

// The footer's account slot (footer.md §3.2.1), checked in Node: no page and no
// browser, so this file imports @playwright/test, not ./fixtures (whose auto
// fixture opens a page). Each case is a copy of the registry with only the
// named keys live.

const withLive = (...keys: string[]): RouteEntry[] =>
  SITE_ROUTES.map((entry) => ({ ...entry, live: keys.includes(entry.key) }));

/** The Help group's keys for that copy. */
const help = (entries: readonly RouteEntry[]): string[] =>
  footerEntries(entries, "help").map((entry) => entry.key);

test("the footer's account slot: account wins, never both", () => {
  test.skip(
    test.info().project.name !== "mobile-390",
    "Node only: runs once, in mobile-390",
  );

  // Account live: "Your account", last in Help.
  const account = withLive("faq", "account");
  expect(footerAccountSlot(account)?.key).toBe("account");
  expect(help(account)).toEqual(["faq", "account"]);

  // Only sign-in live: "Sign in".
  const signIn = withLive("faq", "sign-in");
  expect(footerAccountSlot(signIn)?.key).toBe("sign-in");
  expect(help(signIn)).toEqual(["faq", "sign-in"]);

  // Neither live: no slot.
  const neither = withLive("faq");
  expect(footerAccountSlot(neither)).toBeNull();
  expect(help(neither)).toEqual(["faq"]);

  // Both flagged live: account wins, sign-in is not shown.
  const both = withLive("faq", "account", "sign-in");
  expect(footerAccountSlot(both)?.key).toBe("account");
  expect(help(both)).toEqual(["faq", "account"]);

  // The registry goes through the same rule: the preview treats every entry as
  // live, so Help ends with account and never shows sign-in.
  const preview = footerGroup("help", { preview: true }).map(
    (entry) => entry.key,
  );
  expect(preview.at(-1)).toBe("account");
  expect(preview).not.toContain("sign-in");
});
