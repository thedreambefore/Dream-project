// src/pages/UserDashboard/components/InvestedTab/components/InvestedFilterBar.tsx
import { Search, Coins, Heart, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  sourceFilter: 'all' | 'invested' | 'bookmarked';
  setSourceFilter: (v: 'all' | 'invested' | 'bookmarked') => void;
  statusFilter: 'all' | 'funding' | 'fulfilled';
  setStatusFilter: (v: 'all' | 'funding' | 'fulfilled') => void;
}

export function InvestedFilterBar({
  searchTerm,
  setSearchTerm,
  sourceFilter,
  setSourceFilter,
  statusFilter,
  setStatusFilter,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋追番故事或標籤..."
            className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 p-2 bg-zinc-900/60 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1 text-xs">
          <span className="text-[10px] text-zinc-500 font-bold px-1">來源:</span>
          <button onClick={() => setSourceFilter('all')} className={`px-2.5 py-1 rounded-lg cursor-pointer ${sourceFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-zinc-400'}`}>全部</button>
          <button onClick={() => setSourceFilter('invested')} className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${sourceFilter === 'invested' ? 'bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold' : 'text-zinc-400'}`}><Coins className="w-3 h-3 text-amber-400" /> 曾投星</button>
          <button onClick={() => setSourceFilter('bookmarked')} className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${sourceFilter === 'bookmarked' ? 'bg-rose-500/25 border border-rose-400/40 text-rose-200 font-bold' : 'text-zinc-400'}`}><Heart className="w-3 h-3 text-rose-400" /> 純愛心</button>
        </div>

        <div className="hidden sm:block w-[1px] h-4 bg-white/15 mx-1" />

        <div className="flex items-center gap-1 text-xs">
          <span className="text-[10px] text-zinc-500 font-bold px-1">狀態:</span>
          <button onClick={() => setStatusFilter('all')} className={`px-2.5 py-1 rounded-lg cursor-pointer ${statusFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-zinc-400'}`}>所有狀態</button>
          <button onClick={() => setStatusFilter('funding')} className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${statusFilter === 'funding' ? 'bg-sky-500/20 border border-sky-400/30 text-sky-200 font-bold' : 'text-zinc-400'}`}><Clock className="w-3 h-3 text-sky-400" /> 推進中</button>
          <button onClick={() => setStatusFilter('fulfilled')} className={`px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer ${statusFilter === 'fulfilled' ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold' : 'text-zinc-400'}`}><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 已開箱</button>
        </div>
      </div>
    </div>
  );
}