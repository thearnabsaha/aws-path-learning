"use client";

import Link from "next/link";
import type { Lesson, LessonSummary } from "@/types/lesson";
import { LessonAccordion } from "./LessonAccordion";
import { Quiz } from "./Quiz";
import { useProgress } from "@/context/ProgressContext";

export function LessonView({
  lesson,
  prev,
  next,
}: {
  lesson: Lesson;
  prev: LessonSummary | null;
  next: LessonSummary | null;
}) {
  const { isDone, setDone } = useProgress();
  const done = isDone(lesson.id);

  return (
    <article className="lesson">
      <header className="lesson-header">
        <p className="lesson-kicker">
          Lesson {lesson.number} · {lesson.section} · ~{lesson.minutes} min
          {lesson.reviewed ? ` · Reviewed ${lesson.reviewed}` : ""}
        </p>
        <h1>{lesson.title}</h1>
        <p className="lesson-summary">{lesson.short}</p>
      </header>

      <LessonAccordion contentHtml={lesson.content} goals={lesson.goals} />

      <Quiz lessonId={lesson.id} questions={lesson.quiz} />

      <footer className="lesson-footer">
        <div className={`complete-row${done ? " done" : ""}`}>
          <div className="complete-status">
            {done
              ? "✓ Marked complete — nice work."
              : "Finished reading? Mark this lesson complete."}
          </div>
          <button
            type="button"
            className={`btn ${done ? "btn-secondary" : "btn-primary"}`}
            onClick={() => setDone(lesson.id, !done)}
          >
            {done ? "Undo complete" : "Mark complete"}
          </button>
        </div>
        <div className="nav-row">
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
    </article>
  );
}
