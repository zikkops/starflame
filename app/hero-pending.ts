// Hero entrance without a flash (motion.md §5.1). Inline and synchronous in <head>,
// before first paint: when motion is allowed, mark <html> `hero-pending` so that
// [data-hero-reveal] elements start hidden (globals.css), and reveal them anyway
// after 2500 ms if the hero's GSAP code never takes over. No JS or reduced motion:
// the class is never added, so nothing is hidden.
//
// Keep this a constant string (no interpolation): a future Content Security Policy
// allows it by hash, e.g. script-src 'sha256-<base64 of this exact text>'.
export const HERO_PENDING_SCRIPT = `(function(){try{if(matchMedia("(prefers-reduced-motion: no-preference)").matches){var d=document.documentElement;d.classList.add("hero-pending");setTimeout(function(){d.classList.remove("hero-pending")},2500)}}catch(e){}})()`;
