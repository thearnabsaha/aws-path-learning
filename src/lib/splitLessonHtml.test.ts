import { describe, expect, it } from "vitest";
import { splitLessonHtml } from "./splitLessonHtml";

describe("splitLessonHtml", () => {
  it("returns empty for blank input", () => {
    expect(splitLessonHtml("")).toEqual([]);
    expect(splitLessonHtml("   ")).toEqual([]);
  });

  it("wraps content without h2 into a single part", () => {
    const parts = splitLessonHtml("<p>Hello</p>");
    expect(parts).toHaveLength(1);
    expect(parts[0].id).toBe("content");
    expect(parts[0].html).toContain("Hello");
  });

  it("splits on each h2 when there are few sections", () => {
    const html = `
      <h2>First <em>section</em></h2>
      <p>A</p>
      <h2>Second</h2>
      <p>B</p>
    `;
    const parts = splitLessonHtml(html);
    expect(parts).toHaveLength(2);
    expect(parts[0].id).toBe("part-1");
    expect(parts[0].title).toBe("First section");
    expect(parts[0].html).toContain("<p>A</p>");
    expect(parts[1].id).toBe("part-2");
    expect(parts[1].title).toBe("Second");
    expect(parts[1].html).toContain("<p>B</p>");
  });

  it("decodes common HTML entities in titles", () => {
    const parts = splitLessonHtml("<h2>You&#x27;ve got this</h2><p>x</p>");
    expect(parts[0].title).toBe("You've got this");
  });

  it("groups minor h2s under major chapters when many sections exist", () => {
    const chunks: string[] = [];
    chunks.push("<h2>Chapter 1 — Big idea</h2><p>intro</p>");
    for (let i = 0; i < 16; i++) {
      chunks.push(`<h2>Minor topic ${i}</h2><p>body ${i}</p>`);
    }
    chunks.push("<h2>Chapter 2 — Next</h2><p>more</p>");
    chunks.push("<h2>Another minor</h2><p>x</p>");
    const parts = splitLessonHtml(chunks.join("\n"));
    // Should not create 18+ parts
    expect(parts.length).toBeLessThan(8);
    expect(parts[0].title).toMatch(/Chapter 1/i);
    // minor headings demoted into body
    expect(parts[0].html).toMatch(/<h3/i);
    expect(parts.some((p) => /Chapter 2/i.test(p.title))).toBe(true);
  });
});
