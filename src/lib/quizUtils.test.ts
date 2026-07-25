import { describe, expect, it } from "vitest";
import {
  hashString,
  inferTopic,
  makeReviewId,
  nextDue,
  scoreQuiz,
  shuffleQuestion,
  upsertMisses,
  weakTopicsFromAnswers,
} from "./quizUtils";
import type { QuizQuestion } from "@/types/lesson";

const sample: QuizQuestion = {
  q: "What is the purpose of a Security Group?",
  options: ["Firewall", "DNS", "CDN", "Queue"],
  answer: 0,
  explain: "SGs act as virtual firewalls.",
};

describe("shuffleQuestion", () => {
  it("keeps the correct answer under a new index", () => {
    const sh = shuffleQuestion(sample, 42);
    expect(sh.options).toHaveLength(4);
    expect(sh.options[sh.answer]).toBe("Firewall");
    expect(new Set(sh.options).size).toBe(4);
  });

  it("is deterministic for the same seed", () => {
    const a = shuffleQuestion(sample, 7);
    const b = shuffleQuestion(sample, 7);
    expect(a.options).toEqual(b.options);
    expect(a.answer).toBe(b.answer);
  });
});

describe("scoreQuiz", () => {
  it("counts correct selections", () => {
    const qs: QuizQuestion[] = [
      sample,
      { ...sample, q: "AMI?", options: ["Image", "Disk"], answer: 0, explain: "x" },
    ];
    expect(scoreQuiz(qs, { 0: 0, 1: 1 })).toBe(1);
    expect(scoreQuiz(qs, { 0: 0, 1: 0 })).toBe(2);
    expect(scoreQuiz(qs, {})).toBe(0);
  });
});

describe("weakTopicsFromAnswers", () => {
  it("reports topics with misses", () => {
    const qs: QuizQuestion[] = [
      sample,
      {
        q: "What is an S3 bucket?",
        options: ["Object store", "VM"],
        answer: 0,
        explain: "S3 stores objects",
      },
    ];
    const weak = weakTopicsFromAnswers(qs, { 0: 1, 1: 0 });
    expect(weak.some((w) => w.wrong > 0)).toBe(true);
    expect(weak[0].topic.length).toBeGreaterThan(0);
  });
});

describe("inferTopic", () => {
  it("uses explicit topic when present", () => {
    expect(inferTopic({ ...sample, topic: "Custom" })).toBe("Custom");
  });

  it("infers from keywords", () => {
    expect(inferTopic(sample)).toBe("Security groups");
    expect(
      inferTopic({
        q: "What is an S3 bucket?",
        options: ["Object store", "VM"],
        answer: 0,
        explain: "S3 stores objects",
      })
    ).toMatch(/S3/i);
  });
});

describe("upsertMisses / spaced review", () => {
  it("adds wrong answers and expands interval on later success", () => {
    const qs = [sample];
    const q1 = upsertMisses([], "ec2", qs, { 0: 1 });
    expect(q1).toHaveLength(1);
    expect(q1[0].lessonId).toBe("ec2");
    expect(q1[0].id).toBe(makeReviewId("ec2", sample.q));
    expect(q1[0].intervalDays).toBe(1);
    expect(q1[0].dueAt).toBeGreaterThan(Date.now() - 1000);

    // Correct once → stays in queue with longer interval, not dropped immediately
    const q2 = upsertMisses(q1, "ec2", qs, { 0: 0 });
    expect(q2).toHaveLength(1);
    expect(q2[0].timesCorrect).toBe(1);
    expect((q2[0].intervalDays || 0) >= 1).toBe(true);
  });

  it("hashString is stable", () => {
    expect(hashString("abc")).toBe(hashString("abc"));
    expect(hashString("abc")).not.toBe(hashString("abd"));
  });

  it("nextDue grows with timesWrong", () => {
    const a = nextDue(1, 0);
    const b = nextDue(3, 0);
    expect(b).toBeGreaterThan(a);
  });
});
