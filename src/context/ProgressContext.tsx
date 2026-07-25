"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { lessonSummaries } from "@/data/lessons";
import {
  emptyProgress,
  loadProgress,
  saveProgress,
} from "@/lib/progress";
import type { ProgressState } from "@/types/lesson";

type ProgressContextValue = {
  ready: boolean;
  completed: Record<string, number>;
  quizScores: ProgressState["quizScores"];
  completedCount: number;
  total: number;
  percent: number;
  isDone: (id: string) => boolean;
  setDone: (id: string, done: boolean) => void;
  saveQuizScore: (id: string, score: number, total: number) => void;
  reset: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<ProgressState>(emptyProgress);

  useEffect(() => {
    setState(loadProgress());
    setReady(true);
  }, []);

  const persist = useCallback((next: ProgressState) => {
    setState(next);
    saveProgress(next);
  }, []);

  const isDone = useCallback(
    (id: string) => !!state.completed[id],
    [state.completed]
  );

  const setDone = useCallback(
    (id: string, done: boolean) => {
      const completed = { ...state.completed };
      if (done) completed[id] = Date.now();
      else delete completed[id];
      persist({ ...state, completed });
    },
    [persist, state]
  );

  const saveQuizScore = useCallback(
    (id: string, score: number, total: number) => {
      persist({
        ...state,
        quizScores: {
          ...state.quizScores,
          [id]: { score, total, at: Date.now() },
        },
      });
    },
    [persist, state]
  );

  const reset = useCallback(() => {
    persist(emptyProgress());
  }, [persist]);

  const completedCount = useMemo(
    () => lessonSummaries.filter((l) => state.completed[l.id]).length,
    [state.completed]
  );

  const total = lessonSummaries.length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  const value = useMemo(
    () => ({
      ready,
      completed: state.completed,
      quizScores: state.quizScores,
      completedCount,
      total,
      percent,
      isDone,
      setDone,
      saveQuizScore,
      reset,
    }),
    [
      ready,
      state.completed,
      state.quizScores,
      completedCount,
      total,
      percent,
      isDone,
      setDone,
      saveQuizScore,
      reset,
    ]
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
