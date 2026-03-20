import { useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { computeBareShaftTune } from "../../lib/tuning.ts";

export function BareShaftView() {
  const params = useSimStore((s) => s.params);
  const arrow = useSimStore((s) => s.arrow);

  const result = useMemo(() => computeBareShaftTune(params, arrow), [params, arrow]);

  const isMatched = result.direction === "matched";
  const statusColor = isMatched ? "var(--c-accent)" : "#f97316";

  // Target SVG visualization
  const cx = 80;
  const cy = 80;
  const fletchedX = cx - (result.direction === "right" ? result.groupSeparation * 4 : result.direction === "left" ? -result.groupSeparation * 4 : 0);
  const bareX = cx + (result.direction === "right" ? result.groupSeparation * 4 : result.direction === "left" ? -result.groupSeparation * 4 : 0);
  const fletchedR = Math.max(3, result.fletchedGroupSize * 2);
  const bareR = Math.max(4, result.bareGroupSize * 2);

  return (
    <div>
      {/* Target visualization */}
      <div
        className="rounded-lg p-4 mb-3"
        style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
      >
        <svg viewBox="0 0 160 160" className="w-full max-w-[240px] mx-auto">
          {/* Target rings */}
          {[50, 40, 30, 20, 10].map((r) => (
            <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="var(--c-border)" strokeWidth="0.5" />
          ))}
          <line x1="20" y1="80" x2="140" y2="80" stroke="var(--c-border)" strokeWidth="0.3" />
          <line x1="80" y1="20" x2="80" y2="140" stroke="var(--c-border)" strokeWidth="0.3" />

          {/* Fletched group */}
          <circle cx={fletchedX} cy={cy} r={fletchedR} fill="var(--c-accent)" opacity="0.3" stroke="var(--c-accent)" strokeWidth="1" />
          <text x={fletchedX} y={cy - fletchedR - 5} textAnchor="middle" fill="var(--c-accent)" fontSize="7" fontFamily="monospace">FLETCHED</text>

          {/* Bare shaft group */}
          <circle cx={bareX} cy={cy} r={bareR} fill="#f97316" opacity="0.3" stroke="#f97316" strokeWidth="1" />
          <text x={bareX} y={cy - bareR - 5} textAnchor="middle" fill="#f97316" fontSize="7" fontFamily="monospace">BARE</text>

          {/* Separation indicator */}
          {!isMatched && (
            <>
              <line x1={fletchedX} y1={cy + 20} x2={bareX} y2={cy + 20} stroke="var(--c-text-dim)" strokeWidth="0.5" markerEnd="url(#arrowR)" markerStart="url(#arrowL)" />
              <text x={cx} y={cy + 28} textAnchor="middle" fill="var(--c-text-dim)" fontSize="7" fontFamily="monospace">
                {result.groupSeparation.toFixed(1)}"
              </text>
              <defs>
                <marker id="arrowR" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                  <path d="M0,0 L4,2 L0,4" fill="var(--c-text-dim)" />
                </marker>
                <marker id="arrowL" markerWidth="4" markerHeight="4" refX="1" refY="2" orient="auto">
                  <path d="M4,0 L0,2 L4,4" fill="var(--c-text-dim)" />
                </marker>
              </defs>
            </>
          )}
        </svg>
      </div>

      {/* Assessment */}
      <div
        className="rounded-lg p-3 mb-3"
        style={{
          background: isMatched ? "var(--c-accent-dim)" : "var(--c-surface)",
          border: `1px solid ${isMatched ? "var(--c-accent)" : "var(--c-border)"}`,
        }}
      >
        <div className="text-[11px] font-mono font-medium mb-1" style={{ color: statusColor }}>
          {isMatched ? "SPINE MATCHED" : `BARE SHAFTS ${result.direction.toUpperCase()}`}
        </div>
        <div className="text-[10px]" style={{ color: "var(--c-text-muted)" }}>
          {result.spineAssessment}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <MetricCard label="Group Sep." value={`${result.groupSeparation.toFixed(1)}"`} sub="at 20 yards" />
        <MetricCard label="Fletched Grp" value={`${result.fletchedGroupSize.toFixed(1)}"`} sub="estimated" />
        <MetricCard label="Bare Grp" value={`${result.bareGroupSize.toFixed(1)}"`} sub="estimated" />
        <MetricCard label="Direction" value={result.direction === "matched" ? "Center" : result.direction.toUpperCase()} sub="RH shooter" />
      </div>

      {/* Adjustment */}
      {!isMatched && (
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

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded p-2" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
      <div className="text-[8px] font-mono uppercase" style={{ color: "var(--c-text-dim)" }}>{label}</div>
      <div className="text-[13px] font-mono font-bold" style={{ color: "var(--c-text)" }}>{value}</div>
      <div className="text-[7px] font-mono" style={{ color: "var(--c-text-faint)" }}>{sub}</div>
    </div>
  );
}
