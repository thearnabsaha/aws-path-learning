import Link from "next/link";

export const metadata = {
  title: "Offline",
};

export default function OfflinePage() {
  return (
    <div className="offline-page">
      <div className="offline-card">
        <p className="eyebrow">AWS Path · PWA</p>
        <h1>You are offline</h1>
        <p>
          This page is not in the cache yet. Reconnect and open AWS Path again —
          visited lessons will work offline after you load them once.
        </p>
        <Link className="btn btn-primary" href="/">
          Try home
        </Link>
      </div>
    </div>
  );
}
