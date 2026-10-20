import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { fulfillWishAndSettleHonor } from '../../services/adminService';
import type { Wish } from '@/types/wish';
import type { InvestmentWithUser } from '../../types';

interface Props {
  shippingStory: Wish;
  investmentsList: InvestmentWithUser[];
  loadingInvestments: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ShippingModal({
  shippingStory,
  investmentsList: initialList,
  loadingInvestments,
  onClose,
  onSuccess,
}: Props) {
  const [investments, setInvestments] = useState<InvestmentWithUser[]>(initialList);
  const [adminBlessing, setAdminBlessing] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleToggleHide = async (invId: string, currentHidden: boolean) => {
    await supabase.from('investments').update({ is_hidden: !currentHidden }).eq('id', invId);
    setInvestments((prev) =>
      prev.map((item) => (item.id === invId ? { ...item, is_hidden: !currentHidden } : item))
    );
  };

  const handleConfirmShipment = async () => {
    setSubmitting(true);
    try {
      await fulfillWishAndSettleHonor(shippingStory.id, adminBlessing);
      alert('已完成出貨審查！贊助者榮譽點數已全數結算！');
      onSuccess();
    } catch (e: unknown) {
      alert(`出貨失敗: ${e instanceof Error ? e.message : '未知錯誤'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-strong rounded-3xl w-full max-w-xl p-6 glow-border border-emerald-400/30 bg-zinc-950 space-y-4 my-auto">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div>
            <h3 className="text-base font-bold text-emerald-300 flex items-center gap-1.5">
              <Package className="w-4 h-4" /> 物流出貨與留言審核終章
            </h3>
            <p className="text-xs text-zinc-400">心願活動：{shippingStory.product_name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <p className="text-xs font-bold text-amber-200 mb-2">
            支持者星砂漂流瓶名冊 ({investments.length} 則)
          </p>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
            {loadingInvestments ? (
              <p className="text-xs text-zinc-500 text-center py-4">讀取留言中...</p>
            ) : investments.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-4">此活動無留存留言。</p>
            ) : (
              investments.map((inv) => (
                <div
                  key={inv.id}
                  className={`p-2.5 rounded-xl border text-xs flex justify-between items-center gap-2 ${
                    inv.is_hidden ? 'bg-red-950/20 border-red-500/30 opacity-60' : 'bg-zinc-900 border-white/5'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono font-bold">+${inv.amount}</span>
                      <span className="text-[10px] text-zinc-400">
                        by {inv.users?.anonymous_nickname || '匿名星旅人'}
                      </span>
                    </div>
                    <p className={`mt-0.5 ${inv.is_hidden ? 'line-through text-red-400' : 'text-zinc-200'}`}>
                      {inv.message || '(無留言)'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleHide(inv.id, inv.is_hidden)}
                    className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition-all cursor-pointer flex-shrink-0 ${
                      inv.is_hidden
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20'
                    }`}
                  >
                    {inv.is_hidden ? '復原顯示' : '剔除隱藏'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-amber-200 block mb-1">
            管理團隊官方祝福 <span className="text-zinc-500 font-normal">(留空將自動帶入溫暖祝福)</span>
          </label>
          <textarea
            rows={2}
            value={adminBlessing}
            onChange={(e) => setAdminBlessing(e.target.value)}
            placeholder="夢沙星空見證了這份純粹的善意，願這份溫暖伴隨你迎向嶄新的明天！"
            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white resize-none focus:outline-none focus:border-emerald-400/50"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={handleConfirmShipment}
            disabled={submitting}
            className="flex-1 py-2.5 text-xs bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                結算並出貨中...
              </>
            ) : (
              '確認完成出貨 (結算榮譽點數)'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}