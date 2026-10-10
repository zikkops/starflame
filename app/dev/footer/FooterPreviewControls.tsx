"use client";

import { useContext } from "react";

import { FooterPreviewContext } from "@/components/layout/footer/preview-context";

const FIELD =
  "flex max-w-full min-w-0 flex-col items-start gap-2 type-body-sm text-text-secondary";
const SELECT =
  "min-h-(--size-touch) max-w-full rounded-md border border-border-control bg-bg-raised px-3 type-body text-text-primary";

/**
 * The two /dev/footer controls (footer.md §3.6, §9.1); they write the preview
 * context. The page passes the options (the footer's targets), so the catalog
 * fixture stays on the server.
 */
export function FooterPreviewControls({
  pages,
}: {
  pages: readonly { label: string; value: string }[];
}) {
  const preview = useContext(FooterPreviewContext);
  if (!preview) return null;
  return (
    <div className="flex flex-wrap items-end gap-6">
      <label className={FIELD}>
        Current page
        <select
          className={SELECT}
          value={preview.currentPath ?? ""}
          onChange={(event) =>
            preview.setCurrentPath(event.target.value || null)
          }
        >
          {pages.map((page) => (
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
          checked={preview.showSlot}
          onChange={(event) => preview.setShowSlot(event.target.checked)}
        />
        Show the reserved newsletter space
      </label>
    </div>
  );
}
