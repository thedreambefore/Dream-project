// src/pages/UserDashboard/components/InvestedTab/components/InvestedGrid.tsx
import { WishCard } from '@/components/WishCard';
import type { Wish } from '@/types/wish';

interface Props {
  filtered: Wish[];
  hasFilter: boolean;
}

export function InvestedGrid({ filtered, hasFilter }: Props) {
  if (filtered.length === 0) {
    return (
      <div className="text-center py-20 border border-white/5 rounded-2xl bg-zinc-900/30 text-zinc-500 text-xs">
        {hasFilter
          ? '在此交叉條件下暫無追番心願，請嘗試調整上方過濾條件。'
          : '您目前尚未追番或支持過任何心願，快去首頁探索吧！'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((w, idx) => (
        <WishCard key={w.id} wish={w} index={idx} variant="tracked" />
      ))}
    </div>
  );
}