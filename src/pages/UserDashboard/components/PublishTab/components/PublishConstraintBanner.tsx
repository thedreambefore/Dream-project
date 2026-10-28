// src/pages/UserDashboard/components/PublishTab/components/PublishConstraintBanner.tsx
import { ShieldAlert, BookOpen, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { Wish } from '@/types/wish';

interface Props {
  reason: string;
  blockingWish: Wish | null;
  onSwitchToMyWishes?: () => void;
}

export function PublishConstraintBanner({ reason, blockingWish, onSwitchToMyWishes }: Props) {
  // 純資料呈現輔助
  const getStatusText = (wish: Wish) => {
    if (wish.letter_status === 'approved') return '✓ 開箱感謝信已審核通過（若贈禮寄送排定中，請待官方出貨完成結算）';
    if (wish.letter_status === 'pending') return '⏳ 開箱感謝信審核中（官方審查通過後即刻解鎖）';
    if (wish.letter_status === 'rejected') return '⚠️ 感謝信曾被駁回，請修正後重新送審';
    if (wish.status === 'fulfilled') return '贈禮已送達，請撰寫開箱感謝信並待審核通過';
    return '活動進行中，尚未撰寫開箱信';
  };

  return (
    <div className="glass rounded-2xl p-6 glow-border bg-zinc-950 border border-amber-400/40 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center flex-shrink-0 text-amber-300">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>
        <div className="space-y-1.5 flex-1">
          <h3 className="text-sm font-bold text-amber-200">【星願守護閉環規範】暫無法開啟新心願</h3>
          <p className="text-xs text-zinc-300 leading-relaxed">{reason}</p>
        </div>
      </div>

      {blockingWish && (
        <div className="bg-black/50 border border-white/10 rounded-xl p-3 text-xs space-y-1.5 font-mono">
          <div className="text-amber-300 font-bold">當前活動：{blockingWish.product_name}</div>
          <div className="text-zinc-300 flex items-center gap-1.5">
            {blockingWish.letter_status === 'approved' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            ) : null}
            <span>感謝信狀態：{getStatusText(blockingWish)}</span>
          </div>
        </div>
      )}

      {onSwitchToMyWishes && (
        <button
          type="button"
          onClick={onSwitchToMyWishes}
          className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>前往「我的心願」查看進度或撰寫感謝信</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      )}
    </div>
  );
}