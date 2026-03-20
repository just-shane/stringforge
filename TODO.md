# StringForge — Roadmap

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

## ✅ Phase 2: React Migration & Project Setup (Complete)

### 2.1 Project Scaffolding
- [x] **Initialize React project** — Vite + React + TypeScript setup
- [x] **Component architecture** — Modular components with proper file structure
- [x] **State management** — Zustand for centralized simulation state
- [x] **Tailwind CSS integration** — Utility classes with dark theme support

### 2.2 Component Decomposition
- [x] **`PhysicsEngine` module** — Pure TypeScript module with full type safety
- [x] **`StringVisualizer` component** — Side profile SVG with animation loop (requestAnimationFrame)
- [x] **`CrossSectionView` component** — Top-down strand bundle rendering
- [x] **`HarmonicSpectrum` component** — Frequency spectrum bar chart
- [x] **`ControlPanel` component** — All parameter sliders, material selector, weight cards
- [x] **`StatsBar` component** — Real-time computed metrics display
- [x] **`WeightCard` component** — Individual weight configuration with drag interaction

### 2.3 Developer Experience
- [x] **Unit tests for physics engine** — Vitest tests validating frequency, energy, and ballistic calculations
- [x] **Theme system** — 6 themes (Midnight, Neon, Dracula, Nord, Monokai, Catppuccin) with runtime switching
- [x] **Hamburger settings menu** — Theme picker with localStorage persistence

---

## ✅ Phase 3: Physics Engine Overhaul (Complete)

### 3.1 Bow Type Support
- [x] **Bow type selector** — Compound, recurve, longbow, crossbow with distinct profiles
- [x] **Compound cam system** — Let-off modeling (80% default), holding weight calculation
- [x] **Draw force curves** — Per-bow-type force-displacement models
  - Longbow: linear (Hookean), Recurve: supra-linear, Compound: peak/plateau/let-off, Crossbow: aggressive
- [x] **Limb mechanics** — Limb mass fraction, hysteresis loss modeling per bow type

### 3.2 Expanded String Materials Database
- [x] **7 materials** — BCY-X, 452X, 8190, D97, Dacron B-50, Fast Flight, 8125
- [x] **Per-material properties** — Tensile strength/strand, feet/lb, stretch %, creep rate
- [x] **Strand count recommendations** — Auto-suggest based on draw weight, bow type, and material
- [x] **String weight calculator** — Weight from material density and strand count

### 3.3 Energy Transfer Model
- [x] **Stored energy calculation** — Numerical integration of force-draw curve
- [x] **Efficiency model** — Per-bow-type: Longbow 65%, Recurve 74%, Compound 82%, Crossbow 78%
- [x] **Energy loss breakdown** — Visual stacked bar: Arrow KE, Limb KE, String KE, Hysteresis, Vibration, Sound
- [x] **Virtual arrow mass** — `m_virtual = m_arrow + m_string/3`
- [x] **Speed prediction** — `v = sqrt(2·η·E_stored / m_virtual)` with brace height adjustment

### 3.4 String Physics Improvements
- [x] **Brace height impact model** — ~8.5 fps per inch deviation from reference
- [x] **Cam wrap calculation** — 35% wrap per cam reducing vibrating length
- [x] **Force-draw curve visualization** — Interactive chart with stored energy and brace height marker

---

## ✅ Phase 4: Arrow Dynamics (Complete)

### 4.1 Arrow Builder
- [x] **Arrow component editor** — Shaft, point weight, nock, fletching, wrap with individual weights
- [x] **Shaft database** — 15 shafts from Easton, Gold Tip, Victory, Black Eagle with spine/weight/diameter
- [x] **Total arrow weight calculator** — Sum of all components in grains
- [x] **FOC calculator** — `FOC% = ((Balance Point / Arrow Length) - 0.5) × 100` with ratings

### 4.2 Spine Matching
- [x] **Static spine reference** — Industry standard spine values (300, 340, 400, 500, 600, 700, etc.)
- [x] **Dynamic spine estimator** — Adjustments for shaft length, point weight, draw weight, cam aggression
- [x] **Spine recommendation engine** — Suggests spine based on bow setup and arrow configuration

### 4.3 Ballistics Engine
- [x] **Trajectory calculator** — Euler method numerical integration with drag: `F_drag = 0.5·C_d·ρ·A·v²`
- [x] **Gravity drop table** — Drop at 10-yard increments with trajectory visualization
- [x] **Wind drift model** — Lateral deflection from crosswind
- [x] **Kinetic energy & momentum** — `KE = (m·v²)/450,800`, `p = (m·v)/225,400`
- [x] **Effective/max range** — Range limits based on minimum KE thresholds (40/25 ft-lbs)

