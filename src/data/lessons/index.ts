import type { Lesson, LessonSummary } from "@/types/lesson";
import indexJson from "@/data/generated/index.json";

/** Lightweight index (no HTML body) — safe for home + sidebar. */
export const lessonSummaries: LessonSummary[] = indexJson as LessonSummary[];

/** @deprecated Prefer lessonSummaries — kept name for fewer call-site renames */
export const lessons = lessonSummaries;

export function getLessonSummary(id: string): LessonSummary | undefined {
  return lessonSummaries.find((l) => l.id === id);
}

export function getLessonIndex(id: string): number {
  return lessonSummaries.findIndex((l) => l.id === id);
}

export function getAdjacentSummaries(id: string): {
  prev: LessonSummary | null;
  next: LessonSummary | null;
} {
  const idx = getLessonIndex(id);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? lessonSummaries[idx - 1] : null,
    next: idx < lessonSummaries.length - 1 ? lessonSummaries[idx + 1] : null,
  };
}

/** @deprecated use getAdjacentSummaries */
export function getAdjacent(id: string) {
  return getAdjacentSummaries(id);
}

export function getSections(): { section: string; items: LessonSummary[] }[] {
  const map = new Map<string, LessonSummary[]>();
  const order: string[] = [];
  for (const lesson of lessonSummaries) {
    if (!map.has(lesson.section)) {
      map.set(lesson.section, []);
      order.push(lesson.section);
    }
    map.get(lesson.section)!.push(lesson);
  }
  return order.map((section) => ({ section, items: map.get(section)! }));
}

/**
 * Dynamically load one full lesson (content + quiz) — code-split per id.
 */
export async function loadLesson(id: string): Promise<Lesson | null> {
  try {
    const mod = await import(`@/data/generated/lessons/${id}.json`);
    return (mod.default ?? mod) as Lesson;
  } catch {
    return null;
  }
}

export function getAllLessonIds(): string[] {
  return lessonSummaries.map((l) => l.id);
}
