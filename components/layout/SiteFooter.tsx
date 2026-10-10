import { Wordmark } from "@/components/brand/Wordmark";
import { CrescentIcon } from "@/components/icons/glyphs";
import { InstagramGlyph } from "@/components/icons/instagram";
import { PinterestGlyph } from "@/components/icons/pinterest";
import { SOCIAL_LINKS, type SocialLinks } from "@/lib/site/social";

import { NavLink } from "./header/NavLink";
import { footerGroup } from "./site-routes";

/** A collection in "Our collections" (footer.md §3.4). */
export type FooterCollection = { slug: string; name: string };

/**
 * /dev/footer only (footer.md §3.6): every registry entry as live, plus the data
 * that doesn't exist yet. It lives in the dev page, so placeholders never ship.
 */
export type FooterPreviewData = {
  social: SocialLinks;
  /** A static fixture of the catalog collections, Gift Sets excluded. */
  collections: readonly FooterCollection[];
  /** The slot outline (a client leaf), rendered at the newsletter slot's place. */
  slot: React.ReactNode;
};

// M2.7 adds a `newsletter` prop (default true; false on a page that already
// shows the full newsletter band, §2.4) with the teaser behind features.newsletter.
type SiteFooterProps = {
  preview?: FooterPreviewData;
};

type FooterLinkItem = { key: string; label: string; href: string };
type Group = {
  id: string;
  title: string;
  span: string;
  links: FooterLinkItem[];
};