### 4.4 UI Additions
- [x] **Tabbed control panel** — "Bow & String" / "Arrow" tabs in the left panel
- [x] **Arrow builder panel** — Shaft selector (grouped by manufacturer), component sliders, summary stats
- [x] **Trajectory visualization** — SVG drop curve with annotated data points
- [x] **Ballistics data table** — Distance, drop, drift, velocity, KE, momentum, flight time

---

## ✅ Phase 5: Tuning Tools (Complete)

> **Why it matters:** Bow tuning is the most time-consuming part of archery setup. Digital tools that simulate tuning procedures save hours at the range and help archers understand *why* adjustments work.

### 5.1 Paper Tune Simulator
- [x] **Virtual paper target** — Show predicted tear pattern based on current setup
- [x] **Tear diagnosis engine** — Identify cause from tear direction:
  - Tail left (RH): too stiff / rest too far left
  - Tail right (RH): too weak / rest too far right
  - Tail high: nock point too high
  - Tail low: nock point too low
- [x] **Adjustment suggestions** — Recommend specific changes to achieve bullet hole

### 5.2 Bare Shaft Tuning
- [x] **Bare vs. fletched comparison** — Predict group separation based on spine mismatch
- [x] **Iterative tuning workflow** — Step-by-step guide with visual feedback

### 5.3 Walk-Back Tuning
- [x] **Virtual target** — Simulated vertical line with arrow impacts at increasing distances
- [x] **Centershot diagnosis** — Detect and correct rest/centershot misalignment from drift pattern

### 5.4 Setup Optimizer
- [x] **Multi-variable optimizer** — Find optimal combination of:
  - String material + strand count for target speed/noise balance
  - Weight placement for maximum vibration reduction with minimum speed loss
  - Arrow spine + weight for bow setup
- [x] **Comparison mode** — Side-by-side comparison of two complete setups

---

## ✅ Phase 6: Advanced Features (Complete)

### 6.1 Bow Profiles & Presets
- [x] **Bow database** — 15 bows from Mathews, Hoyt, Bowtech, PSE, Prime/G5, Elite, Bear, Win&Win, Gillo, Howard Hill, TenPoint, Ravin with factory specs (ATA length, brace height, IBO speed, cam type)
- [x] **Custom bow profiles** — Save/load complete bow configurations to localStorage with profile manager
- [x] **Arrow presets** — 6 presets: Heavy Hunting, Standard Hunting, Speed Hunting, Outdoor Target, Indoor Target, 3D Competition

### 6.2 Draw Cycle Visualization
- [x] **Animated draw sequence** — Full draw cycle SVG showing limb deflection, cam rotation, string path with play/scrub controls
- [x] **Let-off visualization** — Highlight holding weight vs. peak weight for compound bows, real-time force & energy bars

### 6.3 Sound & Vibration Analysis
- [x] **Audio synthesis** — Generate realistic bowstring "twang" from harmonic spectrum data using Web Audio API
- [x] **Vibration frequency waterfall** — Time-frequency SVG plot showing harmonic decay after release
- [x] **Decibel estimation** — Approximate shot noise level with calibrated model, dB meter visual, real-world comparisons

### 6.4 Data & Export
- [x] **Setup export** — Complete text setup report with download/copy functionality
- [x] **Share links** — URL-encoded state (base64) for sharing configurations, auto-load on page open
- [x] **Comparison reports** — Full setup report with all metrics for before/after analysis

### 6.5 Educational Mode
- [x] **Glossary panel** — 28 archery terms across 5 categories with search, related term navigation, detailed explanations
- [x] **Physics explainers** — Detailed explanations of standing waves, Archer's Paradox, efficiency, stored energy in glossary
- [x] **Beginner setup wizard** — Guided 4-5 step flow: purpose → experience → measurements → game (hunting) → recommendation with apply-to-simulator

---

## ✅ Guided Tour & Versioning (Complete)

- [x] **React Joyride integration** — 11-step guided tour covering all major sections
- [x] **Auto-launch for new users** — Tour shows on first visit, remembers completion in localStorage
- [x] **Version-aware reset** — Tour re-triggers when app version changes so users see new features
- [x] **Replay button** — "Replay Guided Tour" link at bottom of main panel
- [x] **Theme-matched styling** — Tour tooltips match active theme colors
- [x] **Version tracking** — Centralized `src/lib/version.ts` with `APP_VERSION`, semantic versioning (MAJOR.MINOR.PATCH), changelog
- [x] **Version display** — Header shows current version from single source of truth
- [x] **package.json synced** — `3.1.0`

---

## ✅ Phase 7: Platform & Polish (Complete)

