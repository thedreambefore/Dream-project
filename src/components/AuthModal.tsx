import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toAuthEmail } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('請填寫帳號與密碼');
      return;
    }
    setLoading(true);
    try {
      const authEmail = toAuthEmail(email);
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password,
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });
        if (signInError) throw signInError;
      }
      
      // ---- 關鍵修正區 ----
      try {
        await refreshProfile();
      } catch (profileErr) {
        console.warn('Profile 刷新略過或失敗，將透過重整強制同步:', profileErr);
      }
      onClose();
      window.location.reload(); // 🔥 強制重新整理，擊碎畫面凍結！
      // --------------------

    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗，請重試');
    } finally {
      setLoading(false);
    }
  };


  const handleLineLogin = async () => {
    setLoading(true);
    setError('');
    const randomEmail = `line_${Math.random().toString(36).slice(2, 10)}@dreamsand.tw`;
    const randomPassword = Math.random().toString(36).slice(2, 14);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: randomEmail,
        password: randomPassword,
      });
      if (signInData.session) {
        try { await refreshProfile(); } catch {}
        onClose();
        window.location.reload(); // 🔥 確保模擬登入後也會強制跳轉
        return;
      }
      if (signInError) {
        const { error: signUpError } = await supabase.auth.signUp({ email: randomEmail, password: randomPassword });
        if (signUpError) throw signUpError;
        try { await refreshProfile(); } catch {}
        onClose();
        window.location.reload(); // 🔥 確保模擬註冊後也會強制跳轉
      }
    } catch {
      setError('模擬 LINE 登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm scale-in"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-3xl w-full max-w-md p-6 sm:p-8 glow-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-amber-100 glow-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            {mode === 'signup' ? '註冊星旅人帳號' : '登入夢沙'}
          </h2>
          <button onClick={onClose} className="touch-btn rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">帳號（Email 或管理員帳號）</label>
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="star@dreamsand.tw 或 admin"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位數"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signup' ? '立即註冊' : '登入')}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500">或</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <button
          onClick={handleLineLogin}
          disabled={loading}
          className="w-full touch-btn bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl py-3.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span className="text-2xl">💬</span>
              模擬 LINE 一鍵登入 / 註冊
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-400 mt-5">
          {mode === 'signup' ? '已有帳號？' : '還沒有帳號？'}
          <button
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
            className="text-amber-300 hover:text-amber-200 ml-1 underline"
          >
            {mode === 'signup' ? '前往登入' : '立即註冊'}
          </button>
        </p>

        <p className="text-center text-xs text-gray-600 mt-3">
          註冊即贈 100 星塵，可立即瀏覽與模擬儲值
        </p>
      </div>
    </div>
  );
}
