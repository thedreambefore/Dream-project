import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { AdminTab } from './types';

export function useAdminConsole(onClose: () => void) {
  const { profile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('pending');

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