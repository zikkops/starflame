import type { Page } from "@playwright/test";

type Rect = { x: number; y: number; width: number; height: number };

/** One layout-shift entry and the nodes that moved (layout-shift `sources`). */
export type Shift = {
  value: number;
  startTime: number;
  sources: { node: string; previousRect: Rect; currentRect: Rect }[];
};

/**
 * Every layout-shift entry without recent input, once the fonts have settled,
 * with its sources: a short selector path for each moved node ("" if the node
 * is gone) and its rects. layout-shift entries are only exposed to a buffered
 * PerformanceObserver.
 */
export async function layoutShifts(
  page: Page,
): Promise<{ total: number; shifts: Shift[] }> {
  return page.evaluate(async () => {
    await document.fonts.ready;
    // tag#id[data-*] for the node and up to three ancestors, nearest last.
    const describe = (node: Node | null | undefined): string => {
      const parts: string[] = [];
      let el: Element | null =
        node instanceof Element ? node : (node?.parentElement ?? null);
      if (node && !(node instanceof Element)) parts.push(node.nodeName);
      for (let depth = 0; el && depth < 4; depth++, el = el.parentElement) {
        const data = [...el.attributes]
          .filter((a) => a.name.startsWith("data-"))
          .map((a) => `[${a.name}]`)
          .join("");
        parts.unshift(
          `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}${data}`,
        );
      }
      return node ? parts.join(" > ") : "";
    };
    const rect = (r: DOMRectReadOnly): Rect => ({
      x: r.x,
      y: r.y,
      width: r.width,
      height: r.height,
    });
    return new Promise<{ total: number; shifts: Shift[] }>((resolve) => {
      const shifts: Shift[] = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
          sources: {
            node?: Node | null;
            previousRect: DOMRectReadOnly;
            currentRect: DOMRectReadOnly;
          }[];
        })[]) {
          if (entry.hadRecentInput) continue;
          shifts.push({
            value: entry.value,
            startTime: entry.startTime,
            sources: entry.sources.map((s) => ({
              node: describe(s.node),
              previousRect: rect(s.previousRect),
              currentRect: rect(s.currentRect),
            })),
          });
        }
      }).observe({ type: "layout-shift", buffered: true });
      setTimeout(
        () =>
          resolve({
            total: shifts.reduce((sum, s) => sum + s.value, 0),
            shifts,
          }),
        500,
      );
    });
  });
}

/** Sum of layout-shift values (without recent input) once the fonts have settled. */
export async function layoutShift(page: Page): Promise<number> {
  return (await layoutShifts(page)).total;
}
