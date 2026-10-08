import { useState, useMemo } from 'react';
import { X, Lock, Loader2, Heart, Sparkles } from 'lucide-react';
import { supabase, type Story } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { updateWish } from '@/lib/backend';

export function InvestModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const { session, refreshProfile } = useAuth();
  const isOfficial = story.id === '00000000-0000-0000-0000-000000000001' || story.id === 'demo-story-001';

  // 計算該心願當前真正剩餘所需的星塵數額
  const remainingNeed = isOfficial ? 999999 : Math.max(0, story.product_price - (story.current_stardust || 0));

  // 預設金額：若剩餘需求小於 100 則預設為剩餘量，否則為 100
  const defaultAmount = isOfficial ? 100 : Math.min(100, remainingNeed > 0 ? remainingNeed : 10);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [customInput, setCustomInput] = useState<string>('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ecpay' | 'linepay'>('ecpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // 🧮 三段式服務費計算
  const feeDetails = useMemo(() => {
    const validAmount = Math.max(0, amount || 0);
    if (validAmount < 10 && !isOfficial) {
      return { fee: 0, total: validAmount, label: '最低金額為 10 元', tier: 'invalid' };
    }
    if (validAmount <= 99) {
      return { fee: 5, total: validAmount + 5, label: '系統與技術維護費 (固定 $5)', tier: 'explore' };
    }
    if (validAmount <= 499) {
      const fee = Math.round(validAmount * 0.05);
      return { fee, total: validAmount + fee, label: '系統與技術維護費 (5%)', tier: 'standard' };
    }
    const fee = Math.round(validAmount * 0.04);
    return { fee, total: validAmount + fee, label: '系統與技術維護費 (特惠 4%)', tier: 'vip' };
  }, [amount, isOfficial]);

  const handleSelectPreset = (val: number) => {
    if (!isOfficial && val > remainingNeed) return; // 防呆
    setAmount(val);
    setCustomInput('');
    setError('');
  };

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed)) {
      if (!isOfficial && parsed > remainingNeed) {
        setAmount(remainingNeed);
        setError(`此願望僅差 ${remainingNeed} 星塵即可圓滿，已為您自動設為上限。`);
      } else {
        setAmount(parsed);
        setError('');
      }
    } else {
      setAmount(0);
    }
  };

  const handleCheckout = async () => {
    setError('');
    if (!session?.user) {
      setShowAuth(true);
      return;
    }
    if (!isOfficial && remainingNeed <= 0) {
      setError('🎉 此願望已經圓滿滿願，無法再注入更多心願燃料！');
      return;
    }
    if (amount < 10 && !isOfficial) {
      setError('最低心願資助金額為 NT$ 10 元');
      return;
    }
    if (!isOfficial && amount > remainingNeed) {
      setError(`注入金額不可超過剩餘所需數量 (${remainingNeed} 星塵)`);
      return;
    }
    if (message.length > 50) {
      setError('溫暖留言不得超過 50 字');
      return;
    }

    setLoading(true);
    try {
      if (!isOfficial) {
        // 寫入贊助紀錄
        await supabase.from('investments').insert({
          user_id: session.user.id,
          story_id: story.id,
          amount: amount,
          message: message.trim() || null,
          is_anonymous: true,
          is_hidden: false,
        });
      }

      const newTotal = (story.current_stardust || 0) + amount;
      // 達到目標金額後狀態轉為 full_funded（待出貨）
      const newStatus = (!isOfficial && newTotal >= story.product_price) ? 'full_funded' : story.status;

      if (!isOfficial) {
        await updateWish(story.id, { current_stardust: newTotal, status: newStatus });
      } else {
        story.current_stardust = newTotal;
      }

      // 付款後刷新 Context（在途星塵暫存區會立刻加上這筆！）
      await refreshProfile();

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
              <h3 className="text-xl font-bold text-amber-200 mb-2">付款完成 · 留言已封存！</h3>
              <p className="text-gray-400 text-sm flex items-center justify-center gap-1.5">
                <Heart className="w-4 h-4 text-amber-400 fill-amber-400" />
                已注入 NT$ {amount}，並存入您的「在途星塵暫存區」
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
                  <p className="text-xs text-zinc-400 mt-0.5">
                    目標：{story.product_name}
                    {!isOfficial && (
                      <span className="text-amber-300 font-mono ml-1">
                        (尚缺 {remainingNeed.toLocaleString()} 星塵)
                      </span>
                    )}
                  </p>
                </div>
                <button onClick={onClose} className="rounded-full hover:bg-white/10 p-1 text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 50 字留言 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-amber-100">✍️ 封存您的 50 字溫暖留言</label>
                  <span className="text-xs text-amber-300/80 font-mono">(剩餘 {remainingChars} 字)</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="請輸入想對主角說的話... 圓滿履約時將公開"
                  maxLength={50}
                  rows={2}
                  className="w-full bg-zinc-900/90 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 text-sm resize-none"
                />
              </div>

              <hr className="border-white/10" />

              {/* 選擇心願燃料金額 */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-bold text-amber-100">✨ 選擇心願燃料金額</label>
                  {!isOfficial && (
                    <span className="text-xs text-amber-400 font-mono">
                      最多可注入：{remainingNeed.toLocaleString()} 星塵
                    </span>
                  )}
                </div>

                {/* 快捷按鈕 (超過上限自動反灰禁用) */}
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {[30, 100, 500].map((preset) => {
                    const isDisabled = !isOfficial && preset > remainingNeed;
                    const labels: Record<number, string> = { 30: '遞一罐熱咖啡', 100: '進度條大補給', 500: '光速清空清單' };

                    return (
                      <button
                        key={preset}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                          isDisabled
                            ? 'opacity-30 border-white/5 bg-zinc-900/50 cursor-not-allowed'
                            : amount === preset && customInput === ''
                            ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-[1.02] cursor-pointer'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-amber-400/30 cursor-pointer'
                        }`}
                      >
                        <span className="text-base font-black font-mono text-amber-300">NT$ {preset}</span>
                        <span className="text-[11px] text-gray-400">{isDisabled ? '超過所需金額' : labels[preset]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 自訂資助金額 (受限於 remainingNeed) */}
                <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-amber-400/50">
                  <span className="text-xs text-gray-300 whitespace-nowrap">✍️ 自訂資助金額：</span>
                  <input
                    type="number"
                    min={10}
                    max={isOfficial ? undefined : remainingNeed}
                    value={customInput}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder={`10 ~ ${isOfficial ? '無上限' : remainingNeed}`}
                    className="w-full bg-transparent text-amber-300 font-mono font-bold text-sm focus:outline-none text-right pr-1"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">元</span>
                </div>
              </div>

              <hr className="border-white/10" />

              {/* 結帳明細 */}
              <div className="bg-zinc-900/70 border border-amber-400/15 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>• 願望資助金額：</span>
                  <span className="font-mono">NT$ {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>• {feeDetails.label}：</span>
                  <span className="font-mono">NT$ {feeDetails.fee.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between items-baseline text-sm font-bold text-amber-300">
                  <span>• 實付總金額：</span>
                  <span className="text-lg font-mono glow-text">NT$ {feeDetails.total.toLocaleString()}</span>
                </div>
              </div>

              {/* 金流選擇 */}
              <div className="flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('ecpay')}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'ecpay' ? 'border-amber-400/50 bg-amber-500/15 text-amber-200 font-bold' : 'border-white/10 bg-white/5 text-gray-400'
                  }`}
                >
                  💳 綠界科技 ECPay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('linepay')}
                  className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    paymentMethod === 'linepay' ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200 font-bold' : 'border-white/10 bg-white/5 text-gray-400'
                  }`}
                >
                  🟢 LINE Pay
                </button>
              </div>

              {error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center">{error}</p>}

              <button
                onClick={handleCheckout}
                disabled={loading || amount < 10 || (!isOfficial && amount > remainingNeed)}
                className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-gray-950 font-black rounded-xl py-3.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer text-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Lock className="w-4 h-4" /> 付款並加密封存我的留言 (NT$ {feeDetails.total})</>}
              </button>
            </div>
          )}
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}
