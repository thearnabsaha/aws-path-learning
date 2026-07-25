export type LessonPart = {
  id: string;
  title: string;
  html: string;
};

/**
 * Major section titles that always start a new accordion part.
 * Prevents 30+ tiny panels on deep-dive lessons full of # headings.
 */
function isMajorTitle(title: string): boolean {
  const t = title.trim();
  return (
    /^(lesson\s+\d+)\b/i.test(t) ||
    /^(chapter\s+\d+)\b/i.test(t) ||
    /^(learning objectives|what you will learn|goals)\b/i.test(t) ||
    /^(hands-?on(\s+lab)?|lab\b)/i.test(t) ||
    /^(interview)\b/i.test(t) ||
    /^(your learning plan|roadmap|next steps?|summary|recap)\b/i.test(t) ||
    /^(key takeaways?|official|references?|accuracy)\b/i.test(t) ||
    /^(architecture so far|complete aws architecture)\b/i.test(t) ||
    /^(content review)\b/i.test(t)
  );
}

/**
 * Split lesson HTML into accordion parts on each <h2>.
 * When there are many h2s, only major chapter-like titles start a new part;
 * intermediate h2s stay inside the previous panel (as subheads in the HTML).
 */
export function splitLessonHtml(html: string): LessonPart[] {
  const trimmed = html.trim();
  if (!trimmed) return [];

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

  const headings = matches.map((match, i) => ({
    match,
    index: i,
    title: stripTags(match[1]).trim() || `Part ${i + 1}`,
    start: (match.index ?? 0) + match[0].length,
    headingStart: match.index ?? 0,
    end:
      i + 1 < matches.length
        ? (matches[i + 1].index ?? trimmed.length)
        : trimmed.length,
  }));

  const majorCount = headings.filter((h) => isMajorTitle(h.title)).length;
  // Deep-dive lessons: many h2s but only a few real chapters
  const useMajorOnly = headings.length > 12 && majorCount >= 2;

  const splitPoints = useMajorOnly
    ? headings.filter((h, i) => i === 0 || isMajorTitle(h.title))
    : headings;

  // Ensure we always have at least the first heading as a split
  if (!splitPoints.length) {
    return [
      {
        id: "content",
        title: "Lesson content",
        html: trimmed,
      },
    ];
  }

  const parts: LessonPart[] = [];

  splitPoints.forEach((sp, i) => {
    const next = splitPoints[i + 1];
    // Include this heading's own <h2> only when major-only mode and not first?
    // Body starts after this h2; content until next major heading start (includes nested h2s)
    const bodyEnd = next ? next.headingStart : trimmed.length;
    let body = trimmed.slice(sp.start, bodyEnd).trim();

    // In major-only mode, demote leftover h2 in body to h3 for visual hierarchy
    if (useMajorOnly) {
      body = body
        .replace(/<h2\b/gi, "<h3")
        .replace(/<\/h2>/gi, "</h3>");
    }

    parts.push({
      id: `part-${i + 1}`,
      title: sp.title,
      html: body || "<p><em>No content in this section.</em></p>",
    });
  });

  // Orphan content before first h2 (rare): prepend to first part
  const firstH2 = headings[0].headingStart;
  if (firstH2 > 0) {
    const orphan = trimmed.slice(0, firstH2).trim();
    if (orphan && parts[0]) {
      parts[0].html = `${orphan}\n${parts[0].html}`;
    }
  }

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
