import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import Link from "next/link";

import { Wordmark } from "@/components/brand/Wordmark";

import { requireDevPages } from "../gate";

// Dev-only token preview (../gate.ts). Values are read from app/globals.css at
// build time, so what this page shows is what the CSS ships.
export function generateMetadata(): Metadata {
  requireDevPages();
  return { title: "Design tokens · Starflames" };
}

type Tokens = Map<string, string>;

function readTokens(): Tokens {
  const css = readFileSync(join(process.cwd(), "app", "globals.css"), "utf8");
  const tokens = new Map<string, string>();
  for (const [, name, value] of css.matchAll(
    /(--(?:color|radius|shadow)-[a-z0-9-]+):\s*([^;*]+);/g,
  )) {
    if (name && value) tokens.set(name, value.replace(/\s+/g, " ").trim());
  }
  return tokens;
}

/** Follows var(--x) references to the final value. */
function resolve(tokens: Tokens, value: string): string {
  const ref = /^var\((--[a-z0-9-]+)\)$/.exec(value)?.[1];
  const next = ref ? tokens.get(ref) : undefined;
  return next ? resolve(tokens, next) : value;
}

const names = (tokens: Tokens, prefix: string): string[] =>
  [...tokens.keys()].filter((name) => name.startsWith(prefix));

const RAW_SCALES = ["night", "violet", "rose", "gold", "ember", "moon"];
const STATUS = ["moss", "honey", "coral", "tide"];

// Specimen copy from typography.md §8 (original, IP-checked). The body-lg claim
// and the currency are open questions there, so they are not used here.
const TYPE_SCALE: { cls: string; sample: React.ReactNode }[] = [
  { cls: "type-display-1", sample: "Light a little starlight." },
  { cls: "type-display-2", sample: "Moonlit Terrace" },
  { cls: "type-h1", sample: "Midnight Balcony Candle" },
  { cls: "type-h2", sample: "Scents for long, quiet evenings" },
  {
    cls: "type-h2",
    sample: (
      <>
        A glow for <em>slow</em> evenings
      </>
    ),
  },
  { cls: "type-h3", sample: "Notes of cedar, plum and warm amber" },
  { cls: "type-h4", sample: "Caring for your candle" },
  {
    cls: "type-body-lg",
    sample:
      "Trim the wick to 5 mm before every burn and let the first burn melt all the way to the edge of the jar.",
  },
  {
    cls: "type-body",
    sample:
      "Trim the wick to 5 mm before every burn and let the first burn melt all the way to the edge of the jar. That keeps the wax level and the scent full until the very last evening.",
  },
  { cls: "type-body-sm", sample: "Burn time about 45 hours · 220 g" },
  { cls: "type-caption", sample: "Shown lit, on a windowsill after dusk." },
  { cls: "type-eyebrow", sample: "New this season" },
  { cls: "type-button", sample: "Add to bag · Shop the collection" },
  { cls: "type-price", sample: "34.00" },
  { cls: "type-price-lg", sample: "34.00" },
  { cls: "type-nav", sample: "Shop · Collections · Gift sets · Our story" },
];

// Literal class names, so Tailwind generates them (tokens.md §4 steps).
const SPACING = [
  { step: 0.5, cls: "w-0.5" },
  { step: 1, cls: "w-1" },
  { step: 2, cls: "w-2" },
  { step: 3, cls: "w-3" },
  { step: 4, cls: "w-4" },
  { step: 5, cls: "w-5" },
  { step: 6, cls: "w-6" },
  { step: 8, cls: "w-8" },
  { step: 10, cls: "w-10" },
  { step: 12, cls: "w-12" },
  { step: 16, cls: "w-16" },
  { step: 20, cls: "w-20" },
  { step: 24, cls: "w-24" },
  { step: 32, cls: "w-32" },
] as const;

const RADII = [
  { name: "--radius-xs", cls: "rounded-xs" },
  { name: "--radius-sm", cls: "rounded-sm" },
  { name: "--radius-md", cls: "rounded-md" },
  { name: "--radius-lg", cls: "rounded-lg" },
  { name: "--radius-xl", cls: "rounded-xl" },
  { name: "--radius-pill", cls: "rounded-pill" },
] as const;

const SHADOWS = [
  { name: "--shadow-raised", cls: "shadow-raised" },
  { name: "--shadow-overlay", cls: "shadow-overlay" },
  { name: "--shadow-glow-candle", cls: "shadow-glow-candle" },
  { name: "--shadow-glow-candle-soft", cls: "shadow-glow-candle-soft" },
  { name: "--shadow-glow-starlight", cls: "shadow-glow-starlight" },
] as const;

