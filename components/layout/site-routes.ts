/**
 * The one route registry for the header and the footer (footer.md §3.2,
 * header.md §3.2). A link is rendered only when its route is built: flip `live`
 * in the task that builds the route, and the link appears in both places with no
 * other change. Row order is the display order in every placement.
 *
 * Plain data and pure functions with no imports, so Server Components, client
 * islands and Node (Playwright specs) can all import it.
 */

export type FooterGroup = "explore" | "help" | "legal";
export type HeaderPlacement = "primary" | "more" | "account" | "bag";

export type RouteEntry = {
  key: string;
  /** Visible text (footer, drawer); the header's icon buttons use it as their accessible name. */
  label: string;
  href: string;
  /** The task that builds the route; null = no task yet. */
  milestone: string | null;
  /** True once the route is built. */
  live: boolean;
  footer?: FooterGroup;
  header?: HeaderPlacement;
};

// One row per route, as in the footer.md §3.2.1 table.
// prettier-ignore
export const SITE_ROUTES: readonly RouteEntry[] = [
  { key: "shop", label: "Shop", href: "/shop", milestone: "M3.5", live: true, footer: "explore", header: "primary" },
  { key: "collections", label: "Collections", href: "/collections", milestone: "M3.7", live: false, footer: "explore", header: "primary" },
  { key: "gift-sets", label: "Gift sets", href: "/collections/gift-sets", milestone: "M3.7", live: false, footer: "explore", header: "primary" },
  { key: "our-story", label: "About", href: "/our-story", milestone: "M8.2", live: true, footer: "explore", header: "primary" },
  { key: "search", label: "Search", href: "/search", milestone: null, live: false, footer: "explore", header: "more" },
  { key: "faq", label: "FAQ", href: "/faq", milestone: "M8.2", live: false, footer: "help", header: "more" },
  { key: "contact", label: "Contact", href: "/contact", milestone: "M8.2", live: true, footer: "help", header: "primary" },
  { key: "shipping-returns", label: "Shipping & returns", href: "/shipping-and-returns", milestone: "M6.0b", live: false, footer: "help" },
  { key: "account", label: "Your account", href: "/account", milestone: "M5.7", live: false, footer: "help", header: "account" },
  { key: "sign-in", label: "Sign in", href: "/sign-in", milestone: "M5.2", live: false, footer: "help", header: "account" },
  { key: "bag", label: "Bag", href: "/bag", milestone: "M5.4", live: true, header: "bag" },
  { key: "privacy", label: "Privacy policy", href: "/privacy", milestone: "M2.5b", live: false, footer: "legal" },
  { key: "terms", label: "Terms & conditions", href: "/terms", milestone: "M6.0b", live: false, footer: "legal" },
];

/** Feature flags that are not routes (footer.md §3.2.2). */
export const features = {
  "collection-pages": { milestone: "M3.7", live: false }, // "Our collections" from getCollections()
  newsletter: { milestone: "M2.7", live: false }, // the footer teaser slot
} as const;

export type RegistryOptions = {
  /** Dev preview pages only: treat every entry as live. */
  preview?: boolean;
};

const isLive = (entry: RouteEntry, options: RegistryOptions): boolean =>
  options.preview === true || entry.live;

const byKey = (key: string): RouteEntry | undefined =>
  SITE_ROUTES.find((entry) => entry.key === key);

const placed = (
  placement: HeaderPlacement,
  options: RegistryOptions,
): RouteEntry[] =>
  SITE_ROUTES.filter(
    (entry) => entry.header === placement && isLive(entry, options),
  );

/** Shop, Collections, Gift sets, Our story: whichever are live, in that order. */
export function headerPrimary(options: RegistryOptions = {}): RouteEntry[] {
  return placed("primary", options);
}

/** Search, FAQ, Contact us (the drawer's More nav). */
export function headerMore(options: RegistryOptions = {}): RouteEntry[] {
  return placed("more", options);
}

/** "Your account" when signed in, "Sign in" when not; null if that route isn't live. */
export function headerAccount(
  signedIn: boolean,
  options: RegistryOptions = {},
): RouteEntry | null {
  const entry = byKey(signedIn ? "account" : "sign-in");
  return entry && isLive(entry, options) ? entry : null;
}

export function headerBag(options: RegistryOptions = {}): RouteEntry | null {
  const entry = byKey("bag");
  return entry && isLive(entry, options) ? entry : null;
}

/** The footer's account slot candidates, in order of preference. */
const ACCOUNT_SLOT: readonly string[] = ["account", "sign-in"];

/**
 * The footer's account slot over any entries array: `account` if live, else
 * `sign-in` if live, else null; never both (footer.md §3.2.1). Pure, so the rule
 * is tested in Node over made-up arrays (tests/e2e/site-routes.spec.ts).
 */
export function footerAccountSlot(
  entries: readonly RouteEntry[],
  options: RegistryOptions = {},
): RouteEntry | null {
  for (const key of ACCOUNT_SLOT) {
    const entry = entries.find((candidate) => candidate.key === key);
    if (entry?.footer === "help" && isLive(entry, options)) return entry;
  }
  return null;
}

/**
 * The live entries of one footer group of an entries array, in row order. Help
 * ends with the account slot (footerAccountSlot); the slot's two entries never
 * appear anywhere else.
 */
export function footerEntries(
  entries: readonly RouteEntry[],
  group: FooterGroup,
  options: RegistryOptions = {},
): RouteEntry[] {
  const rows = entries.filter(
    (entry) =>
      entry.footer === group &&
      !ACCOUNT_SLOT.includes(entry.key) &&
      isLive(entry, options),
  );
  if (group === "help") {
    const slot = footerAccountSlot(entries, options);
    if (slot) rows.push(slot);
  }
  return rows;
}

/** The live entries of one footer group of the registry, in row order. */
export function footerGroup(
  group: FooterGroup,
  options: RegistryOptions = {},
): RouteEntry[] {
  return footerEntries(SITE_ROUTES, group, options);
}

/**
 * The most specific href that matches the path: the path itself, or a parent
 * of it (`/collections/moonlit-terrace` matches `/collections`). Only one link
 * of a set is current at a time (header.md §7.1).
 */
export function currentHref(
  pathname: string | null,
  hrefs: readonly string[],
): string | null {
  if (!pathname) return null;
  let best: string | null = null;
  for (const href of hrefs) {
    const matches = pathname === href || pathname.startsWith(`${href}/`);
    if (matches && (best === null || href.length > best.length)) best = href;
  }
  return best;
}
