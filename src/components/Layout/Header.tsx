export function Header() {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-gradient-to-br from-lime to-green-600 flex items-center justify-center font-bold text-sm text-black">
          G5
        </div>
        <div>
          <div className="text-base font-bold tracking-tight">Bowstring Dynamics</div>
          <div className="text-[10px] text-neutral-500 font-mono">
            SPEED WEIGHT SIMULATOR v2.0
          </div>
        </div>
      </div>
      <div className="text-[9px] text-neutral-600 font-mono text-right leading-relaxed">
        PRIME ARCHERY DIV
        <br />
        GRACE ENGINEERING
      </div>
    </div>
  );
}
