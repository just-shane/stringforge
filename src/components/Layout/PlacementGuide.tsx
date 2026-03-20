export function PlacementGuide() {
  return (
    <>
      <span className="text-lime text-[11px] font-mono tracking-[2px] uppercase">
        Placement Guide
      </span>
      <div className="mt-2 bg-black/30 rounded-lg border border-neutral-800 p-3 text-[11px] text-neutral-400 leading-7 font-mono">
        <div>
          <span className="text-lime">25%/75%</span> — Standard dampening, targets 2nd harmonic
        </div>
        <div>
          <span className="text-lime">33%/67%</span> — Targets 3rd harmonic, less speed loss
        </div>
        <div>
          <span className="text-lime">50%</span> — Max fundamental dampening, center mass
        </div>
        <div>
          <span className="text-amber-300">Brass</span> — 8.5 g/cc, affordable, easier to tune
        </div>
        <div>
          <span className="text-tungsten">Tungsten</span> — 19.3 g/cc, compact, less wind drag
        </div>
        <div className="mt-2 text-neutral-500 border-t border-neutral-800 pt-2">
          Drag weights on the side view to reposition.
          <br />
          ~1.8 fps loss per 10 grains added.
        </div>
      </div>
    </>
  );
}
