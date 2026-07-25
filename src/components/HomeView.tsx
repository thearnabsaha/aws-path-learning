"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import type { LessonSummary } from "@/types/lesson";
import { SearchBox } from "./SearchBox";
import { ArchitectureMap } from "./ArchitectureMap";
import { ProgressTools } from "./ProgressTools";
import { ReviewPractice } from "./ReviewPractice";
import { dueReviews } from "@/lib/quizUtils";

export function HomeView({ lessons }: { lessons: LessonSummary[] }) {
  const {
    completedCount,
    total,
    percent,
    isDone,
    minutesRemaining,
    lastSection,
    reviewQueue,
    quizScores,
  } = useProgress();

  const next = lessons.find((l) => !isDone(l.id)) || lessons[0];
  const resumeSection = next ? lastSection[next.id] : undefined;
  const continueHref = resumeSection
    ? `/lesson/${next.id}?section=${encodeURIComponent(resumeSection)}`
    : `/lesson/${next.id}`;

  const dueCount = dueReviews(reviewQueue).length;
  const hours =
    minutesRemaining >= 60
      ? `${Math.floor(minutesRemaining / 60)}h ${minutesRemaining % 60}m`
      : `${minutesRemaining} min`;

  return (
    <div className="home">
      <section className="hero-panel">
        <div className="hero">
          <p className="eyebrow">12 lessons · quizzes · local progress</p>
          <h1>
            Learn AWS <span>clearly</span>
          </h1>
          <p className="lead">
            Lessons 1–12 from a structured AWS bootcamp roadmap—plus quizzes,
            spaced review, labs, and progress that stays in your browser.
          </p>
          <div className="home-search">
            <SearchBox />
          </div>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={continueHref}>
              {completedCount
                ? resumeSection
                  ? "Continue where you left off"
                  : "Continue"
                : "Start Lesson 1"}
            </Link>
            <Link className="btn btn-secondary" href="/review">
              Review{dueCount ? ` (${dueCount})` : ""}
            </Link>
          </div>
        </div>

        <aside className="hero-aside" aria-label="Course snapshot">
          <div className="stats" aria-label="Course stats">
            <div className="stat">
              <strong>{total || lessons.length}</strong>
              <span>Lessons</span>
            </div>
            <div className="stat">
              <strong>{completedCount}</strong>
              <span>Done</span>
            </div>
            <div className="stat">
              <strong>{percent}%</strong>
              <span>Progress</span>
            </div>
          </div>
          <div className="how-box">
            <h2>Time remaining</h2>
            <p className="time-remaining">
              ~<strong>{hours}</strong> across incomplete lessons
            </p>
            <ol>
              <li>
                <strong>Read</strong> sections (progress tracks opens)
              </li>
              <li>
                <strong>Lab</strong> with checklists & cost safety
              </li>
              <li>
                <strong>Quiz</strong> then spaced-review misses
              </li>
            </ol>
          </div>
        </aside>
      </section>

      <ReviewPractice embedded />

      <ArchitectureMap />

      <div className="curriculum-head">
        <h2 className="section-title">Curriculum</h2>
      </div>

      <div className="lesson-grid">
        {lessons.map((l) => {
          const complete = isDone(l.id);
          const score = quizScores[l.id];
          const resume = lastSection[l.id];
          const href = resume
            ? `/lesson/${l.id}?section=${encodeURIComponent(resume)}`
            : `/lesson/${l.id}`;
          return (
            <Link
              key={l.id}
              className={`lesson-card${complete ? " done" : ""}`}
              href={href}
            >
              <div className="card-num">{complete ? "✓" : l.number}</div>
              <div className="card-body">
                <h3>{l.title}</h3>
                <p>{l.short}</p>
                <div className="card-meta">
                  <span className="tag">{l.minutes} min</span>
                  {l.parts && (
                    <span className="tag">{l.parts.length} sections</span>
                  )}
                  {score && (
                    <span className="tag">
                      Quiz {score.score}/{score.total}
                    </span>
                  )}
                  {l.tags.slice(0, 1).map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                  {complete && <span className="tag done-tag">Done</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <ProgressTools />
    </div>
  );
}
