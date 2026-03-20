# Bowstring Dynamics Simulator — Roadmap

---

## API Keys & External Services

| Status | Service | Required? | Notes |
|--------|---------|-----------|-------|
| `N/A`  | None currently | No | Fully client-side application |

> Future phases may integrate external ballistics APIs or arrow database services.

---

## ✅ Phase 1: Foundation & Prototype (Complete)

### 1.1 Core Physics Engine
- [x] **String vibration model** — Standing wave equation with fundamental frequency `f = (1/2L) * sqrt(T/μ)`
- [x] **Harmonic decomposition** — First 8 harmonic modes with amplitude and damping calculations
- [x] **String material database** — BCY-X, 452X, 8190, D97 with density, modulus, and stretch properties
- [x] **Weight interaction model** — Mass-loaded string physics with node proximity damping
- [x] **Speed penalty estimation** — ~1.8 fps loss per 10 grains of added weight
- [x] **Vibration reduction scoring** — Effectiveness calculation based on weight position and mass

### 1.2 Interactive Visualizations
- [x] **Side profile view** — SVG string visualization with real-time vibration animation
- [x] **Top-down cross section** — Strand bundle visualization with weight compression zones
- [x] **Harmonic spectrum chart** — Bar chart of mode amplitudes with color-coded damping
- [x] **Draggable weights** — Click-and-drag weight repositioning on the string visualization

### 1.3 Controls & UI
- [x] **String parameter sliders** — Length, brace height, strand count, tension
- [x] **Material selector** — Toggle between 4 string materials
- [x] **Weight management** — Add/remove up to 8 speed weights with mass, position, and type (brass/tungsten)
- [x] **Stats dashboard** — Fundamental frequency, total mass, speed loss, vibration reduction, balance point

---

## 🔧 Phase 2: React Migration & Project Setup (In Progress)

### 2.1 Project Scaffolding
- [ ] **Initialize React project** — Vite + React + TypeScript setup
- [ ] **Component architecture** — Break monolithic JSX into modular components with proper file structure
- [ ] **State management** — Zustand or useReducer for centralized simulation state
- [ ] **Tailwind CSS integration** — Replace inline styles with utility classes, preserve dark theme

### 2.2 Component Decomposition
- [ ] **`PhysicsEngine` module** — Extract physics calculations into a pure TypeScript module with full type safety
- [ ] **`StringVisualizer` component** — Side profile SVG with animation loop (requestAnimationFrame)
- [ ] **`CrossSectionView` component** — Top-down strand bundle rendering
- [ ] **`HarmonicSpectrum` component** — Frequency spectrum bar chart
- [ ] **`ControlPanel` component** — All parameter sliders, material selector, weight cards
- [ ] **`StatsBar` component** — Real-time computed metrics display
- [ ] **`WeightCard` component** — Individual weight configuration with drag interaction

### 2.3 Developer Experience
- [ ] **ESLint + Prettier** — Code formatting and linting rules
- [ ] **Unit tests for physics engine** — Vitest tests validating frequency, energy, and ballistic calculations against known values
- [ ] **CI pipeline** — GitHub Actions for lint, test, build on PR

---

## 🚀 Phase 3: Physics Engine Overhaul

> **Why it matters:** The current physics engine uses simplified models. A production-quality simulator needs to model real-world bow mechanics accurately enough that archers can trust the results for tuning decisions.

### 3.1 Bow Type Support
- [ ] **Bow type selector** — Recurve, compound, longbow, crossbow
- [ ] **Compound cam system** — Model cam profiles (single, dual, hybrid, binary) with let-off curves
  > Cam let-off typically 65-90%. Force-draw curve: steep rise → plateau → sharp drop at wall
- [ ] **Draw force curves** — Accurate force-displacement models per bow type
  - Longbow: linear (Hookean), `F(x) ≈ k·x`
  - Recurve: supra-linear early, flattening at full draw
  - Compound: peak early, plateau, let-off at wall
- [ ] **Limb mechanics** — Limb mass, stiffness, and hysteresis modeling (3-5% energy loss in modern compounds)

### 3.2 Expanded String Materials Database
- [ ] **Additional materials** — Dacron B-50, Fast Flight, Dynaflight 97, 8125, X-99, Force10
- [ ] **Per-material properties** — Tensile strength/strand, feet/lb (waxed), stretch %, creep rate
  > Key distinction: stretch (recoverable/elastic) vs. creep (permanent deformation). Vectran blends eliminate creep.
- [ ] **Strand count recommendations** — Auto-suggest strand count based on draw weight and material
  - Recurve: 14 strands (<30 lbs), 16 (32-38 lbs), 18 (38+ lbs)
  - Compound: 20-28 strands depending on material
- [ ] **String weight calculator** — Accurate weight-per-length from material data and strand count

