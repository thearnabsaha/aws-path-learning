import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LessonView } from "@/components/LessonView";
import { getAdjacent, getLesson, lessons } from "@/data/lessons";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) return { title: "Lesson not found" };
  return {
    title: `${lesson.number} ${lesson.title}`,
    description: lesson.short,
  };
}

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();

  const { prev, next } = getAdjacent(id);

  return (
    <AppShell activeLessonId={lesson.id}>
      <LessonView lesson={lesson} prev={prev} next={next} />
    </AppShell>
  );
}
