import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. 初始化雲端 Supabase 連線
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
  resetPasswordEmail: (email: string) => Promise<boolean>; // 🌟 未來預留：忘記密碼發送
  updatePassword: (newPassword: string) => Promise<boolean>; // 🌟 未來預留：重設新密碼
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

   // 2. 核心功能：主動向資料庫撈取用戶的真實錢包與權限狀態（徹底修正 limit 與 single 衝突）
  const fetchUserProfile = async (userId: string) => {
    try {
      // 🌟 核心修正：拿掉會衝突的 .limit(1)，改用最純粹的 .single() 去抓那一列 UUID 物件
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // 如果發現錯位或沒資料（PGRST116），自動補建一筆
      if (error && error.code === 'PGRST116') {
        console.log('🛰️ 發現 users 資料表無此 ID，啟動防禦性補建機制...');
        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert([{ 
            id: userId, 
            real_name: '', 
            anonymous_nickname: '匿名小五郎',
            role: 'user', 
            wallet_balance: 500, 
            is_phone_verified: false 
          }])
          .select()
          .single();
          
        if (insertError) throw insertError;
        return newProfile;
      }

      if (error) throw error;
      return data;
    } catch (e) {
      console.error("❌ 雲端資料庫撈取用戶 Profile 發生致命攔截:", e);
      return null;
    }
  };

  // 3. 核心大重構：全時實時監聽與初始化強同步
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // 先強行獲取一次最真實的雲端憑證
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted) setSession(initialSession);
        
        if (initialSession?.user) {
          const prof = await fetchUserProfile(initialSession.user.id);
          if (isMounted) setProfile(prof);
        }
      } catch (err) {
        console.error('初始化 Auth 遭遇異常:', err);
      } finally {
        if (isMounted) setLoading(false); // 🔥 只有當 Auth 和 Table 資料都撈完，才放行 loading！
      }
    };

    initializeAuth();

    // 監聽憑證大爆炸事件（包含未來忘記密碼跳轉回來的 PASSWORD_RECOVERY 事件）
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (isMounted) setSession(currentSession);
      
      if (currentSession?.user) {
        const prof = await fetchUserProfile(currentSession.user.id);
        if (isMounted) setProfile(prof);
      } else {
        if (isMounted) setProfile(null);
      }

      // 🌟 未來密碼重設通道：當用戶點擊忘記密碼簡訊/郵件跳轉回來時
      if (event === 'PASSWORD_RECOVERY') {
        console.log('🛰️ 偵測到密碼重設觸發，引導彈出新密碼輸入框');
        // 可在這裡設定一個全域 boolean 狀態，讓前台自動彈出「請輸入新密碼」的彈窗
      }
      
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (emailInput: string, passwordInput: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: emailInput, password: passwordInput });
    if (error) { alert(`登入失敗: ${error.message}`); return false; }
    return true;
  };

  const signUp = async (emailInput: string, passwordInput: string, nameInput: string) => {
    const { data, error } = await supabase.auth.signUp({ email: emailInput, password: passwordInput });
    if (error) { alert(`註冊失敗: ${error.message}`); return false; }
    if (data.user) {
      await supabase.from('users').insert([{
        id: data.user.id,
        real_name: nameInput || '築夢者',
        anonymous_nickname: '匿名小五郎',
        role: 'user',
        wallet_balance: 500,
        is_phone_verified: false
      }]);
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    const currentUserId = session?.user?.id || (await supabase.auth.getUser()).data.user?.id;
    if (currentUserId) {
      const prof = await fetchUserProfile(currentUserId);
      setProfile(prof);
    }
  };

  // 🌟 忘記密碼核心擴充功能：發送密碼重設郵件
  const resetPasswordEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`, // 這是未來重新整理密碼的指定跳轉網址
      });
      if (error) throw error;
      alert('密碼重設星光郵件已發送，請檢查您的信箱！');
      return true;
    } catch (err: any) {
      alert(`發送失敗: ${err.message}`);
      return false;
    }
  };

  // 🌟 忘記密碼核心擴充功能：輸入並儲存全新密碼
  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert('星旅人密碼修改成功！新印記已生效。');
      return true;
    } catch (err: any) {
      alert(`密碼修改失敗: ${err.message}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, login, signUp, logout, refreshProfile, resetPasswordEmail, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      session: null, profile: null, loading: true,
      login: async () => false, signUp: async () => false, logout: async () => {}, refreshProfile: async () => {},
      resetPasswordEmail: async () => false, updatePassword: async () => false
    };
  }
  return context;
}
