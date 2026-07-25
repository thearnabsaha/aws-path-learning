import { afterEach, describe, expect, it } from "vitest";
import {
  emptyProgress,
  exportProgressJson,
  importProgressJson,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
} from "./progress";

describe("progress storage", () => {
  afterEach(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  it("emptyProgress has expected shape", () => {
    const p = emptyProgress();
    expect(p.completed).toEqual({});
    expect(p.quizScores).toEqual({});
    expect(p.sections).toEqual({});
    expect(p.labs).toEqual({});
    expect(p.lastSection).toEqual({});
    expect(p.reviewQueue).toEqual([]);
    expect(p.learningPath).toBe("full");
  });

  it("export/import round-trips", () => {
    const p = emptyProgress();
    p.completed["iam"] = 123;
    p.learningPath = "fast";
    p.quizScores["iam"] = { score: 8, total: 10, at: 1 };
    const json = exportProgressJson(p);
    const back = importProgressJson(json);
    expect(back.completed.iam).toBe(123);
    expect(back.learningPath).toBe("fast");
    expect(back.quizScores.iam?.score).toBe(8);
  });

  it("import accepts raw progress object", () => {
    const raw = JSON.stringify({
      completed: { ec2: 1 },
      learningPath: "interview",
    });
    const back = importProgressJson(raw);
    expect(back.completed.ec2).toBe(1);
    expect(back.learningPath).toBe("interview");
  });

  it("import falls back on invalid path", () => {
    const back = importProgressJson(
      JSON.stringify({ completed: {}, learningPath: "nope" })
    );
    expect(back.learningPath).toBe("full");
  });

  it("save/load via localStorage when available", () => {
    // jsdom environment for this file only if we use happy-dom/jsdom
    // In node, localStorage may be undefined — skip then.
    if (typeof localStorage === "undefined") {
      expect(loadProgress()).toEqual(emptyProgress());
      return;
    }
    const p = emptyProgress();
    p.completed["s3"] = 99;
    saveProgress(p);
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy();
    const loaded = loadProgress();
    expect(loaded.completed.s3).toBe(99);
  });
});
