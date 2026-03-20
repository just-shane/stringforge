# Bowstring Dynamics Simulator

A physics-based archery bowstring and arrow simulator built with React + TypeScript. Model string vibration, bow mechanics, arrow ballistics, and bow tuning — all in the browser.

## What It Does

This simulator lets archers and bow technicians experiment with complete bow and arrow configurations and see the physics in real time:

- **4 bow types** — Compound (with cam let-off), recurve, longbow, and crossbow with distinct force-draw curves
- **String vibration modeling** — Standing wave simulation with 8 harmonic modes: `f = (n/2L) × √(T/μ)`
- **7 string materials** — BCY-X, 452X, 8190, D97, Dacron B-50, Fast Flight, 8125 with full material properties
- **Speed weight optimization** — Place up to 8 weights (brass/tungsten) and visualize vibration damping vs. speed penalty
- **Arrow builder** — 15 shafts from Easton, Gold Tip, Victory, Black Eagle with component-level weight and FOC calculation
- **Spine matching** — Dynamic spine estimation with recommendations based on bow setup
- **Ballistics engine** — Trajectory with drag, gravity drop, wind drift, KE, and momentum at 10-yard intervals
- **Energy model** — Stored energy, efficiency, and loss breakdown (arrow KE, limb, hysteresis, vibration, sound)
- **6 themes** — Midnight, Neon, Dracula, Nord, Monokai, Catppuccin with runtime switching
- **Interactive SVG visualizations** — Side profile, cross-section, force-draw curve, energy breakdown, trajectory chart, harmonic spectrum

## The Physics

### Bow Mechanics

Each bow type has a distinct force-draw curve:

| Bow Type | Draw Curve | Efficiency | Let-Off |
|----------|-----------|------------|---------|
| Compound | Peak → plateau → let-off at wall | 80-85% | 65-90% |
| Recurve  | Supra-linear, flattening | 70-78% | None |
| Longbow  | Linear (Hookean) | 60-70% | None |
| Crossbow | Aggressive, short stroke | 75-80% | None |

Stored energy is computed by numerical integration of the force-draw curve. Arrow speed derives from:

```
v = √(2 × η × E_stored / m_virtual)
m_virtual = m_arrow + m_string/3
```

### String Vibration

The fundamental frequency is calculated from the wave equation with effective mass density accounting for string mass plus distributed weight mass. Weights damp harmonics based on proximity to antinodes — a weight at an antinode of mode `n` maximally damps that mode.

### Arrow Dynamics

- **FOC** (Front of Center): `FOC% = ((Balance Point / Arrow Length) - 0.5) × 100`
- **Dynamic spine**: Adjusts static spine for shaft length, point weight, and cam aggression
- **Trajectory**: Euler method integration with aerodynamic drag `F = 0.5·Cd·ρ·A·v²`

### Material Properties

| Material | Density | Modulus | Stretch | Creep |
|----------|---------|---------|---------|-------|
| BCY-X | 0.0052 g/m | 7.5 GPa | 0.5% | 0.01%/1k |
| Fast Flight | 0.0042 g/m | 8.0 GPa | 0.8% | 0.02%/1k |
| Dacron B-50 | 0.0068 g/m | 3.5 GPa | 2.6% | 0.10%/1k |

Higher modulus = more efficient energy transfer. Lower density = lighter string = faster arrow.

## Tech Stack

- **React 19** + **TypeScript** — Full type safety across physics engine and components
- **Vite** — Fast dev server and optimized production builds
- **Zustand** — Lightweight state management with localStorage persistence
- **Tailwind CSS v4** — Utility-first styling with CSS custom properties for theming
- **Vitest** — 75+ unit tests covering physics, arrow dynamics, and state management
- **SVG** — All visualizations rendered as inline SVG for crisp scaling

## Getting Started

```bash
git clone https://github.com/just-shane/bowstring-sim.git
cd bowstring-sim
npm install
npm run dev
```

## Project Structure

```
bowstring-sim/
├── src/
│   ├── lib/
│   │   ├── physics.ts        # Bow physics, energy model, string vibration
│   │   ├── arrow.ts           # Arrow builder, spine, FOC, ballistics
│   │   └── themes.ts          # 6 color themes
│   ├── components/
│   │   ├── ArrowBuilder/      # Arrow component editor with shaft database
│   │   ├── Ballistics/        # Trajectory chart and data table
│   │   ├── ControlPanel/      # Bow/string parameter controls
│   │   ├── CrossSectionView/  # Top-down strand bundle
│   │   ├── DrawCurve/         # Force-draw curve visualization
│   │   ├── EnergyBreakdown/   # Energy distribution stacked bar
│   │   ├── HarmonicSpectrum/  # Frequency spectrum chart
│   │   ├── Layout/            # Header, ThemeProvider, PlacementGuide
│   │   ├── Menu/              # Hamburger settings menu
│   │   ├── StatsBar/          # Real-time metrics display
│   │   ├── StringVisualizer/  # Side profile with animation
│   │   └── WeightCard/        # Individual weight configuration
│   ├── __tests__/
│   │   ├── physics.test.ts    # 40 physics engine tests
│   │   ├── arrow.test.ts      # 24 arrow dynamics tests
│   │   └── store.test.ts      # 11 state management tests
│   ├── store.ts               # Zustand store
│   └── App.tsx                # Root layout with tabbed panels
├── TODO.md                    # 7-phase project roadmap
└── README.md
```

## Reference Values

| Metric | Value | Context |
|--------|-------|---------|
| Arrow speed | 290-310 fps | 70 lb compound, 30" draw, 350gr arrow (IBO) |
| String weight | 70-90 grains | 24-strand BCY-X compound string |
| Bow efficiency | 80-85% | Modern compound bow |
| Speed loss | ~1.8 fps / 10gr | Weight added to string |
| Arrow KE | 79.9 ft-lbs | 300 fps, 400gr arrow |
| String frequency | 120-160 Hz | Fundamental, 350 lbs, ~50" vibrating length |

## Key Formulas

| Formula | Expression |
|---------|-----------|
| Kinetic Energy | `KE = (m_gr × v_fps²) / 450,800` ft-lbs |
| Momentum | `p = (m_gr × v_fps) / 225,400` slug·ft/s |
| FOC | `((Balance / Length) - 0.5) × 100` % |
| Static Spine | `26 / deflection_in` lbs |
| Drag Force | `F = 0.5 × Cd × ρ × A × v²` N |
| String Frequency | `fₙ = (n / 2L) × √(T / μ)` Hz |
| Stored Energy | Area under force-draw curve (numerical integration) |

## License

MIT
