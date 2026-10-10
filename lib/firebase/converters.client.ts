import {
  collection,
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type Firestore,
  type FirestoreDataConverter,
  type PartialWithFieldValue,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type WithFieldValue,
} from "firebase/firestore";

import {
  parseCartLine,
  parseNewsletterSignup,
  parseOrder,
  parseUserProfile,
} from "../domain/schemas";
import type { CartLine, NewsletterSignup, Order, UserProfile } from "../types";
import { decodeDoc, encodeDoc } from "./converter-utils";
import { cartPath, COLLECTIONS } from "./paths";

/**
 * Client SDK converters, only for what the browser touches (M2.7 newsletter create, M5 profile,
 * cart sync and order history). Products and collections are read on the server only.
 * Reads use serverTimestamps: "estimate", so a pending local write with serverTimestamp()
 * still decodes to a Date instead of failing the guard on null.
 */
function converter<T extends object>(
  parse: (raw: unknown, id: string) => T,
  idField?: keyof T & string,
): FirestoreDataConverter<T> {
  return {
    toFirestore(
      model: WithFieldValue<T> | PartialWithFieldValue<T>,
    ): DocumentData {
      return encodeDoc(model, idField, (d) => Timestamp.fromDate(d));
    },
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options?: SnapshotOptions,
    ): T {
      const data = snapshot.data({ ...options, serverTimestamps: "estimate" });
      return decodeDoc(parse, snapshot.ref.path, snapshot.id, data);
    },
  };
}

export const clientConverters = {
  userProfile: converter<UserProfile>(parseUserProfile, "uid"),
  cartLine: converter<CartLine>(parseCartLine),
  order: converter<Order>(parseOrder, "id"),
  newsletterSignup: converter<NewsletterSignup>(
    parseNewsletterSignup,
    "emailHash",
  ),
};

/** Typed references for the narrow client hooks (M2.7, M5). */
export function clientCollections(db: Firestore) {
  return {
    users: collection(db, COLLECTIONS.users).withConverter(
      clientConverters.userProfile,
    ),
    cart: (uid: string): CollectionReference<CartLine> =>
      collection(db, cartPath(uid)).withConverter(clientConverters.cartLine),
    orders: collection(db, COLLECTIONS.orders).withConverter(
      clientConverters.order,
    ),
    newsletterSignups: collection(
      db,
      COLLECTIONS.newsletterSignups,
    ).withConverter(clientConverters.newsletterSignup),
  };
}
