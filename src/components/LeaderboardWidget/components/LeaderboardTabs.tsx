// src/components/LeaderboardWidget/components/LeaderboardTabs.tsx
import { Flame, Award, Hourglass, Sparkles, ExternalLink } from 'lucide-react';
import type { BoardTab } from '../types';

interface Props {
  activeBoard: BoardTab;
  onSelectBoard: (board: BoardTab) => void;
  onOpenHonorHall: () => void;
}

const TABS: { id: BoardTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'nearComplete', label: '臨門一腳', icon: Flame },
  { id: 'fulfilled', label: '圓滿引路榜', icon: Award },
  { id: 'inTransit', label: '在途守護榜', icon: Hourglass },
  { id: 'official', label: '星空守護榜', icon: Sparkles },
];

export function LeaderboardTabs({ activeBoard, onSelectBoard, onOpenHonorHall }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 border-b border-white/10">
      <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-white/10 p-1 rounded-xl text-xs flex-shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeBoard === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectBoard(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 text-amber-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenHonorHall}
        className="ml-auto flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-amber-200/90 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition-all cursor-pointer whitespace-nowrap"
      >
        <span>前往完整殿堂</span>
        <ExternalLink className="w-3 h-3 text-amber-300" />
      </button>
    </div>
  );
}