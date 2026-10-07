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

// 🛡️ 錯誤防護盾牌 (Error Boundary) - 修正：移除未定義的變數引用
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
      return (
        <div className="space-bg min-h-screen relative text-white p-24 text-center">
          <h1 className="text-3xl font-bold text-amber-200 mb-4">星空微光調校中</h1>
          <p className="text-gray-400 text-sm mb-6">部分星塵資料正在同步，請稍候重新載入。</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-xl text-sm"
          >
            重新連結星空
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

type View = 'home' | 'dashboard' | 'admin';

function AppContent() {
  const { loading, session, profile } = useAuth();
  
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
            announcement={
              announcement 
                ? (typeof announcement === 'object' 
                    ? ((announcement as any).content || (announcement as any).text || (announcement as any).title || JSON.stringify(announcement)) 
                    : String(announcement))
                : null
            }
          />
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
