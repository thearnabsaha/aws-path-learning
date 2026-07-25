export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  explain: string;
};

export type Lesson = {
  id: string;
  number: string;
  section: string;
  title: string;
  short: string;
  minutes: number;
  tags: string[];
  goals: string[];
  content: string;
  quiz: QuizQuestion[];
};

export type ProgressState = {
  completed: Record<string, number>;
  quizScores: Record<string, { score: number; total: number; at: number }>;
};
