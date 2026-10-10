import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { loadCatalogJson } from "../../scripts/seed/catalog";
import { FIXTURES } from "../../scripts/seed/fixtures";
import { jpegSize, pngSize } from "../../scripts/seed/image-size";
import {
  contentTypeOf,
  lifestyleCrops,
  minimumSize,
  publicExports,
} from "../../scripts/seed/images";
import { buildSeedData, seedFileProblems } from "../../scripts/seed/seed";

/** A PNG signature + IHDR header of the given size (the rest of the file is not read). */
function pngHead(width: number, height: number): Buffer {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write("IHDR", 12, "latin1");
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  return b;
}

/** SOI, an APP0 segment, then a SOF segment (marker C0 baseline or C2 progressive). */
function jpegHead(marker: number, width: number, height: number): Buffer {
  const app0 = Buffer.from([0xff, 0xe0, 0x00, 0x06, 0x4a, 0x46, 0x49, 0x46]);
  const sof = Buffer.alloc(19);
  sof.writeUInt8(0xff, 0);
  sof.writeUInt8(marker, 1);
  sof.writeUInt16BE(17, 2);
  sof.writeUInt8(8, 4);
  sof.writeUInt16BE(height, 5);
  sof.writeUInt16BE(width, 7);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), app0, sof]);
}

describe("image header sizes", () => {
  it("reads a PNG IHDR", () => {
    assert.deepEqual(pngSize(pngHead(1744, 2190)), {
      width: 1744,
      height: 2190,
    });
    assert.throws(
      () => pngSize(Buffer.from("not a png at all, no.....")),
      /not a PNG/,
    );
  });

  it("reads a baseline and a progressive JPEG SOF, after other segments", () => {
    assert.deepEqual(jpegSize(jpegHead(0xc0, 2688, 1520)), {
      width: 2688,
      height: 1520,
    });
    assert.deepEqual(jpegSize(jpegHead(0xc2, 1744, 2336)), {
      width: 1744,
      height: 2336,
    });
    // DHT (C4) is not a frame header.
    assert.throws(() => jpegSize(jpegHead(0xc4, 1, 1)), /no SOF/);
    assert.throws(
      () => jpegSize(Buffer.from([0x00, 0x01, 0x02, 0x03])),
      /no SOI/,
    );
  });
});

describe("seed image plan", () => {
  const json = loadCatalogJson();

  it("crops each lif-* from its col-* original: full width, the top 146 of 2336 px removed", () => {
    const crops = lifestyleCrops(json);
    assert.equal(crops.length, 6);
    for (const c of crops) {
      assert.match(c.source, /^assets\/images\/collection\/col-[a-z-]+\.png$/);
      assert.equal(c.target, `assets/images/product-lifestyle/${c.id}.png`);
      assert.equal(c.top, 146);
      assert.deepEqual(c.size, { width: 1744, height: 2190 });
      assert.deepEqual(minimumSize(json, c.id), { width: 1500, height: 1875 });
    }
  });

  it("exports the heroes and the collection images to /public as JPEG; brand-story is skipped", () => {
    const { exports, skipped } = publicExports(json);
    assert.deepEqual(skipped, ["brand-story"]);
    assert.equal(exports.length, 8);
    for (const e of exports) {
      assert.match(
        e.target,
        /^public\/images\/(hero|collections)\/[a-z-]+\.jpg$/,
      );
      assert.equal(contentTypeOf(e.target), "image/jpeg");
    }
  });

  it("uploads 17 catalog + 7 lifestyle objects as PNG, none for the fixtures", () => {
    const data = buildSeedData(json);
    assert.equal(data.uploads.length, 24);
    assert.equal(
      data.uploads.filter((u) => u.id.startsWith("cat-")).length,
      17,
    );
    assert.deepEqual(
      data.uploads
        .filter((u) => u.id === "lif-comet-season")
        .map((u) => u.storagePath),
      [
        "products/gilded-plum/lif-comet-season.png",
        "products/comet-tail/lif-comet-season.png",
      ],
    );
    for (const u of data.uploads) assert.equal(u.contentType, "image/png");
    for (const f of FIXTURES) {
      assert.ok(
        !data.uploads.some((u) => u.storagePath.includes(`/${f.slug}/`)),
      );
    }
    assert.deepEqual(seedFileProblems(data), []);
  });
});
