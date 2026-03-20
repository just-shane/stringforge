import { describe, it, expect } from "vitest";
import {
  ARROW_SHAFTS,
  computeArrowWeight,
  computeFOC,
  computeDynamicSpine,
  getRecommendedSpine,
  getSpineMatch,
  computeBallistics,
  computeArrow,
} from "../lib/arrow";
import type { ArrowComponents } from "../lib/arrow";

const DEFAULT_ARROW: ArrowComponents = {
  shaft: "easton-axis-300",
  shaftLength: 28,
  pointWeight: 100,
  nockWeight: 10,
  fletchingWeight: 24,
  fletchingLength: 2,
  wrapWeight: 8,
};

describe("ARROW_SHAFTS database", () => {
  it("has at least 15 shafts", () => {
    expect(ARROW_SHAFTS.length).toBeGreaterThanOrEqual(15);
  });

  it("each shaft has valid properties", () => {
    ARROW_SHAFTS.forEach((s) => {
      expect(s.spine).toBeGreaterThan(0);
      expect(s.weightPerInch).toBeGreaterThan(0);
      expect(s.outerDiameter).toBeGreaterThan(s.innerDiameter);
      expect(s.manufacturer).toBeTruthy();
    });
  });

  it("covers multiple manufacturers", () => {
    const mfgs = new Set(ARROW_SHAFTS.map((s) => s.manufacturer));
    expect(mfgs.size).toBeGreaterThanOrEqual(4);
  });
});

describe("computeArrowWeight", () => {
  it("calculates total arrow weight correctly", () => {
    const result = computeArrowWeight(DEFAULT_ARROW);
    const shaft = ARROW_SHAFTS.find((s) => s.id === DEFAULT_ARROW.shaft)!;
    const expectedShaft = shaft.weightPerInch * DEFAULT_ARROW.shaftLength;
    const expectedTotal = expectedShaft + 100 + 10 + 24 + 8;
    expect(result.total).toBeCloseTo(expectedTotal, 1);
    expect(result.shaftWeight).toBeCloseTo(expectedShaft, 1);
  });

  it("breakdown sums to total", () => {
    const result = computeArrowWeight(DEFAULT_ARROW);
    const sum = Object.values(result.breakdown).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(result.total, 1);
  });

  it("throws for unknown shaft", () => {
    expect(() => computeArrowWeight({ ...DEFAULT_ARROW, shaft: "nonexistent" })).toThrow();
  });
});

describe("computeFOC", () => {
  it("returns FOC in realistic range (5-20%)", () => {
    const { foc } = computeFOC(DEFAULT_ARROW);
    expect(foc).toBeGreaterThan(5);
    expect(foc).toBeLessThan(25);
  });

  it("heavier point increases FOC", () => {
    const light = computeFOC({ ...DEFAULT_ARROW, pointWeight: 80 });
    const heavy = computeFOC({ ...DEFAULT_ARROW, pointWeight: 200 });
    expect(heavy.foc).toBeGreaterThan(light.foc);
  });

  it("returns a rating string", () => {
    const { rating } = computeFOC(DEFAULT_ARROW);
    expect(rating).toBeTruthy();
    expect(typeof rating).toBe("string");
  });
});

describe("spine matching", () => {
  it("dynamic spine adjusts for shaft length", () => {
    const short = computeDynamicSpine(300, 26, 100, 70, "compound");
    const long = computeDynamicSpine(300, 32, 100, 70, "compound");
    // Shorter = stiffer (lower number), longer = weaker (higher number)
    expect(short).toBeLessThan(long);
  });

  it("heavier points weaken dynamic spine", () => {
    const light = computeDynamicSpine(300, 28, 80, 70, "compound");
    const heavy = computeDynamicSpine(300, 28, 200, 70, "compound");
    expect(heavy).toBeGreaterThan(light);
  });

  it("getRecommendedSpine returns standard spine values", () => {
    const standards = [250, 300, 340, 350, 400, 500, 600, 700, 800, 1000];
    const rec = getRecommendedSpine(70, 30, 100, "compound");
    expect(standards).toContain(rec);
  });

  it("higher draw weight recommends stiffer spine", () => {
    const light = getRecommendedSpine(40, 28, 100, "compound");
    const heavy = getRecommendedSpine(70, 30, 100, "compound");
    expect(heavy).toBeLessThanOrEqual(light); // lower number = stiffer
  });

  it("getSpineMatch returns correct labels", () => {
    expect(getSpineMatch(300, 300)).toBe("Matched");
    expect(getSpineMatch(200, 300)).toBe("Too stiff");
    expect(getSpineMatch(450, 300)).toBe("Too weak");
  });
});

