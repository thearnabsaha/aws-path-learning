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

  const coreLessons = lessons.filter((l) => Number(l.number) <= 12);
  const extraLessons = lessons.filter((l) => Number(l.number) > 12);
  // Prefer continuing the core path before additional SAA topics
  const next =
    coreLessons.find((l) => !isDone(l.id)) ||
    lessons.find((l) => !isDone(l.id)) ||
    lessons[0];
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
          <p className="eyebrow">
            {coreLessons.length} core · {extraLessons.length} additional ·
            quizzes · local progress
          </p>
          <h1>
            Learn AWS <span>clearly</span>
          </h1>
          <p className="lead">
            Lessons 1–{coreLessons.length} are the full core path. Lessons{" "}
            {coreLessons.length + 1}–{lessons.length} add SAA / job-readiness
            topics (placeholders until content is published)—plus quizzes,
            spaced review, labs, and progress in your browser.
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
        <h2 className="section-title">Core path (1–{coreLessons.length})</h2>
      </div>

      <div className="lesson-grid">
        {coreLessons.map((l) => (
          <LessonCard
            key={l.id}
            lesson={l}
            complete={isDone(l.id)}
            score={quizScores[l.id]}
            resume={lastSection[l.id]}
          />
        ))}
      </div>

      {extraLessons.length > 0 && (
        <>
          <div className="curriculum-head curriculum-head-extra">
            <h2 className="section-title">
              Additional · SAA &amp; jobs ({coreLessons.length + 1}–
              {lessons.length})
            </h2>
            <p className="curriculum-sub">
              Reserved after the core 12. Full write-ups, labs, and quizzes will
              be added when content is ready — structure is already live so
              progress stays stable.
            </p>
          </div>
          <div className="lesson-grid">
            {extraLessons.map((l) => (
              <LessonCard
                key={l.id}
                lesson={l}
                complete={isDone(l.id)}
                score={quizScores[l.id]}
                resume={lastSection[l.id]}
              />
            ))}
          </div>
        </>
      )}

      <ProgressTools />
    </div>
  );
}

function LessonCard({
  lesson: l,
  complete,
  score,
  resume,
}: {
  lesson: LessonSummary;
  complete: boolean;
  score?: { score: number; total: number };
  resume?: string;
}) {
  const href = resume
    ? `/lesson/${l.id}?section=${encodeURIComponent(resume)}`
    : `/lesson/${l.id}`;
  return (
    <Link
      className={`lesson-card${complete ? " done" : ""}${l.comingSoon ? " coming-soon" : ""}`}
      href={href}
    >
      <div className="card-num">{complete ? "✓" : l.number}</div>
      <div className="card-body">
        <h3>{l.title}</h3>
        <p>{l.short}</p>
        <div className="card-meta">
          <span className="tag">{l.minutes} min</span>
          {l.comingSoon && <span className="tag soon-tag">Coming soon</span>}
          {l.parts && !l.comingSoon && (
            <span className="tag">{l.parts.length} sections</span>
          )}
          {score && score.total > 0 && (
            <span className="tag">
              Quiz {score.score}/{score.total}
            </span>
          )}
          {l.tags
            .filter((t) => t !== "coming-soon")
            .slice(0, 1)
            .map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          {complete && <span className="tag done-tag">Done</span>}
        </div>
      </div>
    </Link>
  );
}
