import "server-only";

import {
  Timestamp,
  type CollectionReference,
  type DocumentData,
  type Firestore,
  type FirestoreDataConverter,
  type PartialWithFieldValue,
  type QueryDocumentSnapshot,
  type WithFieldValue,
} from "firebase-admin/firestore";

import {
  parseCartLine,
  parseCollection,
  parseNewsletterSignup,
  parseOrder,
  parseProduct,
  parseUserProfile,
} from "../domain/schemas";
import type {
  CartLine,
  Collection,
  NewsletterSignup,
  Order,
  Product,
  UserProfile,
} from "../types";
import { decodeDoc, encodeDoc } from "./converter-utils";
import { cartPath, COLLECTIONS } from "./paths";

/**
 * Admin SDK converters for the Next.js server (Server Components, Route Handlers) and the seed
 * (tsx --conditions=react-server). Not for Cloud Functions: `server-only` throws in plain Node
 * and functions/ can't import ../lib; M6.1 adds a Functions-side converter (spec §1). Reads run
 * the entity guard and throw DocumentValidationError on a bad document. Writes accept FieldValue
 * sentinels anywhere (WithFieldValue), e.g. `updatedAt: FieldValue.serverTimestamp()`.
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
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      return decodeDoc(parse, snapshot.ref.path, snapshot.id, snapshot.data());
    },
  };
}

export const adminConverters = {
  product: converter<Product>(parseProduct),
  collection: converter<Collection>(parseCollection),
  userProfile: converter<UserProfile>(parseUserProfile, "uid"),
  cartLine: converter<CartLine>(parseCartLine),
  order: converter<Order>(parseOrder, "id"),
  newsletterSignup: converter<NewsletterSignup>(
    parseNewsletterSignup,
    "emailHash",
  ),
};

/** Typed collection references for repositories (M1.6), the seed (M1.8) and admin (M7). */
export function adminCollections(db: Firestore) {
  return {
    products: db
      .collection(COLLECTIONS.products)
      .withConverter(adminConverters.product),
    collections: db
      .collection(COLLECTIONS.collections)
      .withConverter(adminConverters.collection),
    users: db
      .collection(COLLECTIONS.users)
      .withConverter(adminConverters.userProfile),
    cart: (uid: string): CollectionReference<CartLine> =>
      db.collection(cartPath(uid)).withConverter(adminConverters.cartLine),
    orders: db
      .collection(COLLECTIONS.orders)
      .withConverter(adminConverters.order),
    newsletterSignups: db
      .collection(COLLECTIONS.newsletterSignups)
      .withConverter(adminConverters.newsletterSignup),
  };
}
