import { getImageProps } from "next/image";

import { ArrowRightIcon } from "@/components/icons/glyphs";
import { primaryButtonClasses } from "@/components/ui/button";
import heroDesktop from "@/public/images/hero/hero-desktop.jpg";
import heroMobile from "@/public/images/hero/hero-mobile.jpg";

import { heroActions, type HomeSections } from "./hero-actions";

// design/pages/home.md §11.1 and §11.3 (final, IP-checked copy).
const EYEBROW = "Scented candles for the night";
const HEADING = "Light a little starlight.";
const SUBCOPY =
  "Inspired by moonlit terraces, starry reading rooms and still lakes, for long, quiet evenings.";
const ALT =
  "A lit candle in a smoky blue glass jar on a stone terrace ledge at night, above a still lake, distant hillside lights and a starry violet sky.";

/**
 * The home hero (home.md §3): a `solid` band that ends flush with its feathered
 * image (`data-flush-end`, globals.css), text first in the DOM and on screen.
 * Server Component with deterministic markup: the entrance is the global
 * stylesheet's `hero-reveal` animation (motion.md §5.1), which starts at first
 * paint and needs no JS, and a hydration mismatch here would re-create the DOM
 * and replay it. Only the eyebrow, the subcopy and the CTA group carry
 * `data-hero-reveal`, with their `--reveal-order` (0, 1, 2 in DOM order) as a
 * class, never the h1 or the image (§3.6, option b).
 *
 * `sections` says which home sections are on the page, so the in-page CTAs never
 * point at a missing fragment (§3.7, §3.8; hero-actions.ts).
 */
export function HomeHero({ sections }: { sections: HomeSections }) {
  const actions = heroActions(sections);
  const primary = actions.find((action) => action.kind === "primary");
  const link = actions.find((action) => action.kind === "link");

  // Art direction (§3.9): one getImageProps call per source in one <picture>.
  // `sizes` is the image's rendered width under object-fit: cover, not the box's.
  // The one eager, high-priority image on the page; no preload (Next 16 docs:
  // not with fetchPriority, nor with two possible LCP sources).
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({
    src: heroDesktop,
    alt: ALT,
    sizes: "(min-width: 64rem) 81vw, 133.3vw",
  });
  const { props: mobile } = getImageProps({
    src: heroMobile,
    alt: ALT,
    sizes: "100vw",
    loading: "eager",
    fetchPriority: "high",
  });

  return (
    <section
      id="hero"
      data-band="solid"
      data-flush-end=""
      aria-labelledby="hero-heading"
      className="pt-6 md:pt-8 lg:pt-0"
    >
      <div className="hero-grid">
        <div className="page-container lg:col-start-2 lg:mx-0 lg:max-w-none lg:px-0">
          <hgroup className="flex flex-col gap-3">
            <p
              data-hero-reveal=""
              className="type-eyebrow text-text-accent [--reveal-order:0]"
            >
              {EYEBROW}
            </p>
            <h1
              id="hero-heading"
              className="max-w-measure-heading type-display-1 text-text-primary"
            >
              {HEADING}
            </h1>
          </hgroup>
          <p
            data-hero-reveal=""
            className="mt-4 max-w-measure-intro type-body-lg text-pretty text-text-secondary [--reveal-order:1]"
          >
            {SUBCOPY}
          </p>
          {primary ? (
            <div
              data-hero-reveal=""
              className="mt-6 flex flex-wrap items-center gap-8 [--reveal-order:2]"
            >
              {/* Plain <a>: in-page anchors, never prefetched (§3.1, §3.8). */}
              <a
                href={primary.href}
                className={`w-full md:w-auto ${primaryButtonClasses()}`}
              >
                {primary.label}
              </a>
              {link ? (
                <a
                  href={link.href}
                  className="inline-flex min-h-(--size-touch) items-center gap-2 type-nav text-link underline decoration-1 underline-offset-[0.2em] transition-colors hover:text-link-hover"
                >
                  {link.label}
                  <ArrowRightIcon className="size-4 shrink-0" />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
        <div className="hero-media">
          {/* The candle glow behind the opaque photo: it shows only through
              the feathered edges (§3.4). md+ only. */}
          <div aria-hidden="true" data-decorative="" className="hero-glow" />
          <div className="hero-image">
            <picture>
              <source
                media="(min-width: 48rem)"
                srcSet={desktopSrcSet}
                sizes="(min-width: 64rem) 81vw, 133.3vw"
              />
              {/* getImageProps() supplies src, srcSet, sizes, width, height,
                  loading and fetchPriority; the alt is restated for the linter. */}
              <img {...mobile} alt={ALT} className="size-full object-cover" />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}
