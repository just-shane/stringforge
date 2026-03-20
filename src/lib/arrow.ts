// ─── Arrow Component Types ──────────────────────────────────────
export interface ArrowShaft {
  id: string;
  name: string;
  manufacturer: string;
  spine: number; // static spine rating (e.g., 300, 400, 500)
  weightPerInch: number; // grains per inch
  innerDiameter: number; // inches
  outerDiameter: number; // inches
  material: "carbon" | "aluminum" | "carbon-aluminum";
}

export interface ArrowComponents {
  shaft: string; // shaft id
  shaftLength: number; // inches (cut length)
  pointWeight: number; // grains (includes insert)
  nockWeight: number; // grains
  fletchingWeight: number; // grains (total for all vanes)
  fletchingLength: number; // inches
  wrapWeight: number; // grains (arrow wrap, 0 if none)
}

export interface ArrowResult {
  totalWeight: number; // grains
  shaftWeight: number; // grains
  foc: number; // front-of-center %
  focRating: string; // "optimal", "high", "low", etc.
  kineticEnergy: number; // ft-lbs at launch
  momentum: number; // slug·ft/s at launch
  staticSpine: number; // shaft spine rating
  dynamicSpine: number; // adjusted for setup
  spineMatch: string; // "stiff", "matched", "weak"
  recommendedSpine: number; // suggested spine for this setup
  launchSpeed: number; // fps
}

export interface TrajectoryPoint {
  distance: number; // yards
  drop: number; // inches (negative = below aim point)
  drift: number; // inches (lateral, from wind)
  velocity: number; // fps
  kineticEnergy: number; // ft-lbs
  momentum: number; // slug·ft/s
  flightTime: number; // seconds
}

export interface BallisticsResult {
  trajectory: TrajectoryPoint[];
  maxRange: number; // yards (where KE drops below ~25 ft-lbs)
  effectiveRange: number; // yards for hunting (KE > 40 ft-lbs)
}

// ─── Shaft Database ─────────────────────────────────────────────
export const ARROW_SHAFTS: ArrowShaft[] = [
  // Easton
  { id: "easton-fmj-340", name: "FMJ 4mm 340", manufacturer: "Easton", spine: 340, weightPerInch: 10.2, innerDiameter: 0.166, outerDiameter: 0.232, material: "carbon-aluminum" },
  { id: "easton-fmj-400", name: "FMJ 4mm 400", manufacturer: "Easton", spine: 400, weightPerInch: 9.5, innerDiameter: 0.166, outerDiameter: 0.232, material: "carbon-aluminum" },
  { id: "easton-axis-300", name: "Axis 5mm 300", manufacturer: "Easton", spine: 300, weightPerInch: 9.0, innerDiameter: 0.204, outerDiameter: 0.246, material: "carbon" },
  { id: "easton-axis-400", name: "Axis 5mm 400", manufacturer: "Easton", spine: 400, weightPerInch: 8.1, innerDiameter: 0.204, outerDiameter: 0.246, material: "carbon" },
  { id: "easton-axis-500", name: "Axis 5mm 500", manufacturer: "Easton", spine: 500, weightPerInch: 7.3, innerDiameter: 0.204, outerDiameter: 0.246, material: "carbon" },

  // Gold Tip
  { id: "gt-hunter-300", name: "Hunter 300", manufacturer: "Gold Tip", spine: 300, weightPerInch: 9.2, innerDiameter: 0.246, outerDiameter: 0.300, material: "carbon" },
  { id: "gt-hunter-340", name: "Hunter 340", manufacturer: "Gold Tip", spine: 340, weightPerInch: 8.6, innerDiameter: 0.246, outerDiameter: 0.300, material: "carbon" },
  { id: "gt-hunter-400", name: "Hunter 400", manufacturer: "Gold Tip", spine: 400, weightPerInch: 7.9, innerDiameter: 0.246, outerDiameter: 0.300, material: "carbon" },
  { id: "gt-hunter-500", name: "Hunter 500", manufacturer: "Gold Tip", spine: 500, weightPerInch: 7.3, innerDiameter: 0.246, outerDiameter: 0.300, material: "carbon" },

  // Victory
  { id: "victory-vap-300", name: "VAP TKO 300", manufacturer: "Victory", spine: 300, weightPerInch: 8.8, innerDiameter: 0.166, outerDiameter: 0.204, material: "carbon" },
  { id: "victory-vap-350", name: "VAP TKO 350", manufacturer: "Victory", spine: 350, weightPerInch: 8.2, innerDiameter: 0.166, outerDiameter: 0.204, material: "carbon" },
  { id: "victory-vap-400", name: "VAP TKO 400", manufacturer: "Victory", spine: 400, weightPerInch: 7.6, innerDiameter: 0.166, outerDiameter: 0.204, material: "carbon" },

  // Black Eagle
  { id: "be-spartan-300", name: "Spartan 300", manufacturer: "Black Eagle", spine: 300, weightPerInch: 8.5, innerDiameter: 0.246, outerDiameter: 0.297, material: "carbon" },
  { id: "be-spartan-400", name: "Spartan 400", manufacturer: "Black Eagle", spine: 400, weightPerInch: 7.8, innerDiameter: 0.246, outerDiameter: 0.297, material: "carbon" },
  { id: "be-spartan-500", name: "Spartan 500", manufacturer: "Black Eagle", spine: 500, weightPerInch: 7.2, innerDiameter: 0.246, outerDiameter: 0.297, material: "carbon" },
];