### 7.1 Performance
- [x] **Web Workers** — Physics offloaded to worker thread via `usePhysicsWorker` hook (auto-fallback to main thread)
- [x] **Lazy loading** — Code-split 9 components via `React.lazy()`: DocsPanel, GlossaryPanel, SetupWizard, TuningPanel, BowDatabase, ProfileManager, DrawCycleView, SoundAnalysis, ShareExport. Initial bundle reduced 25% (479→360 KB gzipped)
- [x] **Suspense boundaries** — Loading fallback for all lazy components

### 7.2 Responsive & PWA
- [x] **Mobile-optimized layout** — Controls/Visualizations toggle on mobile, full-height panels, touch-friendly sizing
- [x] **PWA manifest** — `manifest.json` with app name, icons, standalone display, theme color
- [x] **Service worker** — Network-first caching strategy for offline support (`sw.js`)
- [x] **Local storage persistence** — Auto-save all bow/arrow/tuning state, debounced 500ms, restores on reload
- [x] **Apple mobile web app** — Meta tags for iOS standalone mode

### 7.3 Accessibility
- [x] **Skip navigation link** — "Skip to main content" for keyboard users (visible on focus)
- [x] **Keyboard navigation** — Escape closes all modals, proper tab order, `tabIndex` on tab buttons, `aria-pressed` on toggles
- [x] **Screen reader support** — ARIA roles (`tablist`, `tab`, `tabpanel`, `region`, `status`, `img`, `navigation`), `aria-label` on all visualizations, `aria-live` on dynamic values, `aria-selected`/`aria-controls` on tabs
- [x] **Slider accessibility** — `aria-valuemin`/`aria-valuemax`/`aria-valuenow`/`aria-valuetext`, proper `<label>` associations with `htmlFor`
- [x] **High contrast theme** — 7th theme: pure black bg, white text, #00ff88 accent for maximum visibility
- [x] **Version consistency** — HamburgerMenu footer uses `APP_VERSION` constant (was hardcoded v2.0)

---

## ✅ Phase 8: Testing Suite (Complete)

### 8.1 E2E Tests (Playwright)
- [x] **Playwright config** — Auto-starts Vite dev server, Chromium project, HTML reporter
- [x] **App loading tests** — 6 tests: page title, header/version, tabs, stats bar, SVG visualizer, header buttons
- [x] **Bow configuration tests** — 5 tests: default compound, recurve physics update, bow type switching, material buttons
- [x] **Tab navigation tests** — 6 tests: all 5 tabs load correct panels, ARIA attributes, aria-selected state
- [x] **Wizard/modal tests** — 3 tests: Setup Wizard, Glossary, Docs open and close (Escape key)
- [x] **Theme switching tests** — 4 tests: Midnight default, Neon accent verification, High Contrast colors, all 7 themes error-free
- [x] **Tour dismissal helper** — MutationObserver removes joyride portal for clean E2E runs

### 8.2 Accessibility Tests (axe-core)
- [x] **WCAG 2.0 AA scans** — axe-core on main page, Arrow tab, Tune tab (zero critical/serious violations)
- [x] **High Contrast validation** — Color-contrast checks pass with High Contrast theme
- [x] **ARIA structure verification** — Tablist with 5 tabs, aria-selected, aria-label on navigation
- [x] **Skip navigation link** — Present in DOM for keyboard users
- [x] **Main landmark check** — `<main>` element with proper id
- [x] **Form label fixes** — Added aria-label to 5 range inputs (DrawCycle, Wizard, TuningPanel, SetupOptimizer) and arrow shaft select; connected label/id on optimizer selects

### 8.3 Visual Regression
- [x] **Playwright screenshot baselines** — 5 baselines: Midnight, Neon, High Contrast dashboards + Arrow tab + Tune tab
- [x] **Deterministic captures** — Reduced motion, disabled animations, 2% pixel diff threshold
- [x] **Update workflow** — `npm run test:e2e:update` regenerates baselines

### 8.4 CI/CD Pipeline
- [x] **GitHub Actions workflow** — `.github/workflows/test.yml` runs on push/PR to main
- [x] **Two-stage pipeline** — Unit tests + lint → E2E + accessibility (E2E skipped if units fail)
- [x] **Artifact uploads** — Playwright report + test results uploaded on failure
- [x] **Package.json scripts** — `test:e2e`, `test:a11y`, `test:visual`, `test:all`, `test:e2e:ui`

### 8.5 Lint Cleanup
- [x] **Zero eslint errors** — Removed all unused imports/variables across 15 files
- [x] **Eliminated `any` types** — Replaced with `Theme["colors"]` in BowDatabase and Wizard
- [x] **Fixed setState-in-effect** — Lazy initializers (ProfileManager), derived state (GuidedTour), useRef (usePhysicsWorker)

---

## ✅ Phase 9: StringForge Rebrand (Complete)

> **Legal requirement:** All Grace/Prime Engineering references must be completely removed before monetization. Grace is highly litigious.

