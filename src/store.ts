import { create } from "zustand";
import type { Weight, SimParams } from "./lib/physics.ts";
import { getThemeById } from "./lib/themes.ts";
import type { Theme } from "./lib/themes.ts";

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

interface SimState {
  params: SimParams;
  weights: Weight[];
  animating: boolean;
  theme: Theme;
  menuOpen: boolean;

  setParam: <K extends keyof SimParams>(key: K, value: SimParams[K]) => void;
  setWeights: (weights: Weight[]) => void;
  updateWeight: (index: number, weight: Weight) => void;
  removeWeight: (index: number) => void;
  addWeight: (weight: Weight) => void;
  setAnimating: (animating: boolean) => void;
  setTheme: (id: string) => void;
  setMenuOpen: (open: boolean) => void;
}

export const useSimStore = create<SimState>((set) => ({
  params: {
    stringLength: 57.5,
    strandCount: 24,
    material: "BCY-X",
    tension: 350,
    braceHeight: 7.0,
  },

  weights: [
    { position: 25, mass: 15, type: "brass" },
    { position: 75, mass: 15, type: "brass" },
  ],

  animating: true,
  theme: getThemeById(loadThemeId()),
  menuOpen: false,

  setParam: (key, value) =>
    set((state) => ({ params: { ...state.params, [key]: value } })),

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

  setAnimating: (animating) => set({ animating }),

  setTheme: (id) => {
    const theme = getThemeById(id);
    saveThemeId(id);
    set({ theme });
  },

  setMenuOpen: (open) => set({ menuOpen: open }),
}));
