"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useProgress } from "@/context/ProgressContext";
import { dueReviews, shuffleQuestion, hashString } from "@/lib/quizUtils";

export function ReviewPractice({ embedded = false }: { embedded?: boolean }) {
  const { reviewQueue, markReviewCorrect, markReviewWrong, ready } =
    useProgress();
  const due = useMemo(() => dueReviews(reviewQueue), [reviewQueue]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const item = due[idx] || due[0];
  const shuffled = useMemo(() => {
    if (!item) return null;
    return shuffleQuestion(
      {
        q: item.question,
        options: item.options,
        answer: item.answer,
        explain: item.explain,
        topic: item.topic,
      },
      hashString(item.id + String(item.timesWrong))
    );
  }, [item]);

  if (!ready) return null;

  if (!due.length) {
    if (embedded && !reviewQueue.length) return null;
    return (
      <section className={`review-practice${embedded ? " embedded" : ""}`}>
        <h2>Spaced review</h2>
        <p className="review-empty">
          {reviewQueue.length
            ? `Nothing due right now — ${reviewQueue.length} item${reviewQueue.length === 1 ? "" : "s"} scheduled later.`
            : "Missed quiz questions will appear here for spaced practice."}
        </p>
        {!embedded && (
          <Link className="btn btn-secondary" href="/">
            Back home
          </Link>
        )}
      </section>
    );
  }

  if (!item || !shuffled) return null;

  function pick(oi: number) {
    if (revealed) return;
    setPicked(oi);
    setRevealed(true);
  }

  function next(correct: boolean) {
    if (correct) markReviewCorrect(item.id);
    else markReviewWrong(item.id);
    setPicked(null);
    setRevealed(false);
    setIdx(0);
  }

  const isCorrect = picked === shuffled.answer;

  return (
    <section className={`review-practice${embedded ? " embedded" : ""}`}>
      <div className="review-head">
        <h2>Spaced review</h2>
        <p>
          {due.length} due · topic: <strong>{item.topic}</strong>
        </p>
      </div>
      <p className="review-q">{item.question}</p>
      <div className="quiz-options" role="radiogroup">
        {shuffled.options.map((opt, oi) => {
          const letter = String.fromCharCode(65 + oi);
          let cls = "quiz-option";
          if (revealed) {
            if (oi === shuffled.answer) cls += " correct";
            else if (oi === picked) cls += " wrong";
          } else if (picked === oi) cls += " selected";
          return (
            <button
              key={oi}
              type="button"
              role="radio"
              aria-checked={picked === oi}
              className={cls}
              onClick={() => pick(oi)}
              disabled={revealed}
            >
              <span className="opt-key">{letter}</span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
      {revealed && (
        <>
          <p className="quiz-feedback" role="status">
            {isCorrect ? `Correct. ${item.explain}` : `Not quite. ${item.explain}`}
          </p>
          <div className="review-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => next(isCorrect)}
            >
              {isCorrect ? "Got it — next" : "Review later — next"}
            </button>
            <Link
              className="btn btn-ghost"
              href={`/lesson/${item.lessonId}`}
            >
              Open lesson
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
