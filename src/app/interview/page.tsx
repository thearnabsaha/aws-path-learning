import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { InterviewDrill } from "@/components/InterviewDrill";

export const metadata: Metadata = {
  title: "Interview path",
  description:
    "Scenario-style AWS quiz drills and open interview practice prompts.",
};

export default function InterviewPage() {
  return (
    <AppShell>
      <InterviewDrill />
    </AppShell>
  );
}
