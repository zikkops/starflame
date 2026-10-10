import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, describe, it } from "node:test";
import { pathToFileURL } from "node:url";

import { deleteApp } from "firebase-admin/app";
import type { DocumentData } from "firebase-admin/firestore";

import {
  getAdminApp,
  getAdminFirestore,
  getAdminStorage,
} from "../../lib/firebase/admin";
import {
  readBestsellers,
  readCollections,
  readGiftSetContents,
  readProductBySlug,
  readProducts,
  readPublishedProductSlugs,
  type CatalogSource,
} from "../../lib/firebase/repositories/catalog-reads";
import { storageObjectUrl } from "../../lib/firebase/storage-url";
import { pngSize } from "../../scripts/seed/image-size";
import { FIXTURES } from "../../scripts/seed/fixtures";
import {
  buildSeedData,
  OBJECT_CACHE_CONTROL,
  runSeed,
  SEED_TIME,
  type SeedSummary,
} from "../../scripts/seed/seed";

/**
 * The seed against the Firestore and Storage emulators (`npm run test:seed`, emulators:exec):
 * run twice (idempotent), then the documents, the Storage objects, the fixtures, the CLI guards,
 * and the repositories over the seeded data.
 */

if (!process.env.FIREBASE_EMULATOR_HUB) {
  throw new Error(
    "Run the seed tests with `npm run test:seed` (firebase emulators:exec).",
  );
}
// The seed CLI's env source when there is no .env.local; never overrides emulators:exec's hosts.
process.loadEnvFile(".env.example");

const require = createRequire(import.meta.url);
const tsxCli = require.resolve("tsx/cli");
const md5 = (bytes: Buffer) => createHash("md5").update(bytes).digest("base64");

type Dump = Record<string, DocumentData>;
async function dumpCatalog(): Promise<Dump> {
  const db = getAdminFirestore();
  const out: Dump = {};
  for (const name of ["products", "collections"]) {
    for (const doc of (await db.collection(name).get()).docs) {
      out[doc.ref.path] = doc.data();
    }
  }
  return out;
}

const data = buildSeedData();
let first: SeedSummary;
let second: SeedSummary;
let firstDump: Dump;
let secondDump: Dump;

before(async () => {
  first = await runSeed({ reset: true, clearCache: false });
  firstDump = await dumpCatalog();
  second = await runSeed({ clearCache: false });
  secondDump = await dumpCatalog();
});

after(async () => {
  await deleteApp(getAdminApp());
});

describe("seed: idempotent", () => {
  it("a second run writes the same documents and uploads nothing", () => {
    assert.deepEqual(secondDump, firstDump);
    assert.deepEqual(first.objects, {
      uploaded: 24,
      unchanged: 0,
      fixtureFilesRemoved: 0,
    });
    assert.deepEqual(second.objects, {
      uploaded: 0,
      unchanged: 24,
      fixtureFilesRemoved: 0,
    });
    assert.deepEqual(second.strayDocuments, []);
  });

  it("writes 17 published products, 1 draft, 1 archived and 6 collections", () => {
    assert.deepEqual(second.products, { published: 17, draft: 1, archived: 1 });
    assert.equal(second.collections, 6);
    const paths = Object.keys(secondDump);
    assert.equal(paths.filter((p) => p.startsWith("products/")).length, 19);
    assert.equal(paths.filter((p) => p.startsWith("collections/")).length, 6);
  });
});

