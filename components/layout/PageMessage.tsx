import { Container } from "./Container";
import { Section } from "./Section";

/** A text link in running UI: gold-300, always underlined, 44px hit area. */
export const TEXT_LINK_CLASS =
  "inline-flex min-h-(--size-touch) items-center type-body text-link underline decoration-1 underline-offset-[0.2em] transition-colors hover:text-link-hover";

/** The ghost button (tokens.md §2.3); not ember, which is for shopping actions. */
export const GHOST_BUTTON_CLASS =
  "inline-flex min-h-12 items-center rounded-pill border border-border-ghost px-6 type-button text-text-primary transition-colors hover:border-border-accent hover:bg-bg-raised active:bg-bg-overlay";

type PageMessageProps = {
  title: string;
  body: string;
  /** The action(s): a ghost button and/or a text link. */
  children: React.ReactNode;
};

/**
 * Error and not-found content (layout-shell.md §10): one plain section, the
 * prose container, the page's h1 styled type-h2, a paragraph, then the actions
 * 24px below. Usable from Server and Client Components (no server-only code).
 */
export function PageMessage({ title, body, children }: PageMessageProps) {
  return (
    <Section>
      <Container variant="prose">
        <h1 className="type-h2 text-text-primary">{title}</h1>
        <p className="mt-4 max-w-measure-prose type-body text-text-secondary">
          {body}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          {children}
        </div>
      </Container>
    </Section>
  );
}
