"use client";

import { useMemo } from "react";
import { ARCH_EDGES, ARCH_NODES } from "@/lib/architecture";
import { useProgress } from "@/context/ProgressContext";

const GROUP_FILL: Record<string, string> = {
  edge: "var(--blue-soft)",
  compute: "var(--accent-soft)",
  data: "var(--green-soft)",
  net: "var(--blue-soft)",
  ops: "var(--yellow)",
  identity: "var(--red-soft)",
};

export function ArchitectureMap() {
  const { completed, completedCount, total } = useProgress();

  const unlocked = useMemo(() => {
    const set = new Set<string>();
    for (const n of ARCH_NODES) {
      if (completed[n.unlocksWith] || n.unlocksWith === "cloud-fundamentals") {
        // fundamentals always show Users once any progress or always show locked style until L1 done
        if (n.unlocksWith === "cloud-fundamentals") {
          if (completed["cloud-fundamentals"] || completedCount > 0) set.add(n.id);
        } else if (completed[n.unlocksWith]) {
          set.add(n.id);
        }
      }
    }
    // Always show users node as outline
    set.add("users");
    return set;
  }, [completed, completedCount]);

  const edgeOn = (from: string, to: string, unlocksWith: string) =>
    unlocked.has(from) && unlocked.has(to) && !!completed[unlocksWith];

  return (
    <section className="arch-map" aria-label="Architecture so far">
      <div className="arch-map-head">
        <h2>Architecture so far</h2>
        <p>
          Services unlock as you complete lessons ({completedCount}/{total}).
        </p>
      </div>
      <div className="arch-map-svg-wrap">
        <svg
          viewBox="0 0 600 400"
          role="img"
          aria-label="Growing AWS architecture diagram"
          className="arch-map-svg"
        >
          <rect
            x="20"
            y="90"
            width="340"
            height="270"
            rx="16"
            className="arch-vpc"
            fill="none"
            stroke="currentColor"
            strokeOpacity={unlocked.has("vpc") ? 0.35 : 0.12}
            strokeDasharray={unlocked.has("vpc") ? undefined : "6 4"}
          />
          <text x="36" y="112" className="arch-vpc-label" fontSize="12">
            VPC
          </text>

          {ARCH_EDGES.map((e) => {
            const a = ARCH_NODES.find((n) => n.id === e.from);
            const b = ARCH_NODES.find((n) => n.id === e.to);
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
            return (
              <g key={n.id} className={on ? "arch-node on" : "arch-node"}>
                <rect
                  x={n.x - 44}
                  y={n.y - 18}
                  width={88}
                  height={36}
                  rx={10}
                  fill={on ? GROUP_FILL[n.group] || "var(--bg-soft)" : "var(--bg-elevated)"}
                  stroke="currentColor"
                  strokeOpacity={on ? 0.35 : 0.12}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight={on ? 700 : 500}
                  fill="currentColor"
                  opacity={on ? 1 : 0.4}
                >
                  {n.label}
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
