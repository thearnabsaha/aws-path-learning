export type LessonPart = {
  id: string;
  title: string;
  html: string;
};

/**
 * Split lesson HTML into accordion parts on each <h2>.
 * Titles are decoded to plain text (no raw &#x27; entities in the UI).
 */
export function splitLessonHtml(html: string): LessonPart[] {
  const trimmed = html.trim();
  if (!trimmed) return [];

  const parts: LessonPart[] = [];
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  const matches = [...trimmed.matchAll(re)];

  if (!matches.length) {
    return [
      {
        id: "content",
        title: "Lesson content",
        html: trimmed,
      },
    ];
  }

  // Do not create a separate "Introduction" accordion for prose before the
  // first <h2>. That material is written into the Lesson N section instead.
  // If orphan leading HTML remains, it is discarded so the outline stays clean.

  matches.forEach((match, i) => {
    const title = stripTags(match[1]).trim() || `Part ${i + 1}`;
    const start = (match.index ?? 0) + match[0].length;
    const end =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? trimmed.length)
        : trimmed.length;
    const body = trimmed.slice(start, end).trim();
    parts.push({
      id: `part-${i + 1}`,
      title,
      html: body || "<p><em>No content in this section.</em></p>",
    });
  });

  return parts;
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&#x0*27;/gi, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