describe("computeBallistics", () => {
  it("produces trajectory points at 10-yard intervals", () => {
    const result = computeBallistics(350, 290, 0.246, 0, 100);
    expect(result.trajectory.length).toBeGreaterThan(0);
    expect(result.trajectory[0].distance).toBe(10);
    expect(result.trajectory[1].distance).toBe(20);
  });

  it("drop increases with distance", () => {
    const result = computeBallistics(350, 290, 0.246, 0, 100);
    for (let i = 1; i < result.trajectory.length; i++) {
      expect(result.trajectory[i].drop).toBeLessThan(result.trajectory[i - 1].drop);
    }
  });

  it("velocity decreases with distance", () => {
    const result = computeBallistics(350, 290, 0.246, 0, 100);
    for (let i = 1; i < result.trajectory.length; i++) {
      expect(result.trajectory[i].velocity).toBeLessThan(result.trajectory[i - 1].velocity);
    }
  });

  it("KE decreases with distance", () => {
    const result = computeBallistics(350, 290, 0.246, 0, 100);
    for (let i = 1; i < result.trajectory.length; i++) {
      expect(result.trajectory[i].kineticEnergy).toBeLessThan(result.trajectory[i - 1].kineticEnergy);
    }
  });

  it("wind produces non-zero drift", () => {
    const result = computeBallistics(350, 290, 0.246, 10, 60);
    const lastPoint = result.trajectory[result.trajectory.length - 1];
    expect(Math.abs(lastPoint.drift)).toBeGreaterThan(0);
  });

  it("effective range is less than or equal to max range", () => {
    const result = computeBallistics(350, 290, 0.246, 0, 100);
    expect(result.effectiveRange).toBeLessThanOrEqual(result.maxRange);
  });

  it("KE at launch matches formula: (m*v^2)/450800", () => {
    const result = computeBallistics(350, 290, 0.246, 0, 100);
    const expectedKE = (350 * 290 * 290) / 450800;
    // First point at 10yd should be close to launch KE
    expect(result.trajectory[0].kineticEnergy).toBeLessThan(expectedKE);
    expect(result.trajectory[0].kineticEnergy).toBeGreaterThan(expectedKE * 0.9);
  });
});

describe("computeArrow", () => {
  it("returns complete arrow result", () => {
    const result = computeArrow(DEFAULT_ARROW, 290, 70, 30, "compound");
    expect(result.totalWeight).toBeGreaterThan(0);
    expect(result.launchSpeed).toBeGreaterThan(0);
    expect(result.kineticEnergy).toBeGreaterThan(0);
    expect(result.momentum).toBeGreaterThan(0);
    expect(result.foc).toBeGreaterThan(0);
    expect(result.spineMatch).toBeTruthy();
  });

  it("heavier arrow is slower", () => {
    const light = computeArrow({ ...DEFAULT_ARROW, pointWeight: 80 }, 290, 70, 30, "compound");
    const heavy = computeArrow({ ...DEFAULT_ARROW, pointWeight: 250 }, 290, 70, 30, "compound");
    expect(heavy.launchSpeed).toBeLessThan(light.launchSpeed);
  });

  it("heavier arrow has more momentum", () => {
    const light = computeArrow({ ...DEFAULT_ARROW, pointWeight: 80 }, 290, 70, 30, "compound");
    const heavy = computeArrow({ ...DEFAULT_ARROW, pointWeight: 250 }, 290, 70, 30, "compound");
    expect(heavy.momentum).toBeGreaterThan(light.momentum);
  });
});
