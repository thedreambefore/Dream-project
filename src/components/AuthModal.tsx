import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { toAuthEmail } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export function AuthModal({ onClose }: { onClose: () => void }) {
  // 🌟 核心改造：直接調用您在 AuthContext 裡精心封裝好的核心功能
  const { login, signUp } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'signup'>('login'); // 預設改為 login 方便您重複測試登入
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // 補上註冊需要的暱稱欄位
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
      let isSuccess = false;

      if (mode === 'signup') {
        // 🚀 呼叫 Context 的註冊：會自動同步在真實 users 資料表建置初始錢包（500星塵）
        isSuccess = await signUp(authEmail, password, name || '新星旅人');
        if (isSuccess) {
          alert('註冊成功！請直接進行登入。');
          setMode('login');
          setPassword('');
        } else {
          setError('註冊失敗，該帳號可能已被註冊。');
        }
      } else {
         // 🚀 呼叫 Context 的登入
  isSuccess = await login(authEmail, password);
  if (isSuccess) {
    onClose(); // 直接關閉彈窗，不 reload！
  } else {
    setError('登入失敗，請檢查您的帳號與密碼。');
  }
}
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失敗，請重試');
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
        className="glass-strong rounded-3xl w-full max-w-md p-6 sm:p-8 glow-border bg-zinc-950 border border-zinc-800/80 shadow-2xl shadow-amber-500/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 標題區 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-amber-100 glow-text flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            {mode === 'signup' ? '註冊星旅人帳號' : '登入夢沙'}
          </h2>
          <button onClick={onClose} className="touch-btn rounded-full p-1 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表單區 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">真實姓名 / 暱稱</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例如：築夢者小明"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">帳號（Email 或管理員帳號）</label>
            <input
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="star@dreamsand.tw"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入密碼（至少 6 位數）"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signup' ? '立即註冊' : '確認登入')}
          </button>
        </form>

        {/* 切換模式 */}
        <p className="text-center text-sm text-gray-400 mt-6">
          {mode === 'signup' ? '已有帳號？' : '還沒有帳號？'}
          <button
            onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setError(''); }}
            className="text-amber-300 hover:text-amber-200 ml-1 underline font-medium"
          >
            {mode === 'signup' ? '前往登入' : '立即註冊'}
          </button>
        </p>

        <p className="text-center text-xs text-gray-600 mt-4 border-t border-white/5 pt-3">
          加入夢沙平台，註冊即贈 500 初始星塵
        </p>
      </div>
    </div>
  );
}
