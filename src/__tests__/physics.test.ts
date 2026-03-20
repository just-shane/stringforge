import { describe, it, expect } from "vitest";
import {
  computePhysics,
  STRING_MATERIALS,
  GRAIN_TO_KG,
  INCH_TO_M,
  LBF_TO_N,
  HARMONIC_MODES,
} from "../lib/physics";
import type { SimParams, Weight } from "../lib/physics";

const DEFAULT_PARAMS: SimParams = {
  stringLength: 57.5,
  strandCount: 24,
  material: "BCY-X",
  tension: 350,
  braceHeight: 7.0,
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

    // Without weights, amplitude should decrease with mode number (1/n)
    expect(result.harmonics[0].amplitude).toBeGreaterThan(
      result.harmonics[7].amplitude,
    );
  });

  it("computes fundamental frequency using wave equation", () => {
    // f = (1/2L) * sqrt(T/μ)
    const params = { ...DEFAULT_PARAMS };
    const mat = STRING_MATERIALS[params.material];
    const L = params.stringLength * INCH_TO_M;
    const braceM = params.braceHeight * INCH_TO_M;
    const vibLen = Math.sqrt(Math.max(0.01, (L / 2) ** 2 - braceM ** 2)) * 2;
    const mu = (mat.density * params.strandCount) / 1000;
    const totalMass = mu * L;
    const effectiveMu = totalMass / L;
    const T = params.tension * LBF_TO_N;
    const expectedFreq = (1 / (2 * vibLen)) * Math.sqrt(T / effectiveMu);

    const result = computePhysics(params, []);
    expect(result.fundamentalFreq).toBeCloseTo(expectedFreq, 2);
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
    // 30 grains * 1.8/10 = 5.4 fps
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
  it("has 4 materials", () => {
    expect(Object.keys(STRING_MATERIALS)).toHaveLength(4);
  });

  it("BCY-X is the densest and stiffest material", () => {
    const bcyx = STRING_MATERIALS["BCY-X"];
    expect(bcyx.density).toBeGreaterThanOrEqual(
      Math.max(...Object.values(STRING_MATERIALS).map((m) => m.density)),
    );
    expect(bcyx.modulus).toBeGreaterThanOrEqual(
      Math.max(...Object.values(STRING_MATERIALS).map((m) => m.modulus)),
    );
  });

  it("BCY-X has the least stretch", () => {
    const bcyx = STRING_MATERIALS["BCY-X"];
    expect(bcyx.stretchPct).toBeLessThanOrEqual(
      Math.min(...Object.values(STRING_MATERIALS).map((m) => m.stretchPct)),
    );
  });
});
