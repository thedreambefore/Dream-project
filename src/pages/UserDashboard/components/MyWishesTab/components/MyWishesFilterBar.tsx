// src/pages/UserDashboard/components/MyWishesTab/components/MyWishesFilterBar.tsx
import { Hourglass, FileText, CheckCircle2, Ban } from 'lucide-react';
import type { MyWishesFilter } from '../useMyWishes';

interface Props {
  filterTag: MyWishesFilter;
  onSelectFilter: (tag: MyWishesFilter) => void;
}

const FILTER_BUTTONS: { id: MyWishesFilter; label: string; icon: React.ComponentType<{ className?: string }> | null }[] = [
  { id: 'all', label: '全部', icon: null },
  { id: 'approved', label: '推進中', icon: Hourglass },
  { id: 'pending', label: '審核中', icon: FileText },
  { id: 'fulfilled', label: '已達成', icon: CheckCircle2 },
  { id: 'blocked', label: '已駁回', icon: Ban },
];

export function MyWishesFilterBar({ filterTag, onSelectFilter }: Props) {
  return (
    <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl text-xs gap-1 overflow-x-auto hide-scrollbar">
      {FILTER_BUTTONS.map((tab) => {
        const TabIcon = tab.icon;
        const isActive = filterTag === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectFilter(tab.id)}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {TabIcon && <TabIcon className="w-3 h-3" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}