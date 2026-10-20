// src/pages/AdminConsole/index.tsx
import { AlertTriangle } from 'lucide-react';
import { AdminHeader } from './components/AdminHeader';
import { AdminTabBar } from './components/AdminTabBar';
import { PendingTab } from './components/PendingTab';
import { ModerationTab } from './components/ModerationTab';
import { UsersTab } from './components/UsersTab';
import { AnnouncementsTab } from './components/AnnouncementsTab';
import { TagsTab } from './components/TagsTab';
import { useAdminConsole } from './useAdminConsole';
import type { AdminConsoleProps } from './types';

export function AdminConsole({ onClose, onGoHome }: AdminConsoleProps) {
  const { isAdmin, activeTab, setActiveTab, handleSignOut } = useAdminConsole(onClose);

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-50 space-bg flex items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 text-center max-w-sm border border-red-500/30">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-300 mb-2">權限不足</h2>
          <p className="text-xs text-zinc-400 mb-4">此核心區域僅限星空管理團隊存取</p>
          <button
            onClick={onGoHome}
            className="w-full bg-amber-500/15 border border-amber-400/30 text-amber-200 rounded-xl py-2.5 text-xs font-bold hover:bg-amber-500/25 transition-all cursor-pointer"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 space-bg overflow-y-auto bg-zinc-950 text-white select-none">
      <AdminHeader onGoHome={onGoHome} onClose={onClose} onLogout={handleSignOut} />
      <AdminTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'pending' && <PendingTab />}
        {activeTab === 'moderation' && <ModerationTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'announcements' && <AnnouncementsTab />}
        {activeTab === 'tags' && <TagsTab />}
      </main>
    </div>
  );
}