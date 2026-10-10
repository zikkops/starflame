import {
  BADGES,
  CARE_KEYS,
  CART_LIMITS,
  CURRENCIES,
  IMAGE_ROLES,
  NEWSLETTER_SOURCES,
  ORDER_ACTORS,
  ORDER_STATUSES,
  PRODUCT_TYPES,
  PUBLISH_STATUSES,
  SCENT_FAMILIES,
  type Address,
  type CartLine,
  type Collection,
  type CollectionInput,
  type Money,
  type NewsletterSignup,
  type Order,
  type OrderStatus,
  type Product,
  type ProductImage,
  type ProductInput,
  type UserProfile,
  type Variant,
} from "../types";
import { EMAIL_MAX_LENGTH, EMAIL_PATTERN, normaliseEmail } from "./email";
import {
  collectionSlug,
  emailHash,
  orderId,
  productSlug,
  sku,
  skuBelongsTo,
  userId,
} from "./ids";
import { canTransition } from "./order-status";
import {
  arrayOf,
  bool,
  date,
  fail,
  int,
  literal,
  nullable,
  num,
  object,
  oneOf,
  refine,
  str,
  type Parser,
} from "./validate";

/**
 * Runtime guards for every stored document shape. Converters (lib/firebase) call the
 * parse* functions on each snapshot; the seed (M1.8) and admin writes (M7) call
 * parseProductInput / parseCollectionInput before deriving and writing.
 * Limits mirror the M1.5 rules where clients can write.
 */

const text = (max: number) => str({ max });

const money: Parser<Money> = object({
  amount: int({ min: 0, max: 100_000_000 }),
  currency: oneOf(CURRENCIES),
});

const hoursRange = refine(
  object({ min: num({ min: 0, max: 1000 }), max: num({ min: 0, max: 1000 }) }),
  (h) => (h.min <= h.max ? null : "min is greater than max"),
);

const variant: Parser<Variant> = object({
  sku,
  label: text(40),
  weightGrams: int({ min: 1, max: 20_000 }),
  dimensionsCm: nullable(
    object({
      diameter: num({ min: 0.1, max: 100 }),
      height: num({ min: 0.1, max: 100 }),
    }),
  ),
  price: money,
  burnTimeHours: nullable(hoursRange),
  warmTimeHoursPerPiece: nullable(num({ min: 0.1, max: 100 })),
  pieces: nullable(int({ min: 1, max: 100 })),
  available: bool,
});

const productImage: Parser<ProductImage> = object({
  id: str({ max: 80, pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ }),
  storagePath: str({
    max: 300,
    pattern: /^products\/[a-z0-9-]+\/[a-z0-9-]+\.(?:png|jpe?g|webp|avif)$/,
  }),
  /** art-direction §7: every alt is 150 characters or fewer, never empty. */
  alt: text(150),
  role: oneOf(IMAGE_ROLES),
  width: int({ min: 1, max: 10_000 }),
  height: int({ min: 1, max: 10_000 }),
});

const noteList = arrayOf(text(60), { min: 1, max: 6 });

const productInputShape = {
  slug: productSlug,
  name: text(80),
  type: oneOf(PRODUCT_TYPES),
  collection: collectionSlug,
  alsoIn: arrayOf(collectionSlug, { max: 5, unique: true }),
  shortDescription: text(200),
  longDescription: text(2000),
  scentFamily: nullable(oneOf(SCENT_FAMILIES)),
  scentNotes: nullable(
    object({ top: noteList, heart: noteList, base: noteList }),
  ),
  variants: arrayOf(variant, { min: 1, max: 10 }),
  badges: arrayOf(oneOf(BADGES), { max: BADGES.length, unique: true }),
  careKey: oneOf(CARE_KEYS),
  giftSetContents: nullable(
    arrayOf(object({ productSlug, sku, quantity: int({ min: 1, max: 10 }) }), {
      min: 1,
      max: 10,
    }),
  ),
  images: arrayOf(productImage, { min: 1, max: 12 }),
  sortOrder: int({ min: 0, max: 1_000_000 }),
  status: oneOf(PUBLISH_STATUSES),
};

const CANDLE_TYPES: readonly string[] = ["jar", "pillar", "tin"];

