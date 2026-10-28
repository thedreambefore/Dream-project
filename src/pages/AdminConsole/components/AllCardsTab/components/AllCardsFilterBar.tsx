// src/pages/AdminConsole/components/AllCardsTab/components/AllCardsFilterBar.tsx
import { Search } from 'lucide-react';
import type { WishStatus } from '@/types/wish';

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: 'all' | WishStatus;
  setStatusFilter: (v: 'all' | WishStatus) => void;
  filteredCount: number;
  totalCount: number;
}

const STATUS_OPTIONS: { id: 'all' | WishStatus; label: string }[] = [
  { id: 'all', label: '全部狀態' },
  { id: 'pending', label: '待審核' },
  { id: 'approved', label: '推進中' },
  { id: 'full_funded', label: '已達標待寄' },
  { id: 'fulfilled', label: '已完成開箱' },
  { id: 'blocked', label: '已封鎖下架' },
];

export function AllCardsFilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  filteredCount,
  totalCount,
}: Props) {
  return (
    <div className="space-y-3 bg-zinc-900/60 border border-white/5 p-4 rounded-2xl">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋商品名稱、標籤、提案人暱稱或卡片 ID..."
            className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <div className="text-xs font-mono text-zinc-400 whitespace-nowrap self-end sm:self-center">
          呈現 {filteredCount} / 全站 {totalCount} 張卡片
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar flex-nowrap pt-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setStatusFilter(opt.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
              statusFilter === opt.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-zinc-400 hover:text-white bg-zinc-950/60 border border-white/5'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}