// src/pages/AdminConsole/components/UsersTab/index.tsx
import { Users } from 'lucide-react';
import { useUsersManagement } from './useUsersManagement';
import { UserCardList } from './components/UserCardList';

export function UsersTab() {
  const { users, loading, handleToggleBan } = useUsersManagement();

  if (loading) return <div className="text-center py-16 text-zinc-400 text-xs">載入用戶名冊中...</div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-amber-200 flex items-center gap-2"><Users className="w-4 h-4 text-amber-400" /> 星旅人名冊與權限管理</h2>
        <p className="text-xs text-zinc-400 mt-0.5">停權者將被限制發布與留言功能。</p>
      </div>
      <UserCardList users={users} onToggleBan={handleToggleBan} />
    </div>
  );
}

export default UsersTab;