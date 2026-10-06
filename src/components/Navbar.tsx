import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  announcement?: string | null;
}

export function Navbar({ onOpenAuth, onOpenDashboard, onOpenAdmin, announcement }: NavbarProps) {
  // 🚀 引入雷達，確保在 loading 狀態下也有安全防禦
  const { session, profile, logout, loading } = useAuth();

  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻斷冒泡，防止點擊登出卻誤觸開啟 Dashboard
    try {
      await logout(); 
      window.location.reload(); 
    } catch (err) {
      console.error('登出遭遇意外:', err);
    }
  };

  // 🌟 防黑屏第一道防線：如果 Auth 核心還在載入，導覽列維持深色底，不進行任何危險的狀態渲染
  if (loading) {
    return (
      <header className="w-full h-16 bg-zinc-950 border-b border-white/5 sticky top-0 flex items-center justify-between px-4">
        <div className="text-lg font-bold text-zinc-600 select-none">⏳ 夢沙 DreamSand</div>
        <div className="w-20 h-8 rounded-xl bg-zinc-900 animate-pulse" />
      </header>
    );
  }

  return (
    <header className="w-full z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 sticky top-0">
      {/* 跑馬燈公告 */}
      {announcement && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-600/20 to-amber-500/20 text-amber-200 text-center py-1.5 text-xs border-b border-amber-500/10 font-medium">
          📢 {announcement}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 左側標題 */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xl">⏳</span>
          <span className="text-lg font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent glow-text">
            夢沙 DreamSand
          </span>
        </div>

        {/* 右側互動區 */}
        <div className="flex items-center gap-4">
          
          {/* 管理員入口雷達 */}
          {profile?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="touch-btn bg-red-950/50 border border-red-500/40 text-red-200 text-xs px-3 py-1.5 rounded-xl font-bold transition-all hover:bg-red-900/50 shadow-lg shadow-red-500/5"
            >
              🛠️ 管理總後台
            </button>
          )}

          {/* 🔐 身分識別控制流 */}
          {session ? (
            <div className="flex items-center gap-4">
              {/* 點擊整塊復原：開啟個人儀表板 (UserDashboard) */}
              <div 
                onClick={onOpenDashboard}
                className="flex items-center gap-3 cursor-pointer group select-none bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div className="text-right">
                  <p className="text-zinc-200 text-sm font-medium group-hover:text-amber-300 transition-colors">
                    {profile?.real_name || '星旅人'}
                  </p>
                  <p className="text-amber-400 text-xs font-mono">
                    ✨ {profile?.wallet_balance ?? 0} 星塵
                  </p>
                </div>
                
                {/* 大頭貼視覺細節修正：採用極安全的字串擷取，絕不閃退 */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border border-amber-300/30 flex items-center justify-center text-gray-900 font-bold text-xs shadow-inner">
                  {String(profile?.real_name || '星').substring(0, 1)}
                </div>
              </div>

              {/* 登出按鈕 */}
              <button
                onClick={handleLogoutClick}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
              >
                登出
              </button>
            </div>
          ) : (
            // 未登入：開啟點燃星塵彈窗
            <button
              onClick={onOpenAuth}
              className="touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 text-sm font-bold px-4 py-2 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all shadow-lg shadow-amber-500/10"
            >
              點燃星塵
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
