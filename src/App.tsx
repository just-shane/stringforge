import { useMemo, useState } from "react";
import { useSimStore } from "./store.ts";
import { computePhysics } from "./lib/physics.ts";
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

type Tab = "bow" | "arrow";

export default function App() {
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);
  const docsOpen = useSimStore((s) => s.docsOpen);
  const setDocsOpen = useSimStore((s) => s.setDocsOpen);
  const [tab, setTab] = useState<Tab>("bow");

  const physics = useMemo(() => computePhysics(params, weights), [params, weights]);

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: "var(--c-bg)" }}>
        <Header />

        <div className="flex max-md:flex-col">
          {/* Left Panel: Controls */}
          <div
            className="w-72 min-w-72 shrink-0 overflow-y-auto max-h-[calc(100vh-65px)] max-md:w-full max-md:min-w-0 max-md:max-h-[40vh] max-md:border-b"
            style={{ borderRight: "1px solid var(--c-border)", borderColor: "var(--c-border)" }}
          >
            {/* Tab switcher */}
            <div className="flex" style={{ borderBottom: "1px solid var(--c-border)" }}>
              {(["bow", "arrow"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 text-[10px] font-mono uppercase tracking-[2px] cursor-pointer transition-all"
                  style={{
                    background: tab === t ? "var(--c-accent-dim)" : "transparent",
                    color: tab === t ? "var(--c-accent)" : "var(--c-text-dim)",
                    borderBottom: tab === t ? "2px solid var(--c-accent)" : "2px solid transparent",
                  }}
                >
                  {t === "bow" ? "Bow & String" : "Arrow"}
                </button>
              ))}
            </div>

            <div className="p-5">
              {tab === "bow" ? (
                <ControlPanel />
              ) : (
                <ArrowBuilder physics={physics} />
              )}
            </div>
          </div>

          {/* Right Panel: Visualizations */}
          <div className="flex-1 p-5 min-w-0 overflow-y-auto max-h-[calc(100vh-65px)]">
            <StatsBar physics={physics} />

            <div className="mb-4">
              <StringVisualizer physics={physics} />
            </div>

            <div className="mb-4">
              <CrossSectionView />
            </div>

            <div className="flex gap-3 flex-wrap mb-4">
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

            {/* Ballistics section */}
            <div className="mb-4">
              <BallisticsTable physics={physics} />
            </div>

            <div className="flex gap-3 flex-wrap">
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
          </div>
        </div>
      </div>

      {docsOpen && <DocsPanel onClose={() => setDocsOpen(false)} />}
    </ThemeProvider>
  );
}
