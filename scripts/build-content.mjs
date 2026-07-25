/**
 * Content pipeline: markdown + meta + quizzes → generated JSON
 * Run via predev / prebuild.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const mdDir = path.join(root, "content", "from-chatgpt");
const outDir = path.join(root, "src", "data", "generated");
const lessonsOut = path.join(outDir, "lessons");

const meta = JSON.parse(
  fs.readFileSync(path.join(__dirname, "lessons-meta.json"), "utf8")
);
const quizzes = JSON.parse(
  fs.readFileSync(path.join(__dirname, "quizzes.json"), "utf8")
);

function escapeHtmlText(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mdInline(s) {
  let t = escapeHtmlText(s);
  t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  t = t.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>");
  return t;
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let i = 0;
  let inCode = false;
  let codeLang = "";
  let codeBuf = [];
  let inUl = false;
  let inOl = false;
  let tableRows = [];
  let para = [];

  const closeLists = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      out.push("</ol>");
      inOl = false;
    }
  };

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${mdInline(para.join(" "))}</p>`);
      para = [];
    }
  };

  const flushTable = () => {
    if (!tableRows.length) return;
    out.push('<div class="table-wrap"><table>');
    let written = 0;
    for (const row of tableRows) {
      const cells = row
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim());
      if (cells.every((c) => /^:?-+:?$/.test(c.replace(/\s/g, "")))) continue;
      if (written === 0) {
        out.push(
          "<thead><tr>" +
            cells.map((c) => `<th>${mdInline(c)}</th>`).join("") +
            "</tr></thead><tbody>"
        );
      } else {
        out.push(
          "<tr>" + cells.map((c) => `<td>${mdInline(c)}</td>`).join("") + "</tr>"
        );
      }
      written += 1;
    }
    out.push("</tbody></table></div>");
    tableRows = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      flushPara();
      closeLists();
      flushTable();
      if (!inCode) {
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeBuf = [];
      } else {
        const code = escapeHtmlText(codeBuf.join("\n"));
        const label = escapeHtmlText(codeLang || "text");
        out.push(`<div class="code-label"><span>${label}</span></div>`);
        out.push(`<pre><code>${code}</code></pre>`);
        inCode = false;
      }
      i += 1;
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      i += 1;
      continue;
    }

    if (line.trim() === "---") {
      flushPara();
      closeLists();
      flushTable();
      out.push('<hr class="divider" />');
      i += 1;
      continue;
    }

    if (line.includes("|") && line.trim().startsWith("|")) {
      flushPara();
      closeLists();
      tableRows.push(line);
      i += 1;
      continue;
    }
    if (tableRows.length) flushTable();

    const hm = /^(#{1,4})\s+(.*)$/.exec(line);
    if (hm) {
      flushPara();
      closeLists();
      flushTable();
      const level = hm[1].length;
      const tag = level <= 2 ? 2 : level === 3 ? 3 : 4;
      out.push(`<h${tag}>${mdInline(hm[2])}</h${tag}>`);
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      flushPara();
      closeLists();
      flushTable();
      const q = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        q.push(lines[i].replace(/^>\s?/, "").trimEnd());
        i += 1;
      }
      out.push(
        `<blockquote class="callout tip"><p>${mdInline(q.join(" "))}</p></blockquote>`
      );
      continue;
    }

    const um = /^[-*]\s+(.*)$/.exec(line);
    const om = /^\d+\.\s+(.*)$/.exec(line);
    if (um) {
      flushPara();
      flushTable();
      if (inOl) {
        out.push("</ol>");
        inOl = false;
      }
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${mdInline(um[1])}</li>`);
      i += 1;
      continue;
    }
    if (om) {
      flushPara();
      flushTable();
      if (inUl) {
        out.push("</ul>");
        inUl = false;
      }
      if (!inOl) {
        out.push("<ol>");
        inOl = true;
      }
      out.push(`<li>${mdInline(om[1])}</li>`);
      i += 1;
      continue;
    }

    if (line.trim() === "") {
      flushPara();
      closeLists();
      flushTable();
      i += 1;
      continue;
    }

    para.push(line.trim());
    i += 1;
  }

  flushPara();
  closeLists();
  flushTable();
  if (inCode) {
    out.push(`<pre><code>${escapeHtmlText(codeBuf.join("\n"))}</code></pre>`);
  }
  return out.join("\n");
}

function accuracyNote(reviewed, sources) {
  const links = (sources || [])
    .filter((s) => s.startsWith("http"))
    .map(
      (s) =>
        `<li><a href="${escapeHtmlText(s)}" rel="noopener noreferrer" target="_blank">${escapeHtmlText(s.replace(/^https?:\/\//, "").slice(0, 60))}…</a></li>`
    )
    .join("");
  return [
    `<aside class="accuracy-note" role="note">`,
    `<p><strong>Content review:</strong> ${escapeHtmlText(reviewed || "n/a")}. Curriculum text is adapted from a shared learning roadmap; verify critical details in official AWS docs before production use.</p>`,
    links
      ? `<p class="accuracy-note-label">References</p><ul>${links}</ul>`
      : "",
    `</aside>`,
  ].join("");
}

fs.mkdirSync(lessonsOut, { recursive: true });

const index = [];

for (const lesson of meta) {
  const mdPath = path.join(mdDir, lesson.source);
  if (!fs.existsSync(mdPath)) {
    throw new Error(`Missing markdown: ${mdPath}`);
  }
  let md = fs.readFileSync(mdPath, "utf8");

  // Accuracy: strip in-body mini-quiz blocks that conflict with site quizzes (optional cleanup for L1 plan already fixed in md)
  const html =
    mdToHtml(md) +
    "\n" +
    accuracyNote(lesson.reviewed, lesson.sources);

  const quiz = quizzes[lesson.id] || [];
  const full = {
    id: lesson.id,
    number: lesson.number,
    section: lesson.section,
    title: lesson.title,
    short: lesson.short,
    minutes: lesson.minutes,
    tags: lesson.tags,
    goals: lesson.goals,
    reviewed: lesson.reviewed,
    sources: lesson.sources,
    content: html,
    quiz,
  };

  fs.writeFileSync(
    path.join(lessonsOut, `${lesson.id}.json`),
    JSON.stringify(full, null, 2) + "\n"
  );

  index.push({
    id: lesson.id,
    number: lesson.number,
    section: lesson.section,
    title: lesson.title,
    short: lesson.short,
    minutes: lesson.minutes,
    tags: lesson.tags,
    goals: lesson.goals,
    reviewed: lesson.reviewed,
  });
}

fs.writeFileSync(
  path.join(outDir, "index.json"),
  JSON.stringify(index, null, 2) + "\n"
);

console.log(
  `build-content: ${index.length} lessons → src/data/generated/ (${index.reduce((n, l) => n + (quizzes[l.id]?.length || 0), 0)} quiz questions)`
);
