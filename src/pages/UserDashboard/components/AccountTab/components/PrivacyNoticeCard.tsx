// src/pages/UserDashboard/components/AccountTab/components/PrivacyNoticeCard.tsx
import { ShieldCheck } from 'lucide-react';
import { PRIVACY_POLICY_STATEMENT } from '@/constants/compliance';

export function PrivacyNoticeCard() {
  return (
    <div className="bg-zinc-950/70 border border-amber-400/20 rounded-2xl p-4 text-xs space-y-2">
      <div className="flex items-center gap-2 text-amber-300 font-bold">
        <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
        <span>個資保護與安全告知宣告</span>
      </div>
      <p className="text-[11px] text-zinc-400 leading-relaxed whitespace-pre-line">
        {PRIVACY_POLICY_STATEMENT}
      </p>
    </div>
  );
}