// src/components/InvestModal/index.tsx
import { createPortal } from 'react-dom';
import { X, Sparkles, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { PresetButtons } from './components/PresetButtons';
import { FeeSummary } from './components/FeeSummary';
import { useInvestModal } from './useInvestModal';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';
import type { InvestModalProps } from './types';

export function InvestModal({ story, onClose }: InvestModalProps) {
  const {
    isOfficial,
    currentStardust,
    targetPrice,
    amount,
    customInput,
    message,
    setMessage,
    paymentMethod,
    setPaymentMethod,
    agreeTerms,
    setAgreeTerms,
    loading,
    error,
    successPaidAmount,
    showEmailVerify,
    setShowEmailVerify,
    feeDetails,
    handleSelectPreset,
    handleCustomChange,
    handleCheckout,
  } = useInvestModal(story, onClose);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      onClick={() => onClose()}
    >
      <div
        className="glass-strong rounded-3xl w-full max-w-lg p-6 sm:p-7 glow-border bg-zinc-950 border border-amber-400/30 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {successPaidAmount !== null ? (
          <div className="text-center py-8 scale-in space-y-2">
            <div className="text-5xl mb-2 hourglass-anim inline-block">⭐</div>
            <h3 className="text-xl font-bold text-amber-200">願望星已順利送達！</h3>
            <p className="text-zinc-300 text-xs">
              已注入 <span className="text-amber-300 font-bold font-mono">{successPaidAmount}</span> 顆星塵至心願中
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  購買虛擬星星 · 投下心願互動
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  對象：{story.product_name}
                  {!isOfficial && (
                    <span className="text-amber-300 font-mono ml-1">
                      (目前 {currentStardust.toLocaleString()} / 目標 {targetPrice.toLocaleString()} 顆)
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => onClose()} className="rounded-full hover:bg-white/10 p-1 text-gray-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-amber-100">✍️ 留下一則互動星語 (限 50 字)</label>
                <span className="text-[11px] text-amber-300/80 font-mono">(剩餘 {50 - message.length} 字)</span>
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

            <div>
              <label className="text-xs font-bold text-amber-100 block mb-2">⭐ 選擇星星投入數量</label>
              <PresetButtons
                amount={amount}
                customInput={customInput}
                onSelectPreset={handleSelectPreset}
                onCustomChange={handleCustomChange}
              />
            </div>

            <FeeSummary amount={amount} feeDetails={feeDetails} />

            <div className="flex items-center justify-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setPaymentMethod('ecpay')}
                className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  paymentMethod === 'ecpay' ? 'border-amber-400/50 bg-amber-500/15 text-amber-200 font-bold' : 'border-white/10 bg-white/5 text-gray-400'
                }`}
              >
                💳 信用卡 (綠界科技 ECPay)
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

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded border-amber-400/40 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-zinc-300 leading-relaxed">
                  我已明瞭並同意：本服務屬於一經提供即完成之數位內容與社群互動服務。付款完成當下代表數位商品已交付且消費程序已終結，屬於消保法不適用 7 天鑑賞期之數位內容，不接受任何形式之退費、退點或轉讓。
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
                  <Lock className="w-3.5 h-3.5" /> 確認付款並投下願望星 (NT$ {feeDetails.total.toLocaleString()})
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 🌟 付款前強制信箱認證彈窗 */}
      {showEmailVerify && (
        <EmailVerificationModal
          onClose={() => setShowEmailVerify(false)}
          onVerified={() => {
            setShowEmailVerify(false);
          }}
        />
      )}
    </div>,
    document.body
  );
}

export default InvestModal;