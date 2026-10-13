// src/App.tsx
import { useState, Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Starfield } from '@/components/Starfield';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { HomePage } from '@/pages/HomePage';
import { UserDashboard, type TabId } from '@/pages/UserDashboard';
import { AdminConsole } from '@/pages/AdminConsole';
import { Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  error?: Error;
}

class SafeShield extends Component<Props, State> {
  public state: State = { hasError: false };
  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔒 夢沙防護網攔截到底層錯誤:', error, errorInfo);
  }
  public render() {
    if (this.state.hasError) {
      return (
        <div className="space-bg min-h-screen relative text-white p-12 text-center flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-amber-200 mb-2">星空微光調校中</h1>
          <p className="text-gray-400 text-xs mb-4">系統攔截到底層加載異常，請嘗試重新載入。</p>
          {this.state.error && (
            <pre className="text-left text-[11px] text-red-300 bg-red-950/40 border border-red-500/30 p-4 rounded-xl max-w-xl w-full overflow-auto mb-6 font-mono">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-xl text-xs hover:bg-amber-500/30 transition-all cursor-pointer"
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
  const { loading, session, isAdmin } = useAuth();
  const [view, setView] = useState<View>('home');
  const [showAuth, setShowAuth] = useState(false);

  // 🌟 控制打開 UserDashboard 時要預設停留在哪個分頁
  const [dashboardTab, setDashboardTab] = useState<TabId>('account');

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

  // 一般點擊 Navbar 打開個人中心
  const handleOpenDashboard = () => {
    if (session) {
      setDashboardTab('account');
      setView('dashboard');
    } else {
      setShowAuth(true);
    }
  };

  // 🌟 點擊首頁排行榜「榮譽殿堂」跳轉
  const handleOpenHonorHall = () => {
    if (session) {
      setDashboardTab('wallet'); // 指定跳轉至星光榮譽館
      setView('dashboard');
    } else {
      setShowAuth(true);
    }
  };

  const handleOpenAdmin = () => {
    if (isAdmin) setView('admin');
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
          />
          <SafeShield>
            <HomePage onOpenHonorHall={handleOpenHonorHall} />
          </SafeShield>

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
          initialTab={dashboardTab}
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