describe("seed: documents", () => {
  it("stores Moonrise's derived fields and fixed timestamps", () => {
    const m = secondDump["products/moonrise"]!;
    assert.equal(m.status, "published");
    assert.equal(m.priceFrom, 3400);
    assert.equal(m.priceTo, 4800);
    assert.equal(m.currency, "USD");
    assert.deepEqual(m.sizeKeys, ["220g", "380g"]);
    assert.deepEqual(m.skus, ["moonrise-220", "moonrise-380"]);
    assert.deepEqual(m.collectionSlugs, ["moonlit-terrace"]);
    assert.deepEqual(m.scentFamilies, ["floral"]);
    assert.equal(m.inStock, true);
    assert.equal(m.giftSetValue, null);
    assert.deepEqual(m.cardImage, m.images[0]);
    assert.equal(m.createdAt.toDate().toISOString(), SEED_TIME.toISOString());
    assert.equal(m.updatedAt.toDate().toISOString(), SEED_TIME.toISOString());
    assert.equal(
      m.publishedAt.toDate().getTime(),
      SEED_TIME.getTime() + 60_000,
    );
  });

  it("stores the image refs: Storage paths, alt from shot-list.json, sizes from the manifest", () => {
    const shotList = JSON.parse(
      readFileSync("design/art/shot-list.json", "utf8"),
    ) as {
      shots: { id: string; alt: string }[];
      derived: { id: string; alt: string }[];
    };
    const alt = (id: string) =>
      [...shotList.shots, ...shotList.derived].find((s) => s.id === id)?.alt;
    assert.deepEqual(secondDump["products/moonrise"]!.images, [
      {
        id: "cat-moonrise",
        storagePath: "products/moonrise/cat-moonrise.png",
        alt: alt("cat-moonrise"),
        role: "catalog",
        width: 1792,
        height: 2240,
      },
      {
        id: "lif-moonrise",
        storagePath: "products/moonrise/lif-moonrise.png",
        alt: alt("lif-moonrise"),
        role: "lifestyle",
        width: 1744,
        height: 2190,
      },
    ]);
    for (const slug of ["comet-tail", "gilded-plum"]) {
      const lif = (
        secondDump[`products/${slug}`]!.images as {
          id: string;
          storagePath: string;
        }[]
      )[1];
      assert.equal(lif?.storagePath, `products/${slug}/lif-comet-season.png`);
    }
  });

  it("derives gift sets from their contents", () => {
    const g = secondDump["products/reading-nook-set"]!;
    assert.deepEqual(g.collectionSlugs, ["gift-sets", "starlit-library"]);
    assert.deepEqual(g.scentFamilies, ["woody", "gourmand"]);
    assert.deepEqual(g.giftSetValue, { amount: 6800, currency: "USD" });
  });

  it("stores collections with their /public mood image", () => {
    const c = secondDump["collections/moonlit-terrace"]!;
    assert.deepEqual(c.moodImage, {
      src: "/images/collections/col-moonlit-terrace.jpg",
      alt: c.moodImage.alt,
      width: 1744,
      height: 2336,
    });
    assert.ok(existsSync("public/images/collections/col-moonlit-terrace.jpg"));
    assert.equal(c.createdAt.toDate().toISOString(), SEED_TIME.toISOString());
  });
});

describe("seed: Storage", () => {
  it("uploads 24 objects with their content type, size, md5 and cache control", async () => {
    const bucket = getAdminStorage().bucket();
    assert.equal(data.uploads.length, 24);
    for (const u of data.uploads) {
      const bytes = readFileSync(u.file);
      const [meta] = await bucket.file(u.storagePath).getMetadata();
      assert.equal(meta.contentType, "image/png", u.storagePath);
      assert.equal(Number(meta.size), bytes.length, u.storagePath);
      assert.equal(meta.md5Hash, md5(bytes), u.storagePath);
      assert.equal(meta.cacheControl, OBJECT_CACHE_CONTROL, u.storagePath);
    }
  });

  it("has no object under the fixtures' folders, and removes one planted there", async () => {
    const bucket = getAdminStorage().bucket();
    for (const f of FIXTURES) {
      const [files] = await bucket.getFiles({ prefix: `products/${f.slug}/` });
      assert.deepEqual(files, [], f.slug);
    }
    const planted = bucket.file(
      `products/${FIXTURES[0].slug}/cat-late-bloom.png`,
    );
    await planted.save(Buffer.from("x"), {
      resumable: false,
      contentType: "image/png",
    });
    const run = await runSeed({ clearCache: false });
    assert.equal(run.objects.fixtureFilesRemoved, 1);
    assert.equal((await planted.exists())[0], false);
  });

  it("keeps the fixture documents unpublished, with image refs but no files", () => {
    assert.equal(secondDump["products/fixture-draft-tin"]!.status, "draft");
    assert.equal(secondDump["products/fixture-draft-tin"]!.publishedAt, null);
    assert.equal(
      secondDump["products/fixture-archived-bestseller"]!.status,
      "archived",
    );
    assert.deepEqual(
      secondDump["products/fixture-archived-bestseller"]!.badges,
      ["bestseller"],
    );
  });
});

describe("repositories over the seeded data", () => {
  const src = (): CatalogSource => ({
    db: getAdminFirestore(),
    imageUrl: (path) => storageObjectUrl(path),
  });

  it("getProducts: 17 cards by sortOrder; slugs: 17", async () => {
    const cards = await readProducts(src());
    assert.equal(cards.length, 17);
    assert.deepEqual(
      cards.map((c) => c.sortOrder),
      [...cards.map((c) => c.sortOrder)].sort((a, b) => a - b),
    );
    assert.equal((await readPublishedProductSlugs(src())).length, 17);
  });

  it("getCollections: 6; getBestsellers: Moonrise and Ink & Cedar (not the archived fixture)", async () => {
    assert.equal((await readCollections(src())).length, 6);
    const best = await readBestsellers(src(), 50);
    assert.deepEqual(
      best.map((c) => c.slug),
      ["moonrise", "ink-and-cedar"],
    );
  });

  it("drafts and archived products are not found", async () => {
    for (const f of FIXTURES)
      assert.equal(await readProductBySlug(src(), f.slug), null);
  });

  it("ProductDetail image URLs serve the seeded PNG at its stored size", async () => {
    const detail = await readProductBySlug(src(), "comet-tail");
    assert.ok(detail);
    for (const image of detail.images) {
      assert.equal(image.src, storageObjectUrl(image.storagePath));
      const res = await fetch(image.src); // anonymous: the public get rule (M1.5)
      assert.equal(res.status, 200, image.src);
      assert.equal(res.headers.get("content-type"), "image/png");
      const size = pngSize(Buffer.from(await res.arrayBuffer()));
      assert.deepEqual(size, { width: image.width, height: image.height });
    }
  });

  it("gift-set contents resolve to the seeded cards", async () => {
    const detail = await readProductBySlug(src(), "comet-season-gift-box");
    assert.ok(detail);
    const lines = await readGiftSetContents(src(), detail);
    assert.deepEqual(
      lines.map((l) => l.product.slug),
      ["comet-tail", "gilded-plum"],
    );
  });
});

