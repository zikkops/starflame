import type { Metadata } from "next";

import { HomeHero } from "@/components/home/HomeHero";

// design/pages/home.md §12: an absolute title (not templated) and the description.
// No og:image until M8.5/M8.6. Canonical "/" waits for the domain (M8.6).
const TITLE = "Starflames · Scented candles for starlit evenings";
const DESCRIPTION =
  "Scented candles, travel tins, wax melts and gift sets inspired by moonlit terraces, starry reading rooms, pine forests and still mountain lakes.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
};

/**
 * Home (home.md §2): a static Server Component. M2.2 ships the hero only; the
 * featured collections (M2.3), bestsellers (M2.4) and brand story (M2.5) follow
 * it. Until a section is on the page, the hero's CTA that jumps to it is not
 * rendered (§3.7), so in M2.2 the hero has no CTAs. The hero's entrance is CSS
 * only (globals.css), so "/" loads no motion JS in M2.2 (§9).
 */
export default function Home() {
  return <HomeHero sections={{ collections: false, bestsellers: false }} />;
}
