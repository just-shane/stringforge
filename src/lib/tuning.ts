import type { SimParams, Weight } from "./physics.ts";
import { computePhysics } from "./physics.ts";
import type { ArrowComponents } from "./arrow.ts";
import { computeDynamicSpine, getRecommendedSpine, getSpineMatch, ARROW_SHAFTS } from "./arrow.ts";

// ═══════════════════════════════════════════════════════════════
// PAPER TUNE SIMULATOR
// ═══════════════════════════════════════════════════════════════

export type TearDirection = "left" | "right" | "high" | "low" | "bullet" | "high-left" | "high-right" | "low-left" | "low-right";

export interface PaperTuneResult {
  tearDirection: TearDirection;
  tearMagnitude: number; // 0-1 severity
  tearDescription: string;
  causes: string[];
  adjustments: string[];
  nockTravelAngle: number; // degrees from horizontal
  spineContribution: number; // -1 (too stiff) to +1 (too weak)
  nockHeightContribution: number; // -1 (too low) to +1 (too high)
}

export function computePaperTune(
  params: SimParams,
  weights: Weight[],
  arrow: ArrowComponents,
  nockHeight: number, // inches above center (positive = high, typically 1/8" to 3/8")
  restPosition: number, // horizontal rest offset in inches (positive = right for RH, typically 0 = centershot)
  shooterHand: "right" | "left",
): PaperTuneResult {
  const shaft = ARROW_SHAFTS.find((s) => s.id === arrow.shaft);
  if (!shaft) {
    return {
      tearDirection: "bullet",
      tearMagnitude: 0,
      tearDescription: "Unknown shaft",
      causes: [],
      adjustments: [],
      nockTravelAngle: 0,
      spineContribution: 0,
      nockHeightContribution: 0,
    };
  }

  computePhysics(params, weights);
  const dynamicSpine = computeDynamicSpine(
    shaft.spine,
    arrow.shaftLength,
    arrow.pointWeight,
    params.drawWeight,
    params.bowType,
  );
  const recommendedSpine = getRecommendedSpine(
    params.drawWeight,
    params.drawLength,
    arrow.pointWeight,
    params.bowType,
  );

  // Spine mismatch: positive = too weak, negative = too stiff
  const spineDiff = dynamicSpine - recommendedSpine;
  const spineContribution = Math.max(-1, Math.min(1, spineDiff / 100));

  // Nock height contribution: optimal is ~1/8" to 1/4" above center
  const optimalNock = 0.1875; // 3/16" above center
  const nockDiff = nockHeight - optimalNock;
  const nockHeightContribution = Math.max(-1, Math.min(1, nockDiff / 0.5));

  // Rest position contribution
  const restContribution = restPosition * 0.5;

  // Calculate horizontal tear component
  // For RH shooter: too stiff = tail left, too weak = tail right
  const handFactor = shooterHand === "right" ? 1 : -1;
  let horizontalTear = -spineContribution * handFactor + restContribution;

  // Calculate vertical tear component
  let verticalTear = nockHeightContribution;

  // Clamp
  horizontalTear = Math.max(-1, Math.min(1, horizontalTear));
  verticalTear = Math.max(-1, Math.min(1, verticalTear));

  const magnitude = Math.sqrt(horizontalTear ** 2 + verticalTear ** 2);
  const clampedMag = Math.min(1, magnitude);

  // Determine tear direction
  let tearDirection: TearDirection;
  const hThresh = 0.15;
  const vThresh = 0.15;
  const isLeft = horizontalTear < -hThresh;
  const isRight = horizontalTear > hThresh;
  const isHigh = verticalTear > vThresh;
  const isLow = verticalTear < -vThresh;

  if (!isLeft && !isRight && !isHigh && !isLow) {
    tearDirection = "bullet";
  } else if (isHigh && isLeft) tearDirection = "high-left";
  else if (isHigh && isRight) tearDirection = "high-right";
  else if (isLow && isLeft) tearDirection = "low-left";
  else if (isLow && isRight) tearDirection = "low-right";
  else if (isHigh) tearDirection = "high";
  else if (isLow) tearDirection = "low";
  else if (isLeft) tearDirection = "left";
  else tearDirection = "right";

  // Build diagnosis
  const causes: string[] = [];
  const adjustments: string[] = [];

  if (tearDirection === "bullet") {
    return {
      tearDirection,
      tearMagnitude: clampedMag,
      tearDescription: "Clean bullet hole — arrow is well-tuned!",
      causes: ["Arrow spine, nock height, and rest position are all well-matched."],
      adjustments: [],
      nockTravelAngle: Math.atan2(verticalTear, horizontalTear) * (180 / Math.PI),
      spineContribution,
      nockHeightContribution,
    };
  }

  // Horizontal causes
  if (isLeft && shooterHand === "right") {
    causes.push(`Arrow spine may be too stiff (dynamic: ${dynamicSpine}, recommended: ${recommendedSpine})`);
    causes.push("Rest may be positioned too far left");
    adjustments.push("Try a weaker spine shaft (higher number)");
    adjustments.push("Add point weight to weaken dynamic spine");
    adjustments.push("Move rest slightly right (toward archer)");
  } else if (isRight && shooterHand === "right") {
    causes.push(`Arrow spine may be too weak (dynamic: ${dynamicSpine}, recommended: ${recommendedSpine})`);
    causes.push("Rest may be positioned too far right");
    adjustments.push("Try a stiffer spine shaft (lower number)");
    adjustments.push("Reduce point weight to stiffen dynamic spine");
    adjustments.push("Cut arrow shorter to stiffen spine");
    adjustments.push("Move rest slightly left (away from archer)");
  } else if (isLeft && shooterHand === "left") {
    causes.push(`Arrow spine may be too weak (dynamic: ${dynamicSpine}, recommended: ${recommendedSpine})`);
    adjustments.push("Try a stiffer spine shaft (lower number)");
    adjustments.push("Reduce point weight or cut arrow shorter");
  } else if (isRight && shooterHand === "left") {
    causes.push(`Arrow spine may be too stiff (dynamic: ${dynamicSpine}, recommended: ${recommendedSpine})`);
    adjustments.push("Try a weaker spine shaft (higher number)");
    adjustments.push("Add point weight to weaken dynamic spine");
  }

  // Vertical causes
  if (isHigh) {
    causes.push(`Nock point may be too high (currently ${nockHeight.toFixed(3)}" above center)`);
    adjustments.push("Lower the nock point on the string");
    adjustments.push("Check that rest arm is not pushing arrow up");
  }
  if (isLow) {
    causes.push(`Nock point may be too low (currently ${nockHeight.toFixed(3)}" above center)`);
    adjustments.push("Raise the nock point on the string");
    adjustments.push("Check rest arm height");
  }

  const tearDescription = describeTear(tearDirection, clampedMag, shooterHand);

  return {
    tearDirection,
    tearMagnitude: clampedMag,
    tearDescription,
    causes,
    adjustments,
    nockTravelAngle: Math.atan2(verticalTear, horizontalTear) * (180 / Math.PI),
    spineContribution,
    nockHeightContribution,
  };
}

