import type { ProgressState } from "@/types/lesson";

export const STORAGE_KEY = "aws-path-progress-v3";
const LEGACY_KEYS = ["aws-path-progress-v2", "aws-path-progress"];

export function emptyProgress(): ProgressState {
  return {
    completed: {},
    quizScores: {},
    sections: {},
    labs: {},
    lastSection: {},
    reviewQueue: [],
  };
}

function normalize(raw: unknown): ProgressState {
  const base = emptyProgress();
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ProgressState> & {
    completed?: Record<string, number>;
    quizScores?: ProgressState["quizScores"];
  };
  return {
    completed: data.completed || {},
    quizScores: data.quizScores || {},
    sections: data.sections || {},
    labs: data.labs || {},
    lastSection: data.lastSection || {},
    reviewQueue: Array.isArray(data.reviewQueue) ? data.reviewQueue : [],
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));

    // Migrate older keys once
    for (const key of LEGACY_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        const migrated = normalize(JSON.parse(legacy));
        saveProgress(migrated);
        localStorage.removeItem(key);
        return migrated;
      }
    }
    return emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(data: ProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportProgressJson(data: ProgressState): string {
  return JSON.stringify(
    {
      app: "aws-path",
      version: 3,
      exportedAt: new Date().toISOString(),
      progress: data,
    },
    null,
    2
  );
}

export function importProgressJson(text: string): ProgressState {
  const parsed = JSON.parse(text) as {
    progress?: unknown;
    completed?: Record<string, number>;
  };
  // Accept both wrapped export and raw ProgressState
  if (parsed.progress) return normalize(parsed.progress);
  return normalize(parsed);
}
