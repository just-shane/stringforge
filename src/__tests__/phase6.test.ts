import { describe, it, expect } from "vitest";
import {
  BOW_DATABASE,
  ARROW_PRESETS,
  createProfile,
  deleteProfile,
  encodeShareLink,
  decodeShareLink,
} from "../lib/bows.ts";
import {
  computeWaterfall,
  estimateNoise,
  computeDrawCycle,
} from "../lib/audio.ts";
import {
  GLOSSARY,
  searchGlossary,
  getTermsByCategory,
  getWizardRecommendation,
} from "../lib/glossary.ts";
import { getForceAtDraw, type BowType, type EnergyBreakdown } from "../lib/physics.ts";
import type { Harmonic } from "../lib/physics.ts";

// ─── Bow Database ──────────────────────────────────────────────

describe("Bow Database", () => {
  it("has at least 10 bows spanning all 4 types", () => {
    expect(BOW_DATABASE.length).toBeGreaterThanOrEqual(10);
    const types = new Set(BOW_DATABASE.map((b) => b.bowType));
    expect(types.has("compound")).toBe(true);
    expect(types.has("recurve")).toBe(true);
    expect(types.has("longbow")).toBe(true);
    expect(types.has("crossbow")).toBe(true);
  });

  it("includes Prime/G5 bow (our house bow)", () => {
    const prime = BOW_DATABASE.find((b) => b.manufacturer.includes("Prime") || b.manufacturer.includes("G5"));
    expect(prime).toBeDefined();
    expect(prime!.bowType).toBe("compound");
  });

  it("all bows have valid draw ranges", () => {
    BOW_DATABASE.forEach((bow) => {
      expect(bow.drawWeightRange[0]).toBeLessThanOrEqual(bow.drawWeightRange[1]);
      expect(bow.drawLengthRange[0]).toBeLessThanOrEqual(bow.drawLengthRange[1]);
      expect(bow.braceHeight).toBeGreaterThan(0);
      expect(bow.stringLength).toBeGreaterThan(0);
    });
  });

  it("compound bows have IBO speeds > 300", () => {
    BOW_DATABASE
      .filter((b) => b.bowType === "compound")
      .forEach((b) => {
        expect(b.iboSpeed).toBeGreaterThan(300);
      });
  });

  it("crossbows have highest draw weights", () => {
    const crossbows = BOW_DATABASE.filter((b) => b.bowType === "crossbow");
    crossbows.forEach((b) => {
      expect(b.drawWeightRange[1]).toBeGreaterThanOrEqual(150);
    });
  });
});

// ─── Arrow Presets ─────────────────────────────────────────────

describe("Arrow Presets", () => {
  it("has presets for hunting, target, and 3d", () => {
    const uses = new Set(ARROW_PRESETS.map((p) => p.use));
    expect(uses.has("hunting")).toBe(true);
    expect(uses.has("target")).toBe(true);
    expect(uses.has("3d")).toBe(true);
  });

  it("all presets reference valid shaft IDs", () => {
    // Just ensure they have valid format (existing shafts)
    ARROW_PRESETS.forEach((p) => {
      expect(p.components.shaft).toBeTruthy();
      expect(p.components.shaftLength).toBeGreaterThan(20);
      expect(p.components.pointWeight).toBeGreaterThan(0);
    });
  });

  it("hunting presets have heavier points than target", () => {
    const huntingMax = Math.max(
      ...ARROW_PRESETS.filter((p) => p.use === "hunting").map((p) => p.components.pointWeight),
    );
    const targetMax = Math.max(
      ...ARROW_PRESETS.filter((p) => p.use === "target").map((p) => p.components.pointWeight),
    );
    expect(huntingMax).toBeGreaterThan(targetMax);
  });
});

// ─── Profile System ───────────────────────────────────────────

describe("Profile System", () => {
  const mockParams = {
    bowType: "compound" as BowType,
    stringLength: 57.5,
    strandCount: 28,
    material: "BCY-X",
    tension: 350,
    braceHeight: 7.0,
    drawWeight: 70,
    drawLength: 30,
  };
  const mockWeights = [{ position: 25, mass: 15, type: "brass" as const }];
  const mockArrow = {
    shaft: "easton-axis-300",
    shaftLength: 28,
    pointWeight: 100,
    nockWeight: 10,
    fletchingWeight: 24,
    fletchingLength: 2,
    wrapWeight: 8,
  };

  it("creates a profile with unique ID", () => {
    const p1 = createProfile("Test 1", mockParams, mockWeights, mockArrow);
    const p2 = createProfile("Test 2", mockParams, mockWeights, mockArrow);
    expect(p1.id).not.toBe(p2.id);
    expect(p1.name).toBe("Test 1");
    expect(p1.params.drawWeight).toBe(70);
  });

  it("deletes a profile by ID", () => {
    const p1 = createProfile("Test", mockParams, mockWeights, mockArrow);
    const p2 = createProfile("Keep", mockParams, mockWeights, mockArrow);
    const result = deleteProfile([p1, p2], p1.id);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Keep");
  });
});

