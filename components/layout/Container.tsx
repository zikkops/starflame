type ContainerProps = {
  /** `prose` adds a centred 680px wrapper for long copy (layout-shell.md §4.2). */
  variant?: "content" | "prose";
  className?: string;
  children: React.ReactNode;
};

/**
 * The only way content gets side padding and a maximum width: --page-inline-*
 * padding (the gutter, or the notch inset if wider) around a content box that
 * caps at 1280px (the `page-container` utility in globals.css). Text inside a
 * prose container also sets its own measure (`max-w-measure-prose`).
 * The prose wrapper reads --container-prose directly: Tailwind's own `prose`
 * max-width is a fixed 65ch that wins over the theme key, and a ch width
 * changes when the web font swaps in. (Not spelled out as a class here: the
 * scanner would emit it from this comment.)
 * data-open-sky: a falling star may cross the Container's own empty space
 * (starfield.md §4.5); so it never holds a bare text node, only elements.
 */
export function Container({
  variant = "content",
  className,
  children,
}: ContainerProps) {
  return (
    <div
      data-open-sky=""
      className={`page-container ${className ?? ""}`.trim()}
    >
      {variant === "prose" ? (
        <div className="mx-auto max-w-(--container-prose)">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}
