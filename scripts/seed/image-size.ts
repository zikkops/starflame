import { openSync, readSync, closeSync } from "node:fs";

/**
 * Pixel size from an image file's own header, with no image library (M1.4 §1 Images). The seed
 * and the asset step compare it with the size the catalog mapping derives from manifest.json.
 */
export type PixelSize = { width: number; height: number };

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

/** PNG: the IHDR chunk comes first; width and height are big-endian uint32 at bytes 16–23. */
export function pngSize(head: Buffer): PixelSize {
  if (
    head.length < 24 ||
    !head.subarray(0, 8).equals(PNG_SIGNATURE) ||
    head.toString("latin1", 12, 16) !== "IHDR"
  ) {
    throw new Error("not a PNG (no signature or IHDR)");
  }
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

/** SOF0–SOF15 except DHT (C4), JPG (C8) and DAC (CC): the frame header holds the size. */
const isSof = (marker: number) =>
  marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);

/**
 * JPEG: walk the marker segments from SOI to the first SOF; after the marker come the segment
 * length (2), precision (1), then height and width as big-endian uint16.
 */
export function jpegSize(data: Buffer): PixelSize {
  if (data.length < 4 || data[0] !== 0xff || data[1] !== 0xd8) {
    throw new Error("not a JPEG (no SOI)");
  }
  let offset = 2;
  while (offset + 4 <= data.length) {
    if (data[offset] !== 0xff) throw new Error("JPEG: bad marker");
    const marker = data[offset + 1]!;
    if (marker === 0xff) {
      offset += 1; // fill byte
      continue;
    }
    if (marker === 0xd9 || marker === 0xda) break; // EOI or SOS before any SOF
    const length = data.readUInt16BE(offset + 2);
    if (isSof(marker)) {
      if (offset + 9 > data.length) break;
      return {
        height: data.readUInt16BE(offset + 5),
        width: data.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + length;
  }
  throw new Error("JPEG: no SOF segment in the header");
}

/** Reads only the first bytes of a file (the PNG IHDR, or the JPEG segments before SOF). */
export function fileImageSize(file: string, headBytes = 256 * 1024): PixelSize {
  const fd = openSync(file, "r");
  try {
    const head = Buffer.alloc(headBytes);
    const read = readSync(fd, head, 0, headBytes, 0);
    const bytes = head.subarray(0, read);
    return file.endsWith(".png") ? pngSize(bytes) : jpegSize(bytes);
  } finally {
    closeSync(fd);
  }
}
