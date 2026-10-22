// src/pages/UserDashboard/components/MyWishesTab/components/TaxComplianceBanner.tsx
import { ShieldAlert, ArrowRight } from 'lucide-react';
import type { Wish } from '@/types/wish';

interface Props {
  targetWish: Wish;
  onGoToAccount?: () => void;
}

export function TaxComplianceBanner({ targetWish, onGoToAccount }: Props) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/50 shadow-lg shadow-amber-500/10 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-amber-300 mt-0.5">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 text-xs space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-amber-200">
              🎉 恭喜心願達成！【活動贈禮寄送必填提醒】
            </span>
            <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30">
              所得稅法申報作業
            </span>
          </div>
          <p className="text-zinc-300 leading-relaxed">
            您的主題心願 <b className="text-amber-100">「{targetWish.product_name}」</b> 已圓滿達成（總額 NT$ {targetWish.product_price.toLocaleString()}）。
            依據我國所得稅法規定，年度受贈活動贈禮價值超過 NT$ 1,000 須由平台開立免扣繳憑單。請補填您的<b>「身分證字號」</b>與<b>「戶籍地址」</b>，以便管理團隊安排寄送活動贈禮！
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onGoToAccount}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>立即前往「帳號資訊」補填身分資料</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}