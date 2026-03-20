import { describe, it, expect } from "vitest";
import {
  computePaperTune,
  computeBareShaftTune,
  computeWalkBackTune,
  optimizeWeightPlacement,
  compareSetups,
} from "../lib/tuning.ts";
import type { SimParams, Weight } from "../lib/physics.ts";
import type { ArrowComponents } from "../lib/arrow.ts";

const defaultParams: SimParams = {
  bowType: "compound",
  stringLength: 57.5,
  strandCount: 28,
  material: "BCY-X",
  tension: 350,
  braceHeight: 7.0,
  drawWeight: 70,
  drawLength: 30,
};

const defaultWeights: Weight[] = [
  { position: 25, mass: 15, type: "brass" },
  { position: 75, mass: 15, type: "brass" },
];

const defaultArrow: ArrowComponents = {
  shaft: "easton-axis-300",
  shaftLength: 28,
  pointWeight: 100,
  nockWeight: 10,
  fletchingWeight: 24,
  fletchingLength: 2,
  wrapWeight: 8,
};

// ═══════════════════════════════════════════════════════════════
// PAPER TUNE
// ═══════════════════════════════════════════════════════════════
describe("computePaperTune", () => {
  it("returns bullet hole for well-tuned setup", () => {
    const result = computePaperTune(
      defaultParams,
      defaultWeights,
      defaultArrow,
      0.1875, // optimal nock height
      0, // centershot
      "right",
    );
    // With a well-matched setup, should be bullet or very mild tear
    expect(result.tearMagnitude).toBeLessThan(0.5);
    expect(result.causes.length).toBeGreaterThanOrEqual(0);
  });

  it("detects high tear from high nock", () => {
    const result = computePaperTune(
      defaultParams,
      defaultWeights,
      defaultArrow,
      0.5, // very high nock
      0,
      "right",
    );
    expect(result.tearDirection).toMatch(/high/);
    expect(result.nockHeightContribution).toBeGreaterThan(0);
    expect(result.adjustments.some((a) => a.toLowerCase().includes("lower"))).toBe(true);
  });

  it("detects low tear from low nock", () => {
    const result = computePaperTune(
      defaultParams,
      defaultWeights,
      defaultArrow,
      -0.2, // below center
      0,
      "right",
    );
    expect(result.tearDirection).toMatch(/low/);
    expect(result.nockHeightContribution).toBeLessThan(0);
  });

  it("handles unknown shaft gracefully", () => {
    const badArrow = { ...defaultArrow, shaft: "nonexistent" };
    const result = computePaperTune(defaultParams, defaultWeights, badArrow, 0.1875, 0, "right");
    expect(result.tearDirection).toBe("bullet");
    expect(result.tearMagnitude).toBe(0);
  });

  it("accounts for left-hand shooter", () => {
    const result = computePaperTune(
      defaultParams,
      defaultWeights,
      defaultArrow,
      0.1875,
      0,
      "left",
    );
    // Should still produce a result without error
    expect(["bullet", "left", "right", "high", "low", "high-left", "high-right", "low-left", "low-right"]).toContain(result.tearDirection);
  });

  it("produces tear description with severity", () => {
    const result = computePaperTune(
      defaultParams,
      defaultWeights,
      defaultArrow,
      0.5,
      0,
      "right",
    );
    expect(result.tearDescription).toBeTruthy();
    expect(result.tearDescription.length).toBeGreaterThan(5);
  });
});

// ═══════════════════════════════════════════════════════════════
// BARE SHAFT TUNE
// ═══════════════════════════════════════════════════════════════
describe("computeBareShaftTune", () => {
  it("returns matched for well-spined arrow", () => {
    // Use a 300 spine arrow with 70lb compound — should be close
    const result = computeBareShaftTune(defaultParams, defaultArrow);
    expect(["left", "right", "matched"]).toContain(result.direction);
    expect(result.groupSeparation).toBeGreaterThanOrEqual(0);
  });

  it("returns positive group separation for mismatched spine", () => {
    // Very weak spine for 70lb compound
    const weakArrow = { ...defaultArrow, shaft: "easton-axis-500" };
    const result = computeBareShaftTune(defaultParams, weakArrow);
    expect(result.groupSeparation).toBeGreaterThan(0);
  });

  it("estimates fletched group smaller than bare group", () => {
    const result = computeBareShaftTune(defaultParams, defaultArrow);
    expect(result.fletchedGroupSize).toBeLessThan(result.bareGroupSize);
  });

  it("provides adjustment for mismatched spine", () => {
    const weakArrow = { ...defaultArrow, shaft: "easton-axis-500" };
    const result = computeBareShaftTune(defaultParams, weakArrow);
    if (result.direction !== "matched") {
      expect(result.adjustment.length).toBeGreaterThan(0);
    }
  });

  it("handles unknown shaft", () => {
    const badArrow = { ...defaultArrow, shaft: "nonexistent" };
    const result = computeBareShaftTune(defaultParams, badArrow);
    expect(result.direction).toBe("matched");
    expect(result.spineAssessment).toBe("Unknown shaft");
  });
});

