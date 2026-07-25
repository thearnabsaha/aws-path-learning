export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
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
};

export type Lesson = LessonSummary & {
  content: string;
  quiz: QuizQuestion[];
  sources?: string[];
};

export type ProgressState = {
  completed: Record<string, number>;
  quizScores: Record<string, { score: number; total: number; at: number }>;
};
