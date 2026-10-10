/**
 * The first element in <body> and so the first tab stop (layout-shell.md §3).
 * Visually hidden until focused (`:focus`, not only `:focus-visible`), then a
 * fixed pill over the header, so showing it never shifts layout. A plain anchor:
 * it works without JavaScript, and #main (tabindex -1) takes focus on arrival.
 * `skip-link` is the print hook (globals.css section 9).
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="skip-link fixed start-(--page-inline-start) top-[calc(env(safe-area-inset-top,0px)+--spacing(2))] z-(--z-skip-link) inline-flex min-h-(--size-touch) items-center rounded-pill border border-border-ghost bg-bg-overlay px-6 py-3 type-button text-text-primary shadow-overlay not-focus:sr-only"
    >
      Skip to content
    </a>
  );
}
