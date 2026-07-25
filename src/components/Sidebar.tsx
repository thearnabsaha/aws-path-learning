"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import { getSections } from "@/data/lessons";
import { SearchBox } from "./SearchBox";
import { dueReviews } from "@/lib/quizUtils";
import { getPath } from "@/lib/paths";

export function Sidebar({
  open,
  onClose,
  activeLessonId,
}: {
  open: boolean;
  onClose: () => void;
  activeLessonId?: string | null;
}) {
  const {
    completedCount,
    total,
    percent,
    isDone,
    minutesRemaining,
    reviewQueue,
    lastSection,
    learningPath,
    pathLessons,
  } = useProgress();
  const path = getPath(learningPath);
  const pathIds = new Set(pathLessons.map((l) => l.id));
  const sections = getSections()
    .map(({ section, items }) => ({
      section,
      items: items.filter((l) => pathIds.has(l.id)),
    }))
    .filter((g) => g.items.length > 0);

  const due = dueReviews(reviewQueue).length;

  return (
    <aside
      className={`sidebar${open ? " open" : ""}`}
      id="sidebar"
      aria-label="Curriculum"
      tabIndex={-1}
    >
      <div className="sidebar-inner">
        <div className="sidebar-head">
          <div>
            <h2>Lessons</h2>
            <p className="sidebar-sub">
              {path.short} · ~{minutesRemaining} min left
            </p>
          </div>
          <button
            type="button"
            className="icon-btn close-sidebar"
            aria-label="Close menu"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="sidebar-search">
          <SearchBox compact />
        </div>

        <div className="sidebar-meta">
          <div className="sidebar-progress-row">
            <span>
              {completedCount} of {total} done
            </span>
            <strong>{percent}%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="sidebar-path-links">
            <Link
              href="/"
              className="btn btn-ghost btn-sm btn-block"
              onClick={onClose}
            >
              Change path
            </Link>
            {path.interviewMode && (
              <Link
                href="/interview"
                className="btn btn-secondary btn-sm btn-block"
                onClick={onClose}
              >
                Interview drills
              </Link>
            )}
            <Link
              href="/review"
              className="btn btn-secondary btn-sm btn-block"
              onClick={onClose}
            >
              Spaced review{due ? ` (${due})` : ""}
            </Link>
          </div>
        </div>

        <nav className="lesson-nav">
          {sections.map(({ section, items }) => (
            <div key={section} className="nav-group">
              <div className="nav-section">{section}</div>
              {items.map((l) => {
                const done = isDone(l.id);
                const active = l.id === activeLessonId;
                const resume = lastSection[l.id];
                const href = resume
                  ? `/lesson/${l.id}?section=${encodeURIComponent(resume)}`
                  : `/lesson/${l.id}`;
                return (
                  <Link
                    key={l.id}
                    href={href}
                    className={`nav-link${active ? " active" : ""}${done ? " done" : ""}`}
                    onClick={onClose}
                  >
                    <span className={done ? "nav-check" : "nav-num"}>
                      {done ? "✓" : l.number}
                    </span>
                    <span className="nav-title">
                      {l.title}
                      {l.comingSoon ? (
                        <span className="nav-soon"> soon</span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
