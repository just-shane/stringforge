import { describe, it, expect } from "vitest";
import {
  computePhysics,
  STRING_MATERIALS,
  BOW_PROFILES,
  getForceAtDraw,
  getDrawCurvePoints,
  getStrandRecommendation,
  GRAIN_TO_KG,
  INCH_TO_M,
  LBF_TO_N,
  HARMONIC_MODES,
} from "../lib/physics";
import type { SimParams, Weight, BowType } from "../lib/physics";

const DEFAULT_PARAMS: SimParams = {
  bowType: "compound",
  stringLength: 57.5,
  strandCount: 24,
  material: "BCY-X",
  tension: 350,
  braceHeight: 7.0,
  drawWeight: 70,
  drawLength: 30,
};

const DEFAULT_WEIGHTS: Weight[] = [
  { position: 25, mass: 15, type: "brass" },
  { position: 75, mass: 15, type: "brass" },
];

describe("computePhysics", () => {
  it("returns a valid result with default params", () => {
    const result = computePhysics(DEFAULT_PARAMS, DEFAULT_WEIGHTS);

    expect(result.fundamentalFreq).toBeGreaterThan(0);
    expect(result.harmonics).toHaveLength(HARMONIC_MODES);
    expect(result.totalMassGrains).toBeGreaterThan(0);
    expect(result.stringMassGrains).toBeGreaterThan(0);
    expect(result.weightMassGrains).toBeGreaterThan(0);
    expect(result.vibratingLength).toBeGreaterThan(0);
    expect(result.energy).toBeDefined();
    expect(result.estimatedFPS).toBeGreaterThan(0);
  });

  it("computes 8 harmonic modes with decreasing amplitude", () => {
    const result = computePhysics(DEFAULT_PARAMS, []);

    for (let i = 0; i < result.harmonics.length; i++) {
      expect(result.harmonics[i].mode).toBe(i + 1);
      expect(result.harmonics[i].freq).toBeCloseTo(
        result.fundamentalFreq * (i + 1),
        1,
      );
    }

    expect(result.harmonics[0].amplitude).toBeGreaterThan(
      result.harmonics[7].amplitude,
    );
  });

  it("frequency is in a physically reasonable range (50-500 Hz)", () => {
    const result = computePhysics(DEFAULT_PARAMS, DEFAULT_WEIGHTS);
    expect(result.fundamentalFreq).toBeGreaterThan(50);
    expect(result.fundamentalFreq).toBeLessThan(500);
  });

  it("higher tension increases frequency", () => {
    const lowTension = computePhysics(
      { ...DEFAULT_PARAMS, tension: 200 },
      [],
    );
    const highTension = computePhysics(
      { ...DEFAULT_PARAMS, tension: 500 },
      [],
    );
    expect(highTension.fundamentalFreq).toBeGreaterThan(
      lowTension.fundamentalFreq,
    );
  });

  it("longer string decreases frequency", () => {
    const short = computePhysics({ ...DEFAULT_PARAMS, stringLength: 50 }, []);
    const long = computePhysics({ ...DEFAULT_PARAMS, stringLength: 64 }, []);
    expect(short.fundamentalFreq).toBeGreaterThan(long.fundamentalFreq);
  });

  it("more strands decrease frequency (more mass)", () => {
    const few = computePhysics({ ...DEFAULT_PARAMS, strandCount: 16 }, []);
    const many = computePhysics({ ...DEFAULT_PARAMS, strandCount: 32 }, []);
    expect(few.fundamentalFreq).toBeGreaterThan(many.fundamentalFreq);
  });

  it("calculates speed penalty at ~1.8 fps per 10 grains", () => {
    const w30: Weight[] = [{ position: 50, mass: 30, type: "brass" }];
    const result = computePhysics(DEFAULT_PARAMS, w30);
    expect(result.speedPenalty).toBeCloseTo(5.4, 1);
  });

  it("returns 50% balance point with no weights", () => {
    const result = computePhysics(DEFAULT_PARAMS, []);
    expect(result.balancePoint).toBe(50);
  });

  it("returns balanced point with symmetric weights", () => {
    const result = computePhysics(DEFAULT_PARAMS, DEFAULT_WEIGHTS);
    expect(result.balancePoint).toBe(50);
  });

  it("balance point shifts toward heavier weight", () => {
    const asymmetric: Weight[] = [
      { position: 25, mass: 40, type: "brass" },
      { position: 75, mass: 10, type: "tungsten" },
    ];
    const result = computePhysics(DEFAULT_PARAMS, asymmetric);
    expect(result.balancePoint).toBeLessThan(50);
  });

  it("string mass scales with strand count and material density", () => {
    const thin = computePhysics({ ...DEFAULT_PARAMS, strandCount: 16 }, []);
    const thick = computePhysics({ ...DEFAULT_PARAMS, strandCount: 32 }, []);
    expect(thick.stringMassGrains).toBeCloseTo(thin.stringMassGrains * 2, 1);
  });

  it("weight mass is sum of all weight masses", () => {
    const weights: Weight[] = [
      { position: 30, mass: 20, type: "brass" },
      { position: 70, mass: 15, type: "tungsten" },
    ];
    const result = computePhysics(DEFAULT_PARAMS, weights);
    expect(result.weightMassGrains).toBeCloseTo(35, 1);
  });

  it("vibration reduction is capped at 95%", () => {
    const heavyWeights: Weight[] = Array.from({ length: 8 }, (_, i) => ({
      position: 10 + i * 10,
      mass: 50,
      type: "brass" as const,
    }));
    const result = computePhysics(DEFAULT_PARAMS, heavyWeights);
    expect(result.vibrationReduction).toBeLessThanOrEqual(95);
  });

  it("weights near center are more effective at reducing vibration", () => {
    const center: Weight[] = [{ position: 50, mass: 30, type: "brass" }];
    const edge: Weight[] = [{ position: 5, mass: 30, type: "brass" }];
    const centerResult = computePhysics(DEFAULT_PARAMS, center);
    const edgeResult = computePhysics(DEFAULT_PARAMS, edge);
    expect(centerResult.vibrationReduction).toBeGreaterThan(
      edgeResult.vibrationReduction,
    );
  });

  it("throws for unknown material", () => {
    expect(() =>
      computePhysics({ ...DEFAULT_PARAMS, material: "unknown" }, []),
    ).toThrow("Unknown string material");
  });

  it("works with no weights", () => {
    const result = computePhysics(DEFAULT_PARAMS, []);
    expect(result.weightMassGrains).toBe(0);
    expect(result.speedPenalty).toBe(0);
    expect(result.vibrationReduction).toBe(0);
  });
});

