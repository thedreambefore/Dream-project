// src/components/InvestModal.tsx
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { updateWish, OFFICIAL_SPONSOR_ID } from '@/lib/backend';

export function InvestModal({ story, onClose }: { story: Wish; onClose: () => void }) {
  const { session, refreshProfile } = useAuth();
  const isOfficial = story.id === OFFICIAL_SPONSOR_ID;

  // 計算該心願當前剩餘所需星星
  const remainingNeed = isOfficial
    ? 999999
    : Math.max(0, story.product_price - Number(story.current_stardust || 0));

  // 預設投入數量（最低限制 50 顆）
  const initialAmount = 50;
  const [amount, setAmount] = useState<number>(initialAmount);
  const [customInput, setCustomInput] = useState<string>('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ecpay' | 'linepay'>('ecpay');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // 服務費規格計算：
  // 單筆交易 50 至 100 元之間，固定收取 5 元；超過 100 元按 5% 計收
  const feeDetails = useMemo(() => {
    const validAmount = Math.max(0, amount || 0);
    if (validAmount < 50 && !isOfficial) {
      return { fee: 0, total: validAmount, label: '單次最低需投下 50 顆星星', isValid: false };
    }
    let fee = 5;
    if (validAmount > 100) {
      fee = Math.round(validAmount * 0.05);
    }
    return {
      fee,
      total: validAmount + fee,
      label: validAmount <= 100 ? '系統與技術服務費 (固定 NT$ 5)' : '系統與技術服務費 (5%)',
      isValid: true,
    };
  }, [amount, isOfficial]);

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
      setError('');
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
    if (amount < 50 && !isOfficial) {
      setError('單次投下虛擬星星最低金額為 NT$ 50 元');
      return;
    }
    if (!agreeTerms) {
      setError('請勾選並確認數位內容服務條款');
      return;
    }
    if (message.length > 50) {
      setError('互動留言不得超過 50 字');
      return;
    }

    setLoading(true);
    try {
      // 1. 寫入投資與互動紀錄
      const { error: invErr } = await supabase.from('investments').insert({
        user_id: session.user.id,
        wish_id: story.id,
        story_id: story.id,
        amount: Number(amount),
        message: message.trim() || '投下了閃爍的願望星！',
        is_hidden: false,
      });
      if (invErr) throw invErr;

      if (!isOfficial) {
        // 自動加入追番
        await supabase.from('bookmarks').upsert(
          {
            user_id: session.user.id,
            wish_id: story.id,
          },
          { onConflict: 'user_id,wish_id' }
        );
      }

      // 2. 累加星塵並檢查是否達成目標
      const newTotal = Number(story.current_stardust || 0) + Number(amount);
      const isNewlyFunded = !isOfficial && newTotal >= Number(story.product_price);
      const newStatus = isNewlyFunded ? 'full_funded' : story.status;

      // 建立更新 payload
      const updatePayload: Record<string, any> = {
        current_stardust: newTotal,
        status: newStatus,
      };

      // 若達到圓滿且尚未記錄過時間，記錄達成日期時間（供隔天凌晨 00:00 自動下架判斷）
      if (isNewlyFunded && !(story as any).funded_at) {
        updatePayload.funded_at = new Date().toISOString();
      }

      await updateWish(story.id, updatePayload);

      story.current_stardust = newTotal;
      story.status = newStatus;

      await refreshProfile();
      setSuccess(true);
      setTimeout(() => onClose(), 2200);
    } catch (err: any) {
      setError(err.message || '金流連線異常，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const remainingChars = 50 - message.length;

  // 🌟 使用 createPortal 將整個彈窗掛在 document.body 上，徹底不受卡片 3D 與導覽列層級干擾！
  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="glass-strong rounded-3xl w-full max-w-lg p-6 sm:p-7 glow-border bg-zinc-950 border border-amber-400/30 shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {success ? (
            <div className="text-center py-10 scale-in">
              <div className="text-5xl mb-4 hourglass-anim inline-block">⭐</div>
              <h3 className="text-xl font-bold text-amber-200 mb-2">已成功投入願望星！</h3>
              <p className="text-gray-400 text-xs flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                已投入 {amount} 顆星星，數位憑證與互動紀錄已即時交付
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 頂部標題 */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    購買虛擬星星 · 投下心願互動
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    對象活動：{story.product_name}
                    {!isOfficial && (
                      <span className="text-amber-300 font-mono ml-1">
                        (目前已投入 {(story.current_stardust || 0).toLocaleString()} / 目標 {(story.product_price || 0).toLocaleString()} 顆星星)
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full hover:bg-white/10 p-1 text-gray-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 互動留言區 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-amber-100">
                    ✍️ 留下一則互動星語 (限 50 字)
                  </label>
                  <span className="text-[11px] text-amber-300/80 font-mono">
                    (剩餘 {remainingChars} 字)
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="留下您的溫暖話語，活動達成時將同步公開..."
                  maxLength={50}
                  rows={2}
                  className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 text-xs resize-none"
                />
              </div>

              {/* 選擇星星數額 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-amber-100">⭐ 選擇星星投入數量</label>
                  {!isOfficial && remainingNeed > 0 && (
                    <span className="text-[11px] text-amber-400 font-mono">
                      距離目標尚差：{remainingNeed.toLocaleString()} 顆
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {[50, 100, 300].map((preset) => {
                    const labels: Record<number, string> = {
                      50: '50 顆 (微光星座)',
                      100: '100 顆 (耀眼流星)',
                      300: '300 顆 (璀璨星群)',
                    };

                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                          amount === preset && customInput === ''
                            ? 'bg-amber-500/25 border-amber-400 text-amber-100 shadow-[0_0_12px_rgba(245,158,11,0.25)] cursor-pointer'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:border-amber-400/30 cursor-pointer'
                        }`}
                      >
                        <span className="text-sm font-black font-mono text-amber-300">
                          {preset} 顆
                        </span>
                        <span className="text-[10px] text-gray-400">{labels[preset]}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2">
                  <span className="text-xs text-gray-300 whitespace-nowrap">自訂星星數量：</span>
                  <input
                    type="number"
                    min={50}
                    value={customInput}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="最低 50 ~ 無上限"
                    className="w-full bg-transparent text-amber-300 font-mono font-bold text-xs focus:outline-none text-right pr-1"
                  />
                  <span className="text-xs text-gray-400 whitespace-nowrap">顆</span>
                </div>
              </div>

              {/* 費用明細小計 */}
              <div className="bg-zinc-900/80 border border-amber-400/20 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-300">
                  <span>• 虛擬星星 ({amount} 顆)：</span>
                  <span className="font-mono">NT$ {amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>• {feeDetails.label}：</span>
                  <span className="font-mono">NT$ {feeDetails.fee.toLocaleString()}</span>
                </div>
                <div className="border-t border-white/10 pt-1.5 flex justify-between items-baseline text-xs font-bold text-amber-300">
                  <span>• 實付總額：</span>
                  <span className="text-base font-mono glow-text">
                    NT$ {feeDetails.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 支付方式 */}
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
                  💳 信用卡 (綠界科技 ECPay)
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

              {/* 強制服務條款確認勾選框 */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-amber-400/40 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-zinc-300 leading-relaxed">
                    我已明瞭並同意：本服務屬於一經提供即完成之數位內容與社群互動服務。付款完成當下代表數位商品已交付且消費程序已終結，屬於消保法不適用
                    7 天鑑賞期之數位內容，不接受任何形式之退費、退點或轉讓。
                  </span>
                </label>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-center flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {error}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || !agreeTerms || amount < 50}
                className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-gray-950 font-black rounded-xl py-3 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer text-xs"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> 確認付款並投下願望星 (NT${' '}
                    {feeDetails.total.toLocaleString()})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>,
    document.body
  );
}