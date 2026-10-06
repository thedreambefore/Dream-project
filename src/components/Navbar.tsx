import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenDashboard: () => void;
  onOpenAdmin: () => void;
  announcement?: string | null;
}

export function Navbar({ onOpenAuth, onOpenDashboard, onOpenAdmin, announcement }: NavbarProps) {
  // 🚀 引入 AuthContext 狀態
  const { session, profile, logout, loading } = useAuth();

  const handleLogoutClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻斷冒泡
    try {
      await logout(); 
      window.location.reload(); 
    } catch (err) {
      console.error('登出遭遇意外:', err);
    }
  };

  // 🔥 防黑屏第一道防線：載入中或 session 還在初始化的時間差，絕對不渲染任何可能崩潰的物件狀態！
  if (loading) {
    return (
      <header className="w-full h-16 bg-zinc-950 border-b border-white/5 sticky top-0 flex items-center justify-between px-4">
        <div className="text-sm font-bold text-zinc-600">⏳ 夢沙 DreamSand...</div>
        <div className="w-20 h-8 rounded-xl bg-zinc-900/50 animate-pulse" />
      </header>
    );
  }

  // 🔥 防黑屏第二道防線：將公告轉為純字串渲染，防範未然
  const safeAnnouncement = typeof announcement === 'string' ? announcement : null;

  return (
    <header className="w-full z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 sticky top-0">
      {safeAnnouncement && (
        <div className="bg-gradient-to-r from-amber-500/20 via-yellow-600/20 to-amber-500/20 text-amber-200 text-center py-1.5 text-xs border-b border-amber-500/10 font-medium">
          📢 {safeAnnouncement}
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
          
          {/* 管理員入口（確保只讀取字串 role） */}
          {profile && typeof profile === 'object' && profile.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="touch-btn bg-red-950/50 border border-red-500/40 text-red-200 text-xs px-3 py-1.5 rounded-xl font-bold transition-all hover:bg-red-900/50 shadow-lg"
            >
              🛠️ 管理總後台
            </button>
          )}

          {/* 🔐 身分識別控制流：確保只看 session 是否存在，絕不把 session 物件本身拿去渲染 */}
          {session ? (
            <div className="flex items-center gap-4">
              {/* 點擊開啟個人儀表板 */}
              <div 
                onClick={onOpenDashboard}
                className="flex items-center gap-3 cursor-pointer group select-none bg-white/5 border border-white/10 px-3 py-1.5 rounded-2xl hover:bg-white/10 transition-all"
              >
                <div className="text-right">
                  {/* 🌟 嚴格防爆：確保背後渲染的是純文字（.real_name）或數字（.wallet_balance），絕對不直接塞 profile */}
                  <p className="text-zinc-200 text-sm font-medium group-hover:text-amber-300 transition-colors">
                    {typeof profile?.real_name === 'string' ? profile.real_name : '星旅人'}
                  </p>
                  <p className="text-amber-400 text-xs font-mono">
                    ✨ {typeof profile?.wallet_balance === 'number' ? profile.wallet_balance : 0} 星塵
                  </p>
                </div>
                
                {/* 大頭貼 */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 border border-amber-300/30 flex items-center justify-center text-gray-900 font-bold text-xs shadow-inner">
                  {typeof profile?.real_name === 'string' ? profile.real_name.substring(0, 1) : '星'}
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
            // 未登入狀態
            <button
              onClick={onOpenAuth}
              className="touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 text-sm font-bold px-4 py-2 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all shadow-lg"
            >
              點燃星塵
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
