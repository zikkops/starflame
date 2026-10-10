"use client";

import { useMemo, useState } from "react";

import {
  type FooterPreview,
  FooterPreviewContext,
} from "@/components/layout/footer/preview-context";

/**
 * Holds the /dev/footer preview state (footer.md §3.6) and renders only the
 * context provider, no element, so <main> and <footer> stay direct children of
 * <body>. It wraps both: the controls in main write the state, the footer's
 * leaves (its links and the slot outline) read it.
 */
export function FooterPreviewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [showSlot, setShowSlot] = useState(false);
  const value = useMemo<FooterPreview>(
    () => ({ currentPath, setCurrentPath, showSlot, setShowSlot }),
    [currentPath, showSlot],
  );
  return <FooterPreviewContext value={value}>{children}</FooterPreviewContext>;
}
