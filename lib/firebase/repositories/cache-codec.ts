/**
 * unstable_cache stores a result with JSON.stringify and returns JSON.parse(body) on a cache hit,
 * but the original value on a miss (next/dist/server/web/spec-extension/unstable-cache.js), so a
 * Date would be a Date on the first call and a string after it. The cached repositories store
 * encodeForCache(value) and return decodeFromCache(...), which gives the same result on both
 * paths. Dates travel as { "$date": ISO string }.
 */

export type CacheJson =
  null | boolean | number | string | CacheJson[] | { [key: string]: CacheJson };

const DATE_KEY = "$date";

export class CacheCodecError extends Error {
  override name = "CacheCodecError";
}

function isPlainObject(value: object): boolean {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function encodeForCache(value: unknown, path = "(root)"): CacheJson {
  if (value === null) return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new CacheCodecError(`${path}: invalid Date`);
    }
    return { [DATE_KEY]: value.toISOString() };
  }
  if (Array.isArray(value)) {
    return value.map((item, i) => encodeForCache(item, `${path}[${i}]`));
  }
  switch (typeof value) {
    case "string":
    case "boolean":
      return value;
    case "number":
      if (!Number.isFinite(value)) {
        throw new CacheCodecError(`${path}: non-finite number`);
      }
      return value;
    case "object":
      if (isPlainObject(value)) {
        const out: { [key: string]: CacheJson } = {};
        for (const [key, v] of Object.entries(value)) {
          if (key === DATE_KEY) {
            throw new CacheCodecError(
              `${path}: the key "${DATE_KEY}" is reserved`,
            );
          }
          if (v !== undefined) out[key] = encodeForCache(v, `${path}.${key}`);
        }
        return out;
      }
      break;
  }
  throw new CacheCodecError(`${path}: ${typeof value} is not cacheable`);
}

function decode(json: CacheJson): unknown {
  if (Array.isArray(json)) return json.map(decode);
  if (json === null || typeof json !== "object") return json;
  const keys = Object.keys(json);
  const tagged = json[DATE_KEY];
  if (keys.length === 1 && typeof tagged === "string") return new Date(tagged);
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const v = json[key];
    if (v !== undefined) out[key] = decode(v);
  }
  return out;
}

/** The inverse of encodeForCache. T is the type the encoded value had. */
export function decodeFromCache<T>(json: CacheJson): T {
  // The cast restores the static type that encodeForCache erased; the value's shape is unchanged.
  return decode(json) as T;
}
