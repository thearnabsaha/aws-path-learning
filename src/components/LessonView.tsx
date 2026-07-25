"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import type { Lesson, LessonSummary } from "@/types/lesson";
import { LessonAccordion } from "./LessonAccordion";
import { Quiz } from "./Quiz";
import { CodeEnhance } from "./CodeEnhance";
import { LabChecklist } from "./LabChecklist";
import { LessonStickyNav } from "./LessonStickyNav";
import { useProgress } from "@/context/ProgressContext";
import { trackEvent } from "@/lib/analytics";

export function LessonView({
  lesson,
  prev,
  next,
}: {
  lesson: Lesson;
  prev: LessonSummary | null;
  next: LessonSummary | null;
}) {
  const { isDone, setDone, sectionProgress, lastSection, quizScores } =
    useProgress();
  const done = isDone(lesson.id);
  const quizResult = quizScores[lesson.id];
  const quizMastered =
    !!quizResult &&
    quizResult.total > 0 &&
    quizResult.score / quizResult.total >= 0.7;
  const quizAttempted = !!quizResult && quizResult.total > 0;

  useEffect(() => {
    trackEvent("lesson_open", {
      lessonId: lesson.id,
      number: lesson.number,
    });
  }, [lesson.id, lesson.number]);
  const partsCount = (lesson.parts?.length || 0) + (lesson.goals?.length ? 1 : 0);
  const secProg = sectionProgress(lesson.id, partsCount || 1);
  const resume = lastSection[lesson.id];
  const resumeHref = resume
    ? `/lesson/${lesson.id}?section=${encodeURIComponent(resume)}`
    : undefined;

  return (
    <article className="lesson lesson-with-sticky-nav">
      <CodeEnhance />
      <LabChecklist lessonId={lesson.id} />

      <header className="lesson-header">
        <p className="lesson-kicker">
          Lesson {lesson.number} · {lesson.section} · ~{lesson.minutes} min
          {lesson.reviewed ? ` · Reviewed ${lesson.reviewed}` : ""}
          {lesson.comingSoon ? " · Placeholder" : ""}
        </p>
        <h1>{lesson.title}</h1>
        {lesson.comingSoon && (
          <p className="coming-soon-banner" role="status">
            Full content coming soon. This slot is reserved after the core
            12-lesson path — notes, labs, and quizzes will be filled in later
            without renumbering.
          </p>
        )}
        <p className="lesson-summary">{lesson.short}</p>
        <div className="lesson-section-meta">
          <div className="progress-track section-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${secProg}%` }} />
          </div>
          <span className="lesson-section-pct">{secProg}% sections explored</span>
          {resumeHref && (
            <a className="resume-link" href={resumeHref}>
              Continue last section
            </a>
          )}
        </div>
      </header>

      <Suspense
        fallback={
          <div className="lesson-acc">
            <p className="lesson-acc-hint">Loading sections…</p>
          </div>
        }
      >
        <LessonAccordion
          lessonId={lesson.id}
          contentHtml={lesson.content}
          goals={lesson.goals}
        />
      </Suspense>

      <Quiz lessonId={lesson.id} questions={lesson.quiz} />

      <footer className="lesson-footer">
        <div className={`complete-row${done ? " done" : ""}`}>
          <div className="complete-status">
            {done ? (
              "✓ Marked complete — nice work."
            ) : lesson.quiz?.length ? (
              quizMastered ? (
                "Quiz mastered (≥70%). You can mark this lesson complete."
              ) : quizAttempted ? (
                <>
                  Quiz score {quizResult!.score}/{quizResult!.total} — aim for
                  ≥70% (recommended mastery). You can still mark complete.
                </>
              ) : (
                "Take the quiz first for best results, then mark complete."
              )
            ) : (
              "Finished reading? Mark this lesson complete."
            )}
          </div>
          <button
            type="button"
            className={`btn ${done ? "btn-secondary" : "btn-primary"}`}
            onClick={() => {
              const nextDone = !done;
              if (
                nextDone &&
                lesson.quiz?.length &&
                !quizMastered &&
                !window.confirm(
                  quizAttempted
                    ? "Quiz is under 70%. Mark complete anyway?"
                    : "You have not submitted the quiz yet. Mark complete anyway?"
                )
              ) {
                return;
              }
              setDone(lesson.id, nextDone);
              if (nextDone) {
                trackEvent("lesson_complete", {
                  lessonId: lesson.id,
                  number: lesson.number,
                  quizMastered: quizMastered || false,
                });
              }
            }}
          >
            {done ? "Undo complete" : "Mark complete"}
          </button>
        </div>
        <div className="nav-row desktop-nav-row">
          {prev ? (
            <Link className="btn btn-secondary" href={`/lesson/${prev.id}`}>
              ← {prev.number}
            </Link>
          ) : (
            <Link className="btn btn-secondary" href="/">
              ← Home
            </Link>
          )}
          {next ? (
            <Link className="btn btn-primary" href={`/lesson/${next.id}`}>
              Next →
            </Link>
          ) : (
            <Link className="btn btn-primary" href="/">
              All lessons
            </Link>
          )}
        </div>
      </footer>

      <LessonStickyNav
        prev={prev}
        next={next}
        title={lesson.title}
        number={lesson.number}
      />
    </article>
  );
}
