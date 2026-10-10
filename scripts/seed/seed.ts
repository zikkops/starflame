import { createHash } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { connect } from "node:net";
import { join } from "node:path";

import type { WriteBatch } from "firebase-admin/firestore";
import type { Storage } from "firebase-admin/storage";

import {
  catalogProblems,
  deriveCatalog,
} from "../../lib/domain/derive-product";
import {
  parseCollectionInput,
  parseProductInput,
} from "../../lib/domain/schemas";
import { getAdminFirestore, getAdminStorage } from "../../lib/firebase/admin";
import { adminCollections } from "../../lib/firebase/converters.admin";
import { isDemoProjectId, type HostPort } from "../../lib/firebase/env.public";
import { readServerFirebaseEnv } from "../../lib/firebase/env.server";
import { COLLECTIONS } from "../../lib/firebase/paths";
import type { Collection, Product } from "../../lib/types";
import {
  loadCatalogJson,
  toCollectionInputRaw,
  toProductInputRaw,
  type CatalogJson,
} from "./catalog";
import { FIXTURES, fixtureProductInputs } from "./fixtures";
import {
  fileProblem,
  minimumSize,
  missingOriginalsMessage,
  publicExports,
  storageUploads,
  type StorageUpload,
} from "./images";

/**
 * The emulator seed (design/tech/M1.8-seed.md). `npm run seed` runs scripts/seed/index.ts,
 * which calls runSeed(). Everything is deterministic: re-running it gives the same documents
 * and objects, and unchanged Storage objects are not uploaded again.
 */

/** Every seeded document's createdAt/updatedAt. Fixed, so a re-seed changes nothing. */
export const SEED_TIME = new Date("2026-10-01T00:00:00.000Z");
const MINUTE = 60_000;
/** Storage emulator objects: next/image keeps them for max(minimumCacheTTL, max-age). */
export const OBJECT_CACHE_CONTROL = "public, max-age=3600";
const BATCH_LIMIT = 500;
const UPLOAD_CONCURRENCY = 4;

type Bucket = ReturnType<Storage["bucket"]>;

export type SeedData = {
  products: Product[];
  collections: Collection[];
  uploads: StorageUpload[];
  /** /public files the collections (and M2's hero) reference, with their checked sizes. */
  publicFiles: { id: string; file: string; width: number; height: number }[];
  /** Manifest shots marked "flagged": kept as dev placeholders, re-generate before launch. */
  flagged: string[];
  json: CatalogJson;
};

/** The documents and files to seed, built through the guards and deriveProductFields. */
export function buildSeedData(json: CatalogJson = loadCatalogJson()): SeedData {
  const catalog = json.products.map((p) =>
    parseProductInput(toProductInputRaw(p, json)),
  );
  const fixtures = fixtureProductInputs(catalog);
  const collectionInputs = json.collections.map((c) =>
    parseCollectionInput(toCollectionInputRaw(c, json)),
  );
  const problems = catalogProblems(
    [...catalog, ...fixtures],
    collectionInputs.map((c) => c.slug),
  );
  if (problems.length > 0) {
    throw new Error(`catalog problems:\n  ${problems.join("\n  ")}`);
  }
  const products: Product[] = deriveCatalog([...catalog, ...fixtures]).map(
    (p) => ({
      ...p,
      createdAt: SEED_TIME,
      updatedAt: SEED_TIME,
      // "Newest" sort: a later sortOrder was published later. Drafts were never published.
      publishedAt:
        p.status === "draft"
          ? null
          : new Date(SEED_TIME.getTime() + p.sortOrder * MINUTE),
    }),
  );
  const collections: Collection[] = collectionInputs.map((c) => ({
    ...c,
    createdAt: SEED_TIME,
    updatedAt: SEED_TIME,
  }));
  return {
    products,
    collections,
    // Fixtures are left out on purpose: no file under their folders.
    uploads: storageUploads(json, catalog),
    publicFiles: publicExports(json).exports.map((e) => ({
      id: e.id,
      file: e.target,
      ...e.size,
    })),
    flagged: [...json.statuses]
      .filter(([, status]) => status === "flagged")
      .map(([id]) => id)
      .sort(),
    json,
  };
}

/**
 * Every file problem (missing, wrong size, under the minimum), before anything is written. With
 * no originals (a fresh clone: assets/ is not in git) it is one problem that says how to fix it.
 */
export function seedFileProblems(data: SeedData): string[] {
  const noOriginals = missingOriginalsMessage(data.json);
  if (noOriginals) return [noOriginals];
  const files = new Map<string, string | null>();
  for (const u of data.uploads) {
    files.set(
      u.file,
      fileProblem(u.file, u.size, minimumSize(data.json, u.id)),
    );
  }
  for (const p of data.publicFiles) {
    files.set(p.file, fileProblem(p.file, p, minimumSize(data.json, p.id)));
  }
  return [...files.values()].filter((p): p is string => p !== null);
}

