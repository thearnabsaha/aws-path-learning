import type { LessonSummary, SearchHit } from "@/types/lesson";

function norm(s: string) {
  return s.toLowerCase().normalize("NFKD");
}

export function buildSearchHits(lessons: LessonSummary[]): SearchHit[] {
  const hits: SearchHit[] = [];
  for (const l of lessons) {
    hits.push({
      lessonId: l.id,
      number: l.number,
      title: l.title,
      kind: "lesson",
      label: l.title,
      href: `/lesson/${l.id}`,
    });
    for (const t of l.tags) {
      hits.push({
        lessonId: l.id,
        number: l.number,
        title: l.title,
        kind: "tag",
        label: t,
        href: `/lesson/${l.id}`,
      });
    }
    for (const g of l.goals.slice(0, 6)) {
      hits.push({
        lessonId: l.id,
        number: l.number,
        title: l.title,
        kind: "goal",
        label: g,
        href: `/lesson/${l.id}`,
      });
    }
    for (const p of l.parts || []) {
      hits.push({
        lessonId: l.id,
        number: l.number,
        title: l.title,
        kind: "section",
        label: p.title,
        href: `/lesson/${l.id}?section=${encodeURIComponent(p.id)}`,
      });
    }
  }
  return hits;
}

export function searchHits(
  hits: SearchHit[],
  query: string,
  limit = 12
): SearchHit[] {
  const q = norm(query.trim());
  if (!q || q.length < 2) return [];

  const tokens = q.split(/\s+/).filter(Boolean);
  const scored: { hit: SearchHit; score: number }[] = [];

  for (const hit of hits) {
    const hay = norm(
      `${hit.number} ${hit.title} ${hit.label} ${hit.kind} ${hit.lessonId}`
    );
    if (!tokens.every((t) => hay.includes(t))) continue;

    let score = 0;
    if (norm(hit.label).startsWith(q)) score += 40;
    if (norm(hit.title).includes(q)) score += 25;
    if (norm(hit.label).includes(q)) score += 20;
    if (hit.kind === "lesson") score += 15;
    if (hit.kind === "section") score += 10;
    if (hit.kind === "tag") score += 5;
    score += Math.max(0, 10 - hit.label.length / 20);
    scored.push({ hit, score });
  }

  scored.sort((a, b) => b.score - a.score);

  // Dedupe by href+label
  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const { hit } of scored) {
    const key = `${hit.href}|${hit.kind}|${hit.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(hit);
    if (out.length >= limit) break;
  }
  return out;
}
