import type { Metadata } from "next";

import { HomeHero } from "@/components/home/HomeHero";
import { Container } from "@/components/layout/Container";
import { SiteShell } from "@/components/layout/SiteShell";

import { requireDevPages } from "../gate";

// Dev-only hero preview (M2.2, ../gate.ts): the home hero with both CTAs, as it
// will be once M2.3 and M2.4 add the sections they jump to. Two plain stand-in
// sections carry the #collections and #bestsellers targets, so the in-page
// links, the 32px CTA–link gap and the hero → plain band junction can be
// checked before those tasks. Static.
export function generateMetadata(): Metadata {
  requireDevPages();
  return { title: "Hero preview · Starflames" };
}

const STAND_INS = [
  {
    id: "collections",
    title: "Featured collections",
    note: "A stand-in for the featured collections section (M2.3).",
  },
  {
    id: "bestsellers",
    title: "Bestsellers",
    note: "A stand-in for the bestsellers section (M2.4).",
  },
] as const;

export default function HeroPreviewPage() {
  requireDevPages();
  return (
    <SiteShell>
      <HomeHero sections={{ collections: true, bestsellers: true }} />
      {STAND_INS.map(({ id, title, note }) => (
        <section
          key={id}
          id={id}
          data-band="plain"
          aria-labelledby={`${id}-heading`}
        >
          <Container>
            <h2 id={`${id}-heading`} className="mb-4 type-h2">
              {title}
            </h2>
            <p className="type-body text-text-secondary">{note}</p>
            {/* Plain scroll room (no content), so each jump has room to land. */}
            <div aria-hidden="true" className="h-[900px]" />
          </Container>
        </section>
      ))}
    </SiteShell>
  );
}
