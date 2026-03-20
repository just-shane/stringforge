import { useState, useEffect, useCallback, type RefObject } from "react";
import type { Weight } from "../../lib/physics.ts";

const VB_W = 600;
const VB_H = 200;
const MARGIN = VB_W * 0.08;
const USABLE = VB_W - 2 * MARGIN;

function getPositionOnString(pos: number) {
  const x = MARGIN + (pos / 100) * USABLE;
  const midX = VB_W / 2;
  const maxSag = VB_H * 0.06;
  const norm = (x - midX) / (USABLE / 2);
  const y = VB_H * 0.5 - maxSag * (1 - norm * norm);
  return { x, y };
}

interface DraggableWeightProps {
  weight: Weight;
  index: number;
  onUpdate: (index: number, weight: Weight) => void;
  svgRef: RefObject<SVGSVGElement | null>;
  viewBox: { w: number; h: number };
}

export function DraggableWeight({ weight, index, onUpdate, svgRef, viewBox }: DraggableWeightProps) {
  const [dragging, setDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const svgX = ((clientX - rect.left) / rect.width) * viewBox.w;
      let pct = ((svgX - MARGIN) / USABLE) * 100;
      pct = Math.max(5, Math.min(95, pct));
      onUpdate(index, { ...weight, position: Math.round(pct * 10) / 10 });
    },
    [svgRef, viewBox.w, index, weight, onUpdate],
  );

  useEffect(() => {
    if (!dragging) return;
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, handleMove]);

  const pos = getPositionOnString(weight.position);
  const fill = weight.type === "brass" ? "#C5943A" : "#7A8B99";

  return (
    <g
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      <rect
        x={pos.x - 6}
        y={pos.y - 4}
        width={12}
        height={8}
        rx={1.5}
        fill={fill}
        stroke={dragging ? "#A0FF00" : "#fff"}
        strokeWidth={dragging ? 1.5 : 0.8}
      />
      <rect
        x={pos.x - 5}
        y={pos.y - 3}
        width={10}
        height={6}
        rx={1}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={0.3}
      />
      <text
        x={pos.x}
        y={pos.y + 16}
        textAnchor="middle"
        fill="#9CA3AF"
        fontSize="6"
        fontFamily="monospace"
      >
        {weight.mass}gr @ {weight.position.toFixed(1)}%
      </text>
    </g>
  );
}
