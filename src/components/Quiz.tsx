"use client";

import { useId, useMemo, useState } from "react";
import { useProgress } from "@/context/ProgressContext";
import type { QuizQuestion } from "@/types/lesson";

function statusLabel(status: string) {
  switch (status) {
    case "todo":
      return "Not answered";
    case "picked":
      return "Selected";
    case "correct":
      return "Correct";
    case "wrong":
      return "Needs review";
    default:
      return status;
  }
}

function statusIcon(status: string) {
  switch (status) {
    case "todo":
      return "○";
    case "picked":
      return "●";
    case "correct":
      return "✓";
    case "wrong":
      return "✕";
    default:
      return "—";
  }
}

export function Quiz({
  lessonId,
  questions,
}: {
  lessonId: string;
  questions: QuizQuestion[];
}) {
  const baseId = useId();
  const { saveQuizScore } = useProgress();
  const [openId, setOpenId] = useState<number | null>(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [finished, setFinished] = useState(false);

  const total = questions.length;

  const answeredCount = useMemo(
    () =>
      Object.keys(selected).filter((k) => selected[Number(k)] !== undefined)
        .length,
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

  function onTriggerKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next = (index + delta + total) % total;
      document.getElementById(`${baseId}-q-trigger-${next}`)?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById(`${baseId}-q-trigger-0`)?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(`${baseId}-q-trigger-${total - 1}`)?.focus();
    }
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
              {pass ? "Passed" : "Review"} · Score {score}/{total}
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

          const triggerId = `${baseId}-q-trigger-${qi}`;
          const panelId = `${baseId}-q-panel-${qi}`;
          const label = statusLabel(status);
          const icon = statusIcon(status);

          return (
            <div
              key={qi}
              className={`acc-item status-${status}${isOpen ? " open" : ""}`}
            >
              <button
                type="button"
                id={triggerId}
                className="acc-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(qi)}
                onKeyDown={(e) => onTriggerKeyDown(e, qi)}
              >
                <span className="acc-num" aria-hidden="true">
                  {qi + 1}
                </span>
                <span className="acc-title">{item.q}</span>
                <span className="acc-meta">
                  <span className="status-badge" data-status={status}>
                    <span className="status-icon" aria-hidden="true">
                      {icon}
                    </span>
                    <span className="status-text">{label}</span>
                  </span>
                  <span className="acc-chevron" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="acc-panel"
                hidden={!isOpen}
              >
                {isOpen && (
                  <>
                    <div
                      className="quiz-options"
                      role="radiogroup"
                      aria-label={`Options for question ${qi + 1}`}
                    >
                      {item.options.map((opt, oi) => {
                        const letter = String.fromCharCode(65 + oi);
                        let cls = "quiz-option";
                        let mark = "";
                        if (!show && choice === oi) cls += " selected";
                        if (show) {
                          if (oi === item.answer) {
                            cls += " correct";
                            mark = "✓ ";
                          } else if (choice === oi) {
                            cls += " wrong";
                            mark = "✕ ";
                          }
                        }
                        const selectedNow = choice === oi;
                        return (
                          <button
                            key={oi}
                            type="button"
                            role="radio"
                            aria-checked={selectedNow}
                            className={cls}
                            disabled={finished}
                            onClick={() => pick(qi, oi)}
                          >
                            <span className="opt-key" aria-hidden="true">
                              {letter}
                            </span>
                            <span>
                              {mark}
                              {opt}
                              {show && oi === item.answer && (
                                <span className="sr-only"> (correct answer)</span>
                              )}
                              {show &&
                                choice === oi &&
                                oi !== item.answer && (
                                  <span className="sr-only">
                                    {" "}
                                    (your answer — incorrect)
                                  </span>
                                )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {show && (
                      <p className="quiz-feedback" role="status">
                        {choice === undefined
                          ? `No answer yet. ${item.explain}`
                          : isCorrect
                            ? `Correct. ${item.explain}`
                            : `Not quite. ${item.explain}`}
                      </p>
                    )}
                  </>
                )}
              </div>
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
              <span className="quiz-result-icon" aria-hidden="true">
                {pass ? "✓" : "!"}
              </span>
              Final score: {score} / {total}
              {pass
                ? " — strong. You can mark the lesson complete."
                : " — review items marked “Needs review” and retake."}
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
