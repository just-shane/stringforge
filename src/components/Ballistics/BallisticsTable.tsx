import { useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { computeArrow, computeBallistics, ARROW_SHAFTS } from "../../lib/arrow.ts";
import type { PhysicsResult } from "../../lib/physics.ts";

const VB = { w: 300, h: 120 };
const PAD = { top: 18, right: 10, bottom: 20, left: 30 };
const PLOT = {
  x: PAD.left,
  y: PAD.top,
  w: VB.w - PAD.left - PAD.right,
  h: VB.h - PAD.top - PAD.bottom,
};

interface BallisticsTableProps {
  physics: PhysicsResult;
}

export function BallisticsTable({ physics }: BallisticsTableProps) {
  const arrow = useSimStore((s) => s.arrow);
  const params = useSimStore((s) => s.params);
  const windSpeed = useSimStore((s) => s.windSpeed);
  const theme = useSimStore((s) => s.theme);
  const c = theme.colors;

  const shaft = ARROW_SHAFTS.find((s) => s.id === arrow.shaft);

  const arrowResult = useMemo(
    () => computeArrow(arrow, physics.estimatedFPS, params.drawWeight, params.drawLength, params.bowType),
    [arrow, physics.estimatedFPS, params.drawWeight, params.drawLength, params.bowType],
  );

  const ballistics = useMemo(
    () => computeBallistics(arrowResult.totalWeight, arrowResult.launchSpeed, shaft?.outerDiameter ?? 0.246, windSpeed),
    [arrowResult.totalWeight, arrowResult.launchSpeed, shaft?.outerDiameter, windSpeed],
  );

  if (ballistics.trajectory.length === 0) return null;

  // Trajectory curve
  const maxDist = ballistics.trajectory[ballistics.trajectory.length - 1].distance;
  const maxDrop = Math.max(...ballistics.trajectory.map((p) => Math.abs(p.drop)), 1);

  const trajPath = ballistics.trajectory
    .map((p, i) => {
      const x = PLOT.x + (p.distance / maxDist) * PLOT.w;
      const y = PLOT.y + PLOT.h / 2 - (p.drop / maxDrop) * (PLOT.h / 2);
      return (i === 0 ? "M" : "L") + `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div>
      <span
        className="text-[11px] font-mono tracking-[2px] uppercase"
        style={{ color: "var(--c-accent)" }}
      >
        Trajectory & Ballistics
      </span>

      {/* Trajectory SVG */}
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full rounded-lg mt-2"
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border-light)",
        }}
      >
        <text x={VB.w / 2} y={12} textAnchor="middle" fill={c.textDim} fontSize="6" fontFamily="monospace">
          DROP TRAJECTORY — {arrowResult.launchSpeed.toFixed(0)} fps launch
        </text>

        {/* Zero line */}
        <line x1={PLOT.x} y1={PLOT.y + PLOT.h / 2} x2={PLOT.x + PLOT.w} y2={PLOT.y + PLOT.h / 2}
          stroke={c.border} strokeWidth={0.5} strokeDasharray="3,3" />

        {/* Distance markers */}
        {ballistics.trajectory.filter((_, i) => i % 2 === 0).map((p) => {
          const x = PLOT.x + (p.distance / maxDist) * PLOT.w;
          return (
            <text key={p.distance} x={x} y={PLOT.y + PLOT.h + 12} textAnchor="middle"
              fill={c.textFaint} fontSize="5" fontFamily="monospace">
              {p.distance}yd
            </text>
          );
        })}

        {/* Trajectory curve */}
        <path d={trajPath} fill="none" stroke={c.accent} strokeWidth={1.5} />

        {/* Drop annotations */}
        {ballistics.trajectory.filter((_, i) => i % 2 === 0).map((p) => {
          const x = PLOT.x + (p.distance / maxDist) * PLOT.w;
          const y = PLOT.y + PLOT.h / 2 - (p.drop / maxDrop) * (PLOT.h / 2);
          return (
            <g key={p.distance}>
              <circle cx={x} cy={y} r={2} fill={c.accent} opacity={0.6} />
              <text x={x} y={y - 5} textAnchor="middle" fill={c.textMuted} fontSize="4.5" fontFamily="monospace">
                {p.drop.toFixed(1)}"
              </text>
            </g>
          );
        })}

        {/* Axis labels */}
        <text x={4} y={PLOT.y + PLOT.h / 2} textAnchor="middle" fill={c.textDim} fontSize="5" fontFamily="monospace"
          transform={`rotate(-90, 4, ${PLOT.y + PLOT.h / 2})`}>
          Drop (in)
        </text>
      </svg>

      {/* Data table */}
      <div
        className="mt-2 rounded-lg overflow-hidden text-[9px] font-mono"
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border-light)",
        }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--c-border)" }}>
              {["Dist", "Drop", "Drift", "Vel", "KE", "Mom", "Time"].map((h) => (
                <th key={h} className="px-2 py-1.5 text-left" style={{ color: c.textDim }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ballistics.trajectory.map((p) => (
              <tr key={p.distance} style={{ borderBottom: "1px solid var(--c-border)" }}>
                <td className="px-2 py-1" style={{ color: c.text }}>{p.distance} yd</td>
                <td className="px-2 py-1" style={{ color: c.warn }}>{p.drop.toFixed(1)}"</td>
                <td className="px-2 py-1" style={{ color: windSpeed > 0 ? c.warn : c.textDim }}>
                  {p.drift.toFixed(1)}"
                </td>
                <td className="px-2 py-1" style={{ color: c.text }}>{p.velocity.toFixed(0)}</td>
                <td className="px-2 py-1" style={{ color: p.kineticEnergy < 40 ? c.danger : c.accent }}>
                  {p.kineticEnergy.toFixed(1)}
                </td>
                <td className="px-2 py-1" style={{ color: c.text }}>{p.momentum.toFixed(3)}</td>
                <td className="px-2 py-1" style={{ color: c.textDim }}>{p.flightTime.toFixed(3)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Range summary */}
      <div className="flex gap-2 mt-2">
        <div
          className="flex-1 rounded-md px-2 py-1.5"
          style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
        >
          <div className="text-[8px] uppercase tracking-wider" style={{ color: c.textDim }}>
            Effective Range
          </div>
          <div className="text-sm font-bold" style={{ color: c.accent }}>
            {ballistics.effectiveRange} <span className="text-[9px] font-normal" style={{ color: c.textDim }}>yd</span>
          </div>
          <div className="text-[8px]" style={{ color: c.textDim }}>KE &gt; 40 ft-lbs</div>
        </div>
        <div
          className="flex-1 rounded-md px-2 py-1.5"
          style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
        >
          <div className="text-[8px] uppercase tracking-wider" style={{ color: c.textDim }}>
            Max Range
          </div>
          <div className="text-sm font-bold" style={{ color: c.text }}>
            {ballistics.maxRange} <span className="text-[9px] font-normal" style={{ color: c.textDim }}>yd</span>
          </div>
          <div className="text-[8px]" style={{ color: c.textDim }}>KE &gt; 25 ft-lbs</div>
        </div>
      </div>
    </div>
  );
}
