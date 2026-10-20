import { UserCircle, Sparkles, Plus, Award, BookOpen } from 'lucide-react';
import type { TabId } from '../types';

interface Props {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'account', label: '帳號資訊', icon: UserCircle },
  { id: 'myWishes', label: '我的心願', icon: Sparkles },
  { id: 'publish', label: '發布夢想', icon: Plus },
  { id: 'wallet', label: '星光榮譽榜', icon: Award },
  { id: 'invested', label: '追番牆', icon: BookOpen },
];

export function DashboardTabBar({ activeTab, onSelectTab }: Props) {
  return (
    <nav className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6 bg-zinc-950/60 backdrop-blur-sm">
      <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-4xl mx-auto flex-nowrap">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-3.5 border-b-2 transition-all text-xs sm:text-sm whitespace-nowrap cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'border-amber-400 text-amber-200 font-bold bg-white/5'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}