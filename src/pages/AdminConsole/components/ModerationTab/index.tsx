// src/pages/AdminConsole/components/ModerationTab/index.tsx
import { PackageCheck, Flag, Mail, Package, Loader2 } from 'lucide-react';
import { useModeration, type ModerationSubTab } from './useModeration';
import { ShippingModal } from './ShippingModal';
import { LetterReviewList } from './components/LetterReviewList';
import { FulfilledShippingList } from './components/FulfilledShippingList';
import { ReportedList } from './components/ReportedList';

const SUB_TABS: { id: ModerationSubTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'reported', label: '檢舉待查', icon: Flag },
  { id: 'letters', label: '感謝信審核', icon: Mail },
  { id: 'fulfilled', label: '滿額待出貨', icon: Package },
];

export function ModerationTab() {
  const m = useModeration();

  if (m.loading) {
    return <div className="text-center py-16 text-zinc-400 text-xs flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-amber-300" /> 載入審查中心...</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-base font-bold text-amber-200 flex items-center gap-2"><PackageCheck className="w-4 h-4 text-amber-400" /> 卡片巡檢與出貨台</h2>
        <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl gap-1 overflow-x-auto hide-scrollbar flex-nowrap">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const count = tab.id === 'reported' ? m.reportedWishes.length : tab.id === 'letters' ? m.pendingLetters.length : m.fulfilledWishes.length;
            return (
              <button key={tab.id} onClick={() => m.setSubTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${m.subTab === tab.id ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'text-zinc-400 hover:text-white'}`}>
                <Icon className="w-3.5 h-3.5 flex-shrink-0" /><span>{tab.label} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {m.subTab === 'letters' && <LetterReviewList pendingLetters={m.pendingLetters} onApprove={m.handleApproveLetter} onReject={m.handleRejectLetter} />}
      {m.subTab === 'fulfilled' && <FulfilledShippingList fulfilledWishes={m.fulfilledWishes} onOpenShipping={m.handleOpenShippingModal} />}
      {m.subTab === 'reported' && <ReportedList reportedWishes={m.reportedWishes} onDismiss={m.handleDismissReport} onBlock={m.handleConfirmBlock} />}

      {m.shippingStory && <ShippingModal shippingStory={m.shippingStory} investmentsList={m.investmentsList} loadingInvestments={m.loadingInvestments} onClose={() => m.setShippingStory(null)} onSuccess={() => { m.setShippingStory(null); m.loadStories(); }} />}
    </div>
  );
}

export default ModerationTab;