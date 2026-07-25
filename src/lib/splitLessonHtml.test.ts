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

  it("splits on each h2 and strips tags in titles", () => {
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

  it("discards orphan prose before the first h2", () => {
    const html = `<p>orphan</p><h2>Real</h2><p>body</p>`;
    const parts = splitLessonHtml(html);
    expect(parts).toHaveLength(1);
    expect(parts[0].title).toBe("Real");
    expect(parts[0].html).not.toContain("orphan");
  });
});
