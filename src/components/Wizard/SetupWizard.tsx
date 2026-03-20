import { useState } from "react";
import { useSimStore } from "../../store.ts";
import { getWizardRecommendation, type WizardRecommendation } from "../../lib/glossary.ts";

interface SetupWizardProps {
  onClose: () => void;
}

type Step = "purpose" | "experience" | "measurements" | "game" | "result";

export function SetupWizard({ onClose }: SetupWizardProps) {
  const theme = useSimStore((s) => s.theme);
  const setBowType = useSimStore((s) => s.setBowType);
  const setParam = useSimStore((s) => s.setParam);
  const setArrow = useSimStore((s) => s.setArrow);
  const c = theme.colors;

  const [step, setStep] = useState<Step>("purpose");
  const [purpose, setPurpose] = useState<"hunting" | "target" | "3d" | "recreational">("hunting");
  const [experience, setExperience] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [armSpan, setArmSpan] = useState(72);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [targetAnimal, setTargetAnimal] = useState<"small" | "medium" | "large">("medium");
  const [result, setResult] = useState<WizardRecommendation | null>(null);

  function handleNext() {
    if (step === "purpose") {
      setStep("experience");
    } else if (step === "experience") {
      setStep("measurements");
    } else if (step === "measurements") {
      if (purpose === "hunting") {
        setStep("game");
      } else {
        compute();
      }
    } else if (step === "game") {
      compute();
    }
  }

  function compute() {
    const rec = getWizardRecommendation(
      purpose,
      experience,
      armSpan,
      gender,
      purpose === "hunting" ? targetAnimal : undefined,
    );
    setResult(rec);
    setStep("result");
  }

  function applyRecommendation() {
    if (!result) return;
    setBowType("compound");
    setTimeout(() => {
      setParam("drawWeight", result.drawWeight);
      setParam("drawLength", result.drawLength);
      setArrow("shaft", result.shaftId);
      setArrow("pointWeight", result.pointWeight);
      setArrow("shaftLength", result.drawLength - 1); // typical cut length
    }, 0);
    onClose();
  }

  const stepLabels: Record<Step, string> = {
    purpose: "What will you use this for?",
    experience: "What's your experience level?",
    measurements: "About you",
    game: "What are you hunting?",
    result: "Your Recommendation",
  };

  const stepNumber: Record<Step, number> = {
    purpose: 1,
    experience: 2,
    measurements: 3,
    game: 4,
    result: purpose === "hunting" ? 5 : 4,
  };

  const totalSteps = purpose === "hunting" ? 5 : 4;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-xl overflow-hidden flex flex-col"
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
              Setup Wizard
            </h2>
            <p className="text-[11px] font-mono mt-0.5" style={{ color: c.textDim }}>
              Step {stepNumber[step]} of {totalSteps} — {stepLabels[step]}
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

        {/* Progress bar */}
        <div className="px-6 py-2 shrink-0" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: c.border }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(stepNumber[step] / totalSteps) * 100}%`,
                background: c.accent,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {step === "purpose" && (
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { id: "hunting", label: "Hunting", desc: "Taking game in the field" },
                  { id: "target", label: "Target", desc: "Competition & practice" },
                  { id: "3d", label: "3D Archery", desc: "ASA / IBO tournaments" },
                  { id: "recreational", label: "Recreational", desc: "Fun & casual shooting" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPurpose(opt.id)}
                  className="p-4 rounded-lg cursor-pointer text-left transition-all"
                  style={{
                    border: `2px solid ${purpose === opt.id ? c.accent : c.border}`,
                    background: purpose === opt.id ? c.accentDim : c.surface,
                  }}
                >
                  <div className="text-[13px] font-medium" style={{ color: purpose === opt.id ? c.accent : c.text }}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] font-mono mt-1" style={{ color: c.textDim }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === "experience" && (
            <div className="space-y-3">
              {(
                [
                  { id: "beginner", label: "Beginner", desc: "New to archery, less than 1 year" },
                  { id: "intermediate", label: "Intermediate", desc: "1-3 years, comfortable shooting" },
                  { id: "advanced", label: "Advanced", desc: "3+ years, competitive or serious hunter" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setExperience(opt.id)}
                  className="w-full p-4 rounded-lg cursor-pointer text-left transition-all"
                  style={{
                    border: `2px solid ${experience === opt.id ? c.accent : c.border}`,
                    background: experience === opt.id ? c.accentDim : c.surface,
                  }}
                >
                  <div className="text-[13px] font-medium" style={{ color: experience === opt.id ? c.accent : c.text }}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] font-mono mt-1" style={{ color: c.textDim }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === "measurements" && (
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-mono uppercase block mb-2" style={{ color: c.textDim }}>
                  Arm Span (inches) — stand with arms out, measure fingertip to fingertip
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={54}
                    max={84}
                    value={armSpan}
                    onChange={(e) => setArmSpan(Number(e.target.value))}
                    aria-label="Arm span in inches"
                    className="flex-1"
                    style={{ accentColor: c.accent }}
                  />
                  <span className="text-[14px] font-mono w-12 text-right" style={{ color: c.accent }}>
                    {armSpan}"
                  </span>
                </div>
                <div className="text-[9px] font-mono mt-1" style={{ color: c.textDim }}>
                  Estimated draw length: {Math.round(armSpan / 2.5)}" (arm span ÷ 2.5)
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase block mb-2" style={{ color: c.textDim }}>
                  Body type
                </label>
                <div className="flex gap-2">
                  {(["male", "female", "other"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className="flex-1 py-2 rounded-lg cursor-pointer text-[11px] font-mono capitalize transition-all"
                      style={{
                        border: `2px solid ${gender === g ? c.accent : c.border}`,
                        background: gender === g ? c.accentDim : c.surface,
                        color: gender === g ? c.accent : c.textMuted,
                      }}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === "game" && (
            <div className="space-y-3">
              {(
                [
                  { id: "small", label: "Small Game", desc: "Turkey, rabbit, javelina" },
                  { id: "medium", label: "Medium Game", desc: "Whitetail, mule deer, antelope" },
                  { id: "large", label: "Large Game", desc: "Elk, moose, bear, african plains" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setTargetAnimal(opt.id)}
                  className="w-full p-4 rounded-lg cursor-pointer text-left transition-all"
                  style={{
                    border: `2px solid ${targetAnimal === opt.id ? c.accent : c.border}`,
                    background: targetAnimal === opt.id ? c.accentDim : c.surface,
                  }}
                >
                  <div className="text-[13px] font-medium" style={{ color: targetAnimal === opt.id ? c.accent : c.text }}>
                    {opt.label}
                  </div>
                  <div className="text-[10px] font-mono mt-1" style={{ color: c.textDim }}>
                    {opt.desc}
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === "result" && result && (
            <div className="space-y-4">
              <div
                className="rounded-lg p-4"
                style={{ background: c.accentGlow, border: `1px solid ${c.accent}30` }}
              >
                <div className="text-[12px] leading-relaxed font-mono" style={{ color: c.textMuted }}>
                  {result.explanation}
                </div>
              </div>

              <div
                className="rounded-lg p-4"
                style={{ background: c.surface, border: `1px solid ${c.border}` }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <StatBlock label="Bow Type" value={result.bowType} c={c} accent />
                  <StatBlock label="Draw Weight" value={`${result.drawWeight} lbs`} c={c} />
                  <StatBlock label="Draw Length" value={`${result.drawLength}"`} c={c} />
                  <StatBlock label="Arrow Spine" value={`${result.arrowSpine}`} c={c} />
                  <StatBlock label="Point Weight" value={`${result.pointWeight} gr`} c={c} />
                  <StatBlock label="Arrow Weight" value={result.arrowWeight} c={c} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-between shrink-0"
          style={{ borderTop: `1px solid ${c.border}` }}
        >
          <button
            onClick={() => {
              if (step === "purpose") {
                onClose();
              } else if (step === "experience") {
                setStep("purpose");
              } else if (step === "measurements") {
                setStep("experience");
              } else if (step === "game") {
                setStep("measurements");
              } else {
                setStep(purpose === "hunting" ? "game" : "measurements");
              }
            }}
            className="px-4 py-2 rounded-lg text-[11px] font-mono cursor-pointer"
            style={{ color: c.textDim, border: `1px solid ${c.border}` }}
          >
            {step === "purpose" ? "Cancel" : "Back"}
          </button>

          {step === "result" ? (
            <button
              onClick={applyRecommendation}
              className="px-6 py-2 rounded-lg text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-all"
              style={{
                background: c.accent,
                color: c.bg,
                fontWeight: 600,
              }}
            >
              Apply to Simulator
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-all"
              style={{
                background: c.accentDim,
                color: c.accent,
                border: `1px solid ${c.accent}`,
              }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  c,
  accent,
}: {
  label: string;
  value: string;
  c: any;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[8px] font-mono uppercase" style={{ color: c.textDim }}>
        {label}
      </div>
      <div
        className="text-[13px] font-mono font-medium mt-0.5"
        style={{ color: accent ? c.accent : c.text }}
      >
        {value}
      </div>
    </div>
  );
}
