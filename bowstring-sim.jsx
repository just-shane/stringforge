import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Physics Engine ────────────────────────────────────────────────
const GRAIN_TO_KG = 0.0000648;
const INCH_TO_M = 0.0254;

const STRING_MATERIALS = {
  "BCY-X": { density: 0.0052, modulus: 7.5, stretchPct: 0.5 },
  "452X":  { density: 0.0048, modulus: 7.2, stretchPct: 0.8 },
  "8190":  { density: 0.0044, modulus: 6.8, stretchPct: 1.0 },
  "D97":   { density: 0.0046, modulus: 6.5, stretchPct: 1.2 },
};

function computePhysics(params) {
  const { stringLength, strandCount, material, tension, weights, braceHeight } = params;
  const mat = STRING_MATERIALS[material];
  const L = stringLength * INCH_TO_M;
  const vibratingLength = Math.sqrt(Math.max(0.01, (L/2)**2 - (braceHeight * INCH_TO_M)**2)) * 2;
  const stringMassPerUnit = mat.density * strandCount / 1000;
  const totalStringMass = stringMassPerUnit * L;

  const totalWeightMass = weights.reduce((s, w) => s + w.mass * GRAIN_TO_KG, 0);
  const effectiveMassPerUnit = (totalStringMass + totalWeightMass) / L;
  const T = tension * 4.44822;

  const fundamentalFreq = (1 / (2 * vibratingLength)) * Math.sqrt(T / effectiveMassPerUnit);

  const harmonics = [];
  for (let n = 1; n <= 8; n++) {
    let amplitude = 1 / n;
    weights.forEach(w => {
      const pos = w.position / 100;
      const nodeProximity = Math.abs(Math.sin(n * Math.PI * pos));
      const dampFactor = 1 - (w.mass * GRAIN_TO_KG / (totalStringMass + totalWeightMass)) * nodeProximity * 3;
      amplitude *= Math.max(0.01, dampFactor);
    });
    harmonics.push({
      mode: n, freq: fundamentalFreq * n, amplitude,
      damping: 1 - amplitude,
    });
  }

  const balancePoint = weights.length > 0
    ? weights.reduce((s, w) => s + w.position * w.mass, 0) / Math.max(1, weights.reduce((s, w) => s + w.mass, 0))
    : 50;

  const totalMassGrains = (totalStringMass / GRAIN_TO_KG) + weights.reduce((s, w) => s + w.mass, 0);
  const fpsLossPer10Gr = 1.8;
  const speedPenalty = (totalWeightMass / GRAIN_TO_KG) * (fpsLossPer10Gr / 10);

  const vibrationReduction = weights.reduce((sum, w) => {
    const pos = w.position / 100;
    const effectiveness = Math.sin(Math.PI * pos);
    return sum + (w.mass / 50) * effectiveness * 25;
  }, 0);

  return {
    fundamentalFreq, harmonics, balancePoint,
    totalMassGrains, speedPenalty,
    vibrationReduction: Math.min(95, vibrationReduction),
    vibratingLength: vibratingLength / INCH_TO_M,
    effectiveMassPerUnit,
    stringMassGrains: totalStringMass / GRAIN_TO_KG,
    weightMassGrains: totalWeightMass / GRAIN_TO_KG,
  };
}

