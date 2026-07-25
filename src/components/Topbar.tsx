"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import { ThemeToggle } from "./ThemeToggle";
import { SearchBox } from "./SearchBox";
import { dueReviews } from "@/lib/quizUtils";

export function Topbar({
  menuOpen,
  onMenuToggle,
  hideMenu = false,
}: {
  menuOpen: boolean;
  onMenuToggle: () => void;
  hideMenu?: boolean;
}) {
  const { percent, completedCount, total, reviewQueue } = useProgress();
  const due = dueReviews(reviewQueue).length;

  return (
    <header className="topbar">
      <div className={`topbar-inner${hideMenu ? " topbar-inner-full" : ""}`}>
        {!hideMenu && (
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
        )}

        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg
              className="brand-mark-svg"
              viewBox="0 0 32 32"
              width="100%"
              height="100%"
              focusable="false"
            >
              <text
                x="16"
                y="16"
                textAnchor="middle"
                dominantBaseline="central"
                className="brand-mark-letter"
              >
                A
              </text>
            </svg>
          </span>
          <span className="brand-text">AWS Path</span>
        </Link>

        <div className="topbar-search desktop-only">
          <SearchBox compact />
        </div>

        <div className="topbar-progress" title="Course progress">
          <Link
            href="/interview"
            className="review-chip desktop-only"
            title="Interview drills"
          >
            Interview
          </Link>
          <Link
            href="/review"
            className="review-chip desktop-only"
            title="Spaced review"
          >
            Review{due ? ` ${due}` : ""}
          </Link>
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
