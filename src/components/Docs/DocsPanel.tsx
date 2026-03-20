import { useState } from "react";
import { useSimStore } from "../../store.ts";
import { DOCS, DOC_CATEGORIES } from "../../lib/docs.ts";

type DocsMode = "engineer" | "regular";

interface DocsPanelProps {
  onClose: () => void;
}

export function DocsPanel({ onClose }: DocsPanelProps) {
  const [mode, setMode] = useState<DocsMode>("regular");
  const [activeCategory, setActiveCategory] = useState<string>(DOC_CATEGORIES[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const theme = useSimStore((s) => s.theme);
  const c = theme.colors;

  const filteredDocs = DOCS.filter((d) => d.category === activeCategory);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-xl overflow-hidden flex flex-col"
        style={{
          background: c.panel,
          border: `1px solid ${c.borderLight}`,
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <div>
            <h2 className="text-lg font-bold" style={{ color: c.text }}>
              Documentation
            </h2>
            <p className="text-[11px] font-mono mt-0.5" style={{ color: c.textDim }}>
              Physics reference for StringForge
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode toggle */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: `1px solid ${c.border}` }}
            >
              <button
                onClick={() => setMode("regular")}
                className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
                style={{
                  background: mode === "regular" ? c.accentDim : "transparent",
                  color: mode === "regular" ? c.accent : c.textDim,
                }}
              >
                I'm NOT an Engineer
              </button>
              <button
                onClick={() => setMode("engineer")}
                className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
                style={{
                  background: mode === "engineer" ? c.accentDim : "transparent",
                  color: mode === "engineer" ? c.accent : c.textDim,
                  borderLeft: `1px solid ${c.border}`,
                }}
              >
                I'm an Engineer
              </button>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-lg"
              style={{
                color: c.textDim,
                border: `1px solid ${c.border}`,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div
          className="flex gap-1 px-4 py-2 shrink-0 overflow-x-auto"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          {DOC_CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setExpandedId(null);
                }}
                className="px-3 py-1.5 rounded-md text-[10px] font-mono whitespace-nowrap cursor-pointer transition-all"
                style={{
                  background: active ? c.accentDim : "transparent",
                  color: active ? c.accent : c.textDim,
                  border: `1px solid ${active ? c.accent : "transparent"}`,
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Mode indicator */}
        <div
          className="px-6 py-2 shrink-0"
          style={{
            background: c.accentGlow,
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          <span className="text-[10px] font-mono" style={{ color: c.accent }}>
            {mode === "engineer"
              ? "ENGINEER MODE — Showing formulas, derivations, and technical references"
              : "PLAIN LANGUAGE MODE — Explaining concepts without jargon"}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredDocs.map((doc) => {
            const isExpanded = expandedId === doc.id;
            const content = mode === "engineer" ? doc.engineer : doc.regular;

            return (
              <div
                key={doc.id}
                className="mb-3 rounded-lg overflow-hidden"
                style={{
                  border: `1px solid ${isExpanded ? c.borderLight : c.border}`,
                  background: isExpanded ? c.surface : "transparent",
                }}
              >
                {/* Section header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                  className="w-full px-4 py-3 flex items-center justify-between cursor-pointer text-left transition-all"
                  style={{ background: isExpanded ? c.accentGlow : "transparent" }}
                >
                  <span
                    className="text-[13px] font-medium"
                    style={{ color: isExpanded ? c.accent : c.text }}
                  >
                    {doc.title}
                  </span>
                  <span
                    className="text-sm transition-transform"
                    style={{
                      color: c.textDim,
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  >
                    ▾
                  </span>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div
                      className="text-[12px] leading-relaxed whitespace-pre-wrap font-mono"
                      style={{ color: c.textMuted }}
                    >
                      {content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 shrink-0 flex justify-between items-center"
          style={{ borderTop: `1px solid ${c.border}` }}
        >
          <span className="text-[9px] font-mono" style={{ color: c.textFaint }}>
            {DOCS.length} topics · {DOC_CATEGORIES.length} categories
          </span>
          <span className="text-[9px] font-mono" style={{ color: c.textFaint }}>
            © 2026 StringForge.io
          </span>
        </div>
      </div>
    </div>
  );
}
