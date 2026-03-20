import { useMemo } from "react";
import { useSimStore } from "../../store.ts";

const VB = { w: 600, h: 120 };
const MARGIN = VB.w * 0.08;
const USABLE = VB.w - 2 * MARGIN;

export function CrossSectionView() {
  const strandCount = useSimStore((s) => s.params.strandCount);
  const weights = useSimStore((s) => s.weights);

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

  return (
    <div>
      <span className="text-lime text-[11px] font-mono tracking-[2px] uppercase">
        Top-Down Cross Section
      </span>
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full bg-black/30 rounded-lg border border-neutral-800 mt-2"
      >
        {/* Strands */}
        {strands.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#888" strokeWidth={0.5} opacity={0.6} />
        ))}

        {/* Weight clamps */}
        {weights.map((w, i) => {
          const x = MARGIN + (w.position / 100) * USABLE;
          const halfW = 5 + w.mass / 10;
          const color = w.type === "brass" ? "#C5943A" : "#7A8B99";
          const bgFill =
            w.type === "brass" ? "rgba(197,148,58,0.3)" : "rgba(122,139,153,0.3)";
          return (
            <g key={i}>
              <rect
                x={x - halfW}
                y={VB.h / 2 - 8}
                width={halfW * 2}
                height={16}
                rx={2}
                fill={bgFill}
                stroke={color}
                strokeWidth={0.8}
              />
              <line
                x1={x}
                y1={VB.h / 2 - 10}
                x2={x}
                y2={VB.h / 2 + 10}
                stroke={color}
                strokeWidth={0.3}
                strokeDasharray="1,1"
              />
            </g>
          );
        })}

        {/* Cam attachment points */}
        <circle cx={MARGIN} cy={VB.h / 2} r={4} fill="none" stroke="#333" strokeWidth={1.5} />
        <circle
          cx={MARGIN + USABLE}
          cy={VB.h / 2}
          r={4}
          fill="none"
          stroke="#333"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
}
