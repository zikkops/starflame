import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { after, describe, it } from "node:test";

import { deleteApp, initializeApp } from "firebase-admin/app";
import { getFirestore, type Query } from "firebase-admin/firestore";

import {
  catalogQueries,
  QUERY_SHAPES,
  type QueryName,
  type QueryShape,
} from "../../lib/firebase/repositories/catalog-reads";

/**
 * Index coverage (M1.6): every repository query either has a composite index in
 * firestore.indexes.json or is a single-field query Firestore indexes automatically (and that
 * field isn't exempted in fieldOverrides). The emulator doesn't enforce indexes, so this is the
 * check that a production deploy won't fail with FAILED_PRECONDITION. Each shape is also rebuilt
 * as a query and compared with Query#isEqual to the one the repository builds, so the list below
 * can't drift from the code, and a source scan checks that no repository builds a filter or an
 * order anywhere else. No emulator needed: building a query makes no request.
 */

type IndexField = {
  fieldPath: string;
  order?: "ASCENDING" | "DESCENDING";
  arrayConfig?: "CONTAINS";
};
type IndexFile = {
  indexes: {
    collectionGroup: string;
    queryScope: string;
    fields: IndexField[];
  }[];
  fieldOverrides: {
    collectionGroup: string;
    fieldPath: string;
    indexes: unknown[];
  }[];
};
const indexFile = JSON.parse(
  readFileSync("firestore.indexes.json", "utf8"),
) as IndexFile;

const SAMPLE_PARAM = "moonlit-terrace";

/** The composite index a shape needs: equality and array-contains fields (any order), then orderBy. */
function compositeFor(shape: QueryShape) {
  return indexFile.indexes.find((index) => {
    if (
      index.collectionGroup !== shape.collectionGroup ||
      index.queryScope !== "COLLECTION"
    ) {
      return false;
    }
    const filters = index.fields.slice(0, shape.where.length);
    const orders = index.fields.slice(shape.where.length);
    const filtersMatch =
      filters.length === shape.where.length &&
      shape.where.every((w) =>
        filters.some(
          (f) =>
            f.fieldPath === w.field &&
            (w.op === "array-contains"
              ? f.arrayConfig === "CONTAINS"
              : f.order !== undefined),
        ),
      );
    const ordersMatch =
      orders.length === shape.orderBy.length &&
      shape.orderBy.every(
        (field, i) =>
          orders[i]?.fieldPath === field && orders[i]?.order === "ASCENDING",
      );
    return filtersMatch && ordersMatch;
  });
}

/** One filter and no orderBy on another field: served by the automatic single-field index. */
function singleFieldOk(shape: QueryShape): boolean {
  const [only, ...rest] = shape.where;
  if (!only || rest.length > 0) return false;
  if (shape.orderBy.some((field) => field !== only.field)) return false;
  return !indexFile.fieldOverrides.some(
    (o) =>
      o.collectionGroup === shape.collectionGroup &&
      o.fieldPath === only.field &&
      o.indexes.length === 0,
  );
}

describe("repository queries: index coverage", () => {
  const app = initializeApp(
    { projectId: "demo-starflames-shapes" },
    "repository-indexes",
  );
  const db = getFirestore(app);
  after(() => deleteApp(app));

  const built: Record<QueryName, Query> = {
    products: catalogQueries.products(db),
    productsInCollection: catalogQueries.productsInCollection(db, SAMPLE_PARAM),
    bestsellers: catalogQueries.bestsellers(db),
    collections: catalogQueries.collections(db),
    productIds: catalogQueries.productIds(db),
    collectionIds: catalogQueries.collectionIds(db),
  };

  function fromShape(shape: QueryShape): Query {
    let query: Query = db.collection(shape.collectionGroup);
    for (const w of shape.where) {
      query = query.where(
        w.field,
        w.op,
        typeof w.value === "string" ? w.value : SAMPLE_PARAM,
      );
    }
    for (const field of shape.orderBy) query = query.orderBy(field);
    return shape.select ? query.select(...shape.select) : query;
  }

  for (const [name, shape] of Object.entries(QUERY_SHAPES) as [
    QueryName,
    QueryShape,
  ][]) {
    it(`${name}: the shape is the query the repository runs`, () => {
      // withConverter(null) drops the domain converter, so only the query itself is compared.
      assert.ok(fromShape(shape).isEqual(built[name].withConverter(null)));
    });

    it(`${name}: covered by an index`, () => {
      assert.ok(
        compositeFor(shape) !== undefined || singleFieldOk(shape),
        `${name} needs a composite index in firestore.indexes.json`,
      );
    });

    it(`${name}: filters status == "published"`, () => {
      assert.ok(
        shape.where.some(
          (w) =>
            w.field === "status" && w.op === "==" && w.value === "published",
        ),
      );
    });
  }

  it("has a shape for every query", () => {
    assert.deepEqual(
      Object.keys(QUERY_SHAPES).sort(),
      Object.keys(catalogQueries).sort(),
    );
  });

  it("the composite-index matcher refuses a shape with no index", () => {
    const shape: QueryShape = {
      collectionGroup: "products",
      where: [
        { field: "type", op: "==", value: "jar" },
        { field: "status", op: "==", value: "published" },
      ],
      orderBy: ["priceFrom"],
      select: null,
    };
    assert.equal(compositeFor(shape), undefined);
    assert.equal(singleFieldOk(shape), false);
  });

  it("no repository builds a where() or orderBy() outside catalogQueries", () => {
    const dir = "lib/firebase/repositories";
    const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));
    assert.ok(files.includes("catalog-reads.ts"));
    for (const file of files) {
      let source = readFileSync(join(dir, file), "utf8");
      if (file === "catalog-reads.ts") {
        // The object literal from its first line to the first "};" at column 0.
        const block = /^export const catalogQueries = \{$[\s\S]*?^\};$/m;
        assert.match(source, block, "catalogQueries block found");
        source = source.replace(block, "");
      }
      for (const call of [".where(", ".orderBy("]) {
        assert.equal(
          source.includes(call),
          false,
          `${file}: ${call} outside catalogQueries (add the query there, with a shape)`,
        );
      }
    }
  });
});
