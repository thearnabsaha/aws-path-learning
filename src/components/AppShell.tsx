"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function AppShell({
  children,
  activeLessonId,
}: {
  children: React.ReactNode;
  activeLessonId?: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setMenuOpen(false), []);
  const toggle = useCallback(() => setMenuOpen((v) => !v), []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  // Focus trap + restore when mobile drawer opens/closes
  useEffect(() => {
    if (!menuOpen) {
      if (previouslyFocused.current) {
        previouslyFocused.current.focus();
        previouslyFocused.current = null;
      }
      return;
    }

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const focusables = () =>
      Array.from(sidebar.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
      );

    const nodes = focusables();
    (nodes[0] || sidebar).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey) {
        if (active === first || !sidebar.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !sidebar.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuOpen) close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close, menuOpen]);

  // Close mobile drawer on navigation
  useEffect(() => {
    close();
  }, [activeLessonId, close]);

  // Close drawer when resizing to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) close();
    };
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [close]);

  return (
    <div className="app-frame" ref={shellRef}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Topbar menuOpen={menuOpen} onMenuToggle={toggle} />
      <div className="shell">
        <Sidebar
          open={menuOpen}
          onClose={close}
          activeLessonId={activeLessonId}
        />
        <button
          type="button"
          className="overlay"
          aria-label="Close menu"
          hidden={!menuOpen}
          onClick={close}
        />
        <div className="content-area">
          <main className="main" id="main" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
