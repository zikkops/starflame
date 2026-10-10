import type { Metadata } from "next";

import { HomeHero } from "@/components/home/HomeHero";
import { HomeHover } from "@/components/home/HomeHover";
import { HomeNewsletter } from "@/components/home/HomeNewsletter";
import {
  BrandStory,
  Bestsellers,
  FeaturedCollections,
} from "@/components/home/HomeSections";

// design/pages/home.md §12: an absolute title (not templated) and the description.
const TITLE = "Starflames · Scented candles for starlit evenings";
const DESCRIPTION =
  "Scented candles, travel tins, wax melts and gift sets inspired by moonlit terraces, starry reading rooms, pine forests and still mountain lakes.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION },
};

/**
 * Home (home.md §2): hero, featured collections, bestsellers, brand story and
 * the newsletter. Static content for now (user request, 2026-10-10:
 * components/home/home-content.ts), not yet read from the data layer. Every
 * band is a direct child of `main` (the hero's flush end and the collapse rule
 * read the siblings, globals.css).
 */
export default function Home() {
  return (
    <>
      <HomeHero sections={{ collections: true, bestsellers: true }} />
      <FeaturedCollections />
      <Bestsellers />
      <BrandStory />
      <HomeNewsletter />
      <HomeHover />
    </>
  );
}