/** Cross-field rules for a product. Returns the first problem, or null. */
export function productInputProblem(p: ProductInput): string | null {
  const skus = p.variants.map((v) => v.sku);
  if (new Set(skus).size !== skus.length) return "variants: duplicate sku";
  for (const s of skus) {
    // Keeps SKUs globally unique as long as slugs are (they are document IDs).
    if (!skuBelongsTo(s, p.slug)) {
      return `variants: sku "${s}" must be "${p.slug}" or start with "${p.slug}-"`;
    }
  }
  if (new Set(p.variants.map((v) => v.price.currency)).size !== 1) {
    return "variants: all prices must use one currency";
  }
  const isGiftSet = p.type === "gift-set";
  if (isGiftSet !== (p.giftSetContents !== null)) {
    return "giftSetContents is required for gift sets and must be null otherwise";
  }
  if (isGiftSet !== (p.scentFamily === null)) {
    return "scentFamily must be null for gift sets and set otherwise";
  }
  if (isGiftSet !== (p.scentNotes === null)) {
    return "scentNotes must be null for gift sets and set otherwise";
  }
  const isMelt = p.type === "wax-melt";
  const isCandle = CANDLE_TYPES.includes(p.type);
  for (const v of p.variants) {
    if (isMelt !== (v.pieces !== null && v.warmTimeHoursPerPiece !== null)) {
      return `variant ${v.sku}: pieces and warmTimeHoursPerPiece are for wax melts only`;
    }
    if (isCandle !== (v.burnTimeHours !== null)) {
      return `variant ${v.sku}: burnTimeHours is required for candles and must be null otherwise`;
    }
    if (isCandle && v.dimensionsCm === null) {
      return `variant ${v.sku}: candles need dimensionsCm`;
    }
  }
  if (p.alsoIn.includes(p.collection)) return "alsoIn repeats collection";
  if (p.images[0]?.role !== "catalog")
    return "images[0] must be the catalog image";
  if (p.images.filter((i) => i.role === "catalog").length !== 1) {
    return "images: exactly one catalog image";
  }
  if (new Set(p.images.map((i) => i.id)).size !== p.images.length) {
    return "images: duplicate id";
  }
  const folder = `products/${p.slug}/`;
  const stray = p.images.find((i) => !i.storagePath.startsWith(folder));
  if (stray) return `images: ${stray.id} must live under ${folder}`;
  return null;
}

const productInputParser: Parser<ProductInput> = refine(
  object(productInputShape),
  productInputProblem,
);

const productParser: Parser<Product> = refine(
  object({
    ...productInputShape,
    priceFrom: int({ min: 0 }),
    priceTo: int({ min: 0 }),
    currency: oneOf(CURRENCIES),
    sizeKeys: arrayOf(str({ max: 40 }), { min: 1, max: 10, unique: true }),
    collectionSlugs: arrayOf(collectionSlug, { min: 1, max: 6, unique: true }),
    scentFamilies: arrayOf(oneOf(SCENT_FAMILIES), {
      min: 1,
      max: SCENT_FAMILIES.length,
      unique: true,
    }),
    skus: arrayOf(sku, { min: 1, max: 10, unique: true }),
    inStock: bool,
    cardImage: productImage,
    giftSetValue: nullable(money),
    createdAt: date,
    updatedAt: date,
    publishedAt: nullable(date),
  }),
  (p) =>
    productInputProblem(p) ??
    (p.priceFrom <= p.priceTo ? null : "priceFrom is greater than priceTo") ??
    (p.collectionSlugs[0] === p.collection
      ? null
      : "collectionSlugs[0] must be collection"),
);

const staticImage = object({
  src: str({
    max: 200,
    pattern: /^\/images\/[a-z0-9/-]+\.(?:jpe?g|png|webp)$/,
  }),
  alt: text(150),
  width: int({ min: 1, max: 10_000 }),
  height: int({ min: 1, max: 10_000 }),
});

const collectionInputShape = {
  slug: collectionSlug,
  name: text(80),
  tagline: text(160),
  description: text(1000),
  isLimited: bool,
  sortOrder: int({ min: 0, max: 1_000_000 }),
  moodImage: staticImage,
  status: oneOf(PUBLISH_STATUSES),
};

const collectionInputParser: Parser<CollectionInput> =
  object(collectionInputShape);
const collectionParser: Parser<Collection> = object({
  ...collectionInputShape,
  createdAt: date,
  updatedAt: date,
});

/** Mirrors the users/{uid} rules (M1.5): the same maxima. */
export const addressParser: Parser<Address> = object({
  fullName: text(100),
  line1: text(100),
  line2: nullable(text(100)),
  city: text(80),
  region: nullable(text(80)),
  postalCode: str({ max: 20 }),
  country: str({ pattern: /^[A-Z]{2}$/ }),
  phone: nullable(str({ max: 30 })),
});

const userProfileData = object({
  displayName: nullable(text(80)),
  defaultShippingAddress: nullable(addressParser),
  createdAt: date,
  updatedAt: date,
});

const cartLineParser: Parser<CartLine> = refine(
  object({
    productSlug,
    sku,
    quantity: int({ min: 1, max: CART_LIMITS.maxQuantityPerLine }),
    addedAt: date,
    updatedAt: date,
  }),
  (l) =>
    skuBelongsTo(l.sku, l.productSlug)
      ? null
      : "sku does not belong to productSlug",
);

