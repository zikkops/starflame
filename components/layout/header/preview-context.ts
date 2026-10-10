"use client";

import { createContext } from "react";

/**
 * Preview state for /dev/header (header.md §3.4), written by the page's controls
 * and read by the header's client islands. The default is null: on every public
 * route there is no provider, and each island uses its real source.
 */
export type HeaderPreview = {
  bagCount: number;
  setBagCount: (count: number) => void;
  /** Stands in for usePathname(); null = no current page. */
  currentPath: string | null;
  setCurrentPath: (path: string | null) => void;
  signedIn: boolean;
  setSignedIn: (signedIn: boolean) => void;
};

export const HeaderPreviewContext = createContext<HeaderPreview | null>(null);
