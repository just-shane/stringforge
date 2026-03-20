import { useState, useEffect } from "react";
import { useSimStore } from "../../store.ts";
import {
  loadProfiles,
  saveProfiles,
  createProfile,
  deleteProfile,
  type SavedProfile,
} from "../../lib/bows.ts";

export function ProfileManager() {
  const theme = useSimStore((s) => s.theme);
  const params = useSimStore((s) => s.params);
  const weights = useSimStore((s) => s.weights);
  const arrow = useSimStore((s) => s.arrow);
  const setParam = useSimStore((s) => s.setParam);
  const setBowType = useSimStore((s) => s.setBowType);
  const setWeights = useSimStore((s) => s.setWeights);
  const setArrow = useSimStore((s) => s.setArrow);
  const c = theme.colors;

  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProfiles(loadProfiles());
  }, []);

  function handleSave() {
    if (!newName.trim()) return;
    const profile = createProfile(newName.trim(), params, weights, arrow);
    const updated = [profile, ...profiles];
    saveProfiles(updated);
    setProfiles(updated);
    setNewName("");
    setSaving(false);
  }

  function handleDelete(id: string) {
    const updated = deleteProfile(profiles, id);
    saveProfiles(updated);
    setProfiles(updated);
  }

  function handleLoad(profile: SavedProfile) {
    setBowType(profile.params.bowType);
    // Set all params after bow type change
    setTimeout(() => {
      setParam("drawWeight", profile.params.drawWeight);
      setParam("drawLength", profile.params.drawLength);
      setParam("stringLength", profile.params.stringLength);
      setParam("braceHeight", profile.params.braceHeight);
      setParam("strandCount", profile.params.strandCount);
      setParam("material", profile.params.material);
      setParam("tension", profile.params.tension);
      setWeights(profile.weights);
      const a = profile.arrow;
      setArrow("shaft", a.shaft);
      setArrow("shaftLength", a.shaftLength);
      setArrow("pointWeight", a.pointWeight);
      setArrow("nockWeight", a.nockWeight);
      setArrow("fletchingWeight", a.fletchingWeight);
      setArrow("fletchingLength", a.fletchingLength);
      setArrow("wrapWeight", a.wrapWeight);
    }, 0);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[11px] font-mono tracking-[2px] uppercase"
          style={{ color: c.accent }}
        >
          Saved Profiles
        </span>
        <span className="text-[9px] font-mono" style={{ color: c.textFaint }}>
          {profiles.length} saved
        </span>
      </div>

      {/* Save new profile */}
      {saving ? (
        <div
          className="flex gap-2 mb-3 p-2 rounded-lg"
          style={{ background: c.surface, border: `1px solid ${c.border}` }}
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Profile name..."
            className="flex-1 bg-transparent text-[11px] font-mono outline-none px-2 py-1 rounded"
            style={{ color: c.text, border: `1px solid ${c.border}` }}
            autoFocus
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 rounded text-[9px] font-mono uppercase cursor-pointer"
            style={{
              background: c.accentDim,
              color: c.accent,
              border: `1px solid ${c.accent}`,
            }}
          >
            Save
          </button>
          <button
            onClick={() => setSaving(false)}
            className="px-2 py-1 rounded text-[9px] font-mono cursor-pointer"
            style={{ color: c.textDim, border: `1px solid ${c.border}` }}
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => setSaving(true)}
          className="w-full mb-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider cursor-pointer transition-all"
          style={{
            border: `1px dashed ${c.accent}`,
            color: c.accent,
            background: c.accentGlow,
          }}
        >
          + Save Current Setup
        </button>
      )}

      {/* Profile list */}
      {profiles.length === 0 ? (
        <div
          className="text-center py-6 text-[11px] font-mono"
          style={{ color: c.textDim }}
        >
          No saved profiles yet.
          <br />
          Configure your setup, then save it here.
        </div>
      ) : (
        <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="rounded-lg p-3 transition-all"
              style={{ border: `1px solid ${c.border}`, background: c.surface }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-medium" style={{ color: c.text }}>
                  {p.name}
                </span>
                <span className="text-[8px] font-mono" style={{ color: c.textFaint }}>
                  {new Date(p.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-3 mb-2 text-[9px] font-mono" style={{ color: c.textDim }}>
                <span>{p.params.bowType}</span>
                <span>{p.params.drawWeight}lb</span>
                <span>{p.params.drawLength}"</span>
                <span>{p.params.material}</span>
                <span>{p.params.strandCount}str</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleLoad(p)}
                  className="flex-1 py-1.5 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
                  style={{
                    background: c.accentDim,
                    color: c.accent,
                    border: `1px solid ${c.accent}`,
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-3 py-1.5 rounded text-[9px] font-mono uppercase cursor-pointer transition-all"
                  style={{
                    color: c.danger,
                    border: `1px solid ${c.danger}40`,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
