import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { ReviewPractice } from "@/components/ReviewPractice";

export const metadata: Metadata = {
  title: "Spaced review",
  description: "Practice missed quiz questions with spaced repetition.",
};

export default function ReviewPage() {
  return (
    <AppShell>
      <div className="review-page">
        <ReviewPractice />
      </div>
    </AppShell>
  );
}
