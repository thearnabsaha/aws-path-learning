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
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright smoke (needs prior `npm run build`) |
| `npm run test:all` | Unit + build + e2e |

CI (GitHub Actions): lint → unit tests → build → Playwright on every push/PR to `main`.

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

### Additional · SAA & jobs (13–20)

Full lessons from ChatGPT share *AWS Learning Roadmap* (follow-up share), with site quizzes.

| # | Id | Topic |
|---|-----|--------|
| 13 | identity-center | IAM Identity Center (SSO) |
| 14 | kms-secrets | KMS & Secrets Manager |
| 15 | messaging | SQS, SNS & EventBridge |
| 16 | cloudfront | CloudFront & OAC |
| 17 | route53 | Route 53 |
| 18 | cost-management | Cost Explorer & Budgets |
| 19 | security-ops | Security Hub, GuardDuty & friends |
| 20 | eks-ecs | ECS vs EKS |

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

## Learning paths (P2)

| Path | Contents |
|------|----------|
| **Fast** | Cloud fundamentals → IAM → EC2 → S3 → VPC → RDS → ELB/ASG |
| **Full** | Core lessons 1–12 |
| **Interview** | Core 1–12 + `/interview` scenario drills & open prompts |
| **Everything** | Core + additional SAA topics (13–20) |

Path choice is stored in progress (`learningPath`). Stats (done %, time left) follow the active path.

### Editorial (core 1–12)

- In-body **Mini Quiz** blocks removed (site quizzes are canonical)
- Duplicate “by the end of this lesson” goal lists removed (meta goals remain)
- Chat-style phrasing neutralized; ₹ amounts show approximate USD
- Interview sections kept as open **practice prompts**

Progress storage key: `aws-path-progress-v3` (auto-migrates v2).

## Design polish (P4)

| Item | Where |
|------|--------|
| Sticky **prev/next** lesson bar | Lesson pages (mobile + desktop) |
| **Shiki** syntax highlight + Copy | Lesson code blocks (theme-aware) |
| Sticky **table** header + first column | `.table-wrap` horizontal scroll |
| First-run **coach marks** | Home tour (localStorage `aws-path-coach-v1`) |
| **Reduced motion** | Global + landing/hero/coach |
| Mocha **SVG favicon** | `/icons/favicon.svg` |

## Engineering quality (P3)

| Area | Implementation |
|------|----------------|
| **Unit tests** | `splitLessonHtml`, progress import/export, quiz score/shuffle/review, paths |
| **E2E** | Playwright: home → lesson → accordion → quiz |
| **CI** | `.github/workflows/ci.yml` — lint, test, build, e2e |
| **Repo hygiene** | Generated `sw.js` / workbox gitignored; default CRA SVGs removed |
| **PWA** | Install prompt, lesson precache, offline cached-lesson list, cream `#f4ebe0` theme-color |
| **Analytics** | Vercel Analytics (prod) + privacy-friendly custom events (no lesson body / PII) |

## Deploy

Set `NEXT_PUBLIC_SITE_URL` to the production origin for correct sitemap, robots, and canonical URLs (default fallback: `https://aws-path-learning.vercel.app`).
