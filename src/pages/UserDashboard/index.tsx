// src/pages/UserDashboard/index.tsx
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardTabBar } from './components/DashboardTabBar';
import { AccountTab } from './components/AccountTab';
import { PublishTab } from './components/PublishTab';
import { WalletTab } from './components/WalletTab';
import { MyWishesTab } from './components/MyWishesTab';
import { InvestedTab } from './components/InvestedTab';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';
import { useUserDashboard } from './useUserDashboard';
import type { UserDashboardProps } from './types';

export type { TabId } from './types';

export function UserDashboard({ onClose, onGoHome, onOpenAdmin, initialTab = 'account' }: UserDashboardProps) {
  const { profile, activeTab, setActiveTab, showEmailVerify, setShowEmailVerify, handleLogout, handleVerified } =
    useUserDashboard(initialTab);

  return (
    <div className="fixed inset-0 z-50 space-bg overflow-y-auto bg-zinc-950 text-white select-none">
      <DashboardHeader
        onGoHome={onGoHome}
        onClose={onClose}
        onLogout={handleLogout}
        onOpenAdmin={onOpenAdmin}
        isAdmin={profile?.role === 'admin'}
      />
      <DashboardTabBar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'myWishes' && <MyWishesTab />}
        {activeTab === 'publish' && <PublishTab onRequireVerify={() => setShowEmailVerify(true)} />}
        {activeTab === 'wallet' && <WalletTab />}
        {activeTab === 'invested' && <InvestedTab />}
      </main>

      {showEmailVerify && (
        <EmailVerificationModal onClose={() => setShowEmailVerify(false)} onVerified={handleVerified} />
      )}
    </div>
  );
}