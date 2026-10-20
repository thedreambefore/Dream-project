import type { FeeCalculation } from '@/services/investmentService';

interface Props {
  amount: number;
  feeDetails: FeeCalculation;
}

export function FeeSummary({ amount, feeDetails }: Props) {
  return (
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
  );
}