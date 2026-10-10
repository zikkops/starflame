import type { Metadata } from "next";

import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SiteShell } from "@/components/layout/SiteShell";
import type { StarfieldPreview } from "@/components/starfield/starfield-data";

type Mode = {
  href: string;
  label: string;
  title: string;
  preview: StarfieldPreview;
};

/** The five preview pages (starfield.md §11, §13.1): one constant prop each. */
const MODES = [
  {
    href: "/dev/starfield",
    label: "Live sky",
    title: "Starfield preview · Starflames",
    preview: {},
  },
  {
    href: "/dev/starfield/still",
    label: "Still frame",
    title: "Starfield preview, still frame · Starflames",
    preview: { still: true },
  },
  {
    href: "/dev/starfield/no-streak",
    label: "No falling stars",
    title: "Starfield preview, no falling stars · Starflames",
    preview: { streak: "off" },
  },
  {
    href: "/dev/starfield/streak-demo",
    label: "A falling star every few seconds",
    title: "Starfield preview, falling star demo · Starflames",
    preview: { streak: "demo" },
  },
  {
    href: "/dev/starfield/streak-blocked",
    label: "A falling star aimed at text (it should be refused)",
    title: "Starfield preview, refused falling star · Starflames",
    preview: { streak: "demo-blocked" },
  },
] as const satisfies readonly Mode[];

export type StarfieldPreviewHref = (typeof MODES)[number]["href"];

const modeOf = (href: StarfieldPreviewHref): Mode =>
  MODES.find((mode) => mode.href === href) ?? MODES[0];

/** Each page's generateMetadata returns this after requireDevPages(). */
export function starfieldPreviewMetadata(href: StarfieldPreviewHref): Metadata {
  return { title: modeOf(href).title };
}

/**
 * The shared content of the /dev/starfield pages (§13.1), inside the real shell.
 * First in main: the empty demo spacer (fixed px heights, §13.3), then its
 * caption, which the refused-streak demo aims at. The mode links are plain
 * anchors, so each mode starts a fresh page view with a fresh island.
 */
export function StarfieldPreviewPage({
  current,
}: {
  current: StarfieldPreviewHref;
}) {
  return (
    <SiteShell starfieldPreview={modeOf(current).preview}>
      <Section>
        <Container>
          <div
            data-open-sky=""
            data-sf-demo="open"
            className="mb-4 h-80 md:h-90"
          />
          <p data-sf-demo="text" className="mb-12 type-caption text-text-muted">
            In the demo, falling stars cross the empty space above.
          </p>
          <h1 className="mb-4 type-h1">Starfield preview</h1>
          <p className="mb-10 max-w-measure-intro type-body text-text-secondary">
            The night sky behind every page. Sample text sits over it so you can
            check that the stars stay faint behind words.
          </p>
          <h2 id="sf-modes" className="mb-2 type-h3">
            Preview modes
          </h2>
          <ul aria-labelledby="sf-modes" className="mb-16">
            {MODES.map((mode) => (
              <li key={mode.href}>
                <a
                  href={mode.href}
                  aria-current={mode.href === current ? "page" : undefined}
                  className="inline-flex min-h-(--size-touch) items-center type-body text-link underline underline-offset-[0.25em] transition-colors hover:text-link-hover aria-[current=page]:text-text-primary aria-[current=page]:no-underline"
                >
                  {mode.label}
                </a>
              </li>
            ))}
          </ul>
          <h2 className="mb-4 type-h2">Text over the open sky</h2>
          <p className="mb-4 max-w-measure-prose type-body text-text-secondary">
            Stars stay faint in the middle of the page, where words and products
            sit. The brighter stars keep to the edges.
          </p>
          <p className="type-caption text-text-muted">
            This caption uses the faintest text colour allowed over the sky.
          </p>
        </Container>
      </Section>
      {/* At least a viewport tall, so a scroll position exists where no plain
          band shows below the header band (starfield.md test 11). */}
      <Section band="solid" labelledBy="sf-solid" className="min-h-lvh">
        <Container>
          <h2 id="sf-solid" className="mb-4 type-h2">
            A solid band hides the sky
          </h2>
          <p className="max-w-measure-prose type-body text-text-secondary">
            Dense content such as checkout sits on solid ground, so no stars
            show behind it.
          </p>
        </Container>
      </Section>
      <Section band="haze" labelledBy="sf-haze">
        <Container>
          <h2 id="sf-haze" className="mb-4 type-h2">
            A haze band hides it too
          </h2>
          <p className="max-w-measure-prose type-body text-text-secondary">
            Haze lives in its own bands, never in the sky layer.
          </p>
        </Container>
      </Section>
      <Section labelledBy="sf-filler" className="min-h-[1500px]">
        <Container>
          <h2 id="sf-filler" className="mb-4 type-h2">
            Scroll to check that the sky stays still
          </h2>
          <p className="max-w-measure-prose type-body text-text-secondary">
            The stars are fixed to the screen. Only the page moves.
          </p>
        </Container>
      </Section>
    </SiteShell>
  );
}
