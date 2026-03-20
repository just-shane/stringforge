import { useSimStore } from "../../store.ts";
import { HamburgerMenu } from "../Menu/HamburgerMenu.tsx";
import { APP_VERSION, APP_NAME, APP_SUBTITLE } from "../../lib/version.ts";

export function Header() {
  const setDocsOpen = useSimStore((s) => s.setDocsOpen);
  const setGlossaryOpen = useSimStore((s) => s.setGlossaryOpen);
  const setWizardOpen = useSimStore((s) => s.setWizardOpen);

  return (
    <div
      data-tour="header"
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
            {APP_NAME}
          </div>
          <div className="text-[10px] font-mono" style={{ color: "var(--c-text-dim)" }}>
            {APP_SUBTITLE.toUpperCase()} v{APP_VERSION}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div data-tour="header-buttons" className="flex items-center gap-2">
          <button
            onClick={() => setWizardOpen(true)}
            className="px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all max-sm:hidden"
            style={{
              background: "var(--c-accent-dim)",
              border: "1px solid var(--c-accent)",
              color: "var(--c-accent)",
            }}
          >
            Setup Wizard
          </button>
          <button
            onClick={() => setGlossaryOpen(true)}
            className="px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
            style={{
              background: "var(--c-surface)",
              border: "1px solid var(--c-border)",
              color: "var(--c-text-muted)",
            }}
          >
            Glossary
          </button>
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
        </div>
        <div
          className="text-[9px] font-mono text-right leading-relaxed max-sm:hidden"
          style={{ color: "var(--c-text-faint)" }}
        >
          PRIME ARCHERY DIV
          <br />
          GRACE ENGINEERING
        </div>
        <div data-tour="theme-menu">
          <HamburgerMenu />
        </div>
      </div>
    </div>
  );
}
