import { useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { getDrawCurvePoints } from "../../lib/physics.ts";
import type { PhysicsResult } from "../../lib/physics.ts";

const VB = { w: 300, h: 140 };
const PAD = { top: 18, right: 15, bottom: 22, left: 32 };
const PLOT = {
  x: PAD.left,
  y: PAD.top,
  w: VB.w - PAD.left - PAD.right,
  h: VB.h - PAD.top - PAD.bottom,
};

interface DrawCurveProps {
  physics: PhysicsResult;
}

export function DrawCurve({ physics }: DrawCurveProps) {
  const params = useSimStore((s) => s.params);
  const theme = useSimStore((s) => s.theme);
  const c = theme.colors;

  const points = useMemo(
    () => getDrawCurvePoints(params.bowType, params.drawWeight, params.drawLength),
    [params.bowType, params.drawWeight, params.drawLength],
  );

  const maxDraw = params.drawLength;
  const maxForce = params.drawWeight * 1.1;

  // Build SVG path for the curve
  const pathD = points
    .map((p, i) => {
      const x = PLOT.x + (p.draw / maxDraw) * PLOT.w;
      const y = PLOT.y + PLOT.h - (p.force / maxForce) * PLOT.h;
      return (i === 0 ? "M" : "L") + `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Area fill path
  const areaD =
    pathD +
    ` L${(PLOT.x + PLOT.w).toFixed(1)},${(PLOT.y + PLOT.h).toFixed(1)}` +
    ` L${PLOT.x.toFixed(1)},${(PLOT.y + PLOT.h).toFixed(1)} Z`;

  // Brace height marker
  const braceX = PLOT.x + (params.braceHeight / maxDraw) * PLOT.w;

  // Grid lines
  const yTicks = 5;
  const xTicks = 5;

  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      className="w-full rounded-lg"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border-light)",
      }}
    >
      {/* Title */}
      <text
        x={VB.w / 2} y={12} textAnchor="middle"
        fill={c.textDim} fontSize="6" fontFamily="monospace"
      >
        FORCE-DRAW CURVE — {physics.energy.storedEnergy.toFixed(1)} ft-lbs stored
      </text>

      {/* Grid */}
      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const y = PLOT.y + (i / yTicks) * PLOT.h;
        const val = maxForce * (1 - i / yTicks);
        return (
          <g key={`y${i}`}>
            <line x1={PLOT.x} y1={y} x2={PLOT.x + PLOT.w} y2={y}
              stroke={c.border} strokeWidth={0.3} />
            <text x={PLOT.x - 3} y={y + 2} textAnchor="end"
              fill={c.textFaint} fontSize="5" fontFamily="monospace">
              {val.toFixed(0)}
            </text>
          </g>
        );
      })}
      {Array.from({ length: xTicks + 1 }, (_, i) => {
        const x = PLOT.x + (i / xTicks) * PLOT.w;
        const val = (i / xTicks) * maxDraw;
        return (
          <g key={`x${i}`}>
            <line x1={x} y1={PLOT.y} x2={x} y2={PLOT.y + PLOT.h}
              stroke={c.border} strokeWidth={0.3} />
            <text x={x} y={PLOT.y + PLOT.h + 10} textAnchor="middle"
              fill={c.textFaint} fontSize="5" fontFamily="monospace">
              {val.toFixed(0)}"
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill={c.accentGlow} />

      {/* Brace height marker */}
      <line x1={braceX} y1={PLOT.y} x2={braceX} y2={PLOT.y + PLOT.h}
        stroke={c.warn} strokeWidth={0.8} strokeDasharray="3,2" />
      <text x={braceX} y={PLOT.y + PLOT.h + 18} textAnchor="middle"
        fill={c.warn} fontSize="4.5" fontFamily="monospace">
        BRACE
      </text>

      {/* Curve */}
      <path d={pathD} fill="none" stroke={c.accent} strokeWidth={1.5} />

      {/* Axis labels */}
      <text x={PLOT.x + PLOT.w / 2} y={VB.h - 2} textAnchor="middle"
        fill={c.textDim} fontSize="5" fontFamily="monospace">
        Draw (inches)
      </text>
      <text x={4} y={PLOT.y + PLOT.h / 2} textAnchor="middle"
        fill={c.textDim} fontSize="5" fontFamily="monospace"
        transform={`rotate(-90, 4, ${PLOT.y + PLOT.h / 2})`}>
        Force (lbs)
      </text>
    </svg>
  );
}
