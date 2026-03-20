import { useSimStore } from "../../store.ts";
import type { PhysicsResult } from "../../lib/physics.ts";

const VB = { w: 300, h: 100 };
const BAR_W = 28;
const GAP = 6;
const START_X = 20;

interface HarmonicSpectrumProps {
  physics: PhysicsResult;
}

export function HarmonicSpectrum({ physics }: HarmonicSpectrumProps) {
  const theme = useSimStore((s) => s.theme);
  const c = theme.colors;

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
        x={VB.w / 2} y={10} textAnchor="middle"
        fill={c.textDim} fontSize="6" fontFamily="monospace"
      >
        HARMONIC MODE AMPLITUDES
      </text>

      {physics.harmonics.map((h, i) => {
        const x = START_X + i * (BAR_W + GAP);
        const maxH = VB.h - 30;
        const barH = h.amplitude * maxH;
        const y = VB.h - 15 - barH;
        const hue = 80 + h.damping * 280;

        return (
          <g key={i}>
            <rect
              x={x} y={y} width={BAR_W} height={barH} rx={2}
              fill={`hsla(${hue}, 70%, 50%, 0.7)`}
              stroke={`hsla(${hue}, 70%, 60%, 0.9)`}
              strokeWidth={0.5}
            />
            <text
              x={x + BAR_W / 2} y={VB.h - 4} textAnchor="middle"
              fill={c.textDim} fontSize="6" fontFamily="monospace"
            >
              {h.mode}
            </text>
            <text
              x={x + BAR_W / 2} y={y - 3} textAnchor="middle"
              fill={c.textMuted} fontSize="5" fontFamily="monospace"
            >
              {(h.amplitude * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
