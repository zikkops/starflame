import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";

import { requireDevPages } from "../../gate";
import { FooterPreviewIntro } from "../FooterPreviewIntro";

// Dev-only footer preview, the shipped M1.17 state (footer.md §3.6): exactly the
// public footer, with no provider and no controls. Static.
export function generateMetadata(): Metadata {
  requireDevPages();
  return { title: "Footer preview (minimal) · Starflames" };
}

export default function FooterMinimalPreviewPage() {
  requireDevPages();
  return (
    <>
      <main
        id="main"
        tabIndex={-1}
        className="relative z-(--z-content) flex-[1_0_auto]"
      >
        <div className="page-container py-(--section-y)">
          <FooterPreviewIntro current="/dev/footer/minimal" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
