"use client";

import { ErrorContent } from "@/components/layout/ErrorContent";

import { cormorant, cormorantItalic, jost } from "./fonts";
import "./globals.css";

// The root layout failed: this replaces it with its own document, styles and
// font variables (layout-shell.md §10). No header, so no skip link. A Client
// Component can't export metadata, so the title is a React <title> (hoisted to
// <head>; the root layout's title isn't on this document).
export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html
      lang="en"
      className={`${jost.variable} ${cormorant.variable} ${cormorantItalic.variable}`}
    >
      <body>
        <title>Something went wrong · Starflames</title>
        <main
          id="main"
          tabIndex={-1}
          className="relative z-(--z-content) flex-[1_0_auto]"
        >
          <ErrorContent retry={retry} variant="global" />
        </main>
      </body>
    </html>
  );
}
