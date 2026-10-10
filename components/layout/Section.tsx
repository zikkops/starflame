/**
 * Band vocabulary (layout-shell.md §5.2). `plain` is the default. Product grids
 * go only in `plain` or `solid`; form controls never in `dusk`; one haze-family
 * band (`haze`, `dusk`) per view. Styles live in globals.css ([data-band]).
 */
export type Band = "plain" | "solid" | "sunken" | "haze" | "dusk";

type SectionProps = {
  band?: Band;
  /** The id of the section's h2: makes a major section a named region (§5.3). */
  labelledBy?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * A full-bleed band with --section-y block padding; its content goes in a
 * Container. A band directly after a band with the same background drops its top
 * padding, so they are one --section-y apart (§5.1).
 */
export function Section({
  band = "plain",
  labelledBy,
  className,
  children,
}: SectionProps) {
  return (
    <section
      data-band={band}
      aria-labelledby={labelledBy}
      className={className}
    >
      {children}
    </section>
  );
}