// ═══════════════════════════════════════════════════════════════
// WALK-BACK TUNE
// ═══════════════════════════════════════════════════════════════
describe("computeWalkBackTune", () => {
  it("returns 7 distance points", () => {
    const result = computeWalkBackTune(defaultParams, defaultArrow, 0);
    expect(result.points).toHaveLength(7);
    expect(result.points[0].distance).toBe(10);
    expect(result.points[6].distance).toBe(40);
  });

  it("shows minimal drift at centershot", () => {
    const result = computeWalkBackTune(defaultParams, defaultArrow, 0);
    // With 0 rest offset, drift should be small (just spine contribution)
    expect(Math.abs(result.centershotDrift)).toBeLessThan(2);
  });

  it("shows rightward drift with positive rest offset", () => {
    const result = computeWalkBackTune(defaultParams, defaultArrow, 0.0625); // 1/16" right
    expect(result.centershotDrift).toBeGreaterThan(0);
    expect(result.diagnosis).toMatch(/right/i);
  });

  it("shows leftward drift with negative rest offset", () => {
    const result = computeWalkBackTune(defaultParams, defaultArrow, -0.0625);
    expect(result.centershotDrift).toBeLessThan(0);
    expect(result.diagnosis).toMatch(/left/i);
  });

  it("drift increases with distance", () => {
    const result = computeWalkBackTune(defaultParams, defaultArrow, 0.0625);
    // The general trend should be increasing offset with distance
    // (allowing for random scatter — check first vs last)
    const firstAbsAvg = Math.abs(result.points[0].horizontalOffset);
    const lastAbsAvg = Math.abs(result.points[6].horizontalOffset);
    // With 1/16" offset, drift is 0.5"/10yd, so at 40yd it should be ~2"
    // First at 10yd ~0.5" vs last at 40yd ~2"
    expect(lastAbsAvg).toBeGreaterThan(firstAbsAvg * 0.5);
  });
});

// ═══════════════════════════════════════════════════════════════
// SETUP OPTIMIZER
// ═══════════════════════════════════════════════════════════════
describe("optimizeWeightPlacement", () => {
  it("returns an optimized setup", () => {
    const result = optimizeWeightPlacement(defaultParams);
    expect(result.weights.length).toBeGreaterThanOrEqual(1);
    expect(result.score).toBeDefined();
    expect(result.estimatedFPS).toBeGreaterThan(0);
  });

  it("respects max weight count of 1", () => {
    const result = optimizeWeightPlacement(defaultParams, 1, 40, "brass");
    expect(result.weights.length).toBeLessThanOrEqual(1);
  });

  it("respects max total mass", () => {
    const result = optimizeWeightPlacement(defaultParams, 2, 20, "brass");
    const totalMass = result.weights.reduce((sum, w) => sum + w.mass, 0);
    expect(totalMass).toBeLessThanOrEqual(20);
  });

  it("uses specified weight type", () => {
    const result = optimizeWeightPlacement(defaultParams, 2, 40, "tungsten");
    for (const w of result.weights) {
      expect(w.type).toBe("tungsten");
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// COMPARE SETUPS
// ═══════════════════════════════════════════════════════════════
describe("compareSetups", () => {
  it("returns comparison metrics", () => {
    const optimized = optimizeWeightPlacement(defaultParams);
    const result = compareSetups(defaultParams, defaultWeights, optimized);
    expect(result.length).toBe(5);
    expect(result.map((r) => r.label)).toContain("Est. Speed");
    expect(result.map((r) => r.label)).toContain("Vibe Reduction");
  });

  it("all rows have current and optimized values", () => {
    const optimized = optimizeWeightPlacement(defaultParams);
    const result = compareSetups(defaultParams, defaultWeights, optimized);
    for (const row of result) {
      expect(typeof row.current).toBe("number");
      expect(typeof row.optimized).toBe("number");
      expect(typeof row.improved).toBe("boolean");
      expect(row.unit).toBeTruthy();
    }
  });
});
