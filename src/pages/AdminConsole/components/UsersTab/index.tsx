import { Users, Loader2 } from 'lucide-react';
import { useUsersManagement } from './useUsersManagement';

export function UsersTab() {
  const { users, loading, handleToggleBan } = useUsersManagement();

  if (loading) {
    return <div className="text-center py-16 text-zinc-400 text-xs">載入用戶名冊中...</div>;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-base font-bold text-amber-200 flex items-center gap-2">
        <Users className="w-4 h-4 text-amber-400" /> 星旅人名冊與權限管理
      </h2>
      <p className="text-xs text-zinc-400">停權者將被限制發布與留言功能。</p>

      <div className="space-y-2.5">
        {users.map((u) => (
          <div key={u.id} className="glass rounded-xl p-4 flex items-center justify-between border border-white/5 bg-zinc-900/50 text-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-100 text-sm">
                  {u.anonymous_nickname || '匿名星旅人'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    u.role === 'admin'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : u.role === 'banned'
                      ? 'bg-zinc-800 text-red-400 font-black'
                      : 'bg-emerald-500/10 text-emerald-300'
                  }`}
                >
                  {u.role === 'admin' ? '管理員' : u.role === 'banned' ? '已停權' : '一般用戶'}
                </span>
                {u.is_phone_verified && (
                  <span className="text-[10px] text-emerald-400">✓ 信箱已認證</span>
                )}
              </div>
              <p className="text-zinc-500 font-mono mt-1">
                ID: {u.id} · 永久星塵: {u.wallet_balance || 0} ✨
              </p>
            </div>

            {u.role !== 'admin' && (
              <button
                onClick={() => handleToggleBan(u)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                  u.role === 'banned'
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    : 'bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25'
                }`}
              >
                {u.role === 'banned' ? '解鎖還原' : '封鎖停權'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}