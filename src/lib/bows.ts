// ─── Bow Database ──────────────────────────────────────────────
// Factory specs for common compound and recurve bows

import type { BowType, SimParams, Weight } from "./physics.ts";
import type { ArrowComponents } from "./arrow.ts";

export interface BowSpec {
  id: string;
  name: string;
  manufacturer: string;
  bowType: BowType;
  ataLength: number; // axle-to-axle (inches)
  braceHeight: number; // factory spec (inches)
  iboSpeed: number; // IBO rating (fps) — 350gr arrow, 70lb, 30"
  drawWeightRange: [number, number]; // min/max lbs
  drawLengthRange: [number, number]; // min/max inches
  letOff: number; // 0-1
  camType: string; // "binary", "single", "hybrid", "round", "none"
  stringLength: number; // inches
  weight: number; // bow mass in lbs
  description: string;
}

export const BOW_DATABASE: BowSpec[] = [
  // ─── Compound Bows ─────────────────────────────────────────
  {
    id: "mathews-phase4-33",
    name: "Phase4 33",
    manufacturer: "Mathews",
    bowType: "compound",
    ataLength: 33,
    braceHeight: 6.0,
    iboSpeed: 336,
    drawWeightRange: [60, 75],
    drawLengthRange: [25.5, 30.5],
    letOff: 0.80,
    camType: "single",
    stringLength: 56.5,
    weight: 4.64,
    description: "Smooth draw cycle with Switchweight technology",
  },
  {
    id: "hoyt-rx8-ultra",
    name: "RX8 Ultra",
    manufacturer: "Hoyt",
    bowType: "compound",
    ataLength: 34,
    braceHeight: 6.25,
    iboSpeed: 342,
    drawWeightRange: [40, 80],
    drawLengthRange: [25, 30],
    letOff: 0.80,
    camType: "binary",
    stringLength: 57.75,
    weight: 4.5,
    description: "HBX cam with full-tilt technology",
  },
  {
    id: "bowtech-sr350",
    name: "SR350",
    manufacturer: "Bowtech",
    bowType: "compound",
    ataLength: 33,
    braceHeight: 6.75,
    iboSpeed: 350,
    drawWeightRange: [50, 80],
    drawLengthRange: [26, 31],
    letOff: 0.80,
    camType: "binary",
    stringLength: 57,
    weight: 4.5,
    description: "Deadlock cam system with clutch performance",
  },
  {
    id: "pse-nock-on-evo-ntn",
    name: "NTN 33M",
    manufacturer: "PSE",
    bowType: "compound",
    ataLength: 33,
    braceHeight: 6.25,
    iboSpeed: 336,
    drawWeightRange: [55, 75],
    drawLengthRange: [25.5, 30],
    letOff: 0.85,
    camType: "single",
    stringLength: 56.5,
    weight: 4.4,
    description: "Nock On Edition — E/F hybrid cam",
  },
  {
    id: "prime-revex-2",
    name: "Revex 2",
    manufacturer: "Prime",
    bowType: "compound",
    ataLength: 33,
    braceHeight: 6.5,
    iboSpeed: 332,
    drawWeightRange: [40, 70],
    drawLengthRange: [25, 30],
    letOff: 0.85,
    camType: "hybrid",
    stringLength: 57.25,
    weight: 4.3,
    description: "Roto-cam with inline technology",
  },
  {
    id: "elite-envision",
    name: "EnVision",
    manufacturer: "Elite",
    bowType: "compound",
    ataLength: 33,
    braceHeight: 6.0,
    iboSpeed: 335,
    drawWeightRange: [40, 70],
    drawLengthRange: [25, 30],
    letOff: 0.80,
    camType: "binary",
    stringLength: 56.0,
    weight: 4.4,
    description: "S.E.T. technology for dead-in-hand feel",
  },
  {
    id: "bear-legit",
    name: "Legit RTH",
    manufacturer: "Bear",
    bowType: "compound",
    ataLength: 30,
    braceHeight: 6.0,
    iboSpeed: 315,
    drawWeightRange: [10, 70],
    drawLengthRange: [14, 30],
    letOff: 0.75,
    camType: "single",
    stringLength: 52.5,
    weight: 3.6,
    description: "Wide adjustability — great for beginners",
  },

  // ─── Recurve Bows ─────────────────────────────────────────
  {
    id: "hoyt-formula-xi",
    name: "Formula Xi",
    manufacturer: "Hoyt",
    bowType: "recurve",
    ataLength: 66,
    braceHeight: 8.5,
    iboSpeed: 0,
    drawWeightRange: [22, 48],
    drawLengthRange: [24, 32],
    letOff: 0,
    camType: "none",
    stringLength: 63,
    weight: 2.5,
    description: "Grand Prix geometry, Olympic-level riser",
  },
  {
    id: "win-win-meta-dx",
    name: "Meta DX",
    manufacturer: "Win&Win",
    bowType: "recurve",
    ataLength: 68,
    braceHeight: 8.75,
    iboSpeed: 0,
    drawWeightRange: [20, 46],
    drawLengthRange: [24, 32],
    letOff: 0,
    camType: "none",
    stringLength: 65,
    weight: 2.3,
    description: "Nano carbon limbs with TFT riser",
  },
  {
    id: "gillo-g1",
    name: "G1",
    manufacturer: "Gillo",
    bowType: "recurve",
    ataLength: 66,
    braceHeight: 8.5,
    iboSpeed: 0,
    drawWeightRange: [18, 44],
    drawLengthRange: [24, 32],
    letOff: 0,
    camType: "none",
    stringLength: 63,
    weight: 2.4,
    description: "Italian precision CNC riser, ILF system",
  },

  // ─── Longbows ──────────────────────────────────────────────
  {
    id: "bear-montana",
    name: "Montana",
    manufacturer: "Bear",
    bowType: "longbow",
    ataLength: 64,
    braceHeight: 7.5,
    iboSpeed: 0,
    drawWeightRange: [30, 55],
    drawLengthRange: [26, 30],
    letOff: 0,
    camType: "none",
    stringLength: 61,
    weight: 1.7,
    description: "Classic reflex-deflex longbow, Dymond wood",
  },
  {
    id: "howard-hill-wesley",
    name: "Wesley Special",
    manufacturer: "Howard Hill",
    bowType: "longbow",
    ataLength: 66,
    braceHeight: 7.0,
    iboSpeed: 0,
    drawWeightRange: [35, 80],
    drawLengthRange: [26, 32],
    letOff: 0,
    camType: "none",
    stringLength: 63,
    weight: 1.5,
    description: "Traditional D-profile, bamboo and hardwood",
  },

  // ─── Crossbows ─────────────────────────────────────────────
  {
    id: "tenpoint-nitro-xrt",
    name: "Nitro XRT",
    manufacturer: "TenPoint",
    bowType: "crossbow",
    ataLength: 16.5,
    braceHeight: 5.0,
    iboSpeed: 470,
    drawWeightRange: [225, 225],
    drawLengthRange: [13.5, 13.5],
    letOff: 0,
    camType: "binary",
    stringLength: 33,
    weight: 7.3,
    description: "Reverse-draw, ACUslide with EVO-X marksman scope",
  },
  {
    id: "ravin-r500",
    name: "R500",
    manufacturer: "Ravin",
    bowType: "crossbow",
    ataLength: 10.5,
    braceHeight: 4.5,
    iboSpeed: 500,
    drawWeightRange: [300, 300],
    drawLengthRange: [14, 14],
    letOff: 0,
    camType: "binary",
    stringLength: 32,
    weight: 8.0,
    description: "HeliCoil cam, Versa-Draw cocking system — 500 fps",
  },
];

