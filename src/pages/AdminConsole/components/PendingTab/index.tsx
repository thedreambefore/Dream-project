// src/pages/AdminConsole/components/PendingTab/index.tsx
import { CheckCircle2, Loader2 } from 'lucide-react';
import { usePendingWishes } from './usePendingWishes';
import { PendingCardList } from './components/PendingCardList';

export function PendingTab() {
  const p = usePendingWishes();

  if (p.loading) {
    return <div className="text-center py-16 text-zinc-400 text-xs flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin text-amber-300" /> 載入待審核心願...</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-amber-200 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400" /> 人工審核工作台</h2>
          <p className="text-xs text-zinc-400 mt-0.5">星旅人提交的心願預設為待審，審核商品連結與承諾通過後正式上架。</p>
        </div>
        <span className="text-xs font-mono bg-amber-500/10 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full flex-shrink-0">待審核：{p.stories.length} 件</span>
      </div>

      <PendingCardList stories={p.stories} onApprove={p.handleApprove} onReject={p.handleReject} />
    </div>
  );
}

export default PendingTab;