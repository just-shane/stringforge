import { useSimStore } from "../../store.ts";
import { STRING_MATERIALS } from "../../lib/physics.ts";
import { Slider } from "./Slider.tsx";
import { WeightCard } from "../WeightCard/WeightCard.tsx";

export function ControlPanel() {
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);
  const setParam = useSimStore((s) => s.setParam);
  const addWeight = useSimStore((s) => s.addWeight);

  return (
    <>
      <div
        className="text-[10px] tracking-[2px] font-mono uppercase mb-4"
        style={{ color: "var(--c-accent)" }}
      >
        String Parameters
      </div>

      <Slider
        label="String Length"
        value={params.stringLength}
        min={48}
        max={65}
        step={0.25}
        unit='"'
        onChange={(v) => setParam("stringLength", v)}
      />
      <Slider
        label="Brace Height"
        value={params.braceHeight}
        min={5}
        max={9}
        step={0.125}
        unit='"'
        onChange={(v) => setParam("braceHeight", v)}
      />
      <Slider
        label="Strand Count"
        value={params.strandCount}
        min={16}
        max={32}
        step={2}
        unit=" strands"
        onChange={(v) => setParam("strandCount", v)}
      />
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
              className="px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer transition-all"
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
