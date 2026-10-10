"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { CloseIcon } from "@/components/icons/glyphs";
import { primaryButtonClasses } from "@/components/ui/button";

import type { FilterOption, ShopBadge, ShopProduct } from "./shop-data";

type FacetKey = "type" | "scent" | "collection" | "price";
type Selection = Record<FacetKey, string[]>;
type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const FACETS: { key: FacetKey; legend: string }[] = [
  { key: "type", legend: "Type" },
  { key: "scent", legend: "Scent" },
  { key: "collection", legend: "Collection" },
  { key: "price", legend: "Price" },
];

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

const EMPTY: Selection = { type: [], scent: [], collection: [], price: [] };

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function priceLabel(p: ShopProduct): string {
  const from = usd.format(p.priceFrom / 100);
  return p.priceFrom === p.priceTo ? from : `From ${from}`;
}

/** Price buckets match by range overlap: "From $34" with a $48 size is in both. */
function inPriceBucket(p: ShopProduct, bucket: string): boolean {
  if (bucket === "under-25") return p.priceFrom < 2500;
  if (bucket === "25-40") return p.priceFrom <= 4000 && p.priceTo >= 2500;
  if (bucket === "over-40") return p.priceTo > 4000;
  return false;
}

function matches(p: ShopProduct, key: FacetKey, values: string[]): boolean {
  if (values.length === 0) return true;
  switch (key) {
    case "type":
      return values.includes(p.type);
    case "scent":
      return p.scentFamily !== null && values.includes(p.scentFamily);
    case "collection":
      return p.collections.some((c) => values.includes(c));
    case "price":
      return values.some((v) => inPriceBucket(p, v));
  }
}

/** OR within a facet, AND across facets; `skip` leaves one facet out (for counts). */
function filterProducts(
  products: ShopProduct[],
  selection: Selection,
  skip?: FacetKey,
): ShopProduct[] {
  return products.filter((p) =>
    FACETS.every(({ key }) => key === skip || matches(p, key, selection[key])),
  );
}

function sortProducts(products: ShopProduct[], sort: SortKey): ShopProduct[] {
  const list = [...products];
  if (sort === "price-asc") list.sort((a, b) => a.priceFrom - b.priceFrom);
  if (sort === "price-desc") list.sort((a, b) => b.priceFrom - a.priceFrom);
  if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "featured") list.sort((a, b) => a.sortOrder - b.sortOrder);
  return list;
}

function readUrl(options: Record<FacetKey, FilterOption[]>): {
  selection: Selection;
  sort: SortKey;
} {
  const params = new URLSearchParams(window.location.search);
  const selection = { ...EMPTY };
  for (const { key } of FACETS) {
    const valid = new Set(options[key].map((o) => o.value));
    selection[key] = params.getAll(key).filter((v) => valid.has(v));
  }
  const sortParam = params.get("sort");
  const sort = SORTS.some((s) => s.value === sortParam)
    ? (sortParam as SortKey)
    : "featured";
  return { selection, sort };
}

function writeUrl(selection: Selection, sort: SortKey) {
  const params = new URLSearchParams();
  for (const { key } of FACETS) {
    for (const value of selection[key]) params.append(key, value);
  }
  if (sort !== "featured") params.set("sort", sort);
  const query = params.toString();
  window.history.replaceState(
    null,
    "",
    query ? `?${query}` : window.location.pathname,
  );
}

const BADGE_LOOK: Record<ShopBadge, string> = {
  limited: "border-transparent bg-badge-limited text-text-inverse",
  new: "border-border-accent text-text-accent",
  bestseller: "border-border-accent text-text-accent",
};

