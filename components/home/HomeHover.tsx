"use client";

import { useEffect } from "react";

/**
 * GSAP hover effects for cards (user request, 2026-10-10). Mouse and trackpad
 * only (`(hover: hover) and (pointer: fine)`), and off under reduced motion and
 * `html[data-motion="off"]`, so touch phones never get a stuck hover state.
 * gsap is loaded lazily after the page is idle, outside the first load.
 *
 * One delegated listener on the document, so cards that appear later (the
 * shop's filtered results) animate too. Each card's timeline is built on its
 * first hover and kept in a WeakMap.
 *
 * Markup hooks:
 * - `[data-hover-card]`: the element that lifts
 * - `[data-hover-ring]`: an arch outline that brightens
 * - `[data-hover-glow]`: a soft candle glow that fades in
 * - `[data-hover-name]`: the name that shifts to starlight gold
 *
 * The photos are never animated: zooming or filtering an image inside a
 * clipped arch made Chromium flash black mid-hover.
 */
export function HomeHover() {
  useEffect(() => {
    let revert: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      const { gsap } = await import("gsap");
      if (cancelled) return;

      const mm = gsap.matchMedia();
      mm.add(
        "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        () => {
          if (document.documentElement.dataset.motion === "off") return;
          const timelines = new WeakMap<HTMLElement, gsap.core.Timeline>();
          const all = new Set<gsap.core.Timeline>();

          const timelineFor = (card: HTMLElement) => {
            let tl = timelines.get(card);
            if (tl) return tl;
            const ring = card.querySelector<HTMLElement>("[data-hover-ring]");
            const glow = card.querySelector<HTMLElement>("[data-hover-glow]");
            const name = card.querySelector<HTMLElement>("[data-hover-name]");
            tl = gsap.timeline({
              paused: true,
              defaults: { duration: 0.6, ease: "power3.out" },
            });
            // force3D keeps the card on one GPU layer, so it never re-rasters
            // at the end of the tween (a one-frame flash otherwise).
            tl.to(card, { y: -10, force3D: true }, 0);
            if (ring) tl.to(ring, { borderColor: "rgb(232 207 150 / 0.9)" }, 0);
            if (glow) tl.to(glow, { opacity: 1 }, 0);
            if (name) tl.to(name, { color: "#E8CF96", duration: 0.35 }, 0);
            timelines.set(card, tl);
            all.add(tl);
            return tl;
          };

          const cardOf = (target: EventTarget | null) =>
            target instanceof Element
              ? target.closest<HTMLElement>("[data-hover-card]")
              : null;

          const over = (event: PointerEvent) => {
            const card = cardOf(event.target);
            if (!card || card.contains(event.relatedTarget as Node | null))
              return;
            timelineFor(card).timeScale(1).play();
          };
          const out = (event: PointerEvent) => {
            const card = cardOf(event.target);
            if (!card || card.contains(event.relatedTarget as Node | null))
              return;
            timelines.get(card)?.timeScale(1.6).reverse();
          };

          document.addEventListener("pointerover", over);
          document.addEventListener("pointerout", out);
          return () => {
            document.removeEventListener("pointerover", over);
            document.removeEventListener("pointerout", out);
            all.forEach((tl) => tl.revert());
          };
        },
      );
      revert = () => mm.revert();
    };

    // Safari has no requestIdleCallback: a short timeout stands in.
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(() => void start())
      : setTimeout(() => void start(), 200);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idle as number);
      else clearTimeout(idle);
      revert?.();
    };
  }, []);

  return null;
}
