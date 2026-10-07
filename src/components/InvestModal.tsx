import { useState, useMemo } from 'react';
import { X, Lock, Loader2, Heart, Sparkles } from 'lucide-react';
import { supabase, type Story } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { AuthModal } from './AuthModal';
import { updateWish } from '@/lib/backend';

export function InvestModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const { session } = useAuth();
  const [amount, setAmount] = useState<number>(100); // 預設亮起 NT$ 100
  const [customInput, setCustomInput] = useState<string>('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ecpay' | 'linepay'>('ecpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  /* ============================================================================
   * 📦 [預付錢包架構封存區] — 未來金流審核通過後若要恢復儲值扣款，可解開此段註解
   * ============================================================================
   * const [walletBalance, setWalletBalance] = useState<number | null>(null);
   * useEffect(() => {
   *   if (session?.user?.id) {
   *     supabase.from('users').select('wallet_balance').eq('id', session.user.id).maybeSingle()
   *       .then(({ data }) => { if (data) setWalletBalance(data.wallet_balance); });
   *   }
   * }, [session]);
   * ============================================================================ */

  // 🧮 三段式動態服務費計算引擎
  const feeDetails = useMemo(() => {
    const validAmount = Math.max(0, amount || 0);
    if (validAmount < 10) {
      return { fee: 0, total: validAmount, label: '最低資助金額為 10 元', tier: 'invalid' };
    }
    if (validAmount <= 99) {
      // 低價探索區 (10 ~ 99)：固定加收 5 元
      return {
        fee: 5,
        total: validAmount + 5,
        label: '系統與技術維護費 (固定 $5)',
        tier: 'explore',
      };
    }
    if (validAmount <= 499) {
      // 標準主力區 (100 ~ 499)：加收 5%
      const fee = Math.round(validAmount * 0.05);
      return {
        fee,
        total: validAmount + fee,
        label: '系統與技術維護費 (5%)',
        tier: 'standard',
      };
    }
    // 大戶感恩區 (500 以上)：特惠加收 4%
    const fee = Math.round(validAmount * 0.04);
    return {
      fee,
      total: validAmount + fee,
      label: '系統與技術維護費 (大戶特惠 4%)',
      tier: 'vip',
    };
  }, [amount]);

  // 選擇預設卡片金額
  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomInput('');
    setError('');
  };

  // 輸入自訂金額
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

  // 核心付款與推進進度條邏輯
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
      // 💡 [未來真實金流串接點]
      // 在此呼叫後端 API 建立綠界 ECPay 或 LINE Pay 訂單，帶入實付總額 `feeDetails.total`
      // 付款成功 Webhook 回調後執行以下資料表寫入：

      // 1. 寫入贊助與漂流瓶留言紀錄
      const { error: investError } = await supabase.from('investments').insert({
        user_id: session.user.id,
        story_id: story.id,
        amount: amount, // 故事實際獲得的願望資助額（不含手續費）
        message: message.trim() || null,
        is_anonymous: true,
      });
      if (investError) console.warn('investments 寫入提示:', investError);

      // 2. 更新該願望故事的進度條與狀態
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
              {/* 頂部標題與目標願望摘要 */}
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

              {/* 區塊 1：封存 50 字溫暖留言 */}
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

              {/* 區塊 2：選擇心願燃料金額 */}
              <div>
                <label className="block text-sm font-bold text-amber-100 mb-3 flex items-center gap-1.5">
                  <span>✨</span> 選擇您的心願燃料金額
                </label>

                {/* 三大預設卡片 */}
                <div className="grid grid-cols-3 gap-2.5 mb-3">
                  {/* NT$ 30 */}
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

                  {/* ⭐️ NT$ 100 (預設亮起) */}
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

                  {/* NT$ 500 */}
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

                {/* 自訂其他資助金額 */}
                <div className="flex items-center gap-2 bg-zinc-900/90 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-amber-400/50 transition-all">
                  <span className="text-xs text-gray-300 whitespace-nowrap">✍️ 自訂其他資助金額：</span>
                  <input
                    type="number"
                    min={10}
                    value={customInput}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    placeholder="輸入金額"
                    className="w-full bg-transparent text-amber-300 font-mono font-bold text-sm focus:outline-none text-right pr-1"
