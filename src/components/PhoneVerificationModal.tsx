import { useState, useEffect } from 'react';
import { X, Phone, ShieldCheck, Loader2, MessageSquare } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { markPhoneVerified } from '@/lib/backend';

export function PhoneVerificationModal({ onClose, onVerified }: { onClose: () => void; onVerified: () => void }) {
  const { session, refreshProfile } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    setError('');
    const phonePattern = /^09\d{8}$/;
    if (!phonePattern.test(phone)) {
      setError('請輸入正確的台灣手機號碼 (09xxxxxxxx)');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSentCode(true);
    setCountdown(60);
    setLoading(false);
  };

  const handleVerify = async () => {
    setError('');
    if (code !== '8888') {
      setError('驗證碼不正確，請輸入 8888');
      return;
    }
    setLoading(true);
    try {
      if (session?.user?.id) {
        await markPhoneVerified(session.user.id, phone);
        await refreshProfile();
      }
      setVerified(true);
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
    } catch {
      setError('驗證失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm scale-in"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-3xl w-full max-w-md p-6 sm:p-8 glow-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            手機強驗證
          </h2>
          <button onClick={onClose} className="touch-btn rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {verified ? (
          <div className="text-center py-8 scale-in">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-amber-200 mb-2">手機驗證成功！</h3>
            <p className="text-gray-400 text-sm">許願發布權限已解鎖</p>
          </div>
        ) : (
          <>
            <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl px-4 py-3 mb-5">
              <p className="text-sm text-amber-200/90 leading-relaxed">
                為了防範詐騙與確保超商取貨順利，許願前請先完成手機驗證
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">台灣手機號碼</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                    maxLength={10}
                    disabled={sentCode}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all disabled:opacity-60"
                  />
                </div>
              </div>

              <button
                onClick={handleSendCode}
                disabled={sentCode || loading}
                className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {countdown > 0 ? `重新發送 (${countdown}s)` : '發送驗證碼'}
              </button>

              {sentCode && (
                <div className="space-y-3 scale-in">
                  <div className="bg-green-500/10 border border-green-400/30 rounded-xl px-4 py-3 text-center">
                    <p className="text-sm text-green-200">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      [內部模擬測試] 您的簡訊驗證碼為：
                      <span className="text-2xl font-bold text-green-100 mx-1 glow-text">8888</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1.5">輸入驗證碼</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="4 位數驗證碼"
                      maxLength={4}
                      className="w-full text-center text-2xl tracking-widest bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
                    />
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
                  )}

                  <button
                    onClick={handleVerify}
                    disabled={loading}
                    className="w-full touch-btn bg-green-500 hover:bg-green-400 text-white font-bold rounded-xl py-3 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    確認驗證
                  </button>
                </div>
              )}

              {!sentCode && error && (
                <p className="text-red-400 text-sm bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
