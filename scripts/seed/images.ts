import { existsSync } from "node:fs";

import type { ProductInput } from "../../lib/types";
import {
  imageSize,
  LIFESTYLE_CROP_TOP,
  shot,
  type CatalogJson,
} from "./catalog";
import { fileImageSize, type PixelSize } from "./image-size";

/**
 * Where every generated image goes (art-direction §9.2), as plain data: the asset step
 * (npm run images:build) makes the files, the seed uploads and checks them. Paths are relative
 * to the repo root.
 */

/** A hero or collection mood image, exported from its PNG original to /public as JPEG. */
export type PublicExport = {
  id: string;
  source: string;
  target: string;
  size: PixelSize;
};

/** A lif-* crop: full width, the top 6.25% of its col-* original removed. */
export type LifestyleCrop = {
  id: string;
  source: string;
  target: string;
  top: number;
  size: PixelSize;
};

/** One Storage object: a product image file at its storagePath (lif-comet-season twice). */
export type StorageUpload = {
  id: string;
  file: string;
  storagePath: string;
  contentType: string;
  size: PixelSize;
};

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
};

export function contentTypeOf(path: string): string {
  const type = CONTENT_TYPES[path.split(".").pop() ?? ""];
  if (!type) throw new Error(`no image content type for ${path}`);
  return type;
}

/** Public shots with a generated original; the others (brand-story, on hold) are skipped. */
export function publicExports(json: CatalogJson): {
  exports: PublicExport[];
  skipped: string[];
} {
  const exports: PublicExport[] = [];
  const skipped: string[] = [];
  for (const s of json.publicShots) {
    const id = String(s.id);
    if (!json.sizes.has(id)) {
      skipped.push(id);
      continue;
    }
    exports.push({
      id,
      source: String(s.original),
      target: String(s.deliveredPath),
      size: imageSize(json, id),
    });
  }
  return { exports, skipped };
}

export function lifestyleCrops(json: CatalogJson): LifestyleCrop[] {
  return json.derivedShots.map((d) => {
    const id = String(d.id);
    const from = shot(json.shots, d.from);
    const original = imageSize(json, String(d.from));
    const size = imageSize(json, id);
    return {
      id,
      source: String(from.original),
      target: String(d.original),
      top: original.height - size.height,
      size,
    };
  });
}

/** Every image of the given products, at its storagePath, from its shot's original file. */
export function storageUploads(
  json: CatalogJson,
  products: readonly ProductInput[],
): StorageUpload[] {
  return products.flatMap((p) =>
    p.images.map((image) => ({
      id: image.id,
      file: String(shot(json.shots, image.id).original),
      storagePath: image.storagePath,
      contentType: contentTypeOf(image.storagePath),
      size: { width: image.width, height: image.height },
    })),
  );
}

/** art-direction §9.3 minimums: shot-list minResolution; a lif-* crop keeps 93.75% of its original's. */
export function minimumSize(json: CatalogJson, id: string): PixelSize {
  const s = shot(json.shots, id);
  if (s.from !== undefined) {
    const from = minimumSize(json, String(s.from));
    return {
      width: from.width,
      height: Math.round(from.height * (1 - LIFESTYLE_CROP_TOP)),
    };
  }
  const match = /^(\d+) x (\d+)$/.exec(String(s.minResolution));
  if (!match) throw new Error(`${id}: no minResolution`);
  return { width: Number(match[1]), height: Number(match[2]) };
}

/**
 * The generated originals (every manifest shot with a size: cat-*, col-*, hero-*). assets/ is
 * local only (git-ignored except manifest.json, M1.8 §1.3), so a fresh clone has the manifest
 * but none of these files. Returns the fix, or null when every original is present.
 */
export function missingOriginalsMessage(json: CatalogJson): string | null {
  const files = [...json.sizes.keys()].map((id) =>
    String(shot(json.shots, id).original),
  );
  const missing = files.filter((file) => !existsSync(file));
  if (missing.length === 0) return null;
  return (
    `${missing.length} of ${files.length} image originals are missing (first: ${missing[0]}). ` +
    "assets/ is local only (git-ignored; only assets/images/manifest.json is committed): copy " +
    "assets/images/ from a machine that has the generated originals, then run `npm run images:build`."
  );
}

/** Checks a delivered file's header size. Returns the problem, or null. */
export function fileProblem(
  file: string,
  expected: PixelSize,
  minimum: PixelSize,
): string | null {
  if (!existsSync(file)) return `${file}: missing`;
  let actual: PixelSize;
  try {
    actual = fileImageSize(file);
  } catch (error) {
    return `${file}: ${error instanceof Error ? error.message : String(error)}`;
  }
  if (actual.width !== expected.width || actual.height !== expected.height) {
    return `${file}: ${actual.width} × ${actual.height}, expected ${expected.width} × ${expected.height}`;
  }
  if (actual.width < minimum.width || actual.height < minimum.height) {
    return `${file}: ${actual.width} × ${actual.height} is under the minimum ${minimum.width} × ${minimum.height}`;
  }
  return null;
}
