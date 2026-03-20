import { useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { ARROW_SHAFTS, computeArrow } from "../../lib/arrow.ts";
import type { PhysicsResult } from "../../lib/physics.ts";
import { Slider } from "../ControlPanel/Slider.tsx";

interface ArrowBuilderProps {
  physics: PhysicsResult;
}

export function ArrowBuilder({ physics }: ArrowBuilderProps) {
  const arrow = useSimStore((s) => s.arrow);
  const params = useSimStore((s) => s.params);
  const windSpeed = useSimStore((s) => s.windSpeed);
  const setArrow = useSimStore((s) => s.setArrow);
  const setWindSpeed = useSimStore((s) => s.setWindSpeed);

  const arrowResult = useMemo(
    () => computeArrow(arrow, physics.estimatedFPS, params.drawWeight, params.drawLength, params.bowType),
    [arrow, physics.estimatedFPS, params.drawWeight, params.drawLength, params.bowType],
  );

  const currentShaft = ARROW_SHAFTS.find((s) => s.id === arrow.shaft);

  // Group shafts by manufacturer
  const manufacturers = [...new Set(ARROW_SHAFTS.map((s) => s.manufacturer))];

  const spineColor =
    arrowResult.spineMatch === "Matched"
      ? "var(--c-accent)"
      : "var(--c-warn)";

  const focColor =
    arrowResult.foc >= 7 && arrowResult.foc <= 15
      ? "var(--c-accent)"
      : "var(--c-warn)";

  return (
    <>
      <div
        className="text-[10px] tracking-[2px] font-mono uppercase mb-3"
        style={{ color: "var(--c-accent)" }}
      >
        Arrow Builder
      </div>

      {/* Shaft selector */}
      <div className="mb-3">
        <div className="text-[11px] mb-1" style={{ color: "var(--c-text-muted)" }}>
          Shaft
        </div>
        <select
          value={arrow.shaft}
          onChange={(e) => setArrow("shaft", e.target.value)}
          aria-label="Arrow shaft selection"
          className="w-full px-2 py-1.5 rounded text-[10px] font-mono cursor-pointer"
          style={{
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            color: "var(--c-text)",
          }}
        >
          {manufacturers.map((mfg) => (
            <optgroup key={mfg} label={mfg}>
              {ARROW_SHAFTS.filter((s) => s.manufacturer === mfg).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (spine {s.spine}, {s.weightPerInch} gpi)
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {currentShaft && (
          <div className="text-[8px] font-mono mt-1 px-1" style={{ color: "var(--c-text-dim)" }}>
            {currentShaft.material} · {currentShaft.outerDiameter}" OD · {currentShaft.weightPerInch} gr/in
          </div>
        )}
      </div>

      <Slider
        label="Shaft Length"
        value={arrow.shaftLength}
        min={24}
        max={34}
        step={0.25}
        unit='"'
        onChange={(v) => setArrow("shaftLength", v)}
      />
      <Slider
        label="Point Weight"
        value={arrow.pointWeight}
        min={50}
        max={300}
        step={5}
        unit=" gr"
        onChange={(v) => setArrow("pointWeight", v)}
      />
      <Slider
        label="Nock Weight"
        value={arrow.nockWeight}
        min={6}
        max={20}
        step={1}
        unit=" gr"
        onChange={(v) => setArrow("nockWeight", v)}
      />
      <Slider
        label="Fletching Weight"
        value={arrow.fletchingWeight}
        min={12}
        max={48}
        step={3}
        unit=" gr"
        onChange={(v) => setArrow("fletchingWeight", v)}
      />
      <Slider
        label="Wind Speed"
        value={windSpeed}
        min={0}
        max={30}
        step={1}
        unit=" mph"
        onChange={setWindSpeed}
      />

      {/* Arrow Summary Stats */}
      <div
        className="rounded-md p-2.5 mt-2 space-y-1"
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
        }}
      >
        <div className="flex justify-between text-[10px] font-mono">
          <span style={{ color: "var(--c-text-dim)" }}>Total Weight</span>
          <span style={{ color: "var(--c-text)" }}>{arrowResult.totalWeight.toFixed(0)} gr</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span style={{ color: "var(--c-text-dim)" }}>Launch Speed</span>
          <span style={{ color: "var(--c-accent)" }}>{arrowResult.launchSpeed.toFixed(0)} fps</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span style={{ color: "var(--c-text-dim)" }}>Kinetic Energy</span>
          <span style={{ color: "var(--c-text)" }}>{arrowResult.kineticEnergy.toFixed(1)} ft-lbs</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span style={{ color: "var(--c-text-dim)" }}>Momentum</span>
          <span style={{ color: "var(--c-text)" }}>{arrowResult.momentum.toFixed(3)} slug·ft/s</span>
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span style={{ color: "var(--c-text-dim)" }}>FOC</span>
          <span style={{ color: focColor }}>{arrowResult.foc.toFixed(1)}%</span>
        </div>
        <div className="text-[8px] font-mono px-0.5" style={{ color: "var(--c-text-dim)" }}>
          {arrowResult.focRating}
        </div>

        <div
          className="pt-1 mt-1"
          style={{ borderTop: "1px solid var(--c-border)" }}
        >
          <div className="flex justify-between text-[10px] font-mono">
            <span style={{ color: "var(--c-text-dim)" }}>Static Spine</span>
            <span style={{ color: "var(--c-text)" }}>{arrowResult.staticSpine}</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono">
            <span style={{ color: "var(--c-text-dim)" }}>Dynamic Spine</span>
            <span style={{ color: "var(--c-text)" }}>{arrowResult.dynamicSpine}</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono">
            <span style={{ color: "var(--c-text-dim)" }}>Recommended</span>
            <span style={{ color: spineColor }}>{arrowResult.recommendedSpine}</span>
          </div>
          <div className="flex justify-between text-[10px] font-mono">
            <span style={{ color: "var(--c-text-dim)" }}>Match</span>
            <span style={{ color: spineColor }}>{arrowResult.spineMatch}</span>
          </div>
        </div>
      </div>
    </>
  );
}
