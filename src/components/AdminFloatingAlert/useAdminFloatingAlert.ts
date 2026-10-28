// src/components/AdminFloatingAlert/useAdminFloatingAlert.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import type { AdminTab } from '@/pages/AdminConsole/types';

export type AlertColorType = 'yellow' | 'red' | 'purple' | 'blue' | 'none';

export function useAdminFloatingAlert(onOpenAdminWithTab: (tab: AdminTab) => void) {
  const { isAdmin } = useAuth();
  const [hasItems, setHasItems] = useState(false);
  const [alertType, setAlertType] = useState<AlertColorType>('none');
  const [targetTab, setTargetTab] = useState<AdminTab>('pending');
  const [label, setLabel] = useState('');

  const checkPendingReviews = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data: wishes } = await supabase
        .from('wishes')
        .select('id, status, is_reported, letter_status, current_stardust, product_price');

      if (!wishes) return;

      // 1. 心願審核 (黃色 - pending wishes)
      const pendingWishes = wishes.filter((w) => w.status === 'pending');
      if (pendingWishes.length > 0) {
        setHasItems(true);
        setAlertType('yellow');
        setTargetTab('pending');
        setLabel(`${pendingWishes.length} 則新心願待審核`);
        return;
      }

      // 2. 檢舉審核 (紅色 - reported)
      const reportedWishes = wishes.filter((w) => w.is_reported && w.status !== 'blocked');
      if (reportedWishes.length > 0) {
        setHasItems(true);
        setAlertType('red');
        setTargetTab('moderation');
        setLabel(`${reportedWishes.length} 則檢舉待查核`);
        return;
      }

      // 3. 感謝信審核 (紫色 - pending letters)
      const pendingLetters = wishes.filter((w) => w.letter_status === 'pending');
      if (pendingLetters.length > 0) {
        setHasItems(true);
        setAlertType('purple');
        setTargetTab('moderation');
        setLabel(`${pendingLetters.length} 封開箱信待審核`);
        return;
      }

      // 4. 滿額待出貨 (藍色 - fulfilled/full_funded)
      const pendingShipping = wishes.filter(
        (w) =>
          (w.status === 'full_funded' || Number(w.current_stardust) >= Number(w.product_price)) &&
          w.status !== 'fulfilled'
      );
      if (pendingShipping.length > 0) {
        setHasItems(true);
        setAlertType('blue');
        setTargetTab('moderation');
        setLabel(`${pendingShipping.length} 件心願滿額待寄送`);
        return;
      }

      setHasItems(false);
      setAlertType('none');
      setLabel('');
    } catch (e) {
      console.warn('檢查待審項目異常:', e);
    }
  }, [isAdmin]);

  useEffect(() => {
    checkPendingReviews();
    const interval = setInterval(checkPendingReviews, 30000);
    return () => clearInterval(interval);
  }, [checkPendingReviews]);

  const colorStyles = useMemo(() => {
    switch (alertType) {
      case 'yellow':
        return 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-amber-500/30';
      case 'red':
        return 'bg-red-500/20 text-red-300 border-red-400 shadow-red-500/30';
      case 'purple':
        return 'bg-purple-500/20 text-purple-300 border-purple-400 shadow-purple-500/30';
      case 'blue':
        return 'bg-sky-500/20 text-sky-300 border-sky-400 shadow-sky-500/30';
      default:
        return '';
    }
  }, [alertType]);

  const handleClick = useCallback(() => {
    onOpenAdminWithTab(targetTab);
  }, [onOpenAdminWithTab, targetTab]);

  return {
    isVisible: isAdmin && hasItems,
    label,
    colorStyles,
    handleClick,
  };
}