/** parseHostPort (M1.3) accepts only IPv4 addresses and host names; ::1 is listed for completeness. */
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

/**
 * The seed talks only to emulators on this machine: a host that isn't loopback (for example
 * firestore.googleapis.com:443) is refused from the string alone, before any DNS lookup.
 */
export function assertLoopback(name: string, { host, port }: HostPort): void {
  if (!LOOPBACK_HOSTS.has(host.toLowerCase())) {
    throw new Error(
      `${name} emulator host "${host}:${port}" is not a loopback address (127.0.0.1, localhost or ::1); npm run seed writes to local emulators only.`,
    );
  }
}

/** Fails fast; otherwise the SDKs keep retrying against a closed port. */
export function assertReachable(
  name: string,
  { host, port }: HostPort,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host, port, timeout: 2000 });
    const fail = (): void => {
      socket.destroy();
      reject(
        new Error(
          `${name} emulator is not reachable on ${host}:${port}. Start it with \`npm run emulators\`.`,
        ),
      );
    };
    socket.once("connect", () => {
      socket.end();
      resolve();
    });
    socket.once("timeout", fail);
    socket.once("error", fail);
  });
}

/** The folders of Next's data cache (M1.6): the build's and next dev's. */
export const DATA_CACHE_DIRS = [
  ".next/cache/fetch-cache",
  ".next/dev/cache/fetch-cache",
];
/** next/image's optimised copies; cleared when a Storage object changed. */
export const IMAGE_CACHE_DIRS = [
  ".next/cache/images",
  ".next/dev/cache/images",
];

export function clearDirs(root: string, dirs: readonly string[]): void {
  for (const dir of dirs)
    rmSync(join(root, dir), { recursive: true, force: true });
}

const md5Base64 = (bytes: Buffer) =>
  createHash("md5").update(bytes).digest("base64");

async function uploadIfChanged(
  bucket: Bucket,
  upload: StorageUpload,
): Promise<"uploaded" | "unchanged"> {
  const bytes = readFileSync(upload.file);
  const file = bucket.file(upload.storagePath);
  const [exists] = await file.exists();
  if (exists) {
    const [meta] = await file.getMetadata();
    if (
      meta.md5Hash === md5Base64(bytes) &&
      meta.contentType === upload.contentType &&
      meta.cacheControl === OBJECT_CACHE_CONTROL
    ) {
      return "unchanged";
    }
  }
  await file.save(bytes, {
    resumable: false,
    contentType: upload.contentType,
    metadata: { cacheControl: OBJECT_CACHE_CONTROL },
  });
  return "uploaded";
}

/** Runs `task` over `items`, at most `limit` at a time. */
async function inPool<T, R>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]!);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

export type SeedOptions = {
  /** Delete every products/collections document and every products/ object first. */
  reset?: boolean;
  /** Repo root, for the Next cache folders. */
  root?: string;
  /** Clear Next's data cache afterwards (default true). */
  clearCache?: boolean;
};

export type SeedSummary = {
  projectId: string;
  reset: boolean;
  products: Record<"published" | "draft" | "archived", number>;
  collections: number;
  objects: { uploaded: number; unchanged: number; fixtureFilesRemoved: number };
  /** Documents in products/collections that the seed doesn't write (kept; --reset removes them). */
  strayDocuments: string[];
  publicFiles: number;
  flagged: string[];
  cacheCleared: string[];
  ms: number;
};

