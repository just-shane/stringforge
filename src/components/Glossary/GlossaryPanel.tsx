import { useState, useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { GLOSSARY, searchGlossary, type GlossaryTerm } from "../../lib/glossary.ts";

interface GlossaryPanelProps {
  onClose: () => void;
}

const CATEGORIES = ["bow", "string", "arrow", "tuning", "physics"] as const;
const CAT_LABELS: Record<string, string> = {
  bow: "Bow",
  string: "String",
  arrow: "Arrow",
  tuning: "Tuning",
  physics: "Physics",
};

export function GlossaryPanel({ onClose }: GlossaryPanelProps) {
  const theme = useSimStore((s) => s.theme);
  const c = theme.colors;

  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filteredTerms = useMemo(() => {
    let terms: GlossaryTerm[];
    if (search.trim()) {
      terms = searchGlossary(search);
    } else if (category === "all") {
      terms = GLOSSARY;
    } else {
      terms = GLOSSARY.filter((t) => t.category === category);
    }
    return terms;
  }, [category, search]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] rounded-xl overflow-hidden flex flex-col"
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
              Archery Glossary
            </h2>
            <p className="text-[11px] font-mono mt-0.5" style={{ color: c.textDim }}>
              {GLOSSARY.length} terms · Hover any term in the simulator for quick definitions
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-lg"
            style={{ color: c.textDim, border: `1px solid ${c.border}` }}
          >
            ×
          </button>
        </div>

        {/* Search & filters */}
        <div
          className="px-6 py-3 shrink-0 flex gap-3 items-center flex-wrap"
          style={{ borderBottom: `1px solid ${c.border}` }}
        >
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value) setCategory("all");
            }}
            placeholder="Search terms..."
            className="bg-transparent text-[11px] font-mono outline-none px-3 py-1.5 rounded flex-1 min-w-[150px]"
            style={{ color: c.text, border: `1px solid ${c.border}` }}
          />
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => { setCategory("all"); setSearch(""); }}
              className="px-2 py-1 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
              style={{
                background: category === "all" && !search ? c.accentDim : "transparent",
                color: category === "all" && !search ? c.accent : c.textDim,
                border: `1px solid ${category === "all" && !search ? c.accent : c.border}`,
              }}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setCategory(cat); setSearch(""); }}
                className="px-2 py-1 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
                style={{
                  background: category === cat ? c.accentDim : "transparent",
                  color: category === cat ? c.accent : c.textDim,
                  border: `1px solid ${category === cat ? c.accent : c.border}`,
                }}
              >
                {CAT_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-10 text-[12px] font-mono" style={{ color: c.textDim }}>
              No terms found for "{search}"
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTerms.map((term) => {
                const isExpanded = expandedTerm === term.term;
                return (
                  <div
                    key={term.term}
                    className="rounded-lg overflow-hidden transition-all"
                    style={{
                      border: `1px solid ${isExpanded ? c.borderLight : c.border}`,
                      background: isExpanded ? c.surface : "transparent",
                    }}
                  >
                    <button
                      onClick={() => setExpandedTerm(isExpanded ? null : term.term)}
                      className="w-full px-4 py-3 flex items-start justify-between cursor-pointer text-left gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium" style={{ color: isExpanded ? c.accent : c.text }}>
                            {term.term}
                          </span>
                          <span
                            className="text-[7px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0"
                            style={{
                              color: c.textDim,
                              background: c.surface,
                              border: `1px solid ${c.border}`,
                            }}
                          >
                            {CAT_LABELS[term.category]}
                          </span>
                        </div>
                        {!isExpanded && (
                          <div className="text-[10px] font-mono mt-1" style={{ color: c.textDim }}>
                            {term.short}
                          </div>
                        )}
                      </div>
                      <span
                        className="text-sm shrink-0 transition-transform mt-0.5"
                        style={{
                          color: c.textDim,
                          transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        ▾
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div
                          className="text-[11px] leading-relaxed font-mono mb-3"
                          style={{ color: c.textMuted }}
                        >
                          {term.detailed}
                        </div>
                        {term.related.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[8px] font-mono uppercase" style={{ color: c.textDim }}>
                              Related:
                            </span>
                            {term.related.map((r) => (
                              <button
                                key={r}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedTerm(r);
                                  setSearch("");
                                  setCategory("all");
                                }}
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded cursor-pointer transition-all"
                                style={{
                                  color: c.accent,
                                  background: c.accentGlow,
                                  border: `1px solid ${c.accent}30`,
                                }}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 shrink-0 flex justify-between items-center"
          style={{ borderTop: `1px solid ${c.border}` }}
        >
          <span className="text-[9px] font-mono" style={{ color: c.textFaint }}>
            {filteredTerms.length} terms shown
          </span>
          <span className="text-[9px] font-mono" style={{ color: c.textFaint }}>
            Grace / Prime Engineering
          </span>
        </div>
      </div>
    </div>
  );
}
