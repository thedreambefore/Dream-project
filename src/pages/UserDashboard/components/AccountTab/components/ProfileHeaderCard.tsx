// src/pages/UserDashboard/components/AccountTab/components/ProfileHeaderCard.tsx
import { CheckCircle2 } from 'lucide-react';

interface Props {
  email?: string;
  isPhoneVerified?: boolean;
}

export function ProfileHeaderCard({ email, isPhoneVerified }: Props) {
  return (
    <div className="glass rounded-2xl p-5 glow-border bg-zinc-900/40">
      <p className="text-xs text-gray-500 mb-1">登入憑證帳號 (Email)</p>
      <p className="text-sm font-mono text-amber-200">{email || '星旅人'}</p>
      <div className="mt-3">
        {isPhoneVerified ? (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> 電子信箱已驗證
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-gray-400">
            ⚠️ 電子信箱未驗證（心願與投星功能受限）
          </span>
        )}
      </div>
    </div>
  );
}