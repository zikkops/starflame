"use client";

import { ErrorContent } from "@/components/layout/ErrorContent";

// An error inside a page: header and footer stay; this replaces the page inside
// <main> and supplies its h1 (layout-shell.md §10).
export default function SiteError({ retry }: { retry: () => void }) {
  return <ErrorContent retry={retry} />;
}
