import { NotFoundContent } from "@/components/layout/NotFoundContent";

// notFound() from a page in the group (e.g. an unknown product slug): rendered
// inside the (site) layout, so the shell is already there. The title comes from
// the calling page's generateMetadata, which returns NOT_FOUND_TITLE when its
// lookup finds nothing (layout-shell.md §10); no route does that yet.
export default function SiteNotFound() {
  return <NotFoundContent />;
}
