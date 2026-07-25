export type SketchKind =
  | "goals"
  | "intro"
  | "cloud"
  | "region"
  | "iam"
  | "root"
  | "console"
  | "policy"
  | "mfa"
  | "ec2"
  | "ami"
  | "security-group"
  | "ssh"
  | "s3"
  | "bucket"
  | "versioning"
  | "vpc"
  | "subnet"
  | "nat"
  | "igw"
  | "rds"
  | "multi-az"
  | "replica"
  | "elb"
  | "asg"
  | "health"
  | "lambda"
  | "api"
  | "event"
  | "dynamo"
  | "keys"
  | "scan"
  | "cloudwatch"
  | "alarm"
  | "cloudtrail"
  | "docker"
  | "image"
  | "ecr"
  | "ecs"
  | "fargate"
  | "iac"
  | "terraform"
  | "cloudformation"
  | "state"
  | "cicd"
  | "lab"
  | "interview"
  | "architecture"
  | "pricing"
  | "default";

const RULES: { re: RegExp; kind: SketchKind }[] = [
  { re: /what you will learn|goals?/i, kind: "goals" },
  { re: /introduction|roadmap|learning plan/i, kind: "intro" },
  { re: /cloud computing|traditional vs cloud|what is aws|pay-as-you|free tier|terminology/i, kind: "cloud" },
  { re: /region|availability zone|\baz\b|city/i, kind: "region" },
  { re: /root user|never use the root/i, kind: "root" },
  { re: /\biam\b|least privilege|authentication|authorization|access key|password polic/i, kind: "iam" },
  { re: /policy|policies|roles?|groups?|users?/i, kind: "policy" },
  { re: /\bmfa\b|multi-factor/i, kind: "mfa" },
  { re: /console|cli\b|login flow/i, kind: "console" },
  { re: /\bami\b|machine image/i, kind: "ami" },
  { re: /security group|common ports|nacl|firewall/i, kind: "security-group" },
  { re: /ssh|key pair|connecting|linux command/i, kind: "ssh" },
  { re: /\bec2\b|instance type|ebs|stopping|terminat|lifecycle|launching/i, kind: "ec2" },
  { re: /versioning|lifecycle rule|storage class|encryption|durability/i, kind: "versioning" },
  { re: /bucket|object key|static website|object storage|\bs3\b/i, kind: "s3" },
  { re: /nat gateway/i, kind: "nat" },
  { re: /internet gateway|\bigw\b/i, kind: "igw" },
  { re: /subnet|cidr|public subnet|private subnet|route table/i, kind: "subnet" },
  { re: /\bvpc\b|private network|data flow/i, kind: "vpc" },
  { re: /multi-az|failover/i, kind: "multi-az" },
  { re: /read replica/i, kind: "replica" },
  { re: /\brds\b|database|sql\b|snapshot|backup|postgres|mysql/i, kind: "rds" },
  { re: /health check/i, kind: "health" },
  { re: /auto scaling|asg|scaling out|scaling up|launch template|desired|capacity/i, kind: "asg" },
  { re: /load balancer|\belb\b|\balb\b|\bnlb\b|black friday/i, kind: "elb" },
  { re: /api gateway|serverless api/i, kind: "api" },
  { re: /cold start|event-driven|trigger|image processing|email/i, kind: "event" },
  { re: /lambda|serverless|handler|concurrency|stateless/i, kind: "lambda" },
  { re: /partition key|sort key|primary key|gsi|lsi|scan vs query|query/i, kind: "keys" },
  { re: /scan/i, kind: "scan" },
  { re: /dynamodb|nosql|item|attribute|ttl|global table|stream/i, kind: "dynamo" },
  { re: /cloudtrail|audit/i, kind: "cloudtrail" },
  { re: /alarm|dashboard|metric|cloudwatch|logging|monitoring/i, kind: "cloudwatch" },
  { re: /\becr\b|registry/i, kind: "ecr" },
  { re: /fargate/i, kind: "fargate" },
  { re: /dockerfile|docker image|container lifecycle|docker command|volume|port/i, kind: "docker" },
  { re: /\becs\b|task definition|cluster|service|microserv/i, kind: "ecs" },
  { re: /docker|container|vm vs/i, kind: "docker" },
  { re: /terraform|plan|apply|init|destroy|hcl/i, kind: "terraform" },
  { re: /cloudformation|stack/i, kind: "cloudformation" },
  { re: /state file|drift|idempoten|module|variable|output/i, kind: "state" },
  { re: /ci\/cd|pipeline|production workflow/i, kind: "cicd" },
  { re: /infrastructure as code|\biac\b|manual infrastructure/i, kind: "iac" },
  { re: /hands-on|lab/i, kind: "lab" },
  { re: /interview/i, kind: "interview" },
  { re: /architecture|complete aws|so far|production example|real-world/i, kind: "architecture" },
  { re: /pricing|cost/i, kind: "pricing" },
];

export function sketchKindForTitle(title: string, lessonId?: string): SketchKind {
  for (const { re, kind } of RULES) {
    if (re.test(title)) return kind;
  }
  // lesson-level fallbacks
  if (lessonId) {
    const map: Record<string, SketchKind> = {
      "cloud-fundamentals": "cloud",
      iam: "iam",
      ec2: "ec2",
      s3: "s3",
      vpc: "vpc",
      rds: "rds",
      "elb-asg": "elb",
      lambda: "lambda",
      dynamodb: "dynamo",
      observability: "cloudwatch",
      containers: "docker",
      iac: "iac",
      capstone: "architecture",
    };
    if (map[lessonId]) return map[lessonId];
  }
  return "default";
}

export function sketchCaption(kind: SketchKind, title: string): string {
  const map: Partial<Record<SketchKind, string>> = {
    goals: "study checklist — tick these off",
    cloud: "rent computers · like Uber for servers",
    region: "Region = city · AZ = buildings",
    iam: "who are you? · what can you do?",
    root: "master key — keep it rare",
    ec2: "virtual computer in the cloud",
    s3: "buckets hold objects (files)",
    vpc: "your private neighborhood in AWS",
    rds: "managed SQL · backups · Multi-AZ",
    elb: "traffic distributor + health checks",
    asg: "add/remove servers automatically",
    lambda: "run code · no server babysitting",
    dynamo: "keys first · access patterns win",
    cloudwatch: "is it healthy right now?",
    cloudtrail: "who called which API?",
    docker: "ship the same box everywhere",
    ecs: "keep N containers running",
    iac: "infra in git · plan then apply",
    terraform: "init → plan → apply",
    lab: "do the lab · muscle memory",
    interview: "draw it · then name services",
    architecture: "put the pieces together",
  };
  return map[kind] || `notes: ${title.slice(0, 48)}`;
}
