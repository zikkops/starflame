"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CloseIcon, MenuIcon } from "@/components/icons/glyphs";

import { ICON_BUTTON, ICON_GLYPH } from "./styles";

export const MENU_ID = "site-menu";
const LG = "(min-width: 64rem)";

/** Invoker commands open and close the dialog natively, before hydration too. */
const nativeInvokers = (): boolean =>
  "commandForElement" in HTMLButtonElement.prototype;

const inside = (rect: DOMRect, event: MouseEvent): boolean =>
  event.clientX >= rect.left &&
  event.clientX <= rect.right &&
  event.clientY >= rect.top &&
  event.clientY <= rect.bottom;

/**
 * The menu button and the drawer, a top-layer <dialog> opened with showModal()
 * (header.md §5). The dialog is in the server HTML (closed), so aria-controls
 * always resolves; its links are server-rendered children. aria-expanded follows
 * the dialog's own toggle and close events, so every way of opening and closing
 * keeps it right. Every close moves focus explicitly: to the menu button, or to
 * the home link when the viewport has grown to lg and the button is hidden.
 */
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const dialog = dialogRef.current;
    const button = buttonRef.current;
    if (!dialog || !button) return;
    const lg = matchMedia(LG);
    let downOutside = false;

    const onToggle = (event: Event) =>
      setExpanded((event as ToggleEvent).newState === "open");
    const onClose = () => {
      setExpanded(false);
      const home = button
        .closest("header")
        ?.querySelector<HTMLElement>("[data-home-link]");
      (lg.matches ? home : button)?.focus();
    };
    // The scrim: close only when the press starts and ends outside the panel.
    const onPointerDown = (event: PointerEvent) => {
      downOutside = !inside(dialog.getBoundingClientRect(), event);
    };
    const onClick = (event: MouseEvent) => {
      const outside =
        downOutside && !inside(dialog.getBoundingClientRect(), event);
      downOutside = false;
      const link = (event.target as Element).closest("a[href]");
      if (outside || link) dialog.close();
    };
    // At lg the drawer can't stay open: close at once, without the exit motion.
    const onBreakpoint = () => {
      if (!lg.matches || !dialog.open) return;
      dialog.setAttribute("data-instant", "");
      dialog.close();
      requestAnimationFrame(() => dialog.removeAttribute("data-instant"));
    };

    setExpanded(dialog.open);
    dialog.addEventListener("toggle", onToggle);
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("pointerdown", onPointerDown);
    dialog.addEventListener("click", onClick);
    lg.addEventListener("change", onBreakpoint);
    return () => {
      dialog.removeEventListener("toggle", onToggle);
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("pointerdown", onPointerDown);
      dialog.removeEventListener("click", onClick);
      lg.removeEventListener("change", onBreakpoint);
    };
  }, []);

  // Back/forward or any other route change closes the drawer.
  const shownPath = useRef(pathname);
  useEffect(() => {
    if (shownPath.current === pathname) return;
    shownPath.current = pathname;
    dialogRef.current?.close();
  }, [pathname]);

  const open = () => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open && !nativeInvokers()) dialog.showModal();
  };
  const close = () => {
    if (!nativeInvokers()) dialogRef.current?.close();
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu"
        aria-expanded={expanded}
        aria-controls={MENU_ID}
        aria-haspopup="dialog"
        commandfor={MENU_ID}
        command="show-modal"
        data-print="hide"
        onClick={open}
        className={`${ICON_BUTTON} lg:hidden noscript:hidden`}
      >
        <MenuIcon className={ICON_GLYPH} />
      </button>
      <dialog
        ref={dialogRef}
        id={MENU_ID}
        aria-label="Menu"
        className="site-menu fixed inset-y-0 start-auto end-0 m-0 h-auto max-h-none w-[min(22rem,100%-3rem)] max-w-none overflow-y-auto overscroll-contain rounded-s-lg border-0 border-s border-transparent bg-bg-overlay ps-6 pe-(--page-inline-end) pt-[env(safe-area-inset-top,0px)] pb-[calc(--spacing(6)+env(safe-area-inset-bottom,0px))] text-text-primary shadow-overlay"
      >
        <div className="flex min-h-full flex-col">
          <div className="flex h-(--header-h) shrink-0 items-center justify-end">
            <button
              type="button"
              aria-label="Close menu"
              commandfor={MENU_ID}
              command="close"
              onClick={close}
              className={ICON_BUTTON}
            >
              <CloseIcon className={ICON_GLYPH} />
            </button>
          </div>
          {children}
        </div>
      </dialog>
    </>
  );
}
