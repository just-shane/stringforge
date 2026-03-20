import { useState, useMemo, useEffect, useRef } from "react";
import { useSimStore } from "../../store.ts";
import { getForceAtDraw } from "../../lib/physics.ts";
import { computeDrawCycle } from "../../lib/audio.ts";

export function DrawCycleView() {
  const theme = useSimStore((s) => s.theme);
  const params = useSimStore((s) => s.params);
  const c = theme.colors;

  const [playing, setPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);

  const cycle = useMemo(
    () =>
      computeDrawCycle(
        params.bowType,
        params.drawWeight,
        params.drawLength,
        params.braceHeight,
        getForceAtDraw,
        60,
      ),
    [params.bowType, params.drawWeight, params.drawLength, params.braceHeight],
  );

  const frame = cycle.frames[frameIndex];

  // Animation loop
  useEffect(() => {
    if (!playing) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    startTimeRef.current = performance.now();
    const duration = 2000; // 2 seconds for full draw

    function tick(now: number) {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const idx = Math.min(cycle.frames.length - 1, Math.floor(progress * cycle.frames.length));
      setFrameIndex(idx);

      if (progress >= 1) {
        setPlaying(false);
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    }

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [playing, cycle.frames.length]);

  // SVG dimensions
  const W = 400;
  const H = 260;
  const pad = 30;

  // Bow limb geometry
  const bowCenterX = pad + 30;
  const bowTopY = pad;
  const bowBottomY = H - pad;
  const bowMidY = (bowTopY + bowBottomY) / 2;
  // Limb deflection
  const limbDeflect = frame.limbDeflection * 1.5; // pixels per degree
  const topLimbTipX = bowCenterX + limbDeflect;
  const bottomLimbTipX = bowCenterX + limbDeflect;

  // String position
  const stringRestX = bowCenterX + 20;
  const maxStringX = W - pad - 20;
  const stringDrawX = stringRestX + (maxStringX - stringRestX) * frame.drawPosition;

  // Cam rotation
  const camAngle = frame.camRotation;

  // Force bar
  const forceBarMaxH = H - pad * 2;
  const forceBarH = (frame.forceAtDraw / cycle.peakWeight) * forceBarMaxH;

  // Energy bar
  const energyBarMaxH = forceBarMaxH;
  const energyBarH = cycle.totalStoredEnergy > 0
    ? (frame.storedEnergySoFar / cycle.totalStoredEnergy) * energyBarMaxH
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span
          className="text-[11px] font-mono tracking-[2px] uppercase"
          style={{ color: c.accent }}
        >
          Draw Cycle Animation
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFrameIndex(0);
              setPlaying(true);
            }}
            className="px-3 py-1 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
            style={{
              background: c.accentDim,
              color: c.accent,
              border: `1px solid ${c.accent}`,
            }}
          >
            {playing ? "Playing..." : "Play"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setFrameIndex(0);
            }}
            className="px-3 py-1 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
            style={{
              color: c.textDim,
              border: `1px solid ${c.border}`,
            }}
          >
            Reset
          </button>
        </div>
      </div>

      <div
        className="rounded-lg p-3"
        style={{ background: c.surface, border: `1px solid ${c.border}` }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: "260px" }}>
          {/* Background grid */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`vg-${i}`}
              x1={pad + (i * (W - pad * 2)) / 4}
              y1={pad}
              x2={pad + (i * (W - pad * 2)) / 4}
              y2={H - pad}
              stroke={c.border}
              strokeWidth="0.5"
            />
          ))}

          {/* Riser (vertical bar) */}
          <rect
            x={bowCenterX - 6}
            y={bowMidY - 40}
            width={12}
            height={80}
            rx={3}
            fill={c.textDim}
            opacity={0.4}
          />

          {/* Grip */}
          <circle
            cx={bowCenterX}
            cy={bowMidY}
            r={6}
            fill={c.textDim}
            opacity={0.6}
          />

          {/* Top limb */}
          <path
            d={`M ${bowCenterX} ${bowMidY - 35} Q ${bowCenterX + limbDeflect * 0.6} ${bowTopY + 30} ${topLimbTipX} ${bowTopY}`}
            fill="none"
            stroke={c.textMuted}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Bottom limb */}
          <path
            d={`M ${bowCenterX} ${bowMidY + 35} Q ${bowCenterX + limbDeflect * 0.6} ${bowBottomY - 30} ${bottomLimbTipX} ${bowBottomY}`}
            fill="none"
            stroke={c.textMuted}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Cams (compounds/crossbows) */}
          {(params.bowType === "compound" || params.bowType === "crossbow") && (
            <>
              {/* Top cam */}
              <g transform={`translate(${topLimbTipX}, ${bowTopY}) rotate(${camAngle})`}>
                <ellipse rx="8" ry="6" fill={c.textDim} opacity={0.7} />
                <line x1="-8" y1="0" x2="8" y2="0" stroke={c.accent} strokeWidth="1" opacity={0.5} />
              </g>
              {/* Bottom cam */}
              <g transform={`translate(${bottomLimbTipX}, ${bowBottomY}) rotate(${-camAngle})`}>
                <ellipse rx="8" ry="6" fill={c.textDim} opacity={0.7} />
                <line x1="-8" y1="0" x2="8" y2="0" stroke={c.accent} strokeWidth="1" opacity={0.5} />
              </g>
            </>
          )}

          {/* String */}
          <path
            d={`M ${topLimbTipX} ${bowTopY} L ${stringDrawX} ${bowMidY} L ${bottomLimbTipX} ${bowBottomY}`}
            fill="none"
            stroke={c.string}
            strokeWidth="1.5"
          />

          {/* Arrow (when drawn) */}
          {frame.drawPosition > 0.05 && (
            <>
              <line
                x1={stringDrawX}
                y1={bowMidY}
                x2={stringDrawX - 60 * frame.drawPosition}
                y2={bowMidY}
                stroke={c.warn}
                strokeWidth="1.5"
              />
              {/* Arrow point */}
              <polygon
                points={`${bowCenterX + 15},${bowMidY} ${bowCenterX + 10},${bowMidY - 3} ${bowCenterX + 10},${bowMidY + 3}`}
                fill={c.warn}
                opacity={frame.drawPosition > 0.1 ? 1 : 0}
              />
              {/* Nock */}
              <circle
                cx={stringDrawX}
                cy={bowMidY}
                r={2}
                fill={c.warn}
              />
            </>
          )}

          {/* Force indicator bar (right side) */}
          <rect
            x={W - pad - 25}
            y={H - pad - forceBarH}
            width={10}
            height={Math.max(0, forceBarH)}
            rx={2}
            fill={c.accent}
            opacity={0.6}
          />
          <text
            x={W - pad - 20}
            y={pad - 5}
            textAnchor="middle"
            fill={c.textDim}
            fontSize="7"
            fontFamily="monospace"
          >
            FORCE
          </text>

          {/* Energy indicator bar */}
          <rect
            x={W - pad - 10}
            y={H - pad - energyBarH}
            width={10}
            height={Math.max(0, energyBarH)}
            rx={2}
            fill={c.warn}
            opacity={0.5}
          />
          <text
            x={W - pad - 5}
            y={pad - 5}
            textAnchor="middle"
            fill={c.textDim}
            fontSize="7"
            fontFamily="monospace"
          >
            ENERGY
          </text>

          {/* Draw position label */}
          <text
            x={W / 2}
            y={H - 5}
            textAnchor="middle"
            fill={c.textDim}
            fontSize="9"
            fontFamily="monospace"
          >
            Draw: {frame.drawInches.toFixed(1)}" | Force: {frame.forceAtDraw.toFixed(1)} lbs | Energy: {frame.storedEnergySoFar.toFixed(1)} ft-lbs
          </text>
        </svg>

        {/* Scrubber */}
        <div className="mt-2">
          <input
            type="range"
            min={0}
            max={cycle.frames.length - 1}
            value={frameIndex}
            onChange={(e) => {
              setPlaying(false);
              setFrameIndex(Number(e.target.value));
            }}
            aria-label="Draw cycle frame scrubber"
            className="w-full h-1 appearance-none rounded cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${c.accent} ${(frameIndex / (cycle.frames.length - 1)) * 100}%, ${c.border} ${(frameIndex / (cycle.frames.length - 1)) * 100}%)`,
              accentColor: c.accent,
            }}
          />
        </div>

        {/* Let-off display (compounds) */}
        {(params.bowType === "compound" || params.bowType === "crossbow") && (
          <div className="flex justify-between mt-2 text-[9px] font-mono" style={{ color: c.textDim }}>
            <span>
              Peak: {cycle.peakWeight} lbs
            </span>
            <span style={{ color: frame.drawPosition > 0.85 ? c.accent : c.textDim }}>
              {frame.drawPosition > 0.85
                ? `Holding: ${frame.holdingWeight.toFixed(1)} lbs (${Math.round((1 - frame.holdingWeight / cycle.peakWeight) * 100)}% let-off)`
                : `At draw: ${frame.holdingWeight.toFixed(1)} lbs`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
