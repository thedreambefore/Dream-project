// src/App.tsx
import { AuthProvider } from '@/context/AuthContext';
import { Starfield } from '@/components/Starfield';
import { Navbar } from '@/components/Navbar';
import { AuthModal } from '@/components/AuthModal';
import { SafeShield } from '@/components/SafeShield';
import { AdminFloatingAlert } from '@/components/AdminFloatingAlert';
import { HomePage } from '@/pages/HomePage';
import { UserDashboard } from '@/pages/UserDashboard';
import { AdminConsole } from '@/pages/AdminConsole';
import { useApp } from './useApp';

function AppContent() {
  const app = useApp();

  return (
    <div className="space-bg min-h-screen relative">
      <Starfield />

      {app.view === 'home' && (
        <>
          <Navbar onOpenAuth={app.openAuthModal} onOpenDashboard={app.handleOpenDashboard} onOpenAdmin={app.handleOpenAdmin} />
          <SafeShield><HomePage onOpenHonorHall={app.handleOpenHonorHall} /></SafeShield>
        </>
      )}

      {app.view === 'dashboard' && app.session && (
        <UserDashboard initialTab={app.dashboardTab} onClose={() => app.setView('home')} onGoHome={() => app.setView('home')} onOpenAdmin={app.handleOpenAdmin} />
      )}

      {app.view === 'admin' && app.session && (
        <AdminConsole initialTab={app.adminInitialTab} onClose={() => app.setView('home')} onGoHome={() => app.setView('home')} />
      )}

      {/* 🌟 管理員全域審核懸浮提醒器 */}
      {app.isAdmin && app.view !== 'admin' && (
        <AdminFloatingAlert onOpenAdminWithTab={app.handleOpenAdminWithTab} />
      )}

      {app.isAuthModalOpen && <AuthModal onClose={app.closeAuthModal} />}
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