interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

export function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  const display = step < 1 ? value.toFixed(1) : String(value);

  return (
    <div className="mb-3">
      <div className="flex justify-between mb-0.5">
        <span className="text-neutral-400 text-[11px]">{label}</span>
        <span className="text-lime text-[11px] font-mono">
          {display}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
      />
    </div>
  );
}
