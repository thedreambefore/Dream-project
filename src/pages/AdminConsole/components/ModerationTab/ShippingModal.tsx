// src/pages/AdminConsole/components/ModerationTab/ShippingModal.tsx
import { createPortal } from 'react-dom';
import { X, Package, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useShippingModal } from './useShippingModal';
import type { Wish } from '@/types/wish';
import type { InvestmentWithUser } from '../../types';

interface Props {
  shippingStory: Wish;
  investmentsList: InvestmentWithUser[];
  loadingInvestments: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShippingModal({ shippingStory, investmentsList, loadingInvestments, onClose, onSuccess }: Props) {
  const s = useShippingModal(shippingStory, investmentsList, onSuccess);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-strong rounded-3xl w-full max-w-xl p-6 glow-border border-emerald-400/30 bg-zinc-950 space-y-4 my-auto">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-emerald-300 flex items-center gap-1.5"><Package className="w-4 h-4" /> 活動贈禮寄送與審核終章</h3>
            <p className="text-xs text-zinc-400">心願活動：{shippingStory.product_name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {s.isTaxThresholdReached && (
          <div className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${s.isShippingFrozen ? 'bg-red-950/30 border-red-500/40 text-red-200' : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'}`}>
            <div className="flex items-center gap-1.5 font-bold">
              {s.isShippingFrozen ? <><ShieldAlert className="w-4 h-4 text-red-400" /><span>【合規警戒 · 贈禮寄送已凍結】所得稅免扣繳申報資料未齊</span></> : <><CheckCircle2 className="w-4 h-4 text-emerald-400" /><span>【稅務合規審驗通過】提案人已完備資料</span></>}
            </div>
            <p className="text-[11px] opacity-90">總額 NT$ {shippingStory.product_price.toLocaleString()}（已逾千元申報門檻）。{s.isShippingFrozen ? '提案人未齊身分證或戶籍地址。' : `身分證：${s.creatorTaxInfo?.id_number?.substring(0, 4)}**** · 戶籍：${s.creatorTaxInfo?.domicile_address}`}</p>
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-amber-200 mb-2">支持者星砂漂流瓶名冊 ({s.investments.length} 則)</p>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
            {loadingInvestments ? <p className="text-xs text-zinc-500 text-center py-4">讀取中...</p> : s.investments.map((inv) => (
              <div key={inv.id} className={`p-2.5 rounded-xl border text-xs flex justify-between items-center gap-2 ${inv.is_hidden ? 'bg-red-950/20 border-red-500/30 opacity-60' : 'bg-zinc-900 border-white/5'}`}>
                <div className="flex-1">
                  <span className="text-amber-400 font-mono font-bold">+${inv.amount}</span> <span className="text-[10px] text-zinc-400">by {inv.users?.anonymous_nickname || '匿名星旅人'}</span>
                  <p className={`mt-0.5 ${inv.is_hidden ? 'line-through text-red-400' : 'text-zinc-200'}`}>{inv.message || '(無留言)'}</p>
                </div>
                <button type="button" onClick={() => s.handleToggleHide(inv.id, inv.is_hidden)} className="text-[10px] px-2 py-1 rounded-lg border font-bold cursor-pointer">{inv.is_hidden ? '復原' : '剔除'}</button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-amber-200 block mb-1">官方見證祝福</label>
          <textarea rows={2} value={s.adminBlessing} onChange={(e) => s.setAdminBlessing(e.target.value)} placeholder="留空將自動帶入溫暖祝福..." className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white resize-none" />
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={onClose} className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 cursor-pointer">取消</button>
          <button onClick={s.handleConfirmShipment} disabled={s.submitting || s.isShippingFrozen} className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 ${s.isShippingFrozen ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 cursor-pointer'}`}>
            {s.submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : s.isShippingFrozen ? '贈禮已凍結' : '確認完成贈禮寄送 (結算點數)'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}