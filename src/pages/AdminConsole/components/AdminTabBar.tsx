// src/pages/AdminConsole/components/AdminTabBar.tsx
import { CheckCircle2, PackageCheck, Users, Layers, Megaphone, Tag } from 'lucide-react';
import type { AdminTab } from '../types';

interface Props {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
}

const TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'pending', label: '待審核心願', icon: CheckCircle2 },
  { id: 'moderation', label: '巡檢與出貨', icon: PackageCheck },
  { id: 'users', label: '星旅人名冊', icon: Users },
  { id: 'allCards', label: '全站卡片庫', icon: Layers },
  { id: 'announcements', label: '公告廣播部署', icon: Megaphone },
  { id: 'tags', label: '標籤庫管理', icon: Tag },
];

export function AdminTabBar({ activeTab, onSelectTab }: Props) {
  return (
    <nav className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6 bg-zinc-950/60 backdrop-blur-sm">
      <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-5xl mx-auto flex-nowrap">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap text-xs sm:text-sm font-medium cursor-pointer flex-shrink-0 ${
                isActive
                  ? 'border-amber-400 text-amber-200 font-bold bg-white/5'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-shrink-0">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}