// src/useApp.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { TabId } from '@/pages/UserDashboard';
import type { AdminTab } from '@/pages/AdminConsole/types';

export type View = 'home' | 'dashboard' | 'admin';

export function useApp() {
  const { session, isAdmin, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuth();
  const [view, setView] = useState<View>('home');
  const [dashboardTab, setDashboardTab] = useState<TabId>('account');
  const [adminInitialTab, setAdminInitialTab] = useState<AdminTab>('pending');

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
    if (isAdmin || session) {
      setAdminInitialTab('pending');
      setView('admin');
    } else {
      openAuthModal();
    }
  }, [isAdmin, session, openAuthModal]);

  // 🌟 點擊懸浮提示直接跳轉至指定審核頁籤
  const handleOpenAdminWithTab = useCallback((targetTab: AdminTab) => {
    setAdminInitialTab(targetTab);
    setView('admin');
  }, []);

  return {
    view,
    setView,
    dashboardTab,
    adminInitialTab,
    session,
    isAdmin,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    handleOpenDashboard,
    handleOpenHonorHall,
    handleOpenAdmin,
    handleOpenAdminWithTab,
  };
}