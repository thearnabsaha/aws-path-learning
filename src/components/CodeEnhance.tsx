"use client";

import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";

const LANG_MAP: Record<string, string> = {
  bash: "bash",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  text: "text",
  plain: "text",
  txt: "text",
  json: "json",
  js: "javascript",
  javascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  yaml: "yaml",
  yml: "yaml",
  hcl: "hcl",
  terraform: "hcl",
  tf: "hcl",
  py: "python",
  python: "python",
  sql: "sql",
  dockerfile: "docker",
  docker: "docker",
};

function normalizeLang(raw: string): string {
  const key = raw.trim().toLowerCase().split(/\s+/)[0] || "text";
  return LANG_MAP[key] || (key.length <= 12 ? key : "text");
}

/**
 * Syntax-highlights lesson code blocks with Shiki (client-side)
 * and keeps Copy working via data-code on each block.
 */
export function CodeEnhance({ rootSelector = ".lesson" }: { rootSelector?: string }) {
  const { theme } = useTheme();

  useEffect(() => {
    const rootEl = document.querySelector(rootSelector);
    if (!rootEl) return;
    const root = rootEl;

    let cancelled = false;

    async function run() {
      const blocks = root.querySelectorAll<HTMLElement>(".code-block[data-copyable]");
      if (!blocks.length) {
        // Also wrap bare pre>code if any
        root.querySelectorAll("pre > code").forEach((code) => {
          const pre = code.parentElement;
          if (!pre || pre.closest(".code-block")) return;
          const wrap = document.createElement("div");
          wrap.className = "code-block";
          wrap.dataset.copyable = "true";
          pre.parentNode?.insertBefore(wrap, pre);
          const label = document.createElement("div");
          label.className = "code-label";
          label.innerHTML =
            '<span>text</span><button type="button" class="code-copy-btn" data-copy-code>Copy</button>';
          wrap.appendChild(label);
          wrap.appendChild(pre);
        });
      }

      const targets = root.querySelectorAll<HTMLElement>(".code-block[data-copyable]");
      if (!targets.length) return;

      // Store raw text before highlighting
      targets.forEach((block) => {
        const codeEl = block.querySelector("code");
        if (codeEl && !block.dataset.raw) {
          block.dataset.raw = codeEl.textContent || "";
        }
      });

      try {
        const { createHighlighter } = await import("shiki");
        if (cancelled) return;

        const highlighter = await createHighlighter({
          themes: ["min-dark", "min-light"],
          langs: [
            "bash",
            "json",
            "javascript",
            "typescript",
            "yaml",
            "hcl",
            "python",
            "sql",
            "docker",
            "text",
          ],
        });

        if (cancelled) {
          highlighter.dispose();
          return;
        }

        const shikiTheme = theme === "dark" ? "min-dark" : "min-light";

        for (const block of Array.from(targets)) {
          if (cancelled) break;
          const raw = block.dataset.raw || "";
          const labelSpan = block.querySelector(".code-label span");
          const langLabel = labelSpan?.textContent || "text";
          let lang = normalizeLang(langLabel);

          // Fallback if language not loaded
          const loaded = highlighter.getLoadedLanguages();
          if (!loaded.includes(lang as never)) lang = "text";

          try {
            const html = highlighter.codeToHtml(raw, {
              lang,
              theme: shikiTheme,
            });
            const pre = block.querySelector("pre");
            if (pre) {
              // Replace pre with shiki output but keep structure for copy
              const tmp = document.createElement("div");
              tmp.innerHTML = html;
              const shikiPre = tmp.querySelector("pre");
              if (shikiPre) {
                shikiPre.classList.add("shiki-pre");
                pre.replaceWith(shikiPre);
              }
            }
            // Ensure copy button exists
            let label = block.querySelector(".code-label");
            if (!label) {
              label = document.createElement("div");
              label.className = "code-label";
              block.insertBefore(label, block.firstChild);
            }
            if (!label.querySelector("[data-copy-code]")) {
              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "code-copy-btn";
              btn.setAttribute("data-copy-code", "");
              btn.textContent = "Copy";
              label.appendChild(btn);
            }
            if (!label.querySelector("span")) {
              const s = document.createElement("span");
              s.textContent = langLabel;
              label.insertBefore(s, label.firstChild);
            }
          } catch {
            // leave plain code
          }
        }

        highlighter.dispose();
      } catch {
        // Shiki optional — plain code still works
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [rootSelector, theme]);

  // Copy via event delegation (uses data-raw when available)
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    async function onClick(e: Event) {
      const t = e.target as HTMLElement | null;
      const btn = t?.closest?.("[data-copy-code]") as HTMLButtonElement | null;
      if (!btn) return;
      e.preventDefault();
      const block = btn.closest(".code-block") as HTMLElement | null;
      const code =
        block?.dataset.raw ||
        block?.querySelector("code")?.textContent ||
        "";
      try {
        await navigator.clipboard.writeText(code);
        const prev = btn.textContent;
        btn.textContent = "Copied";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = prev || "Copy";
          btn.classList.remove("copied");
        }, 1400);
      } catch {
        btn.textContent = "Failed";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 1400);
      }
    }

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [rootSelector]);

  return null;
}