export async function runSeed(options: SeedOptions = {}): Promise<SeedSummary> {
  const started = Date.now();
  // Checked before the M1.3 guard, whose message offers FIREBASE_ALLOW_NON_DEMO_PROJECT: the
  // seed ignores that switch and never runs against a real project.
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim() ?? "";
  if (!isDemoProjectId(projectId)) {
    throw new Error(
      `npm run seed writes to the emulators only; refusing non-demo project "${projectId || "(unset)"}".`,
    );
  }
  const env = readServerFirebaseEnv();
  if (env.mode !== "emulator") throw new Error("unreachable: demo project"); // narrows env
  assertLoopback("Firestore", env.emulators.firestore);
  assertLoopback("Auth", env.emulators.auth);
  assertLoopback("Storage", env.emulators.storage);

  // Local files next, so a fresh clone (no assets/) gets the fix without starting the emulators.
  const data = buildSeedData();
  const noOriginals = missingOriginalsMessage(data.json);
  if (noOriginals) throw new Error(noOriginals);
  const problems = seedFileProblems(data);
  if (problems.length > 0) {
    throw new Error(
      `image files are missing or the wrong size (run \`npm run images:build\`):\n  ${problems.join("\n  ")}`,
    );
  }

  await assertReachable("Firestore", env.emulators.firestore);
  await assertReachable("Storage", env.emulators.storage);

  const db = getAdminFirestore();
  const bucket = getAdminStorage().bucket();
  const refs = adminCollections(db);

  if (options.reset) {
    await db.recursiveDelete(db.collection(COLLECTIONS.products));
    await db.recursiveDelete(db.collection(COLLECTIONS.collections));
    await bucket.deleteFiles({ prefix: "products/" });
  }

  type Write = (batch: WriteBatch) => void;
  const writes: Write[] = [
    ...data.products.map<Write>(
      (p) => (b) => b.set(refs.products.doc(p.slug), p),
    ),
    ...data.collections.map<Write>(
      (c) => (b) => b.set(refs.collections.doc(c.slug), c),
    ),
  ];
  for (let i = 0; i < writes.length; i += BATCH_LIMIT) {
    const batch = db.batch();
    for (const write of writes.slice(i, i + BATCH_LIMIT)) write(batch);
    await batch.commit();
  }

  const seeded = new Set([
    ...data.products.map((p) => `${COLLECTIONS.products}/${p.slug}`),
    ...data.collections.map((c) => `${COLLECTIONS.collections}/${c.slug}`),
  ]);
  const strayDocuments: string[] = [];
  for (const name of [COLLECTIONS.products, COLLECTIONS.collections]) {
    for (const ref of await db.collection(name).listDocuments()) {
      if (!seeded.has(ref.path)) strayDocuments.push(ref.path);
    }
  }

  const results = await inPool(data.uploads, UPLOAD_CONCURRENCY, (u) =>
    uploadIfChanged(bucket, u),
  );
  let fixtureFilesRemoved = 0;
  for (const f of FIXTURES) {
    const [files] = await bucket.getFiles({ prefix: `products/${f.slug}/` });
    for (const file of files) await file.delete({ ignoreNotFound: true });
    fixtureFilesRemoved += files.length;
  }
  const uploaded = results.filter((r) => r === "uploaded").length;

  const cacheCleared: string[] = [];
  if (options.clearCache !== false) {
    const root = options.root ?? process.cwd();
    clearDirs(root, DATA_CACHE_DIRS);
    cacheCleared.push(...DATA_CACHE_DIRS);
    if (uploaded > 0 || options.reset) {
      clearDirs(root, IMAGE_CACHE_DIRS);
      cacheCleared.push(...IMAGE_CACHE_DIRS);
    }
  }

  const count = (status: Product["status"]) =>
    data.products.filter((p) => p.status === status).length;
  return {
    projectId: env.projectId,
    reset: options.reset === true,
    products: {
      published: count("published"),
      draft: count("draft"),
      archived: count("archived"),
    },
    collections: data.collections.length,
    objects: {
      uploaded,
      unchanged: results.length - uploaded,
      fixtureFilesRemoved,
    },
    strayDocuments,
    publicFiles: data.publicFiles.length,
    flagged: data.flagged,
    cacheCleared,
    ms: Date.now() - started,
  };
}

export function formatSummary(s: SeedSummary): string {
  const lines = [
    `seeded ${s.projectId} (emulators)${s.reset ? " after --reset" : ""} in ${(s.ms / 1000).toFixed(1)} s`,
    `  products:    ${s.products.published} published, ${s.products.draft} draft, ${s.products.archived} archived (fixtures)`,
    `  collections: ${s.collections}`,
    `  storage:     ${s.objects.uploaded} uploaded, ${s.objects.unchanged} unchanged` +
      (s.objects.fixtureFilesRemoved > 0
        ? `, ${s.objects.fixtureFilesRemoved} fixture file(s) removed`
        : ""),
    `  /public:     ${s.publicFiles} JPEGs checked (header size = manifest)`,
    `  next cache:  ${s.cacheCleared.length > 0 ? `cleared ${s.cacheCleared.join(", ")}` : "kept"}`,
  ];
  if (s.strayDocuments.length > 0) {
    lines.push(
      `  kept ${s.strayDocuments.length} document(s) the seed doesn't write (npm run seed -- --reset removes them): ${s.strayDocuments.join(", ")}`,
    );
  }
  if (s.flagged.length > 0) {
    lines.push(
      `  note: ${s.flagged.length} images are flagged in assets/images/manifest.json (dev placeholders, re-generate before launch): ${s.flagged.join(", ")}`,
    );
  }
  return lines.join("\n");
}
