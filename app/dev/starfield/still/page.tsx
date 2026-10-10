import type { Metadata } from "next";

import { requireDevPages } from "../../gate";
import {
  StarfieldPreviewPage,
  starfieldPreviewMetadata,
} from "../StarfieldPreviewPage";

// Dev-only starfield preview (starfield.md §13.1, app/dev/gate.ts):
// the still frame (state static from the server).
// Static: a constant preview prop, no searchParams.
const HREF = "/dev/starfield/still";

export function generateMetadata(): Metadata {
  requireDevPages();
  return starfieldPreviewMetadata(HREF);
}

export default function StarfieldStillPreview() {
  requireDevPages();
  return <StarfieldPreviewPage current={HREF} />;
}
