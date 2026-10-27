// src/components/Navbar/useNavbar.ts
import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useNavbar() {
  const { session, profile, logout, loading } = useAuth();

  const handleLogoutClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await logout();
        window.location.reload();
      } catch (err) {
        console.error('登出異常:', err);
      }
    },
    [logout]
  );

  return {
    session,
    profile,
    loading,
    handleLogoutClick,
  };
}