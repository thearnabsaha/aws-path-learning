"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/context/ProgressContext";
import type { QuizQuestion } from "@/types/lesson";

export function Quiz({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: QuizQuestion[];
}) {
  const { saveQuizScore } = useProgress();
  const [openId, setOpenId] = useState<number | null>(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  const total = questions.length;

  const answeredCount = useMemo(
    () => Object.keys(selected).filter((k) => selected[Number(k)] !== undefined).length,
    [selected]
  );

  const score = useMemo(() => {
    let s = 0;
    questions.forEach((item, qi) => {
      if (selected[qi] === item.answer) s += 1;
    });
    return s;
  }, [questions, selected]);

  if (!total) return null;

  function toggle(qi: number) {
    setOpenId((prev) => (prev === qi ? null : qi));
  }

  function pick(qi: number, oi: number) {
    if (finished) return;
    setSelected((prev) => ({ ...prev, [qi]: oi }));
    setRevealed((prev) => ({ ...prev, [qi]: true }));
  }

  function submitAll() {
    let s = 0;
    questions.forEach((item, qi) => {
      if (selected[qi] === item.answer) s += 1;
    });
    setFinished(true);
    const all: Record<number, boolean> = {};
    questions.forEach((_, qi) => {
      all[qi] = true;
    });
    setRevealed(all);
    saveQuizScore(lessonId, s, total);
    setOpenId(0);
  }

  function retake() {
    setSelected({});
    setRevealed({});
    setFinished(false);
    setOpenId(0);
  }

  const pass = total > 0 && score / total >= 0.7;

  return (
    <section className="quiz" aria-label="Lesson quiz">
      <div className="quiz-head">
        <div>
          <h2>Quiz</h2>
          <p className="quiz-intro">
            {total} questions from this lesson. Open each item, pick an answer,
            then submit when ready.
          </p>
        </div>
        <div className="quiz-progress-pill" aria-live="polite">
          <span>
            Answered {answeredCount}/{total}
          </span>
          {finished && (
            <strong className={pass ? "ok" : "warn"}>
              Score {score}/{total}
            </strong>
          )}
        </div>
      </div>

      <div className="accordion">
        {questions.map((item, qi) => {
          const isOpen = openId === qi;
          const choice = selected[qi];
          const show = !!revealed[qi] || finished;
          const isCorrect = choice === item.answer;
          const status =
            choice === undefined
              ? "todo"
              : show
                ? isCorrect
                  ? "correct"
                  : "wrong"
                : "picked";

          return (
            <div
              key={qi}
              className={`acc-item status-${status}${isOpen ? " open" : ""}`}
            >
              <button
                type="button"
                className="acc-trigger"
                aria-expanded={isOpen}
                onClick={() => toggle(qi)}
              >
                <span className="acc-num">{qi + 1}</span>
                <span className="acc-title">{item.q}</span>
                <span className="acc-meta">
                  {status === "todo" && "—"}
                  {status === "picked" && "Selected"}
                  {status === "correct" && "Correct"}
                  {status === "wrong" && "Review"}
                  <span className="acc-chevron" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </span>
              </button>

              {isOpen && (
                <div className="acc-panel">
                  <div className="quiz-options">
                    {item.options.map((opt, oi) => {
                      const letter = String.fromCharCode(65 + oi);
                      let cls = "quiz-option";
                      if (!show && choice === oi) cls += " selected";
                      if (show) {
                        if (oi === item.answer) cls += " correct";
                        else if (choice === oi) cls += " wrong";
                      }
                      return (
                        <button
                          key={oi}
                          type="button"
                          className={cls}
                          disabled={finished}
                          onClick={() => pick(qi, oi)}
                        >
                          <span className="opt-key">{letter}</span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {show && (
                    <p className="quiz-feedback">
                      {choice === undefined
                        ? `No answer yet. ${item.explain}`
                        : isCorrect
                          ? `Correct. ${item.explain}`
                          : `Not quite. ${item.explain}`}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="quiz-actions">
        {!finished ? (
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={submitAll}
            disabled={answeredCount === 0}
          >
            Submit quiz ({answeredCount}/{total} answered)
          </button>
        ) : (
          <>
            <div
              className={`quiz-result ${pass ? "pass" : "fail"}`}
              role="status"
            >
              Final score: {score} / {total}
              {pass
                ? " — strong. You can mark the lesson complete."
                : " — review the red items in the accordion and retake."}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-block"
              onClick={retake}
            >
              Retake quiz
            </button>
          </>
        )}
      </div>
    </section>
  );
}
