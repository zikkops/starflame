import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon, FourPointStarIcon } from "@/components/icons/glyphs";
import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { primaryButtonClasses } from "@/components/ui/button";
import catalog from "@/design/copy/catalog.json";
import colCometSeason from "@/public/images/collections/col-comet-season.jpg";
import colEmberGrove from "@/public/images/collections/col-ember-grove.jpg";
import colGiftSets from "@/public/images/collections/col-gift-sets.jpg";
import colLakesideHush from "@/public/images/collections/col-lakeside-hush.jpg";
import colMoonlitTerrace from "@/public/images/collections/col-moonlit-terrace.jpg";
import colStarlitLibrary from "@/public/images/collections/col-starlit-library.jpg";
import storyAurora from "@/public/images/story/story-aurora.jpg";

export const metadata: Metadata = {
  title: "About Starflames",
  description:
    "Starflames makes scented candles inspired by night places: moonlit terraces, starry reading rooms, pine forests and still mountain lakes. Here is what you will find in the shop.",
};

const MOODS = {
  "moonlit-terrace": colMoonlitTerrace,
  "starlit-library": colStarlitLibrary,
  "ember-grove": colEmberGrove,
  "lakeside-hush": colLakesideHush,
  "comet-season": colCometSeason,
  "gift-sets": colGiftSets,
} as const;

const OFFER = [
  {
    title: "Scented jars",
    text: "Our everyday candles, in smoky blue glass with a gold lid, in two sizes.",
  },
  {
    title: "Pillar candles",
    text: "Tall, freestanding candles for a dining table, a windowsill or a mantel.",
  },
  {
    title: "Travel tins",
    text: "Small lidded tins that fit a bag, a bedside table or a weekend away.",
  },
  {
    title: "Wax melts",
    text: "Scented cubes for a melt warmer, when you want the scent without a flame.",
  },
  {
    title: "Gift sets",
    text: "Boxed sets of tins and candles, ready to give without wrapping.",
  },
  {
    title: "Limited runs",
    text: "Seasonal scents that arrive for a while and then make way for the next.",
  },
];

const STEPS = [
  {
    title: "Find your place",
    text: "Start from a collection, a stone terrace, a reading room or a lake, or browse every candle in the shop.",
  },
  {
    title: "Narrow it down",
    text: "Filter by type, scent family, collection or price, and sort by what matters to you.",
  },
  {
    title: "Read the notes",
    text: "Every candle lists its top, heart and base notes, its sizes and its burn time.",
  },
];

/** /our-story (user request, 2026-10-10): what Starflames is and does. */
export default function AboutPage() {
  const collections = [...catalog.collections].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  return (
    <>
      {/* Intro over the aurora, fading into the page like the home story band. */}
      <section
        data-band="dusk"
        aria-labelledby="about-heading"
        className="relative isolate overflow-hidden pt-12 md:pt-16"
      >
        <Image
          src={storyAurora}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="story-aurora -z-20 object-cover object-left"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-night-900/45 md:hidden"
        />
        <Container>
          <div className="grid md:grid-cols-8 lg:grid-cols-12">
            <div className="md:col-span-6 md:col-start-3 lg:col-span-7 lg:col-start-6">
              <p className="type-eyebrow text-gold-300">About Starflames</p>
              <h1
                id="about-heading"
                className="mt-3 type-display-2 text-text-primary"
              >
                Candles for the hour after dark
              </h1>
              <p className="mt-6 max-w-measure-intro type-body-lg text-text-primary">
                Starflames is a small candle shop built around one idea: every
                scent should feel like a place you could step into at night.
              </p>
              <p className="mt-4 max-w-measure-prose type-body-lg text-text-primary">
                A stone terrace above a valley of lights. A reading room under a
                window full of stars. A lantern-lit path through the pines. A
                lake so still it holds the moon twice. We gather each place into
                a collection of scents, so you can choose a candle the way you
                would choose an evening.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section data-band="plain" aria-labelledby="offer-heading">
        <Container>
          <SectionHeading
            id="offer-heading"
            eyebrow="What we make"
            title="What you will find here"
            intro="Everything in the shop is a way to bring a little starlight indoors."
          />
          <ul className="grid gap-x-(--grid-gap) gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {OFFER.map((item) => (
              <li key={item.title} className="flex gap-4">
                <FourPointStarIcon className="mt-1.5 size-4 shrink-0 text-gold-300" />
                <div>
                  <h3 className="type-h4 text-text-primary">{item.title}</h3>
                  <p className="mt-2 type-body text-text-secondary">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section data-band="plain" aria-labelledby="places-heading">
        <Container>
          <SectionHeading
            id="places-heading"
            eyebrow="Six collections"
            title="Six places, one night sky"
            intro="Each collection gathers the scents of one place."
          />
          <ul className="grid grid-cols-2 gap-x-(--grid-gap) gap-y-10 md:grid-cols-3">
            {collections.map((c) => (
              <li key={c.slug}>
                <div className="relative aspect-3/4 overflow-hidden rounded-arch bg-bg-raised">
                  <Image
                    src={MOODS[c.slug as keyof typeof MOODS]}
                    alt=""
                    fill
                    sizes="(min-width: 90rem) 400px, (min-width: 48rem) 30vw, 45vw"
                    className="object-cover object-[50%_100%]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[inherit] border border-gold-400/40"
                  />
                </div>
                <h3 className="mt-4 type-h4 text-text-primary">{c.name}</h3>
                <p className="mt-1 type-body text-pretty text-text-secondary">
                  {c.tagline}
                </p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section data-band="sunken" aria-labelledby="how-heading">
        <Container>
          <SectionHeading
            id="how-heading"
            eyebrow="Shopping with us"
            title="How the shop works"
          />
          <ol className="grid gap-x-(--grid-gap) gap-y-10 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title}>
                <p className="type-display-2 text-gold-300/70">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-2 type-h4 text-text-primary">{step.title}</h3>
                <p className="mt-2 type-body text-text-secondary">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link href="/shop" className={primaryButtonClasses()}>
              Visit the shop
            </Link>
            <Link
              href="/contact"
              className="inline-flex min-h-(--size-touch) items-center gap-2 type-nav text-link underline decoration-1 underline-offset-[0.2em] hover:text-link-hover"
            >
              Ask us anything
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
