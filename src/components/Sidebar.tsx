"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import { getSections } from "@/data/lessons";

export function Sidebar({
  open,
  onClose,
  activeLessonId,
}: {
  open: boolean;
  onClose: () => void;
  activeLessonId?: string | null;
}) {
  const { completedCount, total, percent, isDone, reset } = useProgress();
  const sections = getSections();

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
            <p className="sidebar-sub">Self-paced course</p>
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
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-block"
            onClick={() => {
              if (
                confirm(
                  "Reset all progress and quiz scores on this browser?"
                )
              ) {
                reset();
              }
            }}
          >
            Reset progress
          </button>
        </div>

        <nav className="lesson-nav">
          {sections.map(({ section, items }) => (
            <div key={section} className="nav-group">
              <div className="nav-section">{section}</div>
              {items.map((l) => {
                const done = isDone(l.id);
                const active = l.id === activeLessonId;
                return (
                  <Link
                    key={l.id}
                    href={`/lesson/${l.id}`}
                    className={`nav-link${active ? " active" : ""}${done ? " done" : ""}`}
                    onClick={onClose}
                  >
                    <span className={done ? "nav-check" : "nav-num"}>
                      {done ? "✓" : l.number}
                    </span>
                    <span className="nav-title">{l.title}</span>
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
