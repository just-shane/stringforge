import { useMemo, useState } from "react";
import { useSimStore } from "../../store.ts";
import { optimizeWeightPlacement, compareSetups } from "../../lib/tuning.ts";
import type { OptimizedSetup } from "../../lib/tuning.ts";

export function SetupOptimizer() {
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);
  const setWeights = useSimStore((s) => s.setWeights);
  const [maxCount, setMaxCount] = useState(2);
  const [maxMass, setMaxMass] = useState(40);
  const [weightType, setWeightType] = useState<"brass" | "tungsten">("brass");
  const [applied, setApplied] = useState(false);

  const optimized: OptimizedSetup = useMemo(
    () => optimizeWeightPlacement(params, maxCount, maxMass, weightType),
    [params, maxCount, maxMass, weightType],
  );

  const comparison = useMemo(
    () => compareSetups(params, weights, optimized),
    [params, weights, optimized],
  );

  const applyOptimized = () => {
    setWeights(optimized.weights);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <div>
      {/* Optimizer constraints */}
      <div className="mb-3">
        <div className="text-[9px] font-mono uppercase tracking-[1px] mb-2" style={{ color: "var(--c-text-dim)" }}>
          Optimizer Constraints
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[9px] block mb-0.5" style={{ color: "var(--c-text-muted)" }}>Max Weights</label>
            <select
              value={maxCount}
              onChange={(e) => setMaxCount(Number(e.target.value))}
              className="w-full text-[10px] font-mono rounded px-2 py-1 cursor-pointer"
              style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-text)" }}
            >
              <option value={1}>1 weight</option>
              <option value={2}>2 weights</option>
            </select>
          </div>
          <div>
            <label className="text-[9px] block mb-0.5" style={{ color: "var(--c-text-muted)" }}>Material</label>
            <select
              value={weightType}
              onChange={(e) => setWeightType(e.target.value as "brass" | "tungsten")}
              className="w-full text-[10px] font-mono rounded px-2 py-1 cursor-pointer"
              style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-text)" }}
            >
              <option value="brass">Brass</option>
              <option value="tungsten">Tungsten</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[9px] block mb-0.5" style={{ color: "var(--c-text-muted)" }}>Max Total Mass</label>
          <input
            type="range"
            min={10}
            max={80}
            step={5}
            value={maxMass}
            onChange={(e) => setMaxMass(Number(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="text-[9px] font-mono text-right" style={{ color: "var(--c-accent)" }}>{maxMass} gr</div>
        </div>
      </div>

      {/* Optimized placement */}
      <div
        className="rounded-lg p-3 mb-3"
        style={{ background: "var(--c-accent-dim)", border: "1px solid var(--c-accent)" }}
      >
        <div className="text-[10px] font-mono font-medium mb-2" style={{ color: "var(--c-accent)" }}>
          OPTIMAL PLACEMENT
        </div>
        {optimized.weights.length === 0 ? (
          <div className="text-[10px]" style={{ color: "var(--c-text-muted)" }}>No weights recommended.</div>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {optimized.weights.map((w, i) => (
              <div
                key={i}
                className="rounded px-2 py-1"
                style={{ background: "var(--c-bg)", border: "1px solid var(--c-border)" }}
              >
                <div className="text-[9px] font-mono" style={{ color: "var(--c-text-dim)" }}>Weight {i + 1}</div>
                <div className="text-[11px] font-mono font-bold" style={{ color: "var(--c-text)" }}>
                  {w.mass}gr @ {w.position}%
                </div>
                <div className="text-[8px] font-mono" style={{ color: "var(--c-text-faint)" }}>{w.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparison table */}
      <div className="mb-3">
        <div className="text-[9px] font-mono uppercase tracking-[1px] mb-2" style={{ color: "var(--c-text-dim)" }}>
          Current vs Optimized
        </div>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--c-border)" }}>
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr style={{ background: "var(--c-surface)" }}>
                <th className="text-left px-2 py-1.5" style={{ color: "var(--c-text-dim)" }}>Metric</th>
                <th className="text-right px-2 py-1.5" style={{ color: "var(--c-text-dim)" }}>Current</th>
                <th className="text-right px-2 py-1.5" style={{ color: "var(--c-text-dim)" }}>Optimized</th>
                <th className="text-center px-2 py-1.5" style={{ color: "var(--c-text-dim)" }}></th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.label} style={{ borderTop: "1px solid var(--c-border)" }}>
                  <td className="px-2 py-1.5" style={{ color: "var(--c-text-muted)" }}>{row.label}</td>
                  <td className="text-right px-2 py-1.5" style={{ color: "var(--c-text)" }}>
                    {typeof row.current === "number" ? row.current.toFixed(1) : row.current}{row.unit}
                  </td>
                  <td className="text-right px-2 py-1.5" style={{ color: "var(--c-text)" }}>
                    {typeof row.optimized === "number" ? row.optimized.toFixed(1) : row.optimized}{row.unit}
                  </td>
                  <td className="text-center px-2 py-1.5" style={{ color: row.improved ? "var(--c-accent)" : "#ef4444" }}>
                    {row.improved ? "+" : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply button */}
      <button
        onClick={applyOptimized}
        className="w-full py-2 rounded-md text-[10px] font-mono uppercase tracking-[2px] cursor-pointer transition-all"
        style={{
          background: applied ? "var(--c-accent)" : "var(--c-surface)",
          border: "1px solid var(--c-accent)",
          color: applied ? "#000" : "var(--c-accent)",
        }}
      >
        {applied ? "Applied!" : "Apply Optimized Setup"}
      </button>
    </div>
  );
}
