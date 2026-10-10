import { parseProductInput } from "../../lib/domain/schemas";
import type { ProductInput, PublishStatus } from "../../lib/types";

/**
 * Seed-only fixtures (M1.8): one draft and one archived product, so repository and (M7) admin
 * work can see unpublished documents in the emulator. Not design data, so not in catalog.json.
 * Each is a copy of an approved catalog product (its copy, notes and variants), with its own
 * slug and SKUs, a "(draft fixture)" / "(archived fixture)" name suffix and a status. Their
 * image refs point under their own products/<slug>/ folder, where the seed uploads nothing and
 * deletes anything it finds (M1.5 §1: a file under products/ is public by exact path).
 */
export const FIXTURES = [
  {
    slug: "fixture-draft-tin",
    from: "late-bloom", // a tin, one variant
    status: "draft",
    badges: [],
    label: "draft fixture",
  },
  {
    slug: "fixture-archived-bestseller",
    from: "midnight-balcony", // a jar in moonlit-terrace
    status: "archived",
    badges: ["bestseller"], // an archived bestseller must not reach getBestsellers
    label: "archived fixture",
  },
] as const satisfies readonly {
  slug: string;
  from: string;
  status: Exclude<PublishStatus, "published">;
  badges: readonly string[];
  label: string;
}[];

export const FIXTURE_SORT_ORDER_BASE = 900;

/** Builds the fixtures from the parsed catalog products, through the product guard. */
export function fixtureProductInputs(
  catalog: readonly ProductInput[],
): ProductInput[] {
  return FIXTURES.map((f, index) => {
    const base = catalog.find((p) => p.slug === f.from);
    if (!base)
      throw new Error(`fixture ${f.slug}: no catalog product ${f.from}`);
    return parseProductInput({
      ...base,
      slug: f.slug,
      name: `${base.name} (${f.label})`,
      badges: f.badges,
      variants: base.variants.map((v) => ({
        ...v,
        sku: `${f.slug}${v.sku.slice(base.slug.length)}`,
      })),
      images: base.images
        .filter((i) => i.role === "catalog")
        .map((i) => ({
          ...i,
          storagePath: i.storagePath.replace(
            `products/${base.slug}/`,
            `products/${f.slug}/`,
          ),
        })),
      sortOrder: FIXTURE_SORT_ORDER_BASE + index,
      status: f.status,
    });
  });
}
