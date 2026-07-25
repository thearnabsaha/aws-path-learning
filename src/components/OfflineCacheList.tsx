"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { lessonSummaries } from "@/data/lessons";

type CacheEntry = { id: string; title: string; number: string; url: string };

export function OfflineCacheList() {
  const [online, setOnline] = useState(true);
  const [cached, setCached] = useState<CacheEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function scan() {
      if (!("caches" in window)) {
        setReady(true);
        return;
      }
      try {
        const names = await caches.keys();
        const urls = new Set<string>();
        for (const name of names) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          for (const req of keys) {
            try {
              const u = new URL(req.url);
              if (u.origin === window.location.origin) {
                urls.add(u.pathname);
              }
            } catch {
              /* ignore */
            }
          }
        }
        const hits: CacheEntry[] = [];
        for (const l of lessonSummaries) {
          const path = `/lesson/${l.id}`;
          if (
            urls.has(path) ||
            [...urls].some((u) => u.startsWith(path))
          ) {
            hits.push({
              id: l.id,
              title: l.title,
              number: l.number,
              url: path,
            });
          }
        }
        if (!cancelled) setCached(hits);
      } catch {
        if (!cancelled) setCached([]);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void scan();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="offline-cache">
      <p className="offline-status" role="status">
        Network: <strong>{online ? "online" : "offline"}</strong>
      </p>
      <h2>Cached lessons</h2>
      {!ready && <p className="offline-hint">Checking cache…</p>}
      {ready && cached.length === 0 && (
        <p className="offline-hint">
          No lesson pages detected in the cache yet. Open lessons while online
          so they can be stored for offline use.
        </p>
      )}
      {cached.length > 0 && (
        <ul className="offline-lesson-list">
          {cached.map((l) => (
            <li key={l.id}>
              <Link href={l.url}>
                <span className="offline-num">{l.number}</span>
                {l.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
