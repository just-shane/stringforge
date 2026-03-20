# 🏹 StringForge — Roadmap

### The plan. The progress. The future.

> **Live at:** [https://stringforge.io](https://stringforge.io)
> Every phase below shipped to production. No vapor. No slides. Just working code.

---

## 🔑 API Keys & External Services

| Status | Service | Required? | Notes |
|--------|---------|-----------|-------|
| ✅ | Plausible Analytics | Yes | `@plausible-analytics/tracker` NPM package |
| ✅ | Sentry | Yes | `@sentry/react` error monitoring (prod only) |
| ✅ | Let's Encrypt | Yes | Wildcard SSL via WHM AutoSSL |
| 🔜 | Supabase | No | Future: chrono data, user accounts, API backend |

---

## ✅ Phase 1 — Foundation & Prototype

> *Where it all started. Pure physics, zero UI framework.*

### 🔬 1.1 Core Physics Engine
- [x] **String vibration model** — Standing wave: `f = (1/2L) × √(T/μ)`
- [x] **Harmonic decomposition** — First 8 modes with amplitude & damping
- [x] **String material database** — BCY-X, 452X, 8190, D97 with real specs
- [x] **Weight interaction model** — Mass-loaded string physics with node proximity damping
- [x] **Speed penalty estimation** — ~1.8 fps loss per 10gr of added weight
- [x] **Vibration reduction scoring** — Effectiveness from weight position × mass

### 🎨 1.2 Interactive Visualizations
- [x] **Side profile view** — SVG string with real-time vibration animation
- [x] **Top-down cross section** — Strand bundle with weight compression zones
- [x] **Harmonic spectrum chart** — Bar chart of mode amplitudes, color-coded damping
- [x] **Draggable weights** — Click-and-drag repositioning on the string

### 🎛️ 1.3 Controls & UI
- [x] **String parameter sliders** — Length, brace height, strand count, tension
- [x] **Material selector** — Toggle between 4 string materials
- [x] **Weight management** — Add/remove up to 8 speed weights (brass/tungsten)
- [x] **Stats dashboard** — Frequency, total mass, speed loss, vibe reduction, balance

---

## ✅ Phase 2 — React Migration

> *From vanilla JS to a real architecture.*

### 🏗️ 2.1 Project Scaffolding
- [x] **Vite + React + TypeScript** — Modern build tooling
- [x] **Component architecture** — Modular with proper file structure
- [x] **Zustand** — Centralized simulation state
- [x] **Tailwind CSS** — Utility classes with dark theme support

### 🧩 2.2 Component Decomposition
- [x] **`PhysicsEngine`** — Pure TS module, full type safety
- [x] **`StringVisualizer`** — Side profile SVG with `requestAnimationFrame` loop
- [x] **`CrossSectionView`** — Top-down strand bundle rendering
- [x] **`HarmonicSpectrum`** — Frequency spectrum bar chart
- [x] **`ControlPanel`** — Sliders, material selector, weight cards
- [x] **`StatsBar`** — Real-time computed metrics
- [x] **`WeightCard`** — Individual weight config with drag

### 🧪 2.3 Developer Experience
- [x] **Vitest unit tests** — Physics, energy, ballistic calculations
- [x] **6 themes** — Midnight, Neon, Dracula, Nord, Monokai, Catppuccin
- [x] **Hamburger menu** — Theme picker with localStorage persistence

---

## ✅ Phase 3 — Physics Engine Overhaul

> *Four bow families. Seven materials. Real energy models.*

### 🏹 3.1 Bow Type Support
- [x] **4 bow types** — Compound (cam let-off), Recurve, Longbow, Crossbow
- [x] **Compound cam system** — 80% let-off, holding weight calc
- [x] **Draw force curves** — Hookean, supra-linear, peak/plateau/let-off, aggressive
- [x] **Limb mechanics** — Mass fraction, hysteresis per bow type

### 🧵 3.2 String Materials Database
- [x] **7 materials** — BCY-X, 452X, 8190, D97, Dacron B-50, Fast Flight, 8125
- [x] **Per-material properties** — Tensile, feet/lb, stretch %, creep rate
- [x] **Strand count recommendations** — Auto-suggest from draw weight + material
- [x] **String weight calculator** — From density × strand count

### ⚡ 3.3 Energy Transfer Model
- [x] **Stored energy** — Numerical integration of force-draw curve
- [x] **Efficiency model** — Longbow 65%, Recurve 74%, Compound 82%, Crossbow 78%
- [x] **Energy loss breakdown** — Stacked bar: Arrow KE, Limb KE, String KE, Hysteresis, Vibe, Sound
- [x] **Virtual arrow mass** — `m_virtual = m_arrow + m_string/3`
- [x] **Speed prediction** — `v = √(2·η·E_stored / m_virtual)`

### 📐 3.4 String Physics Improvements
- [x] **Brace height impact** — ~8.5 fps per inch deviation
- [x] **Cam wrap calculation** — 35% wrap reducing vibrating length
- [x] **Force-draw chart** — Interactive with stored energy & brace height marker

---

## ✅ Phase 4 — Arrow Dynamics

> *Full arrow builder. Spine matching. Ballistics with drag.*

### 🏗️ 4.1 Arrow Builder
- [x] **Component editor** — Shaft, point, nock, fletching, wrap with individual weights
- [x] **15 shaft database** — Easton, Gold Tip, Victory, Black Eagle
- [x] **Total weight calculator** — Sum of all components in grains
- [x] **FOC calculator** — `FOC% = ((Balance / Length) - 0.5) × 100` with ratings

### 📏 4.2 Spine Matching
- [x] **Static spine reference** — Industry standard values (300–700)
- [x] **Dynamic spine estimator** — Adjustments for length, point weight, draw weight, cam aggression
- [x] **Spine recommendation engine** — Auto-suggest from bow + arrow config

### 🎯 4.3 Ballistics Engine
- [x] **Trajectory calculator** — Euler method with drag: `F_drag = ½·Cd·ρ·A·v²`
- [x] **Gravity drop table** — Every 10 yards with trajectory viz
- [x] **Wind drift model** — Lateral deflection from crosswind
- [x] **KE & momentum** — `KE = (m·v²)/450,800` · `p = (m·v)/225,400`
- [x] **Effective/max range** — KE threshold limits (40/25 ft-lbs)

### 📊 4.4 UI Additions
- [x] **Tabbed control panel** — Bow & String / Arrow tabs
- [x] **Arrow builder panel** — Grouped shaft selector, component sliders, summary stats
- [x] **Trajectory visualization** — SVG drop curve with annotated points
- [x] **Ballistics data table** — Distance, drop, drift, velocity, KE, momentum, flight time

---

## ✅ Phase 5 — Tuning Tools

> *Paper tune, bare shaft, walk-back — in your browser instead of at the range.*

### 📄 5.1 Paper Tune Simulator
- [x] **Virtual paper target** — Predicted tear pattern from current setup
- [x] **Tear diagnosis** — Tail left/right/high/low → stiff/weak/nock point
- [x] **Adjustment suggestions** — Specific changes to achieve bullet hole

### 🏹 5.2 Bare Shaft Tuning
- [x] **Bare vs. fletched comparison** — Group separation from spine mismatch
- [x] **Iterative workflow** — Step-by-step guide with visual feedback

### 📍 5.3 Walk-Back Tuning
- [x] **Virtual target** — Vertical line with impacts at increasing distances
- [x] **Centershot diagnosis** — Detect and correct rest misalignment

### ⚙️ 5.4 Setup Optimizer
- [x] **Multi-variable optimizer** — String material × strand count × weight placement × spine
- [x] **Comparison mode** — Side-by-side two complete setups

---

## ✅ Phase 6 — Advanced Features

> *Bow database. Draw cycle animation. Sound synthesis. The works.*

### 📚 6.1 Bow Profiles & Presets
- [x] **15-bow database** — Mathews, Hoyt, Bowtech, PSE, Prime, Elite, Bear, Win&Win + more
- [x] **Custom profiles** — Save/load complete configs to localStorage
- [x] **6 arrow presets** — Heavy Hunting → 3D Competition

### 🎬 6.2 Draw Cycle Visualization
- [x] **Animated draw sequence** — Limb deflection, cam rotation, string path, play/scrub
- [x] **Let-off visualization** — Holding weight vs. peak weight, real-time force & energy bars

### 🔊 6.3 Sound & Vibration Analysis
- [x] **Audio synthesis** — Bowstring "twang" from harmonic spectrum via Web Audio API
- [x] **Vibration waterfall** — Time-frequency SVG of harmonic decay
- [x] **dB estimation** — Shot noise level with calibrated model + real-world comparisons

### 📤 6.4 Data & Export
- [x] **Setup export** — Full text report, download/copy
- [x] **Share links** — Base64 URL-encoded state, auto-load on open
- [x] **Comparison reports** — Before/after analysis with all metrics

### 🎓 6.5 Educational Mode
- [x] **Glossary** — 28 terms across 5 categories with search & navigation
- [x] **Physics explainers** — Standing waves, Archer's Paradox, efficiency, stored energy
- [x] **Setup wizard** — 4-5 step guided flow → apply recommendation to simulator

---

## ✅ Guided Tour & Versioning

- [x] 🗺️ **React Joyride** — 11-step tour covering all major sections
- [x] 🆕 **Auto-launch** — First visit + version change triggers
- [x] 🔄 **Replay button** — "Replay Guided Tour" in main panel
- [x] 🎨 **Theme-matched tooltips** — Matches active theme colors
- [x] 🏷️ **Version tracking** — `src/lib/version.ts` single source of truth, semantic versioning

---

## ✅ Phase 7 — Platform & Polish

> *Web Workers. PWA. Accessibility. Ship-quality code.*

### ⚡ 7.1 Performance
- [x] **Web Workers** — Physics offloaded via `usePhysicsWorker` hook (auto-fallback)
- [x] **Lazy loading** — 9 code-split components via `React.lazy()`, initial bundle -25%
- [x] **Suspense boundaries** — Loading fallback for all lazy components

### 📱 7.2 Responsive & PWA
- [x] **Mobile layout** — Controls/Viz toggle, full-height panels, touch-friendly
- [x] **PWA manifest** — Standalone display, icons, theme color
- [x] **Service worker** — Network-first caching, offline support
- [x] **State persistence** — Auto-save all state, debounced 500ms, restores on reload
- [x] **Apple web app** — iOS standalone mode meta tags

### ♿ 7.3 Accessibility
- [x] **Skip navigation** — "Skip to main content" link
- [x] **Keyboard navigation** — Escape closes modals, proper tab order, ARIA attributes
- [x] **Screen reader support** — Full ARIA roles, labels, live regions
- [x] **Slider a11y** — `aria-valuemin/max/now/text`, proper `<label>` associations
- [x] **High Contrast theme** — 7th theme: pure black bg, white text, #00ff88 accent

---

## ✅ Phase 8 — Testing Suite

> *145 unit tests. 31 E2E. 5 visual baselines. 181 total. Zero excuses.*

### 🎭 8.1 E2E Tests (Playwright)
- [x] **6 app loading tests** — Title, header, tabs, stats, SVG, buttons
- [x] **5 bow config tests** — Default compound, recurve physics, bow switching, materials
- [x] **6 tab navigation tests** — All 5 tabs, ARIA attributes, aria-selected
- [x] **3 modal tests** — Wizard, Glossary, Docs open/close (Escape)
- [x] **4 theme tests** — Midnight default, Neon accent, High Contrast, all 7 error-free

### ♿ 8.2 Accessibility Tests (axe-core)
- [x] **WCAG 2.0 AA scans** — Zero critical/serious violations
- [x] **High Contrast validation** — Color-contrast checks pass
- [x] **ARIA structure** — Tablist, aria-selected, aria-label, landmarks, skip nav

### 📸 8.3 Visual Regression
- [x] **5 screenshot baselines** — Midnight, Neon, High Contrast + Arrow + Tune tabs
- [x] **Deterministic captures** — Reduced motion, 2% pixel diff threshold

### 🔄 8.4 CI/CD Pipeline
- [x] **GitHub Actions** — Runs on push/PR to main
- [x] **Two-stage pipeline** — Unit + lint → E2E + a11y
- [x] **Artifact uploads** — Playwright report on failure

### 🧹 8.5 Lint Cleanup
- [x] **Zero eslint errors** — Cleaned 15 files
- [x] **No `any` types** — Replaced with proper generics
- [x] **Fixed setState-in-effect** — Lazy initializers, derived state, useRef

---

## ✅ Phase 9 — StringForge Rebrand

> *⚖️ Legal requirement: all Grace/Prime Engineering references removed for monetization.*

### 🔤 9.1 Codebase Rebrand
- [x] **App identity** — `StringForge` · `Bowstring Dynamics Simulator` · v4.0.0
- [x] **Header** — "G5" → "SF" · "PRIME ARCHERY DIV" → "STRINGFORGE.IO / EST. 2026"
- [x] **22 files updated** — HTML, manifest, SW, package.json, tests, exports, panels, tours, menus
- [x] **localStorage migration** — All keys `bowstring-*` → `stringforge-*`

### 🎨 9.2 Logo & Favicon
- [x] **SVG logo** — Drawn bow with arrow, blue gradient limb, forge sparks, dark background
- [x] **PWA icons** — 192px, 512px, 180px Apple Touch via Playwright render
- [x] **OG image** — 1200×630 social preview card with logo + tagline + feature tags
- [x] **Theme color** — `#3b82f6` archery blue everywhere

### 🚀 9.3 Deploy to stringforge.io
- [x] **CI/CD** — GitHub Actions: Test → Build → FTPS deploy on push to main
- [x] **Apache .htaccess** — HTTPS redirect, security headers, Vite caching, SPA fallback, gzip
- [x] **DNS** — `stringforge.io` → `67.222.28.49` (St. Clair Hosting)
- [x] **SSL** — Let's Encrypt wildcard `*.stringforge.io` via WHM AutoSSL
- [x] **Repo rename** — `bowstring-sim` → `stringforge`

### 📊 9.4 Analytics & Social
- [x] **Plausible Analytics** — NPM package with outbound links, file downloads, form tracking
- [x] **Open Graph cards** — `og:title`, `og:description`, `og:image` for link sharing
- [x] **Twitter cards** — `summary_large_image` meta tags
- [x] **JSON-LD** — `WebApplication` schema with features, pricing, keywords

---

## 🔜 Phase 10 — Production Hardening

> *Error monitoring. Marketing. Money.*

### 🛡️ 10.1 Error Monitoring
- [x] **Sentry** — `@sentry/react` initialized in production only
- [x] **Error boundary** — `Sentry.ErrorBoundary` wrapping entire app
- [ ] **Performance tracing** — Sentry perf for physics computation & render times

### 📣 10.2 Marketing Push
- [ ] **Reddit launch** — r/archery, r/bowhunting, r/CompoundBow with demo link
- [ ] **ArcheryTalk forum** — Post in DIY/Technical section
- [ ] **YouTube demo** — Screen recording walkthrough for archers
- [ ] **SEO content** — Landing page copy, blog posts on archery physics

### 💰 10.3 Monetization Prep
- [ ] **Ko-fi / Patreon** — Donation link in app footer
- [ ] **Premium features** — Save configs, export PDF, advanced tuning presets (gated)
- [ ] **Stripe integration** — Payment processing for premium tier

---

## 💡 Phase 11 — Chronograph Calibration & Adaptive Learning

> *The killer feature. Feed real chrono data back in. The simulator gets smarter every shot.*
>
> StringForge stops being a calculator and becomes a **learning system**.

### 📟 11.1 Chronograph Data Input
- [ ] **Chrono input panel** — New tab/section for entering actual fps readings
- [ ] **Multi-shot entry** — 10-shot string with auto average, SD, and ES calculation
- [ ] **Setup snapshot** — Freeze full sim state at time of entry (bow + string + arrow + weights)
- [ ] **Device tags** — Optional chronograph model (Garmin Xero, Caldwell, LabRadar) for accuracy profiles
- [ ] **Session history** — localStorage with timestamps, review/edit/delete

### 📊 11.2 Predicted vs. Actual
- [ ] **Delta dashboard** — Predicted fps vs. actual fps, % error, confidence indicator
- [ ] **Variance breakdown** — Likely error sources: efficiency, arrow weight tolerance, string stretch, cam timing
- [ ] **Visual overlay** — Chrono data points plotted on force-draw/energy chart
- [ ] **Per-component attribution** — _"Your bow is 3% less efficient than model"_ or _"Arrow likely weighs 8gr more than spec"_

### 🧠 11.3 Personal Calibration Engine
- [ ] **Efficiency correction** — Auto-calculate per-bow coefficient (e.g., _this_ V3X = 79.2%, not default 82%)
- [ ] **Arrow weight refinement** — Back-calculate actual total weight from chrono + bow energy
- [ ] **Calibration profiles** — Save per-bow corrections, all future predictions use them
- [ ] **Confidence scoring** — More data = tighter band. Show `± X fps` uncertainty that shrinks with shots
- [ ] **Recalibrate prompt** — Nudge when user changes string material, strand count, or weight placement

### 🌐 11.4 Community Learning *(requires backend/API)*
- [ ] **Anonymous data aggregation** — Opt-in upload of anonymized chrono data + setup configs
- [ ] **Crowd-sourced corrections** — Aggregate efficiency factors across hundreds of users per bow model
- [ ] **Bow model accuracy rankings** — _"V3X predictions within 1.2% for 847 users"_ — builds trust
- [ ] **Material performance data** — Real-world speed diffs between string materials, community-validated
- [ ] **Outlier detection** — Flag statistically unlikely submissions before they pollute the model
- [ ] **Environmental normalization** — Factor out temp, altitude, humidity from aggregated data

### 🎯 11.5 Smart Recommendations
- [ ] **"Users like you"** — _"Archers with similar setups gained 4 fps switching from 452X to BCY-X"_
- [ ] **Optimal weight placement** — Backed by real-world data, not just physics models
- [ ] **Setup validation** — _"Your setup matches 234 verified configs with avg actual speed of 291 fps"_
- [ ] **Trend analysis** — Track performance drift over time (string stretch, cam timing, limb fatigue)

---

## 🔮 Phase 12 — StringForge API

> *The physics engine, calibration data, and community dataset become the archery industry's data backbone.*
>
> Free simulator gets users in the door. Chrono loop keeps them. API monetizes the data. **That's the flywheel.**

### ⚙️ 12.1 Core API — Physics Engine as a Service
- [ ] **REST API** — Express/Fastify on Node.js or Supabase Edge Functions
- [ ] **`POST /simulate`** — Bow + string + arrow config → full physics results
- [ ] **`POST /trajectory`** — Arrow ballistics: drop table, wind drift, KE/momentum at distance
- [ ] **`POST /spine-match`** — Dynamic spine recommendation from bow + arrow params
- [ ] **`POST /tune`** — Paper tune / bare shaft diagnosis from setup config
- [ ] **`GET /bows`** — Bow database, filterable by manufacturer/type/IBO
- [ ] **`GET /shafts`** — Arrow shaft database, filterable by spine/weight/diameter
- [ ] **`GET /materials`** — String materials with all properties
- [ ] **API key management** — Free tier (100 req/day), Pro tier (unlimited), dashboard
- [ ] **OpenAPI/Swagger docs** — Auto-generated interactive documentation
- [ ] **Rate limiting & caching** — Redis-backed limits, cache common lookups

### 📡 12.2 Calibration Data API *(Phase 11 backend)*
- [ ] **`POST /chrono`** — Submit chronograph readings with setup snapshot
- [ ] **`GET /calibration/{bow_model}`** — Crowd-sourced correction factor for a bow model
- [ ] **`GET /accuracy/{bow_model}`** — Prediction stats: mean error, sample size, confidence interval
- [ ] **`GET /trends/{bow_model}`** — Performance trends over time
- [ ] **Supabase/Postgres backend** — Anonymized chrono submissions, corrections, calibration profiles
- [ ] **Auth** — Supabase Auth for user accounts, API key generation, data ownership

### 🏪 12.3 Pro Shop & Retail Integrations
- [ ] **Bow fitting widget** — Embeddable component: draw weight + length → instant arrow recommendations
- [ ] **POS integration** — API calls from point-of-sale to suggest arrow builds at purchase
- [ ] **"Build & Buy" links** — Product links (Lancaster, Amazon) for recommended components → affiliate revenue 💸
- [ ] **Shop dashboard** — _"Most popular setups your customers run"_ → inventory insights
- [ ] **QR code setup cards** — Scan at the shop → load exact setup in StringForge

### 📱 12.4 Mobile App & Device Integrations
- [ ] **React Native app** — Native mobile wrapper around API + local physics engine
- [ ] **Smartwatch companion** — Apple Watch / Garmin: log chrono readings → push to StringForge
- [ ] **Garmin Xero integration** — Pull chronograph data directly from Garmin Connect API
- [ ] **LabRadar Bluetooth** — Direct BT sync from LabRadar chronograph to StringForge

### 🤝 12.5 Content & Data Licensing
- [ ] **Manufacturer partnerships** — Verified specs in exchange for "Verified by [Brand]" badges
- [ ] **Embedded calculators** — _"See how the V3X performs with your setup"_ on product pages
- [ ] **Media/review sites** — Interactive speed comparisons embedded in review articles
- [ ] **Tournament platforms** — Equipment data for archer profiles in scoring systems

### 🤖 12.6 Advanced Analytics & ML
- [ ] **Predictive model training** — ML models trained on aggregated chrono data to beat pure physics
- [ ] **Anomaly detection** — Flag underperforming bows vs. community baseline (worn cams, string stretch)
- [ ] **Equipment lifecycle tracking** — _"Your string has ~2,000 shots — users see 2-3 fps drop at this point"_
- [ ] **A/B testing framework** — Test physics model improvements against real-world data before shipping

---

## 📈 Stats

> **Test Suite:** 145 unit (Vitest) · 31 E2E + a11y (Playwright + axe-core) · 5 visual baselines · **181 total**

> **Stack:** React 19 · TypeScript · Vite · Zustand · Tailwind v4 · Web Workers · PWA

> **Infra:** GitHub Actions CI/CD · FTPS deploy · St. Clair Hosting · Let's Encrypt · Plausible · Sentry

---

## 🔢 Reference Values

| Scenario | Expected |
|----------|----------|
| 70lb compound, 30" draw, 350gr arrow | ~290–310 fps (IBO) |
| 24-strand BCY-X string | ~70–90 grains |
| Compound efficiency | ~80–85% |
| Arrow KE at 300 fps / 400gr | 79.9 ft-lbs |
| Fundamental freq @ 350 lbs tension, 50" | ~120–160 Hz |
