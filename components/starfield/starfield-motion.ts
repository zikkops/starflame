import { DURATION, EASE_CSS } from "@/lib/motion/tokens";

import type { StarfieldPreview } from "./starfield-data";

/**
 * The starfield's motion module (starfield.md §4.5, §6, §13.1), loaded by
 * StarfieldIsland after `load` plus idle. It owns the slot's state attribute
 * (animating / paused / static; the CSS twinkle follows it), and the falling
 * star: a WAAPI streak through verified open sky, appended to the slot (a
 * sibling of main), cancelled at once by scroll, input, navigation or any
 * change in main. It writes nothing inside main, ever.
 */

export type StarfieldController = {
  onRouteChange(): void;
  destroy(): void;
};

type State = "animating" | "paused" | "static";
type Skip = "edge" | "null" | "text";
type Path = {
  /** The head at the start, in viewport px. */
  x: number;
  y: number;
  /** Unit direction (down and toward one side). */
  dx: number;
  dy: number;
  travel: number;
  trail: number;
  /** Corridor half-width. */
  half: number;
  thick: number;
};
type Flight = { el: HTMLElement; anim: Animation; observers: Observer[] };
type Observer = { disconnect(): void };

const IDLE_MS = 60_000;
const SCROLL_LOCK_MS = 1000;
const MAX_STREAKS = 6;
const DEMO_EVERY_MS = 3000;
/** What a sample may hit: open sky (§4.5 check 3). */
const OPEN_SKY = 'html,body,main#main,[data-band="plain"],[data-open-sky]';
const INPUTS = ["scroll", "wheel", "touchmove", "pointerdown", "keydown"];
const SCROLLS = ["scroll", "wheel", "touchmove"];

const rand = (lo: number, hi: number): number => lo + Math.random() * (hi - lo);