### 3.3 Energy Transfer Model
- [ ] **Stored energy calculation** — Area under the force-draw curve (numerical integration)
- [ ] **Efficiency model** — `η = KE_arrow / E_stored × 100%`
  - Longbow: 60-70%, Recurve: 70-78%, Compound: 80-85%
- [ ] **Energy loss breakdown** — Visual breakdown showing where energy goes:
  - Arrow KE (75-85%), limb KE (5-10%), string/cable KE (2-5%)
  - Hysteresis/heat (3-5%), vibration (2-5%), sound (1-2%)
- [ ] **Virtual arrow mass** — `m_virtual = m_arrow + m_string/3` (effective mass concept)
- [ ] **Speed prediction** — Estimated arrow velocity from energy balance: `v = sqrt(2·η·E_stored / m_virtual)`

### 3.4 String Physics Improvements
- [ ] **Brace height impact model** — Each 1" decrease ≈ +7-10 fps, with forgiveness tradeoff
- [ ] **Cam wrap calculation** — String consumed by cam contact arc (~35% wrap per cam), reducing vibrating length
- [ ] **Serving zone modeling** — Center serving, end servings with mass and stiffness contributions
- [ ] **String stretch under load** — Dynamic elongation based on material elastic modulus
- [ ] **Creep simulation** — Long-term brace height drift based on material creep rate and shot count

---

## 🚀 Phase 4: Arrow Dynamics

> **Why it matters:** The bowstring is only half the equation. Modeling the arrow allows the simulator to predict real-world performance metrics that archers actually care about: speed, trajectory, and penetration.

### 4.1 Arrow Builder
- [ ] **Arrow component editor** — Shaft, point/insert, nock, fletching with individual weights
- [ ] **Shaft database** — Common shafts with spine, weight/inch, diameter, material
- [ ] **Total arrow weight calculator** — Sum of components in grains
- [ ] **FOC calculator** — `FOC% = ((Balance Point / Arrow Length) - 0.5) × 100`
  > Optimal: 7-12% target, 10-15% hunting, 15-30%+ extreme penetration

### 4.2 Spine Matching
- [ ] **Static spine reference** — AMO standard: 1.94 lb weight on 29" shaft, measure deflection
  > Spine (lbs) = 26 / deflection (inches). Industry sizes: 300, 340, 400, 500, 600, 700, 800, 1000
- [ ] **Dynamic spine estimator** — Adjustments for shaft length, point weight, draw weight, cam aggression
  > Heavier points = weaker dynamic spine, shorter arrows = stiffer dynamic spine
- [ ] **Spine recommendation engine** — Suggest spine based on bow setup and arrow configuration

### 4.3 Archer's Paradox Visualization
- [ ] **Arrow flex animation** — Show lateral oscillation during power stroke
  > String release: 1.5-2.25 ms. Max nock deflection at ~5.4 ms. Max lateral displacement: ~13.1 mm
- [ ] **Nock travel path** — Visualize nock path during acceleration phase
- [ ] **Clearance visualization** — Show arrow-riser clearance based on spine and rest type

### 4.4 Ballistics Engine
- [ ] **Trajectory calculator** — Numerical integration of equations of motion with drag:
  ```
  F_drag = 0.5 · C_d · ρ · A · v²
  C_d ≈ 1.5-2.0 (fletched arrows), ρ = 1.225 kg/m³ (sea level)
  ```
