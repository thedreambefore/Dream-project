import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { toAuthEmail } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login'); // 預設改為登入，方便測試
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
        alert('註冊成功！請直接切換到登入畫面進行登入。');
        setMode('login');
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password,
        });
        if (signInError) throw signInError;

        // 登入成功後，強制重整
        if (data?.session) {
          try { await refreshProfile(); } catch (pErr) { console.error(pErr); }
          onClose();
          window.location.reload(); 
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗，請重試');
    } fileGrown {
      setLoading(false);
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
        className="glass-strong rounded-3xl w-full max-w-md p-6 sm:p-8 glow-border bg-zinc-950 border border-zinc-800"
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
            <label className="block text-sm text-gray-300 mb-1.5">帳號 (Email)</label>
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入您的 Email"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位數"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50"
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

        <p className="text-center text-sm text-gray-400 mt-5">
          {mode === 'signup' ? '已有帳號？' : '還沒有帳號？'}
          <button
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
            className="text-amber-300 hover:text-amber-200 ml-1 underline"
          >
            {mode === 'signup' ? '前往登入' : '立即註冊'}
          </button>
        </p>
      </div>
    </div>
  );
}
