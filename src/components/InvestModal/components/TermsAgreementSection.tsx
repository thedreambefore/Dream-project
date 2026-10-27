// src/components/InvestModal/components/TermsAgreementSection.tsx
import { CONSUMER_PROTECTION_STATEMENT } from '@/constants/compliance';

interface Props {
  agreeTerms: boolean;
  setAgreeTerms: (agree: boolean) => void;
}

export function TermsAgreementSection({ agreeTerms, setAgreeTerms }: Props) {
  return (
    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="mt-0.5 rounded border-amber-400/40 text-amber-500 focus:ring-0 cursor-pointer"
        />
        <span className="text-[11px] text-zinc-300 leading-relaxed">
          {CONSUMER_PROTECTION_STATEMENT}
        </span>
      </label>
    </div>
  );
}