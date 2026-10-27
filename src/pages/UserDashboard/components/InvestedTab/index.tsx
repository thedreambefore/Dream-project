// src/pages/UserDashboard/components/InvestedTab/index.tsx
import { BookOpen } from 'lucide-react';
import { useInvested } from './useInvested';
import { InvestedFilterBar } from './components/InvestedFilterBar';
import { InvestedGrid } from './components/InvestedGrid';

export function InvestedTab() {
  const inv = useInvested();

  if (inv.loading) {
    return <div className="text-center py-16 text-zinc-500 text-xs">正在探尋您的追番心願牆...</div>;
  }

  const hasFilter = Boolean(inv.searchTerm || inv.sourceFilter !== 'all' || inv.statusFilter !== 'all');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-300" /> 心願追番結局牆
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          點擊卡片翻面即可重溫初衷；點擊背面按鈕可開啟專屬加油漂流瓶與主角開箱信！
        </p>
      </div>

      <InvestedFilterBar
        searchTerm={inv.searchTerm} setSearchTerm={inv.setSearchTerm}
        sourceFilter={inv.sourceFilter} setSourceFilter={inv.setSourceFilter}
        statusFilter={inv.statusFilter} setStatusFilter={inv.setStatusFilter}
      />

      <InvestedGrid filtered={inv.filtered} hasFilter={hasFilter} />
    </div>
  );
}

export default InvestedTab;