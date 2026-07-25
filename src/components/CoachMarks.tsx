"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/context/ProgressContext";

const STORAGE_KEY = "aws-path-coach-v1";

type Step = {
  id: string;
  title: string;
  body: string;
  target?: string;
};

/** Short 3-step first-run tour (P3: simplify home) */
const STEPS: Step[] = [
  {
    id: "welcome",
    title: "Start here",
    body: "Self-paced AWS lessons with quizzes. Progress stays in this browser — no login required.",
  },
  {
    id: "path",
    title: "Pick a path",
    body: "Fast foundations, Full core 12, Interview drills, or Everything including SAA topics 13–20.",
    target: ".path-picker",
  },
  {
    id: "start",
    title: "Open lesson 01",
    body: "Read sections, do the lab when present, then take the quiz. Aim for ≥70% before marking complete.",
    target: ".landing-lesson-grid .lesson-card, .lesson-grid .lesson-card",
  },
];

export function CoachMarks() {
  const { ready, completedCount } = useProgress();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!ready) return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "done") return;
    } catch {
      return;
    }
    if (completedCount > 0) return;
    // Delay so we don't block the first paint / CTA
    const t = window.setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [ready, completedCount]);

  useEffect(() => {
    if (!open) return;
    const current = STEPS[step];
    function measure() {
      if (!current?.target) {
        setRect(null);
        return;
      }
      const el = document.querySelector(current.target);
      if (el) {
        setRect(el.getBoundingClientRect());
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      } else {
        setRect(null);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [open, step]);

  function finish() {
    try {
      localStorage.setItem(STORAGE_KEY, "done");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  function next() {
    if (step >= STEPS.length - 1) finish();
    else setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  if (!open) return null;

  const s = STEPS[step];
  const pad = 8;

  return (
    <div className="coach" role="dialog" aria-modal="true" aria-labelledby="coach-title">
      <div className="coach-scrim" onClick={finish} />
      {rect && (
        <div
          className="coach-spotlight"
          style={{
            top: Math.max(8, rect.top - pad),
            left: Math.max(8, rect.left - pad),
            width: Math.min(rect.width + pad * 2, window.innerWidth - 16),
            height: rect.height + pad * 2,
          }}
        />
      )}
      <div
        className={`coach-card${rect ? " anchored" : ""}`}
        style={
          rect
            ? {
                top: Math.min(rect.bottom + 12, window.innerHeight - 200),
                left: Math.max(
                  12,
                  Math.min(rect.left, window.innerWidth - 352)
                ),
              }
            : undefined
        }
      >
        <p className="coach-step">
          {step + 1} / {STEPS.length}
        </p>
        <h2 id="coach-title">{s.title}</h2>
        <p>{s.body}</p>
        <div className="coach-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={finish}>
            Skip
          </button>
          <div className="coach-nav">
            {step > 0 && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={back}>
                Back
              </button>
            )}
            <button type="button" className="btn btn-primary btn-sm" onClick={next}>
              {step >= STEPS.length - 1 ? "Got it" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
