export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
  /** Optional topic tag for weak-area reporting */
  topic?: string;
};

export type LessonSummary = {
  id: string;
  number: string;
  section: string;
  title: string;
  short: string;
  minutes: number;
  tags: string[];
  goals: string[];
  reviewed?: string;
  /** Section titles from content (for search / progress) */
  parts?: { id: string; title: string }[];
};

export type Lesson = LessonSummary & {
  content: string;
  quiz: QuizQuestion[];
  sources?: string[];
};

export type ReviewItem = {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
  topic: string;
  timesWrong: number;
  wrongAt: number;
  dueAt: number;
};

export type ProgressState = {
  /** lessonId → completed timestamp */
  completed: Record<string, number>;
  quizScores: Record<
    string,
    { score: number; total: number; at: number; weakTopics?: string[] }
  >;
  /** lessonId → sectionId → viewed timestamp */
  sections: Record<string, Record<string, number>>;
  /** lessonId → labItemId → checked */
  labs: Record<string, Record<string, boolean>>;
  /** last opened section per lesson (for resume) */
  lastSection: Record<string, string>;
  /** Spaced-repetition queue for missed quiz items */
  reviewQueue: ReviewItem[];
};

export type SearchHit = {
  lessonId: string;
  number: string;
  title: string;
  kind: "lesson" | "section" | "tag" | "goal";
  label: string;
  href: string;
};
