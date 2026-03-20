import { useMemo, useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useSimStore } from "./store.ts";
import { computePhysics } from "./lib/physics.ts";
import { usePhysicsWorker } from "./lib/usePhysicsWorker.ts";
import { decodeShareLink } from "./lib/bows.ts";
import { ThemeProvider } from "./components/Layout/ThemeProvider.tsx";
import { Header } from "./components/Layout/Header.tsx";
import { ControlPanel } from "./components/ControlPanel/ControlPanel.tsx";
import { ArrowBuilder } from "./components/ArrowBuilder/ArrowBuilder.tsx";
import { StatsBar } from "./components/StatsBar/StatsBar.tsx";
import { StringVisualizer } from "./components/StringVisualizer/StringVisualizer.tsx";
import { CrossSectionView } from "./components/CrossSectionView/CrossSectionView.tsx";
import { HarmonicSpectrum } from "./components/HarmonicSpectrum/HarmonicSpectrum.tsx";
import { DrawCurve } from "./components/DrawCurve/DrawCurve.tsx";
import { EnergyBreakdown } from "./components/EnergyBreakdown/EnergyBreakdown.tsx";
import { BallisticsTable } from "./components/Ballistics/BallisticsTable.tsx";
import { PlacementGuide } from "./components/Layout/PlacementGuide.tsx";
import { GuidedTour } from "./components/Tour/GuidedTour.tsx";

// Lazy-loaded panels (not needed on initial render)
const DocsPanel = lazy(() => import("./components/Docs/DocsPanel.tsx").then((m) => ({ default: m.DocsPanel })));
const GlossaryPanel = lazy(() => import("./components/Glossary/GlossaryPanel.tsx").then((m) => ({ default: m.GlossaryPanel })));
const SetupWizard = lazy(() => import("./components/Wizard/SetupWizard.tsx").then((m) => ({ default: m.SetupWizard })));
const TuningPanel = lazy(() => import("./components/Tuning/TuningPanel.tsx").then((m) => ({ default: m.TuningPanel })));
const BowDatabase = lazy(() => import("./components/BowDatabase/BowDatabase.tsx").then((m) => ({ default: m.BowDatabase })));
const ProfileManager = lazy(() => import("./components/Profiles/ProfileManager.tsx").then((m) => ({ default: m.ProfileManager })));
const DrawCycleView = lazy(() => import("./components/DrawCycle/DrawCycleView.tsx").then((m) => ({ default: m.DrawCycleView })));
const SoundAnalysis = lazy(() => import("./components/SoundAnalysis/SoundAnalysis.tsx").then((m) => ({ default: m.SoundAnalysis })));
const ShareExport = lazy(() => import("./components/ShareExport/ShareExport.tsx").then((m) => ({ default: m.ShareExport })));

type Tab = "bow" | "arrow" | "tuning" | "database" | "profiles";

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <span
        className="text-[10px] font-mono uppercase tracking-wider animate-pulse"
        style={{ color: "var(--c-text-dim)" }}
      >
        Loading...
      </span>
    </div>
  );
}

