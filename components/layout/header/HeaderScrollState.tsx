"use client";

import { useEffect, useRef } from "react";

/**
 * The header's at-rest / scrolled state (layout-shell.md §6.2, header.md §8.1):
 * `data-scrolled="true"` on the header once the page is scrolled past the top
 * 8px, from an IntersectionObserver on an 8px sentinel (no scroll listener).
 * Rendered as the first child of <main>, which starts right below the header, and
 * pulled up by the header's height to the top of the document, so the body keeps
 * its landmark order. Out of flow, empty and hidden: it never affects layout.
 */
export function HeaderScrollState() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const header = document.querySelector<HTMLElement>("body > header");
    if (!sentinel || !header) return;
    const set = (scrolled: boolean) => {
      if (scrolled) header.setAttribute("data-scrolled", "true");
      else header.removeAttribute("data-scrolled");
    };
    // One read on mount, so a restored scroll position is right at once.
    set(sentinel.getBoundingClientRect().bottom < 0);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) set(!entry.isIntersecting);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={sentinelRef}
      aria-hidden="true"
      data-scroll-sentinel=""
      className="pointer-events-none invisible absolute start-0 top-[calc(-1*(var(--header-h)+env(safe-area-inset-top,0px)))] h-2 w-px"
    />
  );
}
