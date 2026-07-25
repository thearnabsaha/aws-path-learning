import type { QuizQuestion, ReviewItem } from "@/types/lesson";

/** Seeded mulberry32 PRNG */
export function mulberry32(seed: number) {
  let t = seed >>> 0;
  return function next() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type ShuffledQuestion = QuizQuestion & {
  /** original option index map: shuffled[i] → originalIndex */
  map: number[];
  originalAnswer: number;
};

/** Shuffle options deterministically; keeps correct answer mapped. */
export function shuffleQuestion(
  q: QuizQuestion,
  seed: number
): ShuffledQuestion {
  const rand = mulberry32(seed);
  const indices = q.options.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const options = indices.map((i) => q.options[i]);
  const answer = indices.indexOf(q.answer);
  return {
    ...q,
    options,
    answer: answer < 0 ? 0 : answer,
    originalAnswer: q.answer,
    map: indices,
  };
}

const TOPIC_RULES: { re: RegExp; topic: string }[] = [
  { re: /\b(root user|mfa|multi-factor)\b/i, topic: "Root & MFA" },
  { re: /\b(iam role|assume role|instance profile)\b/i, topic: "IAM roles" },
  { re: /\b(policy|policies|allow|deny|json)\b/i, topic: "IAM policies" },
  // Security Group before bare "group" (IAM users & groups)
  { re: /\b(security group|sg\b|port 22|inbound)\b/i, topic: "Security groups" },
  { re: /\b(user|group|permission)\b/i, topic: "IAM users & groups" },
  { re: /\b(ami|image)\b/i, topic: "AMIs" },
  { re: /\b(ebs|volume|snapshot)\b/i, topic: "EBS storage" },
  { re: /\b(ssh|key pair|pem)\b/i, topic: "SSH & key pairs" },
  { re: /\b(instance type|t2\.|t3\.|c5\.|m5\.)\b/i, topic: "Instance types" },
  { re: /\b(bucket|object storage|s3)\b/i, topic: "S3 basics" },
  { re: /\b(versioning|lifecycle|storage class)\b/i, topic: "S3 features" },
  { re: /\b(static website|website hosting)\b/i, topic: "S3 static sites" },
  { re: /\b(vpc|subnet|cidr|route table)\b/i, topic: "VPC networking" },
  { re: /\b(nat|internet gateway|igw)\b/i, topic: "Gateways" },
  { re: /\b(rds|aurora|multi-az|read replica)\b/i, topic: "RDS" },
  { re: /\b(load balancer|alb|nlb|elb|health check)\b/i, topic: "Load balancing" },
  { re: /\b(auto scaling|asg|scale out|scale in)\b/i, topic: "Auto Scaling" },
  { re: /\b(lambda|serverless|cold start)\b/i, topic: "Lambda" },
  { re: /\b(dynamodb|partition key|gsi|lsi)\b/i, topic: "DynamoDB" },
  { re: /\b(cloudwatch|metric|alarm|log)\b/i, topic: "CloudWatch" },
  { re: /\b(cloudtrail|audit)\b/i, topic: "CloudTrail" },
  { re: /\b(docker|container|ecr|ecs|fargate)\b/i, topic: "Containers" },
  { re: /\b(cloudformation|terraform|iac|infrastructure as code)\b/i, topic: "IaC" },
  { re: /\b(region|availability zone|az\b)\b/i, topic: "Regions & AZs" },
  { re: /\b(cloud|pay.?per.?use|data center)\b/i, topic: "Cloud fundamentals" },
];

export function inferTopic(
  q: QuizQuestion,
  fallback = "General"
): string {
  if (q.topic) return q.topic;
  const text = `${q.q} ${q.options.join(" ")} ${q.explain}`;
  for (const rule of TOPIC_RULES) {
    if (rule.re.test(text)) return rule.topic;
  }
  return fallback;
}

/** Count correct answers for a quiz attempt. */
export function scoreQuiz(
  questions: QuizQuestion[],
  selected: Record<number, number>
): number {
  let s = 0;
  questions.forEach((item, qi) => {
    if (selected[qi] === item.answer) s += 1;
  });
  return s;
}

export function weakTopicsFromAnswers(
  questions: QuizQuestion[],
  selected: Record<number, number>
): { topic: string; wrong: number; total: number }[] {
  const map = new Map<string, { wrong: number; total: number }>();
  questions.forEach((q, i) => {
    const topic = inferTopic(q);
    const cur = map.get(topic) || { wrong: 0, total: 0 };
    cur.total += 1;
    if (selected[i] !== q.answer) cur.wrong += 1;
    map.set(topic, cur);
  });
  return [...map.entries()]
    .map(([topic, v]) => ({ topic, ...v }))
    .filter((t) => t.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong || b.total - a.total);
}

export function makeReviewId(lessonId: string, question: string): string {
  return `${lessonId}:${hashString(question).toString(16)}`;
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Expanding review schedule (SM-2 inspired, simplified):
 * - First fail → due in 1 day
 * - After success → interval grows (1 → 3 → 7 → 14 …) capped at 60d
 * - Fail resets interval to 1 day
 */
export function nextDue(timesWrong: number, now = Date.now()): number {
  const days = Math.min(14, Math.max(1, timesWrong));
  return now + days * DAY;
}

export function scheduleAfterFail(
  prev: ReviewItem | undefined,
  now = Date.now()
): Pick<ReviewItem, "timesWrong" | "timesCorrect" | "ease" | "intervalDays" | "dueAt" | "wrongAt"> {
  const timesWrong = (prev?.timesWrong || 0) + 1;
  const ease = Math.max(1.3, (prev?.ease ?? 2.5) - 0.2);
  return {
    timesWrong,
    timesCorrect: 0,
    ease,
    intervalDays: 1,
    wrongAt: now,
    dueAt: now + 1 * DAY,
  };
}

export function scheduleAfterSuccess(
  prev: ReviewItem,
  now = Date.now()
): ReviewItem | null {
  const timesCorrect = (prev.timesCorrect || 0) + 1;
  const ease = Math.min(3.0, (prev.ease ?? 2.5) + 0.1);
  let intervalDays: number;
  if (timesCorrect === 1) intervalDays = 1;
  else if (timesCorrect === 2) intervalDays = 3;
  else if (timesCorrect === 3) intervalDays = 7;
  else
    intervalDays = Math.min(
      60,
      Math.round((prev.intervalDays || 7) * ease)
    );

  // Mastered after a long interval success streak
  if (timesCorrect >= 5 && intervalDays >= 30) {
    return null; // drop from queue
  }

  return {
    ...prev,
    timesCorrect,
    timesWrong: prev.timesWrong,
    ease,
    intervalDays,
    dueAt: now + intervalDays * DAY,
  };
}

export function upsertMisses(
  queue: ReviewItem[],
  lessonId: string,
  questions: QuizQuestion[],
  selected: Record<number, number>
): ReviewItem[] {
  const now = Date.now();
  const byId = new Map(queue.map((r) => [r.id, { ...r }]));

  questions.forEach((q, i) => {
    const id = makeReviewId(lessonId, q.q);
    if (selected[i] === undefined) return;

    if (selected[i] === q.answer) {
      const prev = byId.get(id);
      if (!prev) return; // never failed — stay out of queue
      const next = scheduleAfterSuccess(prev, now);
      if (!next) byId.delete(id);
      else byId.set(id, next);
      return;
    }

    const prev = byId.get(id);
    const sched = scheduleAfterFail(prev, now);
    byId.set(id, {
      id,
      lessonId,
      question: q.q,
      options: q.options,
      answer: q.answer,
      explain: q.explain,
      topic: inferTopic(q),
      ...sched,
    });
  });

  return [...byId.values()].sort((a, b) => a.dueAt - b.dueAt);
}

/** Pass threshold for lesson mastery (soft/hard gate). */
export const MASTERY_THRESHOLD = 0.7;

export function isQuizMastered(
  score: number,
  total: number,
  threshold = MASTERY_THRESHOLD
): boolean {
  if (!total) return false;
  return score / total >= threshold;
}

export function dueReviews(queue: ReviewItem[], now = Date.now()): ReviewItem[] {
  return queue.filter((r) => r.dueAt <= now).sort((a, b) => a.dueAt - b.dueAt);
}
