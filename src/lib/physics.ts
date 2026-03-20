// ─── Constants ──────────────────────────────────────────────────
export const GRAIN_TO_KG = 0.0000648;
export const INCH_TO_M = 0.0254;
export const LBF_TO_N = 4.44822;
export const HARMONIC_MODES = 8;

// ─── Bow Types ──────────────────────────────────────────────────
export type BowType = "compound" | "recurve" | "longbow" | "crossbow";

export interface BowProfile {
  id: BowType;
  name: string;
  description: string;
  defaultDrawWeight: number; // lbs peak
  defaultDrawLength: number; // inches
  defaultStringLength: number; // inches
  defaultBraceHeight: number; // inches
  efficiency: number; // 0-1 energy transfer efficiency
  letOff: number; // 0-1 (compounds only, 0 for others)
  limbMassFraction: number; // fraction of limb mass contributing to energy loss
  hysteresisLoss: number; // fraction of stored energy lost to hysteresis
}

export const BOW_PROFILES: Record<BowType, BowProfile> = {
  compound: {
    id: "compound",
    name: "Compound",
    description: "Cam-driven, high efficiency",
    defaultDrawWeight: 70,
    defaultDrawLength: 30,
    defaultStringLength: 57.5,
    defaultBraceHeight: 7.0,
    efficiency: 0.82,
    letOff: 0.80,
    limbMassFraction: 0.08,
    hysteresisLoss: 0.04,
  },
  recurve: {
    id: "recurve",
    name: "Recurve",
    description: "Curved limb tips, Olympic style",
    defaultDrawWeight: 40,
    defaultDrawLength: 28,
    defaultStringLength: 66,
    defaultBraceHeight: 8.5,
    efficiency: 0.74,
    letOff: 0,
    limbMassFraction: 0.10,
    hysteresisLoss: 0.05,
  },
  longbow: {
    id: "longbow",
    name: "Longbow",
    description: "Traditional, linear draw",
    defaultDrawWeight: 45,
    defaultDrawLength: 28,
    defaultStringLength: 68,
    defaultBraceHeight: 7.5,
    efficiency: 0.65,
    letOff: 0,
    limbMassFraction: 0.12,
    hysteresisLoss: 0.06,
  },
  crossbow: {
    id: "crossbow",
    name: "Crossbow",
    description: "Mechanical, short power stroke",
    defaultDrawWeight: 150,
    defaultDrawLength: 14,
    defaultStringLength: 34,
    defaultBraceHeight: 5.0,
    efficiency: 0.78,
    letOff: 0,
    limbMassFraction: 0.09,
    hysteresisLoss: 0.05,
  },
};

// ─── Force-Draw Curves ──────────────────────────────────────────
// Returns force at a given draw displacement (0-1 normalized) as fraction of peak draw weight
export function getForceAtDraw(bowType: BowType, normalizedDraw: number): number {
  const d = Math.max(0, Math.min(1, normalizedDraw));

  switch (bowType) {
    case "longbow":
      // Linear (Hookean): F(x) ≈ k·x
      return d;

    case "recurve":
      // Supra-linear early, flattening at full draw
      // F(x) = x^0.7 (rises fast early, flattens)
      return Math.pow(d, 0.7);

    case "compound": {
      // Peak early (~40%), plateau, sharp drop at wall (let-off)
      if (d < 0.15) return d / 0.15; // ramp to peak
      if (d < 0.4) return 1.0; // peak plateau
      if (d < 0.7) return 1.0 - 0.6 * ((d - 0.4) / 0.3); // drop toward valley
      if (d < 0.85) return 0.4 - 0.15 * ((d - 0.7) / 0.15); // valley
      // Wall: slight force increase
      return 0.25 + 0.05 * ((d - 0.85) / 0.15);
    }

    case "crossbow":
      // Similar to compound but shorter, more aggressive
      if (d < 0.1) return d / 0.1;
      if (d < 0.5) return 1.0;
      if (d < 0.8) return 1.0 - 0.3 * ((d - 0.5) / 0.3);
      return 0.7;
  }
}

// Generate draw curve data points for visualization
export function getDrawCurvePoints(bowType: BowType, drawWeight: number, drawLength: number, steps = 50): { draw: number; force: number }[] {
  const points: { draw: number; force: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const d = i / steps;
    points.push({
      draw: d * drawLength,
      force: getForceAtDraw(bowType, d) * drawWeight,
    });
  }
  return points;
}

// ─── Types ──────────────────────────────────────────────────────
export type WeightType = "brass" | "tungsten";

export interface Weight {
  position: number; // 0-100 (% along string)
  mass: number; // grains
  type: WeightType;
}

export interface StringMaterial {
  name: string;
  density: number; // g/m per strand (approx)
  modulus: number; // GPa (tensile modulus)
  stretchPct: number; // % elongation under load (recoverable)
  creepRate: number; // % per 1000 shots (permanent deformation)
  tensileStrength: number; // lbs per strand
  feetPerLb: number; // feet of material per pound (waxed)
}

