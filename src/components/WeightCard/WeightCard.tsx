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

  const colorVar = weight.type === "brass" ? "var(--c-brass)" : "var(--c-tungsten)";

  return (
    <div
      className="rounded-md p-2.5 mb-1.5"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-mono" style={{ color: colorVar }}>
          ● {weight.type.toUpperCase()} #{index + 1}
        </span>
        <button
          onClick={() => removeWeight(index)}
          className="bg-transparent border-none cursor-pointer text-base leading-none p-0"
          style={{ color: "var(--c-text-dim)" }}
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
          const tColor = t === "brass" ? "var(--c-brass)" : "var(--c-tungsten)";

          return (
            <button
              key={t}
              onClick={() => updateWeight(index, { ...weight, type: t })}
              className="flex-1 py-0.5 rounded text-[9px] font-mono cursor-pointer transition-all"
              style={{
                background: active ? `color-mix(in srgb, ${tColor} 15%, transparent)` : "transparent",
                border: `1px solid ${active ? tColor : "var(--c-border)"}`,
                color: active ? tColor : "var(--c-text-dim)",
              }}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
