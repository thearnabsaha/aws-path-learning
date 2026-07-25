"use client";

import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import type { LessonSummary } from "@/types/lesson";

export function HomeView({ lessons }: { lessons: LessonSummary[] }) {
  const { completedCount, total, percent, isDone } = useProgress();
  const next = lessons.find((l) => !isDone(l.id)) || lessons[0];

  return (
    <div className="home">
      <section className="hero-panel">
        <div className="hero">
          <p className="eyebrow">12 lessons · quizzes · local progress</p>
          <h1>
            Learn AWS <span>clearly</span>
          </h1>
          <p className="lead">
            Lessons 1–12 from a structured AWS bootcamp roadmap—plus quizzes and
            progress that stays in your browser. Review notes point to official
            AWS docs.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href={`/lesson/${next.id}`}>
              {completedCount ? "Continue" : "Start Lesson 1"}
            </Link>
            <Link className="btn btn-secondary" href="/lesson/iam">
              Jump to IAM
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
            <h2>Study loop</h2>
            <ol>
              <li>
                <strong>Read</strong> the concepts and examples
              </li>
              <li>
                <strong>Check</strong> the diagrams once more
              </li>
              <li>
                <strong>Quiz</strong> yourself, then mark complete
              </li>
            </ol>
          </div>
        </aside>
      </section>

      <div className="curriculum-head">
        <h2 className="section-title">Curriculum</h2>
      </div>

      <div className="lesson-grid">
        {lessons.map((l) => {
          const complete = isDone(l.id);
          return (
            <Link
              key={l.id}
              className={`lesson-card${complete ? " done" : ""}`}
              href={`/lesson/${l.id}`}
            >
              <div className="card-num">{complete ? "✓" : l.number}</div>
              <div className="card-body">
                <h3>{l.title}</h3>
                <p>{l.short}</p>
                <div className="card-meta">
                  <span className="tag">{l.minutes} min</span>
                  {l.reviewed && (
                    <span className="tag">Reviewed {l.reviewed}</span>
                  )}
                  {l.tags.slice(0, 2).map((t) => (
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
    </div>
  );
}
