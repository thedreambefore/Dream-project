interface Props {
  amount: number;
  customInput: string;
  onSelectPreset: (preset: number) => void;
  onCustomChange: (val: string) => void;
}

const PRESETS = [
  { val: 50, label: '50 顆 (微光星座)' },
  { val: 100, label: '100 顆 (耀眼流星)' },
  { val: 300, label: '300 顆 (璀璨星群)' },
];

export function PresetButtons({ amount, customInput, onSelectPreset, onCustomChange }: Props) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-2.5">
        {PRESETS.map((item) => {
          const isSelected = amount === item.val && customInput === '';
          return (
            <button
              key={item.val}
              type="button"
              onClick={() => onSelectPreset(item.val)}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:border-amber-400/30'
              }`}
            >
              <span className="text-sm font-black font-mono text-amber-300">{item.val} 顆</span>
              <span className="text-[10px] text-gray-400">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2">
        <span className="text-xs text-gray-300 whitespace-nowrap">自訂星星數量：</span>
        <input
          type="number"
          min={50}
          value={customInput}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="最低 50 ~ 無上限"
          className="w-full bg-transparent text-amber-300 font-mono font-bold text-xs focus:outline-none text-right pr-1"
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">顆</span>
      </div>
    </div>
  );
}