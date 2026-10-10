/** Firestore collection names and path builders: the one place they are spelled out. */
export const COLLECTIONS = {
  products: "products",
  collections: "collections",
  users: "users",
  orders: "orders",
  newsletterSignups: "newsletterSignups",
} as const;

/** users/{uid}/cart/{sku}: one document per cart line. */
export const CART_SUBCOLLECTION = "cart";

export const cartPath = (uid: string): string =>
  `${COLLECTIONS.users}/${uid}/${CART_SUBCOLLECTION}`;
