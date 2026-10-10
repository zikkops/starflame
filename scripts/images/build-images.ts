/**
 * The image asset step (M1.8, art-direction §9): `npm run images:build`. Dev-only; uses sharp.
 *   - the 6 lif-* crops: each col-* original, full width, the top 6.25% removed, as PNG at
 *     assets/images/product-lifestyle/<id>.png (shot-list derived[].original; adaptive filtering,
 *     about 4.2 MB each instead of 6.5 MB);
 *   - the hero and collection images as high-quality JPEG in public/images/{hero,collections}
 *     (quality 90, 4:4:4 chroma, sRGB), at the original size.
 * Then it reads every output's header (PNG IHDR / JPEG SOF) and fails on a size that differs
 * from the manifest-derived one or is under the §9.3 minimum. A file whose bytes would not
 * change is left alone, so a re-run doesn't touch the working tree. Shots without a generated
 * original (brand-story, on hold) are skipped and listed. The originals are local only
 * (assets/ is git-ignored except manifest.json): without them it stops with the fix.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

import sharp from "sharp";

import { loadCatalogJson } from "../seed/catalog";
import {
  fileProblem,
  lifestyleCrops,
  minimumSize,
  missingOriginalsMessage,
  publicExports,
} from "../seed/images";

/** Writes only when the bytes differ. Returns whether it wrote. */
function writeIfChanged(file: string, bytes: Buffer): boolean {
  try {
    if (readFileSync(file).equals(bytes)) return false;
  } catch {
    // missing: write it
  }
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, bytes);
  return true;
}

async function main(): Promise<void> {
  const json = loadCatalogJson();
  // A fresh clone has manifest.json but no originals (assets/ is local only).
  const noOriginals = missingOriginalsMessage(json);
  if (noOriginals) throw new Error(noOriginals);
  const problems: string[] = [];
  let written = 0;
  let unchanged = 0;
  const record = (file: string, changed: boolean) => {
    if (changed) written += 1;
    else unchanged += 1;
    console.log(`${changed ? "wrote    " : "unchanged"} ${file}`);
  };

  for (const crop of lifestyleCrops(json)) {
    const bytes = await sharp(crop.source)
      .extract({ left: 0, top: crop.top, ...crop.size })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    record(crop.target, writeIfChanged(crop.target, bytes));
    const problem = fileProblem(
      crop.target,
      crop.size,
      minimumSize(json, crop.id),
    );
    if (problem) problems.push(problem);
  }

  const { exports, skipped } = publicExports(json);
  for (const image of exports) {
    const bytes = await sharp(image.source)
      .toColourspace("srgb")
      .jpeg({ quality: 90, chromaSubsampling: "4:4:4", mozjpeg: true })
      .toBuffer();
    record(image.target, writeIfChanged(image.target, bytes));
    const problem = fileProblem(
      image.target,
      image.size,
      minimumSize(json, image.id),
    );
    if (problem) problems.push(problem);
  }

  console.log(
    `\nimages:build: ${written} written, ${unchanged} unchanged` +
      (skipped.length > 0
        ? `; skipped (no original): ${skipped.join(", ")}`
        : ""),
  );
  if (problems.length > 0) {
    throw new Error(`size check failed:\n  ${problems.join("\n  ")}`);
  }
  console.log("ok - every output's header size matches the manifest");
}

main().catch((error: unknown) => {
  console.error("not ok -", error instanceof Error ? error.message : error);
  process.exit(1);
});
