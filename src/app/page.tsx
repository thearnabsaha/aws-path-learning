import { AppShell } from "@/components/AppShell";
import { HomeView } from "@/components/HomeView";
import { JsonLd } from "@/components/JsonLd";
import { lessonSummaries } from "@/data/lessons";

const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://aws-path-learning.vercel.app";

export default function HomePage() {
  const courseLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "AWS Path",
    description:
      "Mobile-friendly AWS learning path covering IAM through infrastructure as code, with quizzes and local progress tracking.",
    provider: {
      "@type": "Organization",
      name: "AWS Path",
      url: site,
    },
    numberOfCredits: lessonSummaries.length,
    educationalLevel: "Beginner to intermediate",
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${lessonSummaries.reduce((n, l) => n + l.minutes, 0)}M`,
    },
    url: site,
  };

  return (
    <AppShell>
      <JsonLd data={courseLd} />
      <HomeView lessons={lessonSummaries} />
    </AppShell>
  );
}
