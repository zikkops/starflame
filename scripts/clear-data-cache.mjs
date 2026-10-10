// Removes Next's persisted data cache (the unstable_cache entries of the repositories, M1.6) so
// that a build prerenders from what is in Firestore now. `next build` otherwise reuses entries
// left in .next/cache/fetch-cache by an earlier build or `next start` (revalidate: false keeps
// them until a tag is revalidated). Runs as `prebuild` and before the e2e build, so build with
// `npm run build` (or `npm run test:e2e`), never `npx next build`. `next dev` keeps its own
// entries in .next/dev/cache/fetch-cache, and a running `next dev` also holds them in memory:
// `npm run seed` deletes both folders (M1.8), and after a reseed or a repository code change a
// running dev server needs one hard reload (Ctrl+Shift+R) or a restart. Node only.
import { rmSync } from "node:fs";

rmSync(".next/cache/fetch-cache", { recursive: true, force: true });
