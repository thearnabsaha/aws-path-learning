"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProgress } from "@/context/ProgressContext";
import { dueReviews } from "@/lib/quizUtils";

export function DueToday() {
  const { reviewQueue, ready } = useProgress();
  const due = useMemo(() => dueReviews(reviewQueue), [reviewQueue]);

  if (!ready || !due.length) return null;

  const topics = [...new Set(due.map((d) => d.topic))].slice(0, 4);

  return (
    <section className="due-today" aria-label="Reviews due today">
      <div>
        <h2>Due today</h2>
        <p>
          <strong>{due.length}</strong> spaced-review item
          {due.length === 1 ? "" : "s"}
          {topics.length ? ` · ${topics.join(", ")}` : ""}. Short sessions beat
          cramming.
        </p>
      </div>
      <Link className="btn btn-primary" href="/review">
        Review now
      </Link>
    </section>
  );
}