export interface SimParams {
  bowType: BowType;
  stringLength: number; // inches
  strandCount: number;
  material: string;
  tension: number; // lbs (at rest)
  braceHeight: number; // inches
  drawWeight: number; // lbs (peak)
  drawLength: number; // inches
}

export interface Harmonic {
  mode: number;
  freq: number; // Hz
  amplitude: number; // 0-1 normalized
  damping: number; // 0-1
}

export interface EnergyBreakdown {
  storedEnergy: number; // ft-lbs
  arrowKE: number; // ft-lbs (placeholder until arrow system)
  limbKE: number; // ft-lbs
  stringKE: number; // ft-lbs
  hysteresisLoss: number; // ft-lbs
  vibrationLoss: number; // ft-lbs
  soundLoss: number; // ft-lbs
  efficiency: number; // 0-1
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
  energy: EnergyBreakdown;
  estimatedFPS: number; // estimated arrow speed
  holdingWeight: number; // weight at full draw (after let-off)
  braceHeightEffect: number; // fps change from brace height deviation
  camWrapLength: number; // inches of string consumed by cam contact
  strandRecommendation: { min: number; max: number };
}

// ─── Material Database ──────────────────────────────────────────
export const STRING_MATERIALS: Record<string, StringMaterial> = {
  "BCY-X": {
    name: "BCY-X",
    density: 0.0052,
    modulus: 7.5,
    stretchPct: 0.5,
    creepRate: 0.01,
    tensileStrength: 90,
    feetPerLb: 220,
  },
  "452X": {
    name: "452X",
    density: 0.0048,
    modulus: 7.2,
    stretchPct: 0.8,
    creepRate: 0.02,
    tensileStrength: 80,
    feetPerLb: 240,
  },
  "8190": {
    name: "8190",
    density: 0.0044,
    modulus: 6.8,
    stretchPct: 1.0,
    creepRate: 0.03,
    tensileStrength: 75,
    feetPerLb: 260,
  },
  D97: {
    name: "D97",
    density: 0.0046,
    modulus: 6.5,
    stretchPct: 1.2,
    creepRate: 0.05,
    tensileStrength: 70,
    feetPerLb: 250,
  },
  "Dacron B-50": {
    name: "Dacron B-50",
    density: 0.0068,
    modulus: 3.5,
    stretchPct: 2.6,
    creepRate: 0.10,
    tensileStrength: 50,
    feetPerLb: 170,
  },
  "Fast Flight": {
    name: "Fast Flight",
    density: 0.0042,
    modulus: 8.0,
    stretchPct: 0.8,
    creepRate: 0.02,
    tensileStrength: 100,
    feetPerLb: 280,
  },
  "8125": {
    name: "8125",
    density: 0.0041,
    modulus: 6.5,
    stretchPct: 1.0,
    creepRate: 0.04,
    tensileStrength: 75,
    feetPerLb: 270,
  },
};

// ─── Speed penalty constant ─────────────────────────────────────
// ~1.8 fps loss per 10 grains of added string weight
const FPS_LOSS_PER_10_GRAINS = 1.8;

// Reference brace height for fps calculation (7" baseline for compounds)
const REF_BRACE_HEIGHT = 7.0;
// Each 1" decrease in brace height ≈ +7-10 fps
const FPS_PER_INCH_BRACE = 8.5;

// Cam wrap: ~35% of cam circumference consumed by string contact
const CAM_WRAP_FRACTION = 0.35;
// Typical compound cam radius in inches
const CAM_RADIUS = 1.75;

// ─── Strand Count Recommendation ───────────────────────────────
export function getStrandRecommendation(
  bowType: BowType,
  drawWeight: number,
  material: string,
): { min: number; max: number } {
  const mat = STRING_MATERIALS[material];
  if (!mat) return { min: 20, max: 24 };

  // Calculate based on safety factor: total strength should be ~4-5x draw weight
  const safetyFactor = 4.5;
  const minStrands = Math.ceil((drawWeight * safetyFactor) / mat.tensileStrength);

  // Adjust by bow type
  switch (bowType) {
    case "compound":
      return { min: Math.max(minStrands, 20), max: Math.max(minStrands + 4, 28) };
    case "recurve":
      if (drawWeight < 30) return { min: Math.max(minStrands, 14), max: 18 };
      if (drawWeight < 38) return { min: Math.max(minStrands, 16), max: 20 };
      return { min: Math.max(minStrands, 18), max: 22 };
    case "longbow":
      // Longbows often use heavier materials (Dacron), need more strands
      return { min: Math.max(minStrands, 12), max: Math.max(minStrands + 4, 18) };
    case "crossbow":
      return { min: Math.max(minStrands, 22), max: Math.max(minStrands + 6, 32) };
  }
}

