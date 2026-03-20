// ─── Sound & Vibration Analysis ────────────────────────────────
// Audio synthesis, vibration waterfall, and decibel estimation

import type { Harmonic, EnergyBreakdown, BowType } from "./physics.ts";

// ─── Audio Synthesis ───────────────────────────────────────────
// Generate realistic bowstring "twang" from harmonic spectrum data

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

export interface SynthParams {
  harmonics: Harmonic[];
  fundamentalFreq: number;
  duration: number; // seconds
  volume: number; // 0-1
}

export function synthesizeBowSound(params: SynthParams): void {
  const ctx = getAudioContext();
  const { harmonics, duration, volume } = params;
  const now = ctx.currentTime;

  // Master gain
  const master = ctx.createGain();
  master.gain.setValueAtTime(volume * 0.3, now);
  master.gain.exponentialRampToValueAtTime(0.001, now + duration);
  master.connect(ctx.destination);

  harmonics.forEach((h) => {
    if (h.freq > 20000 || h.freq < 20) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.frequency.setValueAtTime(h.freq, now);
    osc.type = "sine";

    // Each harmonic has its own amplitude envelope
    const peakGain = h.amplitude * (1 - h.damping * 0.5);
    // Higher harmonics decay faster
    const decayTime = duration * (1 / h.mode);

    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.05, decayTime));

    osc.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + duration);
  });

  // Add a subtle noise burst for the initial "snap"
  const bufferSize = ctx.sampleRate * 0.02; // 20ms
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(volume * 0.15, now);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  noise.connect(noiseGain);
  noiseGain.connect(master);
  noise.start(now);
}

// ─── Vibration Waterfall Data ──────────────────────────────────
// Time-frequency data for waterfall visualization

export interface WaterfallPoint {
  time: number; // seconds
  freq: number; // Hz
  amplitude: number; // 0-1
}

export interface WaterfallData {
  points: WaterfallPoint[];
  timeSlices: number;
  maxFreq: number;
  duration: number;
}

export function computeWaterfall(
  harmonics: Harmonic[],
  duration: number = 0.5,
  timeSlices: number = 40,
): WaterfallData {
  const points: WaterfallPoint[] = [];
  const maxFreq = Math.max(...harmonics.map((h) => h.freq), 100);

  for (let t = 0; t < timeSlices; t++) {
    const time = (t / timeSlices) * duration;
    const tNorm = time / duration;

    harmonics.forEach((h) => {
      // Exponential decay with mode-dependent rate
      const decayRate = 3 + h.mode * 2; // higher modes decay faster
      const dampingFactor = 1 - h.damping * 0.3;
      const amp = h.amplitude * dampingFactor * Math.exp(-decayRate * tNorm);

      if (amp > 0.005) {
        points.push({
          time,
          freq: h.freq,
          amplitude: Math.min(1, amp),
        });
      }
    });
  }

  return { points, timeSlices, maxFreq, duration };
}

// ─── Decibel Estimation ────────────────────────────────────────
// Approximate shot noise level based on energy dissipation

export interface NoiseEstimate {
  peakDb: number; // dB at 1 meter
  sustainedDb: number; // average dB during vibration
  rating: string; // "quiet", "moderate", "loud"
  comparison: string; // real-world comparison
  vibrationEnergy: number; // ft-lbs dissipated as sound + vibration
}

