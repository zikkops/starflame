"use client";

import { useContext } from "react";

import { HeaderPreviewContext } from "@/components/layout/header/preview-context";
import { SITE_ROUTES } from "@/components/layout/site-routes";

const BAG_COUNTS = [0, 1, 3, 99, 120];

const href = (key: string): string =>
  SITE_ROUTES.find((entry) => entry.key === key)?.href ?? "";

// Dev-only copy (header.md §11.3). The values are the registry's hrefs.
const PAGES = [
  { label: "None", value: "" },
  { label: "Shop", value: href("shop") },
  { label: "Collections", value: href("collections") },
  { label: "Gift sets", value: href("gift-sets") },
  { label: "Our story", value: href("our-story") },
  { label: "Search", value: href("search") },
  { label: "FAQ", value: href("faq") },
  { label: "Contact us", value: href("contact") },
  {
    label: "A collection page (/collections/moonlit-terrace)",
    value: "/collections/moonlit-terrace",
  },
];

const FIELD =
  "flex max-w-full min-w-0 flex-col items-start gap-2 type-body-sm text-text-secondary";
const SELECT =
  "min-h-(--size-touch) max-w-full rounded-md border border-border-control bg-bg-raised px-3 type-body text-text-primary";

/** The three /dev/header controls; they write the preview context. */
export function HeaderPreviewControls() {
  const preview = useContext(HeaderPreviewContext);
  if (!preview) return null;
  return (
    <div className="flex flex-wrap items-end gap-6">
      <label className={FIELD}>
        Items in the bag
        <select
          className={SELECT}
          value={preview.bagCount}
          onChange={(event) => preview.setBagCount(Number(event.target.value))}
        >
          {BAG_COUNTS.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </label>
      <label className={FIELD}>
        Current page
        <select
          className={SELECT}
          value={preview.currentPath ?? ""}
          onChange={(event) =>
            preview.setCurrentPath(event.target.value || null)
          }
        >
          {PAGES.map((page) => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </select>
      </label>
      <label className="inline-flex min-h-(--size-touch) items-center gap-3 type-body text-text-primary">
        <input
          type="checkbox"
          className="size-5 accent-gold-400"
          checked={preview.signedIn}
          onChange={(event) => preview.setSignedIn(event.target.checked)}
        />
        Signed in
      </label>
    </div>
  );
}
