export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    // Backgrounds
    bg: string;
    panel: string;
    surface: string;
    // Borders
    border: string;
    borderLight: string;
    // Text
    text: string;
    textMuted: string;
    textDim: string;
    textFaint: string;
    // Accent (primary interactive color)
    accent: string;
    accentDim: string;
    accentGlow: string;
    // Semantic
    warn: string;
    danger: string;
    // Weight materials
    brass: string;
    tungsten: string;
    // String color in SVG
    string: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark & subdued",
    colors: {
      bg: "#0c0e14",
      panel: "#11131a",
      surface: "rgba(255,255,255,0.03)",
      border: "#1c1f2b",
      borderLight: "#252836",
      text: "#c8cad0",
      textMuted: "#8b8e98",
      textDim: "#5c5f6a",
      textFaint: "#3a3d47",
      accent: "#6b9eff",
      accentDim: "rgba(107,158,255,0.12)",
      accentGlow: "rgba(107,158,255,0.05)",
      warn: "#e0b44a",
      danger: "#d46a6a",
      brass: "#c5943a",
      tungsten: "#7a8b99",
      string: "#9aa0ab",
    },
  },
  {
    id: "neon",
    name: "Neon",
    description: "Bright & bold",
    colors: {
      bg: "#0a0a0a",
      panel: "#111111",
      surface: "rgba(255,255,255,0.02)",
      border: "#1a1a1a",
      borderLight: "#222222",
      text: "#e0e0e0",
      textMuted: "#999999",
      textDim: "#666666",
      textFaint: "#444444",
      accent: "#a0ff00",
      accentDim: "rgba(160,255,0,0.15)",
      accentGlow: "rgba(160,255,0,0.05)",
      warn: "#ffd93d",
      danger: "#ff6b6b",
      brass: "#c5943a",
      tungsten: "#7a8b99",
      string: "#d4d4d4",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    description: "Classic vampire",
    colors: {
      bg: "#282a36",
      panel: "#21222c",
      surface: "rgba(255,255,255,0.04)",
      border: "#44475a",
      borderLight: "#515473",
      text: "#f8f8f2",
      textMuted: "#bfbfbf",
      textDim: "#6272a4",
      textFaint: "#44475a",
      accent: "#bd93f9",
      accentDim: "rgba(189,147,249,0.15)",
      accentGlow: "rgba(189,147,249,0.05)",
      warn: "#f1fa8c",
      danger: "#ff5555",
      brass: "#f1c471",
      tungsten: "#8ba4b5",
      string: "#f8f8f2",
    },
  },
  {
    id: "nord",
    name: "Nord",
    description: "Arctic cool",
    colors: {
      bg: "#2e3440",
      panel: "#272c36",
      surface: "rgba(255,255,255,0.03)",
      border: "#3b4252",
      borderLight: "#434c5e",
      text: "#eceff4",
      textMuted: "#b8bfca",
      textDim: "#707a8c",
      textFaint: "#4c566a",
      accent: "#88c0d0",
      accentDim: "rgba(136,192,208,0.15)",
      accentGlow: "rgba(136,192,208,0.05)",
      warn: "#ebcb8b",
      danger: "#bf616a",
      brass: "#d4a44a",
      tungsten: "#81a1c1",
      string: "#d8dee9",
    },
  },
  {
    id: "monokai",
    name: "Monokai",
    description: "Warm editor",
    colors: {
      bg: "#272822",
      panel: "#1e1f1a",
      surface: "rgba(255,255,255,0.03)",
      border: "#3e3d32",
      borderLight: "#4e4d42",
      text: "#f8f8f2",
      textMuted: "#b3b3a6",
      textDim: "#75715e",
      textFaint: "#49483e",
      accent: "#f92672",
      accentDim: "rgba(249,38,114,0.12)",
      accentGlow: "rgba(249,38,114,0.05)",
      warn: "#e6db74",
      danger: "#f92672",
      brass: "#e6b44c",
      tungsten: "#8a9a7b",
      string: "#e6e2d8",
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    description: "Soft pastels",
    colors: {
      bg: "#1e1e2e",
      panel: "#181825",
      surface: "rgba(255,255,255,0.03)",
      border: "#313244",
      borderLight: "#45475a",
      text: "#cdd6f4",
      textMuted: "#a6adc8",
      textDim: "#6c7086",
      textFaint: "#45475a",
      accent: "#cba6f7",
      accentDim: "rgba(203,166,247,0.15)",
      accentGlow: "rgba(203,166,247,0.05)",
      warn: "#f9e2af",
      danger: "#f38ba8",
      brass: "#e0b464",
      tungsten: "#89b4fa",
      string: "#bac2de",
    },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Maximum visibility",
    colors: {
      bg: "#000000",
      panel: "#0a0a0a",
      surface: "rgba(255,255,255,0.06)",
      border: "#444444",
      borderLight: "#666666",
      text: "#ffffff",
      textMuted: "#e0e0e0",
      textDim: "#bbbbbb",
      textFaint: "#888888",
      accent: "#00ff88",
      accentDim: "rgba(0,255,136,0.2)",
      accentGlow: "rgba(0,255,136,0.08)",
      warn: "#ffff00",
      danger: "#ff3333",
      brass: "#ffcc00",
      tungsten: "#aaccff",
      string: "#ffffff",
    },
  },
];

export function getThemeById(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
