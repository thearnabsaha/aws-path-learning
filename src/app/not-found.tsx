import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function NotFound() {
  return (
    <AppShell>
      <div className="empty">
        <h1>Page not found</h1>
        <p>That lesson or route is not in the curriculum.</p>
        <p style={{ marginTop: "1.25rem" }}>
          <Link className="btn btn-primary" href="/">
            Back to home
          </Link>
        </p>
      </div>
    </AppShell>
  );
}
