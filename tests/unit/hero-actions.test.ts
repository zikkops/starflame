import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { heroActions } from "../../components/home/hero-actions";

// design/pages/home.md §3.7, §3.8, §11.1: a CTA only when its section is on the page.
describe("heroActions", () => {
  it("both sections: Shop favorites, then the Explore collections link", () => {
    assert.deepEqual(heroActions({ collections: true, bestsellers: true }), [
      { kind: "primary", label: "Shop favorites", href: "#bestsellers" },
      { kind: "link", label: "Explore collections", href: "#collections" },
    ]);
  });

  it("no bestsellers: Explore collections becomes the primary CTA, no link", () => {
    assert.deepEqual(heroActions({ collections: true, bestsellers: false }), [
      { kind: "primary", label: "Explore collections", href: "#collections" },
    ]);
  });

  it("no collections: the primary CTA only", () => {
    assert.deepEqual(heroActions({ collections: false, bestsellers: true }), [
      { kind: "primary", label: "Shop favorites", href: "#bestsellers" },
    ]);
  });

  it("neither section (M2.2): no CTAs", () => {
    assert.deepEqual(
      heroActions({ collections: false, bestsellers: false }),
      [],
    );
  });
});
