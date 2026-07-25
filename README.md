# AWS Path (Next.js)

Mobile-first AWS learning course — dark developer-docs theme, quizzes, and local progress tracking.

## Run

```bash
cd "/Users/thearnabsaha/Desktop/grok things/aws-learning-site"
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

## Stack

- **Next.js 15** (App Router)
- **React 19** + TypeScript
- Progress in `localStorage` (no backend / no login)
- **PWA** (`@ducanh2912/next-pwa`) — installable, offline fallback for cached routes
- **Responsive** — phone, tablet, desktop, wide desktop shell with permanent sidebar

## PWA

- Manifest: `public/manifest.webmanifest`
- Icons: `public/icons/`
- Service worker is generated on **production** build (`npm run build` + `npm start`)
- Dev mode keeps SW disabled for clean HMR

## Structure

```
src/
  app/                 # routes (/, /lesson/[id])
  components/          # UI shell, quiz, home, lesson
  context/             # ProgressProvider
  data/lessons/        # curriculum content
  lib/                 # localStorage helpers
  types/               # Lesson types
```

## Curriculum

**Source:** ChatGPT shared conversation *AWS Learning Roadmap*  
(`https://chatgpt.com/share/6a64cda4-bfb4-83ee-94da-093bddf60d45`)

Raw markdown extract: `content/from-chatgpt/lesson-1.md` … `lesson-12.md`

| # | Topic |
|---|--------|
| 01 | What is Cloud Computing? + roadmap |
| 02 | AWS Account, Console & IAM |
| 03 | Amazon EC2 |
| 04 | Amazon S3 |
| 05 | Amazon VPC |
| 06 | Amazon RDS |
| 07 | ELB & Auto Scaling |
| 08 | AWS Lambda |
| 09 | Amazon DynamoDB |
| 10 | CloudWatch & CloudTrail |
| 11 | Docker, ECR & ECS |
| 12 | CloudFormation & Terraform |
| 13 | Capstone practice (extra) |

Quizzes + local progress are site extras on top of the chat text.
