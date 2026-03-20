import { useMemo } from "react";
import { useSimStore } from "../../store.ts";

const VB = { w: 600, h: 120 };
const MARGIN = VB.w * 0.08;
const USABLE = VB.w - 2 * MARGIN;

export function CrossSectionView() {
  const strandCount = useSimStore((s) => s.params.strandCount);
  const weights = useSimStore((s) => s.weights);
  const theme = useSimStore((s) => s.theme);

  const strands = useMemo(() => {
    const maxStrands = Math.min(strandCount, 28);
    const bundleSpread = Math.min(30, strandCount * 0.8);
    const paths: string[] = [];

    for (let si = 0; si < maxStrands; si++) {
      const offset = (si / (maxStrands - 1) - 0.5) * bundleSpread;
      const midY = VB.h / 2 + offset;
      let d = `M ${MARGIN},${VB.h / 2}`;

      const weightPositions = weights.map((w) => ({
        x: MARGIN + (w.position / 100) * USABLE,
        squeeze: Math.min(0.3, w.mass / 80),
      }));

      for (let x = MARGIN; x <= MARGIN + USABLE; x += 2) {
        let y = midY;
        weightPositions.forEach((wp) => {
          const dist = Math.abs(x - wp.x);
          if (dist < 20) {
            const squeeze = 1 - wp.squeeze * Math.exp(-(dist * dist) / 100);
            y = VB.h / 2 + (y - VB.h / 2) * squeeze;
          }
        });
        const fromLeft = (x - MARGIN) / USABLE;
        const endSqueeze = Math.min(fromLeft * 8, (1 - fromLeft) * 8, 1);
        y = VB.h / 2 + (y - VB.h / 2) * endSqueeze;
        d += ` L${x.toFixed(0)},${y.toFixed(1)}`;
      }
      d += ` L${MARGIN + USABLE},${VB.h / 2}`;
      paths.push(d);
    }
    return paths;
  }, [strandCount, weights]);

  const c = theme.colors;

  return (
    <div>
      <span
        className="text-[11px] font-mono tracking-[2px] uppercase"
        style={{ color: "var(--c-accent)" }}
      >
        Top-Down Cross Section
      </span>
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full rounded-lg mt-2"
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border-light)",
        }}
      >
        {/* Strands */}
        {strands.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={c.string} strokeWidth={0.5} opacity={0.5} />
        ))}

        {/* Weight clamps */}
        {weights.map((w, i) => {
          const x = MARGIN + (w.position / 100) * USABLE;
          const halfW = 5 + w.mass / 10;
          const color = w.type === "brass" ? c.brass : c.tungsten;
          return (
            <g key={i}>
              <rect
                x={x - halfW} y={VB.h / 2 - 8} width={halfW * 2} height={16} rx={2}
                fill={`color-mix(in srgb, ${color} 30%, transparent)`}
                stroke={color} strokeWidth={0.8}
              />
              <line
                x1={x} y1={VB.h / 2 - 10} x2={x} y2={VB.h / 2 + 10}
                stroke={color} strokeWidth={0.3} strokeDasharray="1,1"
              />
            </g>
          );
        })}

        {/* Cam attachment points */}
        <circle cx={MARGIN} cy={VB.h / 2} r={4} fill="none" stroke={c.borderLight} strokeWidth={1.5} />
        <circle cx={MARGIN + USABLE} cy={VB.h / 2} r={4} fill="none" stroke={c.borderLight} strokeWidth={1.5} />
      </svg>
    </div>
  );
}
