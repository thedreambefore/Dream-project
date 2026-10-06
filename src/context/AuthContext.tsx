import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. 初始化真正的雲端 Supabase 連線（會自動去讀取你的 .env 鑰匙）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserProfile {
  id: string;
  real_name: string;
  role: 'user' | 'admin';
  is_phone_verified: boolean;
  wallet_balance: number;
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
            anonymous_nickname: '匿名人士', // 補上這個欄位
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

  // 3. 監聽全站登入狀態（重新整理網頁免重複登入的秘密）
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(prof => setProfile(prof));
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id).then(prof => setProfile(prof));
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
      // 註冊成功，立刻在真實的 users 資料表建置初始錢包與手機狀態
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

  const refreshProfile = async () => {
    if (session?.user) {
      const prof = await fetchUserProfile(session.user.id);
      setProfile(prof);
    }
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, login, signUp, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ... 前面的程式碼保持不變 ...

export function useAuth() {
  const context = useContext(AuthContext);
  // 🌟 全防禦修正：如果 context 暫時不存在（初始化時間差），回傳一個安全的空物件與 loading 狀態，絕對不讓全站黑屏暴斃！
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
