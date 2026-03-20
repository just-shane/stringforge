import { useSimStore } from "../../store.ts";
import { HamburgerMenu } from "../Menu/HamburgerMenu.tsx";

export function Header() {
  const setDocsOpen = useSimStore((s) => s.setDocsOpen);

  return (
    <div
      className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: "1px solid var(--c-border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
          style={{
            background: `linear-gradient(135deg, var(--c-accent), color-mix(in srgb, var(--c-accent) 60%, black))`,
            color: "#000",
          }}
        >
          G5
        </div>
        <div>
          <div className="text-base font-bold tracking-tight" style={{ color: "var(--c-text)" }}>
            Bowstring Dynamics
          </div>
          <div className="text-[10px] font-mono" style={{ color: "var(--c-text-dim)" }}>
            SPEED WEIGHT SIMULATOR v2.0
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDocsOpen(true)}
          className="px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
          style={{
            background: "var(--c-surface)",
            border: "1px solid var(--c-border)",
            color: "var(--c-text-muted)",
          }}
        >
          Docs
        </button>
        <div
          className="text-[9px] font-mono text-right leading-relaxed max-sm:hidden"
          style={{ color: "var(--c-text-faint)" }}
        >
          PRIME ARCHERY DIV
          <br />
          GRACE ENGINEERING
        </div>
        <HamburgerMenu />
      </div>
    </div>
  );
}
