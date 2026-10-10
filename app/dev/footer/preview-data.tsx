import { FooterSlotOutline } from "@/components/layout/footer/FooterSlotOutline";
import { footerGroup } from "@/components/layout/site-routes";
import type {
  FooterCollection,
  FooterPreviewData,
} from "@/components/layout/SiteFooter";
import catalog from "@/design/copy/catalog.json";

// The "Our collections" fixture (footer.md §3.4, §3.6): the catalog's
// collections as the M3.7 repository query will return them (by sortOrder, Gift
// Sets excluded, at most 6). Never read from Firestore, so the page doesn't
// depend on emulator state.
const collections: FooterCollection[] = [...catalog.collections]
  .filter((collection) => collection.slug !== "gift-sets")
  .sort((a, b) => a.sortOrder - b.sortOrder)
  .slice(0, 6)
  .map(({ slug, name }) => ({ slug, name }));

/** The full footer. The placeholder URLs exist only here (never in lib/site/social.ts). */
export const FOOTER_PREVIEW: FooterPreviewData = {
  social: {
    instagram: "https://example.com/",
    pinterest: "https://example.com/",
  },
  collections,
  slot: <FooterSlotOutline />,
};

/** The Current page options: None, then every footer target in footer order. */
export const PREVIEW_PAGES: { label: string; value: string }[] = [
  { label: "None", value: "" },
  ...[
    ...footerGroup("explore", { preview: true }),
    ...collections.map(({ slug, name }) => ({
      label: name,
      href: `/collections/${slug}`,
    })),
    ...footerGroup("help", { preview: true }),
    ...footerGroup("legal", { preview: true }),
  ].map(({ label, href }) => ({ label, value: href })),
];
