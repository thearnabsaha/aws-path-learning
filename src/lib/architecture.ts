/** Services unlocked as the learner completes each lesson */
export type ArchNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  unlocksWith: string; // lesson id
  group: "edge" | "compute" | "data" | "net" | "ops" | "identity";
};

export const ARCH_NODES: ArchNode[] = [
  { id: "users", label: "Users", x: 60, y: 40, unlocksWith: "cloud-fundamentals", group: "edge" },
  { id: "iam", label: "IAM", x: 200, y: 40, unlocksWith: "iam", group: "identity" },
  { id: "igw", label: "Internet", x: 60, y: 130, unlocksWith: "vpc", group: "net" },
  { id: "alb", label: "ALB", x: 200, y: 130, unlocksWith: "elb-asg", group: "edge" },
  { id: "ec2a", label: "EC2 A", x: 120, y: 230, unlocksWith: "ec2", group: "compute" },
  { id: "ec2b", label: "EC2 B", x: 280, y: 230, unlocksWith: "elb-asg", group: "compute" },
  { id: "lambda", label: "Lambda", x: 400, y: 230, unlocksWith: "lambda", group: "compute" },
  { id: "ecs", label: "ECS", x: 520, y: 230, unlocksWith: "containers", group: "compute" },
  { id: "s3", label: "S3", x: 400, y: 40, unlocksWith: "s3", group: "data" },
  { id: "rds", label: "RDS", x: 200, y: 330, unlocksWith: "rds", group: "data" },
  { id: "ddb", label: "DynamoDB", x: 360, y: 330, unlocksWith: "dynamodb", group: "data" },
  { id: "vpc", label: "VPC", x: 60, y: 330, unlocksWith: "vpc", group: "net" },
  { id: "cw", label: "CloudWatch", x: 520, y: 130, unlocksWith: "observability", group: "ops" },
  { id: "iac", label: "IaC", x: 520, y: 40, unlocksWith: "iac", group: "ops" },
];

export type ArchEdge = { from: string; to: string; unlocksWith: string };

export const ARCH_EDGES: ArchEdge[] = [
  { from: "users", to: "igw", unlocksWith: "vpc" },
  { from: "igw", to: "alb", unlocksWith: "elb-asg" },
  { from: "alb", to: "ec2a", unlocksWith: "elb-asg" },
  { from: "alb", to: "ec2b", unlocksWith: "elb-asg" },
  { from: "ec2a", to: "rds", unlocksWith: "rds" },
  { from: "ec2b", to: "rds", unlocksWith: "rds" },
  { from: "users", to: "s3", unlocksWith: "s3" },
  { from: "lambda", to: "ddb", unlocksWith: "dynamodb" },
  { from: "lambda", to: "s3", unlocksWith: "lambda" },
  { from: "ecs", to: "alb", unlocksWith: "containers" },
  { from: "cw", to: "ec2a", unlocksWith: "observability" },
  { from: "iam", to: "ec2a", unlocksWith: "iam" },
  { from: "iac", to: "vpc", unlocksWith: "iac" },
];

export function isUnlocked(
  lessonId: string,
  completed: Record<string, number>,
  order: string[]
): boolean {
  if (completed[lessonId]) return true;
  // also unlock if any later lesson is done? No — only when this lesson done
  // For progressive map: unlock node when its lesson is completed
  void order;
  return !!completed[lessonId];
}
