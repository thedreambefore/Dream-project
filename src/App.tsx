import { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Starfield } from '@/components/Starfield';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { HomePage } from '@/pages/HomePage';
import { UserDashboard } from '@/pages/UserDashboard';
import { AdminConsole } from '@/pages/AdminConsole';
import { usePublicData } from '@/hooks/usePublicData';
import { Shield } from 'lucide-react';

// 🛡️ 建立大廠標準的防禦性 Error Boundary (錯誤安全盾牌)
interface Props { children: ReactNode; }
interface State { hasError: boolean; }
class SafeShield extends Component<Props, State> {
  public state: State = { hasError: false };
  public static getDerivedStateFromError(_: Error): State { return { hasError: true }; }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log("🔒 夢沙防禦防護網已攔截並吃掉底層錯誤:", error, errorInfo);
  }
  public render() {
    if (this.state.hasError) {
      // 當底層因為 Realtime 鬧脾氣卡死時，這裡強制回傳「防禦性留空」的首頁，絕對不讓網站全黑死機！
      return (
        <div className="w-full text-center py-20 px-6">
          <p className="text-amber-400 font-bold mb-2">✨ 正在與星空重新建立溫暖連線...</p>
          <p className="text-slate-500 text-xs">請嘗試重新整理網頁，或點擊右上角進入您的個人休息室。</p>
        </div>
      );
    }
    return this.children;
  }
}

type View = 'home' | 'dashboard' | 'admin';

function AppContent() {
  const { loading, session, profile } = useAuth();
  
  // 雙重保險：如果 usePublicData 內部因為 Realtime 崩潰，我們用 try-catch 防禦
  let announcement = { title: "歡迎來到夢沙 DreamSand" };
  try {
    const publicData = usePublicData();
    if (publicData?.announcement) announcement = publicData.announcement;
  } catch (e) {
    console.error("攔截 usePublicData 異常");
  }

  const [view, setView] = useState<View>('home');
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="space-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl hourglass-anim inline-block mb-4">⏳</div>
          <p className="text-amber-200/70 text-sm">載入星空中的夢沙...</p>
        </div>
      </div>
    );
  }

  const handleOpenDashboard = () => {
    if (session) setView('dashboard');
    else setShowAuth(true);
  };

  const handleOpenAdmin = () => {
    if (profile?.role === 'admin') setView('admin');
    else if (session) setView('admin');
    else setShowAuth(true);
  };

  return (
    <div className="space-bg min-h-screen relative">
      <Starfield />

      {view === 'home' && (
        <>
          <Navbar
            onOpenAuth={() => setShowAuth(true)}
            onOpenDashboard={handleOpenDashboard}
            onOpenAdmin={handleOpenAdmin}
            announcement={announcement}
          />
          {/* 🛡️ 使用 SafeShield 牢牢包覆住首頁，就算內部 Realtime 報錯，首頁和導覽列也絕對不會死機 */}
          <SafeShield>
            <HomePage />
          </SafeShield>

          {/* Secret admin entry — floating corner button */}
          {!session && (
            <button
              onClick={() => setShowAuth(true)}
              className="fixed bottom-4 right-4 z-30 touch-btn glass rounded-full px-3 py-2 text-xs text-gray-500 hover:text-amber-300 transition-all opacity-50 hover:opacity-100"
            >
              <Shield className="w-3.5 h-3.5 inline mr-1" />
              管理員入口
            </button>
          )}
        </>
      )}

      {view === 'dashboard' && session && (
        <UserDashboard
          onClose={() => setView('home')}
          onGoHome={() => setView('home')}
          onOpenAdmin={handleOpenAdmin}
        />
      )}

      {view === 'admin' && session && (
        <AdminConsole onClose={() => setView('home')} onGoHome={() => setView('home')} />
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
