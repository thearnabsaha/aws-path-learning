"use client";

import { useEffect } from "react";
import { getAllLessonIds } from "@/data/lessons";

/**
 * Registers the service worker (production) and precaches lesson routes
 * after the first visit so offline navigation improves over time.
 */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        // Warm lesson document routes into Cache Storage (best-effort).
        // Workbox also runtime-caches navigations when configured.
        if (reg.active || navigator.serviceWorker.controller) {
          void precacheLessons();
        } else {
          navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => {
              void precacheLessons();
            },
            { once: true }
          );
        }
      } catch {
        // SW optional
      }
    };

    void register();
  }, []);

  return null;
}

async function precacheLessons() {
  if (!("caches" in window)) return;
  try {
    const cache = await caches.open("aws-path-lessons-v1");
    const ids = getAllLessonIds();
    // Stagger lightly to avoid hammering; only fill missing
    for (const id of ids) {
      const url = `/lesson/${id}`;
      const hit = await cache.match(url);
      if (hit) continue;
      try {
        await cache.add(url);
      } catch {
        // offline or network error — stop early
        break;
      }
    }
    // Always keep home + offline
    await cache.addAll(["/", "/offline"].filter(Boolean)).catch(() => undefined);
  } catch {
    /* ignore */
  }
}
