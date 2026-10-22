// src/pages/UserDashboard/components/WalletTab/components/HonorLeaderboard.tsx
import { Award, Hourglass, Sparkles } from 'lucide-react';
import type { LeaderboardUser } from '../../../types';

interface Props {
  hallTab: 'fulfilled' | 'inTransit' | 'official';
  setHallTab: (t: 'fulfilled' | 'inTransit' | 'official') => void;
  loading: boolean;
  currentList: LeaderboardUser[];
}

export function HonorLeaderboard({ hallTab, setHallTab, loading, currentList }: Props) {
  return (
    <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-900/60 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
        <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-xl text-xs gap-1 flex-wrap">
          <button type="button" onClick={() => setHallTab('fulfilled')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${hallTab === 'fulfilled' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'text-zinc-400 hover:text-white'}`}><Award className="w-3.5 h-3.5" /><span>圓滿引路榜</span></button>
          <button type="button" onClick={() => setHallTab('inTransit')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${hallTab === 'inTransit' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40' : 'text-zinc-400 hover:text-white'}`}><Hourglass className="w-3.5 h-3.5" /><span>在途守護榜</span></button>
          <button type="button" onClick={() => setHallTab('official')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${hallTab === 'official' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40' : 'text-zinc-400 hover:text-white'}`}><Sparkles className="w-3.5 h-3.5" /><span>星空守護榜</span></button>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">全站匿名 TOP 10</span>
      </div>

      {loading ? (
        <div className="text-center py-10 text-xs text-zinc-500">正在同步全星空榮譽榜單...</div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-10 text-xs text-zinc-500">虛位以待，等待第一顆引路星點亮</div>
      ) : (
        <div className="space-y-2">
          {currentList.map((u, idx) => (
            <div key={u.id} className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${idx === 0 ? 'bg-amber-500/15 border-amber-400/40 shadow-sm' : idx === 1 ? 'bg-white/5 border-white/15' : idx === 2 ? 'bg-amber-900/10 border-amber-600/20' : 'bg-zinc-950/60 border-white/5'}`}>
              <div className="flex items-center gap-3">
                <span className={`font-mono font-black text-sm w-5 text-center ${idx === 0 ? 'text-amber-300' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-zinc-500'}`}>{idx + 1}</span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 text-zinc-950 font-bold flex items-center justify-center text-xs">{u.anonymous_nickname.substring(0, 1)}</div>
                <span className="font-bold text-zinc-200">{u.anonymous_nickname}</span>
              </div>
              <div className="text-right font-mono"><span className="text-amber-300 font-bold text-sm">✨ {Number(u.amount || 0).toLocaleString()}</span><span className="text-[10px] text-zinc-500 ml-1">星塵</span></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}