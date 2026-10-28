// src/pages/AdminConsole/components/ModerationTab/useShippingModal.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fulfillWishAndSettleHonor } from '../../services/adminService';
import type { Wish } from '@/types/wish';
import type { InvestmentWithUser } from '../../types';

export function useShippingModal(
  shippingStory: Wish,
  initialList: InvestmentWithUser[],
  onSuccess: () => void
) {
  const [investments, setInvestments] = useState<InvestmentWithUser[]>(initialList);
  const [adminBlessing, setAdminBlessing] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingCreator, setLoadingCreator] = useState(true);

  // 🌟 前端資安強化：只保留布林合規狀態，不儲存任何身分證與戶籍地址明文字串
  const [hasCompletedTaxInfo, setHasCompletedTaxInfo] = useState(false);

  const isTaxThresholdReached = Number(shippingStory.product_price || 0) >= 1000;

  useEffect(() => {
    async function checkTaxReadiness() {
      setLoadingCreator(true);
      const { data } = await supabase
        .from('users')
        .select('id_number, domicile_address, real_name')
        .eq('id', shippingStory.user_id)
        .maybeSingle();

      // 僅在記憶體內部確認三項資料皆非空，隨即轉化為純布林值
      const isComplete = Boolean(
        data?.id_number &&
        data?.domicile_address &&
        data?.real_name &&
        data.id_number.trim().length > 0 &&
        data.domicile_address.trim().length > 0
      );
      setHasCompletedTaxInfo(isComplete);
      setLoadingCreator(false);
    }
    checkTaxReadiness();
  }, [shippingStory.user_id]);

  const isShippingFrozen = useMemo(() => {
    return isTaxThresholdReached && !hasCompletedTaxInfo;
  }, [isTaxThresholdReached, hasCompletedTaxInfo]);

  const handleToggleHide = useCallback(async (invId: string, currentHidden: boolean) => {
    await supabase.from('investments').update({ is_hidden: !currentHidden }).eq('id', invId);
    setInvestments((prev) =>
      prev.map((item) => (item.id === invId ? { ...item, is_hidden: !currentHidden } : item))
    );
  }, []);

  const handleConfirmShipment = useCallback(async () => {
    if (isShippingFrozen) {
      alert('【寄送凍結】提案人尚未於系統完備所得稅申報所需之身分資料！');
      return;
    }
    setSubmitting(true);
    try {
      await fulfillWishAndSettleHonor(shippingStory, adminBlessing);
      alert('已完成活動贈禮寄送審核！支持者榮譽點數已全數結算，申報快照已安全加密存檔至資料庫。');
      onSuccess();
    } catch (e: unknown) {
      alert(`出貨失敗: ${e instanceof Error ? e.message : '未知錯誤'}`);
    } finally {
      setSubmitting(false);
    }
  }, [isShippingFrozen, shippingStory, adminBlessing, onSuccess]);

  return {
    investments,
    adminBlessing,
    setAdminBlessing,
    submitting,
    loadingCreator,
    hasCompletedTaxInfo,
    isTaxThresholdReached,
    isShippingFrozen,
    handleToggleHide,
    handleConfirmShipment,
  };
}