function describeTear(dir: TearDirection, mag: number, hand: string): string {
  const severity = mag < 0.3 ? "Slight" : mag < 0.6 ? "Moderate" : "Significant";
  const dirMap: Record<TearDirection, string> = {
    left: "tail-left",
    right: "tail-right",
    high: "tail-high",
    low: "tail-low",
    bullet: "bullet hole",
    "high-left": "tail high-left",
    "high-right": "tail high-right",
    "low-left": "tail low-left",
    "low-right": "tail low-right",
  };
  return `${severity} ${dirMap[dir]} tear (${hand}-hand shooter)`;
}

// ═══════════════════════════════════════════════════════════════
// BARE SHAFT TUNING
// ═══════════════════════════════════════════════════════════════

export interface BareShaftResult {
  groupSeparation: number; // inches at 20 yards
  direction: "left" | "right" | "matched"; // for RH shooter
  spineAssessment: string;
  adjustment: string;
  fletchedGroupSize: number; // estimated group size in inches
  bareGroupSize: number; // estimated bare shaft group size
}

export function computeBareShaftTune(
  params: SimParams,
  arrow: ArrowComponents,
): BareShaftResult {
  const shaft = ARROW_SHAFTS.find((s) => s.id === arrow.shaft);
  if (!shaft) {
    return {
      groupSeparation: 0,
      direction: "matched",
      spineAssessment: "Unknown shaft",
      adjustment: "",
      fletchedGroupSize: 3,
      bareGroupSize: 5,
    };
  }

  const dynamicSpine = computeDynamicSpine(
    shaft.spine,
    arrow.shaftLength,
    arrow.pointWeight,
    params.drawWeight,
    params.bowType,
  );
  const recommended = getRecommendedSpine(
    params.drawWeight,
    params.drawLength,
    arrow.pointWeight,
    params.bowType,
  );
  const match = getSpineMatch(dynamicSpine, recommended);

  const spineDiff = dynamicSpine - recommended;
  // Group separation roughly proportional to spine mismatch
  // ~1" separation per 20 spine points of mismatch at 20 yards
  const separation = Math.abs(spineDiff) / 20;

  const direction: "left" | "right" | "matched" =
    Math.abs(spineDiff) < 20 ? "matched" :
    spineDiff > 0 ? "right" : "left"; // for RH: weak goes right, stiff goes left

  const fletchedGroupSize = 1.5 + Math.abs(spineDiff) * 0.01;
  const bareGroupSize = 3 + Math.abs(spineDiff) * 0.04;

  let spineAssessment: string;
  let adjustment: string;

  if (direction === "matched") {
    spineAssessment = "Spine is well-matched — bare shafts and fletched arrows should group together.";
    adjustment = "No adjustment needed. Fine-tune with micro rest adjustments if desired.";
  } else if (direction === "right") {
    spineAssessment = `Arrow is ${match.toLowerCase()} (dynamic ${dynamicSpine} vs recommended ${recommended}). Bare shafts will impact right of fletched group (RH shooter).`;
    adjustment = "Stiffen spine: try shorter shaft, lighter point, or stiffer spine shaft.";
  } else {
    spineAssessment = `Arrow is ${match.toLowerCase()} (dynamic ${dynamicSpine} vs recommended ${recommended}). Bare shafts will impact left of fletched group (RH shooter).`;
    adjustment = "Weaken spine: try longer shaft, heavier point, or weaker spine shaft.";
  }

  return {
    groupSeparation: separation,
    direction,
    spineAssessment,
    adjustment,
    fletchedGroupSize,
    bareGroupSize,
  };
}