// ─── Saved Profile System ──────────────────────────────────────
export interface SavedProfile {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  bowSpec?: string; // optional reference to BowSpec id
  params: SimParams;
  weights: Weight[];
  arrow: ArrowComponents;
}

const PROFILES_KEY = "bowstring-profiles";

export function loadProfiles(): SavedProfile[] {
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedProfile[];
  } catch {
    return [];
  }
}

export function saveProfiles(profiles: SavedProfile[]): void {
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // localStorage unavailable
  }
}

export function createProfile(
  name: string,
  params: SimParams,
  weights: Weight[],
  arrow: ArrowComponents,
  bowSpecId?: string,
): SavedProfile {
  const now = Date.now();
  return {
    id: `profile-${now}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    createdAt: now,
    updatedAt: now,
    bowSpec: bowSpecId,
    params,
    weights,
    arrow,
  };
}

export function deleteProfile(profiles: SavedProfile[], id: string): SavedProfile[] {
  return profiles.filter((p) => p.id !== id);
}

// ─── Arrow Presets ─────────────────────────────────────────────
export interface ArrowPreset {
  id: string;
  name: string;
  description: string;
  use: "target" | "hunting" | "3d";
  components: ArrowComponents;
}

export const ARROW_PRESETS: ArrowPreset[] = [
  {
    id: "hunting-heavy",
    name: "Heavy Hunting Build",
    description: "High FOC, max penetration — elk/moose",
    use: "hunting",
    components: {
      shaft: "easton-fmj-340",
      shaftLength: 28,
      pointWeight: 200,
      nockWeight: 10,
      fletchingWeight: 36,
      fletchingLength: 2,
      wrapWeight: 10,
    },
  },
  {
    id: "hunting-standard",
    name: "Standard Hunting Build",
    description: "Balanced speed & penetration — whitetail",
    use: "hunting",
    components: {
      shaft: "easton-axis-300",
      shaftLength: 28,
      pointWeight: 125,
      nockWeight: 10,
      fletchingWeight: 24,
      fletchingLength: 2,
      wrapWeight: 8,
    },
  },
  {
    id: "hunting-light",
    name: "Speed Hunting Build",
    description: "Flat trajectory, long range — antelope/western",
    use: "hunting",
    components: {
      shaft: "gt-hunter-400",
      shaftLength: 27,
      pointWeight: 100,
      nockWeight: 8,
      fletchingWeight: 18,
      fletchingLength: 2,
      wrapWeight: 0,
    },
  },
  {
    id: "target-outdoor",
    name: "Outdoor Target",
    description: "Thin shaft, low drag — 70m+ FITA rounds",
    use: "target",
    components: {
      shaft: "victory-vap-300",
      shaftLength: 29,
      pointWeight: 100,
      nockWeight: 8,
      fletchingWeight: 15,
      fletchingLength: 1.75,
      wrapWeight: 0,
    },
  },
  {
    id: "target-indoor",
    name: "Indoor Target",
    description: "Fat shaft for line-cutting — 18m Vegas rounds",
    use: "target",
    components: {
      shaft: "gt-hunter-500",
      shaftLength: 27,
      pointWeight: 100,
      nockWeight: 10,
      fletchingWeight: 24,
      fletchingLength: 2,
      wrapWeight: 8,
    },
  },
  {
    id: "3d-standard",
    name: "3D Competition",
    description: "Balanced trajectory & scoring — ASA/IBO",
    use: "3d",
    components: {
      shaft: "be-spartan-400",
      shaftLength: 28,
      pointWeight: 100,
      nockWeight: 10,
      fletchingWeight: 24,
      fletchingLength: 2,
      wrapWeight: 8,
    },
  },
];

// ─── Share Link Encoding ───────────────────────────────────────
export interface ShareState {
  params: SimParams;
  weights: Weight[];
  arrow: ArrowComponents;
}

export function encodeShareLink(state: ShareState): string {
  const json = JSON.stringify(state);
  const encoded = btoa(encodeURIComponent(json));
  return `${window.location.origin}${window.location.pathname}?s=${encoded}`;
}

export function decodeShareLink(url: string): ShareState | null {
  try {
    const u = new URL(url);
    const s = u.searchParams.get("s");
    if (!s) return null;
    const json = decodeURIComponent(atob(s));
    return JSON.parse(json) as ShareState;
  } catch {
    return null;
  }
}
