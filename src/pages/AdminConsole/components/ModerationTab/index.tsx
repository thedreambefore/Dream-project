import { PackageCheck, Flag, Mail, Package, Globe, Loader2 } from 'lucide-react';
import { isBlockedStatus } from '@/lib/backend';
import { useModeration, type ModerationSubTab } from './useModeration';
import { ShippingModal } from './ShippingModal';

const SUB_TABS: { id: ModerationSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'reported', label: '檢舉待查', icon: Flag },
  { id: 'letters', label: '感謝信審核', icon: Mail },
  { id: 'fulfilled', label: '滿額待出貨', icon: Package },
  { id: 'all', label: '全站卡片', icon: Globe },
];

export function ModerationTab() {
  const {
    stories,
    loading,
    subTab,
    setSubTab,
    reportedWishes,
    pendingLetters,
    fulfilledWishes,
    shippingStory,
    setShippingStory,
    investmentsList,
    loadingInvestments,
    loadStories,
    handleApproveLetter,
    handleRejectLetter,
    handleOpenShippingModal,
    handleDismissReport,
    handleConfirmBlock,
    handleUnblock,
  } = useModeration();

  if (loading) {
    return (
      <div className="text-center py-16 text-zinc-400 text-xs flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
        載入審查中心...
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
          <PackageCheck className="w-4 h-4 text-amber-400" /> 卡片巡檢與出貨台
        </h2>

        <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl gap-1 overflow-x-auto hide-scrollbar flex-nowrap">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'reported'
                ? reportedWishes.length
                : tab.id === 'letters'
                ? pendingLetters.length
                : tab.id === 'fulfilled'
                ? fulfilledWishes.length
                : stories.length;
            const isActive = subTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  {tab.label} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {subTab === 'letters' && (
        <div className="space-y-3">
          {pendingLetters.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">
              目前無待審核的開箱感謝信。
            </div>
          ) : (
            pendingLetters.map((story) => (
              <div key={story.id} className="glass rounded-2xl p-5 border border-purple-500/30 bg-purple-950/10 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                      創作者已提交開箱信待審
                    </span>
                    <h3 className="font-bold text-amber-100 text-sm mt-2">{story.product_name}</h3>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleRejectLetter(story.id)}
                      className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-xs font-bold hover:bg-red-500/30 cursor-pointer"
                    >
                      駁回修改
                    </button>
                    <button
                      onClick={() => handleApproveLetter(story.id)}
                      className="px-3 py-1.5 bg-purple-500 text-zinc-950 font-bold rounded-lg text-xs hover:bg-purple-400 cursor-pointer"
                    >
                      審核通過並公開
                    </button>
                  </div>
                </div>

                {story.unboxing_photo_url && (
                  <div className="h-44 max-w-sm rounded-xl overflow-hidden border border-white/10">
                    <img src={story.unboxing_photo_url} alt="開箱照" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-zinc-200 leading-relaxed">
                  <p className="font-bold text-zinc-400 mb-1">【創作者感謝信內文】</p>
                  {story.thank_you_letter || '(無內文)'}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'fulfilled' && (
        <div className="space-y-3">
          {fulfilledWishes.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">
              目前暫無滿額待出貨項目。
            </div>
          ) : (
            fulfilledWishes.map((story) => (
              <div key={story.id} className="glass rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/15 flex justify-between items-center gap-4">
                <div>
                  <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    活動 100% 達成
                  </span>
                  <h3 className="font-bold text-amber-100 text-sm mt-2">{story.product_name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                    累積總額: NT$ {story.current_stardust.toLocaleString()} / NT$ {story.product_price.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {story.product_url && (
                    <a
                      href={story.product_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700 flex items-center gap-1 cursor-pointer"
                    >
                      查看商品
                    </a>
                  )}
                  <button
                    onClick={() => handleOpenShippingModal(story)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" /> 審核留言並確認出貨
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'reported' && (
        <div className="space-y-3">
          {reportedWishes.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">
              目前無被檢舉卡片。
            </div>
          ) : (
            reportedWishes.map((story) => (
              <div key={story.id} className="glass rounded-2xl p-4 border border-red-500/30 bg-red-950/15 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-amber-100 text-sm">{story.product_name}</h4>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleDismissReport(story.id)}
                      className="px-2.5 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-lg cursor-pointer"
                    >
                      駁回檢舉
                    </button>
                    <button
                      onClick={() => handleConfirmBlock(story.id, story.report_reason || '檢舉違規')}
                      className="px-2.5 py-1 text-xs bg-red-500 text-white font-bold rounded-lg cursor-pointer"
                    >
                      確認下架
                    </button>
                  </div>
                </div>
                <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded-lg">
                  檢舉理由：{story.report_reason || '內容不符規範'}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'all' && (
        <div className="space-y-3">
          {stories.map((story) => (
            <div key={story.id} className="glass rounded-xl p-4 flex justify-between items-center border border-white/5 bg-zinc-900/40 text-xs">
              <div>
                <p className="font-bold text-sm text-amber-100">{story.product_name}</p>
                <p className="text-zinc-500 font-mono mt-0.5">
                  狀態: {story.status} · 進度: {story.current_stardust}/{story.product_price}
                </p>
              </div>
              <div className="flex-shrink-0">
                {isBlockedStatus(story.status) ? (
                  <button
                    onClick={() => handleUnblock(story.id)}
                    className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg cursor-pointer"
                  >
                    解除封鎖
                  </button>
                ) : (
                  <button
                    onClick={() => handleConfirmBlock(story.id, '手動封鎖')}
                    className="px-2.5 py-1 bg-red-500/20 text-red-300 rounded-lg cursor-pointer"
                  >
                    封鎖
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {shippingStory && (
        <ShippingModal
          shippingStory={shippingStory}
          investmentsList={investmentsList}
          loadingInvestments={loadingInvestments}
          onClose={() => setShippingStory(null)}
          onSuccess={() => {
            setShippingStory(null);
            loadStories();
          }}
        />
      )}
    </div>
  );
}