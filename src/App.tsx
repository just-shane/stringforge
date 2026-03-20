import { useMemo, useState, useEffect, useCallback } from "react";
import { useSimStore } from "./store.ts";
import { computePhysics } from "./lib/physics.ts";
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
import { DocsPanel } from "./components/Docs/DocsPanel.tsx";
import { PlacementGuide } from "./components/Layout/PlacementGuide.tsx";
import { TuningPanel } from "./components/Tuning/TuningPanel.tsx";
import { BowDatabase } from "./components/BowDatabase/BowDatabase.tsx";
import { ProfileManager } from "./components/Profiles/ProfileManager.tsx";
import { DrawCycleView } from "./components/DrawCycle/DrawCycleView.tsx";
import { SoundAnalysis } from "./components/SoundAnalysis/SoundAnalysis.tsx";
import { ShareExport } from "./components/ShareExport/ShareExport.tsx";
import { GlossaryPanel } from "./components/Glossary/GlossaryPanel.tsx";
import { SetupWizard } from "./components/Wizard/SetupWizard.tsx";
import { GuidedTour } from "./components/Tour/GuidedTour.tsx";

type Tab = "bow" | "arrow" | "tuning" | "database" | "profiles";

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

  const physics = useMemo(() => computePhysics(params, weights), [params, weights]);

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
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

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

        <div className="flex max-md:flex-col">
          {/* Left Panel: Controls */}
          <div
            className="w-72 min-w-72 shrink-0 overflow-y-auto max-h-[calc(100vh-65px)] max-md:w-full max-md:min-w-0 max-md:max-h-[40vh] max-md:border-b"
            style={{ borderRight: "1px solid var(--c-border)", borderColor: "var(--c-border)" }}
          >
            {/* Tab switcher */}
            <div
              data-tour="tab-switcher"
              className="flex flex-wrap"
              style={{ borderBottom: "1px solid var(--c-border)" }}
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

            <div data-tour="control-panel" className="p-5">
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
            </div>
          </div>

          {/* Right Panel: Visualizations */}
          <div className="flex-1 p-5 min-w-0 overflow-y-auto max-h-[calc(100vh-65px)]">
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

            {/* Draw Cycle Animation */}
            <div data-tour="draw-cycle" className="mb-4">
              <DrawCycleView />
            </div>

            {/* Ballistics section */}
            <div className="mb-4">
              <BallisticsTable physics={physics} />
            </div>

            {/* Sound & Vibration Analysis */}
            <div data-tour="sound-analysis" className="mb-4">
              <SoundAnalysis physics={physics} />
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

            {/* Share & Export */}
            <div data-tour="share-export" className="mb-4">
              <ShareExport physics={physics} />
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
        </div>
      </div>

      {docsOpen && <DocsPanel onClose={() => setDocsOpen(false)} />}
      {glossaryOpen && <GlossaryPanel onClose={() => setGlossaryOpen(false)} />}
      {wizardOpen && <SetupWizard onClose={() => setWizardOpen(false)} />}
    </ThemeProvider>
  );
}
