// src/pages/AdminConsole/components/ModerationTab/ShippingModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Package, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
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

  // 提案人稅務資料閘門檢查狀態
  const [loadingCreator, setLoadingCreator] = useState(true);
  const [creatorTaxInfo, setCreatorTaxInfo] = useState<{
    id_number: string | null;
    domicile_address: string | null;
    real_name: string | null;
    phone: string | null;
  } | null>(null);

  const isTaxThresholdReached = Number(shippingStory.product_price || 0) >= 1000;

  useEffect(() => {
    async function loadCreatorTaxProfile() {
      setLoadingCreator(true);
      const { data } = await supabase
        .from('users')
        .select('id_number, domicile_address, real_name, phone')
        .eq('id', shippingStory.user_id)
        .maybeSingle();

      if (data) {
        setCreatorTaxInfo(data);
      }
      setLoadingCreator(false);
    }
    loadCreatorTaxProfile();
  }, [shippingStory.user_id]);

  // 閘門判定：金額超過千元且未填妥稅務資料 ➔ 凍結贈禮寄送
  const isShippingFrozen =
    isTaxThresholdReached && (!creatorTaxInfo?.id_number || !creatorTaxInfo?.domicile_address);

  const handleToggleHide = async (invId: string, currentHidden: boolean) => {
    await supabase.from('investments').update({ is_hidden: !currentHidden }).eq('id', invId);
    setInvestments((prev) =>
      prev.map((item) => (item.id === invId ? { ...item, is_hidden: !currentHidden } : item))
    );
  };

  const handleConfirmShipment = async () => {
    if (isShippingFrozen) {
      alert('【贈禮寄送凍結】提案人尚未補齊所得稅申報所需之身分證字號與戶籍地址！');
      return;
    }

    setSubmitting(true);
    try {
      await fulfillWishAndSettleHonor(shippingStory.id, adminBlessing);
      alert('已完成活動贈禮寄送審核！支持者榮譽點數已全數結算！');
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
              <Package className="w-4 h-4" /> 活動贈禮寄送與審核終章
            </h3>
            <p className="text-xs text-zinc-400">心願活動：{shippingStory.product_name}</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 核心防護閘門提示卡（合規用語校正） */}
        {loadingCreator ? (
          <div className="p-3 text-center text-xs text-zinc-500">正在核對提案人稅務資料...</div>
        ) : isTaxThresholdReached ? (
          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
              isShippingFrozen
                ? 'bg-red-950/30 border-red-500/40 text-red-200'
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              {isShippingFrozen ? (
                <>
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>【合規警戒 · 贈禮寄送已凍結】所得稅免扣繳申報資料未齊</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>【稅務合規審驗通過】提案人已完備身分證與戶籍資料</span>
                </>
              )}
            </div>
            <p className="text-[11px] opacity-90">
              心願總額 NT$ {shippingStory.product_price.toLocaleString()}（已逾 NT$ 1,000 法規申報門檻）。
              {isShippingFrozen
                ? ' 提案人尚未填寫身分證字號或戶籍地址，依所得稅法規定凍結活動贈禮寄送流程，請提醒提案人至「帳號資訊」補填。'
                : ` 身分證字號：${creatorTaxInfo?.id_number?.substring(0, 4)}**** · 戶籍地址：${creatorTaxInfo?.domicile_address}`}
            </p>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-bold text-amber-200 mb-2">
            支持者星砂漂流瓶名冊 ({investments.length} 則)
          </p>
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 hide-scrollbar">
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
            disabled={submitting || isShippingFrozen}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              isShippingFrozen
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 cursor-pointer'
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                結算並出貨中...
              </>
            ) : isShippingFrozen ? (
              '贈禮寄送已凍結（等待提案人補齊稅務資料）'
            ) : (
              '確認完成贈禮寄送 (結算榮譽點數)'
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}