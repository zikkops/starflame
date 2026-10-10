// Dev-only: outlines "Starflames" from Pinyon Script into components/brand/wordmark-path.ts.
// Run: npm run wordmark:build            (uses the vendored woff2)
//      npm run wordmark:build -- --download   (refreshes the woff2 from Google Fonts first)
// Uses the fontkit bundled inside Next (an internal API). App code never imports it.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

import { format, resolveConfig } from "prettier";

const TEXT = "Starflames";
const FEATURES = ["kern", "calt"]; // on top of fontkit's defaults (liga, ...)
const SCALE = 0.5; // viewBox units per font unit (UPM 2048 -> 1024); integers after rounding
const STROKE_AT_PX = 28; // the stroke renders 1 CSS px when the wordmark is this tall
const CSS_API =
  "https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap";
// A current Chrome UA, so the CSS API answers with woff2 URLs.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0 Safari/537.36";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const fontFile = join(here, "vendor", "PinyonScript-latin.woff2");
const outFile = join(root, "components", "brand", "wordmark-path.ts");

// Minimal typing of the bundled fontkit (it ships no .d.ts).
type PathCommand = {
  command:
    "moveTo" | "lineTo" | "quadraticCurveTo" | "bezierCurveTo" | "closePath";
  args: number[];
};
type GlyphPath = { commands: PathCommand[] };
type Run = {
  glyphs: { path: GlyphPath }[];
  positions: { xAdvance: number; xOffset: number; yOffset: number }[];
};
type Font = {
  unitsPerEm: number;
  postscriptName: string;
  version: string;
  layout: (text: string, features: string[]) => Run;
};
const require = createRequire(import.meta.url);
const fontkit = require("next/dist/compiled/@next/font/dist/fontkit") as {
  default: (buffer: Buffer) => Font;
};

async function download(): Promise<void> {
  const css = await (
    await fetch(CSS_API, { headers: { "user-agent": UA } })
  ).text();
  const url = /\/\* latin \*\/[^}]*?url\((https:[^)]+\.woff2)\)/.exec(css)?.[1];
  if (!url)
    throw new Error("latin woff2 URL not found in the Google Fonts CSS");
  const bytes = Buffer.from(await (await fetch(url)).arrayBuffer());
  writeFileSync(fontFile, bytes);
  console.log(`downloaded ${url} (${bytes.length} B)`);
}

/** Absolute font-unit commands -> one compact relative path in viewBox units. */
function toPath(commands: PathCommand[], dx: number, dy: number): string {
  // y is flipped (font units point up, SVG down) and every point is rounded once,
  // as an absolute value, so relative steps never accumulate rounding error.
  const pt = (x: number, y: number): [number, number] => [
    Math.round((x + dx) * SCALE),
    Math.round((dy - y) * SCALE),
  ];
  let out = "";
  let last = "";
  let [cx, cy] = [0, 0];
  let [sx, sy] = [0, 0];
  const num = (n: number): string => {
    const s = String(n);
    // A minus sign separates numbers on its own; otherwise a space (or nothing after a letter).
    return out.length === 0 || /[a-z]$/i.test(out) || s.startsWith("-")
      ? s
      : ` ${s}`;
  };
  const emit = (letter: string, points: [number, number][]): void => {
    if (letter !== last || letter === "m") out += letter;
    last = letter;
    // Every point of a segment (control points too) is relative to the segment start.
    for (const [x, y] of points) {
      out += num(x - cx);
      out += num(y - cy);
    }
  };
  for (const { command, args } of commands) {
    if (command === "closePath") {
      out += "z";
      last = "z";
      [cx, cy] = [sx, sy];
      continue;
    }
    const points: [number, number][] = [];
    for (let i = 0; i < args.length; i += 2)
      points.push(pt(args[i]!, args[i + 1]!));
    const end = points[points.length - 1]!;
    if (command === "moveTo") {
      emit("m", points);
      [sx, sy] = end;
    } else if (command === "lineTo") {
      emit("l", points);
    } else if (command === "quadraticCurveTo") {
      emit("q", points);
    } else {
      emit("c", points);
    }
    [cx, cy] = end;
  }
  return out;
}

async function main(): Promise<void> {
  if (process.argv.includes("--download")) await download();
  const bytes = readFileSync(fontFile);
  const font = fontkit.default(bytes);
  const run = font.layout(TEXT, FEATURES);

  // Place each glyph along the baseline (font units).
  const commands: PathCommand[] = [];
  let x = 0;
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i]!;
    for (const c of glyph.path.commands) {
      commands.push({
        command: c.command,
        args: c.args.map(
          (v, j) => v + (j % 2 === 0 ? x + pos.xOffset : pos.yOffset),
        ),
      });
    }
    x += pos.xAdvance;
  });

  // Tight ink bounds from the on-curve and control points (quadratic control points
  // can sit slightly outside the ink, which only adds a hair of margin).
  const xs = commands.flatMap((c) => c.args.filter((_, j) => j % 2 === 0));
  const ys = commands.flatMap((c) => c.args.filter((_, j) => j % 2 === 1));
  const [minX, maxX, minY, maxY] = [
    Math.min(...xs),
    Math.max(...xs),
    Math.min(...ys),
    Math.max(...ys),
  ];
  const inkH = Math.round((maxY - minY) * SCALE);
  const stroke = Math.round(inkH / STROKE_AT_PX);
  const pad = Math.ceil(stroke / 2); // the stroke's outer half, so it is never clipped
  const d = toPath(commands, -minX + pad / SCALE, maxY + pad / SCALE);
  const width = Math.round((maxX - minX) * SCALE) + 2 * pad;
  const height = inkH + 2 * pad;

  const sha = createHash("sha256").update(bytes).digest("hex");
  const source = `// GENERATED by scripts/wordmark/build-wordmark.ts. Do not edit by hand.
// "${TEXT}" in ${font.postscriptName} (${font.version.split(";")[0]}), features ${FEATURES.join(", ")}.
// Source woff2 sha256 ${sha}.
// The outlines are artwork made from an OFL font (scripts/wordmark/vendor/OFL.txt).

export const WORDMARK_VIEWBOX = "0 0 ${width} ${height}";
export const WORDMARK_WIDTH = ${width};
export const WORDMARK_HEIGHT = ${height};
/** Hairline thickening: ${stroke} viewBox units = 1 CSS px at ${STROKE_AT_PX}px tall. */
export const WORDMARK_STROKE = ${stroke};
export const WORDMARK_PATH =
  "${d}";
`;
  const config = (await resolveConfig(outFile)) ?? {};
  writeFileSync(
    outFile,
    await format(source, { ...config, filepath: outFile }),
  );
  console.log(
    `${run.glyphs.length} glyphs, viewBox 0 0 ${width} ${height}, stroke ${stroke}, ` +
      `path ${d.length} B (${gzipSync(d).length} B gzipped) -> ${outFile}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
