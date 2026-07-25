"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { splitLessonHtml } from "@/lib/splitLessonHtml";
import { useProgress } from "@/context/ProgressContext";

export function LessonAccordion({
  lessonId,
  contentHtml,
  goals,
}: {
  lessonId: string;
  contentHtml: string;
  goals: string[];
}) {
  const baseId = useId();
  const searchParams = useSearchParams();
  const {
    markSection,
    isSectionDone,
    sectionProgress,
    lastSection,
    setLastSection,
  } = useProgress();

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

  // Initial open: ?section= → lastSection → first part
  useEffect(() => {
    const fromQuery = searchParams.get("section");
    const resume = lastSection[lessonId];
    const target =
      (fromQuery && parts.some((p) => p.id === fromQuery) && fromQuery) ||
      (resume && parts.some((p) => p.id === resume) && resume) ||
      parts[0]?.id;
    setOpenIds(new Set(target ? [target] : []));
    if (target) {
      markSection(lessonId, target);
      // scroll after paint
      requestAnimationFrame(() => {
        document.getElementById(`${baseId}-trigger-${target}`)?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      });
    }
    // only on lesson change / query
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId, contentHtml, searchParams]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        markSection(lessonId, id);
        setLastSection(lessonId, id);
        // update URL without full navigation
        try {
          const url = new URL(window.location.href);
          url.searchParams.set("section", id);
          window.history.replaceState({}, "", url.toString());
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }

  function expandAll() {
    setOpenIds(new Set(parts.map((p) => p.id)));
    parts.forEach((p) => markSection(lessonId, p.id));
  }

  function collapseAll() {
    setOpenIds(new Set());
  }

  function onTriggerKeyDown(
    e: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    const triggers = parts.map((p) => `${baseId}-trigger-${p.id}`);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const next = (index + delta + parts.length) % parts.length;
      document.getElementById(triggers[next])?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      document.getElementById(triggers[0])?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      document.getElementById(triggers[parts.length - 1])?.focus();
    }
  }

  if (!parts.length) return null;

  const prog = sectionProgress(lessonId, parts.length);
  const doneCount = parts.filter((p) => isSectionDone(lessonId, p.id)).length;

  return (
    <div className="lesson-acc">
      <div className="lesson-acc-toolbar">
        <div className="lesson-acc-progress">
          <p className="lesson-acc-hint">
            {parts.length} sections · {doneCount} opened · {prog}% explored
          </p>
          <div className="progress-track section-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${prog}%` }} />
          </div>
        </div>
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
          const seen = isSectionDone(lessonId, part.id);
          const triggerId = `${baseId}-trigger-${part.id}`;
          const panelId = `${baseId}-panel-${part.id}`;

          return (
            <div
              key={part.id}
              className={`acc-item lesson-part${isOpen ? " open" : ""}${seen ? " seen" : ""}`}
              role="listitem"
            >
              <button
                type="button"
                id={triggerId}
                className="acc-trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(part.id)}
                onKeyDown={(e) => onTriggerKeyDown(e, index)}
              >
                <span className="acc-num" aria-hidden="true">
                  {seen ? "✓" : index + 1}
                </span>
                <span className="acc-title">{part.title}</span>
                <span className="acc-meta">
                  {seen && !isOpen && (
                    <span className="status-badge" data-status="picked">
                      <span className="status-text">Opened</span>
                    </span>
                  )}
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
                {isOpen &&
                  (part.goals ? (
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
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
