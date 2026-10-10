// The site's web fonts (typography.md §9.1). Imported by app/layout.tsx and
// app/global-error.tsx (its own document), which put the three `.variable`
// classes on <html>; globals.css maps them to
// --font-body / --font-display / --font-display-italic. Pinyon Script is not
// loaded: the wordmark is an SVG (components/brand/Wordmark.tsx).
// No `fallback` option: in Next 16.4 (Turbopack) passing one drops the generated
// metric-adjusted "<Family> Fallback" face. The system stacks from typography.md §2
// are appended in globals.css instead (--font-body, --font-display).
import { Cormorant_Garamond, Jost } from "next/font/google";

// Body and UI. One variable woff2 (wght 100-900) serves 400/500/600. Preloaded.
export const jost = Jost({
  weight: ["400", "500", "600"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-jost",
});

// Display headings, roman. One variable woff2 (wght 300-700) serves 500/600. Preloaded.
export const cormorant = Cormorant_Garamond({
  weight: ["500", "600"],
  style: "normal",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-cormorant",
});

// Italic accent words in display headings (>= 28px). A separate call so that it is
// not preloaded: `preload` applies to every file of one call.
export const cormorantItalic = Cormorant_Garamond({
  weight: "500",
  style: "italic",
  subsets: ["latin"],
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  variable: "--font-cormorant-italic",
});
