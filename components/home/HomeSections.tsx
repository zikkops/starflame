import Image, { getImageProps } from "next/image";

import { Container } from "@/components/layout/Container";
import { SectionHeading } from "@/components/layout/SectionHeading";
import storyAurora from "@/public/images/story/story-aurora.jpg";

import {
  BADGE_LABELS,
  HOME_BESTSELLERS,
  HOME_TYPES,
  type HomeProduct,
  type HomeType,
} from "./home-content";

const BADGE_BASE =
  "inline-flex min-h-5 w-fit items-center rounded-sm border px-2 py-0.5 type-eyebrow";
const BADGE_LOOK = {
  limited: "border-transparent bg-badge-limited text-text-inverse",
  new: "border-border-accent text-text-accent",
  bestseller: "border-border-accent text-text-accent",
} as const;

/* ── Shop by type (user request, 2026-10-10: one row of 4 candle types) ── */

const TYPE_SIZES =
  "(min-width: 90rem) 296px, (min-width: 64rem) calc((100vw - 152px) / 4), (min-width: 48rem) calc(50vw - 44px), calc(50vw - 28px)";

function TypeCard({ item }: { item: HomeType }) {
  const { props: image } = getImageProps({
    src: item.image,
    alt: item.alt,
    fill: true,
    sizes: TYPE_SIZES,
  });
  return (
    <li data-hover-card="" className="relative cursor-default">
      {/* The candle glow around the arch that fades in on hover (HomeHover). */}
      <span
        aria-hidden="true"
        data-decorative=""
        data-hover-glow=""
        className="pointer-events-none absolute inset-x-0 top-0 aspect-3/4 rounded-arch opacity-0 shadow-[0_0_56px_10px_rgb(247_184_97/0.22)]"
      />
      <div className="relative aspect-3/4 overflow-hidden rounded-arch bg-bg-raised">
        {/* eslint-disable-next-line @next/next/no-img-element -- getImageProps() output */}
        <img
          {...image}
          alt={item.alt}
          data-hover-img=""
          className="object-cover"
        />
        <span
          aria-hidden="true"
          data-decorative=""
          data-hover-ring=""
          className="absolute inset-0 rounded-[inherit] border border-gold-400/40"
        />
      </div>
      <div className="mt-4">
        <h3 data-hover-name="" className="type-h4 text-text-primary">
          {item.name}
        </h3>
        <p className="mt-1 type-body text-pretty text-text-secondary">
          {item.tagline}
        </p>
        <p className="mt-2 type-eyebrow text-text-accent">{item.count}</p>
      </div>
    </li>
  );
}

export function FeaturedCollections() {
  return (
    <section
      id="collections"
      data-band="plain"
      aria-labelledby="collections-heading"
    >
      <Container>
        <SectionHeading
          id="collections-heading"
          eyebrow="Shop by type"
          title="Choose your kind of night"
          intro="Jars, pillars, tins or melts: pick the shape of your evening."
        />
        <ul className="collection-grid">
          {HOME_TYPES.map((item) => (
            <TypeCard key={item.type} item={item} />
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── Bestsellers (home.md §5, §6) ──────────────────────────────────────── */

const PRODUCT_SIZES =
  "(min-width: 90rem) 264px, (min-width: 64rem) calc((100vw - 152px) / 4), (min-width: 48rem) calc(50vw - 84px), calc(50vw - 47px)";

function ProductCard({ product }: { product: HomeProduct }) {
  const { props: image } = getImageProps({
    src: product.image,
    alt: "",
    fill: true,
    sizes: PRODUCT_SIZES,
  });
  return (
    <li className="flex">
      <article
        data-hover-card=""
        className="relative flex w-full flex-col rounded-md border border-border-divider bg-bg-raised p-3 shadow-raised md:p-4"
      >
        {/* The candle glow that fades in on hover (HomeHover). */}
        <span
          aria-hidden="true"
          data-decorative=""
          data-hover-glow=""
          className="pointer-events-none absolute -inset-px rounded-[inherit] border border-gold-400/60 opacity-0 shadow-glow-candle-soft"
        />
        <div className="relative aspect-4/5 overflow-hidden rounded-arch bg-bg-raised">
          {/* eslint-disable-next-line @next/next/no-img-element -- getImageProps() output */}
          <img {...image} alt="" data-hover-img="" className="object-cover" />
        </div>
        <div className="mt-3 flex flex-1 flex-col">
          <ul aria-label="Labels" className="flex flex-wrap gap-2">
            <li className={`${BADGE_BASE} ${BADGE_LOOK[product.badge]}`}>
              {BADGE_LABELS[product.badge]}
            </li>
          </ul>
          <h3 data-hover-name="" className="mt-2 type-h4 text-text-primary">
            {product.name}
          </h3>
          <p className="mt-1 type-body text-pretty text-text-secondary">
            {product.shortDescription}
          </p>
          <p className="mt-auto pt-3 type-price text-text-primary">
            {product.price}
          </p>
        </div>
      </article>
    </li>
  );
}

export function Bestsellers() {
  return (
    <section
      id="bestsellers"
      data-band="plain"
      aria-labelledby="bestsellers-heading"
    >
      <Container>
        <SectionHeading
          id="bestsellers-heading"
          eyebrow="Bestsellers and new arrivals"
          title="Favorites and new flames"
          intro="Our bestsellers, and the newest scents to join them."
        />
        <ul className="bestseller-grid">
          {HOME_BESTSELLERS.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ── Brand story (home.md §7) ──────────────────────────────────────────── */

export function BrandStory() {
  return (
    <section
      id="story"
      data-band="dusk"
      aria-labelledby="story-heading"
      className="relative isolate overflow-hidden"
    >
      {/* The aurora sits where the illustration used to, on the start side, and
          fades out under the copy. Decorative: the section's meaning is in its
          text, so it carries no alt text (art-direction §5). */}
      <Image
        src={storyAurora}
        alt=""
        aria-hidden="true"
        data-decorative=""
        fill
        sizes="100vw"
        className="story-aurora -z-20 object-cover object-left"
      />
      {/* Phones only: the aurora runs under the copy there, so a light veil
          keeps the text on solid-enough ground (accessibility §7). From md the
          copy sits on the plain dusk band. */}
      <span
        aria-hidden="true"
        data-decorative=""
        className="absolute inset-0 -z-10 bg-night-900/45 md:hidden"
      />
      <Container>
        <div className="grid items-center gap-8 md:grid-cols-8 md:gap-6 lg:grid-cols-12">
          <div className="md:col-span-5 md:col-start-4 lg:col-span-6 lg:col-start-7">
            <hgroup className="flex flex-col gap-3">
              <p className="type-eyebrow text-gold-300">About Starflames</p>
              <h2 id="story-heading" className="type-h2 text-text-primary">
                Lit slowly, after dark
              </h2>
            </hgroup>
            <p className="mt-6 max-w-measure-intro type-body-lg text-text-primary">
              We think the best part of the day is the hour after dark, when the
              house goes quiet and one small flame is enough.
            </p>
            <p className="mt-4 max-w-measure-prose type-body-lg text-text-primary">
              So every Starflames scent begins with a place you could almost
              step into: a stone terrace above a valley of lights, a reading
              room under a window full of stars, a lantern-lit path through the
              pines, a lake so still it holds the moon twice. Light one, slow
              down, and let the evening take its time.
            </p>
          </div>
        </div>
      </Container>
      <span
        aria-hidden="true"
        data-decorative=""
        className="absolute inset-x-0 bottom-0 h-px bg-(image:--gradient-starlight-rule)"
      />
    </section>
  );
}
