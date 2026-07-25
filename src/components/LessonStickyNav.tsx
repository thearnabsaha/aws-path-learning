"use client";

import Link from "next/link";
import type { LessonSummary } from "@/types/lesson";

/** Sticky bottom next/prev bar — especially useful on mobile */
export function LessonStickyNav({
  prev,
  next,
  title,
  number,
}: {
  prev: LessonSummary | null;
  next: LessonSummary | null;
  title: string;
  number: string;
}) {
  return (
    <nav className="lesson-sticky-nav" aria-label="Lesson navigation">
      {prev ? (
        <Link
          className="sticky-nav-btn sticky-nav-prev"
          href={`/lesson/${prev.id}`}
          aria-label={`Previous lesson ${prev.number} ${prev.title}`}
        >
          <span className="sticky-nav-dir" aria-hidden="true">
            ←
          </span>
          <span className="sticky-nav-meta">
            <span className="sticky-nav-label">Prev</span>
            <span className="sticky-nav-num">{prev.number}</span>
          </span>
        </Link>
      ) : (
        <Link className="sticky-nav-btn sticky-nav-prev" href="/" aria-label="Home">
          <span className="sticky-nav-dir" aria-hidden="true">
            ←
          </span>
          <span className="sticky-nav-meta">
            <span className="sticky-nav-label">Home</span>
            <span className="sticky-nav-num">·</span>
          </span>
        </Link>
      )}

      <div className="sticky-nav-center" title={title}>
        <span className="sticky-nav-current-num">{number}</span>
        <span className="sticky-nav-current-title">{title}</span>
      </div>

      {next ? (
        <Link
          className="sticky-nav-btn sticky-nav-next"
          href={`/lesson/${next.id}`}
          aria-label={`Next lesson ${next.number} ${next.title}`}
        >
          <span className="sticky-nav-meta">
            <span className="sticky-nav-label">Next</span>
            <span className="sticky-nav-num">{next.number}</span>
          </span>
          <span className="sticky-nav-dir" aria-hidden="true">
            →
          </span>
        </Link>
      ) : (
        <Link
          className="sticky-nav-btn sticky-nav-next"
          href="/"
          aria-label="All lessons"
        >
          <span className="sticky-nav-meta">
            <span className="sticky-nav-label">Done</span>
            <span className="sticky-nav-num">All</span>
          </span>
          <span className="sticky-nav-dir" aria-hidden="true">
            →
          </span>
        </Link>
      )}
    </nav>
  );
}
