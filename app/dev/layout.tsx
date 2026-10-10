import type { Metadata } from "next";

import { requireDevPages } from "./gate";
import "./dev.css";

// Dev-only tools under /dev (see ./gate.ts). Never indexed.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DevLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  requireDevPages(); // a backstop; each page calls it too
  return children;
}
