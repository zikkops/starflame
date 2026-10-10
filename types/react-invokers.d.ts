// Invoker commands (header.md §13.4): written lowercase, so React emits exactly
// the HTML attribute names. React 19.3 and @types/react 19.3 don't know them yet.
import "react";

declare module "react" {
  // The type parameter must match React's own declaration for the merge.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ButtonHTMLAttributes<T> {
    command?: string;
    commandfor?: string;
  }
}
