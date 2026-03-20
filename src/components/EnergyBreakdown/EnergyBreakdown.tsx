import { useSimStore } from "../../store.ts";
import type { PhysicsResult } from "../../lib/physics.ts";

const VB = { w: 300, h: 100 };

interface EnergyBreakdownProps {
  physics: PhysicsResult;
}

interface Segment {
  label: string;
  value: number;
  color: string;
}

export function EnergyBreakdown({ physics }: EnergyBreakdownProps) {
  const theme = useSimStore((s) => s.theme);
  const c = theme.colors;
  const e = physics.energy;

  if (e.storedEnergy <= 0) return null;

  const segments: Segment[] = [
    { label: "Arrow KE", value: e.arrowKE, color: c.accent },
    { label: "Limb KE", value: e.limbKE, color: c.warn },
    { label: "String KE", value: e.stringKE, color: c.brass },
    { label: "Hysteresis", value: e.hysteresisLoss, color: c.danger },
    { label: "Vibration", value: e.vibrationLoss, color: c.tungsten },
    { label: "Sound", value: e.soundLoss, color: c.textDim },
  ];

  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const barY = 24;
  const barH = 16;
  const barX = 20;
  const barW = VB.w - 40;

  let xOffset = 0;

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className="w-full rounded-lg"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border-light)",
      }}
    >
      <text
        x={VB.w / 2} y={12} textAnchor="middle"
        fill={c.textDim} fontSize="6" fontFamily="monospace"
      >
        ENERGY DISTRIBUTION — {e.storedEnergy.toFixed(1)} ft-lbs total
      </text>

      {/* Stacked bar */}
      {segments.map((seg) => {
        const w = (seg.value / total) * barW;
        const x = barX + xOffset;
        xOffset += w;
        return (
          <rect
            key={seg.label}
            x={x} y={barY} width={Math.max(0.5, w)} height={barH} rx={0}
            fill={seg.color} opacity={0.7}
          />
        );
      })}
      <rect x={barX} y={barY} width={barW} height={barH} rx={2}
        fill="none" stroke={c.borderLight} strokeWidth={0.5} />

      {/* Legend */}
      {segments.map((seg, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const lx = 20 + col * 95;
        const ly = 56 + row * 20;
        const pct = total > 0 ? (seg.value / total) * 100 : 0;
        return (
          <g key={seg.label}>
            <rect x={lx} y={ly} width={6} height={6} rx={1} fill={seg.color} opacity={0.8} />
            <text x={lx + 10} y={ly + 5.5}
              fill={c.textMuted} fontSize="5.5" fontFamily="monospace">
              {seg.label}: {seg.value.toFixed(1)} ({pct.toFixed(0)}%)
            </text>
          </g>
        );
      })}
    </svg>
  );
}
