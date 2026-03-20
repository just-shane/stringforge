import { useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { STRING_MATERIALS, BOW_PROFILES, computePhysics } from "../../lib/physics.ts";
import type { BowType } from "../../lib/physics.ts";
import { Slider } from "./Slider.tsx";
import { WeightCard } from "../WeightCard/WeightCard.tsx";

const BOW_TYPES: BowType[] = ["compound", "recurve", "longbow", "crossbow"];

export function ControlPanel() {
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);
  const setParam = useSimStore((s) => s.setParam);
  const setBowType = useSimStore((s) => s.setBowType);
  const addWeight = useSimStore((s) => s.addWeight);

  const physics = useMemo(() => computePhysics(params, weights), [params, weights]);
  const { min: recMin, max: recMax } = physics.strandRecommendation;
  const strandsOk = params.strandCount >= recMin && params.strandCount <= recMax;

  return (
    <>
      {/* Bow Type */}
      <div
        className="text-[10px] tracking-[2px] font-mono uppercase mb-3"
        style={{ color: "var(--c-accent)" }}
      >
        Bow Type
      </div>
      <div className="grid grid-cols-2 gap-1 mb-4">
        {BOW_TYPES.map((bt) => {
          const profile = BOW_PROFILES[bt];
          const active = params.bowType === bt;
          return (
            <button
              key={bt}
              onClick={() => setBowType(bt)}
              className="px-2 py-1.5 rounded text-left cursor-pointer transition-all"
              style={{
                background: active ? "var(--c-accent-dim)" : "var(--c-surface)",
                border: `1px solid ${active ? "var(--c-accent)" : "var(--c-border)"}`,
              }}
            >
              <div
                className="text-[10px] font-mono font-medium"
                style={{ color: active ? "var(--c-accent)" : "var(--c-text)" }}
              >
                {profile.name}
              </div>
              <div className="text-[8px]" style={{ color: "var(--c-text-dim)" }}>
                {profile.description}
              </div>
            </button>
          );
        })}
      </div>

      {/* Draw Parameters */}
      <div
        className="text-[10px] tracking-[2px] font-mono uppercase mb-3"
        style={{ color: "var(--c-accent)" }}
      >
        Draw Parameters
      </div>

      <Slider
        label="Draw Weight"
        value={params.drawWeight}
        min={params.bowType === "crossbow" ? 75 : 15}
        max={params.bowType === "crossbow" ? 250 : 90}
        step={5}
        unit=" lbs"
        onChange={(v) => setParam("drawWeight", v)}
      />
      <Slider
        label="Draw Length"
        value={params.drawLength}
        min={params.bowType === "crossbow" ? 10 : 24}
        max={params.bowType === "crossbow" ? 20 : 34}
        step={0.5}
        unit='"'
        onChange={(v) => setParam("drawLength", v)}
      />

      {params.bowType === "compound" && (
        <div className="text-[9px] font-mono mb-3 px-1" style={{ color: "var(--c-text-dim)" }}>
          Holding: {physics.holdingWeight.toFixed(0)} lbs ({(BOW_PROFILES[params.bowType].letOff * 100).toFixed(0)}% let-off)
        </div>
      )}

      {/* String Parameters */}
      <div
        className="text-[10px] tracking-[2px] font-mono uppercase mb-3 mt-2"
        style={{ color: "var(--c-accent)" }}
      >
        String Parameters
      </div>

      <Slider
        label="String Length"
        value={params.stringLength}
        min={params.bowType === "crossbow" ? 24 : 48}
        max={params.bowType === "crossbow" ? 44 : 72}
        step={0.25}
        unit='"'
        onChange={(v) => setParam("stringLength", v)}
      />
      <Slider
        label="Brace Height"
        value={params.braceHeight}
        min={params.bowType === "crossbow" ? 3 : 5}
        max={params.bowType === "crossbow" ? 8 : 10}
        step={0.125}
        unit='"'
        onChange={(v) => setParam("braceHeight", v)}
      />
      <Slider
        label="Strand Count"
        value={params.strandCount}
        min={10}
        max={36}
        step={2}
        unit=" strands"
        onChange={(v) => setParam("strandCount", v)}
      />
      <div
        className="text-[9px] font-mono mb-3 px-1"
        style={{ color: strandsOk ? "var(--c-text-dim)" : "var(--c-warn)" }}
      >
        Recommended: {recMin}-{recMax} strands
      </div>

      <Slider
        label="Tension (at rest)"
        value={params.tension}
        min={100}
        max={600}
        step={10}
        unit=" lbs"
        onChange={(v) => setParam("tension", v)}
      />

      {/* Material selector */}
      <div className="mb-3.5">
        <div className="text-[11px] mb-1" style={{ color: "var(--c-text-muted)" }}>
          String Material
        </div>
        <div className="flex gap-1 flex-wrap">
          {Object.keys(STRING_MATERIALS).map((m) => (
            <button
              key={m}
              onClick={() => setParam("material", m)}
              className="px-2 py-1 rounded text-[9px] font-mono cursor-pointer transition-all"
              style={{
                background: params.material === m ? "var(--c-accent-dim)" : "var(--c-surface)",
                border: `1px solid ${params.material === m ? "var(--c-accent)" : "var(--c-border)"}`,
                color: params.material === m ? "var(--c-accent)" : "var(--c-text-muted)",
              }}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="text-[8px] font-mono mt-1 px-1" style={{ color: "var(--c-text-dim)" }}>
          Stretch: {STRING_MATERIALS[params.material].stretchPct}% · Creep: {STRING_MATERIALS[params.material].creepRate}%/1k shots
        </div>
      </div>

      {/* Weight section */}
      <div className="pt-4 mt-4" style={{ borderTop: "1px solid var(--c-border)" }}>
        <div
          className="text-[10px] tracking-[2px] font-mono mb-3"
          style={{ color: "var(--c-accent)" }}
        >
          SPEED WEIGHTS ({weights.length}/8)
        </div>

        {weights.map((w, i) => (
          <WeightCard key={i} weight={w} index={i} />
        ))}

        {weights.length < 8 && (
          <button
            onClick={() => addWeight({ position: 50, mass: 15, type: "brass" })}
            className="w-full py-2 rounded-md cursor-pointer text-[11px] font-mono transition-all"
            style={{
              background: "var(--c-accent-glow)",
              border: "1px dashed var(--c-border)",
              color: "var(--c-accent)",
            }}
          >
            + ADD WEIGHT
          </button>
        )}
      </div>
    </>
  );
}
