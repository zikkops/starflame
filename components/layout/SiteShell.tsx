import type { StarfieldPreview } from "@/components/starfield/starfield-data";

import { HeaderScrollState } from "./header/HeaderScrollState";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { StarfieldSlot } from "./StarfieldSlot";

/**
 * The customer-facing page frame (layout-shell.md §2). A fragment, so the
 * header and footer are direct children of <body> (banner, contentinfo) and
 * <body> is the flex column. <main> is the only one on the page and the skip
 * link's target; it is positioned at --z-content so the starfield (positioned,
 * z 0) never paints over its text. Overlays never render inside it (§2.1). Its
 * first child is the header's scroll sentinel (out of flow, hidden).
 * `starfieldPreview` is passed only by the /dev/starfield pages.
 */
export function SiteShell({
  starfieldPreview,
  children,
}: {
  starfieldPreview?: StarfieldPreview;
  children: React.ReactNode;
}) {
  return (
    <>
      <StarfieldSlot preview={starfieldPreview} />
      <SiteHeader />
      <main
        id="main"
        tabIndex={-1}
        className="relative z-(--z-content) flex-[1_0_auto]"
      >
        <HeaderScrollState />
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
