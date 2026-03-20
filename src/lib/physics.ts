// ─── Constants ──────────────────────────────────────────────────
export const GRAIN_TO_KG = 0.0000648;
export const INCH_TO_M = 0.0254;
export const LBF_TO_N = 4.44822;
export const HARMONIC_MODES = 8;

// ─── Types ──────────────────────────────────────────────────────
export type WeightType = "brass" | "tungsten";

export interface Weight {
  position: number; // 0-100 (% along string)
  mass: number; // grains
  type: WeightType;
}

export interface StringMaterial {
  density: number; // g/m per strand (approx)
  modulus: number; // GPa (tensile modulus)
  stretchPct: number; // % elongation under load
}

export interface SimParams {
  stringLength: number; // inches
  strandCount: number;
  material: string;
  tension: number; // lbs (at rest)
  braceHeight: number; // inches
}

export interface Harmonic {
  mode: number;
  freq: number; // Hz
  amplitude: number; // 0-1 normalized
  damping: number; // 0-1
}

export interface PhysicsResult {
  fundamentalFreq: number;
  harmonics: Harmonic[];
  balancePoint: number;
  totalMassGrains: number;
  speedPenalty: number;
  vibrationReduction: number;
  vibratingLength: number; // inches
  effectiveMassPerUnit: number;
  stringMassGrains: number;
  weightMassGrains: number;
}

// ─── Material Database ──────────────────────────────────────────
export const STRING_MATERIALS: Record<string, StringMaterial> = {
  "BCY-X": { density: 0.0052, modulus: 7.5, stretchPct: 0.5 },
  "452X": { density: 0.0048, modulus: 7.2, stretchPct: 0.8 },
  "8190": { density: 0.0044, modulus: 6.8, stretchPct: 1.0 },
  D97: { density: 0.0046, modulus: 6.5, stretchPct: 1.2 },
};

// ─── Speed penalty constant ─────────────────────────────────────
// ~1.8 fps loss per 10 grains of added string weight
const FPS_LOSS_PER_10_GRAINS = 1.8;

// ─── Core Physics Computation ───────────────────────────────────
export function computePhysics(params: SimParams, weights: Weight[]): PhysicsResult {
  const mat = STRING_MATERIALS[params.material];
  if (!mat) {
    throw new Error(`Unknown string material: ${params.material}`);
  }

  // Convert to SI
  const L = params.stringLength * INCH_TO_M;
  const braceM = params.braceHeight * INCH_TO_M;

  // Vibrating length: the free span between cam contact points, adjusted for brace height geometry
  // String forms a triangle: half-length hypotenuse, brace height as one leg
  const vibratingLength =
    Math.sqrt(Math.max(0.01, (L / 2) ** 2 - braceM ** 2)) * 2;

  // String mass
  const stringMassPerUnit = (mat.density * params.strandCount) / 1000; // kg/m
  const totalStringMass = stringMassPerUnit * L; // kg

  // Weight mass
  const totalWeightMass = weights.reduce((sum, w) => sum + w.mass * GRAIN_TO_KG, 0);

  // Effective linear mass density (distribute all mass over string length)
  const effectiveMassPerUnit = (totalStringMass + totalWeightMass) / L;

  // Tension in Newtons
  const T = params.tension * LBF_TO_N;

  // Fundamental frequency: f₁ = (1/2L) × √(T/μ)
  const fundamentalFreq = (1 / (2 * vibratingLength)) * Math.sqrt(T / effectiveMassPerUnit);

  // Compute first 8 harmonics with weight-based damping
  const harmonics: Harmonic[] = [];
  for (let n = 1; n <= HARMONIC_MODES; n++) {
    let amplitude = 1 / n;

    // Each weight damps harmonics based on proximity to antinodes
    weights.forEach((w) => {
      const pos = w.position / 100;
      const nodeProximity = Math.abs(Math.sin(n * Math.PI * pos));
      const dampFactor =
        1 -
        ((w.mass * GRAIN_TO_KG) / (totalStringMass + totalWeightMass)) *
          nodeProximity *
          3;
      amplitude *= Math.max(0.01, dampFactor);
    });

    harmonics.push({
      mode: n,
      freq: fundamentalFreq * n,
      amplitude,
      damping: 1 - amplitude,
    });
  }

  // Balance point: weighted average position of all weights
  const balancePoint =
    weights.length > 0
      ? weights.reduce((sum, w) => sum + w.position * w.mass, 0) /
        Math.max(1, weights.reduce((sum, w) => sum + w.mass, 0))
      : 50;

  // Mass totals in grains
  const stringMassGrains = totalStringMass / GRAIN_TO_KG;
  const weightMassGrains = totalWeightMass / GRAIN_TO_KG;
  const totalMassGrains = stringMassGrains + weightMassGrains;

  // Speed penalty from added weight
  const speedPenalty = weightMassGrains * (FPS_LOSS_PER_10_GRAINS / 10);

  // Vibration reduction: effectiveness based on weight position relative to antinodes
  const vibrationReduction = Math.min(
    95,
    weights.reduce((sum, w) => {
      const effectiveness = Math.sin(Math.PI * (w.position / 100));
      return sum + (w.mass / 50) * effectiveness * 25;
    }, 0),
  );

  return {
    fundamentalFreq,
    harmonics,
    balancePoint,
    totalMassGrains,
    speedPenalty,
    vibrationReduction,
    vibratingLength: vibratingLength / INCH_TO_M,
    effectiveMassPerUnit,
    stringMassGrains,
    weightMassGrains,
  };
}