// ─── Draggable Weight Component ────────────────────────────────────
function DraggableWeight({ weight, index, onUpdate, onRemove, svgRef, stringPath, viewBox }) {
  const [dragging, setDragging] = useState(false);

  const getPositionOnString = useCallback((pos, vb) => {
    const margin = vb.w * 0.08;
    const usable = vb.w - 2 * margin;
    const x = margin + (pos / 100) * usable;
    const midX = vb.w / 2;
    const maxSag = vb.h * 0.06;
    const norm = (x - midX) / (usable / 2);
    const y = vb.h * 0.5 - maxSag * (1 - norm * norm);
    return { x, y };
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (e) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const svgX = ((clientX - rect.left) / rect.width) * viewBox.w;
      const margin = viewBox.w * 0.08;
      const usable = viewBox.w - 2 * margin;
      let pct = ((svgX - margin) / usable) * 100;
      pct = Math.max(5, Math.min(95, pct));
      onUpdate(index, { ...weight, position: Math.round(pct * 10) / 10 });
    };
    const handleUp = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [dragging, weight, index, onUpdate, svgRef, viewBox]);

  const pos = getPositionOnString(weight.position, viewBox);

  return (
    <g
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      <rect
        x={pos.x - 6} y={pos.y - 4} width={12} height={8} rx={1.5}
        fill={weight.type === "brass" ? "#C5943A" : "#7A8B99"}
        stroke={dragging ? "#A0FF00" : "#fff"}
        strokeWidth={dragging ? 1.5 : 0.8}
      />
      <rect
        x={pos.x - 5} y={pos.y - 3} width={10} height={6} rx={1}
        fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={0.3}
      />
      <text x={pos.x} y={pos.y + 16} textAnchor="middle"
        fill="#9CA3AF" fontSize="6" fontFamily="'JetBrains Mono', monospace">
        {weight.mass}gr @ {weight.position.toFixed(1)}%
      </text>
    </g>
  );
}

