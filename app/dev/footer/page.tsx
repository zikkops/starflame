import type { Metadata } from "next";

import { SiteFooter } from "@/components/layout/SiteFooter";

import { requireDevPages } from "../gate";

import { FooterPreviewControls } from "./FooterPreviewControls";
import { FooterPreviewIntro } from "./FooterPreviewIntro";
import { FooterPreviewProvider } from "./FooterPreviewProvider";
import { FOOTER_PREVIEW, PREVIEW_PAGES } from "./preview-data";

// Dev-only footer preview, full state (footer.md §3.6, ../gate.ts): every footer
// item as if its page existed. Static: every preview state is client-side.
export function generateMetadata(): Metadata {
  requireDevPages();
  return { title: "Footer preview · Starflames" };
}

export default function FooterPreviewPage() {
  requireDevPages();
  return (
    <FooterPreviewProvider>
      <main
        id="main"
        tabIndex={-1}
        className="relative z-(--z-content) flex-[1_0_auto]"
      >
        <div className="page-container py-(--section-y)">
          <FooterPreviewIntro current="/dev/footer" />
          <FooterPreviewControls pages={PREVIEW_PAGES} />
        </div>
      </main>
      <SiteFooter preview={FOOTER_PREVIEW} />
    </FooterPreviewProvider>
  );
}
