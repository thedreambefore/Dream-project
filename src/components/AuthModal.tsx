// src/components/AuthModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { toAuthEmail } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { login, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
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

    if (!email.trim() || !password) {
      setError('請填寫帳號與密碼');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('請填寫星旅人暱稱');
      return;
    }

    setLoading(true);
    try {
      const authEmail = toAuthEmail(email);

      if (mode === 'signup') {
        const isSuccess = await signUp(authEmail, password, name.trim());
        if (isSuccess) {
          onClose(); // 🌟 註冊成功並自動登入後，直接關閉彈窗
        } else {
          setError('註冊失敗，該帳號可能已被使用');
        }
      } else {
        const isSuccess = await login(authEmail, password);
        if (isSuccess) {
          onClose();
        } else {
          setError('登入失敗，請檢查您的帳號與密碼');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md scale-in"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-3xl w-full max-w-md p-6 sm:p-8 glow-border bg-zinc-950 border border-zinc-800/80 shadow-2xl shadow-amber-500/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
          <h2 className="text-xl font-bold text-amber-100 glow-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            {mode === 'signup' ? '註冊星旅人帳號' : '登入夢沙'}
          </h2>
          <button
            onClick={onClose}
            className="touch-btn rounded-full p-1 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">星旅人匿名暱稱</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：築夢小旅人"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50"
                required
                autoFocus
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">帳號 (Email 或自訂帳號)</label>
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="star@dreamsand.tw"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 font-mono text-xs"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">密碼</label>
            <input
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼 (至少 6 碼)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 font-mono text-xs"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === 'signup' ? '即刻點亮星塵註冊' : '確認登入'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          {mode === 'signup' ? '已有帳號？' : '還沒有帳號？'}
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError('');
            }}
            className="text-amber-300 hover:text-amber-200 ml-1 underline font-medium cursor-pointer"
          >
            {mode === 'signup' ? '前往登入' : '立即註冊'}
          </button>
        </p>

        <p className="text-center text-xs text-gray-600 mt-4 border-t border-white/5 pt-3">
          註冊只需填寫暱稱與帳密，其餘資料可於心願達成後補填
        </p>
      </div>
    </div>,
    document.body
  );
}

export default AuthModal;