const CTA =
  "type-button inline-flex min-h-12 items-center rounded-pill border px-6";
const CTA_STATES = [
  { label: "Default", cls: "border-transparent bg-cta-bg text-text-inverse" },
  {
    label: "Hover (glow on solid ground)",
    cls: "border-transparent bg-cta-bg-hover text-text-inverse shadow-glow-candle",
  },
  {
    label: "Active (pressed)",
    cls: "border-transparent bg-cta-bg-active text-text-inverse scale-98",
  },
  {
    label: "Focus-visible",
    cls: "border-transparent bg-cta-bg text-text-inverse shadow-glow-candle outline-2 outline-offset-2 outline-focus-ring",
  },
  {
    label: "Disabled",
    cls: "border-border-divider bg-cta-bg-disabled text-text-disabled",
  },
] as const;
const GHOST_STATES = [
  { label: "Default", cls: "border-border-ghost text-text-primary" },
  {
    label: "Hover",
    cls: "border-border-accent bg-bg-raised text-text-primary",
  },
  {
    label: "Active",
    cls: "border-border-accent bg-bg-overlay text-text-primary",
  },
  { label: "Disabled", cls: "border-border-divider text-text-disabled" },
] as const;

function Section({
  title,
  children,
}: Readonly<{ title: string; children: React.ReactNode }>) {
  return (
    <section className="border-t border-border-divider py-12">
      <h2 className="mb-6 type-h2">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ tokens, name }: Readonly<{ tokens: Tokens; name: string }>) {
  const value = tokens.get(name) ?? "";
  const ref = /^var\(--color-([a-z0-9-]+)\)$/.exec(value)?.[1];
  const final = resolve(tokens, value);
  return (
    <li className="flex items-center gap-3">
      <span
        className="size-11 shrink-0 rounded-md border border-border-divider"
        style={{ background: `var(${name})` }}
      />
      <span className="min-w-0">
        <span className="block type-body-sm text-text-primary">
          {name.replace("--color-", "")}
        </span>
        <span className="block type-caption text-text-muted">
          {ref ? `${ref} · ` : ""}
          {final.startsWith("#") ? final.toUpperCase() : final}
        </span>
      </span>
    </li>
  );
}

