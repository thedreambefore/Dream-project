import { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Starfield } from '@/components/Starfield';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { HomePage } from '@/pages/HomePage';
import { UserDashboard } from '@/pages/UserDashboard';
import { AdminConsole } from '@/pages/AdminConsole';
import { usePublicData } from '@/hooks/usePublicData';
import { Shield } from 'lucide-react';

type View = 'home' | 'dashboard' | 'admin';

function AppContent() {
  const { loading, session, profile } = useAuth();
  const { announcement } = usePublicData();
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
          <HomePage />

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
