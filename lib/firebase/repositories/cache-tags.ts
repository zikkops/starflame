/**
 * Cache tags of the catalog reads (design/tech/M1.6-repositories.md §1 Caching). Every product
 * read carries `products` and every collection read carries `collections`, and the pages that
 * render them inherit the tags. A write invalidates the whole tag: one product's change can show
 * on any list, card, related row or gift set, and a full refresh costs at most about 200 reads.
 * M7's admin writes call `updateTag(tag)` from a Server Action (read-your-writes), or
 * `revalidateTag(tag, "max")` from a Route Handler. Plain strings, no imports: safe anywhere.
 */
export const CACHE_TAGS = {
  products: "products",
  collections: "collections",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