// ─── Share Link ───────────────────────────────────────────────

describe("Share Link Encoding", () => {
  it("encodes and decodes a share state", () => {
    const state = {
      params: {
        bowType: "compound" as BowType,
        stringLength: 57.5,
        strandCount: 28,
        material: "BCY-X",
        tension: 350,
        braceHeight: 7.0,
        drawWeight: 70,
        drawLength: 30,
      },
      weights: [{ position: 50, mass: 20, type: "brass" as const }],
      arrow: {
        shaft: "easton-axis-300",
        shaftLength: 28,
        pointWeight: 100,
        nockWeight: 10,
        fletchingWeight: 24,
        fletchingLength: 2,
        wrapWeight: 8,
      },
    };

    const url = encodeShareLink(state);
    expect(url).toContain("?s=");
    const decoded = decodeShareLink(url);
    expect(decoded).not.toBeNull();
    expect(decoded!.params.drawWeight).toBe(70);
    expect(decoded!.weights[0].mass).toBe(20);
  });

  it("returns null for invalid share links", () => {
    expect(decodeShareLink("https://example.com")).toBeNull();
    expect(decodeShareLink("https://example.com?s=invalid")).toBeNull();
  });
});

// ─── Vibration Waterfall ──────────────────────────────────────

describe("Vibration Waterfall", () => {
  const harmonics: Harmonic[] = [
    { mode: 1, freq: 120, amplitude: 1.0, damping: 0.1 },
    { mode: 2, freq: 240, amplitude: 0.5, damping: 0.3 },
    { mode: 3, freq: 360, amplitude: 0.33, damping: 0.5 },
  ];

  it("generates waterfall data with correct structure", () => {
    const wf = computeWaterfall(harmonics, 0.5, 20);
    expect(wf.duration).toBe(0.5);
    expect(wf.timeSlices).toBe(20);
    expect(wf.maxFreq).toBe(360);
    expect(wf.points.length).toBeGreaterThan(0);
  });

  it("amplitudes decay over time", () => {
    const wf = computeWaterfall(harmonics, 0.5, 20);
    const earlyPoints = wf.points.filter((p) => p.time < 0.1);
    const latePoints = wf.points.filter((p) => p.time > 0.3);
    const earlyAvg = earlyPoints.reduce((s, p) => s + p.amplitude, 0) / earlyPoints.length;
    const lateAvg = latePoints.length > 0
      ? latePoints.reduce((s, p) => s + p.amplitude, 0) / latePoints.length
      : 0;
    expect(earlyAvg).toBeGreaterThan(lateAvg);
  });

  it("higher modes decay faster", () => {
    const wf = computeWaterfall(harmonics, 0.5, 40);
    const mode1Late = wf.points.filter((p) => p.freq === 120 && p.time > 0.3);
    const mode3Late = wf.points.filter((p) => p.freq === 360 && p.time > 0.3);
    // Mode 1 should have more surviving data points
    expect(mode1Late.length).toBeGreaterThanOrEqual(mode3Late.length);
  });
});

// ─── Noise Estimation ─────────────────────────────────────────

describe("Noise Estimation", () => {
  const energy: EnergyBreakdown = {
    storedEnergy: 80,
    arrowKE: 65,
    limbKE: 6,
    stringKE: 2,
    hysteresisLoss: 3,
    vibrationLoss: 2.5,
    soundLoss: 1.5,
    efficiency: 0.82,
  };

  it("returns reasonable dB range", () => {
    const noise = estimateNoise(energy, "compound", 0);
    expect(noise.peakDb).toBeGreaterThan(40);
    expect(noise.peakDb).toBeLessThan(120);
    expect(noise.sustainedDb).toBeLessThan(noise.peakDb);
  });

  it("vibration reduction lowers noise", () => {
    const noReduction = estimateNoise(energy, "compound", 0);
    const withReduction = estimateNoise(energy, "compound", 80);
    expect(withReduction.peakDb).toBeLessThan(noReduction.peakDb);
  });

  it("longbows are louder than compounds", () => {
    const compound = estimateNoise(energy, "compound", 0);
    const longbow = estimateNoise(energy, "longbow", 0);
    expect(longbow.peakDb).toBeGreaterThan(compound.peakDb);
  });

  it("returns a rating and comparison", () => {
    const noise = estimateNoise(energy, "compound", 50);
    expect(noise.rating).toBeTruthy();
    expect(noise.comparison).toBeTruthy();
  });
});

// ─── Draw Cycle ───────────────────────────────────────────────

