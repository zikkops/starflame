/**
 * The hero's calls to action (design/pages/home.md §3.7, §3.8, §11.1). Both are
 * in-page anchors, so a CTA is rendered only when the section it jumps to is on
 * the page: there is never a dead fragment link.
 *
 * - both sections: "Shop favorites" (primary) → #bestsellers, then the text link
 *   "Explore collections" → #collections;
 * - no bestsellers section: "Explore collections" becomes the primary CTA and the
 *   text link is not rendered;
 * - no collections section: the primary CTA only;
 * - neither (M2.2, before M2.3/M2.4 add the sections): no CTAs at all.
 *
 * Plain data and a pure function with no imports (unit-tested in Node).
 */

export type HeroAction = {
  kind: "primary" | "link";
  label: string;
  href: `#${string}`;
};

/** Which home sections are rendered on the page (home.md §4.6, §5.1). */
export type HomeSections = {
  collections: boolean;
  bestsellers: boolean;
};

export const SHOP_FAVORITES = "Shop favorites";
export const EXPLORE_COLLECTIONS = "Explore collections";

export function heroActions(sections: HomeSections): HeroAction[] {
  const actions: HeroAction[] = [];
  if (sections.bestsellers) {
    actions.push({
      kind: "primary",
      label: SHOP_FAVORITES,
      href: "#bestsellers",
    });
  }
  if (sections.collections) {
    actions.push({
      kind: sections.bestsellers ? "link" : "primary",
      label: EXPLORE_COLLECTIONS,
      href: "#collections",
    });
  }
  return actions;
}
