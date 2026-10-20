import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { TabId } from './types';

export function useUserDashboard(initialTab: TabId = 'account') {
  const { profile, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [showEmailVerify, setShowEmailVerify] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleLogout = useCallback(async () => {
    await logout();
    window.location.reload();
  }, [logout]);

  const handleVerified = useCallback(async () => {
    await refreshProfile();
    setShowEmailVerify(false);
  }, [refreshProfile]);

  return {
    profile,
    activeTab,
    setActiveTab,
    showEmailVerify,
    setShowEmailVerify,
    handleLogout,
    handleVerified,
  };
}