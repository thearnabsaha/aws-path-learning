/** Services unlocked as the learner completes each lesson — compact 2D layout */

export type ArchNode = {
  id: string;
  label: string;
  /** short label for tight map */
  short: string;
  x: number;
  y: number;
  unlocksWith: string;
  group: "edge" | "compute" | "data" | "net" | "ops" | "identity";
};

/**
 * Compact grid (viewBox ~ 420×280). Nodes sit ~70–90px apart so
 * the map stays readable without huge empty space or overlap.
 */
export const ARCH_NODES: ArchNode[] = [
  // Row 1 — edge / identity
  { id: "users", label: "Users", short: "Users", x: 48, y: 36, unlocksWith: "cloud-fundamentals", group: "edge" },
  { id: "iam", label: "IAM", short: "IAM", x: 128, y: 36, unlocksWith: "iam", group: "identity" },
  { id: "r53", label: "Route 53", short: "R53", x: 208, y: 36, unlocksWith: "route53", group: "edge" },
  { id: "cf", label: "CloudFront", short: "CF", x: 288, y: 36, unlocksWith: "cloudfront", group: "edge" },
  { id: "s3", label: "S3", short: "S3", x: 368, y: 36, unlocksWith: "s3", group: "data" },

  // Row 2 — net / load / ops
  { id: "igw", label: "Internet", short: "IGW", x: 48, y: 108, unlocksWith: "vpc", group: "net" },
  { id: "alb", label: "ALB", short: "ALB", x: 148, y: 108, unlocksWith: "elb-asg", group: "edge" },
  { id: "cw", label: "CloudWatch", short: "CW", x: 248, y: 108, unlocksWith: "observability", group: "ops" },
  { id: "iac", label: "IaC", short: "IaC", x: 348, y: 108, unlocksWith: "iac", group: "ops" },

  // Row 3 — compute
  { id: "ec2a", label: "EC2 A", short: "EC2 A", x: 100, y: 180, unlocksWith: "ec2", group: "compute" },
  { id: "ec2b", label: "EC2 B", short: "EC2 B", x: 180, y: 180, unlocksWith: "elb-asg", group: "compute" },
  { id: "lambda", label: "Lambda", short: "Lambda", x: 268, y: 180, unlocksWith: "lambda", group: "compute" },
  { id: "ecs", label: "ECS", short: "ECS", x: 348, y: 180, unlocksWith: "containers", group: "compute" },
  { id: "eks", label: "EKS", short: "EKS", x: 400, y: 180, unlocksWith: "eks-ecs", group: "compute" },

  // Row 4 — data / vpc
  { id: "vpc", label: "VPC", short: "VPC", x: 48, y: 252, unlocksWith: "vpc", group: "net" },
  { id: "rds", label: "RDS", short: "RDS", x: 140, y: 252, unlocksWith: "rds", group: "data" },
  { id: "ddb", label: "DynamoDB", short: "DDB", x: 232, y: 252, unlocksWith: "dynamodb", group: "data" },
  { id: "sqs", label: "SQS/SNS", short: "SQS", x: 324, y: 252, unlocksWith: "messaging", group: "ops" },
];

export type ArchEdge = { from: string; to: string; unlocksWith: string };

export const ARCH_EDGES: ArchEdge[] = [
  { from: "users", to: "r53", unlocksWith: "route53" },
  { from: "r53", to: "cf", unlocksWith: "cloudfront" },
  { from: "cf", to: "s3", unlocksWith: "cloudfront" },
  { from: "users", to: "igw", unlocksWith: "vpc" },
  { from: "igw", to: "alb", unlocksWith: "elb-asg" },
  { from: "alb", to: "ec2a", unlocksWith: "elb-asg" },
  { from: "alb", to: "ec2b", unlocksWith: "elb-asg" },
  { from: "ec2a", to: "rds", unlocksWith: "rds" },
  { from: "ec2b", to: "rds", unlocksWith: "rds" },
  { from: "users", to: "s3", unlocksWith: "s3" },
  { from: "lambda", to: "ddb", unlocksWith: "dynamodb" },
  { from: "lambda", to: "s3", unlocksWith: "lambda" },
  { from: "lambda", to: "sqs", unlocksWith: "messaging" },
  { from: "ecs", to: "alb", unlocksWith: "containers" },
  { from: "eks", to: "alb", unlocksWith: "eks-ecs" },
  { from: "cw", to: "ec2a", unlocksWith: "observability" },
  { from: "iam", to: "ec2a", unlocksWith: "iam" },
  { from: "iac", to: "vpc", unlocksWith: "iac" },
];

export const ARCH_VIEW = { width: 440, height: 290 } as const;

export function isUnlocked(
  lessonId: string,
  completed: Record<string, number>,
  _order?: string[]
): boolean {
  void _order;
  return !!completed[lessonId];
}
