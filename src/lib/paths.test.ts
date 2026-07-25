import { describe, expect, it } from "vitest";
import { FAST_LESSON_IDS, filterLessonsByPath, getPath } from "./paths";
import type { LessonSummary } from "@/types/lesson";

const sample: LessonSummary[] = [
  {
    id: "cloud-fundamentals",
    number: "01",
    section: "Start here",
    title: "Cloud",
    short: "",
    minutes: 10,
    tags: [],
    goals: [],
  },
  {
    id: "iam",
    number: "02",
    section: "Foundations",
    title: "IAM",
    short: "",
    minutes: 10,
    tags: [],
    goals: [],
  },
  {
    id: "lambda",
    number: "08",
    section: "Serverless",
    title: "Lambda",
    short: "",
    minutes: 10,
    tags: [],
    goals: [],
  },
  {
    id: "identity-center",
    number: "13",
    section: "Additional",
    title: "SSO",
    short: "",
    minutes: 10,
    tags: [],
    goals: [],
    comingSoon: true,
  },
];

describe("learning paths", () => {
  it("defaults unknown path to full", () => {
    expect(getPath("nope").id).toBe("full");
  });

  it("fast path only foundations list", () => {
    const ids = filterLessonsByPath(sample, "fast").map((l) => l.id);
    expect(ids).toEqual(
      sample.filter((l) => (FAST_LESSON_IDS as readonly string[]).includes(l.id)).map((l) => l.id)
    );
    expect(ids).not.toContain("lambda");
    expect(ids).not.toContain("identity-center");
  });

  it("full path excludes additional", () => {
    const ids = filterLessonsByPath(sample, "full").map((l) => l.id);
    expect(ids).toContain("lambda");
    expect(ids).not.toContain("identity-center");
  });

  it("all path includes additional", () => {
    const ids = filterLessonsByPath(sample, "all").map((l) => l.id);
    expect(ids).toContain("identity-center");
  });
});
