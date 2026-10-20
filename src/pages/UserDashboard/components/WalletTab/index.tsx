import { Award, Sparkles, Hourglass, FileText, MessageSquare } from 'lucide-react';
import { useWallet } from './useWallet';

export function WalletTab() {
  const {
    hallTab,
    setHallTab,
    showTransitDetails,
    setShowTransitDetails,
    transitList,
    totalHonor,
    myInTransitAmount,
    fulfilledTopUsers,
    inTransitTopUsers,
    officialDonors,
    loading,
  } = useWallet();

  const currentList =
    hallTab === 'fulfilled' ? fulfilledTopUsers : hallTab === 'inTransit' ? inTransitTopUsers : officialDonors;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-300" /> 星光貢獻榮譽殿堂
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">見證每位星旅人投入的真實善意與在途守護</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 履約見證星塵 */}
        <div className="bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/20 p-5 rounded-2xl glow-border">
          <p className="text-zinc-400 text-[11px] font-bold tracking-wider mb-1">已圓滿履約見證星塵 (HONOR)</p>
          <h4 className="text-2xl font-black text-amber-300 font-mono flex items-baseline gap-1">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{totalHonor.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-500 font-normal ml-1">榮譽點</span>
          </h4>
          <p className="text-[10px] text-zinc-500 mt-1.5">含履約結算與超額自動轉化之永久印記</p>
        </div>

        {/* 進行中在途燃料 */}
        <div
          onClick={() => setShowTransitDetails((prev) => !prev)}
          className={`border p-5 rounded-2xl transition-all cursor-pointer relative group ${
            showTransitDetails
              ? 'bg-amber-500/10 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
              : 'bg-zinc-900/70 border-white/10 hover:border-amber-400/30'
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
          <p className="text-[10px] text-amber-300/80 mt-1.5">
            正在陪伴 {transitList.length} 則心願前進（點擊查閱留言與來歷）
          </p>
        </div>
      </div>

      {showTransitDetails && (
        <div className="glass rounded-2xl p-5 border border-amber-400/30 bg-zinc-950/90 space-y-3 animate-fade-in">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <h4 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-300" /> 我的在途星塵來歷名冊 ({transitList.length} 筆)
            </h4>
            <span className="text-[10px] text-zinc-500">故事達成出貨後將轉為永久榮譽</span>
          </div>

          {transitList.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500">目前尚無在途的星塵投入。</div>
          ) : (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 hide-scrollbar">
              {transitList.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-400/20 transition-all text-xs space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-amber-100 truncate max-w-[240px]">
                      {item.wish?.product_name || '心願活動'}
                    </span>
                    <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                      +{item.amount} 顆在途中
                    </span>
                  </div>

                  <p className="text-zinc-300 bg-black/40 p-2 rounded-lg text-[11px] leading-relaxed">
                    <MessageSquare className="w-3.5 h-3.5 inline mr-1 text-zinc-400" />
                    留言：{item.message || '(默默守護未留字)'}
                  </p>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-0.5">
                    <span>
                      當前進度：{item.wish?.current_stardust}/{item.wish?.product_price} (
                      {item.wish?.status === 'full_funded' ? '🎉 已達標待出貨' : '集星推進中'})
                    </span>
                    <span>{new Date(item.created_at).toLocaleDateString('zh-TW')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 排行榜展示區 */}
      <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-900/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-wrap gap-2">
          <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-xl text-xs gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setHallTab('fulfilled')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                hallTab === 'fulfilled'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>圓滿引路榜</span>
            </button>
            <button
              type="button"
              onClick={() => setHallTab('inTransit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                hallTab === 'inTransit'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Hourglass className="w-3.5 h-3.5" />
              <span>在途守護榜</span>
            </button>
            <button
              type="button"
              onClick={() => setHallTab('official')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                hallTab === 'official'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>星空守護榜</span>
            </button>
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
              <div
                key={u.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                  idx === 0
                    ? 'bg-amber-500/15 border-amber-400/40 shadow-sm'
                    : idx === 1
                    ? 'bg-white/5 border-white/15'
                    : idx === 2
                    ? 'bg-amber-900/10 border-amber-600/20'
                    : 'bg-zinc-950/60 border-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-mono font-black text-sm w-5 text-center ${
                      idx === 0
                        ? 'text-amber-300'
                        : idx === 1
                        ? 'text-slate-300'
                        : idx === 2
                        ? 'text-amber-600'
                        : 'text-zinc-500'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 text-zinc-950 font-bold flex items-center justify-center text-xs shadow-inner">
                    {u.anonymous_nickname.substring(0, 1)}
                  </div>
                  <span className="font-bold text-zinc-200">{u.anonymous_nickname}</span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-amber-300 font-bold text-sm">
                    ✨ {Number(u.amount || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 ml-1">星塵</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}