export default function App() {
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);
  const docsOpen = useSimStore((s) => s.docsOpen);
  const glossaryOpen = useSimStore((s) => s.glossaryOpen);
  const wizardOpen = useSimStore((s) => s.wizardOpen);
  const setDocsOpen = useSimStore((s) => s.setDocsOpen);
  const setGlossaryOpen = useSimStore((s) => s.setGlossaryOpen);
  const setWizardOpen = useSimStore((s) => s.setWizardOpen);
  const setParam = useSimStore((s) => s.setParam);
  const setBowType = useSimStore((s) => s.setBowType);
  const setWeights = useSimStore((s) => s.setWeights);
  const setArrow = useSimStore((s) => s.setArrow);
  const [tab, setTab] = useState<Tab>("bow");
  const [tourRunning, setTourRunning] = useState(false);
  const [mobilePanel, setMobilePanel] = useState(true); // show control panel on mobile

  // Use Web Worker for physics (falls back to main thread)
  const physics = usePhysicsWorker(params, weights);

  // Handle share link on load
  useEffect(() => {
    const shared = decodeShareLink(window.location.href);
    if (shared) {
      setBowType(shared.params.bowType);
      setTimeout(() => {
        setParam("drawWeight", shared.params.drawWeight);
        setParam("drawLength", shared.params.drawLength);
        setParam("stringLength", shared.params.stringLength);
        setParam("braceHeight", shared.params.braceHeight);
        setParam("strandCount", shared.params.strandCount);
        setParam("material", shared.params.material);
        setParam("tension", shared.params.tension);
        setWeights(shared.weights);
        const a = shared.arrow;
        setArrow("shaft", a.shaft);
        setArrow("shaftLength", a.shaftLength);
        setArrow("pointWeight", a.pointWeight);
        setArrow("nockWeight", a.nockWeight);
        setArrow("fletchingWeight", a.fletchingWeight);
        setArrow("fletchingLength", a.fletchingLength);
        setArrow("wrapWeight", a.wrapWeight);
      }, 0);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Keyboard shortcut: Escape closes modals
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (docsOpen) setDocsOpen(false);
        else if (glossaryOpen) setGlossaryOpen(false);
        else if (wizardOpen) setWizardOpen(false);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [docsOpen, glossaryOpen, wizardOpen, setDocsOpen, setGlossaryOpen, setWizardOpen]);

  const handleReplayTour = useCallback(() => {
    setTourRunning(true);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: "var(--c-bg)" }}>
        <Header />

        <GuidedTour
          forceRun={tourRunning}
          onFinish={() => setTourRunning(false)}
        />

        <main id="main-content" className="flex max-md:flex-col">
          {/* Mobile toggle */}
          <div className="md:hidden flex" style={{ borderBottom: "1px solid var(--c-border)" }}>
            <button
              onClick={() => setMobilePanel(true)}
              className="flex-1 py-2 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
              style={{
                background: mobilePanel ? "var(--c-accent-dim)" : "transparent",
                color: mobilePanel ? "var(--c-accent)" : "var(--c-text-dim)",
                borderBottom: mobilePanel ? "2px solid var(--c-accent)" : "2px solid transparent",
              }}
              aria-pressed={mobilePanel}
            >
              Controls
            </button>
            <button
              onClick={() => setMobilePanel(false)}
              className="flex-1 py-2 text-[10px] font-mono uppercase tracking-wider cursor-pointer"
              style={{
                background: !mobilePanel ? "var(--c-accent-dim)" : "transparent",
                color: !mobilePanel ? "var(--c-accent)" : "var(--c-text-dim)",
                borderBottom: !mobilePanel ? "2px solid var(--c-accent)" : "2px solid transparent",
              }}
              aria-pressed={!mobilePanel}
            >
              Visualizations
            </button>
          </div>

          {/* Left Panel: Controls */}
          <div
            className={`w-72 min-w-72 shrink-0 overflow-y-auto max-h-[calc(100vh-65px)] max-md:w-full max-md:min-w-0 max-md:max-h-[calc(100vh-110px)] ${!mobilePanel ? "max-md:hidden" : ""}`}
            style={{ borderRight: "1px solid var(--c-border)", borderColor: "var(--c-border)" }}
            role="navigation"
            aria-label="Configuration panels"
          >
            {/* Tab switcher */}
            <div
              data-tour="tab-switcher"
              className="flex flex-wrap"
              style={{ borderBottom: "1px solid var(--c-border)" }}
              role="tablist"
              aria-label="Configuration tabs"
            >
              {(["bow", "arrow", "tuning", "database", "profiles"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 text-[9px] font-mono uppercase tracking-[1px] cursor-pointer transition-all min-w-fit px-1"
                  style={{
                    background: tab === t ? "var(--c-accent-dim)" : "transparent",
                    color: tab === t ? "var(--c-accent)" : "var(--c-text-dim)",
                    borderBottom: tab === t ? "2px solid var(--c-accent)" : "2px solid transparent",
                  }}
                  role="tab"
                  aria-selected={tab === t}
                  aria-controls={`panel-${t}`}
                  tabIndex={tab === t ? 0 : -1}
                >
                  {t === "bow"
                    ? "Bow"
                    : t === "arrow"
                      ? "Arrow"
                      : t === "tuning"
                        ? "Tune"
                        : t === "database"
                          ? "Database"
                          : "Profiles"}
                </button>
              ))}
            </div>

            <div
              data-tour="control-panel"
              className="p-5"
              role="tabpanel"
              id={`panel-${tab}`}
              aria-label={`${tab} configuration`}
            >
              <Suspense fallback={<LazyFallback />}>
                {tab === "bow" ? (
                  <ControlPanel />
                ) : tab === "arrow" ? (
                  <ArrowBuilder physics={physics} />
                ) : tab === "tuning" ? (
                  <TuningPanel />
                ) : tab === "database" ? (
                  <BowDatabase />
                ) : (
                  <ProfileManager />
                )}
              </Suspense>
            </div>
          </div>

          {/* Right Panel: Visualizations */}
          <div
            className={`flex-1 p-5 min-w-0 overflow-y-auto max-h-[calc(100vh-65px)] max-md:max-h-[calc(100vh-110px)] ${mobilePanel ? "max-md:hidden" : ""}`}
            role="region"
            aria-label="Visualizations and analysis"
          >
            <div data-tour="stats-bar">
              <StatsBar physics={physics} />
            </div>

            <div data-tour="string-viz" className="mb-4">
              <StringVisualizer physics={physics} />
            </div>

            <div className="mb-4">
              <CrossSectionView />
            </div>

            <div data-tour="force-energy" className="flex gap-3 flex-wrap mb-4">
              <div className="flex-1 min-w-70">
                <span
                  className="text-[11px] font-mono tracking-[2px] uppercase"
                  style={{ color: "var(--c-accent)" }}
                >
                  Force-Draw Curve
                </span>
                <div className="mt-2">
                  <DrawCurve physics={physics} />
                </div>
              </div>
              <div className="flex-1 min-w-70">
                <span
                  className="text-[11px] font-mono tracking-[2px] uppercase"
                  style={{ color: "var(--c-accent)" }}
                >
                  Energy Breakdown
                </span>
                <div className="mt-2">
                  <EnergyBreakdown physics={physics} />
                </div>
              </div>
            </div>

            {/* Draw Cycle Animation (lazy) */}
            <div data-tour="draw-cycle" className="mb-4">
              <Suspense fallback={<LazyFallback />}>
                <DrawCycleView />
              </Suspense>
            </div>

            {/* Ballistics section */}
            <div className="mb-4">
              <BallisticsTable physics={physics} />
            </div>

            {/* Sound & Vibration Analysis (lazy) */}
            <div data-tour="sound-analysis" className="mb-4">
              <Suspense fallback={<LazyFallback />}>
                <SoundAnalysis physics={physics} />
              </Suspense>
            </div>

            <div className="flex gap-3 flex-wrap mb-4">
              <div className="flex-1 min-w-70">
                <span
                  className="text-[11px] font-mono tracking-[2px] uppercase"
                  style={{ color: "var(--c-accent)" }}
                >
                  Harmonic Spectrum
                </span>
                <div className="mt-2">
                  <HarmonicSpectrum physics={physics} />
                </div>
              </div>
              <div className="flex-1 min-w-70">
                <PlacementGuide />
              </div>
            </div>

            {/* Share & Export (lazy) */}
            <div data-tour="share-export" className="mb-4">
              <Suspense fallback={<LazyFallback />}>
                <ShareExport physics={physics} />
              </Suspense>
            </div>

            {/* Replay tour link */}
            <div className="text-center py-4">
              <button
                onClick={handleReplayTour}
                className="text-[9px] font-mono uppercase tracking-wider cursor-pointer transition-all"
                style={{ color: "var(--c-text-faint)" }}
              >
                Replay Guided Tour
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Lazy-loaded modals */}
      <Suspense fallback={null}>
        {docsOpen && <DocsPanel onClose={() => setDocsOpen(false)} />}
        {glossaryOpen && <GlossaryPanel onClose={() => setGlossaryOpen(false)} />}
        {wizardOpen && <SetupWizard onClose={() => setWizardOpen(false)} />}
      </Suspense>
    </ThemeProvider>
  );
}
