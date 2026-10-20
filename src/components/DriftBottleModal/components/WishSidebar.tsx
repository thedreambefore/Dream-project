// src/components/DriftBottleModal/components/WishSidebar.tsx
import { Sparkles, Compass, CheckCircle2, Coins } from 'lucide-react';
import type { Wish } from '@/types/wish';

interface Props {
  wish: Wish;
  isOfficial: boolean;
  isFulfilled: boolean;
  progressPercent: number;
  currentStardust: number;
  targetStardust: number;
}

export function WishSidebar({
  wish,
  isOfficial,
  isFulfilled,
  progressPercent,
  currentStardust,
  targetStardust,
}: Props) {
  return (
    <div className="w-full md:w-80 h-[430px] flex-shrink-0 flex items-center justify-center">
      <div className="w-full h-full rounded-2xl glass glow-border overflow-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl relative border border-amber-400/25">
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          {wish.image_url ? (
            <div className="relative w-full h-full">
              <img
                src={wish.image_url}
                alt={wish.product_name}
                className="w-full h-full object-cover brightness-60 contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#120e28]/85 to-[#241446]/60 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a1a]" />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-[#0a0a1a]" />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-300" />
              #{wish.tag_name}
            </span>

            {isOfficial ? (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                <Compass className="w-3 h-3" /> 官方常駐
              </span>
            ) : isFulfilled ? (
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> 活動達成
              </span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                已投入 {progressPercent}%
              </span>
            )}
          </div>

          <h3 className="font-bold text-amber-100 text-base leading-snug line-clamp-2 mt-2 drop-shadow-md flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{wish.product_name}</span>
          </h3>
        </div>

        <div className="space-y-3">
          <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
            <p className="text-[11px] text-zinc-400 line-clamp-2">
              <span className="text-amber-300/80 font-bold">終章承諾：</span>
              {wish.promise_text}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs font-mono">
              <span className="text-zinc-400 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {currentStardust.toLocaleString()} / {targetStardust.toLocaleString()} 星塵
              </span>
              <span className="text-amber-200 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}