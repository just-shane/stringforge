import { useMemo } from "react";
import { useSimStore } from "./store.ts";
import { computePhysics } from "./lib/physics.ts";
import { ThemeProvider } from "./components/Layout/ThemeProvider.tsx";
import { Header } from "./components/Layout/Header.tsx";
import { ControlPanel } from "./components/ControlPanel/ControlPanel.tsx";
import { StatsBar } from "./components/StatsBar/StatsBar.tsx";
import { StringVisualizer } from "./components/StringVisualizer/StringVisualizer.tsx";
import { CrossSectionView } from "./components/CrossSectionView/CrossSectionView.tsx";
import { HarmonicSpectrum } from "./components/HarmonicSpectrum/HarmonicSpectrum.tsx";
import { DrawCurve } from "./components/DrawCurve/DrawCurve.tsx";
import { EnergyBreakdown } from "./components/EnergyBreakdown/EnergyBreakdown.tsx";
import { PlacementGuide } from "./components/Layout/PlacementGuide.tsx";

export default function App() {
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);

  const physics = useMemo(() => computePhysics(params, weights), [params, weights]);

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ background: "var(--c-bg)" }}>
        <Header />

        <div className="flex max-md:flex-col">
          {/* Left Panel: Controls */}
          <div
            className="w-72 min-w-72 shrink-0 p-5 overflow-y-auto max-h-[calc(100vh-65px)] max-md:w-full max-md:min-w-0 max-md:max-h-[40vh] max-md:border-b"
            style={{ borderRight: "1px solid var(--c-border)", borderColor: "var(--c-border)" }}
          >
            <ControlPanel />
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
    </ThemeProvider>
  );
}
