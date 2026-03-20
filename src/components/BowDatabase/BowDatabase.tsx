import { useState, useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { BOW_DATABASE, ARROW_PRESETS, type BowSpec, type ArrowPreset } from "../../lib/bows.ts";
import type { BowType } from "../../lib/physics.ts";
import type { Theme } from "../../lib/themes.ts";

export function BowDatabase() {
  const theme = useSimStore((s) => s.theme);
  const setBowType = useSimStore((s) => s.setBowType);
  const setParam = useSimStore((s) => s.setParam);
  const setArrow = useSimStore((s) => s.setArrow);
  const c = theme.colors;

  const [bowFilter, setBowFilter] = useState<BowType | "all">("all");
  const [presetFilter, setPresetFilter] = useState<"all" | "hunting" | "target" | "3d">("all");
  const [section, setSection] = useState<"bows" | "arrows">("bows");

  const filteredBows = useMemo(
    () =>
      bowFilter === "all"
        ? BOW_DATABASE
        : BOW_DATABASE.filter((b) => b.bowType === bowFilter),
    [bowFilter],
  );

  const filteredPresets = useMemo(
    () =>
      presetFilter === "all"
        ? ARROW_PRESETS
        : ARROW_PRESETS.filter((p) => p.use === presetFilter),
    [presetFilter],
  );

  function applyBow(bow: BowSpec) {
    setBowType(bow.bowType);
    setParam("drawWeight", bow.drawWeightRange[1]);
    setParam("drawLength", bow.drawLengthRange[1]);
    setParam("stringLength", bow.stringLength);
    setParam("braceHeight", bow.braceHeight);
  }

  function applyPreset(preset: ArrowPreset) {
    const comp = preset.components;
    setArrow("shaft", comp.shaft);
    setArrow("shaftLength", comp.shaftLength);
    setArrow("pointWeight", comp.pointWeight);
    setArrow("nockWeight", comp.nockWeight);
    setArrow("fletchingWeight", comp.fletchingWeight);
    setArrow("fletchingLength", comp.fletchingLength);
    setArrow("wrapWeight", comp.wrapWeight);
  }

  return (
    <div>
      {/* Section toggle */}
      <div className="flex mb-3" style={{ borderBottom: `1px solid ${c.border}` }}>
        {(["bows", "arrows"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className="flex-1 py-2 text-[10px] font-mono uppercase tracking-[2px] cursor-pointer transition-all"
            style={{
              background: section === s ? c.accentDim : "transparent",
              color: section === s ? c.accent : c.textDim,
              borderBottom: section === s ? `2px solid ${c.accent}` : "2px solid transparent",
            }}
          >
            {s === "bows" ? "Bow Database" : "Arrow Presets"}
          </button>
        ))}
      </div>

      {section === "bows" ? (
        <>
          {/* Bow type filter */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {(["all", "compound", "recurve", "longbow", "crossbow"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setBowFilter(f)}
                className="px-2 py-1 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
                style={{
                  background: bowFilter === f ? c.accentDim : "transparent",
                  color: bowFilter === f ? c.accent : c.textDim,
                  border: `1px solid ${bowFilter === f ? c.accent : c.border}`,
                }}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>

          {/* Bow list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {filteredBows.map((bow) => (
              <BowCard key={bow.id} bow={bow} colors={c} onApply={() => applyBow(bow)} isActive={false} />
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Preset filter */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {(["all", "hunting", "target", "3d"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setPresetFilter(f)}
                className="px-2 py-1 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
                style={{
                  background: presetFilter === f ? c.accentDim : "transparent",
                  color: presetFilter === f ? c.accent : c.textDim,
                  border: `1px solid ${presetFilter === f ? c.accent : c.border}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Preset list */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {filteredPresets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} colors={c} onApply={() => applyPreset(preset)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────

function BowCard({
  bow,
  colors: c,
  onApply,
  isActive,
}: {
  bow: BowSpec;
  colors: Theme["colors"];
  onApply: () => void;
  isActive: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{
        border: `1px solid ${isActive ? c.accent : c.border}`,
        background: isActive ? c.accentGlow : c.surface,
      }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2.5 flex items-center justify-between cursor-pointer text-left"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-medium" style={{ color: c.text }}>
              {bow.name}
            </span>
            <span className="text-[9px] font-mono" style={{ color: c.textDim }}>
              {bow.manufacturer}
            </span>
          </div>
          <div className="text-[9px] font-mono mt-0.5" style={{ color: c.textDim }}>
            {bow.description}
          </div>
        </div>
        <span
          className="text-[10px] ml-2 shrink-0 transition-transform"
          style={{
            color: c.textDim,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▾
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3" style={{ borderTop: `1px solid ${c.border}` }}>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <Stat label="ATA" value={`${bow.ataLength}"`} c={c} />
            <Stat label="Brace" value={`${bow.braceHeight}"`} c={c} />
            <Stat label="Draw Weight" value={`${bow.drawWeightRange[0]}-${bow.drawWeightRange[1]} lbs`} c={c} />
            <Stat label="Draw Length" value={`${bow.drawLengthRange[0]}-${bow.drawLengthRange[1]}"`} c={c} />
            {bow.iboSpeed > 0 && <Stat label="IBO Speed" value={`${bow.iboSpeed} fps`} c={c} />}
            <Stat label="Cam" value={bow.camType} c={c} />
            <Stat label="Let-off" value={`${Math.round(bow.letOff * 100)}%`} c={c} />
            <Stat label="Mass" value={`${bow.weight} lbs`} c={c} />
            <Stat label="String" value={`${bow.stringLength}"`} c={c} />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
            className="w-full mt-3 py-1.5 rounded text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
            style={{
              background: c.accentDim,
              color: c.accent,
              border: `1px solid ${c.accent}`,
            }}
          >
            Apply to Simulator
          </button>
        </div>
      )}
    </div>
  );
}

function PresetCard({
  preset,
  colors: c,
  onApply,
}: {
  preset: ArrowPreset;
  colors: Theme["colors"];
  onApply: () => void;
}) {
  const useColor = preset.use === "hunting" ? c.warn : preset.use === "target" ? c.accent : c.textMuted;

  return (
    <div
      className="rounded-lg p-3 transition-all"
      style={{ border: `1px solid ${c.border}`, background: c.surface }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[12px] font-medium" style={{ color: c.text }}>
          {preset.name}
        </span>
        <span
          className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded"
          style={{ background: `${useColor}20`, color: useColor, border: `1px solid ${useColor}40` }}
        >
          {preset.use}
        </span>
      </div>
      <div className="text-[10px] font-mono mb-2" style={{ color: c.textDim }}>
        {preset.description}
      </div>
      <div className="flex gap-3 mb-2 text-[9px] font-mono" style={{ color: c.textMuted }}>
        <span>Point: {preset.components.pointWeight}gr</span>
        <span>Length: {preset.components.shaftLength}"</span>
        <span>Fletch: {preset.components.fletchingWeight}gr</span>
      </div>
      <button
        onClick={onApply}
        className="w-full py-1.5 rounded text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
        style={{
          background: c.accentDim,
          color: c.accent,
          border: `1px solid ${c.accent}`,
        }}
      >
        Load Preset
      </button>
    </div>
  );
}

function Stat({ label, value, c }: { label: string; value: string; c: Theme["colors"] }) {
  return (
    <div className="flex justify-between items-center py-0.5">
      <span className="text-[9px] font-mono uppercase" style={{ color: c.textDim }}>
        {label}
      </span>
      <span className="text-[10px] font-mono" style={{ color: c.textMuted }}>
        {value}
      </span>
    </div>
  );
}
