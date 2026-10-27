// src/components/InvestModal/index.tsx
import { createPortal } from 'react-dom';
import { X, Sparkles, AlertCircle, Lock, Loader2 } from 'lucide-react';
import { PresetButtons } from './components/PresetButtons';
import { FeeSummary } from './components/FeeSummary';
import { PaymentMethodSelector } from './components/PaymentMethodSelector';
import { TermsAgreementSection } from './components/TermsAgreementSection';
import { InvestMessageInput } from './components/InvestMessageInput';
import { EmailVerificationModal } from '@/components/EmailVerificationModal';
import { useInvestModal } from './useInvestModal';
import type { InvestModalProps } from './types';

export function InvestModal({ story, onClose }: InvestModalProps) {
  const m = useInvestModal(story, onClose);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto" onClick={() => onClose()}>
      <div className="glass-strong rounded-3xl w-full max-w-lg p-6 sm:p-7 glow-border bg-zinc-950 border border-amber-400/30 shadow-2xl my-auto space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-300" /> 購買虛擬星星 · 投下心願互動</h2>
            <p className="text-xs text-zinc-400 mt-0.5">對象：{story.product_name} {!m.isOfficial && <span className="text-amber-300 font-mono">({m.currentStardust}/{m.targetPrice} 顆)</span>}</p>
          </div>
          <button onClick={() => onClose()} className="rounded-full hover:bg-white/10 p-1 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <InvestMessageInput message={m.message} setMessage={m.setMessage} />
        <div>
          <label className="text-xs font-bold text-amber-100 block mb-2">⭐ 選擇星星投入數量</label>
          <PresetButtons amount={m.amount} customInput={m.customInput} onSelectPreset={m.handleSelectPreset} onCustomChange={m.handleCustomChange} />
        </div>

        <FeeSummary amount={m.amount} feeDetails={m.feeDetails} />
        <PaymentMethodSelector paymentMethod={m.paymentMethod} setPaymentMethod={m.setPaymentMethod} />
        <TermsAgreementSection agreeTerms={m.agreeTerms} setAgreeTerms={m.setAgreeTerms} />

        {m.error && <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-center flex items-center justify-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{m.error}</p>}

        <button onClick={m.handleCheckout} disabled={m.loading || !m.agreeTerms || m.amount < 50} className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-gray-950 font-black rounded-xl py-3 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 cursor-pointer text-xs">
          {m.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Lock className="w-3.5 h-3.5" /> 確認付款並投下願望星 (NT$ {m.feeDetails.total.toLocaleString()})</>}
        </button>
      </div>
      {m.showEmailVerify && <EmailVerificationModal onClose={() => m.setShowEmailVerify(false)} onVerified={() => m.setShowEmailVerify(false)} />}
    </div>,
    document.body
  );
}

export default InvestModal;