import { readFileSync } from "node:fs";
import path from "node:path";

import {
  parseCollectionInput,
  parseProductInput,
} from "../../lib/domain/schemas";
import type { CollectionInput, ProductInput } from "../../lib/types";

/**
 * Maps design/copy/catalog.json + design/art/shot-list.json (plus the image sizes in
 * assets/images/manifest.json) to the domain inputs. The seed (npm run seed, M1.8) writes these;
 * the unit, rules and repository tests use the same mapping (moved here from tests/unit/fixtures
 * in M1.8). Everything goes through the guards, so a catalog edit that breaks a type fails here.
 * Paths are relative to the repo root: npm scripts run there.
 */

type Json = Record<string, unknown>;
type ImageSize = { width: number; height: number };

/** Every catalog.json key, mapped or deliberately dropped. A new key fails the tests (spec §6). */
export const CATALOG_KEYS = {
  product: [
    "slug",
    "name",
    "type",
    "collection",
    "alsoIn",
    "shortDescription",
    "longDescription",
    "scentFamily",
    "scentNotes",
    "variants",
    "badges",
    "careNotesRef",
    "giftSetContents",
    "images",
    "sortOrder",
  ],
  variant: [
    "sku",
    "label",
    "weightGrams",
    "dimensionsCm",
    "price",
    "burnTimeHours",
    "warmTimeHoursPerPiece",
    "pieces",
  ],
  collection: [
    "slug",
    "name",
    "tagline",
    "description",
    "moodNote",
    "isLimited",
    "sortOrder",
    "images",
  ],
} as const;

/** shot-list.json derived lif-* crops: full width, the top 6.25% of the height removed. */
export const LIFESTYLE_CROP_TOP = 0.0625;

function readJson(file: string): Json {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), file), "utf8"),
  ) as Json;
}

function records(value: unknown): Json[] {
  if (!Array.isArray(value)) throw new Error("expected an array");
  return value as Json[];
}

export function loadCatalogJson() {
  const catalog = readJson("design/copy/catalog.json");
  const shotList = readJson("design/art/shot-list.json");
  const manifest = readJson("assets/images/manifest.json");
  const shots = new Map<string, Json>();
  for (const s of [...records(shotList.shots), ...records(shotList.derived)]) {
    shots.set(String(s.id), s);
  }
  /** Pixel sizes of the generated originals (cat-*, col-*), keyed by shot ID. */
  const sizes = new Map<string, ImageSize>();
  for (const [id, m] of Object.entries(
    manifest.shots as Record<string, Json>,
  )) {
    if (typeof m.width === "number" && typeof m.height === "number") {
      sizes.set(id, { width: m.width, height: m.height });
    }
  }
  /** Manifest review status per generated shot ("accepted" or "flagged"). */
  const statuses = new Map<string, string>();
  for (const [id, m] of Object.entries(
    manifest.shots as Record<string, Json>,
  )) {
    statuses.set(id, String(m.status));
  }
  return {
    products: records(catalog.products),
    collections: records(catalog.collections),
    scentFamilies: records(catalog.scentFamilies),
    publicShots: records(shotList.shots).filter(
      (s) => s.deliverTo === "public",
    ),
    derivedShots: records(shotList.derived),
    shots,
    sizes,
    statuses,
  };
}

export type CatalogJson = ReturnType<typeof loadCatalogJson>;

export function shot(shots: Map<string, Json>, id: unknown): Json {
  const s = shots.get(String(id));
  if (!s) throw new Error(`shot-list.json has no ${String(id)}`);
  return s;
}

/**
 * Pixel size of a delivered image, never a constant. Originals (cat-* PNGs; col-* mood images,
 * which M1.8 exports to /public as JPEG at the original size) come from manifest.json. A derived
 * lif-* crop (made by M1.8) keeps its `from` original's width and loses the top 6.25% of the
 * height: 1744 × 2336 → 1744 × 2190. M1.8 reads each delivered file's header (PNG IHDR, JPEG
 * SOF) and fails if it differs from this.
 */
export function imageSize(json: CatalogJson, id: string): ImageSize {
  const original = json.sizes.get(id);
  if (original) return original;
  const s = shot(json.shots, id);
  const from = json.sizes.get(String(s.from));
  if (!from || !String(s.crop).includes("top 6.25%")) {
    throw new Error(`no size for ${id}: unknown original or crop`);
  }
  return {
    width: from.width,
    height: Math.round(from.height * (1 - LIFESTYLE_CROP_TOP)),
  };
}

/** shot-list deliveredPath is a string, or one path per product (lif-comet-season). */
function storagePathFor(s: Json, slug: string): unknown {
  const paths = Array.isArray(s.deliveredPath)
    ? s.deliveredPath
    : [s.deliveredPath];
  return paths.find(
    (p): p is string =>
      typeof p === "string" && p.startsWith(`products/${slug}/`),
  );
}

export function toProductInputRaw(raw: Json, json: CatalogJson): unknown {
  const images = raw.images as { catalog: unknown; lifestyle: unknown[] };
  const slug = String(raw.slug);
  const image = (id: unknown, role: "catalog" | "lifestyle") => {
    const s = shot(json.shots, id);
    return {
      id,
      storagePath: storagePathFor(s, slug),
      alt: s.alt,
      role,
      ...imageSize(json, String(id)),
    };
  };
  return {
    slug: raw.slug,
    name: raw.name,
    type: raw.type,
    collection: raw.collection,
    alsoIn: raw.alsoIn,
    shortDescription: raw.shortDescription,
    longDescription: raw.longDescription,
    scentFamily: raw.scentFamily,
    scentNotes: raw.scentNotes,
    variants: records(raw.variants).map((v) => ({ ...v, available: true })),
    badges: raw.badges,
    careKey: String(raw.careNotesRef).replace(/^care\./, ""),
    giftSetContents: raw.giftSetContents,
    images: [
      image(images.catalog, "catalog"),
      ...images.lifestyle.map((id) => image(id, "lifestyle")),
    ],
    sortOrder: raw.sortOrder,
    status: "published",
  };
}

export function toCollectionInputRaw(raw: Json, json: CatalogJson): unknown {
  const id = String((raw.images as { mood: unknown }).mood);
  const s = shot(json.shots, id);
  return {
    slug: raw.slug,
    name: raw.name,
    tagline: raw.tagline,
    description: raw.description,
    // moodNote is an art brief, never rendered (catalog.md §6): not stored.
    isLimited: raw.isLimited,
    sortOrder: raw.sortOrder,
    moodImage: { src: s.servedUrl, alt: s.alt, ...imageSize(json, id) },
    status: "published",
  };
}

export function catalogProductInputs(): ProductInput[] {
  const json = loadCatalogJson();
  return json.products.map((p) =>
    parseProductInput(toProductInputRaw(p, json)),
  );
}

export function catalogCollectionInputs(): CollectionInput[] {
  const json = loadCatalogJson();
  return json.collections.map((c) =>
    parseCollectionInput(toCollectionInputRaw(c, json)),
  );
}
