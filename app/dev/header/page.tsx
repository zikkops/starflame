import type { Metadata } from "next";

import { HeaderScrollState } from "@/components/layout/header/HeaderScrollState";
import { SiteHeader } from "@/components/layout/SiteHeader";

import { requireDevPages } from "../gate";

import { HeaderPreviewControls } from "./HeaderPreviewControls";
import { HeaderPreviewProvider } from "./HeaderPreviewProvider";

// Dev-only header preview (header.md §3.4, ../gate.ts): the full header, every
// item as if its page existed. Static: every preview state is client-side.
export function generateMetadata(): Metadata {
  requireDevPages();
  return { title: "Header preview · Starflames" };
}

export default function HeaderPreviewPage() {
  requireDevPages();
  return (
    <HeaderPreviewProvider>
      <SiteHeader preview />
      <main
        id="main"
        tabIndex={-1}
        className="relative z-(--z-content) flex-[1_0_auto]"
      >
        <HeaderScrollState />
        <div className="page-container py-(--section-y)">
          <h1 className="mb-4 type-h1">Header preview</h1>
          <p className="mb-10 max-w-measure-intro type-body text-text-secondary">
            Every header item is shown here as if its page existed. Links to
            pages that aren&apos;t built yet go nowhere.
          </p>
          <HeaderPreviewControls />
          <h2 className="mt-16 type-h2">Scroll to see the header change</h2>
          {/* Plain scroll room for the scrolled state (2,000px, no content). */}
          <div aria-hidden="true" className="h-[2000px]" />
        </div>
      </main>
    </HeaderPreviewProvider>
  );
}
