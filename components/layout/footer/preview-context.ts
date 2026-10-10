"use client";

import { createContext } from "react";

/**
 * Preview state for /dev/footer (footer.md §3.6), written by the page's controls
 * and read by the footer's client leaves. The default is null: on every public
 * route (and /dev/footer/minimal) there is no provider, and each leaf uses its
 * real source.
 */
export type FooterPreview = {
  /** Stands in for usePathname(); null = no current page. */
  currentPath: string | null;
  setCurrentPath: (path: string | null) => void;
  /** Shows the dashed outline of the reserved newsletter slot. */
  showSlot: boolean;
  setShowSlot: (show: boolean) => void;
};

export const FooterPreviewContext = createContext<FooterPreview | null>(null);
