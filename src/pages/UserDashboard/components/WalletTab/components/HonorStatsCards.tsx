// src/pages/UserDashboard/components/WalletTab/components/HonorStatsCards.tsx
import { Sparkles, Hourglass } from 'lucide-react';

interface Props {
  totalHonor: number;
  myInTransitAmount: number;
  transitCount: number;
  showTransitDetails: boolean;
  onToggleDetails: () => void;
}

export function HonorStatsCards({ totalHonor, myInTransitAmount, transitCount, showTransitDetails, onToggleDetails }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/20 p-5 rounded-2xl glow-border">
        <p className="text-zinc-400 text-[11px] font-bold tracking-wider mb-1">已圓滿履約見證星塵 (HONOR)</p>
        <h4 className="text-2xl font-black text-amber-300 font-mono flex items-baseline gap-1">
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{totalHonor.toLocaleString()}</span>
          <span className="text-[10px] text-zinc-500 font-normal ml-1">榮譽點</span>
        </h4>
        <p className="text-[10px] text-zinc-500 mt-1.5">含履約結算與超額自動轉化之永久印記</p>
      </div>

      <div
        onClick={onToggleDetails}
        className={`border p-5 rounded-2xl transition-all cursor-pointer relative group ${
          showTransitDetails ? 'bg-amber-500/10 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-900/70 border-white/10 hover:border-amber-400/30'
        }`}
      >
        <div className="flex justify-between items-start">
          <p className="text-zinc-400 text-[11px] font-bold tracking-wider mb-1">進行中在途燃料</p>
          <span className="text-xs text-amber-300 font-bold group-hover:scale-110 transition-transform">
            {showTransitDetails ? '▲ 收合' : '▼ 展開'}
          </span>
        </div>
        <h4 className="text-2xl font-black text-yellow-200 font-mono flex items-baseline gap-1">
          <Hourglass className="w-5 h-5 text-yellow-300" />
          <span>{myInTransitAmount.toLocaleString()}</span>
          <span className="text-[10px] text-zinc-500 font-normal ml-1">在途星塵</span>
        </h4>
        <p className="text-[10px] text-amber-300/80 mt-1.5">正在陪伴 {transitCount} 則心願前進（點擊查閱明細）</p>
      </div>
    </div>
  );
}