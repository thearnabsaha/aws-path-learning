import type { LessonSummary } from "@/types/lesson";

export type LearningPathId = "fast" | "full" | "interview" | "all";

export type LearningPath = {
  id: LearningPathId;
  label: string;
  short: string;
  description: string;
  /** Explicit lesson ids; empty means derive from filter */
  lessonIds?: string[];
  /** If set, keep lessons with number <= this (core full) */
  maxNumber?: number;
  /** Interview path emphasizes drill over reading order */
  interviewMode?: boolean;
  includeAdditional?: boolean;
};

/** Fast path: foundations most beginners need first (research P2 §12). */
export const FAST_LESSON_IDS = [
  "cloud-fundamentals",
  "iam",
  "ec2",
  "s3",
  "vpc",
  "rds",
  "elb-asg",
] as const;

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "fast",
    label: "Fast path",
    short: "Foundations",
    description:
      "Seven core lessons: cloud basics through load balancing — enough for a solid first pass.",
    lessonIds: [...FAST_LESSON_IDS],
  },
  {
    id: "full",
    label: "Full path",
    short: "Core 12",
    description:
      "All twelve core lessons from fundamentals through infrastructure as code.",
    maxNumber: 12,
  },
  {
    id: "interview",
    label: "Interview path",
    short: "Drill",
    description:
      "Core lessons plus scenario-style quiz drills and open interview prompts.",
    maxNumber: 12,
    interviewMode: true,
  },
  {
    id: "all",
    label: "Everything",
    short: "20 topics",
    description:
      "Core path plus additional SAA / job-readiness topics (some still coming soon).",
    includeAdditional: true,
  },
];

export const DEFAULT_PATH: LearningPathId = "full";

export function getPath(id: LearningPathId | string | undefined): LearningPath {
  return LEARNING_PATHS.find((p) => p.id === id) || LEARNING_PATHS[1];
}

export function filterLessonsByPath(
  lessons: LessonSummary[],
  pathId: LearningPathId | string
): LessonSummary[] {
  const path = getPath(pathId);
  if (path.lessonIds?.length) {
    const set = new Set(path.lessonIds);
    return lessons.filter((l) => set.has(l.id));
  }
  if (path.includeAdditional) return lessons;
  if (path.maxNumber != null) {
    return lessons.filter((l) => Number(l.number) <= path.maxNumber!);
  }
  return lessons.filter((l) => Number(l.number) <= 12);
}

export function isLessonInPath(
  lessonId: string,
  lessons: LessonSummary[],
  pathId: LearningPathId | string
): boolean {
  return filterLessonsByPath(lessons, pathId).some((l) => l.id === lessonId);
}
