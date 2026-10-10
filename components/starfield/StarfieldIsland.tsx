"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import type { StarfieldPreview } from "./starfield-data";
import type { StarfieldController } from "./starfield-motion";

/**
 * The starfield's loader (starfield.md §5, §9, §14.1): renders nothing; after
 * `load` plus an idle callback (2s timeout; 1.5s timer where there is none) it
 * imports the motion module, a separate chunk, and starts it on the slot. The
 * layout persists across navigations, so a path change is passed on, not a
 * remount.
 */
export function StarfieldIsland({ still, streak }: StarfieldPreview) {
  const pathname = usePathname();
  const controller = useRef<StarfieldController | null>(null);

  useEffect(() => {
    let live = true;
    let idle = 0;
    let timer = 0;
    const start = () => {
      void import("./starfield-motion").then(({ startStarfield }) => {
        const slot = document.querySelector<HTMLElement>("[data-starfield]");
        if (live && slot) {
          controller.current = startStarfield(slot, { still, streak });
        }
      });
    };
    const afterLoad = () => {
      if (typeof requestIdleCallback === "function") {
        idle = requestIdleCallback(start, { timeout: 2000 });
      } else {
        timer = window.setTimeout(start, 1500);
      }
    };
    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });
    return () => {
      live = false;
      window.removeEventListener("load", afterLoad);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
      controller.current?.destroy();
      controller.current = null;
    };
  }, [still, streak]);

  useEffect(() => {
    controller.current?.onRouteChange();
  }, [pathname]);

  return null;
}
