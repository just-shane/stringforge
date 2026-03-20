import type { PhysicsResult } from "../../lib/physics.ts";

interface StatProps {
  label: string;
  value: string;
  unit: string;
  colorVar?: string;
  sub?: string;
}

function Stat({ label, value, unit, colorVar = "var(--c-text)", sub }: StatProps) {
  return (
    <div
      className="rounded-md px-3 py-2 flex-1 min-w-30"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
      role="status"
      aria-label={`${label}: ${value} ${unit}${sub ? `, ${sub}` : ""}`}
    >
      <div
        className="text-[9px] uppercase tracking-[1.5px] font-mono mb-0.5"
        style={{ color: "var(--c-text-dim)" }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-xl font-bold" style={{ color: colorVar }}>
          {value}
        </span>
        <span className="text-[10px] font-mono" style={{ color: "var(--c-text-dim)" }}>
          {unit}
        </span>
      </div>
      {sub && (
        <div className="text-[9px] font-mono mt-0.5" style={{ color: "var(--c-text-dim)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

interface StatsBarProps {
  physics: PhysicsResult;
}

export function StatsBar({ physics }: StatsBarProps) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap" role="region" aria-label="Key metrics dashboard">
      <Stat
        label="Est. Speed"
        value={physics.estimatedFPS.toFixed(0)}
        unit="fps"
        colorVar="var(--c-accent)"
        sub={`@350gr arrow · ${physics.energy.efficiency * 100}% eff.`}
      />
      <Stat
        label="Stored Energy"
        value={physics.energy.storedEnergy.toFixed(1)}
        unit="ft-lbs"
        sub={`Arrow KE: ${physics.energy.arrowKE.toFixed(1)} ft-lbs`}
      />
      <Stat
        label="Fundamental"
        value={physics.fundamentalFreq.toFixed(1)}
        unit="Hz"
      />
      <Stat
        label="Total Mass"
        value={physics.totalMassGrains.toFixed(1)}
        unit="gr"
        sub={`String: ${physics.stringMassGrains.toFixed(1)} + Weights: ${physics.weightMassGrains.toFixed(1)}`}
      />
      <Stat
        label="Speed Loss"
        value={`-${physics.speedPenalty.toFixed(1)}`}
        unit="fps"
        colorVar={physics.speedPenalty > 5 ? "var(--c-danger)" : "var(--c-warn)"}
      />
      <Stat
        label="Vibe Reduction"
        value={physics.vibrationReduction.toFixed(0)}
        unit="%"
        colorVar={physics.vibrationReduction > 50 ? "var(--c-accent)" : "var(--c-warn)"}
      />
      <Stat
        label="Balance"
        value={physics.balancePoint.toFixed(1)}
        unit="%"
        colorVar={
          Math.abs(physics.balancePoint - 50) < 3 ? "var(--c-accent)" : "var(--c-warn)"
        }
        sub={
          Math.abs(physics.balancePoint - 50) < 3
            ? "CENTERED"
            : physics.balancePoint < 50
              ? "CAM-BIASED"
              : "NOCK-BIASED"
        }
      />
    </div>
  );
}
