import type { MetadataRoute } from "next";
import { lessonSummaries } from "@/data/lessons";

const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://aws-path-learning.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const lessons = lessonSummaries.map((l) => ({
    url: `${site}/lesson/${l.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: site,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${site}/review`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    },
    {
      url: `${site}/interview`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    ...lessons,
  ];
}
