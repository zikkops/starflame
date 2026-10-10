import Link from "next/link";

// Each page's own intro (footer.md §9.1).
const STATES = [
  {
    label: "Full",
    href: "/dev/footer",
    intro:
      "Every footer link is shown here as if its page existed. Links to pages that aren't built yet go nowhere.",
  },
  {
    label: "Minimal (as shipped in M1.17)",
    href: "/dev/footer/minimal",
    intro:
      "This is the footer exactly as it ships today: no links are live yet, so it shows only the sign-off.",
  },
] as const;

/**
 * The h1, each page's own intro and the "Footer state" link pair of both
 * footer preview pages (footer.md §3.6, §9.1). Both routes exist, so next/link
 * is fine.
 */
export function FooterPreviewIntro({
  current,
}: {
  current: (typeof STATES)[number]["href"];
}) {
  return (
    <>
      <h1 className="mb-4 type-h1">Footer preview</h1>
      <p className="mb-8 max-w-measure-intro type-body text-text-secondary">
        {STATES.find((state) => state.href === current)?.intro}
      </p>
      <p id="footer-state" className="type-body-sm text-text-secondary">
        Footer state
      </p>
      <ul
        aria-labelledby="footer-state"
        className="mb-8 flex flex-wrap gap-x-6"
      >
        {STATES.map((state) => (
          <li key={state.href}>
            <Link
              href={state.href}
              aria-current={state.href === current ? "page" : undefined}
              className="inline-flex min-h-(--size-touch) items-center type-body text-link underline underline-offset-[0.25em] transition-colors hover:text-link-hover aria-[current=page]:text-text-primary aria-[current=page]:no-underline"
            >
              {state.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
