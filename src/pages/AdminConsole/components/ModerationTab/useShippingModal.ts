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
  const [creatorTaxInfo, setCreatorTaxInfo] = useState<{
    id_number: string | null;
    domicile_address: string | null;
  } | null>(null);

  const isTaxThresholdReached = Number(shippingStory.product_price || 0) >= 1000;

  useEffect(() => {
    async function loadTax() {
      setLoadingCreator(true);
      const { data } = await supabase
        .from('users')
        .select('id_number, domicile_address')
        .eq('id', shippingStory.user_id)
        .maybeSingle();

      if (data) setCreatorTaxInfo(data);
      setLoadingCreator(false);
    }
    loadTax();
  }, [shippingStory.user_id]);

  const isShippingFrozen = useMemo(() => {
    return isTaxThresholdReached && (!creatorTaxInfo?.id_number || !creatorTaxInfo?.domicile_address);
  }, [isTaxThresholdReached, creatorTaxInfo]);

  const handleToggleHide = useCallback(async (invId: string, currentHidden: boolean) => {
    await supabase.from('investments').update({ is_hidden: !currentHidden }).eq('id', invId);
    setInvestments((prev) =>
      prev.map((item) => (item.id === invId ? { ...item, is_hidden: !currentHidden } : item))
    );
  }, []);

  const handleConfirmShipment = useCallback(async () => {
    if (isShippingFrozen) return alert('【寄送凍結】提案人尚未補齊所得稅申報所需之身分證字號與戶籍地址！');
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
  }, [isShippingFrozen, shippingStory.id, adminBlessing, onSuccess]);

  return {
    investments,
    adminBlessing,
    setAdminBlessing,
    submitting,
    loadingCreator,
    creatorTaxInfo,
    isTaxThresholdReached,
    isShippingFrozen,
    handleToggleHide,
    handleConfirmShipment,
  };
}