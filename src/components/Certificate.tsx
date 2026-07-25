"use client";

import { useMemo } from "react";
import { lessonSummaries } from "@/data/lessons";
import { useProgress } from "@/context/ProgressContext";

export function Certificate() {
  const { isDone, ready } = useProgress();

  const core = useMemo(
    () => lessonSummaries.filter((l) => Number(l.number) <= 12),
    []
  );
  const coreDone = core.filter((l) => isDone(l.id)).length;
  const allCore = coreDone === core.length && core.length > 0;

  const extra = useMemo(
    () => lessonSummaries.filter((l) => Number(l.number) > 12),
    []
  );
  const extraDone = extra.filter((l) => isDone(l.id)).length;

  if (!ready || !allCore) return null;

  const date = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  function share() {
    const text = `I finished the AWS Path core curriculum (${core.length}/12 lessons) — free, self-paced, local progress.`;
    if (navigator.share) {
      void navigator.share({ text, title: "AWS Path" }).catch(() => undefined);
    } else {
      void navigator.clipboard.writeText(text);
      alert("Copied a share blurb to the clipboard.");
    }
  }

  return (
    <section className="certificate" aria-label="Completion certificate">
      <div className="certificate-card">
        <p className="certificate-kicker">Certificate of completion</p>
        <h2>AWS Path — Core curriculum</h2>
        <p className="certificate-body">
          You completed all <strong>{core.length}</strong> core lessons (IAM
          through infrastructure as code), with quizzes and local progress on
          this device.
        </p>
        <p className="certificate-meta">
          {date}
          {extraDone > 0
            ? ` · Also finished ${extraDone}/${extra.length} additional topics`
            : ""}
        </p>
        <div className="certificate-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={share}>
            Share
          </button>
        </div>
      </div>
    </section>
  );
}
