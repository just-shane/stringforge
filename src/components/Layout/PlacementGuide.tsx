export function PlacementGuide() {
  return (
    <>
      <span
        className="text-[11px] font-mono tracking-[2px] uppercase"
        style={{ color: "var(--c-accent)" }}
      >
        Placement Guide
      </span>
      <div
        className="mt-2 rounded-lg p-3 text-[11px] leading-7 font-mono"
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border-light)",
          color: "var(--c-text-muted)",
        }}
      >
        <div>
          <span style={{ color: "var(--c-accent)" }}>25%/75%</span> — Standard dampening, targets
          2nd harmonic
        </div>
        <div>
          <span style={{ color: "var(--c-accent)" }}>33%/67%</span> — Targets 3rd harmonic, less
          speed loss
        </div>
        <div>
          <span style={{ color: "var(--c-accent)" }}>50%</span> — Max fundamental dampening, center
          mass
        </div>
        <div>
          <span style={{ color: "var(--c-warn)" }}>Brass</span> — 8.5 g/cc, affordable, easier to
          tune
        </div>
        <div>
          <span style={{ color: "var(--c-tungsten)" }}>Tungsten</span> — 19.3 g/cc, compact, less
          wind drag
        </div>
        <div
          className="mt-2 pt-2"
          style={{ color: "var(--c-text-dim)", borderTop: "1px solid var(--c-border)" }}
        >
          Drag weights on the side view to reposition.
          <br />
          ~1.8 fps loss per 10 grains added.
        </div>
      </div>
    </>
  );
}
