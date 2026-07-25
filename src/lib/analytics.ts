/**
 * Privacy-friendly analytics helpers.
 * - Vercel Analytics (pageviews) when @vercel/analytics is mounted
 * - Optional custom events via window.va / gtag no-op fallback
 * Never sends lesson content or PII.
 */

export type AnalyticsEvent =
  | "lesson_open"
  | "quiz_complete"
  | "section_open"
  | "path_change"
  | "lesson_complete"
  | "pwa_install_accepted"
  | "pwa_install_dismissed";

type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    va?: (event: "event", name: string, data?: EventProps) => void;
  }
}

export function trackEvent(name: AnalyticsEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;
  try {
    // Vercel Web Analytics custom events
    if (typeof window.va === "function") {
      window.va("event", name, props);
    }
    // Optional Plausible if user injects script later
    const plausible = (
      window as unknown as { plausible?: (n: string, o?: { props?: EventProps }) => void }
    ).plausible;
    if (typeof plausible === "function") {
      plausible(name, props ? { props } : undefined);
    }
  } catch {
    // analytics must never break the app
  }
}
