"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import interviewQuestions from "@/data/generated/interview-questions.json";
import interviewPrompts from "@/data/generated/interview-prompts.json";
import type { InterviewPrompt, InterviewQuestion } from "@/types/lesson";
import {
  hashString,
  shuffleQuestion,
  weakTopicsFromAnswers,
} from "@/lib/quizUtils";
import { useProgress } from "@/context/ProgressContext";

const bank = interviewQuestions as InterviewQuestion[];
const prompts = interviewPrompts as InterviewPrompt[];

export function InterviewDrill() {
  const { saveQuizScore } = useProgress();
  const [mode, setMode] = useState<"mcq" | "prompts">("mcq");
  const [scenarioOnly, setScenarioOnly] = useState(true);
  const [count, setCount] = useState(10);
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [openPrompt, setOpenPrompt] = useState<number | null>(0);

  const pool = useMemo(() => {
    let list = bank.filter((q) => Number(q.lessonNumber) <= 12);
    if (scenarioOnly) {
      const scen = list.filter((q) => q.style === "scenario");
      if (scen.length >= 5) list = scen;
    }
    // shuffle copy with seed
    const arr = [...list];
    let s = seed;
    const rand = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, Math.min(count, arr.length));
  }, [scenarioOnly, count, seed]);

  const current = pool[idx];
  const shuffled = useMemo(() => {
    if (!current) return null;
    return shuffleQuestion(
      current,
      hashString(`${current.lessonId}:${current.q}:${seed}`)
    );
  }, [current, seed]);

  const score = useMemo(() => {
    let s = 0;
    pool.forEach((q, i) => {
      const sh = shuffleQuestion(q, hashString(`${q.lessonId}:${q.q}:${seed}`));
      if (selected[i] === sh.answer) s += 1;
    });
    return s;
  }, [pool, selected, seed]);

  function start() {
    setStarted(true);
    setIdx(0);
    setSelected({});
    setRevealed(false);
    setFinished(false);
  }

  function pick(oi: number) {
    if (finished || revealed) return;
    setSelected((prev) => ({ ...prev, [idx]: oi }));
    setRevealed(true);
  }

  function next() {
    if (idx + 1 >= pool.length) {
      setFinished(true);
      const mapped: Record<number, number> = {};
      const questions = pool.map((q, i) => {
        const sh = shuffleQuestion(
          q,
          hashString(`${q.lessonId}:${q.q}:${seed}`)
        );
        mapped[i] = selected[i];
        return sh;
      });
      saveQuizScore("interview-drill", score, pool.length, {
        weakTopics: weakTopicsFromAnswers(questions, mapped).map((w) => w.topic),
        questions,
        selected: mapped,
      });
      return;
    }
    setIdx((i) => i + 1);
    setRevealed(false);
  }

  function retake() {
    setSeed(Date.now() % 100000);
    setStarted(false);
    setFinished(false);
    setSelected({});
    setIdx(0);
    setRevealed(false);
  }

  return (
    <div className="interview-drill">
      <header className="interview-head">
        <p className="eyebrow">Interview path</p>
        <h1>Scenario drills &amp; prompts</h1>
        <p className="lead">
          Multiple-choice scenarios pulled from the core quiz bank, plus open
          interview prompts from each lesson. Use this after Fast or Full path
          reading.
        </p>
      </header>

      <div className="interview-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "mcq"}
          className={mode === "mcq" ? "active" : ""}
          onClick={() => setMode("mcq")}
        >
          MCQ drill ({bank.filter((q) => Number(q.lessonNumber) <= 12).length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "prompts"}
          className={mode === "prompts" ? "active" : ""}
          onClick={() => setMode("prompts")}
        >
          Open prompts ({prompts.length})
        </button>
      </div>

      {mode === "mcq" && (
        <section className="interview-mcq">
          {!started || finished ? (
            <div className="interview-setup">
              {finished && (
                <div
                  className={`quiz-result ${score / pool.length >= 0.7 ? "pass" : "fail"}`}
                  role="status"
                >
                  <span className="quiz-result-icon" aria-hidden="true">
                    {score / pool.length >= 0.7 ? "✓" : "!"}
                  </span>
                  <span>
                    Drill score: {score}/{pool.length}
                    {score / pool.length >= 0.7
                      ? " — interview-ready range for this set."
                      : " — review weak topics and retake."}
                  </span>
                </div>
              )}
              <label className="quiz-mode">
                <input
                  type="checkbox"
                  checked={scenarioOnly}
                  onChange={(e) => setScenarioOnly(e.target.checked)}
                />
                Prefer scenario-style questions
              </label>
              <label className="interview-count">
                Questions
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                >
                  {[5, 10, 15, 20].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hero-actions">
                <button type="button" className="btn btn-primary" onClick={start}>
                  {finished ? "New drill" : "Start drill"}
                </button>
                {finished && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={retake}
                  >
                    Reshuffle
                  </button>
                )}
              </div>
            </div>
          ) : (
            shuffled &&
            current && (
              <div className="interview-q">
                <p className="interview-meta">
                  {idx + 1}/{pool.length} · Lesson {current.lessonNumber}{" "}
                  {current.lessonTitle}
                  {current.style === "scenario" && (
                    <span className="quiz-topic-tag">scenario</span>
                  )}
                </p>
                <p className="review-q">{current.q}</p>
                <div className="quiz-options" role="radiogroup">
                  {shuffled.options.map((opt, oi) => {
                    const letter = String.fromCharCode(65 + oi);
                    let cls = "quiz-option";
                    if (revealed) {
                      if (oi === shuffled.answer) cls += " correct";
                      else if (selected[idx] === oi) cls += " wrong";
                    } else if (selected[idx] === oi) cls += " selected";
                    return (
                      <button
                        key={oi}
                        type="button"
                        role="radio"
                        aria-checked={selected[idx] === oi}
                        className={cls}
                        disabled={revealed}
                        onClick={() => pick(oi)}
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
                      {selected[idx] === shuffled.answer
                        ? `Correct. ${current.explain}`
                        : `Not quite. ${current.explain}`}
                    </p>
                    <div className="review-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={next}
                      >
                        {idx + 1 >= pool.length ? "Finish" : "Next"}
                      </button>
                      <Link
                        className="btn btn-ghost"
                        href={`/lesson/${current.lessonId}`}
                      >
                        Open lesson
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )
          )}
        </section>
      )}

      {mode === "prompts" && (
        <section className="interview-prompts">
          <p className="quiz-intro">
            Speak answers out loud or jot notes — these are open-ended (no
            auto-score).
          </p>
          <div className="accordion">
            {prompts.map((p, i) => {
              const open = openPrompt === i;
              return (
                <div
                  key={p.id}
                  className={`acc-item${open ? " open" : ""}`}
                >
                  <button
                    type="button"
                    className="acc-trigger"
                    aria-expanded={open}
                    onClick={() => setOpenPrompt(open ? null : i)}
                  >
                    <span className="acc-num">{i + 1}</span>
                    <span className="acc-title">{p.prompt}</span>
                    <span className="acc-meta">
                      {p.lessonNumber}
                      <span className="acc-chevron" aria-hidden="true">
                        {open ? "−" : "+"}
                      </span>
                    </span>
                  </button>
                  {open && (
                    <div className="acc-panel">
                      <p className="quiz-feedback">
                        From lesson {p.lessonNumber}: {p.lessonTitle}. Review
                        the lesson if you cannot explain this cleanly in under
                        two minutes.
                      </p>
                      <Link
                        className="btn btn-secondary btn-sm"
                        href={`/lesson/${p.lessonId}`}
                      >
                        Open lesson
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
