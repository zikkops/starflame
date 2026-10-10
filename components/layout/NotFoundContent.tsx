import Link from "next/link";

import { PageMessage, TEXT_LINK_CLASS } from "./PageMessage";

/** The not-found page's title (layout-shell.md §11). */
export const NOT_FOUND_TITLE = "Page not found · Starflames";

/** Shared by app/not-found.tsx and app/(site)/not-found.tsx (§10). */
export function NotFoundContent() {
  return (
    <PageMessage
      title="We can't find that page"
      body="It may have moved, or the link may be out of date."
    >
      <Link href="/" className={TEXT_LINK_CLASS}>
        Go to the home page
      </Link>
    </PageMessage>
  );
}
