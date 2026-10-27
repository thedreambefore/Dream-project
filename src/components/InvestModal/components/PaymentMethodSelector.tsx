// src/components/InvestModal/components/PaymentMethodSelector.tsx
import type { PaymentMethod } from '../types';

interface Props {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
}

export function PaymentMethodSelector({ paymentMethod, setPaymentMethod }: Props) {
  return (
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
  );
}