import type { Metadata, Viewport } from "next";

import { WordmarkSprite } from "@/components/brand/Wordmark";
import { SkipLink } from "@/components/layout/SkipLink";

import { cormorant, cormorantItalic, jost } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Starflames",
};

// layout-shell.md §6.4: edge to edge on notched phones (the shell pads every edge
// with the safe-area insets); the browser chrome matches bg-page. Never
// maximumScale or userScalable: zoom must always work.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f24",
  colorScheme: "dark",
};

// Every route under this layout, /dev included, gets the skip link, so every
// layout or page below renders exactly one <main id="main" tabIndex={-1}>.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // No head script and no suppressHydrationWarning: nothing changes <html>
    // before hydration (the hero entrance is CSS only, motion.md §5.1). M8.8b's
    // data-motion head script will need suppressHydrationWarning back.
    <html
      lang="en"
      className={`${jost.variable} ${cormorant.variable} ${cormorantItalic.variable}`}
    >
      <body>
        <SkipLink />
        <WordmarkSprite />
        {children}
      </body>
    </html>
  );
}
