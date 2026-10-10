import Link from "next/link";

type SectionHeadingProps = {
  /** The h2's id; pass the same value to Section's `labelledBy`. */
  id: string;
  title: React.ReactNode;
  eyebrow?: React.ReactNode;
  /** The label names the destination ("Shop all bestsellers", never "View all"). */
  link?: { href: string; label: string };
  intro?: React.ReactNode;
  /** A page spec may pick another style for the h2, never another level. */
  titleClassName?: string;
  /** Eyebrow colour: gold-400 (text-accent) by default, gold-300 over `dusk`. */
  tone?: "default" | "dusk";
};

/**
 * Eyebrow + h2, the optional link beside them, the optional intro below, then
 * 48px to the content (layout-shell.md §5.3). DOM order: hgroup, link, intro.
 * Base: one column (eyebrow 12 h2 8 link, 16 to the intro). From md the row
 * holds only the hgroup and the link, the link on the h2's last baseline
 * (`items-baseline-last` = align-items: last baseline), wrapping under the
 * heading only when the row is too narrow.
 */
export function SectionHeading({
  id,
  title,
  eyebrow,
  link,
  intro,
  titleClassName = "type-h2",
  tone = "default",
}: SectionHeadingProps) {
  return (
    <div className="mb-12">
      <div className="flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-baseline-last md:justify-between md:gap-x-6">
        <hgroup className="flex min-w-0 flex-col gap-3 md:flex-[1_1_20rem]">
          {eyebrow ? (
            <p
              className={`type-eyebrow ${tone === "dusk" ? "text-gold-300" : "text-text-accent"}`}
            >
              {eyebrow}
            </p>
          ) : null}
          <h2 id={id} className={`${titleClassName} text-text-primary`}>
            {title}
          </h2>
        </hgroup>
        {link ? (
          <Link
            href={link.href}
            className="inline-flex min-h-(--size-touch) shrink-0 items-center gap-2 type-nav text-link underline decoration-1 underline-offset-[0.2em] transition-colors hover:text-link-hover"
          >
            {link.label}
            <svg
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 16 16"
              className="size-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" />
            </svg>
          </Link>
        ) : null}
      </div>
      {intro ? (
        <p className="mt-4 max-w-measure-intro type-body-lg text-text-secondary">
          {intro}
        </p>
      ) : null}
    </div>
  );
}
