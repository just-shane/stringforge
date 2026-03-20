import { useState, useCallback, useMemo } from "react";
import { useSimStore } from "../../store.ts";
import { encodeShareLink } from "../../lib/bows.ts";
import type { PhysicsResult } from "../../lib/physics.ts";
import { computeArrow } from "../../lib/arrow.ts";

interface ShareExportProps {
  physics: PhysicsResult;
}

export function ShareExport({ physics }: ShareExportProps) {
  const theme = useSimStore((s) => s.theme);
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);
  const arrow = useSimStore((s) => s.arrow);
  const c = theme.colors;

  const [copied, setCopied] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const arrowResult = useMemo(
    () =>
      computeArrow(
        arrow,
        physics.estimatedFPS,
        params.drawWeight,
        params.drawLength,
        params.bowType,
      ),
    [arrow, physics.estimatedFPS, params.drawWeight, params.drawLength, params.bowType],
  );

  const shareUrl = useMemo(
    () => encodeShareLink({ params, weights, arrow }),
    [params, weights, arrow],
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareUrl]);

  const reportText = useMemo(() => {
    const lines = [
      "╔══════════════════════════════════════════════════════╗",
      "║       BOWSTRING DYNAMICS — SETUP REPORT             ║",
      "║       Grace / Prime Engineering                     ║",
      "╚══════════════════════════════════════════════════════╝",
      "",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "─── BOW CONFIGURATION ─────────────────────────────────",
      `  Bow Type:      ${params.bowType.charAt(0).toUpperCase() + params.bowType.slice(1)}`,
      `  Draw Weight:   ${params.drawWeight} lbs`,
      `  Draw Length:   ${params.drawLength}"`,
      `  Brace Height:  ${params.braceHeight}"`,
      `  Holding Weight:${params.bowType === "compound" ? ` ${physics.holdingWeight.toFixed(1)} lbs` : " N/A"}`,
      "",
      "─── STRING CONFIGURATION ──────────────────────────────",
      `  Material:      ${params.material}`,
      `  Strand Count:  ${params.strandCount}`,
      `  String Length:  ${params.stringLength}"`,
      `  Tension:       ${params.tension} lbs`,
      `  String Mass:   ${physics.stringMassGrains.toFixed(1)} gr`,
      "",
      "─── SPEED WEIGHTS ─────────────────────────────────────",
      ...weights.map(
        (w, i) =>
          `  Weight ${i + 1}:     ${w.mass}gr ${w.type} @ ${w.position}%`,
      ),
      `  Total Added:   ${physics.weightMassGrains.toFixed(1)} gr`,
      `  Speed Penalty: -${physics.speedPenalty.toFixed(1)} fps`,
      `  Vibe Reduction:${physics.vibrationReduction.toFixed(1)}%`,
      "",
      "─── ENERGY MODEL ──────────────────────────────────────",
      `  Stored Energy: ${physics.energy.storedEnergy.toFixed(1)} ft-lbs`,
      `  Arrow KE:      ${physics.energy.arrowKE.toFixed(1)} ft-lbs`,
      `  Efficiency:    ${(physics.energy.efficiency * 100).toFixed(1)}%`,
      `  Est. Speed:    ${physics.estimatedFPS.toFixed(0)} fps`,
      "",
      "─── ARROW BUILD ───────────────────────────────────────",
      `  Total Weight:  ${arrowResult.totalWeight.toFixed(1)} gr`,
      `  Launch Speed:  ${arrowResult.launchSpeed.toFixed(0)} fps`,
      `  KE at Launch:  ${arrowResult.kineticEnergy.toFixed(1)} ft-lbs`,
      `  Momentum:      ${arrowResult.momentum.toFixed(3)} slug·ft/s`,
      `  FOC:           ${arrowResult.foc.toFixed(1)}% (${arrowResult.focRating})`,
      `  Static Spine:  ${arrowResult.staticSpine}`,
      `  Dynamic Spine: ${arrowResult.dynamicSpine}`,
      `  Spine Match:   ${arrowResult.spineMatch}`,
      "",
      "─── VIBRATION ANALYSIS ────────────────────────────────",
      `  Fundamental:   ${physics.fundamentalFreq.toFixed(1)} Hz`,
      `  Vibrating Len: ${physics.vibratingLength.toFixed(1)}"`,
      `  Balance Point: ${physics.balancePoint.toFixed(1)}%`,
      "",
      "═══════════════════════════════════════════════════════",
      "  Bowstring Dynamics Simulator v2.0",
      "  Grace / Prime Engineering",
    ];
    return lines.join("\n");
  }, [params, weights, physics, arrowResult]);

  const handleCopyReport = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(reportText);
    } catch {
      // Fallback
    }
  }, [reportText]);

  const handleDownloadReport = useCallback(() => {
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bowstring-setup-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [reportText]);

  return (
    <div>
      <span
        className="text-[11px] font-mono tracking-[2px] uppercase"
        style={{ color: c.accent }}
      >
        Share & Export
      </span>

      <div
        className="mt-2 rounded-lg p-3"
        style={{ background: c.surface, border: `1px solid ${c.border}` }}
      >
        {/* Share link */}
        <div className="mb-3">
          <div className="text-[9px] font-mono uppercase mb-1.5" style={{ color: c.textDim }}>
            Share Link
          </div>
          <div className="flex gap-2">
            <div
              className="flex-1 text-[9px] font-mono px-2 py-1.5 rounded overflow-hidden text-ellipsis whitespace-nowrap"
              style={{
                background: c.bg,
                color: c.textDim,
                border: `1px solid ${c.border}`,
              }}
            >
              {shareUrl.length > 80 ? shareUrl.slice(0, 80) + "..." : shareUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded text-[9px] font-mono uppercase cursor-pointer transition-all shrink-0"
              style={{
                background: copied ? c.accentDim : "transparent",
                color: copied ? c.accent : c.textMuted,
                border: `1px solid ${copied ? c.accent : c.border}`,
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Setup report */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] font-mono uppercase" style={{ color: c.textDim }}>
              Setup Report
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopyReport}
                className="px-2 py-1 rounded text-[8px] font-mono uppercase cursor-pointer"
                style={{ color: c.textDim, border: `1px solid ${c.border}` }}
              >
                Copy Text
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-2 py-1 rounded text-[8px] font-mono uppercase cursor-pointer"
                style={{
                  background: c.accentDim,
                  color: c.accent,
                  border: `1px solid ${c.accent}`,
                }}
              >
                Download .txt
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowReport(!showReport)}
            className="w-full py-1.5 rounded text-[9px] font-mono cursor-pointer transition-all"
            style={{ color: c.textDim, border: `1px solid ${c.border}` }}
          >
            {showReport ? "Hide Preview" : "Preview Report"}
          </button>

          {showReport && (
            <pre
              className="mt-2 p-3 rounded text-[8px] font-mono overflow-x-auto max-h-[300px] overflow-y-auto"
              style={{
                background: c.bg,
                color: c.textMuted,
                border: `1px solid ${c.border}`,
              }}
            >
              {reportText}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
