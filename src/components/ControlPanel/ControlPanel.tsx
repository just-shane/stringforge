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
      <div className="text-lime text-[10px] tracking-[2px] font-mono uppercase mb-4">
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
        <div className="text-neutral-400 text-[11px] mb-1">String Material</div>
        <div className="flex gap-1 flex-wrap">
          {Object.keys(STRING_MATERIALS).map((m) => (
            <button
              key={m}
              onClick={() => setParam("material", m)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono cursor-pointer border transition-all ${
                params.material === m
                  ? "bg-lime-dim border-lime text-lime"
                  : "bg-white/[0.03] border-neutral-700 text-neutral-400"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Weight section */}
      <div className="border-t border-neutral-800 pt-4 mt-4">
        <div className="text-lime text-[10px] tracking-[2px] font-mono mb-3">
          SPEED WEIGHTS ({weights.length}/8)
        </div>

        {weights.map((w, i) => (
          <WeightCard key={i} weight={w} index={i} />
        ))}

        {weights.length < 8 && (
          <button
            onClick={() => addWeight({ position: 50, mass: 15, type: "brass" })}
            className="w-full py-2 rounded-md bg-lime-glow border border-dashed border-neutral-700 text-lime cursor-pointer text-[11px] font-mono transition-all hover:border-lime hover:bg-lime-dim"
          >
            + ADD WEIGHT
          </button>
        )}
      </div>
    </>
  );
}
