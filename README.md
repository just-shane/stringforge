# Bowstring Dynamics Simulator

A physics-based archery bowstring simulator built with React. Model string vibration, harmonic behavior, speed weight placement, arrow ballistics, and bow tuning — all in the browser.

## What It Does

This simulator lets archers and bow technicians experiment with bowstring configurations and see the physics in real time:

- **String vibration modeling** — Standing wave simulation with 8 harmonic modes, driven by the wave equation `f = (n/2L) × √(T/μ)`
- **Speed weight optimization** — Place up to 8 weights (brass or tungsten) on the string and visualize their effect on vibration damping, harmonic suppression, and speed penalty
- **Material comparison** — Switch between string materials (BCY-X, 452X, 8190, D97) and see how density, stretch, and modulus affect performance
- **Real-time stats** — Fundamental frequency, total string mass, speed loss (fps), vibration reduction %, and balance point
- **Interactive SVG visualizations** — Side profile with animated vibration, top-down strand cross-section, and harmonic spectrum chart
- **Drag-to-tune** — Click and drag weights directly on the string visualization to reposition them

## The Physics

### String Vibration

The simulator models a bowstring as a vibrating string with point masses (speed weights) attached. The fundamental frequency is calculated from:

```
f₁ = (1 / 2L) × √(T / μ)
```

Where:
- `L` = vibrating string length (accounting for brace height geometry)
- `T` = string tension (converted from lbs to Newtons)
- `μ` = effective linear mass density (string mass + distributed weight mass per unit length)

Higher harmonics `fₙ = n × f₁` are computed with amplitude damping based on weight proximity to harmonic nodes — a weight placed at an antinode of mode `n` maximally damps that mode.

### Speed Weight Effects

Speed weights serve two purposes on a bowstring:

1. **Vibration dampening** — Absorbs oscillation energy, reducing hand shock and noise. Effectiveness depends on placement relative to harmonic nodes. Optimal positions:
   - **25% / 75%** — Targets the 2nd harmonic (most common setup)
   - **33% / 67%** — Targets the 3rd harmonic with less speed penalty
   - **50%** — Maximum fundamental dampening

2. **Speed penalty** — Every 10 grains of added weight costs approximately 1.8 fps of arrow velocity. The tradeoff between vibration reduction and speed loss is the core optimization problem.

### Material Properties

| Material | Density | Modulus | Stretch |
|----------|---------|---------|---------|
| BCY-X    | High    | 7.5 GPa | 0.5%   |
| 452X     | Medium  | 7.2 GPa | 0.8%   |
| 8190     | Low     | 6.8 GPa | 1.0%   |
| D97      | Medium  | 6.5 GPa | 1.2%   |

Higher modulus = less stretch = more efficient energy transfer. Lower density = lighter string = faster arrow speed.

### Energy Transfer

Arrow velocity depends on the energy chain:

```
E_stored (draw force × distance) → E_arrow (kinetic) + E_losses (limbs, string, vibration, heat, sound)
```

Compound bows are 80-85% efficient. The simulator accounts for string mass contribution via the effective mass model: `m_virtual = m_arrow + m_string/3`.

## Planned Features

See [TODO.md](./TODO.md) for the full roadmap. Key upcoming work:

- **Bow type support** — Compound (with cam profiles and let-off), recurve, longbow, crossbow with distinct force-draw curves
- **Arrow dynamics** — Arrow builder, spine matching, FOC calculator, Archer's Paradox visualization
- **Ballistics engine** — Trajectory with drag, gravity drop tables, wind drift, KE and momentum calculations
- **Tuning tools** — Paper tune simulator, bare shaft tuning, walk-back tuning, setup optimizer
- **Draw cycle visualization** — Animated draw sequence with force-draw curve plotting

## Tech Stack

- **React** — Component-based UI with hooks for state and animation
- **TypeScript** — Full type safety for physics engine and component props (migration in progress)
- **SVG** — All visualizations rendered as inline SVG for crisp scaling and interaction
- **Vite** — Fast dev server and optimized production builds (setup in progress)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/just-shane/bowstring-sim.git
cd bowstring-sim

# Install dependencies (once React migration is scaffolded)
npm install

# Start development server
npm run dev
```

> **Note:** The project is currently being migrated from a prototype JSX file to a full React + TypeScript application. The `bowstring-sim.jsx` file contains the working prototype with all physics and visualization code.

## Project Structure

```
bowstring-sim/
├── bowstring-sim.jsx      # Working prototype (React component)
├── TODO.md                # Project roadmap with physics references
├── README.md
└── src/                   # (Planned) React + TypeScript app
    ├── lib/
    │   ├── physics.ts     # Physics engine module
    │   ├── ballistics.ts  # Arrow trajectory calculations
    │   └── materials.ts   # String material database
    ├── components/
    │   ├── ControlPanel/
    │   ├── StringVisualizer/
    │   ├── CrossSectionView/
    │   ├── HarmonicSpectrum/
    │   ├── StatsBar/
    │   └── WeightCard/
    └── App.tsx
```

## Reference Values

These real-world values are used to validate simulator accuracy:

| Metric | Value | Context |
|--------|-------|---------|
| Arrow speed | 290-310 fps | 70 lb compound, 30" draw, 350gr arrow (IBO) |
| String weight | 70-90 grains | 24-strand BCY-X compound string |
| Bow efficiency | 80-85% | Modern compound bow |
| Speed loss | ~1.8 fps / 10gr | Weight added to string |
| Brace height effect | ~7-10 fps / inch | Lower brace = more speed, less forgiveness |
| String frequency | 120-160 Hz | Fundamental, 350 lbs tension, ~50" vibrating length |

## Key Formulas

| Formula | Expression |
|---------|-----------|
| Kinetic Energy | `KE = (m_gr × v_fps²) / 450,800` ft-lbs |
| Momentum | `p = (m_gr × v_fps) / 225,400` slug·ft/s |
| FOC | `((Balance / Length) - 0.5) × 100` % |
| Static Spine | `26 / deflection_in` lbs |
| Drag Force | `F = 0.5 × Cd × ρ × A × v²` N |
| String Frequency | `fₙ = (n / 2L) × √(T / μ)` Hz |

## License

MIT