export function startStarfield(
  slot: HTMLElement,
  preview: StarfieldPreview = {},
): StarfieldController {
  const html = document.documentElement;
  const sky = slot.querySelector<HTMLElement>("[data-sf-sky]");
  const mode = preview.streak ?? "on";
  const demo = mode === "demo" || mode === "demo-blocked";
  const prefs = [
    "(prefers-reduced-motion: reduce)",
    "(forced-colors: active)",
    "(prefers-contrast: more)",
  ].map((q) => matchMedia(q));
  const md = matchMedia("(min-width: 48rem)");
  const short = matchMedia("(max-height: 28rem)");
  // Each changes --header-h or the tier, and so the band (§6.2).
  const bandQueries = [
    md,
    matchMedia("(min-width: 64rem)"),
    matchMedia("(min-width: 90rem)"),
    short,
  ];

  let state: State | undefined;
  let visible = new Set<Element>();
  let io: IntersectionObserver | undefined;
  let band = -1;
  let lastInput = performance.now();
  let lastScroll = -Infinity;
  let timer = 0;
  let idleTimer = 0;
  let count = 0;
  let started = false;
  let flight: Flight | undefined;

  const attr = (name: string, value: string) => slot.setAttribute(name, value);
  attr("data-sf-streaks", "0");

  function compute(): State {
    if (
      preview.still ||
      html.dataset.motion === "off" ||
      prefs.some((q) => q.matches)
    ) {
      return "static";
    }
    if (
      document.hidden ||
      visible.size === 0 ||
      performance.now() - lastInput >= IDLE_MS
    ) {
      return "paused";
    }
    return "animating";
  }

  function update(): void {
    const next = compute();
    clearTimeout(idleTimer);
    if (next === "animating") {
      idleTimer = window.setTimeout(
        update,
        lastInput + IDLE_MS - performance.now(),
      );
    }
    if (next === state) return;
    state = next;
    attr("data-starfield-state", next);
    clearTimeout(timer);
    if (next === "animating") {
      // Afresh: leaving `paused` never fires a burst of missed streaks.
      schedule(demo ? 0 : started ? rand(10e3, 16e3) : rand(6e3, 12e3));
    } else {
      cancel();
    }
  }

  function schedule(delay: number): void {
    if (mode === "off" || (!demo && count >= MAX_STREAKS)) return;
    timer = window.setTimeout(attempt, delay);
  }

  /* ── Paths and the corridor check (§4.5, §13.3) ── */

  const wide = (): boolean => md.matches && !short.matches;

  /** Where samples may lie: inside the layer and the viewport, 16px from its
      edges, 24px below the header band. */
  function bounds() {
    const layer = slot.getBoundingClientRect();
    const top = sky ? sky.getBoundingClientRect().top : layer.top;
    return {
      left: Math.max(layer.left, 0) + 16,
      top: top + 24,
      right: Math.min(layer.right, html.clientWidth) - 16,
      bottom: Math.min(layer.bottom, html.clientHeight) - 16,
    };
  }

  function shape(
    x: number,
    y: number,
    deg: number,
    dir: number,
    travel: number,
  ): Path {
    const big = wide();
    const a = (deg * Math.PI) / 180;
    return {
      x,
      y,
      dx: Math.cos(a) * dir,
      dy: Math.sin(a),
      travel,
      trail: big ? 72 : 48,
      half: big ? 16 : 12,
      thick: big ? 1.5 : 1,
    };
  }

  function randomPath(): Path | undefined {
    const big = wide();
    const p = shape(
      0,
      0,
      rand(15, 30),
      Math.random() < 0.5 ? -1 : 1,
      big ? rand(200, 280) : rand(120, 180),
    );
    // The corridor's box relative to the head's start; place it inside bounds.
    const nx = p.dy * p.half;
    const ny = Math.abs(p.dx) * p.half;
    const xs = [-p.dx * p.trail, p.dx * p.travel];
    const b = bounds();
    const x0 = b.left - (Math.min(...xs) - nx);
    const x1 = b.right - (Math.max(...xs) + nx);
    const y0 = b.top - (-p.dy * p.trail - ny);
    const y1 = b.bottom - (p.dy * p.travel + ny);
    if (x1 < x0 || y1 < y0) return undefined;
    return { ...p, x: rand(x0, x1), y: rand(y0, y1) };
  }

  /** The demo's fixed path (§13.3): 20°, toward the inline end, from inside the
      spacer (demo) or from the caption below it (demo-blocked). */
  function demoPath(): Path | undefined {
    const open = mode === "demo";
    const target = document.querySelector(
      `[data-sf-demo="${open ? "open" : "text"}"]`,
    );
    if (!target) return undefined;
    const big = wide();
    const r = target.getBoundingClientRect();
    const y = open ? (big ? 64 : 56) : 8;
    return shape(r.left + (big ? 104 : 76), r.top + y, 20, 1, big ? 240 : 160);
  }

  /** Samples at most 8px apart on five lines across the corridor; per sample:
      edge, then null, then open sky. The first failure names the reason. */
  function check(p: Path): Skip | undefined {
    const b = bounds();
    const length = p.trail + p.travel;
    const steps = Math.ceil(length / 8);
    for (let k = -2; k <= 2; k++) {
      const off = (k * p.half) / 2;
      for (let i = 0; i <= steps; i++) {
        const t = -p.trail + (i * length) / steps;
        const x = p.x + p.dx * t - p.dy * off;
        const y = p.y + p.dy * t + p.dx * off;
        if (x < b.left || x > b.right || y < b.top || y > b.bottom) {
          return "edge";
        }
        const hit = document.elementFromPoint(x, y);
        if (!hit) return "null";
        if (!hit.matches(OPEN_SKY)) return "text";
      }
    }
    return undefined;
  }

  /**
   * One launch attempt: up to three random paths, or the demo path checked three
   * times (the worst case). Each path is checked in its own task, so no task
   * does more than one corridor of hit tests; each task is one sf-attempt
   * measure. A random path launches as soon as it is open; the demo launches
   * in the task of its third check, and only if none of the three refused
   * (`refused` is carried from task to task).
   */
  function attempt(step = 0, refused = false): void {
    started = true;
    performance.mark("sf-attempt-start");
    let more = false;
    if (
      state === "animating" &&
      !flight &&
      performance.now() - lastScroll >= SCROLL_LOCK_MS &&
      !document.querySelector("dialog[open]")
    ) {
      const path = demo ? demoPath() : randomPath();
      const skip = path ? check(path) : "edge";
      if (skip) attr("data-sf-last-skip", skip);
      // Random paths are independent; the demo's three checks are one decision.
      refused = demo && (refused || skip !== undefined);
      more = step < 2 && (demo || skip !== undefined);
      if (!skip && !refused && !more) launch(path!);
    }
    performance.measure("sf-attempt", "sf-attempt-start");
    if (more) timer = window.setTimeout(attempt, 0, step + 1, refused);
    else schedule(demo ? DEMO_EVERY_MS : rand(10e3, 16e3));
  }

  /* ── The streak ── */

  function launch(p: Path): void {
    const el = document.createElement("span");
    el.setAttribute("data-sf-streak", "");
    el.style.width = `${p.trail}px`;
    el.style.height = `${p.thick}px`;
    slot.append(el);
    const deg = (Math.atan2(p.dy, p.dx) * 180) / Math.PI;
    // transform-origin is the head (the element's end), so the head sits on the path.
    const at = (t: number) =>
      `translate(${p.x + p.dx * t - p.trail}px,${p.y + p.dy * t - p.thick / 2}px) rotate(${deg}deg)`;
    const anim = el.animate(
      [
        { transform: at(0), opacity: 0 },
        { opacity: 1, offset: 0.15 },
        { opacity: 1, offset: 0.55 },
        { transform: at(p.travel), opacity: 0 },
      ],
      { duration: DURATION.fallingStar * 1000, easing: EASE_CSS.linear },
    );
    const observers: Observer[] = [];
    const main = document.getElementById("main");
    if (main) {
      // Only a real change of main's size cancels: the initial notification
      // reports the size recorded here.
      const { width, height } = main.getBoundingClientRect();
      const resize = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const box = entry.borderBoxSize[0];
          if (
            box &&
            (Math.abs(box.inlineSize - width) > 0.5 ||
              Math.abs(box.blockSize - height) > 0.5)
          ) {
            cancel();
          }
        }
      });
      resize.observe(main, { box: "border-box" });
      const mutation = new MutationObserver(cancel);
      mutation.observe(main, {
        childList: true,
        subtree: true,
        characterData: true,
        attributeFilter: ["class", "style", "hidden", "open"],
      });
      observers.push(resize, mutation);
    }
    const current: Flight = { el, anim, observers };
    flight = current;
    count++;
    attr("data-sf-streaks", String(count));
    anim.finished.then(
      () => flight === current && drop(),
      () => {},
    );
  }

  function drop(): Flight | undefined {
    const f = flight;
    flight = undefined;
    f?.observers.forEach((o) => o.disconnect());
    f?.el.remove();
    return f;
  }

  /** At once, no fade: hidden in the same task, then removed. */
  function cancel(): void {
    const f = flight;
    if (!f) return;
    f.anim.cancel();
    f.el.style.opacity = "0";
    drop();
  }

  /* ── Triggers (§6.2) ── */

  function onInput(event: Event): void {
    lastInput = performance.now();
    if (SCROLLS.includes(event.type)) lastScroll = lastInput;
    cancel();
    if (state === "paused") update();
  }

  /** Plain bands in view below the header band; rootMargin takes px only. */
  function observe(): void {
    io?.disconnect();
    const seen = new Set<Element>();
    io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target);
          else seen.delete(entry.target);
        }
        visible = seen;
        update();
      },
      { rootMargin: `-${band}px 0px 0px 0px` },
    );
    const bands = document.querySelectorAll('[data-band="plain"]');
    bands.forEach((el) => io?.observe(el));
    if (bands.length === 0) {
      visible = seen;
      update();
    }
  }

  function measure(): void {
    const next = sky
      ? Math.ceil(
          sky.getBoundingClientRect().top - slot.getBoundingClientRect().top,
        )
      : 0;
    if (next === band) return;
    band = next;
    observe();
  }

  const onResize = () => cancel();
  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted) update();
  };
  const skyObserver = new ResizeObserver(measure);
  const motionObserver = new MutationObserver(update);

  for (const type of INPUTS) {
    addEventListener(type, onInput, { passive: true });
  }
  addEventListener("resize", onResize);
  addEventListener("pageshow", onPageShow);
  document.addEventListener("visibilitychange", update);
  // A dialog or popover opening (toggle doesn't bubble; capture sees it).
  document.addEventListener("toggle", onResize, true);
  prefs.forEach((q) => q.addEventListener("change", update));
  bandQueries.forEach((q) => q.addEventListener("change", measure));
  motionObserver.observe(html, { attributeFilter: ["data-motion"] });
  if (sky) skyObserver.observe(sky);
  measure();

  return {
    onRouteChange() {
      cancel();
      count = 0;
      started = false;
      attr("data-sf-streaks", "0");
      slot.removeAttribute("data-sf-last-skip");
      clearTimeout(timer);
      if (state === "animating") schedule(demo ? 0 : rand(6e3, 12e3));
      observe();
    },
    destroy() {
      cancel();
      clearTimeout(timer);
      clearTimeout(idleTimer);
      io?.disconnect();
      skyObserver.disconnect();
      motionObserver.disconnect();
      for (const type of INPUTS) removeEventListener(type, onInput);
      removeEventListener("resize", onResize);
      removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", update);
      document.removeEventListener("toggle", onResize, true);
      prefs.forEach((q) => q.removeEventListener("change", update));
      bandQueries.forEach((q) => q.removeEventListener("change", measure));
    },
  };
}
