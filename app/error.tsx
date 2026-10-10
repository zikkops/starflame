"use client";

import { ErrorContent } from "@/components/layout/ErrorContent";

// The shell itself failed (header or footer), so neither is rendered; the main
// keeps the skip link working (layout-shell.md §10).
export default function RootError({ retry }: { retry: () => void }) {
  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative z-(--z-content) flex-[1_0_auto]"
    >
      <ErrorContent retry={retry} />
    </main>
  );
}
