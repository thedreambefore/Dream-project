// src/pages/AdminConsole/components/AllCardsTab/index.tsx
import { Layers, Loader2 } from 'lucide-react';
import { useAllCards } from './useAllCards';
import { AllCardsFilterBar } from './components/AllCardsFilterBar';
import { AllCardsGrid } from './components/AllCardsGrid';

export function AllCardsTab() {
  const c = useAllCards();

  if (c.loading) {
    return (
      <div className="py-20 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
        正在調度全站星空卡片庫...
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-amber-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-300" /> 全站心願卡牌資料庫
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">即時檢索全站卡牌狀態、星塵累積情況，可翻面進行管理員處置。</p>
      </div>
      <AllCardsFilterBar
        searchTerm={c.searchTerm} setSearchTerm={c.setSearchTerm}
        statusFilter={c.statusFilter} setStatusFilter={c.setStatusFilter}
        filteredCount={c.filteredWishes.length} totalCount={c.totalCount}
      />
      <AllCardsGrid wishes={c.filteredWishes} onCardDeleted={c.handleCardDeleted} />
    </div>
  );
}

export default AllCardsTab;