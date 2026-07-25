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
  exportProgressJson,
  importProgressJson,
  loadProgress,
  saveProgress,
} from "@/lib/progress";
import { filterLessonsByPath } from "@/lib/paths";
import type {
  LearningPathId,
  ProgressState,
  QuizQuestion,
  ReviewItem,
} from "@/types/lesson";
import {
  scheduleAfterFail,
  scheduleAfterSuccess,
  upsertMisses,
} from "@/lib/quizUtils";

type ProgressContextValue = {
  ready: boolean;
  completed: Record<string, number>;
  quizScores: ProgressState["quizScores"];
  sections: ProgressState["sections"];
  labs: ProgressState["labs"];
  lastSection: ProgressState["lastSection"];
  reviewQueue: ReviewItem[];
  learningPath: LearningPathId;
  setLearningPath: (id: LearningPathId) => void;
  pathLessons: typeof lessonSummaries;
  /** Path-scoped */
  completedCount: number;
  total: number;
  percent: number;
  minutesRemaining: number;
  /** All lessons (for admin/export) */
  globalCompletedCount: number;
  globalTotal: number;
  isDone: (id: string) => boolean;
  setDone: (id: string, done: boolean) => void;
  saveQuizScore: (
    id: string,
    score: number,
    total: number,
    opts?: {
      weakTopics?: string[];
      questions?: QuizQuestion[];
      selected?: Record<number, number>;
    }
  ) => void;
  markSection: (lessonId: string, sectionId: string) => void;
  setLastSection: (lessonId: string, sectionId: string) => void;
  isSectionDone: (lessonId: string, sectionId: string) => boolean;
  sectionProgress: (lessonId: string, totalSections: number) => number;
  setLabItem: (lessonId: string, itemId: string, checked: boolean) => void;
  isLabChecked: (lessonId: string, itemId: string) => boolean;
  removeReview: (id: string) => void;
  markReviewCorrect: (id: string) => void;
  markReviewWrong: (id: string) => void;
  exportJson: () => string;
  importJson: (text: string) => { ok: true } | { ok: false; error: string };
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

  const pathLessons = useMemo(
    () => filterLessonsByPath(lessonSummaries, state.learningPath),
    [state.learningPath]
  );

  const setLearningPath = useCallback(
    (id: LearningPathId) => {
      if (state.learningPath === id) return;
      persist({ ...state, learningPath: id });
    },
    [persist, state]
  );

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
    (
      id: string,
      score: number,
      total: number,
      opts?: {
        weakTopics?: string[];
        questions?: QuizQuestion[];
        selected?: Record<number, number>;
      }
    ) => {
      let reviewQueue = state.reviewQueue;
      if (opts?.questions && opts.selected) {
        reviewQueue = upsertMisses(
          state.reviewQueue,
          id,
          opts.questions,
          opts.selected
        );
      }
      persist({
        ...state,
        reviewQueue,
        quizScores: {
          ...state.quizScores,
          [id]: {
            score,
            total,
            at: Date.now(),
            weakTopics: opts?.weakTopics,
          },
        },
      });
    },
    [persist, state]
  );

  const markSection = useCallback(
    (lessonId: string, sectionId: string) => {
      const lessonSecs = { ...(state.sections[lessonId] || {}) };
      if (lessonSecs[sectionId]) {
        persist({
          ...state,
          lastSection: { ...state.lastSection, [lessonId]: sectionId },
        });
        return;
      }
      lessonSecs[sectionId] = Date.now();
      persist({
        ...state,
        sections: { ...state.sections, [lessonId]: lessonSecs },
        lastSection: { ...state.lastSection, [lessonId]: sectionId },
      });
    },
    [persist, state]
  );

  const setLastSection = useCallback(
    (lessonId: string, sectionId: string) => {
      if (state.lastSection[lessonId] === sectionId) return;
      persist({
        ...state,
        lastSection: { ...state.lastSection, [lessonId]: sectionId },
      });
    },
    [persist, state]
  );

  const isSectionDone = useCallback(
    (lessonId: string, sectionId: string) =>
      !!state.sections[lessonId]?.[sectionId],
    [state.sections]
  );

  const sectionProgress = useCallback(
    (lessonId: string, totalSections: number) => {
      if (!totalSections) return 0;
      const n = Object.keys(state.sections[lessonId] || {}).length;
      return Math.min(100, Math.round((n / totalSections) * 100));
    },
    [state.sections]
  );

  const setLabItem = useCallback(
    (lessonId: string, itemId: string, checked: boolean) => {
      const lab = { ...(state.labs[lessonId] || {}) };
      if (checked) lab[itemId] = true;
      else delete lab[itemId];
      persist({ ...state, labs: { ...state.labs, [lessonId]: lab } });
    },
    [persist, state]
  );

  const isLabChecked = useCallback(
    (lessonId: string, itemId: string) => !!state.labs[lessonId]?.[itemId],
    [state.labs]
  );

  const removeReview = useCallback(
    (id: string) => {
      persist({
        ...state,
        reviewQueue: state.reviewQueue.filter((r) => r.id !== id),
      });
    },
    [persist, state]
  );

  const markReviewCorrect = useCallback(
    (id: string) => {
      const now = Date.now();
      const nextQueue: typeof state.reviewQueue = [];
      for (const r of state.reviewQueue) {
        if (r.id !== id) {
          nextQueue.push(r);
          continue;
        }
        const scheduled = scheduleAfterSuccess(r, now);
        if (scheduled) nextQueue.push(scheduled);
      }
      persist({ ...state, reviewQueue: nextQueue });
    },
    [persist, state]
  );

  const markReviewWrong = useCallback(
    (id: string) => {
      const now = Date.now();
      persist({
        ...state,
        reviewQueue: state.reviewQueue.map((r) => {
          if (r.id !== id) return r;
          return { ...r, ...scheduleAfterFail(r, now) };
        }),
      });
    },
    [persist, state]
  );

  const exportJson = useCallback(() => exportProgressJson(state), [state]);

  const importJson = useCallback(
    (text: string) => {
      try {
        const next = importProgressJson(text);
        persist(next);
        return { ok: true as const };
      } catch (e) {
        return {
          ok: false as const,
          error: e instanceof Error ? e.message : "Invalid JSON",
        };
      }
    },
    [persist]
  );

  const reset = useCallback(() => {
    persist(emptyProgress());
  }, [persist]);

  const completedCount = useMemo(
    () => pathLessons.filter((l) => state.completed[l.id]).length,
    [pathLessons, state.completed]
  );

  const total = pathLessons.length;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;

  const minutesRemaining = useMemo(
    () =>
      pathLessons
        .filter((l) => !state.completed[l.id])
        .reduce((n, l) => n + l.minutes, 0),
    [pathLessons, state.completed]
  );

  const globalCompletedCount = useMemo(
    () => lessonSummaries.filter((l) => state.completed[l.id]).length,
    [state.completed]
  );
  const globalTotal = lessonSummaries.length;

  const value = useMemo(
    () => ({
      ready,
      completed: state.completed,
      quizScores: state.quizScores,
      sections: state.sections,
      labs: state.labs,
      lastSection: state.lastSection,
      reviewQueue: state.reviewQueue,
      learningPath: state.learningPath,
      setLearningPath,
      pathLessons,
      completedCount,
      total,
      percent,
      minutesRemaining,
      globalCompletedCount,
      globalTotal,
      isDone,
      setDone,
      saveQuizScore,
      markSection,
      setLastSection,
      isSectionDone,
      sectionProgress,
      setLabItem,
      isLabChecked,
      removeReview,
      markReviewCorrect,
      markReviewWrong,
      exportJson,
      importJson,
      reset,
    }),
    [
      ready,
      state,
      setLearningPath,
      pathLessons,
      completedCount,
      total,
      percent,
      minutesRemaining,
      globalCompletedCount,
      globalTotal,
      isDone,
      setDone,
      saveQuizScore,
      markSection,
      setLastSection,
      isSectionDone,
      sectionProgress,
      setLabItem,
      isLabChecked,
      removeReview,
      markReviewCorrect,
      markReviewWrong,
      exportJson,
      importJson,
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