// ─── Side View Canvas ──────────────────────────────────────────────
function SideView({ params, physics, weights, onUpdateWeight, onRemoveWeight }) {
  const svgRef = useRef(null);
  const [time, setTime] = useState(0);
  const [animating, setAnimating] = useState(true);
  const animRef = useRef(null);

  const VB = { w: 600, h: 200 };

  useEffect(() => {
    if (!animating) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    let t = time;
    const tick = () => {
      t += 0.02;
      setTime(t);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [animating]);

  const stringPoints = useMemo(() => {
    const pts = [];
    const margin = VB.w * 0.08;
    const usable = VB.w - 2 * margin;
    const midY = VB.h * 0.5;
    const maxSag = VB.h * 0.06;
    const steps = 200;

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const x = margin + frac * usable;
      const sag = -maxSag * (1 - (2 * frac - 1) ** 2);

      let vibration = 0;
      if (animating) {
        physics.harmonics.forEach(h => {
          const amp = h.amplitude * 4 * Math.exp(-h.damping * 0.3);
          vibration += amp * Math.sin(h.mode * Math.PI * frac) *
            Math.sin(2 * Math.PI * h.freq * time * 0.01) *
            Math.exp(-time * 0.005 * h.mode);
        });
      }
      pts.push({ x, y: midY + sag + vibration });
    }
    return pts;
  }, [time, physics, animating, VB]);

  const pathD = stringPoints.map((p, i) =>
    (i === 0 ? "M" : "L") + `${p.x.toFixed(1)},${p.y.toFixed(1)}`
  ).join(" ");

  const camR = 14;
  const camLX = VB.w * 0.08;
  const camRX = VB.w * 0.92;
  const camY = VB.h * 0.5;

  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ color: "#A0FF00", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }}>
          Side Profile
        </span>
        <button
          onClick={() => { setAnimating(!animating); if (!animating) setTime(0); }}
          style={{
            background: animating ? "rgba(160,255,0,0.15)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${animating ? "#A0FF00" : "#444"}`,
            color: animating ? "#A0FF00" : "#888",
            padding: "3px 10px", borderRadius: 4, cursor: "pointer",
            fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {animating ? "■ STOP" : "▶ VIBRATE"}
        </button>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${VB.w} ${VB.h}`}
        style={{ width: "100%", background: "rgba(0,0,0,0.3)", borderRadius: 8, border: "1px solid #222" }}>

        {/* Grid */}
        {[...Array(11)].map((_, i) => {
          const x = VB.w * 0.08 + (i / 10) * (VB.w * 0.84);
          return <line key={i} x1={x} y1={20} x2={x} y2={VB.h - 20}
            stroke="#1a1a1a" strokeWidth={0.5} strokeDasharray={i % 5 === 0 ? "none" : "2,4"} />;
        })}

        {/* Cam wheels */}
        <circle cx={camLX} cy={camY} r={camR} fill="none" stroke="#333" strokeWidth={2} />
        <circle cx={camLX} cy={camY} r={camR - 3} fill="none" stroke="#2a2a2a" strokeWidth={1} />
        <circle cx={camLX} cy={camY} r={2} fill="#A0FF00" opacity={0.6} />
        <circle cx={camRX} cy={camY} r={camR} fill="none" stroke="#333" strokeWidth={2} />
        <circle cx={camRX} cy={camY} r={camR - 3} fill="none" stroke="#2a2a2a" strokeWidth={1} />
        <circle cx={camRX} cy={camY} r={2} fill="#A0FF00" opacity={0.6} />

        {/* String */}
        <path d={pathD} fill="none" stroke="#D4D4D4" strokeWidth={1.2} />

        {/* Serving zones */}
        <line x1={camLX + camR} y1={camY} x2={camLX + camR + 40} y2={camY - 2}
          stroke="#666" strokeWidth={3} strokeLinecap="round" opacity={0.4} />
        <line x1={camRX - camR - 40} y1={camY - 2} x2={camRX - camR} y2={camY}
          stroke="#666" strokeWidth={3} strokeLinecap="round" opacity={0.4} />

        {/* Center serving */}
        <rect x={VB.w / 2 - 30} y={camY - 8} width={60} height={4}
          rx={2} fill="none" stroke="#555" strokeWidth={0.5} strokeDasharray="2,2" />
        <text x={VB.w / 2} y={camY - 12} textAnchor="middle"
          fill="#555" fontSize="5" fontFamily="'JetBrains Mono', monospace">CENTER SERVING</text>

        {/* Draggable weights */}
        {weights.map((w, i) => (
          <DraggableWeight key={i} weight={w} index={i}
            onUpdate={onUpdateWeight} onRemove={onRemoveWeight}
            svgRef={svgRef} viewBox={VB} />
        ))}

        {/* Scale markers */}
        {[0, 25, 50, 75, 100].map(pct => {
          const x = VB.w * 0.08 + (pct / 100) * (VB.w * 0.84);
          return (
            <text key={pct} x={x} y={VB.h - 8} textAnchor="middle"
              fill="#444" fontSize="6" fontFamily="'JetBrains Mono', monospace">
              {pct}%
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Top-Down View ─────────────────────────────────────────────────
function TopDownView({ params, weights }) {
  const VB = { w: 600, h: 120 };
  const strandCount = params.strandCount;
  const margin = VB.w * 0.08;
  const usable = VB.w - 2 * margin;

  const bundleSpread = Math.min(30, strandCount * 0.8);

  return (
    <div>
      <span style={{ color: "#A0FF00", fontSize: 11, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2, textTransform: "uppercase" }}>
        Top-Down Cross Section
      </span>
      <svg viewBox={`0 0 ${VB.w} ${VB.h}`}
        style={{ width: "100%", background: "rgba(0,0,0,0.3)", borderRadius: 8, border: "1px solid #222", marginTop: 8 }}>

        {/* Individual strands */}
        {[...Array(Math.min(strandCount, 28))].map((_, si) => {
          const offset = ((si / (Math.min(strandCount, 28) - 1)) - 0.5) * bundleSpread;
          const midY = VB.h / 2 + offset;
          let d = `M ${margin},${VB.h / 2}`;

          const weightPositions = weights.map(w => ({
            x: margin + (w.position / 100) * usable,
            squeeze: Math.min(0.3, w.mass / 80),
          }));

          for (let x = margin; x <= margin + usable; x += 2) {
            let y = midY;
            // squeeze strands at weight positions
            weightPositions.forEach(wp => {
              const dist = Math.abs(x - wp.x);
              if (dist < 20) {
                const squeeze = 1 - wp.squeeze * Math.exp(-(dist * dist) / 100);
                y = VB.h / 2 + (y - VB.h / 2) * squeeze;
              }
            });
            // bundle at cam ends
            const fromLeft = (x - margin) / usable;
            const endSqueeze = Math.min(fromLeft * 8, (1 - fromLeft) * 8, 1);
            y = VB.h / 2 + (y - VB.h / 2) * endSqueeze;

            d += ` L${x.toFixed(0)},${y.toFixed(1)}`;
          }
          d += ` L${margin + usable},${VB.h / 2}`;

          return <path key={si} d={d} fill="none" stroke="#888" strokeWidth={0.5} opacity={0.6} />;
        })}

        {/* Weight clamps top-down */}
        {weights.map((w, i) => {
          const x = margin + (w.position / 100) * usable;
          const halfW = 5 + w.mass / 10;
          return (
            <g key={i}>
              <rect x={x - halfW} y={VB.h / 2 - 8} width={halfW * 2} height={16}
                rx={2} fill={w.type === "brass" ? "rgba(197,148,58,0.3)" : "rgba(122,139,153,0.3)"}
                stroke={w.type === "brass" ? "#C5943A" : "#7A8B99"} strokeWidth={0.8} />
              <line x1={x} y1={VB.h / 2 - 10} x2={x} y2={VB.h / 2 + 10}
                stroke={w.type === "brass" ? "#C5943A" : "#7A8B99"} strokeWidth={0.3} strokeDasharray="1,1" />
            </g>
          );
        })}

        {/* Cam attachment points */}
        <circle cx={margin} cy={VB.h / 2} r={4} fill="none" stroke="#333" strokeWidth={1.5} />
        <circle cx={margin + usable} cy={VB.h / 2} r={4} fill="none" stroke="#333" strokeWidth={1.5} />
      </svg>
    </div>
  );
}

// ─── Harmonic Spectrum ─────────────────────────────────────────────
function HarmonicSpectrum({ physics }) {
  const VB = { w: 300, h: 100 };
  const barW = 28;
  const gap = 6;
  const startX = 20;

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`}
      style={{ width: "100%", background: "rgba(0,0,0,0.3)", borderRadius: 8, border: "1px solid #222" }}>
      {physics.harmonics.map((h, i) => {
        const x = startX + i * (barW + gap);
        const maxH = VB.h - 30;
        const barH = h.amplitude * maxH;
        const y = VB.h - 15 - barH;
        const hue = 80 + h.damping * 280;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH}
              rx={2} fill={`hsla(${hue}, 70%, 50%, 0.7)`}
              stroke={`hsla(${hue}, 70%, 60%, 0.9)`} strokeWidth={0.5} />
            <text x={x + barW / 2} y={VB.h - 4} textAnchor="middle"
              fill="#666" fontSize="6" fontFamily="'JetBrains Mono', monospace">
              {h.mode}
            </text>
            <text x={x + barW / 2} y={y - 3} textAnchor="middle"
              fill="#999" fontSize="5" fontFamily="'JetBrains Mono', monospace">
              {(h.amplitude * 100).toFixed(0)}%
            </text>
          </g>
        );
      })}
      <text x={VB.w / 2} y={10} textAnchor="middle"
        fill="#555" fontSize="6" fontFamily="'JetBrains Mono', monospace">
        HARMONIC MODE AMPLITUDES
      </text>
    </svg>
  );
}

