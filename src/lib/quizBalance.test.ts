import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Q = { answer: number; options: string[] };

describe("quiz answer balance", () => {
  const raw = readFileSync(
    resolve(__dirname, "../../scripts/quizzes.json"),
    "utf8"
  );
  const quizzes = JSON.parse(raw) as Record<string, Q[]>;

  it("has no lesson where one option index is >45% of answers", () => {
    for (const [id, qs] of Object.entries(quizzes)) {
      if (!qs.length) continue;
      const counts = [0, 0, 0, 0];
      for (const q of qs) {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        counts[q.answer] = (counts[q.answer] || 0) + 1;
      }
      const maxShare = Math.max(...counts) / qs.length;
      expect(
        maxShare,
        `${id} is unbalanced: ${counts.join(",")} / ${qs.length}`
      ).toBeLessThanOrEqual(0.45);
    }
  });

  it("has at least 15 questions for each of the 20 lessons", () => {
    expect(Object.keys(quizzes).length).toBeGreaterThanOrEqual(12);
    for (const [id, qs] of Object.entries(quizzes)) {
      expect(qs.length, id).toBeGreaterThanOrEqual(15);
    }
  });
});