### 9.1 Codebase Rebrand
- [x] **App identity** — APP_NAME → "StringForge", APP_SUBTITLE → "Bowstring Dynamics Simulator", version → 4.0.0
- [x] **Header** — Removed "G5" logo and "PRIME ARCHERY DIV / GRACE ENGINEERING" text, replaced with "SF" + "STRINGFORGE.IO / EST. 2026"
- [x] **HTML meta** — Title, description, apple-mobile-web-app-title updated to StringForge branding
- [x] **manifest.json** — App name, short name, description rebranded
- [x] **Service worker** — Cache name updated to `stringforge-v4`
- [x] **package.json** — Name → "stringforge", version → 4.0.0
- [x] **Export reports** — Setup report header/footer rebranded to StringForge
- [x] **Panel footers** — Glossary, Docs footers updated to "© 2026 StringForge.io"
- [x] **Guided tour** — Welcome text rebranded
- [x] **Hamburger menu** — Footer text updated
- [x] **Bow database** — Removed "G5" from Prime manufacturer, removed "our house bow" reference
- [x] **localStorage keys** — All keys renamed from `bowstring-*` to `stringforge-*`
- [x] **Persist module** — State key updated to `stringforge-state`
- [x] **Unit tests** — Updated assertions for new app name, version, localStorage keys
- [x] **E2E tests** — Updated title, app name, version assertions
- [x] **Screenshot script** — Updated localStorage keys

### 9.2 Logo & Favicon ✅
- [x] **StringForge SVG logo** — Drawn bow with arrow, blue gradient limb, forge sparks at tip, dark background
- [x] **Favicon** — Updated `public/favicon.svg` with StringForge bow & arrow icon
- [x] **PWA icons** — Generated 192px and 512px PNG icons via Playwright render
- [x] **Apple touch icon** — 180px PNG for iOS home screen
- [x] **Theme color** — Updated to #3b82f6 (archery blue) in manifest + meta tag
- [x] **OG image** — 1200x630 social preview card with logo, tagline, feature tags

### 9.3 Deploy to stringforge.io ✅
- [x] **GitHub Actions CI/CD** — Test → Build → Deploy via FTPS on push to main (SamKirkland/FTP-Deploy-Action)
- [x] **Apache .htaccess** — HTTPS redirect, security headers, Vite-optimized caching, SPA fallback, gzip
- [x] **DNS** — stringforge.io → 67.222.28.49 (St. Clair Hosting / KnownHost VPS)
- [x] **HTTPS/SSL** — Let's Encrypt wildcard cert via WHM AutoSSL (*.stringforge.io)
- [x] **Live site** — https://stringforge.io fully operational
- [x] **Repo rename** — GitHub repo renamed from `bowstring-sim` → `stringforge`

### 9.4 Analytics & Social ✅
- [x] **Analytics** — Plausible via `@plausible-analytics/tracker` NPM package (outbound links, file downloads, form submissions)
- [x] **Open Graph cards** — OG meta tags + `og-image.png` for link sharing
- [x] **Twitter cards** — `summary_large_image` meta tags added
- [x] **Structured data** — JSON-LD WebApplication schema with features, pricing, keywords

---

## 🔜 Phase 10: Production Hardening (Next)

### 10.1 Error Monitoring ✅
- [x] **Sentry integration** — `@sentry/react` initialized in production only with DSN
- [x] **Error boundary** — `Sentry.ErrorBoundary` wrapping entire app with fallback UI
- [ ] **Performance monitoring** — Sentry performance tracing for physics computation and render times

### 10.2 Marketing Push
- [ ] **Reddit launch** — r/archery, r/bowhunting, r/CompoundBow with demo link
- [ ] **ArcheryTalk forum** — Post in DIY/Technical section
- [ ] **YouTube demo** — Screen recording walkthrough for archers
- [ ] **SEO content** — Landing page copy, blog posts on archery physics

### 10.3 Monetization Prep
- [ ] **Ko-fi / Patreon** — Donation link in app footer
- [ ] **Premium features** — Save configs, export PDF, advanced tuning presets (gated)
- [ ] **Stripe integration** — Payment processing for premium tier

---

> **Test Suite Summary:**
> - 145 unit tests (Vitest) — physics, arrow, store, tuning, phase6, phase7
> - 31 E2E + accessibility tests (Playwright + axe-core)
> - 5 visual regression baselines (Playwright screenshots)
> - **181 total tests**

---

> **Reference values for validation:**
> - 70 lb compound, 30" draw, 350gr arrow → ~290-310 fps (IBO conditions)
> - 24-strand BCY-X string ≈ 70-90 grains
> - Compound efficiency ≈ 80-85%
> - Arrow KE at 300 fps / 400gr = 79.9 ft-lbs
> - Fundamental string frequency at 350 lbs tension, 50" vibrating length ≈ 120-160 Hz