// ─── Energy Transfer Model ──────────────────────────────────────
function computeStoredEnergy(
  bowType: BowType,
  drawWeight: number,
  drawLength: number,
  braceHeight: number,
): number {
  // Stored energy = area under force-draw curve from brace height to full draw
  // Using numerical integration (trapezoidal rule)
  const powerStroke = drawLength - braceHeight; // effective power stroke in inches
  if (powerStroke <= 0) return 0;

  const steps = 100;
  let energy = 0; // in inch-lbs initially
  const dx = powerStroke / steps;

  for (let i = 0; i < steps; i++) {
    const d1 = (i / steps);
    const d2 = ((i + 1) / steps);
    const f1 = getForceAtDraw(bowType, braceHeight / drawLength + d1 * (1 - braceHeight / drawLength)) * drawWeight;
    const f2 = getForceAtDraw(bowType, braceHeight / drawLength + d2 * (1 - braceHeight / drawLength)) * drawWeight;
    energy += (f1 + f2) / 2 * dx;
  }

  // Convert inch-lbs to ft-lbs
  return energy / 12;
}

function computeEnergyBreakdown(
  bowProfile: BowProfile,
  storedEnergy: number,
  stringMassKg: number,
  totalWeightMassKg: number,
): EnergyBreakdown {
  const efficiency = bowProfile.efficiency;

  // Energy partitioning based on bow type research
  const hysteresisLoss = storedEnergy * bowProfile.hysteresisLoss;
  const limbKE = storedEnergy * bowProfile.limbMassFraction;
  const stringKE = storedEnergy * 0.03; // ~2-5% to string/cable KE
  const vibrationLoss = storedEnergy * 0.03;
  const soundLoss = storedEnergy * 0.015;

  // Arrow KE gets the rest (this is theoretical max — actual depends on arrow mass)
  const arrowKE = storedEnergy * efficiency;

  return {
    storedEnergy,
    arrowKE,
    limbKE,
    stringKE,
    hysteresisLoss,
    vibrationLoss,
    soundLoss,
    efficiency,
  };
}

// ─── Core Physics Computation ───────────────────────────────────
export function computePhysics(params: SimParams, weights: Weight[]): PhysicsResult {
  const mat = STRING_MATERIALS[params.material];
  if (!mat) {
    throw new Error(`Unknown string material: ${params.material}`);
  }

  const bowProfile = BOW_PROFILES[params.bowType];

  // Convert to SI
  const L = params.stringLength * INCH_TO_M;
  const braceM = params.braceHeight * INCH_TO_M;

  // Cam wrap calculation (compounds and crossbows only)
  let camWrapLength = 0;
  if (params.bowType === "compound" || params.bowType === "crossbow") {
    // Two cams, each consuming ~35% of circumference
    camWrapLength = 2 * CAM_WRAP_FRACTION * 2 * Math.PI * CAM_RADIUS;
  }
  const camWrapM = camWrapLength * INCH_TO_M;

  // Vibrating length: free span between cam contact points
  const halfL = L / 2;
  const freeSpan = Math.sqrt(Math.max(0.01, halfL ** 2 - braceM ** 2)) * 2;
  const vibratingLength = Math.max(0.1, freeSpan - camWrapM);

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

  // Brace height effect on speed
  const braceHeightEffect = (REF_BRACE_HEIGHT - params.braceHeight) * FPS_PER_INCH_BRACE;

  // Holding weight (after let-off)
  const holdingWeight = params.drawWeight * (1 - bowProfile.letOff);

  // Strand recommendation
  const strandRecommendation = getStrandRecommendation(params.bowType, params.drawWeight, params.material);

  // Energy model
  const storedEnergy = computeStoredEnergy(
    params.bowType,
    params.drawWeight,
    params.drawLength,
    params.braceHeight,
  );
  const energy = computeEnergyBreakdown(bowProfile, storedEnergy, totalStringMass, totalWeightMass);

  // Estimated FPS using energy balance with a reference 350gr arrow
  // v = sqrt(2 × η × E_stored / m_virtual)
  // m_virtual = m_arrow + m_string/3
  const refArrowMassKg = 350 * GRAIN_TO_KG; // 350 grain reference arrow
  const virtualMass = refArrowMassKg + totalStringMass / 3;
  const storedEnergyJoules = storedEnergy * 1.35582; // ft-lbs to joules
  const arrowVelocity = Math.sqrt(Math.max(0, (2 * bowProfile.efficiency * storedEnergyJoules) / virtualMass));
  // Convert m/s to fps
  const estimatedFPS = arrowVelocity * 3.28084 + braceHeightEffect - speedPenalty;

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
    energy,
    estimatedFPS: Math.max(0, estimatedFPS),
    holdingWeight,
    braceHeightEffect,
    camWrapLength,
    strandRecommendation,
  };
}