function ShopCard({
  product,
  badgeLabels,
  priority,
}: {
  product: ShopProduct;
  badgeLabels: Record<ShopBadge, string>;
  priority: boolean;
}) {
  return (
    <li className="flex">
      <article
        data-hover-card=""
        className="relative flex w-full flex-col rounded-md border border-border-divider bg-bg-raised p-3 shadow-raised md:p-4"
      >
        <span
          aria-hidden="true"
          data-decorative=""
          data-hover-glow=""
          className="pointer-events-none absolute -inset-px rounded-[inherit] border border-gold-400/60 opacity-0 shadow-glow-candle-soft"
        />
        <div className="relative aspect-4/5 overflow-hidden rounded-arch bg-bg-raised">
          <Image
            src={product.image}
            alt=""
            fill
            priority={priority}
            sizes="(min-width: 90rem) 280px, (min-width: 64rem) calc((100vw - 200px) / 3), (min-width: 48rem) calc((100vw - 112px) / 3), calc(50vw - 47px)"
            className="object-cover"
          />
        </div>
        <div className="mt-3 flex flex-1 flex-col">
          {product.badges.length > 0 ? (
            <ul aria-label="Labels" className="mb-2 flex flex-wrap gap-2">
              {product.badges.map((badge) => (
                <li
                  key={badge}
                  className={`inline-flex min-h-5 items-center rounded-sm border px-2 py-0.5 type-eyebrow ${BADGE_LOOK[badge]}`}
                >
                  {badgeLabels[badge]}
                </li>
              ))}
            </ul>
          ) : null}
          <h3 data-hover-name="" className="type-h4 text-text-primary">
            {product.name}
          </h3>
          <p className="mt-1 type-body-sm text-text-muted">
            {product.typeLabel} ·{" "}
            {product.sizes.length === 1
              ? product.sizes[0]
              : `${product.sizes.length} sizes`}
          </p>
          <p className="mt-2 hidden type-body text-pretty text-text-secondary md:block">
            {product.shortDescription}
          </p>
          <p className="mt-auto pt-3 type-price text-text-primary">
            {priceLabel(product)}
          </p>
        </div>
      </article>
    </li>
  );
}

