import { useEffect } from "react";
import { useSimStore } from "../../store.ts";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSimStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const c = theme.colors;
    root.style.setProperty("--c-bg", c.bg);
    root.style.setProperty("--c-panel", c.panel);
    root.style.setProperty("--c-surface", c.surface);
    root.style.setProperty("--c-border", c.border);
    root.style.setProperty("--c-border-light", c.borderLight);
    root.style.setProperty("--c-text", c.text);
    root.style.setProperty("--c-text-muted", c.textMuted);
    root.style.setProperty("--c-text-dim", c.textDim);
    root.style.setProperty("--c-text-faint", c.textFaint);
    root.style.setProperty("--c-accent", c.accent);
    root.style.setProperty("--c-accent-dim", c.accentDim);
    root.style.setProperty("--c-accent-glow", c.accentGlow);
    root.style.setProperty("--c-warn", c.warn);
    root.style.setProperty("--c-danger", c.danger);
    root.style.setProperty("--c-brass", c.brass);
    root.style.setProperty("--c-tungsten", c.tungsten);
    root.style.setProperty("--c-string", c.string);
    root.style.backgroundColor = c.bg;
    root.style.color = c.text;
  }, [theme]);

  return <>{children}</>;
}
