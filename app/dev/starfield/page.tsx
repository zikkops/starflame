import type { Metadata } from "next";

import { requireDevPages } from "../gate";
import {
  StarfieldPreviewPage,
  starfieldPreviewMetadata,
} from "./StarfieldPreviewPage";

// Dev-only starfield preview (starfield.md §13.1, app/dev/gate.ts):
// the live sky, as on any customer page.
// Static: a constant preview prop, no searchParams.
const HREF = "/dev/starfield";

export function generateMetadata(): Metadata {
  requireDevPages();
  return starfieldPreviewMetadata(HREF);
}

export default function StarfieldLivePreview() {
  requireDevPages();
  return <StarfieldPreviewPage current={HREF} />;
}
