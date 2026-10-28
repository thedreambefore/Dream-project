// src/pages/AdminConsole/useAdminConsole.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { AdminTab } from './types';

export function useAdminConsole(initialTab: AdminTab = 'pending', onClose: () => void) {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleSignOut = useCallback(async () => {
    await logout();
    onClose();
  }, [logout, onClose]);

  const isAdmin = profile?.role === 'admin';

  return {
    isAdmin,
    activeTab,
    setActiveTab,
    handleSignOut,
  };
}