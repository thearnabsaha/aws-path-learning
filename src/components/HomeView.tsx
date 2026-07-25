"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useProgress } from "@/context/ProgressContext";
import type { LessonSummary } from "@/types/lesson";
import { SearchBox } from "./SearchBox";
import { ProgressTools } from "./ProgressTools";
import { ReviewPractice } from "./ReviewPractice";
import { PathPicker } from "./PathPicker";
import { CoachMarks } from "./CoachMarks";
import { dueReviews } from "@/lib/quizUtils";
import { getPath } from "@/lib/paths";

const HeroScene = dynamic(
  () => import("./HeroScene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => <div className="hero-scene hero-scene-fallback" aria-hidden="true" />,
  }
);

const ArchitectureMap3D = dynamic(
  () => import("./ArchitectureMap3D").then((m) => m.ArchitectureMap3D),
  {
    ssr: false,
    loading: () => (
      <section className="arch-map arch-map-3d" aria-label="Architecture so far">
        <div className="arch-map-head">
          <h2>Architecture so far</h2>
          <p>Loading 3D map…</p>
        </div>
        <div className="arch-3d-stage arch-3d-loading" />
      </section>
    ),
  }
);

export function HomeView({ lessons }: { lessons: LessonSummary[] }) {
  const {
    completedCount,
    total,
    percent,
    isDone,
    minutesRemaining,
    lastSection,
    reviewQueue,
    quizScores,
    learningPath,
    pathLessons,
  } = useProgress();

  const path = getPath(learningPath);
  const visible = pathLessons.length ? pathLessons : lessons;
  const coreInPath = visible.filter((l) => Number(l.number) <= 12);
  const extraInPath = visible.filter((l) => Number(l.number) > 12);

  const next = visible.find((l) => !isDone(l.id)) || visible[0] || lessons[0];
  const resumeSection = next ? lastSection[next.id] : undefined;
  const continueHref = resumeSection
    ? `/lesson/${next.id}?section=${encodeURIComponent(resumeSection)}`
    : `/lesson/${next.id}`;

  const dueCount = dueReviews(reviewQueue).length;
  const hours =
    minutesRemaining >= 60
      ? `${Math.floor(minutesRemaining / 60)}h ${minutesRemaining % 60}m`
      : `${minutesRemaining} min`;

  return (
    <div className="home home-landing">
      <CoachMarks />

      {/* ——— Cinematic hero ——— */}
      <section className="landing-hero" aria-label="Welcome">
        <div className="landing-hero-canvas">
          <HeroScene />
          <div className="landing-hero-glow" aria-hidden="true" />
          <div className="landing-hero-fade" aria-hidden="true" />
        </div>

        <div className="landing-hero-inner">
          <div className="landing-hero-copy">
            <p className="landing-badge">
              <span className="landing-badge-dot" aria-hidden="true" />
              {path.label} · {total} lessons · local progress
            </p>
            <h1 className="landing-title">
              Learn AWS
              <span className="landing-title-accent"> in the cloud</span>
            </h1>
            <p className="landing-lead">
              A cinematic, self-paced path from fundamentals through
              infrastructure as code—with quizzes, spaced review, labs, and
              progress that stays on this device.
            </p>

            <div className="landing-search">
              <SearchBox />
            </div>

            <div className="landing-cta">
              <Link className="btn btn-primary btn-lg landing-cta-primary" href={continueHref}>
                {completedCount
                  ? resumeSection
                    ? "Continue where you left off"
                    : "Continue learning"
                  : `Start lesson ${next?.number || "01"}`}
              </Link>
              {path.interviewMode ? (
                <Link className="btn btn-secondary btn-lg" href="/interview">
                  Interview drills
                </Link>
              ) : (
                <Link className="btn btn-secondary btn-lg" href="/review">
                  Spaced review{dueCount ? ` (${dueCount})` : ""}
                </Link>
              )}
            </div>

            <ul className="landing-pills" aria-label="Highlights">
              <li>Fast · Full · Interview · All</li>
              <li>264 quiz questions</li>
              <li>Offline PWA</li>
            </ul>
          </div>

          <aside className="landing-glass" aria-label="Path snapshot">
            <div className="landing-glass-ring" aria-hidden="true">
              <svg viewBox="0 0 120 120">
                <circle className="ring-track" cx="60" cy="60" r="52" />
                <circle
                  className="ring-progress"
                  cx="60"
                  cy="60"
                  r="52"
                  style={
                    {
                      "--p": String(percent),
                    } as React.CSSProperties
                  }
                />
              </svg>
              <div className="landing-glass-pct">
                <strong>{percent}%</strong>
                <span>complete</span>
              </div>
            </div>
            <div className="landing-glass-stats">
              <div>
                <strong>{total}</strong>
                <span>In path</span>
              </div>
              <div>
                <strong>{completedCount}</strong>
                <span>Done</span>
              </div>
              <div>
                <strong>{hours}</strong>
                <span>Left</span>
              </div>
            </div>
            <ol className="landing-loop">
              <li>
                <span>01</span> Choose a path
              </li>
              <li>
                <span>02</span> Read + lab
              </li>
              <li>
                <span>03</span> Quiz + review
              </li>
            </ol>
          </aside>
        </div>
      </section>

      <div className="landing-body">
        <PathPicker />

        {path.interviewMode && (
          <section className="path-interview-cta landing-panel">
            <div>
              <h2>Interview path active</h2>
              <p>
                Read the core lessons below, then run scenario MCQ drills and
                open prompts on the interview page.
              </p>
            </div>
            <Link className="btn btn-primary" href="/interview">
              Open interview drills
            </Link>
          </section>
        )}

        <ReviewPractice embedded />

        <ArchitectureMap3D />

        <div className="curriculum-head">
          <h2 className="section-title">
            {path.id === "fast"
              ? "Fast path lessons"
              : path.id === "all"
                ? "Core path"
                : path.label}
          </h2>
          <p className="curriculum-sub">{path.description}</p>
        </div>

        <div className="lesson-grid landing-lesson-grid">
          {coreInPath.map((l, i) => (
            <LessonCard
              key={l.id}
              lesson={l}
              complete={isDone(l.id)}
              score={quizScores[l.id]}
              resume={lastSection[l.id]}
              index={i}
            />
          ))}
        </div>

        {extraInPath.length > 0 && (
          <>
            <div className="curriculum-head curriculum-head-extra">
              <h2 className="section-title">Additional · SAA &amp; jobs</h2>
              <p className="curriculum-sub">
                After the core path. Some topics are placeholders until full
                content is published.
              </p>
            </div>
            <div className="lesson-grid landing-lesson-grid">
              {extraInPath.map((l, i) => (
                <LessonCard
                  key={l.id}
                  lesson={l}
                  complete={isDone(l.id)}
                  score={quizScores[l.id]}
                  resume={lastSection[l.id]}
                  index={i}
                />
              ))}
            </div>
          </>
        )}

        <ProgressTools />
      </div>
    </div>
  );
}

