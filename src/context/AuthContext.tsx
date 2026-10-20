// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import type { UserProfile } from '@/types/wish';

interface AuthContextType {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isBanned: boolean;
  isAdmin: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<boolean>;
  signUp: (emailInput: string, passwordInput: string, nameInput: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPasswordEmail: (email: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: userId,
              real_name: null,
              anonymous_nickname: '新星旅人',
              role: 'user',
              wallet_balance: 0,
              is_phone_verified: false,
            },
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile as UserProfile;
      }

      if (error) throw error;
      return data as UserProfile;
    } catch (e) {
      console.error('❌ 讀取用戶 Profile 異常:', e);
      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted) setSession(initialSession);

        if (initialSession?.user) {
          const prof = await fetchUserProfile(initialSession.user.id);
          if (isMounted) setProfile(prof);
        }
      } catch (err) {
        console.error('初始化 Auth 異常:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (isMounted) setSession(currentSession);

        if (currentSession?.user) {
          const prof = await fetchUserProfile(currentSession.user.id);
          if (isMounted) setProfile(prof);
        } else {
          if (isMounted) setProfile(null);
        }
        if (isMounted) setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = useCallback(async (emailInput: string, passwordInput: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      alert(`登入失敗: ${error.message}`);
      return false;
    }
    return true;
  }, []);

  const signUp = useCallback(
    async (emailInput: string, passwordInput: string, nameInput: string): Promise<boolean> => {
      const { data, error } = await supabase.auth.signUp({
        email: emailInput,
        password: passwordInput,
      });
      if (error) {
        alert(`註冊失敗: ${error.message}`);
        return false;
      }
      if (data.user) {
        const chosenName = nameInput.trim() || '新星旅人';
        await supabase.from('users').upsert([
          {
            id: data.user.id,
            real_name: chosenName,
            anonymous_nickname: chosenName,
            role: 'user',
            wallet_balance: 0,
            is_phone_verified: false,
          },
        ]);
      }
      return true;
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const currentUserId = session?.user?.id || (await supabase.auth.getUser()).data.user?.id;
    if (currentUserId) {
      const prof = await fetchUserProfile(currentUserId);
      setProfile(prof);
    }
  }, [session?.user?.id, fetchUserProfile]);

  const resetPasswordEmail = useCallback(async (email: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      alert('密碼重設星光郵件已發送，請檢查信箱。');
      return true;
    } catch (err: unknown) {
      alert(`發送失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
      return false;
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert('密碼修改成功！');
      return true;
    } catch (err: unknown) {
      alert(`密碼修改失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
      return false;
    }
  }, []);

  const isBanned = profile?.role === 'banned';
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        isBanned,
        isAdmin,
        login,
        signUp,
        logout,
        refreshProfile,
        resetPasswordEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      session: null,
      profile: null,
      loading: true,
      isBanned: false,
      isAdmin: false,
      login: async () => false,
      signUp: async () => false,
      logout: async () => {},
      refreshProfile: async () => {},
      resetPasswordEmail: async () => false,
      updatePassword: async () => false,
    };
  }
  return context;
}