// ─── Arrow Weight Calculation ───────────────────────────────────
export function computeArrowWeight(components: ArrowComponents): {
  total: number;
  shaftWeight: number;
  breakdown: { shaft: number; point: number; nock: number; fletching: number; wrap: number };
} {
  const shaft = ARROW_SHAFTS.find((s) => s.id === components.shaft);
  if (!shaft) throw new Error(`Unknown shaft: ${components.shaft}`);

  const shaftWeight = shaft.weightPerInch * components.shaftLength;

  const breakdown = {
    shaft: shaftWeight,
    point: components.pointWeight,
    nock: components.nockWeight,
    fletching: components.fletchingWeight,
    wrap: components.wrapWeight,
  };

  const total = shaftWeight + components.pointWeight + components.nockWeight + components.fletchingWeight + components.wrapWeight;

  return { total, shaftWeight, breakdown };
}

// ─── FOC (Front of Center) ──────────────────────────────────────
export function computeFOC(components: ArrowComponents): { foc: number; rating: string } {
  const shaft = ARROW_SHAFTS.find((s) => s.id === components.shaft);
  if (!shaft) return { foc: 0, rating: "unknown" };

  const shaftWeight = shaft.weightPerInch * components.shaftLength;
  const totalWeight = shaftWeight + components.pointWeight + components.nockWeight + components.fletchingWeight + components.wrapWeight;

  if (totalWeight <= 0 || components.shaftLength <= 0) return { foc: 0, rating: "unknown" };

  // Balance point measured from nock end (rear = 0, point/tip = shaftLength)
  const nockMoment = components.nockWeight * 0; // at nock (rear)
  const fletchMoment = components.fletchingWeight * (components.fletchingLength / 2); // near rear
  const wrapMoment = components.wrapWeight * components.fletchingLength; // just ahead of fletching
  const shaftMoment = shaftWeight * (components.shaftLength / 2); // center of shaft
  const pointMoment = components.pointWeight * components.shaftLength; // at tip (front)

  const balancePoint = (nockMoment + fletchMoment + wrapMoment + shaftMoment + pointMoment) / totalWeight;

  // FOC% = ((Balance Point / Arrow Length) - 0.5) × 100
  const foc = ((balancePoint / components.shaftLength) - 0.5) * 100;

  let rating: string;
  if (foc < 7) rating = "Low — less forgiving";
  else if (foc <= 12) rating = "Optimal for target";
  else if (foc <= 15) rating = "Optimal for hunting";
  else if (foc <= 30) rating = "High FOC — max penetration";
  else rating = "Extreme — specialized";

  return { foc, rating };
}

