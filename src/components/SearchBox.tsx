"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { lessonSummaries } from "@/data/lessons";
import { buildSearchHits, searchHits } from "@/lib/search";

export function SearchBox({ compact = false }: { compact?: boolean }) {
  const listId = useId();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allHits = useMemo(() => buildSearchHits(lessonSummaries), []);
  const results = useMemo(() => searchHits(allHits, q, 10), [allHits, q]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function onKeyDown(e: React.KeyboardEvent) {
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) {
        window.location.href = hit.href;
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  return (
    <div
      className={`search-box${compact ? " compact" : ""}${open && results.length ? " open" : ""}`}
      ref={rootRef}
    >
      <label className="sr-only" htmlFor={`${listId}-input`}>
        Search lessons
      </label>
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        className="search-input"
        placeholder={compact ? "Search…" : "Search lessons & sections…"}
        value={q}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-controls={`${listId}-list`}
        aria-expanded={open && q.trim().length >= 2}
        aria-haspopup="listbox"
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <kbd className="search-kbd desktop-only" aria-hidden="true">
        ⌘K
      </kbd>
      {open && q.trim().length >= 2 && (
        <ul
          id={`${listId}-list`}
          className="search-results"
          role="listbox"
          aria-label="Search results"
        >
          {results.length === 0 && (
            <li className="search-empty">No matches for “{q.trim()}”</li>
          )}
          {results.map((hit, i) => (
            <li key={`${hit.href}-${hit.kind}-${hit.label}`} role="option" aria-selected={i === active}>
              <Link
                href={hit.href}
                className={`search-hit${i === active ? " active" : ""}`}
                onClick={() => setOpen(false)}
                onMouseEnter={() => setActive(i)}
              >
                <span className="search-hit-kind">{hit.kind}</span>
                <span className="search-hit-label">{hit.label}</span>
                <span className="search-hit-meta">
                  {hit.number} · {hit.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
