import { useState, useMemo } from 'react';
import { X, Lock, Loader2, Heart, Sparkles } from 'lucide-react';
import { supabase, type Story } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { updateWish } from '@/lib/backend';

export function InvestModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const { session } = useAuth();
  const [amount, setAmount] = useState<number>(100);
  const [customInput, setCustomInput] = useState<string>('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ecpay' | 'linepay'>('ecpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // 🧮 三段式動態服務費計算引擎
  const feeDetails = useMemo(() => {
    const validAmount = Math.max(0, amount || 0);
    if (validAmount < 10) {
      return { fee: 0, total: validAmount, label: '最低資助金額為 10 元', tier: 'invalid' };
    }
    if (validAmount <= 99) {
      return {
        fee: 5,
        total: validAmount + 5,
        label: '系統與技術維護費 (固定 $5)',
        tier: 'explore',
      };
    }
    if (validAmount <= 499) {
      const fee = Math.round(validAmount * 0.05);
      return {
        fee,
        total: validAmount + fee,
        label: '系統與技術維護費 (5%)',
        tier: 'standard',
      };
    }
    const fee = Math.round(validAmount * 0.04);
    return {
      fee,
      total: validAmount + fee,
      label: '系統與技術維護費 (大戶特惠 4%)',
      tier: 'vip',
    };
  }, [amount]);

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomInput('');
    setError('');
  };

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      setAmount(parsed);
    } else {
      setAmount(0);
    }
    setError('');
  };

  const handleCheckout = async () => {
    setError('');
    if (!session?.user) {
      setShowAuth(true);
      return;
    }
    if (amount < 10) {
      setError('最低心願資助金額為 NT$ 10 元');
      return;
    }
    if (message.length > 50) {
      setError('溫暖留言不得超過 50 字');
      return;
    }

    setLoading(true);
    try {
      const { error: investError } = await supabase.from('investments').insert({
        user_id: session.user.id,
        story_id: story.id,
        amount: amount,
        message: message.trim() || null,
        is_anonymous: true,
      });
      if (investError) console.warn('investments 寫入提示:', investError);

      const newTotal = (story.current_stardust || 0) + amount;
      const newStatus = newTotal >= story.product_price ? 'fulfilled' : 'approved';
      await updateWish(story.id, { current_stardust: newTotal, status: newStatus });

      setSuccess(true);
      setTimeout(() => onClose(), 2200);
    } catch (err: any) {
      setError(err.message || '付款連線失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = 50 - message.length;

  return (
    <>
      <div
        className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md scale-in overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="glass-strong rounded-3xl w-full max-w-lg p-6 sm:p-7 glow-border bg-zinc-950/95 border border-amber-400/25 shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {success ? (
            <div className="text-center py-10 scale-in">
              <div className="text-5xl mb-4 hourglass-anim inline-block">⏳</div>
              <h3 className="text-xl font-bold text-amber-200 mb-2">付款完成 · 留言已加密封存！</h3>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1.5">
                <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
                您的 NT$ {amount} 心願燃料已推進沙漏進度
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                <div>
                  <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    贊助心願燃料 · 漂流瓶封存
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    目標：{story.product_name}（目前 {story.current_stardust.toLocaleString()} / {story.product_price.toLocaleString()}）
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="touch-btn rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-amber-100 flex items-center gap-1.5">
                    <span>✍️</span> 封存您的 50 字溫暖留言
                  </label>
                  <span className="text-xs text-amber-300/80 font-mono">
                    (剩餘 {remainingChars} 字)
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="請輸入您想對故事主角說的話... 當進度條 100% 達標時將解鎖公開"
                  maxLength={50}
                  rows={2}
                  className="w-full bg-zinc-900/90 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 transition-all resize-none text-sm"
                />
              </div>

              <hr className="border-white/10" />

              <div>
                <label className="block text-sm font-bold text-amber-100 mb-3 flex items-center gap-1.5">
                  <span>✨</span> 選擇您的心願燃料金額
                </label>

                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSelectPreset(30)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      amount === 30 && customInput === ''
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-[1.02]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-amber-400/30'
                    }`}
                  >
                    <span className="text-base font-black font-mono text-amber-300">NT$ 30</span>
                    <span className="text-[11px] text-gray-400">遞一罐熱咖啡</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(100)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 relative ${
                      amount === 100 && customInput === ''
                        ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.35)] scale-[1.03]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-amber-400/30'
                    }`}
                  >
                    <span className="text-base font-black font-mono text-amber-300 flex items-center gap-1">
                      ⭐️ NT$ 100
                    </span>
                    <span className="text-[11px] text-amber-200/90 font-medium">進度條大補給</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPreset(500)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      amount === 500 && customInput === ''
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.25)] scale-[1.02]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:border-amber-400/30'
                    }`}
                  >
                    <span className="text-base font-black font-mono text-amber-300">NT$ 500</span>
                    <span className="text-[11px] text-gray-400">光速清空清單</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-amber-400/50 transition-all">
                  <span className="text-xs text-gray-300 whitespace-nowrap">✍️ 自訂其他資助金額：</span>
                  <input
                    type="number"
                    min={10}
                    value={customInput}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="輸入金額"
                    className="w-full bg-transparent text-amber-300 font-mono font-bold text-sm focus:outline-none text-right pr-1"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">元 (最低 10 元)</span>
                </div>
              </div>

              <hr className="border-white/10" />

              <div className="bg-zinc-900/70 border border-amber-400/15 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    📊 結帳明細
                  </span>
                  {feeDetails.tier === 'vip' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                      ✨ 已享大戶感恩 4% 優惠
                    </span>
                  )}
                </div>

                <div className="flex justify-between text-xs text-gray-300">
                  <span>• 願望資助金額：</span>
                  <span className="font-mono">NT$ {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>• {feeDetails.label}：</span>
                  <span className="font-mono">NT$ {feeDetails.fee.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-baseline text-sm font-bold text-amber-300">
                  <span>• 您今日實付總金額：</span>
                  <span className="text-lg font-mono glow-text">NT$ {feeDetails.total.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ecpay')}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'ecpay'
                      ? 'border-amber-400/50 bg-amber-500/15 text-amber-200 font-bold'
                      : 'border-white/10 bg-white/5 text-gray-400'
                  }`}
                >
                  💳 綠界科技 ECPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('linepay')}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'linepay'
                      ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200 font-bold'
                      : 'border-white/10 bg-white/5 text-gray-400'
                  }`}
                >
                  🟢 LINE Pay
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">
                  {error}
                </p>
              )}

              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  disabled={loading || amount < 10}
                  className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-gray-950 font-black rounded-xl py-3.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer text-sm"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      {session?.user ? `付款並加密封存我的留言 (NT$ ${feeDetails.total})` : `登入以贊助心願 (NT$ ${feeDetails.total})`}
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-500">
                  點擊後將安全導向 {paymentMethod === 'ecpay' ? '綠界金流' : 'LINE Pay'} 加密結帳頁面 · 全程匿名保護
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAuth && (
  <AuthModal 
    onClose={() => {
      setShowAuth(false);
    }} 
  />
)}
    </>
  );
}