export default function TokensPage() {
  requireDevPages();
  const tokens = readTokens();
  const rawNames = new Set(
    [...RAW_SCALES, ...STATUS].flatMap((scale) =>
      names(tokens, `--color-${scale}-`),
    ),
  );
  const semanticNames = names(tokens, "--color-").filter(
    (name) => !rawNames.has(name),
  );
  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto w-full max-w-content px-(--gutter) py-(--section-y)"
    >
      <p className="mb-3 type-eyebrow text-text-accent">Dev only</p>
      <h1 className="mb-4 type-h1">Design tokens</h1>
      <p className="mb-12 max-w-measure-intro type-body text-text-secondary">
        Every value on this page is read from app/globals.css. Sources:
        design/system/tokens.md, typography.md and motion.md.
      </p>

      <Section title="Wordmark">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-md border border-border-divider bg-bg-page p-6">
            <p className="mb-4 type-caption text-text-muted">
              Header: --wordmark-h-header (28 / 32 / 36 px)
            </p>
            <Wordmark size="header" className="text-wordmark" />
          </div>
          <div className="rounded-md border border-border-divider bg-bg-sunken p-6">
            <p className="mb-4 type-caption text-text-muted">
              Footer on bg-sunken: --wordmark-h-footer (40 / 44 / 48 px)
            </p>
            <Wordmark size="footer" className="text-wordmark" />
          </div>
        </div>
      </Section>

      <Section title="Colour roles">
        <ul className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
          {semanticNames.map((name) => (
            <Swatch key={name} tokens={tokens} name={name} />
          ))}
        </ul>
      </Section>

      <Section title="Raw scales">
        {[...RAW_SCALES, ...STATUS].map((scale) => (
          <div key={scale} className="mb-8">
            <h3 className="mb-4 type-h4">{scale}</h3>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
              {names(tokens, `--color-${scale}-`).map((name) => (
                <Swatch key={name} tokens={tokens} name={name} />
              ))}
            </ul>
          </div>
        ))}
      </Section>

      <Section title="Type scale">
        <ul className="grid gap-8">
          {TYPE_SCALE.map(({ cls, sample }, i) => (
            <li key={`${cls}-${i}`} className="grid gap-2">
              <span className="type-caption text-text-muted">{cls}</span>
              <p className={`${cls} max-w-measure-prose`}>{sample}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Spacing (4px base)">
        <ul className="grid gap-2">
          {SPACING.map(({ step, cls }) => (
            <li key={step} className="flex items-center gap-4">
              <span className="w-20 shrink-0 type-caption text-text-muted">
                {step} · {step * 4}px
              </span>
              <span className={`${cls} h-3 rounded-xs bg-gold-400`} />
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Radius">
        <ul className="grid grid-cols-2 items-start gap-6 md:grid-cols-4">
          {RADII.map(({ name, cls }) => (
            <li key={name} className="grid gap-2">
              <span
                className={`${cls} h-20 border border-border-accent bg-bg-raised`}
              />
              <span className="type-caption text-text-muted">
                {name} · {tokens.get(name)}
              </span>
            </li>
          ))}
          <li className="grid gap-2">
            <span className="aspect-4/5 rounded-arch border border-border-accent bg-bg-raised" />
            <span className="type-caption text-text-muted">
              --radius-arch (4:5)
            </span>
          </li>
          <li className="grid gap-2">
            <span className="aspect-4/5 rounded-arch-soft-4-5 border border-border-accent bg-bg-raised" />
            <span className="type-caption text-text-muted">
              --radius-arch-soft-4-5
            </span>
          </li>
          <li className="grid gap-2">
            <span className="aspect-square rounded-arch-soft-1-1 border border-border-accent bg-bg-raised" />
            <span className="type-caption text-text-muted">
              --radius-arch-soft-1-1
            </span>
          </li>
        </ul>
      </Section>

      <Section title="Shadows, glows and gradients">
        <ul className="grid grid-cols-2 gap-10 md:grid-cols-3">
          {SHADOWS.map(({ name, cls }) => (
            <li key={name} className="grid gap-3">
              <span className={`${cls} h-20 rounded-md bg-bg-raised`} />
              <span className="type-caption text-text-muted">{name}</span>
            </li>
          ))}
        </ul>
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            "--gradient-haze-dusk",
            "--gradient-haze-veil",
            "--gradient-haze-blush",
            "--gradient-candle-glow",
            "--gradient-starlight-rule",
          ].map((name) => (
            <li key={name} className="grid gap-2">
              <span
                className="h-24 rounded-md border border-border-divider bg-bg-page"
                style={{ backgroundImage: `var(${name})` }}
              />
              <span className="type-caption text-text-muted">{name}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Buttons and focus">
        <p className="mb-6 type-body-sm text-text-secondary">
          Static state samples, then live controls: press Tab to see the focus
          ring (2px gold-300, 2px offset).
        </p>
        {/* gap-10: no other control inside a CTA glow footprint (26px, tokens.md
            §2.5 rule 9). The captions sit inside it, so they are text-secondary:
            text-muted is not allowed there (X10). */}
        <div className="mb-8 flex flex-wrap gap-10">
          {CTA_STATES.map(({ label, cls }) => (
            <div key={label} className="grid justify-items-start gap-2">
              <span className={`${CTA} ${cls}`}>Add to bag</span>
              <span className="type-caption text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
        <div className="mb-8 flex flex-wrap gap-6">
          {GHOST_STATES.map(({ label, cls }) => (
            <div key={label} className="grid justify-items-start gap-2">
              <span className={`${CTA} ${cls}`}>Shop the collection</span>
              <span className="type-caption text-text-muted">
                Ghost: {label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <button
            type="button"
            className={`${CTA} border-transparent bg-cta-bg text-text-inverse transition-[color,background-color,border-color,scale] duration-(--duration-fast) ease-standard hover:bg-cta-bg-hover active:scale-(--motion-scale-press) active:bg-cta-bg-active`}
          >
            Add to bag
          </button>
          <button
            type="button"
            className={`${CTA} border-border-ghost text-text-primary transition-colors duration-(--duration-fast) ease-standard hover:border-border-accent hover:bg-bg-raised active:bg-bg-overlay`}
          >
            Shop the collection
          </button>
          <Link
            href="/"
            className="type-body text-link underline decoration-1 underline-offset-[0.2em] hover:text-link-hover"
          >
            Home (a text link)
          </Link>
        </div>
      </Section>
    </main>
  );
}
