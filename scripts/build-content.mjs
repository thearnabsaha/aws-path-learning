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
        out.push(
          `<div class="code-block" data-copyable="true"><div class="code-label"><span>${label}</span><button type="button" class="code-copy-btn" data-copy-code>Copy</button></div><pre><code>${code}</code></pre></div>`
        );
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
      const headingText = hm[2];
      out.push(`<h${tag}>${mdInline(headingText)}</h${tag}>`);
      // Hands-on labs: inject cost-safety callout + workshop links
      if (/hands-?on\s+lab|lab\s*:/i.test(headingText)) {
        out.push(costSafetyCallout());
      }
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

function costSafetyCallout() {
  return [
    `<aside class="cost-safety callout warn" role="note">`,
    `<p class="callout-title">Cost safety</p>`,
    `<ul>`,
    `<li>Prefer <strong>Free Tier</strong> / small instance sizes while learning.</li>`,
    `<li>Create a <strong>billing alarm</strong> (CloudWatch or Budgets) on day one.</li>`,
    `<li><strong>Tear down</strong> lab resources when finished (instances, load balancers, NAT gateways).</li>`,
    `<li>Never put long-lived access keys in code or public repos.</li>`,
    `</ul>`,
    `<p class="workshop-links"><strong>Official practice:</strong> `,
    `<a href="https://explore.skillbuilder.aws/" rel="noopener noreferrer" target="_blank">AWS Skill Builder</a>`,
    ` · `,
    `<a href="https://wellarchitectedlabs.com/" rel="noopener noreferrer" target="_blank">Well-Architected Labs</a>`,
    ` · `,
    `<a href="https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier.html" rel="noopener noreferrer" target="_blank">Free Tier docs</a>`,
    `</p>`,
    `</aside>`,
  ].join("");
}

/** Extract accordion parts (h2 titles) for search + section progress */
function extractParts(html) {
  const re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi;
  const parts = [];
  let m;
  let i = 0;
  while ((m = re.exec(html))) {
    i += 1;
    const title = m[1]
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#0*39;/g, "'")
      .replace(/&#x0*27;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
    parts.push({ id: `part-${i}`, title: title || `Part ${i}` });
  }
  return parts;
}

/** Convert lab-looking ordered/unordered lists under Hands-on into checklist markup */
function enhanceLabLists(html) {
  // Mark sections whose h2 contains Lab — wrap following list items
  return html.replace(
    /(<h2\b[^>]*>[\s\S]*?(?:Hands-?on\s+Lab|Lab)[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2\b|$)/gi,
    (full, heading, body) => {
      let n = 0;
      const enhanced = body.replace(/<li>([\s\S]*?)<\/li>/gi, (_, inner) => {
        n += 1;
        const id = `lab-step-${n}`;
        return `<li class="lab-step" data-lab-id="${id}"><span class="lab-step-text">${inner}</span></li>`;
      });
      return `${heading}<div class="lab-block" data-lab-block="true">${enhanced}</div>`;
    }
  );
}

fs.mkdirSync(lessonsOut, { recursive: true });

const index = [];

for (const lesson of meta) {
  const mdPath = path.join(mdDir, lesson.source);
  if (!fs.existsSync(mdPath)) {
    throw new Error(`Missing markdown: ${mdPath}`);
  }
  const md = fs.readFileSync(mdPath, "utf8");

  let html =
    mdToHtml(md) + "\n" + accuracyNote(lesson.reviewed, lesson.sources);
  html = enhanceLabLists(html);

  const parts = extractParts(html);
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
    comingSoon: !!lesson.comingSoon,
    parts,
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
    comingSoon: !!lesson.comingSoon,
    parts,
  });
}

fs.writeFileSync(
  path.join(outDir, "index.json"),
  JSON.stringify(index, null, 2) + "\n"
);

console.log(
  `build-content: ${index.length} lessons → src/data/generated/ (${index.reduce((n, l) => n + (quizzes[l.id]?.length || 0), 0)} quiz questions, ${index.reduce((n, l) => n + (l.parts?.length || 0), 0)} sections)`
);
