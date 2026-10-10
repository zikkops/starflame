import Link from "next/link";

import { Wordmark } from "@/components/brand/Wordmark";
import { CrescentIcon, SearchIcon } from "@/components/icons/glyphs";

import { AccountLink } from "./header/AccountLink";
import { BagButton } from "./header/BagButton";
import { MobileMenu } from "./header/MobileMenu";
import { NavLink } from "./header/NavLink";
import { ICON_BUTTON, ICON_GLYPH } from "./header/styles";
import {
  headerAccount,
  headerBag,
  headerMore,
  headerPrimary,
} from "./site-routes";

type SiteHeaderProps = {
  /** /dev/header only: every registry entry as live, plain anchors. No state. */
  preview?: boolean;
};

/**
 * The site header (header.md, layout-shell.md §6). A Server Component: the bar is
 * rendered at its final size with every live item in place; the client islands
 * (nav links, account, bag, menu) render the same boxes on the server. Items
 * whose route isn't built are not rendered and take no space (§3.1).
 *
 * In flow and sticky at --z-header; not sticky on short viewports. The scrolled
 * surface (bg-raised, shadow, divider) is a ::before at opacity 0 that fades in
 * with data-scrolled (HeaderScrollState); without JavaScript it is always on.
 */
export function SiteHeader({ preview = false }: SiteHeaderProps) {
  const options = { preview };
  const primary = headerPrimary(options);
  const more = headerMore(options);
  const search = more.find((entry) => entry.key === "search") ?? null;
  const account = headerAccount(false, options) ?? headerAccount(true, options);
  const bag = headerBag(options);
  const peers = [...primary, ...more].map((entry) => entry.href);
  const hasDrawer = primary.length > 0 || more.length > 0 || account !== null;
  const hasEnd = search !== null || account !== null || bag !== null;

  return (
    <header className="sticky top-0 z-(--z-header) pt-[env(safe-area-inset-top,0px)] before:absolute before:inset-0 before:-z-1 before:border-b before:border-border-divider before:bg-bg-raised before:opacity-0 before:shadow-raised before:transition-opacity before:duration-(--duration-base) before:ease-standard data-[scrolled=true]:before:opacity-100 noscript:before:opacity-100 short:relative">
      <div className="page-container flex h-(--header-h) items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-x-8">
        <Link
          href="/"
          data-home-link=""
          className="inline-flex min-h-(--size-touch) items-center justify-self-start text-wordmark transition-colors hover:text-text-primary"
        >
          <Wordmark size="header" />
        </Link>

        {primary.length > 0 && (
          <nav aria-label="Primary" data-print="hide" className="max-lg:hidden">
            <ul className="flex gap-2">
              {primary.map((entry) => (
                <li key={entry.key}>
                  <NavLink
                    href={entry.href}
                    label={entry.label}
                    variant="bar"
                    peers={peers}
                    preview={preview}
                  />
                </li>
              ))}
            </ul>
          </nav>
        )}

        {(hasEnd || hasDrawer) && (
          <div className="flex items-center gap-2 lg:col-start-3 lg:justify-self-end">
            {hasEnd && (
              <div data-print="hide" className="flex items-center gap-2">
                {search &&
                  (preview ? (
                    <a
                      href={search.href}
                      aria-label={search.label}
                      className={`${ICON_BUTTON} max-md:hidden`}
                    >
                      <SearchIcon className={ICON_GLYPH} />
                    </a>
                  ) : (
                    <Link
                      href={search.href}
                      aria-label={search.label}
                      className={`${ICON_BUTTON} max-md:hidden`}
                    >
                      <SearchIcon className={ICON_GLYPH} />
                    </Link>
                  ))}
                {account && <AccountLink variant="bar" preview={preview} />}
                {bag && (
                  <BagButton
                    href={bag.href}
                    label={bag.label}
                    preview={preview}
                  />
                )}
              </div>
            )}
            {hasDrawer && (
              <MobileMenu>
                {primary.length > 0 && (
                  <nav aria-label="Primary" className="mt-6">
                    <ul>
                      {primary.map((entry) => (
                        <li key={entry.key}>
                          <NavLink
                            href={entry.href}
                            label={entry.label}
                            variant="drawer"
                            peers={peers}
                            preview={preview}
                          />
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
                {primary.length > 0 && (more.length > 0 || account) && (
                  <div
                    aria-hidden="true"
                    className="my-6 h-px shrink-0 bg-(image:--gradient-starlight-rule)"
                  />
                )}
                {more.length > 0 && (
                  <nav aria-label="More">
                    <ul>
                      {more.map((entry) => (
                        <li
                          key={entry.key}
                          className={entry.key === "search" ? "md:hidden" : ""}
                        >
                          <NavLink
                            href={entry.href}
                            label={entry.label}
                            variant="more"
                            peers={peers}
                            preview={preview}
                          />
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
                {account && <AccountLink variant="drawer" preview={preview} />}
                <p className="mt-auto flex items-center gap-2 pt-8 type-body-sm text-text-secondary">
                  <CrescentIcon
                    decorative
                    className="size-4 shrink-0 text-text-accent"
                  />
                  Candles for long, starlit evenings.
                </p>
              </MobileMenu>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
