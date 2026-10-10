import { expect, test } from "@playwright/test";

import { storageObjectUrl } from "../../lib/firebase/storage-url";
import { catalogProductInputs } from "../../scripts/seed/catalog";

// M1.8: scripts/e2e.ts seeds the emulators before the build, so the seeded product images are in
// the Storage emulator, and next.config's emulator remotePatterns (M1.6) let next/image optimise
// them. Request-only (no page), so one project is enough.
test("seeded product images render through /_next/image", async ({
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440", "request-only check");
  const product = catalogProductInputs().find((p) => p.slug === "comet-tail");
  expect(product?.images.map((i) => i.role)).toEqual(["catalog", "lifestyle"]);
  for (const image of product?.images ?? []) {
    const url = storageObjectUrl(image.storagePath);
    const response = await request.get(
      `/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`,
      { headers: { accept: "image/avif,image/webp,image/*" } },
    );
    expect(response.status(), image.storagePath).toBe(200);
    expect(response.headers()["content-type"]).toMatch(/^image\/(avif|webp)$/);
  }
});
