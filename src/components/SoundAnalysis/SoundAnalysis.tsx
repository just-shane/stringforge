import { useMemo, useCallback } from "react";
import { useSimStore } from "../../store.ts";
import type { PhysicsResult } from "../../lib/physics.ts";
import { computeWaterfall, synthesizeBowSound, estimateNoise } from "../../lib/audio.ts";

interface SoundAnalysisProps {
  physics: PhysicsResult;
}

export function SoundAnalysis({ physics }: SoundAnalysisProps) {
  const theme = useSimStore((s) => s.theme);
  const params = useSimStore((s) => s.params);
  const c = theme.colors;

  const waterfall = useMemo(
    () => computeWaterfall(physics.harmonics, 0.5, 40),
    [physics.harmonics],
  );

  const noise = useMemo(
    () => estimateNoise(physics.energy, params.bowType, physics.vibrationReduction),
    [physics.energy, params.bowType, physics.vibrationReduction],
  );

  const playSound = useCallback(() => {
    synthesizeBowSound({
      harmonics: physics.harmonics,
      fundamentalFreq: physics.fundamentalFreq,
      duration: 1.2,
      volume: 0.5,
    });
  }, [physics.harmonics, physics.fundamentalFreq]);

  // SVG dimensions for waterfall
  const W = 380;
  const H = 180;
  const padL = 40;
  const padR = 15;
  const padT = 15;
  const padB = 25;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-mono tracking-[2px] uppercase"
          style={{ color: c.accent }}
        >
          Sound & Vibration
        </span>
        <button
          onClick={playSound}
          className="px-3 py-1 rounded text-[9px] font-mono uppercase cursor-pointer transition-all flex items-center gap-1"
          style={{
            background: c.accentDim,
            color: c.accent,
            border: `1px solid ${c.accent}`,
          }}
        >
          ♪ Play Twang
        </button>
      </div>

      <div
        className="rounded-lg p-3"
        style={{ background: c.surface, border: `1px solid ${c.border}` }}
      >
        {/* Vibration Waterfall */}
        <div className="mb-3">
          <div className="text-[9px] font-mono uppercase mb-1" style={{ color: c.textDim }}>
            Vibration Decay Waterfall
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: "180px" }}>
            {/* Y axis label (frequency) */}
            <text
              x={5}
              y={padT + plotH / 2}
              fill={c.textFaint}
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
              transform={`rotate(-90, 5, ${padT + plotH / 2})`}
            >
              Frequency (Hz)
            </text>

            {/* X axis label (time) */}
            <text
              x={padL + plotW / 2}
              y={H - 3}
              fill={c.textFaint}
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Time (seconds)
            </text>

            {/* Frequency axis marks */}
            {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
              const freq = Math.round(frac * waterfall.maxFreq);
              const y = padT + plotH - frac * plotH;
              return (
                <g key={`fa-${i}`}>
                  <line x1={padL - 3} y1={y} x2={padL} y2={y} stroke={c.border} strokeWidth="0.5" />
                  <text
                    x={padL - 5}
                    y={y + 2.5}
                    fill={c.textFaint}
                    fontSize="6"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {freq}
                  </text>
                </g>
              );
            })}

            {/* Time axis marks */}
            {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((t, i) => {
              const x = padL + (t / waterfall.duration) * plotW;
              return (
                <g key={`ta-${i}`}>
                  <line x1={x} y1={padT + plotH} x2={x} y2={padT + plotH + 3} stroke={c.border} strokeWidth="0.5" />
                  <text
                    x={x}
                    y={padT + plotH + 12}
                    fill={c.textFaint}
                    fontSize="6"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {t.toFixed(1)}s
                  </text>
                </g>
              );
            })}

            {/* Plot border */}
            <rect
              x={padL}
              y={padT}
              width={plotW}
              height={plotH}
              fill="none"
              stroke={c.border}
              strokeWidth="0.5"
            />

            {/* Waterfall data points */}
            {waterfall.points.map((pt, i) => {
              const x = padL + (pt.time / waterfall.duration) * plotW;
              const y = padT + plotH - (pt.freq / waterfall.maxFreq) * plotH;
              const intensity = Math.min(1, pt.amplitude * 2);
              return (
                <rect
                  key={i}
                  x={x - 2}
                  y={y - 1.5}
                  width={Math.max(3, plotW / waterfall.timeSlices)}
                  height={3}
                  rx={1}
                  fill={c.accent}
                  opacity={intensity * 0.9}
                />
              );
            })}
          </svg>
        </div>

        {/* Noise estimation */}
        <div
          className="rounded-md p-3"
          style={{ background: c.accentGlow, border: `1px solid ${c.border}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase" style={{ color: c.textDim }}>
              Shot Noise Estimate
            </span>
            <span
              className="text-[9px] font-mono uppercase px-2 py-0.5 rounded"
              style={{
                color: noise.peakDb < 75 ? c.accent : noise.peakDb < 90 ? c.warn : c.danger,
                background: noise.peakDb < 75
                  ? `${c.accent}15`
                  : noise.peakDb < 90
                    ? `${c.warn}15`
                    : `${c.danger}15`,
                border: `1px solid ${
                  noise.peakDb < 75 ? `${c.accent}30` : noise.peakDb < 90 ? `${c.warn}30` : `${c.danger}30`
                }`,
              }}
            >
              {noise.rating}
            </span>
          </div>

          {/* dB meter visual */}
          <div className="mb-2">
            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: c.border }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (noise.peakDb / 120) * 100)}%`,
                  background: `linear-gradient(to right, ${c.accent}, ${c.warn}, ${c.danger})`,
                }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[7px] font-mono" style={{ color: c.textFaint }}>
              <span>40 dB</span>
              <span>60</span>
              <span>80</span>
              <span>100</span>
              <span>120 dB</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div className="flex justify-between">
              <span className="text-[9px] font-mono" style={{ color: c.textDim }}>Peak</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: c.text }}>
                {noise.peakDb} dB
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[9px] font-mono" style={{ color: c.textDim }}>Sustained</span>
              <span className="text-[10px] font-mono" style={{ color: c.textMuted }}>
                {noise.sustainedDb} dB
              </span>
            </div>
            <div className="col-span-2 flex justify-between mt-1">
              <span className="text-[9px] font-mono" style={{ color: c.textDim }}>Comparable to</span>
              <span className="text-[9px] font-mono" style={{ color: c.textMuted }}>
                {noise.comparison}
              </span>
            </div>
            <div className="col-span-2 flex justify-between">
              <span className="text-[9px] font-mono" style={{ color: c.textDim }}>Sound + Vibe energy</span>
              <span className="text-[9px] font-mono" style={{ color: c.textMuted }}>
                {noise.vibrationEnergy.toFixed(2)} ft-lbs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
