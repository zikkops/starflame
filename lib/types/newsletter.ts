import type { EmailHash } from "./brand";

/** Where the form was submitted. M2.6 may add more. */
export const NEWSLETTER_SOURCES = ["home", "footer"] as const;
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];

/** newsletterSignups/{emailHash}. Create-only from the client; clients can never read it. */
export type NewsletterSignup = {
  /** The document ID (not stored as a field). */
  readonly emailHash: EmailHash;
  /** Normalised: NFC, trimmed, lowercase. */
  readonly email: string;
  readonly source: NewsletterSource;
  /** Version of the consent text the visitor saw (M2.6 copy). */
  readonly consentVersion: string;
  readonly createdAt: Date;
};
