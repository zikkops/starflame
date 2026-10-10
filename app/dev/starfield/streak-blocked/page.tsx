import type { Metadata } from "next";

import { requireDevPages } from "../../gate";
import {
  StarfieldPreviewPage,
  starfieldPreviewMetadata,
} from "../StarfieldPreviewPage";

// Dev-only starfield preview (starfield.md §13.1, app/dev/gate.ts):
// the demo path aimed at the caption, so every attempt is refused.
// Static: a constant preview prop, no searchParams.
const HREF = "/dev/starfield/streak-blocked";

export function generateMetadata(): Metadata {
  requireDevPages();
  return starfieldPreviewMetadata(HREF);
}

export default function StarfieldStreakBlockedPreview() {
  requireDevPages();
  return <StarfieldPreviewPage current={HREF} />;
}