// ─── Slider Control ────────────────────────────────────────────────
function Slider({ label, value, min, max, step, unit, onChange }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ color: "#999", fontSize: 11 }}>{label}</span>
        <span style={{ color: "#A0FF00", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
          {typeof value === "number" ? (step < 1 ? value.toFixed(1) : value) : value}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#A0FF00", height: 4 }} />
    </div>
  );
}

// ─── Stat Box ──────────────────────────────────────────────────────
function Stat({ label, value, unit, color, sub }) {
  return (
    <div style={{
      background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "8px 12px",
      border: "1px solid #1a1a1a", flex: 1, minWidth: 120,
    }}>
      <div style={{ color: "#666", fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5,
        fontFamily: "'JetBrains Mono', monospace", marginBottom: 2 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
        <span style={{ color: color || "#fff", fontSize: 20, fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif" }}>{value}</span>
        <span style={{ color: "#666", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}>{unit}</span>
      </div>
      {sub && <div style={{ color: "#555", fontSize: 9, fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────
export default function BowstringSim() {
  const [params, setParams] = useState({
    stringLength: 57.5,
    strandCount: 24,
    material: "BCY-X",
    tension: 350,
    braceHeight: 7.0,
  });

  const [weights, setWeights] = useState([
    { position: 25, mass: 15, type: "brass" },
    { position: 75, mass: 15, type: "brass" },
  ]);

  const [newWeight, setNewWeight] = useState({ mass: 15, type: "brass" });

  const physics = useMemo(() => computePhysics({ ...params, weights }), [params, weights]);

  const updateParam = (key) => (val) => setParams(p => ({ ...p, [key]: val }));

  const updateWeight = useCallback((i, w) => {
    setWeights(prev => { const n = [...prev]; n[i] = w; return n; });
  }, []);

  const removeWeight = useCallback((i) => {
    setWeights(prev => prev.filter((_, j) => j !== i));
  }, []);

  const addWeight = () => {
    if (weights.length >= 8) return;
    setWeights(prev => [...prev, { position: 50, mass: newWeight.mass, type: newWeight.type }]);
  };

  return (
    <div style={{
      fontFamily: "'Space Grotesk', 'Segoe UI', sans-serif",
      background: "#0a0a0a", color: "#e0e0e0",
      minHeight: "100vh", padding: 0,
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #1a1a1a", padding: "16px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 6,
            background: "linear-gradient(135deg, #A0FF00, #6BBF00)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, color: "#000",
          }}>G5</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>Bowstring Dynamics</div>
            <div style={{ fontSize: 10, color: "#666", fontFamily: "'JetBrains Mono', monospace" }}>
              SPEED WEIGHT SIMULATOR v1.0
            </div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: "#444", fontFamily: "'JetBrains Mono', monospace", textAlign: "right" }}>
          PRIME ARCHERY DIV<br />GRACE ENGINEERING
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
        {/* ─── Left Panel: Controls ─────── */}
        <div style={{
          width: 280, minWidth: 280, borderRight: "1px solid #1a1a1a",
          padding: 20, overflowY: "auto", maxHeight: "calc(100vh - 65px)",
        }}>
          <div style={{ color: "#A0FF00", fontSize: 10, letterSpacing: 2, marginBottom: 16,
            fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
            String Parameters
          </div>

          <Slider label="String Length" value={params.stringLength} min={48} max={65} step={0.25} unit='"' onChange={updateParam("stringLength")} />
          <Slider label="Brace Height" value={params.braceHeight} min={5} max={9} step={0.125} unit='"' onChange={updateParam("braceHeight")} />
          <Slider label="Strand Count" value={params.strandCount} min={16} max={32} step={2} unit=" strands" onChange={updateParam("strandCount")} />
          <Slider label="Tension (at rest)" value={params.tension} min={100} max={600} step={10} unit=" lbs" onChange={updateParam("tension")} />

          <div style={{ marginBottom: 12 }}>
            <div style={{ color: "#999", fontSize: 11, marginBottom: 4 }}>String Material</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Object.keys(STRING_MATERIALS).map(m => (
                <button key={m} onClick={() => updateParam("material")(m)}
                  style={{
                    padding: "4px 10px", borderRadius: 4, cursor: "pointer",
                    fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
                    background: params.material === m ? "rgba(160,255,0,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${params.material === m ? "#A0FF00" : "#333"}`,
                    color: params.material === m ? "#A0FF00" : "#888",
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #1a1a1a", paddingTop: 16, marginTop: 16 }}>
            <div style={{ color: "#A0FF00", fontSize: 10, letterSpacing: 2, marginBottom: 12,
              fontFamily: "'JetBrains Mono', monospace" }}>
              SPEED WEIGHTS ({weights.length}/8)
            </div>

            {weights.map((w, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.02)", borderRadius: 6, padding: 10,
                marginBottom: 6, border: "1px solid #1a1a1a",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: w.type === "brass" ? "#C5943A" : "#7A8B99",
                    fontFamily: "'JetBrains Mono', monospace" }}>
                    ● {w.type.toUpperCase()} #{i + 1}
                  </span>
                  <button onClick={() => removeWeight(i)} style={{
                    background: "none", border: "none", color: "#555", cursor: "pointer",
                    fontSize: 14, lineHeight: 1, padding: 0,
                  }}>×</button>
                </div>
                <Slider label="Mass" value={w.mass} min={3} max={50} step={1} unit=" gr"
                  onChange={v => updateWeight(i, { ...w, mass: v })} />
                <Slider label="Position" value={w.position} min={5} max={95} step={0.5} unit="%"
                  onChange={v => updateWeight(i, { ...w, position: v })} />
                <div style={{ display: "flex", gap: 4 }}>
                  {["brass", "tungsten"].map(t => (
                    <button key={t} onClick={() => updateWeight(i, { ...w, type: t })}
                      style={{
                        flex: 1, padding: "3px 0", borderRadius: 3, cursor: "pointer",
                        fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                        background: w.type === t ? (t === "brass" ? "rgba(197,148,58,0.15)" : "rgba(122,139,153,0.15)") : "transparent",
                        border: `1px solid ${w.type === t ? (t === "brass" ? "#C5943A" : "#7A8B99") : "#333"}`,
                        color: w.type === t ? (t === "brass" ? "#C5943A" : "#7A8B99") : "#555",
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {weights.length < 8 && (
              <button onClick={addWeight} style={{
                width: "100%", padding: "8px 0", borderRadius: 6,
                background: "rgba(160,255,0,0.05)", border: "1px dashed #333",
                color: "#A0FF00", cursor: "pointer", fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                + ADD WEIGHT
              </button>
            )}
          </div>
        </div>

        {/* ─── Right Panel: Views ──────── */}
        <div style={{ flex: 1, padding: 20, minWidth: 0, overflowY: "auto", maxHeight: "calc(100vh - 65px)" }}>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <Stat label="Fundamental" value={physics.fundamentalFreq.toFixed(1)} unit="Hz" color="#A0FF00" />
            <Stat label="Total Mass" value={physics.totalMassGrains.toFixed(1)} unit="gr"
              sub={`String: ${physics.stringMassGrains.toFixed(1)} + Weights: ${physics.weightMassGrains.toFixed(1)}`} />
            <Stat label="Speed Loss" value={`-${physics.speedPenalty.toFixed(1)}`} unit="fps"
              color={physics.speedPenalty > 5 ? "#ff6b6b" : "#ffd93d"} />
            <Stat label="Vibe Reduction" value={physics.vibrationReduction.toFixed(0)} unit="%"
              color={physics.vibrationReduction > 50 ? "#A0FF00" : "#ffd93d"} />
            <Stat label="Balance" value={physics.balancePoint.toFixed(1)} unit="%"
              color={Math.abs(physics.balancePoint - 50) < 3 ? "#A0FF00" : "#ffd93d"}
              sub={Math.abs(physics.balancePoint - 50) < 3 ? "CENTERED" : physics.balancePoint < 50 ? "CAM-BIASED" : "NOCK-BIASED"} />
          </div>

          {/* Side View */}
          <div style={{ marginBottom: 16 }}>
            <SideView params={params} physics={physics} weights={weights}
              onUpdateWeight={updateWeight} onRemoveWeight={removeWeight} />
          </div>

          {/* Top-Down View */}
          <div style={{ marginBottom: 16 }}>
            <TopDownView params={params} weights={weights} />
          </div>

          {/* Harmonic Spectrum + Info */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <span style={{ color: "#A0FF00", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 2, textTransform: "uppercase" }}>
                Harmonic Spectrum
              </span>
              <div style={{ marginTop: 8 }}>
                <HarmonicSpectrum physics={physics} />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <span style={{ color: "#A0FF00", fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: 2, textTransform: "uppercase" }}>
                Placement Guide
              </span>
              <div style={{
                marginTop: 8, background: "rgba(0,0,0,0.3)", borderRadius: 8,
                border: "1px solid #222", padding: 12, fontSize: 11, color: "#888",
                lineHeight: 1.7, fontFamily: "'JetBrains Mono', monospace",
              }}>
                <div><span style={{ color: "#A0FF00" }}>25%/75%</span> — Standard dampening, targets 2nd harmonic</div>
                <div><span style={{ color: "#A0FF00" }}>33%/67%</span> — Targets 3rd harmonic, less speed loss</div>
                <div><span style={{ color: "#A0FF00" }}>50%</span> — Max fundamental dampening, center mass</div>
                <div><span style={{ color: "#ffd93d" }}>Brass</span> — 8.5 g/cc, affordable, easier to tune</div>
                <div><span style={{ color: "#7A8B99" }}>Tungsten</span> — 19.3 g/cc, compact, less wind drag</div>
                <div style={{ marginTop: 8, color: "#555", borderTop: "1px solid #1a1a1a", paddingTop: 8 }}>
                  Drag weights on the side view to reposition.<br />
                  ~1.8 fps loss per 10 grains added.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
