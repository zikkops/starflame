"use client";

import Link from "next/link";
import { useContext } from "react";

import { AccountIcon } from "@/components/icons/glyphs";
import { headerAccount } from "@/components/layout/site-routes";

import { HeaderPreviewContext } from "./preview-context";
import { ICON_BUTTON, ICON_GLYPH } from "./styles";

type AccountLinkProps = {
  /** bar: the icon button (lg+). drawer: the text link with the glyph. */
  variant: "bar" | "drawer";
  preview?: boolean;
};

/**
 * "Sign in" or "Your account" (header.md §3.2, §5.6). On /dev/header the
 * "Signed in" control picks the entry; on public routes the visitor counts as
 * signed out until M5.2 provides the session.
 */
export function AccountLink({ variant, preview = false }: AccountLinkProps) {
  const previewState = useContext(HeaderPreviewContext);
  const signedIn = preview ? (previewState?.signedIn ?? false) : false;
  const entry = headerAccount(signedIn, { preview });
  if (!entry) return null;

  if (variant === "bar") {
    const props = {
      href: entry.href,
      "aria-label": entry.label,
      className: `${ICON_BUTTON} max-lg:hidden`,
    };
    const glyph = <AccountIcon className={ICON_GLYPH} />;
    return preview ? (
      <a {...props}>{glyph}</a>
    ) : (
      <Link {...props}>{glyph}</Link>
    );
  }

  const props = {
    href: entry.href,
    className:
      "inline-flex min-h-(--size-touch) items-center gap-2 type-nav text-text-primary transition-colors hover:text-link",
  };
  const content = (
    <>
      <AccountIcon className="size-5 shrink-0" />
      {entry.label}
    </>
  );
  return preview ? (
    <a {...props}>{content}</a>
  ) : (
    <Link {...props}>{content}</Link>
  );
}