// ─── Spine Matching ─────────────────────────────────────────────
// Static spine: AMO standard — deflection under 1.94 lb weight on 29" span
// Spine number = deflection × 1000 (lower number = stiffer)

export function computeDynamicSpine(
  staticSpine: number,
  shaftLength: number,
  pointWeight: number,
  drawWeight: number,
  bowType: "compound" | "recurve" | "longbow" | "crossbow",
): number {
  // Start with static spine
  let dynamic = staticSpine;

  // Shaft length adjustment: each inch shorter than 29" stiffens by ~3-5 spine points
  // each inch longer weakens by ~3-5 spine points
  const lengthDelta = shaftLength - 29;
  dynamic += lengthDelta * 4;

  // Point weight adjustment: each 25gr over 100gr weakens by ~10-15 spine points
  const pointDelta = pointWeight - 100;
  dynamic += (pointDelta / 25) * 12;

  // Cam aggression factor (compounds are harsher on spine)
  if (bowType === "compound") {
    dynamic *= 0.95; // compound cams effectively stiffen requirement
  } else if (bowType === "longbow") {
    dynamic *= 1.05; // longbows are more forgiving
  }

  return Math.round(dynamic);
}

export function getRecommendedSpine(
  drawWeight: number,
  drawLength: number,
  pointWeight: number,
  bowType: "compound" | "recurve" | "longbow" | "crossbow",
): number {
  // Base spine from draw weight (compound baseline)
  let spine: number;
  if (drawWeight >= 70) spine = 300;
  else if (drawWeight >= 60) spine = 340;
  else if (drawWeight >= 50) spine = 400;
  else if (drawWeight >= 40) spine = 500;
  else if (drawWeight >= 30) spine = 600;
  else spine = 700;

  // Adjust for draw length (longer draw = more energy = need stiffer)
  if (drawLength > 29) spine -= (drawLength - 29) * 15;
  if (drawLength < 27) spine += (27 - drawLength) * 15;

  // Point weight adjustment
  if (pointWeight > 125) spine += (pointWeight - 125) / 25 * 20;
  if (pointWeight < 85) spine -= (85 - pointWeight) / 25 * 15;

  // Bow type adjustment
  if (bowType === "recurve") spine += 50; // recurves need weaker spine
  if (bowType === "longbow") spine += 80;

  // Snap to nearest standard spine
  const standards = [250, 300, 340, 350, 400, 500, 600, 700, 800, 1000];
  return standards.reduce((prev, curr) =>
    Math.abs(curr - spine) < Math.abs(prev - spine) ? curr : prev,
  );
}

export function getSpineMatch(dynamicSpine: number, recommendedSpine: number): string {
  const diff = dynamicSpine - recommendedSpine;
  if (Math.abs(diff) <= 30) return "Matched";
  if (diff < -30) return "Too stiff";
  return "Too weak";
}

// ─── Ballistics Engine ──────────────────────────────────────────
const AIR_DENSITY = 1.225; // kg/m³ at sea level
const GRAVITY = 9.80665; // m/s²
const GRAIN_TO_KG = 0.0000648;
const FPS_TO_MS = 0.3048;
const M_TO_INCH = 39.3701;
const M_TO_YARD = 1.09361;

