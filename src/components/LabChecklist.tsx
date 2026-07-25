"use client";

import { useEffect } from "react";
import { useProgress } from "@/context/ProgressContext";

/**
 * Hydrates lab steps in rendered HTML with interactive checkboxes
 * bound to local progress.
 */
export function LabChecklist({ lessonId }: { lessonId: string }) {
  const { isLabChecked, setLabItem } = useProgress();

  useEffect(() => {
    const root = document.querySelector(".lesson");
    if (!root) return;

    const steps = root.querySelectorAll<HTMLElement>(".lab-step[data-lab-id]");
    const cleanups: Array<() => void> = [];

    steps.forEach((li) => {
      const id = li.getAttribute("data-lab-id");
      if (!id) return;
      if (li.querySelector(".lab-check")) return;

      const label = document.createElement("label");
      label.className = "lab-check";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = isLabChecked(lessonId, id);
      input.setAttribute("aria-label", "Mark lab step complete");

      const onChange = () => setLabItem(lessonId, id, input.checked);
      input.addEventListener("change", onChange);
      cleanups.push(() => input.removeEventListener("change", onChange));

      label.appendChild(input);
      li.insertBefore(label, li.firstChild);
      if (input.checked) li.classList.add("checked");

      const syncClass = () => {
        li.classList.toggle("checked", input.checked);
      };
      input.addEventListener("change", syncClass);
      cleanups.push(() => input.removeEventListener("change", syncClass));
    });

    return () => {
      cleanups.forEach((fn) => fn());
      // leave DOM; remount will re-bind. Remove injected labels to avoid dupes.
      root.querySelectorAll(".lab-check").forEach((el) => el.remove());
    };
    // isLabChecked/setLabItem change identity; re-run when lesson changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Sync checkbox state when progress changes externally
  useEffect(() => {
    const root = document.querySelector(".lesson");
    if (!root) return;
    root.querySelectorAll<HTMLElement>(".lab-step[data-lab-id]").forEach((li) => {
      const id = li.getAttribute("data-lab-id");
      if (!id) return;
      const input = li.querySelector<HTMLInputElement>(".lab-check input");
      if (!input) return;
      const checked = isLabChecked(lessonId, id);
      input.checked = checked;
      li.classList.toggle("checked", checked);
    });
  }, [lessonId, isLabChecked]);

  return null;
}
