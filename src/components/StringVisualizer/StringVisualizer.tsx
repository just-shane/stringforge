import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { useSimStore } from "../../store.ts";
import type { PhysicsResult } from "../../lib/physics.ts";
import { DraggableWeight } from "./DraggableWeight.tsx";

const VB = { w: 600, h: 200 };
const MARGIN = VB.w * 0.08;
const USABLE = VB.w - 2 * MARGIN;
const CAM_R = 14;
const CAM_LX = MARGIN;
const CAM_RX = VB.w - MARGIN;
const CAM_Y = VB.h * 0.5;

interface StringVisualizerProps {
  physics: PhysicsResult;
}

export function StringVisualizer({ physics }: StringVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [time, setTime] = useState(0);
  const animating = useSimStore((s) => s.animating);
  const setAnimating = useSimStore((s) => s.setAnimating);
  const weights = useSimStore((s) => s.weights);
  const updateWeight = useSimStore((s) => s.updateWeight);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!animating) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }
    let t = time;
    const tick = () => {
      t += 0.02;
      setTime(t);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animating]);

  const stringPoints = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const midY = VB.h * 0.5;
    const maxSag = VB.h * 0.06;

    for (let i = 0; i <= 200; i++) {
      const frac = i / 200;
      const x = MARGIN + frac * USABLE;
      const sag = -maxSag * (1 - (2 * frac - 1) ** 2);

      let vibration = 0;
      if (animating) {
        physics.harmonics.forEach((h) => {
          const amp = h.amplitude * 4 * Math.exp(-h.damping * 0.3);
          vibration +=
            amp *
            Math.sin(h.mode * Math.PI * frac) *
            Math.sin(2 * Math.PI * h.freq * time * 0.01) *
            Math.exp(-time * 0.005 * h.mode);
        });
      }
      pts.push({ x, y: midY + sag + vibration });
    }
    return pts;
  }, [time, physics, animating]);

  const pathD = stringPoints
    .map((p, i) => (i === 0 ? "M" : "L") + `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  const handleToggle = useCallback(() => {
    if (!animating) setTime(0);
    setAnimating(!animating);
  }, [animating, setAnimating]);

  // Grid lines
  const gridLines = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const x = MARGIN + (i / 10) * USABLE;
        return (
          <line
            key={i}
            x1={x}
            y1={20}
            x2={x}
            y2={VB.h - 20}
            stroke="#1a1a1a"
            strokeWidth={0.5}
            strokeDasharray={i % 5 === 0 ? "none" : "2,4"}
          />
        );
      }),
    [],
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-lime text-[11px] font-mono tracking-[2px] uppercase">
          Side Profile
        </span>
        <button
          onClick={handleToggle}
          className={`px-2.5 py-0.5 rounded text-[10px] font-mono cursor-pointer border transition-all ${
            animating
              ? "bg-lime-dim border-lime text-lime"
              : "bg-white/5 border-neutral-600 text-neutral-400"
          }`}
        >
          {animating ? "■ STOP" : "▶ VIBRATE"}
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="w-full bg-black/30 rounded-lg border border-neutral-800"
      >
        {gridLines}

        {/* Cam wheels */}
        {[CAM_LX, CAM_RX].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={CAM_Y} r={CAM_R} fill="none" stroke="#333" strokeWidth={2} />
            <circle
              cx={cx}
              cy={CAM_Y}
              r={CAM_R - 3}
              fill="none"
              stroke="#2a2a2a"
              strokeWidth={1}
            />
            <circle cx={cx} cy={CAM_Y} r={2} fill="#A0FF00" opacity={0.6} />
          </g>
        ))}

        {/* Serving zones */}
        <line
          x1={CAM_LX + CAM_R}
          y1={CAM_Y}
          x2={CAM_LX + CAM_R + 40}
          y2={CAM_Y - 2}
          stroke="#666"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.4}
        />
        <line
          x1={CAM_RX - CAM_R - 40}
          y1={CAM_Y - 2}
          x2={CAM_RX - CAM_R}
          y2={CAM_Y}
          stroke="#666"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.4}
        />

        {/* Center serving */}
        <rect
          x={VB.w / 2 - 30}
          y={CAM_Y - 8}
          width={60}
          height={4}
          rx={2}
          fill="none"
          stroke="#555"
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
        <text
          x={VB.w / 2}
          y={CAM_Y - 12}
          textAnchor="middle"
          fill="#555"
          fontSize="5"
          fontFamily="monospace"
        >
          CENTER SERVING
        </text>

        {/* String */}
        <path d={pathD} fill="none" stroke="#D4D4D4" strokeWidth={1.2} />

        {/* Draggable weights */}
        {weights.map((w, i) => (
          <DraggableWeight
            key={i}
            weight={w}
            index={i}
            onUpdate={updateWeight}
            svgRef={svgRef}
            viewBox={VB}
          />
        ))}

        {/* Scale markers */}
        {[0, 25, 50, 75, 100].map((pct) => {
          const x = MARGIN + (pct / 100) * USABLE;
          return (
            <text
              key={pct}
              x={x}
              y={VB.h - 8}
              textAnchor="middle"
              fill="#444"
              fontSize="6"
              fontFamily="monospace"
            >
              {pct}%
            </text>
          );
        })}
      </svg>
    </div>
  );
}