export function computeBallistics(
  arrowWeightGrains: number,
  launchSpeedFPS: number,
  arrowDiameter: number, // inches
  windSpeedMPH: number = 0,
  maxDistanceYards: number = 100,
): BallisticsResult {
  const mass = arrowWeightGrains * GRAIN_TO_KG;
  const v0 = launchSpeedFPS * FPS_TO_MS;
  const radius = (arrowDiameter / 2) * 0.0254; // to meters
  const area = Math.PI * radius * radius;
  const cd = 1.8; // drag coefficient for fletched arrow
  const windSpeed = windSpeedMPH * 0.44704; // mph to m/s

  // Numerical integration (Euler method, small dt)
  const dt = 0.0005; // seconds
  let x = 0, y = 0; // position (m), y = vertical (up positive)
  let vx = v0, vy = 0; // velocity (m/s)
  let t = 0;

  const trajectory: TrajectoryPoint[] = [];
  let nextYardMark = 10;

  // Arrow is launched horizontally (0° elevation for simplicity — sighted in)
  while (x * M_TO_YARD <= maxDistanceYards && t < 5) {
    // Speed
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed < 1) break;

    // Drag force (opposing velocity)
    const dragMag = 0.5 * cd * AIR_DENSITY * area * speed * speed;
    const ax = -dragMag * (vx / speed) / mass;
    const ay = -GRAVITY - dragMag * (vy / speed) / mass;

    // Wind drift (cross-wind force)
    const windForce = 0.5 * cd * AIR_DENSITY * area * windSpeed * windSpeed * 0.3;
    const az_drift = windForce / mass; // lateral acceleration

    // Update
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;

    // Record at yard marks
    const currentYards = x * M_TO_YARD;
    if (currentYards >= nextYardMark) {
      const currentFPS = speed / FPS_TO_MS;
      const ke = (arrowWeightGrains * currentFPS * currentFPS) / 450800;
      const mom = (arrowWeightGrains * currentFPS) / 225400;
      const driftInches = 0.5 * az_drift * t * t * M_TO_INCH;

      trajectory.push({
        distance: nextYardMark,
        drop: y * M_TO_INCH,
        drift: driftInches,
        velocity: currentFPS,
        kineticEnergy: ke,
        momentum: mom,
        flightTime: t,
      });

      nextYardMark += 10;
    }
  }

  // Find ranges
  const maxRange = trajectory.length > 0
    ? (trajectory.findLast((p) => p.kineticEnergy >= 25)?.distance ?? 0)
    : 0;
  const effectiveRange = trajectory.length > 0
    ? (trajectory.findLast((p) => p.kineticEnergy >= 40)?.distance ?? 0)
    : 0;

  return { trajectory, maxRange, effectiveRange };
}

// ─── Full Arrow Computation ─────────────────────────────────────
export function computeArrow(
  components: ArrowComponents,
  launchSpeedFPS: number,
  drawWeight: number,
  drawLength: number,
  bowType: "compound" | "recurve" | "longbow" | "crossbow",
  windSpeedMPH: number = 0,
): ArrowResult {
  const shaft = ARROW_SHAFTS.find((s) => s.id === components.shaft);
  if (!shaft) throw new Error(`Unknown shaft: ${components.shaft}`);

  const { total, shaftWeight } = computeArrowWeight(components);
  const { foc, rating } = computeFOC(components);

  const dynamicSpine = computeDynamicSpine(
    shaft.spine,
    components.shaftLength,
    components.pointWeight,
    drawWeight,
    bowType,
  );

  const recommendedSpine = getRecommendedSpine(drawWeight, drawLength, components.pointWeight, bowType);
  const spineMatch = getSpineMatch(dynamicSpine, recommendedSpine);

  // Recalculate launch speed with actual arrow weight (vs reference 350gr)
  // Heavier arrows = slower, lighter = faster
  // Using momentum conservation approximation
  const refWeight = 350;
  const speedRatio = Math.sqrt(refWeight / total);
  const actualSpeed = launchSpeedFPS * speedRatio;

  const ke = (total * actualSpeed * actualSpeed) / 450800;
  const momentum = (total * actualSpeed) / 225400;

  return {
    totalWeight: total,
    shaftWeight,
    foc,
    focRating: rating,
    kineticEnergy: ke,
    momentum,
    staticSpine: shaft.spine,
    dynamicSpine,
    spineMatch,
    recommendedSpine,
    launchSpeed: actualSpeed,
  };
}
