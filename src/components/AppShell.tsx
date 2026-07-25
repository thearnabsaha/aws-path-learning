"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  children,
  activeLessonId,
}: {
  children: React.ReactNode;
  activeLessonId?: string | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const close = useCallback(() => setMenuOpen(false), []);
  const toggle = useCallback(() => setMenuOpen((v) => !v), []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

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
    <div className="app-frame">
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
