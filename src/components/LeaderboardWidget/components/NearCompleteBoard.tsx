// src/components/LeaderboardWidget/components/NearCompleteBoard.tsx
import { Flame, Compass } from 'lucide-react';
import type { Wish } from '@/types/wish';

interface Props {
  topPercentWishes: Wish[];
  onScrollToWish: (wishId: string) => void;
}

export function NearCompleteBoard({ topPercentWishes, onScrollToWish }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[11px] text-zinc-400 px-1">
        <span className="flex items-center gap-1 text-amber-300 font-bold">
          <Flame className="w-3.5 h-3.5 text-amber-400" /> 距離圓滿最接近的 3 則心願 (未滿 100%)
        </span>
        <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
          <Compass className="w-3 h-3" /> 點擊直接定位卡片
        </span>
      </div>

      {topPercentWishes.length === 0 ? (
        <div className="text-center py-8 text-xs text-zinc-500 border border-white/5 rounded-xl bg-zinc-900/30">
          目前暫無 1% ~ 99% 推進中的心願
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {topPercentWishes.map((w, idx) => {
            const pct = Math.round(((w.current_stardust || 0) / (w.product_price || 1)) * 100);
            return (
              <div
                key={w.id}
                onClick={() => onScrollToWish(w.id)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-amber-400 font-mono font-black text-sm">{idx + 1}</span>
                  <span className="text-zinc-200 font-medium truncate max-w-[120px]">
                    {w.product_name}
                  </span>
                </div>
                <span className="font-mono font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-400/20">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}