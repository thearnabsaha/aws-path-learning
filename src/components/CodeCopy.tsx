"use client";

import { useEffect } from "react";

/** Event delegation: copy buttons on generated code blocks */
export function CodeCopyRoot({ rootSelector = ".lesson" }: { rootSelector?: string }) {
  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    async function onClick(e: Event) {
      const t = e.target as HTMLElement | null;
      const btn = t?.closest?.("[data-copy-code]") as HTMLButtonElement | null;
      if (!btn) return;
      e.preventDefault();
      const block = btn.closest(".code-block") || btn.closest("pre")?.parentElement;
      const code = block?.querySelector("code")?.textContent || "";
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