// ═══════════════════════════════════════════════════════════════
// WALK-BACK TUNING
// ═══════════════════════════════════════════════════════════════

export interface WalkBackPoint {
  distance: number; // yards
  horizontalOffset: number; // inches from vertical line (positive = right)
}

export interface WalkBackResult {
  points: WalkBackPoint[];
  centershotDrift: number; // inches per 10 yards of drift
  diagnosis: string;
  adjustment: string;
}

export function computeWalkBackTune(
  params: SimParams,
  arrow: ArrowComponents,
  restOffset: number, // centershot offset in inches (0 = perfect)
): WalkBackResult {
  // Walk-back: shoot at a vertical line at increasing distances
  // If centershot is off, arrows drift progressively to one side
  const distances = [10, 15, 20, 25, 30, 35, 40];

  const shaft = ARROW_SHAFTS.find((s) => s.id === arrow.shaft);
  const spineDiff = shaft
    ? computeDynamicSpine(shaft.spine, arrow.shaftLength, arrow.pointWeight, params.drawWeight, params.bowType) -
      getRecommendedSpine(params.drawWeight, params.drawLength, arrow.pointWeight, params.bowType)
    : 0;

  // Drift is proportional to centershot error and spine mismatch
  // Centershot contributes ~0.5" per 10 yards per 1/16" offset
  // Spine mismatch adds a smaller constant drift
  const centershotDrift = restOffset * 8; // inches per 10 yards
  const spineDrift = spineDiff * 0.005; // small contribution

  const totalDriftPer10 = centershotDrift + spineDrift;

  const points: WalkBackPoint[] = distances.map((d) => ({
    distance: d,
    horizontalOffset: totalDriftPer10 * (d / 10) + (Math.random() - 0.5) * 0.3, // slight scatter
  }));

  let diagnosis: string;
  let adjustment: string;

  if (Math.abs(totalDriftPer10) < 0.3) {
    diagnosis = "Arrows form a straight vertical line — centershot is properly aligned.";
    adjustment = "No adjustment needed.";
  } else if (totalDriftPer10 > 0) {
    diagnosis = `Arrows drift right at ${totalDriftPer10.toFixed(1)}" per 10 yards — rest is too far right.`;
    adjustment = `Move rest left by approximately ${(Math.abs(restOffset) * 16).toFixed(0)}/16" (${Math.abs(restOffset).toFixed(3)}").`;
  } else {
    diagnosis = `Arrows drift left at ${Math.abs(totalDriftPer10).toFixed(1)}" per 10 yards — rest is too far left.`;
    adjustment = `Move rest right by approximately ${(Math.abs(restOffset) * 16).toFixed(0)}/16" (${Math.abs(restOffset).toFixed(3)}").`;
  }

  return {
    points,
    centershotDrift: totalDriftPer10,
    diagnosis,
    adjustment,
  };
}