describe("Draw Cycle Animation", () => {
  it("generates correct number of frames", () => {
    const cycle = computeDrawCycle("compound", 70, 30, 7, getForceAtDraw, 30);
    expect(cycle.frames.length).toBe(31); // 0 to 30 inclusive
    expect(cycle.bowType).toBe("compound");
    expect(cycle.peakWeight).toBe(70);
  });

  it("first frame is at brace, last at full draw", () => {
    const cycle = computeDrawCycle("compound", 70, 30, 7, getForceAtDraw, 60);
    expect(cycle.frames[0].drawPosition).toBe(0);
    expect(cycle.frames[0].drawInches).toBe(7); // brace height
    expect(cycle.frames[60].drawPosition).toBe(1);
    expect(cycle.frames[60].drawInches).toBe(30); // full draw
  });

  it("energy accumulates over the draw", () => {
    const cycle = computeDrawCycle("compound", 70, 30, 7, getForceAtDraw, 60);
    expect(cycle.frames[0].storedEnergySoFar).toBe(0);
    expect(cycle.frames[60].storedEnergySoFar).toBeGreaterThan(0);
    // Energy should only increase
    for (let i = 1; i < cycle.frames.length; i++) {
      expect(cycle.frames[i].storedEnergySoFar).toBeGreaterThanOrEqual(
        cycle.frames[i - 1].storedEnergySoFar,
      );
    }
  });

  it("compound cams rotate 180° over full draw", () => {
    const cycle = computeDrawCycle("compound", 70, 30, 7, getForceAtDraw, 60);
    expect(cycle.frames[0].camRotation).toBe(0);
    expect(cycle.frames[60].camRotation).toBe(180);
  });

  it("longbow has no cam rotation", () => {
    const cycle = computeDrawCycle("longbow", 45, 28, 7.5, getForceAtDraw, 30);
    cycle.frames.forEach((f) => {
      expect(f.camRotation).toBe(0);
    });
  });
});

// ─── Glossary ─────────────────────────────────────────────────

describe("Glossary", () => {
  it("has at least 25 terms", () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(25);
  });

  it("covers all 5 categories", () => {
    const categories = new Set(GLOSSARY.map((t) => t.category));
    expect(categories.size).toBe(5);
    expect(categories.has("bow")).toBe(true);
    expect(categories.has("string")).toBe(true);
    expect(categories.has("arrow")).toBe(true);
    expect(categories.has("tuning")).toBe(true);
    expect(categories.has("physics")).toBe(true);
  });

  it("search finds relevant terms", () => {
    const results = searchGlossary("spine");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((t) => t.term.toLowerCase().includes("spine"))).toBe(true);
  });

  it("search returns empty for nonsense", () => {
    const results = searchGlossary("zxqwkjhg");
    expect(results.length).toBe(0);
  });

  it("getTermsByCategory filters correctly", () => {
    const bowTerms = getTermsByCategory("bow");
    bowTerms.forEach((t) => expect(t.category).toBe("bow"));
    expect(bowTerms.length).toBeGreaterThan(0);
  });

  it("all terms have short and detailed descriptions", () => {
    GLOSSARY.forEach((t) => {
      expect(t.short.length).toBeGreaterThan(10);
      expect(t.detailed.length).toBeGreaterThan(50);
    });
  });
});

// ─── Setup Wizard ─────────────────────────────────────────────

describe("Setup Wizard", () => {
  it("recommends stiffer spine for higher draw weight", () => {
    const light = getWizardRecommendation("hunting", "beginner", 72, "male", "medium");
    const heavy = getWizardRecommendation("hunting", "advanced", 72, "male", "medium");
    expect(heavy.drawWeight).toBeGreaterThan(light.drawWeight);
    expect(heavy.arrowSpine).toBeLessThanOrEqual(light.arrowSpine);
  });

  it("estimates draw length from arm span", () => {
    const rec = getWizardRecommendation("target", "intermediate", 72, "male");
    expect(rec.drawLength).toBe(29); // 72 / 2.5 = 28.8 → 29
  });

  it("hunting requires minimum draw weight", () => {
    const rec = getWizardRecommendation("hunting", "beginner", 60, "female", "medium");
    expect(rec.drawWeight).toBeGreaterThanOrEqual(45);
  });

  it("large game gets heavier points", () => {
    const medium = getWizardRecommendation("hunting", "advanced", 72, "male", "medium");
    const large = getWizardRecommendation("hunting", "advanced", 72, "male", "large");
    expect(large.pointWeight).toBeGreaterThan(medium.pointWeight);
  });

  it("returns a shaft recommendation", () => {
    const rec = getWizardRecommendation("target", "beginner", 68, "female");
    expect(rec.shaftId).toBeTruthy();
    expect(rec.explanation.length).toBeGreaterThan(50);
  });
});
