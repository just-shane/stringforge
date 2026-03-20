import { useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { computeWalkBackTune } from "../../lib/tuning.ts";

export function WalkBackView() {
  const params = useSimStore((s) => s.params);
  const arrow = useSimStore((s) => s.arrow);
  const tuning = useSimStore((s) => s.tuning);

  const result = useMemo(
    () => computeWalkBackTune(params, arrow, tuning.restPosition),
    [params, arrow, tuning.restPosition],
  );

  const isAligned = Math.abs(result.centershotDrift) < 0.3;
  const statusColor = isAligned ? "var(--c-accent)" : "#f97316";

  // SVG dimensions
  const svgW = 200;
  const svgH = 200;
  const padL = 30;
  const padR = 10;
  const padT = 15;
  const padB = 25;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  // Scale
  const maxDist = 40;
  const maxOffset = Math.max(3, ...result.points.map((p) => Math.abs(p.horizontalOffset))) * 1.2;

  const toX = (offset: number) => padL + plotW / 2 + (offset / maxOffset) * (plotW / 2);
  const toY = (dist: number) => padT + (dist / maxDist) * plotH;

  return (
    <div>
      {/* Walk-back chart */}
      <div
        className="rounded-lg p-4 mb-3"
        style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
      >
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[300px] mx-auto">
          {/* Grid */}
          <line x1={padL + plotW / 2} y1={padT} x2={padL + plotW / 2} y2={padT + plotH} stroke="var(--c-accent)" strokeWidth="1" opacity="0.4" />
          {[10, 20, 30, 40].map((d) => (
            <g key={d}>
              <line x1={padL} y1={toY(d)} x2={padL + plotW} y2={toY(d)} stroke="var(--c-border)" strokeWidth="0.5" />
              <text x={padL - 4} y={toY(d) + 3} textAnchor="end" fill="var(--c-text-dim)" fontSize="7" fontFamily="monospace">
                {d}y
              </text>
            </g>
          ))}

          {/* Ideal vertical line */}
          <line x1={padL + plotW / 2} y1={padT} x2={padL + plotW / 2} y2={padT + plotH} stroke="var(--c-accent)" strokeWidth="1" strokeDasharray="4 2" opacity="0.3" />

          {/* Impact points */}
          {result.points.map((p, i) => (
            <circle
              key={i}
              cx={toX(p.horizontalOffset)}
              cy={toY(p.distance)}
              r="4"
              fill={statusColor}
              opacity="0.8"
              stroke="var(--c-bg)"
              strokeWidth="1"
            />
          ))}

          {/* Trend line (connect points) */}
          {result.points.length > 1 && (
            <polyline
              points={result.points.map((p) => `${toX(p.horizontalOffset)},${toY(p.distance)}`).join(" ")}
              fill="none"
              stroke={statusColor}
              strokeWidth="1"
              opacity="0.4"
            />
          )}

          {/* Axis labels */}
          <text x={padL + plotW / 2} y={svgH - 2} textAnchor="middle" fill="var(--c-text-dim)" fontSize="7" fontFamily="monospace">
            ← LEFT | RIGHT →
          </text>
        </svg>
      </div>

      {/* Diagnosis */}
      <div
        className="rounded-lg p-3 mb-3"
        style={{
          background: isAligned ? "var(--c-accent-dim)" : "var(--c-surface)",
          border: `1px solid ${isAligned ? "var(--c-accent)" : "var(--c-border)"}`,
        }}
      >
        <div className="text-[11px] font-mono font-medium mb-1" style={{ color: statusColor }}>
          {isAligned ? "CENTERSHOT ALIGNED" : "CENTERSHOT DRIFT DETECTED"}
        </div>
        <div className="text-[10px]" style={{ color: "var(--c-text-muted)" }}>
          {result.diagnosis}
        </div>
      </div>

      {/* Drift metric */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded p-2" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
          <div className="text-[8px] font-mono uppercase" style={{ color: "var(--c-text-dim)" }}>Drift Rate</div>
          <div className="text-[13px] font-mono font-bold" style={{ color: "var(--c-text)" }}>
            {Math.abs(result.centershotDrift).toFixed(1)}"
          </div>
          <div className="text-[7px] font-mono" style={{ color: "var(--c-text-faint)" }}>per 10 yards</div>
        </div>
        <div className="rounded p-2" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
          <div className="text-[8px] font-mono uppercase" style={{ color: "var(--c-text-dim)" }}>Direction</div>
          <div className="text-[13px] font-mono font-bold" style={{ color: "var(--c-text)" }}>
            {isAligned ? "None" : result.centershotDrift > 0 ? "Right" : "Left"}
          </div>
          <div className="text-[7px] font-mono" style={{ color: "var(--c-text-faint)" }}>drift direction</div>
        </div>
      </div>

      {/* Adjustment */}
      {!isAligned && (
        <div className="pl-2" style={{ borderLeft: "2px solid var(--c-accent)" }}>
          <div className="text-[9px] font-mono uppercase tracking-[1px] mb-1" style={{ color: "var(--c-text-dim)" }}>
            Adjustment
          </div>
          <div className="text-[10px]" style={{ color: "var(--c-text-muted)" }}>
            {result.adjustment}
          </div>
        </div>
      )}
    </div>
  );
}
