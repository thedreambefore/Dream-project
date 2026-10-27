// src/components/EmailVerificationModal/components/OtpInputForm.tsx
import { Loader2, AlertCircle } from 'lucide-react';

interface Props {
  email: string;
  token: string;
  setToken: (val: string) => void;
  mockCode: string | null;
  error: string;
  loading: boolean;
  onSendOtp: () => void;
  onVerifyOtp: (e: React.FormEvent) => void;
}

export function OtpInputForm({
  email,
  token,
  setToken,
  mockCode,
  error,
  loading,
  onSendOtp,
  onVerifyOtp,
}: Props) {
  return (
    <form onSubmit={onVerifyOtp} className="space-y-3">
      <div className="bg-zinc-900 border border-white/10 rounded-xl p-3 text-center">
        <p className="text-xs text-zinc-300">
          驗證碼已送出至 <span className="text-amber-300 font-mono">{email}</span>
        </p>
        {mockCode ? (
          <p className="text-[11px] text-emerald-300 mt-1 bg-emerald-500/10 py-1 px-2 rounded border border-emerald-500/20">
            [測試備用碼]：<span className="font-bold text-sm tracking-widest text-white">{mockCode}</span>
          </p>
        ) : (
          <p className="text-[11px] text-zinc-500 mt-0.5">（請查看收件匣中的數字驗證碼）</p>
        )}
      </div>

      <input
        type="text"
        maxLength={8}
        value={token}
        onChange={(e) => setToken(e.target.value.replace(/\s/g, ''))}
        placeholder="請輸入 6 ~ 8 位數驗證碼"
        className="w-full text-center text-lg tracking-[0.25em] font-mono bg-zinc-900 border border-white/15 rounded-xl py-2.5 text-white focus:outline-none focus:border-amber-400"
        autoFocus
      />

      {error && (
        <p className="text-red-400 text-xs text-center flex items-center justify-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onSendOtp}
          disabled={loading}
          className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded-xl cursor-pointer"
        >
          重新發送
        </button>
        <button
          type="submit"
          disabled={loading || token.trim().length < 6}
          className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-40"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '確認驗證解鎖'}
        </button>
      </div>
    </form>
  );
}