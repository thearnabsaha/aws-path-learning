"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar({
  menuOpen,
  onMenuToggle,
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const { percent, completedCount, total } = useProgress();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button
          type="button"
          className="icon-btn menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="sidebar"
          onClick={onMenuToggle}
        >
          <span className="hamburger" aria-hidden="true" />
        </button>

        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            A
          </span>
          <span className="brand-text">AWS Path</span>
        </Link>

        <div className="topbar-progress" title="Course progress">
          <div className="progress-chip desktop-only">
            <span>
              {completedCount}/{total}
            </span>
            <div className="progress-track" aria-hidden="true">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <strong>{percent}%</strong>
          </div>
          <ThemeToggle />
          <div
            className="ring mobile-ring"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Course completion"
          >
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <path
                className="ring-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="ring-fg"
                strokeDasharray={`${percent}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="ring-label">{percent}%</span>
          </div>
        </div>
      </div>
    </header>
  );
}
