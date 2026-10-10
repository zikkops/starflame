import Link from "next/link";

import {
  GHOST_BUTTON_CLASS,
  PageMessage,
  TEXT_LINK_CLASS,
} from "./PageMessage";

/**
 * Shared by the three error boundaries (layout-shell.md §10, §11). Sets no
 * title: the in-shell boundaries keep the layout's, and global-error renders its
 * own React <title>.
 */
export function ErrorContent({
  retry,
  variant = "page",
}: {
  /** Next's `retry` prop: re-fetches and re-renders the failed segment. */
  retry: () => void;
  /** `global`: the root layout failed, so the wording is about the whole site. */
  variant?: "page" | "global";
}) {
  return (
    <PageMessage
      title="Something went wrong"
      body={
        variant === "global"
          ? "Starflames couldn't load just now. Please try again in a moment."
          : "This page didn't load properly. Please try again, and if it keeps happening, come back a little later."
      }
    >
      <button type="button" onClick={retry} className={GHOST_BUTTON_CLASS}>
        Try again
      </button>
      <Link href="/" className={TEXT_LINK_CLASS}>
        Go to the home page
      </Link>
    </PageMessage>
  );
}
