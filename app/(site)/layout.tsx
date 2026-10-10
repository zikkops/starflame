import { SiteShell } from "@/components/layout/SiteShell";

// Every customer-facing route lives in this group and gets the shell
// (layout-shell.md §13.1). /dev stays outside it.
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