- [ ] **Gravity drop table** — Drop at 10-yard increments (e.g., 20yd: ~3", 40yd: ~14", 60yd: ~40")
- [ ] **Wind drift model** — Lateral deflection from crosswind (~3-5" per 10 yards at 10 mph)
- [ ] **Kinetic energy & momentum** — `KE = (m·v²) / 450,800` ft-lbs, `p = (m·v) / 225,400` slug·ft/s
- [ ] **Penetration estimation** — Momentum-based penetration model for different game animals

---

## 🚀 Phase 5: Tuning Tools

> **Why it matters:** Bow tuning is the most time-consuming part of archery setup. Digital tools that simulate tuning procedures save hours at the range and help archers understand *why* adjustments work.

### 5.1 Paper Tune Simulator
- [ ] **Virtual paper target** — Show predicted tear pattern based on current setup
- [ ] **Tear diagnosis engine** — Identify cause from tear direction:
  - Tail left (RH): too stiff / rest too far left
  - Tail right (RH): too weak / rest too far right
  - Tail high: nock point too high
  - Tail low: nock point too low
- [ ] **Adjustment suggestions** — Recommend specific changes to achieve bullet hole

### 5.2 Bare Shaft Tuning
- [ ] **Bare vs. fletched comparison** — Predict group separation based on spine mismatch
- [ ] **Iterative tuning workflow** — Step-by-step guide with visual feedback

### 5.3 Walk-Back Tuning
- [ ] **Virtual target** — Simulated vertical line with arrow impacts at increasing distances
- [ ] **Centershot diagnosis** — Detect and correct rest/centershot misalignment from drift pattern

### 5.4 Setup Optimizer
- [ ] **Multi-variable optimizer** — Find optimal combination of:
  - String material + strand count for target speed/noise balance
  - Weight placement for maximum vibration reduction with minimum speed loss
  - Arrow spine + weight for bow setup
- [ ] **Comparison mode** — Side-by-side comparison of two complete setups

---

## 🔮 Phase 6: Advanced Features

### 6.1 Bow Profiles & Presets
- [ ] **Bow database** — Common compound and recurve bows with factory specs (ATA length, brace height, IBO speed, cam type)
- [ ] **Custom bow profiles** — Save/load complete bow configurations
- [ ] **Arrow presets** — Common arrow builds (Easton, Gold Tip, Victory, Black Eagle shafts)

### 6.2 Draw Cycle Visualization
- [ ] **Animated draw sequence** — Full draw cycle showing limb deflection, cam rotation, string path
- [ ] **Force-draw curve chart** — Interactive plot with area-under-curve energy calculation
- [ ] **Let-off visualization** — Highlight holding weight vs. peak weight for compound bows

### 6.3 Sound & Vibration Analysis
- [ ] **Audio synthesis** — Generate realistic bowstring "twang" from harmonic spectrum data
- [ ] **Vibration frequency waterfall** — Time-frequency plot showing harmonic decay after release
- [ ] **Decibel estimation** — Approximate shot noise level based on energy dissipation

### 6.4 Data & Export
- [ ] **Setup export** — PDF/PNG export of complete bow setup report
- [ ] **Share links** — URL-encoded state for sharing configurations
- [ ] **Comparison reports** — Before/after setup change analysis

### 6.5 Educational Mode
- [ ] **Glossary panel** — Hover-definitions for archery terms (brace height, FOC, spine, etc.)
- [ ] **Physics explainers** — Interactive demonstrations of key concepts (standing waves, Archer's Paradox, drag)
- [ ] **Beginner setup wizard** — Guided flow: select bow type → draw weight → draw length → get arrow recommendation

---

## 🔮 Phase 7: Platform & Polish

### 7.1 Performance
- [ ] **Web Workers** — Offload physics calculations to worker threads
- [ ] **Canvas fallback** — Optional Canvas2D renderer for complex animations (>60fps target)
- [ ] **Lazy loading** — Code-split phases/features not immediately needed

### 7.2 Responsive & PWA
- [ ] **Mobile-optimized layout** — Touch-friendly controls, collapsible panels
- [ ] **PWA manifest** — Installable app with offline support
- [ ] **Local storage persistence** — Save bow/arrow profiles between sessions

### 7.3 Accessibility
- [ ] **Keyboard navigation** — Full keyboard control for all interactive elements
- [ ] **Screen reader support** — ARIA labels for visualizations, live regions for stats
- [ ] **High contrast mode** — Alternative color scheme for visibility

---

# 🔥 PRIORITY ROADMAP — Immediate Work

## Priority 1: React Migration (Phase 2)
> Get the existing prototype into a proper React + TypeScript project with clean architecture.

### Done
- [x] Core physics engine prototype
- [x] Interactive SVG visualizations
- [x] Draggable weight system
- [x] Basic controls and stats display

### Immediate
- [ ] `npm create vite@latest` with React + TypeScript template
- [ ] Extract physics engine to `src/lib/physics.ts` with full types
- [ ] Build component tree: `App → Layout → [ControlPanel, MainView → [StatsBar, StringVisualizer, CrossSection, HarmonicSpectrum]]`
- [ ] Port inline styles to Tailwind CSS
- [ ] Add Vitest with physics engine unit tests

## Priority 2: Physics Accuracy (Phase 3)
> Upgrade from approximations to real archery physics.

- [ ] Implement bow type selector with distinct force-draw curves
- [ ] Add compound cam modeling (let-off, valley, wall)
- [ ] Build energy transfer model with efficiency calculations
- [ ] Expand string material database with real-world data

## Priority 3: Arrow System (Phase 4)
> Add the other half of the equation — arrow dynamics and ballistics.

- [ ] Arrow component builder with weight calculator
- [ ] Spine matching system
- [ ] Basic trajectory calculator with drag model
- [ ] KE and momentum calculations

---

> **Reference values for validation:**
> - 70 lb compound, 30" draw, 350gr arrow → ~290-310 fps (IBO conditions)
> - 24-strand BCY-X string ≈ 70-90 grains
> - Compound efficiency ≈ 80-85%
> - Arrow KE at 300 fps / 400gr = 79.9 ft-lbs
> - Fundamental string frequency at 350 lbs tension, 50" vibrating length ≈ 120-160 Hz
