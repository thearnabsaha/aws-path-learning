"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

/**
 * Privacy-friendly page analytics (Vercel).
 * No cookies for basic pageviews; no lesson body content sent.
 */
export function Analytics() {
  // Disable in development noise; enable in production / preview
  if (process.env.NODE_ENV === "development") return null;
  return <VercelAnalytics />;
}