const orderData = refine(
  object({
    orderNumber: str({ max: 40 }),
    userId: nullable(userId),
    email: str({ max: EMAIL_MAX_LENGTH, pattern: EMAIL_PATTERN }),
    accessTokenHash: str({ pattern: /^[0-9a-f]{64}$/ }),
    status: oneOf(ORDER_STATUSES),
    statusHistory: arrayOf(
      object({
        from: nullable(oneOf(ORDER_STATUSES)),
        to: oneOf(ORDER_STATUSES),
        at: date,
        by: oneOf(ORDER_ACTORS),
      }),
      { min: 1, max: 20 },
    ),
    lines: arrayOf(
      object({
        productSlug,
        sku,
        name: text(80),
        variantLabel: text(40),
        type: oneOf(PRODUCT_TYPES),
        imagePath: nullable(str({ max: 300 })),
        unitPrice: money,
        quantity: int({ min: 1, max: CART_LIMITS.maxQuantityPerLine }),
        lineTotal: money,
      }),
      { min: 1, max: CART_LIMITS.maxLines },
    ),
    currency: oneOf(CURRENCIES),
    totals: object({
      subtotal: money,
      shipping: money,
      tax: money,
      discount: money,
      total: money,
    }),
    shippingAddress: addressParser,
    payment: object({
      provider: literal("stub"),
      reference: nullable(str({ max: 200 })),
    }),
    idempotencyKey: str({ max: 100 }),
    createdAt: date,
    updatedAt: date,
  }),
  (o) => {
    const amounts = [
      ...o.lines.flatMap((l) => [l.unitPrice, l.lineTotal]),
      ...Object.values(o.totals),
    ];
    if (amounts.some((m) => m.currency !== o.currency)) {
      return "every amount must use the order currency";
    }
    const bad = o.lines.find(
      (l) => l.lineTotal.amount !== l.unitPrice.amount * l.quantity,
    );
    if (bad) return `lines: ${bad.sku} lineTotal is not unitPrice × quantity`;
    const subtotal = o.lines.reduce((sum, l) => sum + l.lineTotal.amount, 0);
    const t = o.totals;
    if (t.subtotal.amount !== subtotal)
      return "totals.subtotal is not the sum of the lines";
    const total =
      t.subtotal.amount + t.shipping.amount + t.tax.amount - t.discount.amount;
    if (t.total.amount !== total) return "totals.total does not add up";
    let previous: OrderStatus | null = null;
    for (const [i, step] of o.statusHistory.entries()) {
      const allowed =
        previous === null
          ? step.from === null && step.to === "pending_payment"
          : step.from === previous && canTransition(previous, step.to);
      if (!allowed) {
        return `statusHistory[${i}]: ${step.from ?? "null"} → ${step.to} is not an allowed step`;
      }
      previous = step.to;
    }
    if (previous !== o.status) {
      return "statusHistory must end with the current status";
    }
    return null;
  },
);

const newsletterData = object({
  email: refine(str({ max: EMAIL_MAX_LENGTH, pattern: EMAIL_PATTERN }), (e) =>
    e === normaliseEmail(e) ? null : "email is not normalised",
  ),
  source: oneOf(NEWSLETTER_SOURCES),
  consentVersion: str({ max: 40 }),
  createdAt: date,
});

function checkId(actual: string, expected: string, field: string): void {
  if (actual !== expected) {
    fail(field, `"${actual}" does not match the document ID "${expected}"`);
  }
}

export function parseProductInput(raw: unknown): ProductInput {
  return productInputParser(raw, "");
}

export function parseProduct(raw: unknown, id: string): Product {
  const p = productParser(raw, "");
  checkId(p.slug, id, "slug");
  return p;
}

export function parseCollectionInput(raw: unknown): CollectionInput {
  return collectionInputParser(raw, "");
}

export function parseCollection(raw: unknown, id: string): Collection {
  const c = collectionParser(raw, "");
  checkId(c.slug, id, "slug");
  return c;
}

export function parseCartLine(raw: unknown, id: string): CartLine {
  const line = cartLineParser(raw, "");
  checkId(line.sku, id, "sku");
  return line;
}

export function parseUserProfile(raw: unknown, id: string): UserProfile {
  return { uid: userId(id, "(id)"), ...userProfileData(raw, "") };
}

export function parseOrder(raw: unknown, id: string): Order {
  return { id: orderId(id, "(id)"), ...orderData(raw, "") };
}

export function parseNewsletterSignup(
  raw: unknown,
  id: string,
): NewsletterSignup {
  return { emailHash: emailHash(id, "(id)"), ...newsletterData(raw, "") };
}
