import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  // 🌟 核心修正：從 useAuth() 中準確解構出 session, profile, loading 與 logout
  const { session, profile, loading, logout } = useAuth();

  if (loading) return <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse" />;

  // 處理登出點擊
  const handleLogoutClick = async () => {
    await logout(); // 呼叫您 Context 封裝好的真實登出
    window.location.reload(); // 強制全頁刷新，清空所有暫存
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-zinc-950">
      <div className="text-white font-bold">夢沙 DreamSand</div>

      <div className="flex items-center gap-4">
        
        {/* 🌟 修正一：管理員雷達，讀取 profile.role */}
        {profile?.role === 'admin' && (
          <button 
            onClick={() => window.location.href = '/admin'} 
            className="bg-red-950/60 border border-red-500/50 text-red-200 text-xs px-3 py-1.5 rounded-xl font-bold animate-pulse"
          >
            🛠️ 進入管理總後台
          </button>
        )}

        {/* 🌟 修正二：身分識別改看 session 是否存在 */}
        {session ? (
          <div className="flex items-center gap-3">
            {/* 顯示您 Table 裡的真實暱稱與錢包餘額 */}
            <div className="text-right">
              <p className="text-zinc-200 text-sm font-medium">{profile?.real_name || '星旅人'}</p>
              <p className="text-amber-400 text-xs">✨ {profile?.wallet_balance ?? 0} 星塵</p>
            </div>
            
            {/* 登出按鈕 */}
            <button 
              onClick={handleLogoutClick} 
              className="text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              登出
            </button>
          </div>
        ) : (
          <button className="bg-amber-500 text-gray-900 text-sm font-bold px-4 py-2 rounded-xl">
            點燃星塵
          </button>
        )}
      </div>
    </nav>
  );
}
