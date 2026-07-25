"use client";

import { useRef, useState } from "react";
import { useProgress } from "@/context/ProgressContext";

export function ProgressTools() {
  const { exportJson, importJson, reset, reviewQueue } = useProgress();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function download() {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aws-path-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg("Progress exported.");
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const text = await file.text();
      const res = importJson(text);
      setMsg(res.ok ? "Progress imported." : `Import failed: ${res.error}`);
    } catch {
      setMsg("Import failed: could not read file.");
    }
  }

  return (
    <div className="progress-tools">
      <h3>Progress backup</h3>
      <p className="progress-tools-hint">
        Export JSON before clearing browser data. Import to restore on another
        device.
        {reviewQueue.length > 0 && (
          <> · {reviewQueue.length} items in review queue.</>
        )}
      </p>
      <div className="progress-tools-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={download}>
          Export progress
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => fileRef.current?.click()}
        >
          Import progress
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (confirm("Reset all progress, labs, and review queue?")) {
              reset();
              setMsg("Progress reset.");
            }
          }}
        >
          Reset all
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {msg && (
        <p className="progress-tools-msg" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}
