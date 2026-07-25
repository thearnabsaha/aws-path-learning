"use client";

import { LEARNING_PATHS } from "@/lib/paths";
import type { LearningPathId } from "@/types/lesson";
import { useProgress } from "@/context/ProgressContext";
import { trackEvent } from "@/lib/analytics";

export function PathPicker({ compact = false }: { compact?: boolean }) {
  const { learningPath, setLearningPath } = useProgress();

  return (
    <div
      className={`path-picker${compact ? " compact" : ""}`}
      role="group"
      aria-label="Learning path"
    >
      {!compact && (
        <div className="path-picker-head">
          <h2>Choose your path</h2>
          <p>
            Filter the curriculum. Progress is saved for every lesson; stats
            below follow the path you pick.
          </p>
        </div>
      )}
      <div className="path-options">
        {LEARNING_PATHS.map((p) => {
          const active = learningPath === p.id;
          return (
            <button
              key={p.id}
              type="button"
              className={`path-option${active ? " active" : ""}`}
              aria-pressed={active}
              onClick={() => {
                setLearningPath(p.id as LearningPathId);
                trackEvent("path_change", { path: p.id });
              }}
            >
              <span className="path-option-label">{p.label}</span>
              <span className="path-option-short">{p.short}</span>
              {!compact && (
                <span className="path-option-desc">{p.description}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
