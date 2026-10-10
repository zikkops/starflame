import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import {
  deleteObject,
  getBytes,
  getMetadata,
  listAll,
  ref,
  uploadBytes,
} from "firebase/storage";

import {
  PERSONAS,
  setUpRulesEnv,
  storageOf,
  tearDown,
  type Persona,
  type RulesEnv,
} from "./support/env";

const MB = 1024 * 1024;
/** A few bytes are enough: the rules check the declared contentType and the size only. */
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const IMAGE = "products/moonrise/cat-moonrise.png";
/** A draft product's image: reachable by its exact path, but never by listing. */
const DRAFT_IMAGE = "products/rules-probe-draft/cat-rules-probe-draft.png";
const PRIVATE = "_private/notes.txt";

let rules: RulesEnv;
let next = 0;

const storageAs = (who: Persona) => storageOf(rules.as(who));
const upload = (
  who: Persona,
  path: string,
  contentType: string,
  bytes: Uint8Array = PNG,
) => uploadBytes(ref(storageAs(who), path), bytes, { contentType });

before(async () => {
  rules = await setUpRulesEnv();
  await rules.env.clearStorage();
  await rules.env.withSecurityRulesDisabled(async (ctx) => {
    const storage = storageOf(ctx);
    for (const path of [IMAGE, DRAFT_IMAGE]) {
      await uploadBytes(ref(storage, path), PNG, { contentType: "image/png" });
    }
    await uploadBytes(ref(storage, PRIVATE), new Uint8Array([1]), {
      contentType: "text/plain",
    });
  });
});

after(() => tearDown(rules));

describe("storage: products/** is public get, never list", () => {
  for (const who of PERSONAS) {
    it(`${who} can read a product image`, async () => {
      const bytes = await assertSucceeds(getBytes(ref(storageAs(who), IMAGE)));
      assert.equal(bytes.byteLength, PNG.byteLength);
      await assertSucceeds(getMetadata(ref(storageAs(who), IMAGE)));
    });

    it(`${who} cannot list products/, a product folder or the bucket root`, async () => {
      // A list would reveal every slug folder, drafts included (QA P108/P109).
      await assertFails(listAll(ref(storageAs(who), "products")));
      await assertFails(listAll(ref(storageAs(who), "products/moonrise")));
      await assertFails(listAll(ref(storageAs(who), "")));
    });

    it(`${who} can still get a known image by its exact path`, async () => {
      await assertSucceeds(getBytes(ref(storageAs(who), DRAFT_IMAGE)));
    });

    it(`${who} cannot read outside products/`, async () => {
      await assertFails(getBytes(ref(storageAs(who), PRIVATE)));
    });
  }
});

describe("storage: writes need the admin claim", () => {
  for (const who of PERSONAS) {
    const allowed = who === "admin";
    it(`${who} ${allowed ? "can" : "cannot"} upload a product image`, async () => {
      const write = upload(
        who,
        `products/moonrise/new-${++next}.png`,
        "image/png",
      );
      await (allowed ? assertSucceeds(write) : assertFails(write));
    });

    it(`${who} ${allowed ? "can" : "cannot"} delete a product image`, async () => {
      const path = `products/moonrise/delete-me-${++next}.png`;
      await rules.env.withSecurityRulesDisabled(async (ctx) => {
        await uploadBytes(ref(storageOf(ctx), path), PNG, {
          contentType: "image/png",
        });
      });
      const remove = deleteObject(ref(storageAs(who), path));
      await (allowed ? assertSucceeds(remove) : assertFails(remove));
    });

    it(`${who} cannot upload outside products/`, async () => {
      await assertFails(upload(who, `uploads/x-${++next}.png`, "image/png"));
    });
  }

  it("a non-boolean admin claim is refused", async () => {
    const storage = storageOf(
      rules.env.authenticatedContext("pretender", { admin: "true" }),
    );
    await assertFails(
      uploadBytes(ref(storage, "products/moonrise/p.png"), PNG, {
        contentType: "image/png",
      }),
    );
  });
});

describe("storage: admin uploads are checked", () => {
  for (const [type, ext] of [
    ["image/png", "png"],
    ["image/jpeg", "jpg"],
    ["image/jpeg", "jpeg"],
    ["image/webp", "webp"],
    ["image/avif", "avif"],
  ] as const) {
    it(`allows ${type} as .${ext}`, async () => {
      await assertSucceeds(
        upload("admin", `products/moonrise/ok-${++next}.${ext}`, type),
      );
    });
  }

  for (const type of [
    "image/gif",
    "image/svg+xml",
    "text/html",
    "application/octet-stream",
  ]) {
    it(`denies ${type}`, async () => {
      await assertFails(
        upload("admin", `products/moonrise/bad-${++next}.png`, type),
      );
    });
  }

  for (const [what, path] of [
    ["a nested path", "products/moonrise/extra/cat.png"],
    ["a file at the products/ root", "products/cat.png"],
    ["an uppercase file name", "products/moonrise/Cat-Moonrise.png"],
    ["an unknown extension", "products/moonrise/cat.gif"],
    ["an uppercase slug", "products/Moonrise/cat.png"],
  ] as const) {
    it(`denies ${what}`, async () => {
      await assertFails(upload("admin", path, "image/png"));
    });
  }

  it("allows just under 10 MB and denies 10 MB", async () => {
    await assertSucceeds(
      upload(
        "admin",
        `products/moonrise/big-${++next}.png`,
        "image/png",
        new Uint8Array(10 * MB - 1),
      ),
    );
    await assertFails(
      upload(
        "admin",
        `products/moonrise/big-${++next}.png`,
        "image/png",
        new Uint8Array(10 * MB),
      ),
    );
  });
});