describe("energy model", () => {
  it("stored energy is positive for valid draw setup", () => {
    const result = computePhysics(DEFAULT_PARAMS, []);
    expect(result.energy.storedEnergy).toBeGreaterThan(0);
  });

  it("compound efficiency is ~80-85%", () => {
    const result = computePhysics(DEFAULT_PARAMS, []);
    expect(result.energy.efficiency).toBeGreaterThanOrEqual(0.80);
    expect(result.energy.efficiency).toBeLessThanOrEqual(0.85);
  });

  it("higher draw weight produces more stored energy", () => {
    const low = computePhysics({ ...DEFAULT_PARAMS, drawWeight: 40 }, []);
    const high = computePhysics({ ...DEFAULT_PARAMS, drawWeight: 70 }, []);
    expect(high.energy.storedEnergy).toBeGreaterThan(low.energy.storedEnergy);
  });

  it("longer draw length produces more stored energy", () => {
    const short = computePhysics({ ...DEFAULT_PARAMS, drawLength: 26 }, []);
    const long = computePhysics({ ...DEFAULT_PARAMS, drawLength: 32 }, []);
    expect(long.energy.storedEnergy).toBeGreaterThan(short.energy.storedEnergy);
  });

  it("estimated FPS for 70lb compound is in realistic range (250-320 fps)", () => {
    const result = computePhysics(DEFAULT_PARAMS, []);
    expect(result.estimatedFPS).toBeGreaterThan(250);
    expect(result.estimatedFPS).toBeLessThan(320);
  });

  it("compound cam wrap length is non-zero", () => {
    const result = computePhysics(DEFAULT_PARAMS, []);
    expect(result.camWrapLength).toBeGreaterThan(0);
  });

  it("recurve has no cam wrap", () => {
    const result = computePhysics({ ...DEFAULT_PARAMS, bowType: "recurve", drawWeight: 40, drawLength: 28, stringLength: 66, braceHeight: 8.5 }, []);
    expect(result.camWrapLength).toBe(0);
  });
});

