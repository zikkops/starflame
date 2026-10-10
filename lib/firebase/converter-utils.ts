import { ValidationError } from "../domain/validate";

/**
 * SDK-neutral helpers shared by converters.admin.ts and converters.client.ts. The two SDKs
 * have different Timestamp classes, so each converter passes its own factory.
 */

/** A stored document failed its guard. Carries the document path for logs. */
export class DocumentValidationError extends Error {
  override name = "DocumentValidationError";
  constructor(
    readonly docPath: string,
    cause: ValidationError,
  ) {
    super(`Invalid document ${docPath}: ${cause.message}`, { cause });
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false;
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Domain object → Firestore data. Dates become SDK Timestamps; arrays and plain objects are
 * walked; anything else (FieldValue sentinels such as serverTimestamp(), Timestamps) passes
 * through. `undefined` fields are dropped. `idField` (e.g. Order.id) is not stored: it is the
 * document ID.
 */
export function encodeDoc(
  model: object,
  idField: string | undefined,
  toTimestamp: (date: Date) => unknown,
): Record<string, unknown> {
  const encode = (value: unknown): unknown => {
    if (value instanceof Date) return toTimestamp(value);
    if (Array.isArray(value)) return value.map(encode);
    if (isPlainObject(value)) {
      const out: Record<string, unknown> = {};
      for (const [key, v] of Object.entries(value)) {
        if (v !== undefined) out[key] = encode(v);
      }
      return out;
    }
    return value;
  };
  const out: Record<string, unknown> = {};
  for (const [key, v] of Object.entries(model)) {
    if (key !== idField && v !== undefined) out[key] = encode(v);
  }
  return out;
}

/** Firestore data → domain object, through the entity's guard. */
export function decodeDoc<T>(
  parse: (raw: unknown, id: string) => T,
  docPath: string,
  id: string,
  data: unknown,
): T {
  try {
    return parse(data, id);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new DocumentValidationError(docPath, error);
    }
    throw error;
  }
}
