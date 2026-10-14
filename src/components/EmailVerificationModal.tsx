// src/components/EmailVerificationModal.tsx
import { useState } from 'react';
import { X, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export function EmailVerificationModal({
  onClose,
  onVerified,
}: {
  onClose: () => void;
  onVerified: () => void;
}) {
  const { session, refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const email = session?.user?.email || '';

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setSentCode(true);
    setLoading(false);
  };

  const handleVerify = async () => {
    setError('');
    if (code !== '7777') {
      setError('驗證碼不正確，測試環境請輸入 7777');
      return;
    }
    setLoading(true);
    try {
      if (session?.user?.id) {
        // 更新 users 表驗證狀態
        await supabase
          .from('users')
          .update({ is_phone_verified: true }) // 沿用欄位做為通用 verified 狀態
          .eq('id', session.user.id);

        await refreshProfile();
        setVerified(true);
        setTimeout(() => {
          onVerified();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || '驗證失敗');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm scale-in"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-3xl w-full max-w-md p-6 glow-border bg-zinc-950 border border-zinc-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-amber-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            電子郵件信箱驗證
          </h2>
          <button onClick={onClose} className="rounded-full hover:bg-white/10 p-1 text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {verified ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-2">✅</div>
            <h3 className="text-base font-bold text-amber-200">信箱認證完成！</h3>
            <p className="text-xs text-gray-400 mt-1">發布權限已成功解鎖</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              為了確保主題活動達成時能即時聯繫並通知採購贈禮進度，發布前請先確認您的電子信箱。
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">認證信箱</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  disabled
                  value={email}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-300"
                />
              </div>
            </div>

            {!sentCode ? (
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl py-2.5 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                發送驗證碼至信箱
              </button>
            ) : (
              <div className="space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 text-center text-xs text-emerald-200">
                  [模擬測試模式] 您的認證碼為：<span className="font-bold text-base text-white">7777</span>
                </div>

                <input
                  type="text"
                  maxLength={4}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="請輸入 4 位數驗證碼"
                  className="w-full text-center text-xl tracking-widest bg-zinc-900 border border-white/10 rounded-xl py-2.5 text-white"
                />

                {error && <p className="text-red-400 text-xs text-center">{error}</p>}

                <button
                  onClick={handleVerify}
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl py-2.5 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  確認驗證
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}