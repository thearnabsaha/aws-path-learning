import type { ProgressState } from "@/types/lesson";

export const STORAGE_KEY = "aws-path-progress-v2";

export function emptyProgress(): ProgressState {
  return { completed: {}, quizScores: {} };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw) as ProgressState;
    return {
      completed: data.completed || {},
      quizScores: data.quizScores || {},
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(data: ProgressState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
