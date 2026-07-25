# AWS Path

Mobile-first AWS learning course — cream/mocha light & dark themes, quizzes, and local progress tracking.

**Live repo:** [github.com/thearnabsaha/aws-path-learning](https://github.com/thearnabsaha/aws-path-learning)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`predev` / `prebuild` regenerate lesson JSON from markdown automatically.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run content` | Build lessons from MD + quizzes → `src/data/generated/` |
| `npm run dev` | Dev server (Turbopack); runs content first |
| `npm run build` | Production build; runs content first |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |

## Content pipeline

Curriculum source of truth:

1. **Markdown:** `content/from-chatgpt/lesson-1.md` … `lesson-12.md`
2. **Meta:** `scripts/lessons-meta.json` (titles, goals, tags, reviewed month, AWS doc links)
3. **Quizzes:** `scripts/quizzes.json` (canonical quiz bank per lesson id)
4. **Build:** `scripts/build-content.mjs` → `src/data/generated/index.json` + `lessons/*.json`

Edit markdown or quiz JSON, then run `npm run content` (or just `npm run dev` / `build`). Do not hand-edit generated JSON.

Each lesson HTML ends with an **accuracy note** (reviewed month + reference links). Verify critical details against official AWS docs before production use.

## Stack

- **Next.js 15** (App Router) + **React 19** + TypeScript
- Lessons code-split via dynamic `import()` of per-id JSON
- Progress in `localStorage` (no backend / no login)
- **PWA** (`@ducanh2912/next-pwa`) — installable, offline fallback for cached routes
- **SEO:** `sitemap.ts`, `robots.ts`, Open Graph image, Course/LearningResource JSON-LD

## Structure

```
content/from-chatgpt/   # source markdown (edit here)
scripts/
  build-content.mjs     # MD + meta + quizzes → JSON
  lessons-meta.json
  quizzes.json
src/
  app/                  # routes, sitemap, robots, OG image
  components/           # shell, quiz, accordion, home, lesson
  context/              # Progress + Theme
  data/generated/       # built artifacts (do not hand-edit)
  data/lessons/index.ts # summaries + loadLesson()
  lib/                  # progress, HTML split, theme
  types/
```

## Curriculum

**Source:** ChatGPT shared conversation *AWS Learning Roadmap*  
(`https://chatgpt.com/share/6a64cda4-bfb4-83ee-94da-093bddf60d45`)

| # | Id | Topic |
|---|-----|--------|
| 01 | cloud-fundamentals | What is Cloud Computing? + roadmap |
| 02 | iam | AWS Account, Console & IAM |
| 03 | ec2 | Amazon EC2 |
| 04 | s3 | Amazon S3 |
| 05 | vpc | Amazon VPC |
| 06 | rds | Amazon RDS |
| 07 | elb-asg | ELB & Auto Scaling |
| 08 | lambda | AWS Lambda |
| 09 | dynamodb | Amazon DynamoDB |
| 10 | observability | CloudWatch & CloudTrail |
| 11 | containers | Docker, ECR & ECS |
| 12 | iac | CloudFormation & Terraform |

Site quizzes and local progress are extras on top of the chat text.

## Accessibility notes

- Skip link, mobile drawer **focus trap**, Escape to close
- Accordion triggers: `aria-expanded`, `aria-controls`, arrow-key navigation
- Quiz status uses **icon + text** (not color alone)

## Product features (P1)

| Feature | Where |
|---------|--------|
| **Search** lessons & sections (⌘K) | Topbar, home, sidebar |
| **Section progress** + `?section=` resume | Lesson accordion |
| **Time remaining** | Home + sidebar |
| **Export / import progress** JSON | Home footer |
| **Quiz shuffle** + weak topics | Lesson quiz |
| **Timed challenge** | Lesson quiz |
| **Spaced review** of misses | `/review` + home |
| **Lab checklists** + cost-safety callouts | Hands-on Lab sections |
| **Copy** on code blocks | Lesson prose |
| **Architecture so far** (SVG grows) | Home |

Progress storage key: `aws-path-progress-v3` (auto-migrates v2).

## Deploy

Set `NEXT_PUBLIC_SITE_URL` to the production origin for correct sitemap, robots, and canonical URLs (default fallback: `https://aws-path-learning.vercel.app`).