// §2.3: the header drawer's line and glyph, so the brand speaks with one voice.
function BrandLine({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex flex-wrap items-center gap-2 type-body-sm text-text-secondary ${className}`}
    >
      <CrescentIcon decorative className="size-4 shrink-0 text-text-accent" />
      Candles for long, starlit evenings.
    </p>
  );
}

const RULE = "h-px bg-(image:--gradient-starlight-rule)";
// §4.1: main row → rule 48 (64 from lg); rule → legal row 24.
const RULE_GAP = "mt-12 lg:mt-16";

/**
 * The site footer (footer.md, layout-shell.md §7). A Server Component on opaque
 * bg-sunken above the starfield (--z-content), a direct child of <body>.
 * Everything comes from the route registry: a group, nav, list or slot with
 * nothing live is not rendered, and with none of them the footer is the minimal
 * sign-off (§4.2), else the standard composition (§4.3). Links are server-rendered
 * anchors (NavLink), so they work without JavaScript.
 *
 * The year is the build's: the page is static, so getFullYear() runs at build
 * time (§2.6; a rebuild is part of the new-year routine).
 */
export function SiteFooter({ preview }: SiteFooterProps) {
  const options = { preview: preview !== undefined };
  const entries = (group: "explore" | "help" | "legal") =>
    footerGroup(group, options).map(({ key, label, href }) => ({
      key,
      label,
      href,
    }));
  // M3.7: getCollections() (server-side, sortOrder, Gift Sets excluded, max 6)
  // once features["collection-pages"] is live. M1.17 reads no data at all.
  const collections: FooterLinkItem[] = (preview?.collections ?? []).map(
    ({ slug, name }) => ({
      key: slug,
      label: name,
      href: `/collections/${slug}`,
    }),
  );
  const groups: Group[] = [
    {
      id: "explore",
      title: "Explore",
      span: "col-span-2 md:col-span-3 lg:col-span-2",
      links: entries("explore"),
    },
    {
      id: "collections",
      title: "Our collections",
      span: "col-span-2 md:col-span-3",
      links: collections,
    },
    {
      id: "help",
      title: "Help",
      span: "col-span-2 lg:col-span-3",
      links: entries("help"),
    },
  ].filter((group) => group.links.length > 0);
  const legal = entries("legal");

  const social = preview?.social ?? SOCIAL_LINKS;
  const socials = [
    {
      key: "instagram",
      label: "Starflames on Instagram",
      href: social.instagram,
      Glyph: InstagramGlyph,
    },
    {
      key: "pinterest",
      label: "Starflames on Pinterest",
      href: social.pinterest,
      Glyph: PinterestGlyph,
    },
  ].flatMap(({ href, ...item }) => (href === null ? [] : [{ ...item, href }]));

  // The newsletter slot: only the dev outline until M2.7 (§2.4).
  const slot = preview?.slot ?? null;
  const peers = [...groups.flatMap((group) => group.links), ...legal].map(
    (link) => link.href,
  );
  const standard = groups.length > 0 || socials.length > 0 || slot !== null;
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-(--z-content) bg-bg-sunken pt-12 pb-[calc(--spacing(8)+env(safe-area-inset-bottom,0px))] md:pt-16 lg:pt-20 lg:pb-[calc(--spacing(10)+env(safe-area-inset-bottom,0px))] xl:pt-24 print:break-inside-avoid">
      {standard ? (
        <div className="page-container">
          {slot}
          <div className="flex flex-col gap-10 md:gap-12 lg:grid lg:grid-cols-12 lg:gap-(--grid-gap)">
            <div className="flex min-w-0 flex-col gap-6 md:flex-row md:items-end md:justify-between lg:col-span-4 lg:flex-col lg:items-start lg:justify-start">
              <div className="flex min-w-0 flex-col items-start gap-4">
                <Wordmark size="footer" className="text-wordmark" />
                <BrandLine />
              </div>
              {socials.length > 0 && (
                <ul
                  aria-label="Starflames on social media"
                  data-print="hide"
                  className="flex gap-2"
                >
                  {socials.map(({ key, label, href, Glyph }) => (
                    <li key={key}>
                      <a
                        href={href}
                        rel="me"
                        aria-label={label}
                        className="inline-flex size-(--size-touch) items-center justify-center rounded-pill border border-transparent transition-colors hover:border-link active:border-link [&>svg]:transition-[scale] [&>svg]:duration-(--duration-fast) [&>svg]:ease-standard active:[&>svg]:scale-(--motion-scale-press)"
                      >
                        <Glyph className="size-6" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {groups.length > 0 && (
              <nav
                aria-label="Footer"
                data-print="hide"
                className="min-w-0 lg:col-span-8"
              >
                <div className="grid grid-cols-4 gap-x-(--grid-gap) gap-y-8 md:grid-cols-8">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      data-group={group.id}
                      className={`min-w-0 ${group.span}`}
                    >
                      <h2
                        id={`footer-${group.id}`}
                        className="type-h4 text-text-primary"
                      >
                        {group.title}
                      </h2>
                      <ul
                        aria-labelledby={`footer-${group.id}`}
                        className="mt-2"
                      >
                        {group.links.map((link) => (
                          <li key={link.key}>
                            <NavLink
                              href={link.href}
                              label={link.label}
                              variant="footer"
                              peers={peers}
                              preview={options.preview}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </nav>
            )}
          </div>
          <div
            aria-hidden="true"
            data-decorative=""
            className={`${RULE} ${RULE_GAP}`}
          />
          <div className="mt-6 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:justify-between">
            <p className="type-body-sm text-text-muted">© {year} Starflames</p>
            {legal.length > 0 && (
              <nav aria-label="Legal" data-print="hide">
                <ul className="flex flex-wrap gap-x-6">
                  {legal.map((link) => (
                    <li key={link.key}>
                      <NavLink
                        href={link.href}
                        label={link.label}
                        variant="legal"
                        peers={peers}
                        preview={options.preview}
                      />
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      ) : (
        <div className="page-container flex flex-col items-center text-center">
          <Wordmark size="footer" className="text-wordmark" />
          <BrandLine className="mt-4 justify-center" />
          <div
            aria-hidden="true"
            data-decorative=""
            className={`${RULE} ${RULE_GAP} w-[min(100%,20rem)]`}
          />
          <p className="mt-6 type-body-sm text-text-muted">
            © {year} Starflames
          </p>
        </div>
      )}
    </footer>
  );
}