// ═══════════════════════════════════════════════════════════════
// SETUP OPTIMIZER
// ═══════════════════════════════════════════════════════════════

export interface OptimizedSetup {
  weights: Weight[];
  material: string;
  strandCount: number;
  score: number;
  speedPenalty: number;
  vibrationReduction: number;
  estimatedFPS: number;
}

export function optimizeWeightPlacement(
  params: SimParams,
  maxWeightCount: number = 2,
  maxTotalMass: number = 40,
  weightType: "brass" | "tungsten" = "brass",
): OptimizedSetup {
  // Search for optimal weight placement
  // Objective: maximize vibrationReduction while minimizing speedPenalty
  let bestSetup: OptimizedSetup | null = null;
  let bestScore = -Infinity;

  const massOptions = [10, 15, 20, 25, 30];
  const posOptions = [15, 20, 25, 30, 33, 40, 50, 60, 67, 70, 75, 80, 85];

  if (maxWeightCount >= 2) {
    // Try symmetric pairs (most common and effective)
    for (const mass of massOptions) {
      if (mass * 2 > maxTotalMass) continue;
      for (const pos of posOptions) {
        if (pos >= 50) continue; // only use first half, mirror it
        const mirrorPos = 100 - pos;
        const weights: Weight[] = [
          { position: pos, mass, type: weightType },
          { position: mirrorPos, mass, type: weightType },
        ];
        const physics = computePhysics(params, weights);
        // Score: vibration reduction normalized - speed penalty normalized
        const score = physics.vibrationReduction - physics.speedPenalty * 3;
        if (score > bestScore) {
          bestScore = score;
          bestSetup = {
            weights,
            material: params.material,
            strandCount: params.strandCount,
            score,
            speedPenalty: physics.speedPenalty,
            vibrationReduction: physics.vibrationReduction,
            estimatedFPS: physics.estimatedFPS,
          };
        }
      }
    }
  }

  // Also try single weight at center positions
  for (const mass of massOptions) {
    if (mass > maxTotalMass) continue;
    for (const pos of posOptions) {
      const weights: Weight[] = [{ position: pos, mass, type: weightType }];
      const physics = computePhysics(params, weights);
      const score = physics.vibrationReduction - physics.speedPenalty * 3;
      if (score > bestScore) {
        bestScore = score;
        bestSetup = {
          weights,
          material: params.material,
          strandCount: params.strandCount,
          score,
          speedPenalty: physics.speedPenalty,
          vibrationReduction: physics.vibrationReduction,
          estimatedFPS: physics.estimatedFPS,
        };
      }
    }
  }

  return bestSetup ?? {
    weights: [],
    material: params.material,
    strandCount: params.strandCount,
    score: 0,
    speedPenalty: 0,
    vibrationReduction: 0,
    estimatedFPS: computePhysics(params, []).estimatedFPS,
  };
}

export interface SetupComparison {
  label: string;
  current: number;
  optimized: number;
  unit: string;
  improved: boolean;
}

export function compareSetups(
  params: SimParams,
  currentWeights: Weight[],
  optimized: OptimizedSetup,
): SetupComparison[] {
  const current = computePhysics(params, currentWeights);
  const opt = computePhysics(params, optimized.weights);

  return [
    {
      label: "Est. Speed",
      current: current.estimatedFPS,
      optimized: opt.estimatedFPS,
      unit: "fps",
      improved: opt.estimatedFPS >= current.estimatedFPS,
    },
    {
      label: "Vibe Reduction",
      current: current.vibrationReduction,
      optimized: opt.vibrationReduction,
      unit: "%",
      improved: opt.vibrationReduction >= current.vibrationReduction,
    },
    {
      label: "Speed Loss",
      current: current.speedPenalty,
      optimized: opt.speedPenalty,
      unit: "fps",
      improved: opt.speedPenalty <= current.speedPenalty,
    },
    {
      label: "Balance",
      current: current.balancePoint,
      optimized: opt.balancePoint,
      unit: "%",
      improved: Math.abs(opt.balancePoint - 50) <= Math.abs(current.balancePoint - 50),
    },
    {
      label: "Total Mass",
      current: current.totalMassGrains,
      optimized: opt.totalMassGrains,
      unit: "gr",
      improved: opt.totalMassGrains <= current.totalMassGrains,
    },
  ];
}