function LessonCard({
  lesson: l,
  complete,
  score,
  resume,
  index = 0,
}: {
  lesson: LessonSummary;
  complete: boolean;
  score?: { score: number; total: number };
  resume?: string;
  index?: number;
}) {
  const href = resume
    ? `/lesson/${l.id}?section=${encodeURIComponent(resume)}`
    : `/lesson/${l.id}`;
  return (
    <Link
      className={`lesson-card landing-card${complete ? " done" : ""}${l.comingSoon ? " coming-soon" : ""}`}
      href={href}
      style={{ ["--i" as string]: String(index) }}
    >
      <div className="card-num">{complete ? "✓" : l.number}</div>
      <div className="card-body">
        <h3>{l.title}</h3>
        <p>{l.short}</p>
        <div className="card-meta">
          <span className="tag">{l.minutes} min</span>
          {l.comingSoon && <span className="tag soon-tag">Coming soon</span>}
          {l.parts && !l.comingSoon && (
            <span className="tag">{l.parts.length} sections</span>
          )}
          {score && score.total > 0 && (
            <span className="tag">
              Quiz {score.score}/{score.total}
            </span>
          )}
          {l.tags
            .filter((t) => t !== "coming-soon")
            .slice(0, 1)
            .map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          {complete && <span className="tag done-tag">Done</span>}
        </div>
      </div>
    </Link>
  );
}
