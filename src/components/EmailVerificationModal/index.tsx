// src/components/EmailVerificationModal/index.tsx
import { createPortal } from 'react-dom';
import { X, ShieldCheck, Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useEmailVerification } from './useEmailVerification';
import { OtpInputForm } from './components/OtpInputForm';

export function EmailVerificationModal({ onClose, onVerified }: { onClose: () => void; onVerified: () => void }) {
  const v = useEmailVerification(onClose, onVerified);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={onClose}>
      <div className="glass-strong rounded-3xl w-full max-w-md p-6 sm:p-7 glow-border bg-zinc-950 border border-amber-400/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
          <h2 className="text-base font-bold text-amber-100 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-300" /> 星旅人電子信箱安全認證</h2>
          <button onClick={onClose} className="rounded-full hover:bg-white/10 p-1 text-gray-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {v.verified ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
            <h3 className="text-base font-bold text-emerald-200">信箱認證完成！</h3>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">
              為確保主題活動圓滿時平台能準確投遞活動贈禮與履約通知，請驗證您註冊的電子信箱。
            </p>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input type="text" disabled value={v.email} className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-zinc-200 font-mono" />
            </div>

            {!v.sentCode ? (
              <button type="button" onClick={v.handleSendOtp} disabled={v.loading} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-zinc-950 font-bold rounded-xl py-3 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
                {v.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />} 發送安全驗證碼至信箱
              </button>
            ) : (
              <OtpInputForm email={v.email} token={v.token} setToken={v.setToken} mockCode={v.mockCode} error={v.error} loading={v.loading} onSendOtp={v.handleSendOtp} onVerifyOtp={v.handleVerifyOtp} />
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default EmailVerificationModal;