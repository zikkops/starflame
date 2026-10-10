/**
 * A tiny parser kit for runtime validation of untrusted data (Firestore documents, JSON
 * fixtures, client payloads), with no dependency. A Parser either returns a value of its type
 * or throws ValidationError with the path of the first bad field.
 * `object()` keeps only the keys in its shape, so unknown fields are dropped (forward-compatible
 * reads). Client writes are held to an exact key set by the security rules instead.
 */

export class ValidationError extends Error {
  override name = "ValidationError";
  constructor(
    readonly path: string,
    readonly reason: string,
  ) {
    super(`${path || "(root)"}: ${reason}`);
  }
}

export type Parser<T> = (value: unknown, path: string) => T;

export function fail(path: string, reason: string): never {
  throw new ValidationError(path, reason);
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function child(path: string, key: string | number): string {
  if (typeof key === "number") return `${path}[${key}]`;
  return path ? `${path}.${key}` : key;
}

export function str(
  opts: { min?: number; max?: number; pattern?: RegExp } = {},
): Parser<string> {
  const { min = 1, max = 2000, pattern } = opts;
  return (value, path) => {
    if (typeof value !== "string") {
      fail(path, `expected string, got ${describe(value)}`);
    }
    if (value.length < min || value.length > max) {
      fail(path, `length ${value.length} is outside ${min}..${max}`);
    }
    if (pattern && !pattern.test(value)) {
      fail(path, `"${value}" does not match ${String(pattern)}`);
    }
    return value;
  };
}

export function num(opts: { min?: number; max?: number } = {}): Parser<number> {
  const { min = -Infinity, max = Infinity } = opts;
  return (value, path) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      fail(path, `expected a finite number, got ${describe(value)}`);
    }
    if (value < min || value > max) {
      fail(path, `${value} is outside ${min}..${max}`);
    }
    return value;
  };
}

export function int(opts: { min?: number; max?: number } = {}): Parser<number> {
  const base = num(opts);
  return (value, path) => {
    const n = base(value, path);
    if (!Number.isSafeInteger(n)) fail(path, `expected an integer, got ${n}`);
    return n;
  };
}

export const bool: Parser<boolean> = (value, path) => {
  if (typeof value !== "boolean") {
    fail(path, `expected boolean, got ${describe(value)}`);
  }
  return value;
};

export function oneOf<const T extends readonly string[]>(
  values: T,
): Parser<T[number]> {
  return (value, path) => {
    if (typeof value !== "string" || !values.includes(value)) {
      fail(path, `expected one of ${values.join(", ")}, got ${String(value)}`);
    }
    return value;
  };
}

export function literal<const T extends string>(expected: T): Parser<T> {
  return oneOf([expected]);
}

export function nullable<T>(parser: Parser<T>): Parser<T | null> {
  return (value, path) => (value === null ? null : parser(value, path));
}

export function arrayOf<T>(
  parser: Parser<T>,
  opts: { min?: number; max?: number; unique?: boolean } = {},
): Parser<readonly T[]> {
  const { min = 0, max = 100, unique = false } = opts;
  return (value, path) => {
    if (!Array.isArray(value)) {
      fail(path, `expected array, got ${describe(value)}`);
    }
    if (value.length < min || value.length > max) {
      fail(path, `${value.length} items is outside ${min}..${max}`);
    }
    const out = value.map((item: unknown, i) => parser(item, child(path, i)));
    if (unique && new Set(out).size !== out.length) {
      fail(path, "items must be unique");
    }
    return out;
  };
}

type Shape = Record<string, Parser<unknown>>;
export type Infer<S extends Shape> = {
  readonly [K in keyof S]: S[K] extends Parser<infer T> ? T : never;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function object<S extends Shape>(shape: S): Parser<Infer<S>> {
  const keys = Object.keys(shape);
  return (value, path) => {
    if (!isRecord(value)) fail(path, `expected object, got ${describe(value)}`);
    const out: Record<string, unknown> = {};
    for (const key of keys) {
      const parse = shape[key];
      if (parse) out[key] = parse(value[key], child(path, key));
    }
    // Safe: every key of the shape was parsed by its own parser above.
    return out as Infer<S>;
  };
}

/**
 * A Firestore Timestamp (Admin or client SDK: both have toDate()) or a Date. Always returns a
 * Date, so the domain never sees SDK classes.
 */
export const date: Parser<Date> = (value, path) => {
  const d =
    value instanceof Date
      ? value
      : isRecord(value) && typeof value.toDate === "function"
        ? (value.toDate as () => unknown)()
        : undefined;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    fail(path, `expected a timestamp, got ${describe(value)}`);
  }
  return d;
};

export function map<T, U>(parser: Parser<T>, fn: (value: T) => U): Parser<U> {
  return (value, path) => fn(parser(value, path));
}

/** Adds a cross-field check. `check` returns an error message, or null when the value is fine. */
export function refine<T>(
  parser: Parser<T>,
  check: (value: T) => string | null,
): Parser<T> {
  return (value, path) => {
    const parsed = parser(value, path);
    const problem = check(parsed);
    if (problem !== null) fail(path, problem);
    return parsed;
  };
}
