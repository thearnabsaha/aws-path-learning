import type { Metadata } from "next";
import Link from "next/link";
import { OfflineCacheList } from "@/components/OfflineCacheList";

export const metadata: Metadata = {
  title: "Offline",
  description: "AWS Path offline fallback and cached lessons list.",
};

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="offline-card">
        <p className="eyebrow">AWS Path · PWA</p>
        <h1>You are offline</h1>
        <p>
          This page is the offline fallback. Lessons you already opened while
          online may still open from the service worker cache.
        </p>
        <div className="hero-actions" style={{ marginBottom: "1rem" }}>
          <Link className="btn btn-primary" href="/">
            Try home
          </Link>
        </div>
        <OfflineCacheList />
      </div>
    </div>
  );
}
