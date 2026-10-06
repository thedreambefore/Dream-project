import { useAuth } from '@/context/AuthContext';

// 🌟 完美定義型別介面，徹底對齊 App.tsx 傳進來的所有 Props
interface NavbarProps {
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  announcement?: string | null;
}

export function Navbar({ onOpenAuth, onOpenDashboard, onOpenAdmin, announcement }: NavbarProps) {
  // 🚀 從您的 AuthContext 中，精確拿取完全對齊的 session, profile 與小寫 logout
  const { session, profile, logout } = useAuth();

  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發外層的點擊事件
    try {
      await logout(); 
      window.location.reload(); // 強制全頁刷新，清空所有暫存
    } catch (err) {
      console.error('登出遭遇意外:', err);
    }
  };

  return (
    <header className="w-full z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 sticky top-0">
      {/* 跑馬燈公告（當有公告資料時動態亮起） */}
      {announcement && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-600/20 to-amber-500/20 text-amber-200 text-center py-1.5 text-xs border-b border-amber-500/10 font-medium">
          📢 {announcement}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 左側標題：點擊可回首頁 */}
        <div className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xl">⏳</span>
          <span className="text-lg font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent glow-text">
            夢沙 DreamSand
          </span>
        </div>

        {/* 右側按鈕控制區 */}
        <div className="flex items-center gap-4">
          
          {/* 🛠️ 管理員雷達：若 role 是 admin，亮起管理入口並對接 onOpenAdmin */}
          {profile?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="touch-btn bg-red-950/50 border border-red-500/40 text-red-200 text-xs px-3 py-1.5 rounded-xl font-bold transition-all hover:bg-red-900/50 shadow-lg shadow-red-500/5"
            >
              🛠️ 管理總後台
            </button>
          )}

          {/* 🔐 身分識別：根據雲端 session 是否存在來切換 */}
          {session ? (
            <div className="flex items-center gap-4">
              {/* 點擊整個區塊，順暢開啟 UserDashboard 畫面 */}
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
                
                {/* 漂亮的大頭貼視覺細節 */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border border-amber-300/30 flex items-center justify-center text-gray-900 font-bold text-xs shadow-inner">
                  {(profile?.real_name || '星')[0].toUpperCase()}
                </div>
              </div>

              {/* 獨立登出按鈕 */}
              <button
                onClick={handleLogoutClick}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline transition-colors"
              >
                登出
              </button>
            </div>
          ) : (
            // 未登入狀態：開啟 AuthModal 彈窗
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
