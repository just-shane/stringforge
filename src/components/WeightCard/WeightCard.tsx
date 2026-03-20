import { useSimStore } from "../../store.ts";
import type { Weight, WeightType } from "../../lib/physics.ts";
import { Slider } from "../ControlPanel/Slider.tsx";

interface WeightCardProps {
  weight: Weight;
  index: number;
}

const TYPES: WeightType[] = ["brass", "tungsten"];

export function WeightCard({ weight, index }: WeightCardProps) {
  const updateWeight = useSimStore((s) => s.updateWeight);
  const removeWeight = useSimStore((s) => s.removeWeight);

  const color = weight.type === "brass" ? "text-brass" : "text-tungsten";

  return (
    <div className="bg-white/[0.02] rounded-md p-2.5 mb-1.5 border border-neutral-800">
      <div className="flex justify-between items-center mb-1.5">
        <span className={`text-[10px] font-mono ${color}`}>
          ● {weight.type.toUpperCase()} #{index + 1}
        </span>
        <button
          onClick={() => removeWeight(index)}
          className="bg-transparent border-none text-neutral-500 cursor-pointer text-base leading-none p-0 hover:text-red-400"
        >
          ×
        </button>
      </div>

      <Slider
        label="Mass"
        value={weight.mass}
        min={3}
        max={50}
        step={1}
        unit=" gr"
        onChange={(v) => updateWeight(index, { ...weight, mass: v })}
      />
      <Slider
        label="Position"
        value={weight.position}
        min={5}
        max={95}
        step={0.5}
        unit="%"
        onChange={(v) => updateWeight(index, { ...weight, position: v })}
      />

      <div className="flex gap-1">
        {TYPES.map((t) => {
          const active = weight.type === t;
          const borderColor = t === "brass" ? "border-brass" : "border-tungsten";
          const textColor = t === "brass" ? "text-brass" : "text-tungsten";
          const bgColor =
            t === "brass" ? "bg-[rgba(197,148,58,0.15)]" : "bg-[rgba(122,139,153,0.15)]";

          return (
            <button
              key={t}
              onClick={() => updateWeight(index, { ...weight, type: t })}
              className={`flex-1 py-0.5 rounded text-[9px] font-mono cursor-pointer border transition-all ${
                active
                  ? `${bgColor} ${borderColor} ${textColor}`
                  : "bg-transparent border-neutral-700 text-neutral-500"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