export function estimateNoise(
  energy: EnergyBreakdown,
  bowType: BowType,
  vibrationReduction: number, // 0-100
): NoiseEstimate {
  // Sound energy is a fraction of total stored energy
  const soundEnergy = energy.soundLoss + energy.vibrationLoss;
  const vibrationEnergy = soundEnergy;

  // Convert ft-lbs to joules
  const soundJoules = energy.soundLoss * 1.35582;

  // Empirical model calibrated to real bow measurements:
  // Compound with dampeners: ~75-85 dB at 1m
  // Recurve: ~80-90 dB at 1m
  // Longbow: ~85-95 dB at 1m
  // Crossbow: ~70-80 dB at 1m

  // Base dB from sound energy (log scale, calibrated)
  const baseSPL = 55 + 10 * Math.log10(Math.max(0.01, soundJoules) / 0.1);

  // Bow type modifier
  const typeModifier: Record<BowType, number> = {
    compound: -2, // dampeners standard
    recurve: 4, // exposed limb tips
    longbow: 7, // most limb vibration
    crossbow: -5, // contained, mechanical
  };

  // Vibration reduction (string silencers, stabilizers)
  const reductionModifier = -(vibrationReduction / 100) * 10; // up to -10 dB

  const peakDb = Math.max(40, Math.min(115,
    baseSPL + typeModifier[bowType] + reductionModifier,
  ));
  const sustainedDb = peakDb - 15;

  let rating: string;
  let comparison: string;
  if (peakDb < 65) {
    rating = "Whisper quiet";
    comparison = "Normal conversation (60 dB)";
  } else if (peakDb < 75) {
    rating = "Quiet";
    comparison = "Vacuum cleaner (70 dB)";
  } else if (peakDb < 85) {
    rating = "Moderate";
    comparison = "City traffic (80 dB)";
  } else if (peakDb < 95) {
    rating = "Loud";
    comparison = "Lawn mower (90 dB)";
  } else {
    rating = "Very loud";
    comparison = "Power tools (100 dB)";
  }

  return {
    peakDb: Math.round(peakDb),
    sustainedDb: Math.round(sustainedDb),
    rating,
    comparison,
    vibrationEnergy,
  };
}

// ─── Draw Cycle Animation Data ─────────────────────────────────
// Generates frame data for animated draw sequence

export interface DrawFrame {
  drawPosition: number; // 0-1 normalized
  drawInches: number; // actual inches
  forceAtDraw: number; // lbs at this draw position
  limbDeflection: number; // degrees of limb tip deflection
  camRotation: number; // degrees (compounds only)
  stringPath: { x: number; y: number }[]; // control points for string
  holdingWeight: number; // instantaneous holding weight
  storedEnergySoFar: number; // ft-lbs accumulated
}

export interface DrawCycleData {
  frames: DrawFrame[];
  bowType: BowType;
  peakWeight: number;
  drawLength: number;
  totalStoredEnergy: number;
}

export function computeDrawCycle(
  bowType: BowType,
  drawWeight: number,
  drawLength: number,
  braceHeight: number,
  getForceAtDraw: (bowType: BowType, normalizedDraw: number) => number,
  frameCount: number = 60,
): DrawCycleData {
  const frames: DrawFrame[] = [];
  let accumulatedEnergy = 0;
  const powerStroke = drawLength - braceHeight;

  for (let i = 0; i <= frameCount; i++) {
    const normalizedDraw = i / frameCount;
    const drawInches = braceHeight + normalizedDraw * powerStroke;
    const force = getForceAtDraw(bowType, normalizedDraw) * drawWeight;

    // Accumulate energy (trapezoidal rule)
    if (i > 0) {
      const prevForce = getForceAtDraw(bowType, (i - 1) / frameCount) * drawWeight;
      accumulatedEnergy += ((prevForce + force) / 2) * (powerStroke / frameCount) / 12; // to ft-lbs
    }

    // Limb deflection: proportional to force
    const maxDeflection = bowType === "longbow" ? 25 : bowType === "recurve" ? 22 : 18;
    const limbDeflection = (force / drawWeight) * maxDeflection;

    // Cam rotation: 0-180° over draw (compounds only)
    const camRotation = bowType === "compound" || bowType === "crossbow"
      ? normalizedDraw * 180
      : 0;

    // String path (simplified 3 control points)
    const stringMid = drawInches / drawLength;
    const stringPath = [
      { x: 0, y: 0 },
      { x: stringMid, y: 0.5 },
      { x: 0, y: 1 },
    ];

    frames.push({
      drawPosition: normalizedDraw,
      drawInches,
      forceAtDraw: force,
      limbDeflection,
      camRotation,
      stringPath,
      holdingWeight: force,
      storedEnergySoFar: accumulatedEnergy,
    });
  }

  return {
    frames,
    bowType,
    peakWeight: drawWeight,
    drawLength,
    totalStoredEnergy: accumulatedEnergy,
  };
}
