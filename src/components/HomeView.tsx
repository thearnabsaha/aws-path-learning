"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import type { LessonSummary } from "@/types/lesson";
import { SearchBox } from "./SearchBox";
import { ArchitectureMap } from "./ArchitectureMap";
import { ProgressTools } from "./ProgressTools";
import { ReviewPractice } from "./ReviewPractice";
import { PathPicker } from "./PathPicker";
import { dueReviews } from "@/lib/quizUtils";
import { getPath } from "@/lib/paths";

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
    learningPath,
    pathLessons,
  } = useProgress();

  const path = getPath(learningPath);
  const visible = pathLessons.length ? pathLessons : lessons;
  const coreInPath = visible.filter((l) => Number(l.number) <= 12);
  const extraInPath = visible.filter((l) => Number(l.number) > 12);

  const next = visible.find((l) => !isDone(l.id)) || visible[0] || lessons[0];
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
            {path.label} · {total} lessons in path · quizzes · local progress
          </p>
          <h1>
            Learn AWS <span>clearly</span>
          </h1>
          <p className="lead">
            Pick a path: <strong>Fast</strong> foundations, <strong>Full</strong>{" "}
            core 12, <strong>Interview</strong> drills, or{" "}
            <strong>Everything</strong> including SAA extras. Progress stays in
            your browser.
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
                : `Start ${next?.number || "01"}`}
            </Link>
            {path.interviewMode ? (
              <Link className="btn btn-secondary" href="/interview">
                Interview drills
              </Link>
            ) : (
              <Link className="btn btn-secondary" href="/review">
                Review{dueCount ? ` (${dueCount})` : ""}
              </Link>
            )}
          </div>
        </div>

        <aside className="hero-aside" aria-label="Course snapshot">
          <div className="stats" aria-label="Path stats">
            <div className="stat">
              <strong>{total}</strong>
              <span>In path</span>
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
            <h2>Time remaining (path)</h2>
            <p className="time-remaining">
              ~<strong>{hours}</strong> across incomplete path lessons
            </p>
            <ol>
              <li>
                <strong>Choose</strong> Fast / Full / Interview / All
              </li>
              <li>
                <strong>Read</strong> + lab checklist
              </li>
              <li>
                <strong>Quiz</strong> then spaced review
              </li>
            </ol>
          </div>
        </aside>
      </section>

      <PathPicker />

      {path.interviewMode && (
        <section className="path-interview-cta">
          <div>
            <h2>Interview path active</h2>
            <p>
              Read the core lessons below, then run scenario MCQ drills and open
              prompts on the interview page.
            </p>
          </div>
          <Link className="btn btn-primary" href="/interview">
            Open interview drills
          </Link>
        </section>
      )}

      <ReviewPractice embedded />

      <ArchitectureMap />

      <div className="curriculum-head">
        <h2 className="section-title">
          {path.id === "fast"
            ? "Fast path lessons"
            : path.id === "all"
              ? "Core path"
              : path.label}
        </h2>
        <p className="curriculum-sub">{path.description}</p>
      </div>

      <div className="lesson-grid">
        {coreInPath.map((l) => (
          <LessonCard
            key={l.id}
            lesson={l}
            complete={isDone(l.id)}
            score={quizScores[l.id]}
            resume={lastSection[l.id]}
          />
        ))}
      </div>

      {extraInPath.length > 0 && (
        <>
          <div className="curriculum-head curriculum-head-extra">
            <h2 className="section-title">Additional · SAA &amp; jobs</h2>
            <p className="curriculum-sub">
              After the core path. Some topics are placeholders until full
              content is published.
            </p>
          </div>
          <div className="lesson-grid">
            {extraInPath.map((l) => (
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
