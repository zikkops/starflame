"use client";

import { useMemo, useState } from "react";

import {
  type HeaderPreview,
  HeaderPreviewContext,
} from "@/components/layout/header/preview-context";

/**
 * Holds the /dev/header preview state (header.md §3.4) and renders only the
 * context provider, no element, so <header> and <main> stay direct children of
 * <body>. It wraps both: the controls in main write the state, the header's
 * islands read it.
 */
export function HeaderPreviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [bagCount, setBagCount] = useState(0);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const value = useMemo<HeaderPreview>(
    () => ({
      bagCount,
      setBagCount,
      currentPath,
      setCurrentPath,
      signedIn,
      setSignedIn,
    }),
    [bagCount, currentPath, signedIn],
  );
  return <HeaderPreviewContext value={value}>{children}</HeaderPreviewContext>;
}
