import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { JsonLd } from "@/components/JsonLd";
import { LessonView } from "@/components/LessonView";
import {
  getAdjacentSummaries,
  getAllLessonIds,
  getLessonSummary,
  loadLesson,
} from "@/data/lessons";

type Props = { params: Promise<{ id: string }> };

const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://aws-path-learning.vercel.app";

export function generateStaticParams() {
  return getAllLessonIds().map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLessonSummary(id);
  if (!lesson) return { title: "Lesson not found" };
  const title = `${lesson.number} ${lesson.title}`;
  const url = `${site}/lesson/${lesson.id}`;
  return {
    title,
    description: lesson.short,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · AWS Path`,
      description: lesson.short,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · AWS Path`,
      description: lesson.short,
    },
  };
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const lesson = await loadLesson(id);
  if (!lesson) notFound();

  const { prev, next } = getAdjacentSummaries(id);

  const learningLd = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: lesson.title,
    description: lesson.short,
    learningResourceType: "Lesson",
    timeRequired: `PT${lesson.minutes}M`,
    url: `${site}/lesson/${lesson.id}`,
    isPartOf: {
      "@type": "Course",
      name: "AWS Path",
      url: site,
    },
    dateModified: lesson.reviewed ? `${lesson.reviewed}-01` : undefined,
  };

  return (
    <AppShell activeLessonId={lesson.id}>
      <JsonLd data={learningLd} />
      <LessonView lesson={lesson} prev={prev} next={next} />
    </AppShell>
  );
}
