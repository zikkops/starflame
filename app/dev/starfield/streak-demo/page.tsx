import type { Metadata } from "next";

import { requireDevPages } from "../../gate";
import {
  StarfieldPreviewPage,
  starfieldPreviewMetadata,
} from "../StarfieldPreviewPage";

// Dev-only starfield preview (starfield.md §13.1, app/dev/gate.ts):
// a falling star every 3s on the fixed demo path (§13.3).
// Static: a constant preview prop, no searchParams.
const HREF = "/dev/starfield/streak-demo";

export function generateMetadata(): Metadata {
  requireDevPages();
  return starfieldPreviewMetadata(HREF);
}

export default function StarfieldStreakDemoPreview() {
  requireDevPages();
  return <StarfieldPreviewPage current={HREF} />;
}