describe("seed: stray documents, --reset and the Next cache", () => {
  it("keeps and reports a document it doesn't write; --reset removes it", async () => {
    const db = getAdminFirestore();
    await db.collection("products").doc("stray-doc").set({ status: "draft" });
    const kept = await runSeed({ clearCache: false });
    assert.deepEqual(kept.strayDocuments, ["products/stray-doc"]);
    const reset = await runSeed({ reset: true, clearCache: false });
    assert.deepEqual(reset.strayDocuments, []);
    assert.equal(
      (await db.collection("products").doc("stray-doc").get()).exists,
      false,
    );
    assert.equal(reset.objects.uploaded, 24);
  });

  it("clears both data-cache folders; the image cache only when an object changed", async () => {
    const root = mkdtempSync(join(tmpdir(), "starflames-seed-cache-"));
    try {
      const dirs = [
        ".next/cache/fetch-cache",
        ".next/dev/cache/fetch-cache",
        ".next/cache/images",
      ];
      for (const dir of dirs) {
        mkdirSync(join(root, dir), { recursive: true });
        writeFileSync(join(root, dir, "entry"), "x");
      }
      const run = await runSeed({ root });
      assert.equal(run.objects.uploaded, 0);
      assert.equal(existsSync(join(root, dirs[0]!)), false);
      assert.equal(existsSync(join(root, dirs[1]!)), false);
      assert.ok(statSync(join(root, dirs[2]!, "entry")).isFile());
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("seed CLI: emulators only", () => {
  const cli = (env: Record<string, string>, args: string[] = []) =>
    spawnSync(
      process.execPath,
      [tsxCli, "--conditions=react-server", "scripts/seed/index.ts", ...args],
      { env: { ...process.env, ...env }, encoding: "utf8" },
    );

  it("refuses a missing emulator host", () => {
    const r = cli({ FIRESTORE_EMULATOR_HOST: "" });
    assert.equal(r.status, 1);
    assert.match(r.stderr, /missing: FIRESTORE_EMULATOR_HOST/);
  });

  it("refuses an emulator host that isn't loopback, before any DNS lookup", () => {
    // tests/seed/forbid-dns.mjs reports (and fails) every DNS lookup in the process.
    const forbidDns = {
      NODE_OPTIONS: `--import=${pathToFileURL(resolve("tests/seed/forbid-dns.mjs")).href}`,
    };
    const control = spawnSync(
      process.execPath,
      ["-e", "require('node:dns').lookup('localhost', () => {})"],
      { env: { ...process.env, ...forbidDns }, encoding: "utf8" },
    );
    assert.match(control.stderr, /\[forbid-dns\] lookup localhost/);

    const r = cli({
      ...forbidDns,
      FIRESTORE_EMULATOR_HOST: "firestore.googleapis.com:443",
    });
    assert.equal(r.status, 1);
    assert.match(
      r.stderr,
      /Firestore emulator host "firestore\.googleapis\.com:443" is not a loopback address/,
    );
    assert.doesNotMatch(r.stderr, /forbid-dns/);
  });

  it("refuses a non-demo project, even with FIREBASE_ALLOW_NON_DEMO_PROJECT=true", () => {
    const r = cli({
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "real-project",
      FIREBASE_ALLOW_NON_DEMO_PROJECT: "true",
    });
    assert.equal(r.status, 1);
    assert.match(
      r.stderr,
      /emulators only; refusing non-demo project "real-project"/,
    );
  });

  // A successful CLI run clears the repo's Next cache (a running `next dev` included), so it is
  // left to scripts/e2e.ts, which runs `npm run seed`'s command before every e2e build.
  it("refuses an unknown argument", () => {
    const r = cli({}, ["--rest"]);
    assert.equal(r.status, 1);
    assert.match(r.stderr, /unknown argument --rest/);
  });
});
