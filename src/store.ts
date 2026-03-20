import { create } from "zustand";
import type { Weight, SimParams, BowType } from "./lib/physics.ts";
import { BOW_PROFILES } from "./lib/physics.ts";
import type { ArrowComponents } from "./lib/arrow.ts";
import { getThemeById } from "./lib/themes.ts";
import type { Theme } from "./lib/themes.ts";
import { loadPersistedState, persistState } from "./lib/persist.ts";

export type ShooterHand = "right" | "left";

export interface TuningState {
  nockHeight: number; // inches above center
  restPosition: number; // horizontal offset in inches
  shooterHand: ShooterHand;
}

function loadThemeId(): string {
  try {
    return localStorage.getItem("bowstring-theme") ?? "midnight";
  } catch {
    return "midnight";
  }
}

function saveThemeId(id: string) {
  try {
    localStorage.setItem("bowstring-theme", id);
  } catch {
    // localStorage unavailable
  }
}

// ─── Defaults ──────────────────────────────────────────────────
const DEFAULT_PARAMS: SimParams = {
  bowType: "compound",
  stringLength: 57.5,
  strandCount: 28,
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

const DEFAULT_ARROW: ArrowComponents = {
  shaft: "easton-axis-300",
  shaftLength: 28,
  pointWeight: 100,
  nockWeight: 10,
  fletchingWeight: 24,
  fletchingLength: 2,
  wrapWeight: 8,
};

const DEFAULT_TUNING: TuningState = {
  nockHeight: 0.1875, // 3/16" above center (standard starting point)
  restPosition: 0, // centershot
  shooterHand: "right",
};

// Load persisted state or use defaults
const persisted = loadPersistedState();

interface SimState {
  params: SimParams;
  weights: Weight[];
  arrow: ArrowComponents;
  windSpeed: number;
  tuning: TuningState;
  animating: boolean;
  theme: Theme;
  menuOpen: boolean;
  docsOpen: boolean;
  glossaryOpen: boolean;
  wizardOpen: boolean;

  setParam: <K extends keyof SimParams>(key: K, value: SimParams[K]) => void;
  setBowType: (bowType: BowType) => void;
  setWeights: (weights: Weight[]) => void;
  updateWeight: (index: number, weight: Weight) => void;
  removeWeight: (index: number) => void;
  addWeight: (weight: Weight) => void;
  setArrow: <K extends keyof ArrowComponents>(key: K, value: ArrowComponents[K]) => void;
  setWindSpeed: (speed: number) => void;
  setTuning: <K extends keyof TuningState>(key: K, value: TuningState[K]) => void;
  setDocsOpen: (open: boolean) => void;
  setGlossaryOpen: (open: boolean) => void;
  setWizardOpen: (open: boolean) => void;
  setAnimating: (animating: boolean) => void;
  setTheme: (id: string) => void;
  setMenuOpen: (open: boolean) => void;
}

export const useSimStore = create<SimState>((set) => ({
  params: persisted?.params ?? DEFAULT_PARAMS,
  weights: persisted?.weights ?? DEFAULT_WEIGHTS,
  arrow: persisted?.arrow ?? DEFAULT_ARROW,
  windSpeed: persisted?.windSpeed ?? 0,
  tuning: persisted?.tuning ?? DEFAULT_TUNING,

  animating: true,
  theme: getThemeById(loadThemeId()),
  menuOpen: false,
  docsOpen: false,
  glossaryOpen: false,
  wizardOpen: false,

  setParam: (key, value) =>
    set((state) => ({ params: { ...state.params, [key]: value } })),

  setBowType: (bowType) =>
    set((state) => {
      const profile = BOW_PROFILES[bowType];
      return {
        params: {
          ...state.params,
          bowType,
          drawWeight: profile.defaultDrawWeight,
          drawLength: profile.defaultDrawLength,
          stringLength: profile.defaultStringLength,
          braceHeight: profile.defaultBraceHeight,
        },
      };
    }),

  setWeights: (weights) => set({ weights }),

  updateWeight: (index, weight) =>
    set((state) => {
      const next = [...state.weights];
      next[index] = weight;
      return { weights: next };
    }),

  removeWeight: (index) =>
    set((state) => ({ weights: state.weights.filter((_, i) => i !== index) })),

  addWeight: (weight) =>
    set((state) => {
      if (state.weights.length >= 8) return state;
      return { weights: [...state.weights, weight] };
    }),

  setArrow: (key, value) =>
    set((state) => ({ arrow: { ...state.arrow, [key]: value } })),

  setWindSpeed: (speed) => set({ windSpeed: speed }),

  setTuning: (key, value) =>
    set((state) => ({ tuning: { ...state.tuning, [key]: value } })),

  setDocsOpen: (open) => set({ docsOpen: open }),

  setGlossaryOpen: (open) => set({ glossaryOpen: open }),

  setWizardOpen: (open) => set({ wizardOpen: open }),

  setAnimating: (animating) => set({ animating }),

  setTheme: (id) => {
    const theme = getThemeById(id);
    saveThemeId(id);
    set({ theme });
  },

  setMenuOpen: (open) => set({ menuOpen: open }),
}));

// ─── Auto-persist on state changes ────────────────────────────
// Debounced subscription so we don't hammer localStorage on every slider tick.
let persistTimer: ReturnType<typeof setTimeout> | null = null;

useSimStore.subscribe((state) => {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistState({
      params: state.params,
      weights: state.weights,
      arrow: state.arrow,
      windSpeed: state.windSpeed,
      tuning: state.tuning,
    });
  }, 500);
});
