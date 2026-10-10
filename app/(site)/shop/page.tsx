import type { Metadata } from "next";

import { HomeHover } from "@/components/home/HomeHover";
import { Container } from "@/components/layout/Container";
import { ShopBrowser } from "@/components/shop/ShopBrowser";
import {
  BADGE_LABELS,
  COLLECTION_OPTIONS,
  PRICE_OPTIONS,
  SCENT_OPTIONS,
  SHOP_PRODUCTS,
  TYPE_OPTIONS,
} from "@/components/shop/shop-data";

export const metadata: Metadata = {
  title: "Shop all candles",
  description:
    "Every Starflames candle in one place: scented jars, pillar candles, travel tins, wax melts and gift sets. Filter by type, scent, collection and price.",
};

/**
 * /shop (user request, 2026-10-10): every product, filterable by type, scent,
 * collection and price, with sorting. Static data for now (shop-data.ts).
 */
export default function ShopPage() {
  return (
    <section
      data-band="plain"
      aria-labelledby="shop-heading"
      className="pt-8 md:pt-12"
    >
      <Container>
        <header className="mb-10 max-w-measure-intro md:mb-12">
          <p className="type-eyebrow text-text-accent">The shop</p>
          <h1
            id="shop-heading"
            className="mt-3 type-display-2 text-text-primary"
          >
            Every candle under the sky
          </h1>
          <p className="mt-4 type-body-lg text-text-secondary">
            Jars, pillars, tins, melts and gift sets, gathered from all six
            collections. Narrow it down by scent, shape or price.
          </p>
        </header>
        <ShopBrowser
          products={SHOP_PRODUCTS}
          options={{
            type: TYPE_OPTIONS,
            scent: SCENT_OPTIONS,
            collection: COLLECTION_OPTIONS,
            price: PRICE_OPTIONS,
          }}
          badgeLabels={BADGE_LABELS}
        />
      </Container>
      <HomeHover />
    </section>
  );
}
