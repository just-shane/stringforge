import type { PhysicsResult } from "../../lib/physics.ts";

interface StatProps {
  label: string;
  value: string;
  unit: string;
  color?: string;
  sub?: string;
}

function Stat({ label, value, unit, color = "text-white", sub }: StatProps) {
  return (
    <div className="bg-black/30 rounded-md px-3 py-2 border border-neutral-800 flex-1 min-w-30">
      <div className="text-neutral-500 text-[9px] uppercase tracking-[1.5px] font-mono mb-0.5">
        {label}
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className={`${color} text-xl font-bold`}>{value}</span>
        <span className="text-neutral-500 text-[10px] font-mono">{unit}</span>
      </div>
      {sub && <div className="text-neutral-500 text-[9px] font-mono mt-0.5">{sub}</div>}
    </div>
  );
}

interface StatsBarProps {
  physics: PhysicsResult;
}

export function StatsBar({ physics }: StatsBarProps) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      <Stat
        label="Fundamental"
        value={physics.fundamentalFreq.toFixed(1)}
        unit="Hz"
        color="text-lime"
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
        color={physics.speedPenalty > 5 ? "text-red-400" : "text-amber-300"}
      />
      <Stat
        label="Vibe Reduction"
        value={physics.vibrationReduction.toFixed(0)}
        unit="%"
        color={physics.vibrationReduction > 50 ? "text-lime" : "text-amber-300"}
      />
      <Stat
        label="Balance"
        value={physics.balancePoint.toFixed(1)}
        unit="%"
        color={Math.abs(physics.balancePoint - 50) < 3 ? "text-lime" : "text-amber-300"}
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
