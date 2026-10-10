import type { UserId } from "./brand";

export type Address = {
  readonly fullName: string;
  readonly line1: string;
  readonly line2: string | null;
  readonly city: string;
  /** State, county or province, where the country uses one. */
  readonly region: string | null;
  readonly postalCode: string;
  /** ISO 3166-1 alpha-2, e.g. "US". */
  readonly country: string;
  readonly phone: string | null;
};

/**
 * users/{uid}: the customer profile. Email and sign-in providers stay in Firebase Auth (the
 * source of truth). Roles live only in custom claims (`admin`), never in this document.
 */
export type UserProfile = {
  readonly uid: UserId;
  readonly displayName: string | null;
  readonly defaultShippingAddress: Address | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
};
