import { useMemo } from "react";
import { useSimStore } from "./store.ts";
import { computePhysics } from "./lib/physics.ts";
import { Header } from "./components/Layout/Header.tsx";
import { ControlPanel } from "./components/ControlPanel/ControlPanel.tsx";
import { StatsBar } from "./components/StatsBar/StatsBar.tsx";
import { StringVisualizer } from "./components/StringVisualizer/StringVisualizer.tsx";
import { CrossSectionView } from "./components/CrossSectionView/CrossSectionView.tsx";
import { HarmonicSpectrum } from "./components/HarmonicSpectrum/HarmonicSpectrum.tsx";
import { PlacementGuide } from "./components/Layout/PlacementGuide.tsx";

export default function App() {
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);

  const physics = useMemo(() => computePhysics(params, weights), [params, weights]);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="flex flex-wrap">
        {/* Left Panel: Controls */}
        <div className="w-72 min-w-72 border-r border-neutral-800 p-5 overflow-y-auto max-h-[calc(100vh-65px)] max-md:w-full max-md:min-w-0 max-md:max-h-[40vh] max-md:border-r-0 max-md:border-b">
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

          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-70">
              <span className="text-lime text-[11px] font-mono tracking-[2px] uppercase">
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
  );
}
