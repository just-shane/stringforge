// ─── State Persistence ─────────────────────────────────────────
// Save/restore bow+arrow+weight state across sessions via localStorage.

import type { SimParams, Weight } from "./physics.ts";
import type { ArrowComponents } from "./arrow.ts";
import type { TuningState } from "../store.ts";

const STATE_KEY = "stringforge-state";

export interface PersistedState {
  params: SimParams;
  weights: Weight[];
  arrow: ArrowComponents;
  windSpeed: number;
  tuning: TuningState;
}

export function loadPersistedState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Basic validation
    if (parsed && parsed.params && parsed.weights && parsed.arrow) {
      return parsed as PersistedState;
    }
    return null;
  } catch {
    return null;
  }
}

export function persistState(state: PersistedState): void {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable or full
  }
}

export function clearPersistedState(): void {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch {
    // noop
  }
}
