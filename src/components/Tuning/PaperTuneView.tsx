import { useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { computePaperTune } from "../../lib/tuning.ts";
import type { TearDirection } from "../../lib/tuning.ts";

const TEAR_COLORS: Record<TearDirection, string> = {
  bullet: "var(--c-accent)",
  left: "#ef4444",
  right: "#f97316",
  high: "#eab308",
  low: "#8b5cf6",
  "high-left": "#ec4899",
  "high-right": "#f59e0b",
  "low-left": "#6366f1",
  "low-right": "#a855f7",
};

export function PaperTuneView() {
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);
  const arrow = useSimStore((s) => s.arrow);
  const tuning = useSimStore((s) => s.tuning);

  const result = useMemo(
    () =>
      computePaperTune(
        params,
        weights,
        arrow,
        tuning.nockHeight,
        tuning.restPosition,
        tuning.shooterHand,
      ),
    [params, weights, arrow, tuning],
  );

  const isBullet = result.tearDirection === "bullet";
  const tearColor = TEAR_COLORS[result.tearDirection];

  // Paper hole visualization
  const cx = 80;
  const cy = 80;
  const tearScale = 30;
  const angle = result.nockTravelAngle * (Math.PI / 180);
  const tearX = cx + Math.cos(angle) * result.tearMagnitude * tearScale;
  const tearY = cy - Math.sin(angle) * result.tearMagnitude * tearScale;

  return (
    <div>
      {/* Paper hole SVG */}
      <div
        className="rounded-lg p-4 mb-3"
        style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
      >
        <svg viewBox="0 0 160 160" className="w-full max-w-[240px] mx-auto">
          {/* Paper background */}
          <rect x="10" y="10" width="140" height="140" rx="4" fill="var(--c-bg)" stroke="var(--c-border)" strokeWidth="1" />
          {/* Crosshairs */}
          <line x1="80" y1="20" x2="80" y2="140" stroke="var(--c-border)" strokeWidth="0.5" strokeDasharray="4 3" />
          <line x1="20" y1="80" x2="140" y2="80" stroke="var(--c-border)" strokeWidth="0.5" strokeDasharray="4 3" />

          {/* Point hole (center) */}
          <circle cx={cx} cy={cy} r="4" fill="var(--c-text-dim)" opacity="0.5" />

          {/* Nock-end tear */}
          {!isBullet && (
            <>
              <line x1={cx} y1={cy} x2={tearX} y2={tearY} stroke={tearColor} strokeWidth="2" opacity="0.6" />
              <ellipse
                cx={tearX}
                cy={tearY}
                rx={3 + result.tearMagnitude * 4}
                ry={2 + result.tearMagnitude * 2}
                fill={tearColor}
                opacity="0.8"
                transform={`rotate(${-result.nockTravelAngle}, ${tearX}, ${tearY})`}
              />
            </>
          )}

          {/* Bullet hole indicator */}
          {isBullet && (
            <circle cx={cx} cy={cy} r="6" fill="none" stroke={tearColor} strokeWidth="2" />
          )}

          {/* Labels */}
          <text x="80" y="15" textAnchor="middle" fill="var(--c-text-dim)" fontSize="7" fontFamily="monospace">HIGH</text>
          <text x="80" y="155" textAnchor="middle" fill="var(--c-text-dim)" fontSize="7" fontFamily="monospace">LOW</text>
          <text x="15" y="83" textAnchor="middle" fill="var(--c-text-dim)" fontSize="7" fontFamily="monospace">L</text>
          <text x="145" y="83" textAnchor="middle" fill="var(--c-text-dim)" fontSize="7" fontFamily="monospace">R</text>
        </svg>
      </div>

      {/* Tear description */}
      <div
        className="rounded-lg p-3 mb-3"
        style={{
          background: isBullet ? "var(--c-accent-dim)" : "color-mix(in srgb, var(--c-surface) 90%, #ef4444)",
          border: `1px solid ${isBullet ? "var(--c-accent)" : "var(--c-border)"}`,
        }}
      >
        <div className="text-[11px] font-mono font-medium mb-1" style={{ color: tearColor }}>
          {result.tearDirection.toUpperCase()} {isBullet ? "HOLE" : "TEAR"}
        </div>
        <div className="text-[10px]" style={{ color: "var(--c-text-muted)" }}>
          {result.tearDescription}
        </div>
        {!isBullet && (
          <div className="text-[9px] font-mono mt-1" style={{ color: "var(--c-text-dim)" }}>
            Severity: {(result.tearMagnitude * 100).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Causes */}
      {result.causes.length > 0 && (
        <div className="mb-3">
          <div className="text-[9px] font-mono uppercase tracking-[1px] mb-1.5" style={{ color: "var(--c-text-dim)" }}>
            {isBullet ? "Assessment" : "Probable Causes"}
          </div>
          {result.causes.map((c, i) => (
            <div key={i} className="text-[10px] mb-1 pl-2" style={{ color: "var(--c-text-muted)", borderLeft: `2px solid ${tearColor}` }}>
              {c}
            </div>
          ))}
        </div>
      )}

      {/* Adjustments */}
      {result.adjustments.length > 0 && (
        <div>
          <div className="text-[9px] font-mono uppercase tracking-[1px] mb-1.5" style={{ color: "var(--c-text-dim)" }}>
            Recommended Adjustments
          </div>
          {result.adjustments.map((a, i) => (
            <div key={i} className="text-[10px] mb-1 pl-2" style={{ color: "var(--c-text-muted)", borderLeft: "2px solid var(--c-accent)" }}>
              {a}
            </div>
          ))}
        </div>
      )}

      {/* Contribution bars */}
      <div className="mt-3 flex gap-3">
        <ContribBar label="Spine" value={result.spineContribution} />
        <ContribBar label="Nock Ht" value={result.nockHeightContribution} />
      </div>
    </div>
  );
}

function ContribBar({ label, value }: { label: string; value: number }) {
  const pct = Math.abs(value) * 50;
  const isPositive = value > 0;
  return (
    <div className="flex-1">
      <div className="text-[8px] font-mono uppercase mb-1" style={{ color: "var(--c-text-dim)" }}>
        {label}
      </div>
      <div className="h-2 rounded-full relative" style={{ background: "var(--c-bg)" }}>
        <div
          className="absolute top-0 h-full rounded-full"
          style={{
            background: Math.abs(value) < 0.15 ? "var(--c-accent)" : "#ef4444",
            width: `${Math.max(4, pct)}%`,
            left: isPositive ? "50%" : `${50 - pct}%`,
          }}
        />
        <div className="absolute top-0 left-1/2 w-px h-full" style={{ background: "var(--c-text-dim)" }} />
      </div>
      <div className="flex justify-between text-[7px] font-mono" style={{ color: "var(--c-text-faint)" }}>
        <span>{label === "Spine" ? "Stiff" : "Low"}</span>
        <span>{label === "Spine" ? "Weak" : "High"}</span>
      </div>
    </div>
  );
}
