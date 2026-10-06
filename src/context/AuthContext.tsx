import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. 初始化真正的雲端 Supabase 連線
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UserProfile {
  id: string;
  real_name: string;
  anonymous_nickname: string;
  role: 'user' | 'admin';
  is_phone_verified: boolean;
  wallet_balance: number;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  session: any;
  profile: UserProfile | null;
  loading: boolean;
  login: (emailInput: string, passwordInput: string) => Promise<boolean>;
  signUp: (emailInput: string, passwordInput: string, nameInput: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. 核心功能：主動向資料庫撈取用戶的真實錢包與權限狀態
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // 自動補建資料防禦線：完美對齊您的資料庫截圖欄位
        const { data: newProfile } = await supabase
          .from('users')
          .insert([{ 
            id: userId, 
            real_name: '新築夢者', 
            anonymous_nickname: '匿名小五郎',
            role: 'user', 
            wallet_balance: 500, 
            is_phone_verified: false 
          }])
          .select()
          .single();
        return newProfile;
      }
      return data;
    } catch (e) {
      console.error("撈取用戶 Profile 失敗", e);
      return null;
    }
  };

  // 3. 監聽全站登入狀態（🌟 強制時間差解鎖：撈完資料才放行 loading！）
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session?.user) {
          const prof = await fetchUserProfile(session.user.id);
          setProfile(prof);
        }
      } catch (err) {
        console.error('初始化 Auth 遭遇異常:', err);
      } finally {
        setLoading(false); // 🔥 關鍵修正：等資料全部同步完了，才將載入狀態設為 false！
      }
    };

    initializeAuth();

    // 全時廣播雷達監聽
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const prof = await fetchUserProfile(currentSession.user.id);
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

    // 4. 真實與雲端對接的【登入】
  const login = async (emailInput: string, passwordInput: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      alert(`登入失敗: ${error.message}`);
      return false;
    }
    return true;
  };

  // 5. 真實與雲端對接的【註冊】
  const signUp = async (emailInput: string, passwordInput: string, nameInput: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: emailInput,
      password: passwordInput,
    });

    if (error) {
      alert(`註冊失敗: ${error.message}`);
      return false;
    }

    if (data.user) {
      // 註冊成功，立刻在真實的 users 資料表建置初始錢包與暱稱狀態
      await supabase.from('users').insert([
        {
          id: data.user.id,
          real_name: nameInput || '築夢者',
          anonymous_nickname: '匿名小五郎',
          role: 'user',
          wallet_balance: 500, // 贈送 500 初始星塵
          is_phone_verified: false
        }
      ]);
    }
    return true;
  };

  // 6. 真實登出
  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  // 7. 主動手動同步雷達
  const refreshProfile = async () => {
    // 核心安全確認：如果內部 session 一時來不及更新，直接從 Supabase 核心重新拿當前 User ID
    const currentUserId = session?.user?.id || (await supabase.auth.getUser()).data.user?.id;
    if (currentUserId) {
      const prof = await fetchUserProfile(currentUserId);
      setProfile(prof);
    }
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, login, signUp, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  // 全防禦修正：如果 context 暫時不存在（初始化時間差），回傳安全的空物件與 loading 狀態，絕對不讓全站黑屏
  if (!context) {
    return {
      session: null,
      profile: null,
      loading: true,
      login: async () => false,
      signUp: async () => false,
      logout: async () => {},
      refreshProfile: async () => {},
    };
  }
  return context;
}

