import type { Lesson } from "@/types/lesson";
import { part1 } from "./part1";
import { part2 } from "./part2";
import { part3 } from "./part3";

export const lessons: Lesson[] = [...part1, ...part2, ...part3];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function getLessonIndex(id: string): number {
  return lessons.findIndex((l) => l.id === id);
}

export function getAdjacent(id: string): {
  prev: Lesson | null;
  next: Lesson | null;
} {
  const idx = getLessonIndex(id);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? lessons[idx - 1] : null,
    next: idx < lessons.length - 1 ? lessons[idx + 1] : null,
  };
}

export function getSections(): { section: string; items: Lesson[] }[] {
  const map = new Map<string, Lesson[]>();
  const order: string[] = [];
  for (const lesson of lessons) {
    if (!map.has(lesson.section)) {
      map.set(lesson.section, []);
      order.push(lesson.section);
    }
    map.get(lesson.section)!.push(lesson);
  }
  return order.map((section) => ({ section, items: map.get(section)! }));
}
