"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";

import { FourPointStarIcon } from "@/components/icons/glyphs";
import { FooterPreviewContext } from "@/components/layout/footer/preview-context";
import { currentHref } from "@/components/layout/site-routes";

import { HeaderPreviewContext } from "./preview-context";

/**
 * bar: the Primary nav in the bar (lg+). drawer: the drawer's Primary links.
 * more: the drawer's More links. footer: the footer's group links. legal: the
 * footer's Legal links. The footer variants read FooterPreviewContext, the
 * others HeaderPreviewContext.
 */
export type NavLinkVariant = "bar" | "drawer" | "more" | "footer" | "legal";

// Which preview context a variant reads on the dev pages.
const PREVIEW_CONTEXT = {
  bar: "header",
  drawer: "header",
  more: "header",
  footer: "footer",
  legal: "footer",
} as const;

// header.md §4.2, §7.2: no underline at rest; hover 1px currentColor; current
// 2px gold-300. The hover rule only adds the line, so current + hover keeps 2px gold.
const BAR =
  "inline-flex min-h-(--size-touch) items-center px-3 type-nav whitespace-nowrap text-text-secondary decoration-current decoration-1 underline-offset-[0.4em] transition-colors hover:text-text-primary hover:underline aria-[current=page]:text-text-primary aria-[current=page]:underline aria-[current=page]:decoration-link aria-[current=page]:decoration-2";

// header.md §5.6, §7.3: the current link gains the star; forced colors add an underline.
const DRAWER =
  "flex min-h-14 w-full items-center gap-3 type-h3 text-text-primary transition-colors hover:text-link forced-colors:aria-[current=page]:underline";
const MORE =
  "flex min-h-(--size-touch) w-full items-center gap-3 type-nav text-text-secondary transition-colors hover:text-link aria-[current=page]:text-text-primary forced-colors:aria-[current=page]:underline";

// footer.md §4.5, §5.1: the bar's states on a 44px row that starts on the column
// edge (no padding) and may wrap; group links in type-nav, legal links in body-sm.
const FOOTER_STATES =
  "inline-flex min-h-(--size-touch) min-w-(--size-touch) items-center text-text-secondary decoration-current decoration-1 underline-offset-[0.4em] transition-colors hover:text-text-primary hover:underline aria-[current=page]:text-text-primary aria-[current=page]:underline aria-[current=page]:decoration-link aria-[current=page]:decoration-2";
const FOOTER = `${FOOTER_STATES} type-nav`;
const LEGAL = `${FOOTER_STATES} type-body-sm`;

const CLASS = {
  bar: BAR,
  drawer: DRAWER,
  more: MORE,
  footer: FOOTER,
  legal: LEGAL,
} as const;

/** Variants whose label is plain text (no current-page star). */
const PLAIN = new Set<NavLinkVariant>(["bar", "footer", "legal"]);

type NavLinkProps = {
  href: string;
  label: string;
  variant: NavLinkVariant;
  /** Every href of the link set this one belongs to: only the most specific match is current. */
  peers: readonly string[];
  /** /dev/header, /dev/footer: a plain anchor (nothing prefetched) and the preview's current path. */
  preview?: boolean;
};

export function NavLink({
  href,
  label,
  variant,
  peers,
  preview = false,
}: NavLinkProps) {
  const pathname = usePathname();
  // Both contexts are read on every render (hooks can't be conditional); the
  // variant picks one. Each is null without its provider.
  const headerPreview = useContext(HeaderPreviewContext);
  const footerPreview = useContext(FooterPreviewContext);
  const previewState =
    PREVIEW_CONTEXT[variant] === "footer" ? footerPreview : headerPreview;
  const path = preview ? (previewState?.currentPath ?? null) : pathname;
  const current = currentHref(path, peers) === href;
  const props = {
    href,
    className: CLASS[variant],
    "aria-current": current ? ("page" as const) : undefined,
  };
  const content = PLAIN.has(variant) ? (
    label
  ) : (
    <>
      {current && <FourPointStarIcon className="size-3 shrink-0 text-link" />}
      <span>{label}</span>
    </>
  );
  return preview ? (
    <a {...props}>{content}</a>
  ) : (
    <Link {...props}>{content}</Link>
  );
}
