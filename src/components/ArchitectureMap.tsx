"use client";

import { useMemo } from "react";
import { ARCH_EDGES, ARCH_NODES, ARCH_VIEW } from "@/lib/architecture";
import { useProgress } from "@/context/ProgressContext";

const GROUP_FILL: Record<string, string> = {
  edge: "var(--blue-soft)",
  compute: "var(--accent-soft)",
  data: "var(--green-soft)",
  net: "var(--blue-soft)",
  ops: "color-mix(in srgb, var(--yellow) 22%, var(--bg-soft))",
  identity: "var(--red-soft)",
};

const NW = 64; // node half-width ≈ 32 → full width 64
const NH = 28;

export function ArchitectureMap() {
  const { completed, completedCount, total } = useProgress();

  const unlocked = useMemo(() => {
    const set = new Set<string>();
    for (const n of ARCH_NODES) {
      if (n.unlocksWith === "cloud-fundamentals") {
        if (completed["cloud-fundamentals"] || completedCount > 0) set.add(n.id);
      } else if (completed[n.unlocksWith]) {
        set.add(n.id);
      }
    }
    set.add("users");
    return set;
  }, [completed, completedCount]);

  const edgeOn = (from: string, to: string, unlocksWith: string) =>
    unlocked.has(from) && unlocked.has(to) && !!completed[unlocksWith];

  const byId = useMemo(() => {
    const m = new Map(ARCH_NODES.map((n) => [n.id, n]));
    return m;
  }, []);

  return (
    <section className="arch-map" aria-label="Architecture so far">
      <div className="arch-map-head">
        <h2>Architecture so far</h2>
        <p>
          Services unlock as you complete lessons ({completedCount}/{total}).
          Scroll sideways on small screens.
        </p>
      </div>

      <div className="arch-map-scroll" tabIndex={0} role="region" aria-label="Architecture diagram">
        <svg
          viewBox={`0 0 ${ARCH_VIEW.width} ${ARCH_VIEW.height}`}
          role="img"
          aria-label="Growing AWS architecture diagram"
          className="arch-map-svg"
        >
          {/* VPC region */}
          <rect
            x={16}
            y={78}
            width={300}
            height={190}
            rx={12}
            className="arch-vpc"
            fill="none"
            stroke="currentColor"
            strokeOpacity={unlocked.has("vpc") ? 0.32 : 0.12}
            strokeDasharray={unlocked.has("vpc") ? undefined : "5 4"}
          />
          <text x={28} y={96} className="arch-vpc-label" fontSize="11" fontWeight="650">
            VPC
          </text>

          {/* Edges under nodes */}
          {ARCH_EDGES.map((e) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const on = edgeOn(e.from, e.to, e.unlocksWith);
            return (
              <line
                key={`${e.from}-${e.to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                className={on ? "arch-edge on" : "arch-edge"}
                stroke="currentColor"
              />
            );
          })}

          {ARCH_NODES.map((n) => {
            const on = unlocked.has(n.id);
            const hw = NW / 2;
            const hh = NH / 2;
            return (
              <g
                key={n.id}
                className={on ? "arch-node on" : "arch-node"}
              >
                <title>
                  {n.label}
                  {on ? " — unlocked" : " — locked"}
                </title>
                <rect
                  x={n.x - hw}
                  y={n.y - hh}
                  width={NW}
                  height={NH}
                  rx={8}
                  fill={
                    on
                      ? GROUP_FILL[n.group] || "var(--bg-soft)"
                      : "var(--bg-elevated)"
                  }
                  stroke="currentColor"
                  strokeOpacity={on ? 0.35 : 0.14}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={on ? 700 : 500}
                  fill="currentColor"
                  opacity={on ? 1 : 0.42}
                >
                  {n.short}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="arch-legend">
        <li>
          <span className="arch-dot on" /> Unlocked
        </li>
        <li>
          <span className="arch-dot" /> Locked
        </li>
      </ul>
    </section>
  );
}
