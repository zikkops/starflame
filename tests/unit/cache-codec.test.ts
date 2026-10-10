import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  CacheCodecError,
  decodeFromCache,
  encodeForCache,
} from "../../lib/firebase/repositories/cache-codec";

/** What unstable_cache does to a stored value on a cache hit. */
const throughJson = (value: unknown) => JSON.parse(JSON.stringify(value));

describe("cache codec", () => {
  const value = {
    slug: "moonrise",
    publishedAt: new Date("2026-10-03T12:34:56.789Z"),
    never: null,
    nested: [{ at: new Date(0), n: 3, ok: true }],
    dropped: undefined,
  };

  it("gives the same value on a miss (as encoded) and on a hit (through JSON)", () => {
    const encoded = encodeForCache(value);
    const miss = decodeFromCache<typeof value>(encoded);
    const hit = decodeFromCache<typeof value>(throughJson(encoded));
    const expected = { ...value };
    delete expected.dropped;
    assert.deepEqual(miss, expected);
    assert.deepEqual(hit, expected);
    assert.ok(hit.publishedAt instanceof Date);
    assert.ok(hit.nested[0]?.at instanceof Date);
  });

  it("refuses values JSON would change: class instances, NaN, invalid dates, the tag key", () => {
    for (const bad of [
      { m: new Map() },
      { n: Number.NaN },
      { d: new Date("nope") },
      { $date: "2026-01-01" },
      { f: () => 1 },
    ]) {
      assert.throws(() => encodeForCache(bad), CacheCodecError);
    }
  });
});
