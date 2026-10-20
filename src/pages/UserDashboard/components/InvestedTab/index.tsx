import { BookOpen, Search, Coins, Heart, Clock, CheckCircle2 } from 'lucide-react';
import { WishCard } from '@/components/WishCard';
import { useInvested } from './useInvested';

export function InvestedTab() {
  const {
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    statusFilter,
    setStatusFilter,
    filtered,
    loading,
  } = useInvested();

  if (loading) {
    return <div className="text-center py-16 text-zinc-500">正在探尋您的追番心願牆...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" /> 心願追番結局牆
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            點擊卡片翻面即可重溫初衷；點擊背面按鈕可開啟專屬加油漂流瓶與主角開箱信！
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋追番故事或標籤..."
            className="bg-zinc-900 border border-white/10 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 p-2 bg-zinc-900/60 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 font-bold px-1.5">來源:</span>
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
              sourceFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            全部追番
          </button>
          <button
            onClick={() => setSourceFilter('invested')}
            className={`px-3 py-1 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer ${
              sourceFilter === 'invested'
                ? 'bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            <Coins className="w-3 h-3 text-amber-400" /> 曾注入燃料
          </button>
          <button
            onClick={() => setSourceFilter('bookmarked')}
            className={`px-3 py-1 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer ${
              sourceFilter === 'bookmarked'
                ? 'bg-rose-500/25 border border-rose-400/40 text-rose-200 font-bold'
                : 'text-zinc-400 hover:text-rose-200'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-400" /> 純愛心追番
          </button>
        </div>

        <div className="hidden sm:block w-[1px] h-5 bg-white/15 mx-1" />

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 font-bold px-1.5">狀態:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
              statusFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            所有狀態
          </button>
          <button
            onClick={() => setStatusFilter('funding')}
            className={`px-3 py-1 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === 'funding'
                ? 'bg-sky-500/20 border border-sky-400/30 text-sky-200 font-bold'
                : 'text-zinc-400 hover:text-sky-200'
            }`}
          >
            <Clock className="w-3 h-3 text-sky-400" /> 推進中
          </button>
          <button
            onClick={() => setStatusFilter('fulfilled')}
            className={`px-3 py-1 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer ${
              statusFilter === 'fulfilled'
                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold'
                : 'text-zinc-400 hover:text-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> 已開箱
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-zinc-900/30 text-zinc-500">
          {searchTerm || sourceFilter !== 'all' || statusFilter !== 'all'
            ? '在此交叉條件下暫無追番心願，請嘗試調整上方過濾條件。'
            : '您目前尚未收藏或支持過任何心願，快去首頁探索吧！'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((w, idx) => (
            <WishCard key={w.id} wish={w} index={idx} variant="tracked" />
          ))}
        </div>
      )}
    </div>
  );
}