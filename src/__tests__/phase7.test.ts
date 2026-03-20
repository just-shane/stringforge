import { describe, it, expect, beforeEach } from "vitest";
import { APP_VERSION, APP_NAME, APP_SUBTITLE } from "../lib/version.ts";
import { loadPersistedState, persistState, clearPersistedState, type PersistedState } from "../lib/persist.ts";
import { THEMES, getThemeById } from "../lib/themes.ts";

// ─── Version ──────────────────────────────────────────────────

describe("Version", () => {
  it("exports valid semver version string", () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("exports app name and subtitle", () => {
    expect(APP_NAME).toBe("StringForge");
    expect(APP_SUBTITLE).toBeTruthy();
  });

  it("version is 4.0.x or higher", () => {
    const [major] = APP_VERSION.split(".").map(Number);
    expect(major).toBeGreaterThanOrEqual(4);
  });
});

// ─── High Contrast Theme ──────────────────────────────────────

describe("High Contrast Theme", () => {
  it("exists in THEMES array", () => {
    const hc = THEMES.find((t) => t.id === "high-contrast");
    expect(hc).toBeDefined();
  });

  it("has pure black background", () => {
    const hc = getThemeById("high-contrast");
    expect(hc.colors.bg).toBe("#000000");
  });

  it("has pure white text", () => {
    const hc = getThemeById("high-contrast");
    expect(hc.colors.text).toBe("#ffffff");
  });

  it("has high-saturation accent", () => {
    const hc = getThemeById("high-contrast");
    // Should be bright/vivid — not a pastel
    expect(hc.colors.accent).toBe("#00ff88");
  });

  it("total themes is now 7", () => {
    expect(THEMES.length).toBe(7);
  });
});

// ─── State Persistence ────────────────────────────────────────

describe("State Persistence", () => {
  const mockState: PersistedState = {
    params: {
      bowType: "recurve",
      stringLength: 66,
      strandCount: 18,
      material: "Fast Flight",
      tension: 200,
      braceHeight: 8.5,
      drawWeight: 40,
      drawLength: 28,
    },
    weights: [{ position: 50, mass: 20, type: "brass" }],
    arrow: {
      shaft: "easton-axis-400",
      shaftLength: 29,
      pointWeight: 125,
      nockWeight: 10,
      fletchingWeight: 24,
      fletchingLength: 2,
      wrapWeight: 8,
    },
    windSpeed: 5,
    tuning: {
      nockHeight: 0.1875,
      restPosition: 0,
      shooterHand: "right",
    },
  };

  beforeEach(() => {
    clearPersistedState();
  });

  it("returns null when nothing persisted", () => {
    expect(loadPersistedState()).toBeNull();
  });

  it("persists and loads state correctly", () => {
    persistState(mockState);
    const loaded = loadPersistedState();
    expect(loaded).not.toBeNull();
    expect(loaded!.params.bowType).toBe("recurve");
    expect(loaded!.params.drawWeight).toBe(40);
    expect(loaded!.weights.length).toBe(1);
    expect(loaded!.arrow.shaft).toBe("easton-axis-400");
    expect(loaded!.windSpeed).toBe(5);
  });

  it("clears persisted state", () => {
    persistState(mockState);
    expect(loadPersistedState()).not.toBeNull();
    clearPersistedState();
    expect(loadPersistedState()).toBeNull();
  });

  it("handles corrupted data gracefully", () => {
    localStorage.setItem("stringforge-state", "not json");
    expect(loadPersistedState()).toBeNull();
  });

  it("handles missing fields gracefully", () => {
    localStorage.setItem("stringforge-state", JSON.stringify({ params: null }));
    expect(loadPersistedState()).toBeNull();
  });
});
