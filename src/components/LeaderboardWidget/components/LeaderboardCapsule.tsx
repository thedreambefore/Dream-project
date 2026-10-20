// src/components/LeaderboardWidget/components/LeaderboardCapsule.tsx
import { Flame, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Wish } from '@/types/wish';
import type { BoardUserItem } from '../types';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  topWish: Wish | undefined;
  topOfficialDonor: BoardUserItem | undefined;
}

export function LeaderboardCapsule({ isOpen, onToggle, topWish, topOfficialDonor }: Props) {
  const wishPercent = topWish
    ? Math.round(((topWish.current_stardust || 0) / (topWish.product_price || 1)) * 100)
    : 0;

  return (
    <div
      onClick={onToggle}
      className="glass rounded-2xl p-2.5 sm:p-3 border border-amber-400/20 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:border-amber-400/40 transition-all select-none"
    >
      <div className="flex items-center gap-2 flex-wrap">
        {/* 臨門一腳徽章 */}
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-400/30 px-3 py-1 rounded-xl text-xs text-amber-200">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-bold">臨門一腳：</span>
          {topWish ? (
            <span className="font-mono text-amber-300 font-bold truncate max-w-[130px]">
              {topWish.product_name} ({wishPercent}%)
            </span>
          ) : (
            <span className="text-zinc-500">靜候星光</span>
          )}
        </div>

        {/* 星空守護榜首徽章 */}
        <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/30 px-3 py-1 rounded-xl text-xs text-indigo-200">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-bold">星空守護榜首：</span>
          {topOfficialDonor ? (
            <span className="text-indigo-300 font-mono font-bold truncate max-w-[130px]">
              {topOfficialDonor.anonymous_nickname} (⭐{topOfficialDonor.amount})
            </span>
          ) : (
            <span className="text-zinc-500">虛位以待</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-zinc-400 pr-1">
        <span className="hidden sm:inline text-[11px]">展開榜單</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-amber-300" /> : <ChevronDown className="w-4 h-4" />}
      </div>
    </div>
  );
}