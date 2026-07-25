"use client";

import { useEffect, useMemo, useState } from "react";
import { splitLessonHtml } from "@/lib/splitLessonHtml";

export function LessonAccordion({
  contentHtml,
  goals,
}: {
  contentHtml: string;
  goals: string[];
}) {
  const contentParts = useMemo(
    () => splitLessonHtml(contentHtml),
    [contentHtml]
  );

  const parts = useMemo(() => {
    const list: { id: string; title: string; html?: string; goals?: string[] }[] =
      [];
    if (goals.length) {
      list.push({
        id: "goals",
        title: "What you will learn",
        goals,
      });
    }
    contentParts.forEach((p) => list.push(p));
    return list;
  }, [contentParts, goals]);

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const first = parts[0]?.id;
    setOpenIds(new Set(first ? [first] : []));
  }, [contentHtml, parts]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function expandAll() {
    setOpenIds(new Set(parts.map((p) => p.id)));
  }

  function collapseAll() {
    setOpenIds(new Set());
  }

  if (!parts.length) return null;

  return (
    <div className="lesson-acc">
      <div className="lesson-acc-toolbar">
        <p className="lesson-acc-hint">
          {parts.length} sections · open only what you need
        </p>
        <div className="lesson-acc-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={expandAll}>
            Expand all
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
      </div>

      <div className="accordion lesson-parts" role="list">
        {parts.map((part, index) => {
          const isOpen = openIds.has(part.id);
          return (
            <div
              key={part.id}
              className={`acc-item lesson-part${isOpen ? " open" : ""}`}
              role="listitem"
            >
              <button
                type="button"
                className="acc-trigger"
                aria-expanded={isOpen}
                onClick={() => toggle(part.id)}
              >
                <span className="acc-num">{index + 1}</span>
                <span className="acc-title">{part.title}</span>
                <span className="acc-meta">
                  <span className="acc-chevron" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </span>
              </button>
              {isOpen && (
                <div className="acc-panel">
                  {part.goals ? (
                    <ul className="goals-list">
                      {part.goals.map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  ) : (
                    <div
                      className="prose"
                      dangerouslySetInnerHTML={{ __html: part.html || "" }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
