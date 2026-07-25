"use client";

import type { SketchKind } from "@/lib/sketchTopics";
import { sketchCaption, sketchKindForTitle } from "@/lib/sketchTopics";

type Props = {
  title: string;
  lessonId?: string;
  kind?: SketchKind;
  size?: "sm" | "md" | "lg";
};

/** Black & white notebook-style educational sketch (code-drawn for accurate labels). */
export function NotebookSketch({ title, lessonId, kind, size = "md" }: Props) {
  const k = kind ?? sketchKindForTitle(title, lessonId);
  const caption = sketchCaption(k, title);
  const h = size === "lg" ? 220 : size === "sm" ? 140 : 180;

  return (
    <figure className={`notebook-sketch size-${size}`} aria-label={`Sketch: ${title}`}>
      <div className="notebook-paper">
        <svg
          viewBox="0 0 360 200"
          width="100%"
          height={h}
          role="img"
          aria-hidden="true"
        >
          <defs>
            <pattern id="lines" width="360" height="22" patternUnits="userSpaceOnUse">
              <line x1="0" y1="21" x2="360" y2="21" stroke="#c9c0b4" strokeWidth="1" />
            </pattern>
            <filter id="wobble">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="n" />
              <feDisplacementMap in="SourceGraphic" in2="n" scale="0.8" />
            </filter>
          </defs>
          <rect width="360" height="200" fill="#fbfaf7" />
          <rect width="360" height="200" fill="url(#lines)" opacity="0.55" />
          {/* margin line */}
          <line x1="36" y1="0" x2="36" y2="200" stroke="#e8b4b4" strokeWidth="1.2" />
          {/* binder holes */}
          <circle cx="14" cy="40" r="5" fill="none" stroke="#bbb" strokeWidth="1.2" />
          <circle cx="14" cy="100" r="5" fill="none" stroke="#bbb" strokeWidth="1.2" />
          <circle cx="14" cy="160" r="5" fill="none" stroke="#bbb" strokeWidth="1.2" />

          <g
            stroke="#1a1a1a"
            fill="none"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#wobble)"
          >
            {drawSketch(k)}
          </g>
          {/* title scribble */}
          <text
            x="48"
            y="22"
            fill="#1a1a1a"
            fontSize="11"
            fontFamily="var(--font-sketch), cursive"
            fontWeight="600"
          >
            {truncate(title, 42)}
          </text>
        </svg>
      </div>
      <figcaption className="notebook-caption">{caption}</figcaption>
    </figure>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function box(
  x: number,
  y: number,
  w: number,
  h: number,
  label?: string,
  rx = 6
) {
  return (
    <g key={`${x}-${y}-${label}`}>
      <rect x={x} y={y} width={w} height={h} rx={rx} />
      {label ? (
        <text
          x={x + w / 2}
          y={y + h / 2 + 4}
          textAnchor="middle"
          fill="#1a1a1a"
          stroke="none"
          fontSize="10"
          fontFamily="var(--font-sketch), cursive"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

function arrow(x1: number, y1: number, x2: number, y2: number) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 7;
  return (
    <g key={`a-${x1}-${y1}-${x2}-${y2}`}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path
        d={`M ${x2} ${y2} L ${x2 - head * Math.cos(angle - 0.4)} ${
          y2 - head * Math.sin(angle - 0.4)
        } M ${x2} ${y2} L ${x2 - head * Math.cos(angle + 0.4)} ${
          y2 - head * Math.sin(angle + 0.4)
        }`}
      />
    </g>
  );
}

function label(x: number, y: number, t: string, size = 10) {
  return (
    <text
      key={`t-${x}-${y}-${t}`}
      x={x}
      y={y}
      fill="#1a1a1a"
      stroke="none"
      fontSize={size}
      fontFamily="var(--font-sketch), cursive"
    >
      {t}
    </text>
  );
}

function drawSketch(kind: SketchKind) {
  switch (kind) {
    case "goals":
      return (
        <>
          {label(48, 48, "✓ learn goals")}
          {label(48, 72, "✓ understand diagrams")}
          {label(48, 96, "✓ do the lab")}
          {label(48, 120, "✓ take the quiz")}
          {box(220, 50, 100, 90, "checklist")}
        </>
      );
    case "intro":
    case "cloud":
      return (
        <>
          {box(50, 50, 70, 50, "you")}
          {arrow(125, 75, 165, 75)}
          {box(170, 45, 90, 60, "AWS cloud")}
          {arrow(265, 75, 300, 75)}
          {box(305, 55, 40, 40, "app")}
          {label(48, 130, "rent · pay as you go · scale fast")}
          {label(48, 155, "no giant server bill up front")}
        </>
      );
    case "region":
      return (
        <>
          {box(80, 45, 200, 120, "")}
          {label(150, 62, "Region")}
          {box(100, 80, 50, 55, "AZ-a")}
          {box(160, 80, 50, 55, "AZ-b")}
          {box(220, 80, 50, 55, "AZ-c")}
          {label(48, 185, "spread for high availability")}
        </>
      );
    case "root":
      return (
        <>
          {box(120, 50, 120, 50, "ROOT 🔑")}
          {arrow(180, 100, 180, 125)}
          {label(100, 145, "rare use only + MFA")}
          {label(70, 170, "daily work → IAM users/roles")}
        </>
      );
    case "iam":
    case "policy":
      return (
        <>
          {box(50, 55, 70, 45, "User")}
          {box(145, 55, 70, 45, "Role")}
          {box(240, 55, 80, 45, "Policy")}
          {arrow(120, 78, 145, 78)}
          {arrow(215, 78, 240, 78)}
          {label(48, 130, "AuthN: who?   AuthZ: allowed?")}
          {label(48, 155, "least privilege always")}
        </>
      );
    case "mfa":
      return (
        <>
          {box(70, 60, 90, 55, "password")}
          {label(175, 90, "+")}
          {box(200, 60, 90, 55, "phone code")}
          {arrow(160, 125, 160, 150)}
          {label(110, 170, "MFA = two locks")}
        </>
      );
    case "console":
      return (
        <>
          {box(70, 50, 220, 110, "")}
          {label(90, 75, "AWS Console / CLI")}
          {box(90, 90, 50, 40, "EC2")}
          {box(155, 90, 50, 40, "S3")}
          {box(220, 90, 50, 40, "IAM")}
          {label(48, 180, "GUI for humans · CLI for scripts")}
        </>
      );
    case "ec2":
      return (
        <>
          {box(60, 55, 100, 80, "EC2 VM")}
          {label(80, 150, "CPU · RAM · disk")}
          {arrow(170, 95, 210, 95)}
          {box(215, 60, 100, 70, "your app")}
          {label(48, 180, "virtual computer · runs 24×7")}
        </>
      );
    case "ami":
      return (
        <>
          {box(70, 55, 90, 70, "AMI")}
          {arrow(170, 90, 210, 90)}
          {box(215, 50, 90, 40, "inst 1")}
          {box(215, 100, 90, 40, "inst 2")}
          {label(48, 170, "image template → many servers")}
        </>
      );
    case "security-group":
      return (
        <>
          {box(120, 50, 120, 90, "EC2")}
          <ellipse cx="180" cy="95" rx="95" ry="70" strokeDasharray="4 3" />
          {label(48, 165, "Security Group = virtual firewall")}
          {label(48, 185, "allow ports carefully (22, 80, 443…)")}
        </>
      );
    case "ssh":
      return (
        <>
          {box(50, 60, 80, 55, "you")}
          {arrow(140, 88, 190, 88)}
          {label(150, 75, "SSH :22")}
          {box(200, 55, 110, 65, "EC2 Linux")}
          {label(48, 155, "key pair · private key stays private")}
        </>
      );
    case "s3":
    case "bucket":
      return (
        <>
          {box(100, 50, 160, 100, "")}
          {label(155, 75, "S3 Bucket")}
          {label(120, 100, "📷 photo.jpg")}
          {label(120, 120, "📄 report.pdf")}
          {label(120, 140, "🎬 video.mp4")}
          {label(48, 175, "object storage · key = path/name")}
        </>
      );
    case "versioning":
      return (
        <>
          {box(70, 50, 80, 45, "v1")}
          {box(140, 70, 80, 45, "v2")}
          {box(210, 90, 80, 45, "v3")}
          {label(48, 160, "versioning saves old copies")}
        </>
      );
    case "vpc":
      return (
        <>
          {box(50, 45, 260, 130, "")}
          {label(60, 65, "VPC 10.0.0.0/16")}
          {box(70, 85, 100, 70, "public")}
          {box(190, 85, 100, 70, "private")}
          {label(48, 190, "your private network in AWS")}
        </>
      );
    case "subnet":
      return (
        <>
          {box(55, 55, 110, 80, "Public")}
          {box(195, 55, 110, 80, "Private")}
          {label(70, 150, "→ IGW")}
          {label(210, 150, "→ NAT")}
          {label(48, 180, "route tables decide the path")}
        </>
      );
    case "igw":
      return (
        <>
          {box(50, 70, 70, 45, "Users")}
          {arrow(125, 92, 160, 92)}
          {box(165, 65, 70, 55, "IGW")}
          {arrow(240, 92, 275, 92)}
          {box(280, 70, 60, 45, "VPC")}
        </>
      );
    case "nat":
      return (
        <>
          {box(50, 55, 90, 55, "private")}
          {arrow(145, 82, 185, 82)}
          {box(190, 55, 70, 55, "NAT")}
          {arrow(265, 82, 300, 82)}
          {box(305, 60, 40, 45, "www")}
          {label(48, 140, "outbound only · no inbound from net")}
        </>
      );
    case "rds":
      return (
        <>
          {box(60, 60, 90, 60, "App")}
          {arrow(155, 90, 195, 90)}
          {box(200, 50, 110, 80, "RDS SQL")}
          {label(48, 155, "managed database · backups · patches")}
        </>
      );
    case "multi-az":
      return (
        <>
          {box(70, 55, 90, 70, "Primary")}
          {arrow(170, 90, 210, 90)}
          {box(215, 55, 90, 70, "Standby")}
          {label(100, 150, "Multi-AZ = HA failover")}
        </>
      );
    case "replica":
      return (
        <>
          {box(60, 60, 80, 55, "Primary")}
          {arrow(150, 88, 190, 70)}
          {arrow(150, 88, 190, 110)}
          {box(200, 50, 90, 40, "Replica")}
          {box(200, 100, 90, 40, "Replica")}
          {label(48, 165, "read replicas scale reads")}
        </>
      );
    case "elb":
      return (
        <>
          {box(50, 70, 55, 40, "Users")}
          {arrow(110, 90, 145, 90)}
          {box(150, 55, 70, 70, "ALB")}
          {arrow(225, 75, 260, 55)}
          {arrow(225, 90, 260, 90)}
          {arrow(225, 105, 260, 125)}
          {box(265, 40, 60, 30, "i1")}
          {box(265, 80, 60, 30, "i2")}
          {box(265, 120, 60, 30, "i3")}
        </>
      );
    case "asg":
      return (
        <>
          {box(70, 50, 100, 50, "ASG min/max")}
          {arrow(180, 75, 220, 75)}
          {box(225, 40, 45, 35, "+")}
          {box(225, 85, 45, 35, "−")}
          {label(48, 145, "scale out under load · scale in later")}
          {label(48, 170, "replace unhealthy instances")}
        </>
      );
    case "health":
      return (
        <>
          {box(80, 55, 80, 55, "LB")}
          {arrow(170, 82, 210, 82)}
          {box(215, 45, 90, 35, "✓ healthy")}
          {box(215, 95, 90, 35, "✗ sick")}
          {label(48, 160, "health checks remove bad targets")}
        </>
      );
    case "lambda":
    case "event":
      return (
        <>
          {box(50, 60, 70, 50, "Event")}
          {arrow(125, 85, 165, 85)}
          {box(170, 55, 90, 60, "Lambda")}
          {arrow(265, 85, 300, 85)}
          {box(305, 65, 40, 40, "OK")}
          {label(48, 150, "no server to babysit · pay per use")}
        </>
      );
    case "api":
      return (
        <>
          {box(50, 65, 70, 45, "Client")}
          {arrow(125, 88, 160, 88)}
          {box(165, 55, 90, 65, "API GW")}
          {arrow(260, 88, 295, 88)}
          {box(300, 60, 45, 55, "λ")}
        </>
      );
    case "dynamo":
    case "keys":
      return (
        <>
          {box(70, 50, 220, 90, "")}
          {label(90, 75, "PK = USER#42")}
          {label(90, 100, "SK = ORDER#…")}
          {label(90, 125, "attrs…")}
          {label(48, 165, "design keys from access patterns")}
        </>
      );
    case "scan":
      return (
        <>
          {box(60, 55, 100, 80, "Query ✓")}
          {box(200, 55, 100, 80, "Scan ⚠")}
          {label(48, 160, "prefer Query · Scan is expensive")}
        </>
      );
    case "cloudwatch":
    case "alarm":
      return (
        <>
          {box(50, 55, 80, 55, "metrics")}
          {arrow(140, 82, 175, 82)}
          {box(180, 55, 80, 55, "Alarm")}
          {arrow(270, 82, 305, 82)}
          {box(310, 60, 35, 45, "📣")}
          {label(48, 145, "is it healthy right now?")}
          {label(48, 170, "dashboards · logs · alarms")}
        </>
      );
    case "cloudtrail":
      return (
        <>
          {box(50, 55, 80, 60, "API call")}
          {arrow(140, 85, 180, 85)}
          {box(185, 50, 120, 70, "CloudTrail")}
          {label(48, 150, "who did what · when · from where")}
        </>
      );
    case "docker":
    case "image":
      return (
        <>
          {box(55, 50, 100, 90, "Container")}
          {label(70, 95, "app+deps")}
          {arrow(165, 95, 205, 95)}
          {box(210, 55, 100, 80, "same box")}
          {label(48, 165, "build once · run anywhere")}
        </>
      );
    case "ecr":
      return (
        <>
          {box(50, 60, 80, 55, "docker")}
          {arrow(140, 88, 180, 88)}
          {box(185, 50, 120, 70, "ECR registry")}
          {label(48, 150, "private image warehouse")}
        </>
      );
    case "ecs":
    case "fargate":
      return (
        <>
          {box(50, 55, 70, 50, "ALB")}
          {arrow(125, 80, 160, 80)}
          {box(165, 45, 140, 90, "ECS Service")}
          {box(180, 75, 40, 40, "t")}
          {box(230, 75, 40, 40, "t")}
          {label(48, 160, "desired count · rolling deploys")}
        </>
      );
    case "iac":
    case "terraform":
    case "cloudformation":
      return (
        <>
          {box(50, 55, 90, 70, "code")}
          {arrow(150, 90, 190, 90)}
          {box(195, 55, 70, 70, "plan")}
          {arrow(275, 90, 305, 90)}
          {box(310, 60, 35, 55, "☁️")}
          {label(48, 155, "init → plan → apply")}
        </>
      );
    case "state":
      return (
        <>
          {box(70, 55, 100, 70, "tfstate")}
          {arrow(180, 90, 220, 90)}
          {box(225, 55, 100, 70, "real IDs")}
          {label(48, 155, "protect state · lock · encrypt")}
        </>
      );
    case "cicd":
      return (
        <>
          {box(45, 65, 55, 40, "PR")}
          {arrow(105, 85, 135, 85)}
          {box(140, 60, 60, 50, "plan")}
          {arrow(205, 85, 235, 85)}
          {box(240, 60, 60, 50, "apply")}
          {label(48, 145, "review the plan before prod")}
        </>
      );
    case "lab":
      return (
        <>
          {label(70, 60, "1. open console / CLI")}
          {label(70, 90, "2. build the piece")}
          {label(70, 120, "3. break it · fix it")}
          {label(70, 150, "4. tear down (save $)")}
        </>
      );
    case "interview":
      return (
        <>
          {box(60, 50, 120, 100, "draw flow")}
          {arrow(190, 100, 230, 100)}
          {box(235, 60, 90, 80, "name svc")}
          {label(48, 175, "architecture first · names second")}
        </>
      );
    case "architecture":
      return (
        <>
          {box(50, 70, 45, 35, "user")}
          {arrow(100, 88, 125, 88)}
          {box(130, 65, 50, 45, "ALB")}
          {arrow(185, 88, 210, 88)}
          {box(215, 55, 55, 35, "app")}
          {box(215, 100, 55, 35, "DB")}
          {box(290, 70, 50, 45, "S3")}
        </>
      );
    case "pricing":
      return (
        <>
          {label(60, 70, "pay for what you use")}
          {label(60, 100, "watch NAT · LB · idle disks")}
          {label(60, 130, "set a billing alarm day 1")}
          {box(240, 60, 80, 70, "$$$")}
        </>
      );
    default:
      return (
        <>
          {box(80, 55, 200, 90, "AWS notes")}
          {label(48, 170, "sketch the idea · then the details")}
        </>
      );
  }
}