function FilterGroups({
  options,
  selection,
  counts,
  onToggle,
  idPrefix,
}: {
  options: Record<FacetKey, FilterOption[]>;
  selection: Selection;
  counts: Record<FacetKey, Record<string, number>>;
  onToggle: (key: FacetKey, value: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="flex flex-col gap-8">
      {FACETS.map(({ key, legend }) => (
        <fieldset key={key}>
          <legend className="mb-3 type-eyebrow text-text-accent">
            {legend}
          </legend>
          <ul className="flex flex-col gap-1">
            {options[key].map((option) => {
              const id = `${idPrefix}-${key}-${option.value}`;
              const checked = selection[key].includes(option.value);
              const count = counts[key][option.value] ?? 0;
              const disabled = count === 0 && !checked;
              return (
                <li key={option.value}>
                  <label
                    htmlFor={id}
                    className={`flex min-h-(--size-touch) cursor-pointer items-center gap-3 type-body ${disabled ? "cursor-not-allowed text-text-muted" : "text-text-primary"}`}
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => onToggle(key, option.value)}
                      className="size-5 shrink-0 accent-gold-400"
                    />
                    <span className="flex-1">{option.label}</span>
                    <span className="type-body-sm text-text-muted">
                      {count}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  );
}

export function ShopBrowser({
  products,
  options,
  badgeLabels,
}: {
  products: ShopProduct[];
  options: Record<FacetKey, FilterOption[]>;
  badgeLabels: Record<ShopBadge, string>;
}) {
  const [selection, setSelection] = useState<Selection>(EMPTY);
  const [sort, setSort] = useState<SortKey>("featured");
  const [ready, setReady] = useState(false);
  const sheet = useRef<HTMLDialogElement>(null);

  // Start from the URL, so a shared filtered link opens filtered. The page is
  // prerendered, so the query is only readable after hydration: syncing it
  // into state once on mount is the intent here.
  useEffect(() => {
    const initial = readUrl(options);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from the URL after hydration (see above)
    setSelection(initial.selection);
    setSort(initial.sort);
    setReady(true);
  }, [options]);

  useEffect(() => {
    if (ready) writeUrl(selection, sort);
  }, [ready, selection, sort]);

  const results = useMemo(
    () => sortProducts(filterProducts(products, selection), sort),
    [products, selection, sort],
  );

  // Each option's count, given the other facets' choices.
  const counts = useMemo(() => {
    const out = {} as Record<FacetKey, Record<string, number>>;
    for (const { key } of FACETS) {
      const base = filterProducts(products, selection, key);
      out[key] = Object.fromEntries(
        options[key].map((o) => [
          o.value,
          base.filter((p) => matches(p, key, [o.value])).length,
        ]),
      );
    }
    return out;
  }, [products, selection, options]);

  const toggle = (key: FacetKey, value: string) =>
    setSelection((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((v) => v !== value)
        : [...current[key], value],
    }));

  const chips = FACETS.flatMap(({ key }) =>
    selection[key].map((value) => ({
      key,
      value,
      label: options[key].find((o) => o.value === value)?.label ?? value,
    })),
  );
  const activeCount = chips.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
      {/* Desktop: the filters sit in a sidebar. */}
      <aside aria-label="Filters" className="hidden lg:block">
        <FilterGroups
          options={options}
          selection={selection}
          counts={counts}
          onToggle={toggle}
          idPrefix="side"
        />
      </aside>

      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p aria-live="polite" className="type-body text-text-secondary">
            {results.length} {results.length === 1 ? "candle" : "candles"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => sheet.current?.showModal()}
              className="inline-flex min-h-(--size-touch) items-center gap-2 rounded-pill border border-border-control px-5 type-nav text-text-primary transition-colors hover:border-gold-400 lg:hidden"
            >
              Filter{activeCount > 0 ? ` (${activeCount})` : ""}
            </button>
            <label htmlFor="shop-sort" className="sr-only">
              Sort by
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="min-h-(--size-touch) rounded-pill border border-border-control bg-bg-page px-4 type-nav text-text-primary"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {chips.length > 0 ? (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <button
                key={`${chip.key}-${chip.value}`}
                type="button"
                onClick={() => toggle(chip.key, chip.value)}
                className="inline-flex min-h-9 items-center gap-2 rounded-pill border border-border-accent px-3 type-body-sm text-text-primary transition-colors hover:bg-gold-400/10"
              >
                {chip.label}
                <CloseIcon className="size-3.5" />
                <span className="sr-only">(remove filter)</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelection(EMPTY)}
              className="ml-1 min-h-9 type-body-sm text-link underline underline-offset-[0.2em] hover:text-link-hover"
            >
              Clear all
            </button>
          </div>
        ) : null}

        {results.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-(--grid-gap) gap-y-8 md:grid-cols-3">
            {results.map((product, index) => (
              <ShopCard
                key={product.slug}
                product={product}
                badgeLabels={badgeLabels}
                priority={index < 2}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-md border border-border-divider bg-bg-raised px-6 py-16 text-center">
            <p className="type-h3 text-text-primary">
              No candles match those filters
            </p>
            <p className="mt-3 type-body text-text-secondary">
              Try removing a filter or two: the night is wide.
            </p>
            <button
              type="button"
              onClick={() => setSelection(EMPTY)}
              className={`mt-6 ${primaryButtonClasses({ glow: false })}`}
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Phones and tablets: the same filters in a sheet. */}
      <dialog
        ref={sheet}
        aria-labelledby="filter-sheet-heading"
        className="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-lg border border-border-divider bg-bg-overlay p-0 text-text-primary backdrop:bg-night-950/70 lg:hidden"
        onClick={(event) => {
          if (event.target === event.currentTarget) sheet.current?.close();
        }}
      >
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between border-b border-border-divider px-5 py-4">
            <h2 id="filter-sheet-heading" className="type-h4">
              Filter
            </h2>
            <button
              type="button"
              onClick={() => sheet.current?.close()}
              className="inline-flex size-(--size-touch) items-center justify-center"
            >
              <CloseIcon className="size-5" />
              <span className="sr-only">Close filters</span>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <FilterGroups
              options={options}
              selection={selection}
              counts={counts}
              onToggle={toggle}
              idPrefix="sheet"
            />
          </div>
          <div className="flex gap-3 border-t border-border-divider px-5 py-4">
            <button
              type="button"
              onClick={() => setSelection(EMPTY)}
              className="min-h-12 flex-1 rounded-pill border border-border-control type-button text-text-primary"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => sheet.current?.close()}
              className={`flex-1 ${primaryButtonClasses({ glow: false })}`}
            >
              Show {results.length}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
