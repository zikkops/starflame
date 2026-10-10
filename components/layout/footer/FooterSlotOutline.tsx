"use client";

import { useContext } from "react";

import { FooterPreviewContext } from "./preview-context";

/**
 * /dev/footer only (footer.md §2.4, §3.6): the reserved newsletter slot as an
 * empty dashed box at its M2.6 size budget (20rem, 12rem from md), then the
 * slot's starlight rule with 48px above and below. Hidden until the preview's
 * checkbox is ticked; the server HTML carries `hidden` (the default). Never on
 * public routes: the dev page passes it to SiteFooter, so public pages don't
 * load it.
 */
export function FooterSlotOutline() {
  const preview = useContext(FooterPreviewContext);
  return (
    <div data-footer-slot="" data-print="hide" hidden={!preview?.showSlot}>
      <div className="flex min-h-80 items-center justify-center border border-dashed border-border-divider p-6 text-center md:min-h-48">
        <p className="type-caption text-text-muted">
          Reserved for the newsletter signup (M2.6, M2.7)
        </p>
      </div>
      <div
        aria-hidden="true"
        data-decorative=""
        className="my-12 h-px bg-(image:--gradient-starlight-rule)"
      />
    </div>
  );
}
