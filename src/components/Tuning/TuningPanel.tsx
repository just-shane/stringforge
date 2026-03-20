import { useState } from "react";
import { useSimStore } from "../../store.ts";
import { PaperTuneView } from "./PaperTuneView.tsx";
import { BareShaftView } from "./BareShaftView.tsx";
import { WalkBackView } from "./WalkBackView.tsx";
import { SetupOptimizer } from "./SetupOptimizer.tsx";
import type { ShooterHand } from "../../store.ts";

type TuningTab = "paper" | "bare" | "walkback" | "optimizer";

const TABS: { id: TuningTab; label: string }[] = [
  { id: "paper", label: "Paper Tune" },
  { id: "bare", label: "Bare Shaft" },
  { id: "walkback", label: "Walk-Back" },
  { id: "optimizer", label: "Optimizer" },
];

export function TuningPanel() {
  const [tab, setTab] = useState<TuningTab>("paper");
  const tuning = useSimStore((s) => s.tuning);
  const setTuning = useSimStore((s) => s.setTuning);

  return (
    <div>
      {/* Tuning controls (shared) */}
      <div
        className="text-[10px] tracking-[2px] font-mono uppercase mb-3"
        style={{ color: "var(--c-accent)" }}
      >
        Setup Parameters
      </div>

      {/* Shooter hand */}
      <div className="flex gap-1 mb-3">
        {(["right", "left"] as ShooterHand[]).map((h) => (
          <button
            key={h}
            onClick={() => setTuning("shooterHand", h)}
            className="flex-1 py-1.5 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
            style={{
              background: tuning.shooterHand === h ? "var(--c-accent-dim)" : "var(--c-surface)",
              border: `1px solid ${tuning.shooterHand === h ? "var(--c-accent)" : "var(--c-border)"}`,
              color: tuning.shooterHand === h ? "var(--c-accent)" : "var(--c-text-dim)",
            }}
          >
            {h}-hand
          </button>
        ))}
      </div>

      {/* Nock Height */}
      <div className="mb-3">
        <div className="flex justify-between mb-0.5">
          <span className="text-[11px]" style={{ color: "var(--c-text-muted)" }}>Nock Height</span>
          <span className="text-[11px] font-mono" style={{ color: "var(--c-accent)" }}>
            {tuning.nockHeight >= 0 ? "+" : ""}{(tuning.nockHeight * 16).toFixed(0)}/16"
          </span>
        </div>
        <input
          type="range"
          min={-0.25}
          max={0.5}
          step={0.03125}
          value={tuning.nockHeight}
          onChange={(e) => setTuning("nockHeight", parseFloat(e.target.value))}
          aria-label="Nock height adjustment"
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-[8px] font-mono" style={{ color: "var(--c-text-faint)" }}>
          <span>-1/4" low</span>
          <span>center</span>
          <span>+1/2" high</span>
        </div>
      </div>

      {/* Rest Position */}
      <div className="mb-4">
        <div className="flex justify-between mb-0.5">
          <span className="text-[11px]" style={{ color: "var(--c-text-muted)" }}>Rest Offset</span>
          <span className="text-[11px] font-mono" style={{ color: "var(--c-accent)" }}>
            {tuning.restPosition === 0 ? "Center" : `${tuning.restPosition > 0 ? "+" : ""}${(tuning.restPosition * 16).toFixed(0)}/16"`}
          </span>
        </div>
        <input
          type="range"
          min={-0.125}
          max={0.125}
          step={0.015625}
          value={tuning.restPosition}
          onChange={(e) => setTuning("restPosition", parseFloat(e.target.value))}
          aria-label="Rest position offset"
          className="w-full cursor-pointer"
        />
        <div className="flex justify-between text-[8px] font-mono" style={{ color: "var(--c-text-faint)" }}>
          <span>← left</span>
          <span>centershot</span>
          <span>right →</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-0.5 mb-4 rounded-lg overflow-hidden" style={{ background: "var(--c-bg)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 text-[8px] font-mono uppercase tracking-[1px] cursor-pointer transition-all"
            style={{
              background: tab === t.id ? "var(--c-accent-dim)" : "transparent",
              color: tab === t.id ? "var(--c-accent)" : "var(--c-text-dim)",
              borderBottom: tab === t.id ? "2px solid var(--c-accent)" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active view */}
      {tab === "paper" && <PaperTuneView />}
      {tab === "bare" && <BareShaftView />}
      {tab === "walkback" && <WalkBackView />}
      {tab === "optimizer" && <SetupOptimizer />}
    </div>
  );
}
