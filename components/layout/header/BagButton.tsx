"use client";

import Link from "next/link";
import {
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { BagIcon } from "@/components/icons/glyphs";

import { HeaderPreviewContext } from "./preview-context";
import { ICON_BUTTON, ICON_GLYPH } from "./styles";

const NUMBER = new Intl.NumberFormat("en");
const ANNOUNCE_DELAY = 500; // ms without a further change (header.md §6.2)

const subscribe = () => () => {};
/** False in the server render and the hydration pass, true after. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

function bagName(label: string, count: number): string {
  if (count === 0) return `${label}, empty`;
  return `${label}, ${NUMBER.format(count)} ${count === 1 ? "item" : "items"}`;
}

function announcement(count: number): string {
  if (count === 0) return "Your bag is empty";
  return `Your bag has ${NUMBER.format(count)} ${count === 1 ? "item" : "items"}`;
}

type BagButtonProps = {
  href: string;
  /** The registry label, "Bag": the name until the count is known. */
  label: string;
  preview?: boolean;
};

/**
 * The bag link, its gold count badge and a polite live region (header.md §6).
 * The server render and the hydration pass show "Bag" and no badge; the count is
 * read after hydration (M1.15: only from the /dev/header preview; M5.4 connects
 * the cart store). The first read is never announced; later changes are, once
 * they have settled for 500ms.
 */
export function BagButton({ href, label, preview = false }: BagButtonProps) {
  const previewState = useContext(HeaderPreviewContext);
  const hydrated = useHydrated();
  const count = hydrated && previewState ? previewState.bagCount : null;

  const [status, setStatus] = useState("");
  const lastRead = useRef<number | null>(null);
  useEffect(() => {
    if (count === null || count === lastRead.current) return;
    const first = lastRead.current === null;
    lastRead.current = count;
    if (first) return;
    const timer = setTimeout(
      () => setStatus(announcement(count)),
      ANNOUNCE_DELAY,
    );
    return () => clearTimeout(timer);
  }, [count]);

  const props = {
    href,
    className: ICON_BUTTON,
    "aria-label": count === null ? label : bagName(label, count),
  };
  const content = (
    <>
      <BagIcon className={ICON_GLYPH} />
      {count !== null && count > 0 && (
        <span
          aria-hidden="true"
          className="absolute end-0.5 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-pill border border-transparent bg-badge-count px-1.5 type-caption font-medium text-text-inverse tabular-nums"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </>
  );
  return (
    <>
      {preview ? (
        <a {...props}>{content}</a>
      ) : (
        <Link {...props}>{content}</Link>
      )}
      <span role="status" data-print="hide" className="sr-only">
        {status}
      </span>
    </>
  );
}
