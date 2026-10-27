// src/pages/UserDashboard/components/PublishTab/components/PriceShippingSection.tsx
import { Truck } from 'lucide-react';

interface Props {
  basePrice: number;
  setBasePrice: (v: number) => void;
  hasShippingFee: boolean;
  setHasShippingFee: (v: boolean) => void;
  finalPrice: number;
}

export function PriceShippingSection({
  basePrice,
  setBasePrice,
  hasShippingFee,
  setHasShippingFee,
  finalPrice,
}: Props) {
  return (
    <div className="space-y-2 bg-black/40 border border-white/10 rounded-2xl p-4">
      <label className="block text-xs font-medium text-gray-300">
        目標商品原價 <span className="text-zinc-500 font-mono">(NT$ 50 ~ 20,000)</span>
      </label>
      <input
        type="number"
        min={50}
        max={20000}
        value={basePrice}
        onChange={(e) => setBasePrice(Number(e.target.value))}
        className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400/50"
        required
      />

      <div className="pt-2 border-t border-white/5 space-y-2">
        <span className="text-xs text-zinc-400 flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          電商運費快捷計算：
        </span>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setHasShippingFee(false)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              !hasShippingFee
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                : 'bg-zinc-900 border-white/10 text-zinc-400'
            }`}
          >
            <span>該電商免運費</span>
            <span className="text-[10px] font-mono text-zinc-500">+NT$ 0</span>
          </button>

          <button
            type="button"
            onClick={() => setHasShippingFee(true)}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
              hasShippingFee
                ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                : 'bg-zinc-900 border-white/10 text-zinc-400'
            }`}
          >
            <span>需超商運費</span>
            <span className="text-[10px] font-mono text-amber-300 font-bold">+NT$ 60</span>
          </button>
        </div>

        <div className="flex justify-between items-center text-xs font-mono pt-1 text-zinc-400">
          <span>最終心願目標星塵：</span>
          <span className="text-amber-300 font-black text-sm glow-text">
            {finalPrice.toLocaleString()} 顆星塵 (NT$ {finalPrice.toLocaleString()})
          </span>
        </div>
      </div>
    </div>
  );
}