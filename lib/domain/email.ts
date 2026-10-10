import type { EmailHash } from "../types";

/** Deliberately loose: one "@", no spaces, a dot in the domain. Real validation is the confirmation email. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_MAX_LENGTH = 254;

/**
 * NFC, trimmed, lowercase. No provider-specific rules (Gmail dots or "+tags"), which would be
 * wrong for other providers. The newsletter rules (M1.5) re-check trim and lowercase.
 */
export function normaliseEmail(raw: string): string {
  return raw.normalize("NFC").trim().toLowerCase();
}

export function isEmail(value: string): boolean {
  return value.length <= EMAIL_MAX_LENGTH && EMAIL_PATTERN.test(value);
}

/**
 * Lowercase hex SHA-256 of the normalised email: the newsletterSignups document ID. Uses Web
 * Crypto, which exists in browsers (secure contexts, including localhost) and in Node 24.
 * The rules recompute it with hashing.sha256(), so a client can't pick its own ID.
 */
export async function emailHash(email: string): Promise<EmailHash> {
  const bytes = new TextEncoder().encode(normaliseEmail(email));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  const hex = Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  // Safe: a SHA-256 digest is always 64 lowercase hex characters.
  return hex as EmailHash;
}
