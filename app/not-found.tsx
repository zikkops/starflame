import type { Metadata } from "next";

import {
  NOT_FOUND_TITLE,
  NotFoundContent,
} from "@/components/layout/NotFoundContent";
import { SiteShell } from "@/components/layout/SiteShell";

// Unmatched URLs and the /dev gate in production builds. Rendered inside the root
// layout only, so it brings the shell itself (layout-shell.md §10, §13.2).
export const metadata: Metadata = { title: NOT_FOUND_TITLE };

export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  );
}
