// src/useApp.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { TabId } from '@/pages/UserDashboard';

export type View = 'home' | 'dashboard' | 'admin';

export function useApp() {
  const { session, isAdmin, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  const [view, setView] = useState<View>('home');
  const [dashboardTab, setDashboardTab] = useState<TabId>('account');

  const handleOpenDashboard = useCallback(() => {
    if (session) {
      setDashboardTab('account');
      setView('dashboard');
    } else {
      openAuthModal();
    }
  }, [session, openAuthModal]);

  const handleOpenHonorHall = useCallback(() => {
    if (session) {
      setDashboardTab('wallet');
      setView('dashboard');
    } else {
      openAuthModal();
    }
  }, [session, openAuthModal]);

  const handleOpenAdmin = useCallback(() => {
    if (isAdmin || session) setView('admin');
    else openAuthModal();
  }, [isAdmin, session, openAuthModal]);

  return {
    view,
    setView,
    dashboardTab,
    session,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    handleOpenDashboard,
    handleOpenHonorHall,
    handleOpenAdmin,
  };
}