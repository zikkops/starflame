import { StarfieldIsland } from "@/components/starfield/StarfieldIsland";
import { StarfieldLayer } from "@/components/starfield/StarfieldLayer";
import type { StarfieldPreview } from "@/components/starfield/starfield-data";

/**
 * The fixed background layer (layout-shell.md §8, starfield.md). It holds the
 * server-rendered static sky (SVG and spans, never haze), so the stars are there
 * at first paint without JavaScript, and the island that loads the motion module
 * after `load` plus idle (§8.1, §8.3). Sized to the large viewport from the top,
 * so it never resizes while mobile toolbars move. data-decorative: removed under
 * forced colors and in print (globals.css). `preview` comes only from the
 * /dev/starfield pages; `still` renders the static state on the server.
 */
export function StarfieldSlot({
  preview = {},
}: {
  preview?: StarfieldPreview;
}) {
  return (
    <div
      data-starfield=""
      data-decorative=""
      aria-hidden="true"
      data-starfield-state={preview.still ? "static" : undefined}
      className="pointer-events-none fixed inset-x-0 top-0 z-(--z-starfield) h-lvh"
    >
      <StarfieldLayer />
      <StarfieldIsland still={preview.still} streak={preview.streak} />
    </div>
  );
}