describe("bow types", () => {
  it("compound has let-off, holding weight is less than draw weight", () => {
    const result = computePhysics(DEFAULT_PARAMS, []);
    expect(result.holdingWeight).toBeLessThan(DEFAULT_PARAMS.drawWeight);
    expect(result.holdingWeight).toBeGreaterThan(0);
  });

  it("recurve has no let-off", () => {
    const params: SimParams = { ...DEFAULT_PARAMS, bowType: "recurve", drawWeight: 40, drawLength: 28, stringLength: 66, braceHeight: 8.5 };
    const result = computePhysics(params, []);
    expect(result.holdingWeight).toBe(params.drawWeight);
  });

  it("longbow has lower efficiency than compound", () => {
    expect(BOW_PROFILES.longbow.efficiency).toBeLessThan(BOW_PROFILES.compound.efficiency);
  });

  it("all four bow types compute without error", () => {
    const types: BowType[] = ["compound", "recurve", "longbow", "crossbow"];
    types.forEach((bt) => {
      const profile = BOW_PROFILES[bt];
      const params: SimParams = {
        ...DEFAULT_PARAMS,
        bowType: bt,
        drawWeight: profile.defaultDrawWeight,
        drawLength: profile.defaultDrawLength,
        stringLength: profile.defaultStringLength,
        braceHeight: profile.defaultBraceHeight,
      };
      const result = computePhysics(params, DEFAULT_WEIGHTS);
      expect(result.fundamentalFreq).toBeGreaterThan(0);
      expect(result.energy.storedEnergy).toBeGreaterThan(0);
    });
  });
});

describe("force-draw curves", () => {
  it("longbow is linear", () => {
    expect(getForceAtDraw("longbow", 0)).toBe(0);
    expect(getForceAtDraw("longbow", 0.5)).toBeCloseTo(0.5, 2);
    expect(getForceAtDraw("longbow", 1)).toBe(1);
  });

  it("compound peaks early then drops (let-off)", () => {
    const peak = getForceAtDraw("compound", 0.25);
    const valley = getForceAtDraw("compound", 0.9);
    expect(peak).toBe(1.0);
    expect(valley).toBeLessThan(0.5);
  });

  it("getDrawCurvePoints returns correct number of points", () => {
    const pts = getDrawCurvePoints("recurve", 40, 28, 50);
    expect(pts).toHaveLength(51); // 0 to 50 inclusive
    expect(pts[0].draw).toBe(0);
    expect(pts[50].draw).toBe(28);
  });

  it("force is clamped to [0,1] range", () => {
    const types: BowType[] = ["compound", "recurve", "longbow", "crossbow"];
    types.forEach((bt) => {
      for (let d = 0; d <= 1; d += 0.05) {
        const f = getForceAtDraw(bt, d);
        expect(f).toBeGreaterThanOrEqual(0);
        expect(f).toBeLessThanOrEqual(1.01);
      }
    });
  });
});

describe("strand recommendation", () => {
  it("compound 70lb BCY-X recommends 20-28 strands", () => {
    const rec = getStrandRecommendation("compound", 70, "BCY-X");
    expect(rec.min).toBeGreaterThanOrEqual(20);
    expect(rec.max).toBeLessThanOrEqual(28);
  });

  it("higher draw weight recommends more strands", () => {
    const low = getStrandRecommendation("recurve", 25, "BCY-X");
    const high = getStrandRecommendation("recurve", 50, "BCY-X");
    expect(high.min).toBeGreaterThanOrEqual(low.min);
  });
});

describe("constants", () => {
  it("GRAIN_TO_KG is correct (1 grain = 0.0000648 kg)", () => {
    expect(GRAIN_TO_KG).toBeCloseTo(0.0000648, 7);
  });

  it("INCH_TO_M is correct (1 inch = 0.0254 m)", () => {
    expect(INCH_TO_M).toBeCloseTo(0.0254, 4);
  });

  it("LBF_TO_N is correct (1 lbf ≈ 4.44822 N)", () => {
    expect(LBF_TO_N).toBeCloseTo(4.44822, 4);
  });
});

describe("STRING_MATERIALS", () => {
  it("has 7 materials (expanded database)", () => {
    expect(Object.keys(STRING_MATERIALS)).toHaveLength(7);
  });

  it("Dacron B-50 has highest stretch (traditional material)", () => {
    const dacron = STRING_MATERIALS["Dacron B-50"];
    expect(dacron.stretchPct).toBeGreaterThan(2);
    expect(dacron.creepRate).toBeGreaterThan(0.05);
  });

  it("Fast Flight has highest modulus (modern material)", () => {
    const ff = STRING_MATERIALS["Fast Flight"];
    expect(ff.modulus).toBeGreaterThanOrEqual(
      Math.max(...Object.values(STRING_MATERIALS).map((m) => m.modulus)),
    );
  });

  it("all materials have required properties", () => {
    Object.values(STRING_MATERIALS).forEach((mat) => {
      expect(mat.density).toBeGreaterThan(0);
      expect(mat.modulus).toBeGreaterThan(0);
      expect(mat.stretchPct).toBeGreaterThan(0);
      expect(mat.creepRate).toBeGreaterThanOrEqual(0);
      expect(mat.tensileStrength).toBeGreaterThan(0);
      expect(mat.feetPerLb).toBeGreaterThan(0);
    });
  });
});
