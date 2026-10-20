// src/components/WishCard/useWishCard.ts
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { blockWish, deleteWish, updateWish, OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import type { Wish } from '@/types/wish';
import type { CardTier } from './types';

export function useWishCard(
  wish: Wish,
  onCardDeleted?: (wishId: string) => void,
  onWishUpdated?: (updatedWish: Wish) => void // 👈 增加第 3 個參數
) {
  const { session, isBanned, isAdmin, refreshProfile } = useAuth();
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(wish.isBookmarked));
  const [showInvest, setShowInvest] = useState(false);
  const [showDriftModal, setShowDriftModal] = useState(false);

  const [showActionModal, setShowActionModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isOfficial = wish.id === OFFICIAL_SPONSOR_ID;
  const targetPrice = Number(wish.product_price || 1);

  // 本地即時響應星塵與個人贊助額度
  const [localStardust, setLocalStardust] = useState(Number(wish.current_stardust || 0));
  const [myLocalInvest, setMyLocalInvest] = useState(Number(wish.myInvestAmount || 0));

  useEffect(() => {
    setLocalStardust(Number(wish.current_stardust || 0));
    setMyLocalInvest(Number(wish.myInvestAmount || 0));
  }, [wish.current_stardust, wish.myInvestAmount]);

  // 進度與達成狀態
  const progress = Math.round((localStardust / targetPrice) * 100);
  const isFulfilled = wish.status === 'fulfilled' || wish.status === 'full_funded' || progress >= 100;
  const isOverFunded = progress > 100;
  const isExactlyFunded = progress === 100;
  const isNearComplete = progress >= 90 && progress < 100;
  const isCardShining = isOfficial || isFulfilled;

  // 動態個人貢獻佔比
  const ratio = useMemo(() => {
    if (myLocalInvest <= 0) return 0;
    return Math.round((myLocalInvest / targetPrice) * 1000) / 10;
  }, [myLocalInvest, targetPrice]);

  // 四階段守護階梯樣式
  const tier: CardTier | null = useMemo(() => {
    if (ratio <= 0) return null;
    if (ratio >= 50) {
      return {
        level: 4,
        label: `✦ 守護神 · ${ratio}%`,
        cardClass: 'tier-4-card',
        glimmerClass: 'tier-4-glimmer',
        badgeClass: 'bg-amber-950/80 border-amber-400/60 text-amber-200 shadow-sm',
      };
    }
    if (ratio >= 40) {
      return {
        level: 3,
        label: `✦ 耀夜者 · ${ratio}%`,
        cardClass: 'tier-3-card',
        glimmerClass: 'tier-3-glimmer',
        badgeClass: 'bg-zinc-900/90 border-amber-500/40 text-amber-300',
      };
    }
    if (ratio >= 20) {
      return {
        level: 2,
        label: `✦ 領航者 · ${ratio}%`,
        cardClass: 'tier-2-card',
        glimmerClass: 'tier-2-glimmer',
        badgeClass: 'bg-zinc-900/90 border-amber-300/30 text-amber-100',
      };
    }
    return {
      level: 1,
      label: `✦ 已守護 · ${ratio}%`,
      cardClass: 'tier-1-card',
      glimmerClass: 'tier-1-glimmer',
      badgeClass: 'bg-zinc-900/80 border-white/20 text-zinc-300',
    };
  }, [ratio]);

  // 3D 卡牌滑鼠視差計算
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardContainerRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    card.style.setProperty('--pointer-x', `${Math.round((x / rect.width) * 100)}%`);
    card.style.setProperty('--pointer-y', `${Math.round((y / rect.height) * 100)}%`);
    card.style.setProperty('--rotate-x', `${((y - centerY) / centerY) * -7}deg`);
    card.style.setProperty('--rotate-y', `${((x - centerX) / centerX) * 7}deg`);
    card.style.setProperty('--card-opacity', '1');
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardContainerRef.current;
    if (!card) return;
    card.style.setProperty('--card-opacity', '0');
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
  }, []);

  useEffect(() => {
    if (!session?.user?.id || isOfficial) return;
    supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('wish_id', wish.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsBookmarked(true);
      });
  }, [session?.user?.id, wish.id, isOfficial]);

  const handleToggleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!session?.user?.id) return alert('請先登入後再加入追番收藏！');
      if (isBanned) return alert('您的帳號已被停權，無法使用收藏功能。');

      try {
        if (isBookmarked) {
          await supabase.from('bookmarks').delete().eq('user_id', session.user.id).eq('wish_id', wish.id);
          setIsBookmarked(false);
        } else {
          await supabase.from('bookmarks').insert({ user_id: session.user.id, wish_id: wish.id });
          setIsBookmarked(true);
        }
      } catch (err) {
        console.error('收藏切換失敗:', err);
      }
    },
    [session?.user?.id, isBanned, isBookmarked, wish.id]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!actionReason.trim()) return alert('請填寫理由');
    setIsActionLoading(true);
    try {
      if (isAdmin) {
        await blockWish(wish.id, actionReason.trim());
        alert('管理員操作成功：卡片已即刻下架隱藏。');
      } else {
        await updateWish(wish.id, { is_reported: true, report_reason: actionReason.trim() });
        alert('感謝通報！管理團隊將在後台進行查核。');
      }
      setShowActionModal(false);
      setActionReason('');
      window.location.reload();
    } catch (e: unknown) {
      alert(`操作失敗: ${e instanceof Error ? e.message : '未知錯誤'}`);
    } finally {
      setIsActionLoading(false);
    }
  }, [actionReason, isAdmin, wish.id]);

  const handleDeleteCard = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isAdmin) return;
      if (!confirm(`確定要永久刪除心願「${wish.product_name}」嗎？此操作將清除所有關聯紀錄！`)) {
        return;
      }
      try {
        await deleteWish(wish.id);
        alert('卡片已永久自資料庫刪除！');
        if (onCardDeleted) onCardDeleted(wish.id);
        else window.location.reload();
      } catch (err: unknown) {
        alert(`刪除失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
      }
    },
    [isAdmin, wish.id, wish.product_name, onCardDeleted]
  );

  // 投星完成後的即時響應
  const handleInvestClosed = useCallback(
    (addedAmount?: number) => {
      setShowInvest(false);
      if (addedAmount && addedAmount > 0) {
        const newTotal = (wish.current_stardust || 0) + addedAmount;
        const newMyInvest = (wish.myInvestAmount || 0) + addedAmount;
        setLocalStardust(newTotal);
        setMyLocalInvest(newMyInvest);

        // 🌟 即時將更新同步回傳給 HomePage，全域更新首頁列表與排行榜
        if (onWishUpdated) {
          onWishUpdated({
            ...wish,
            current_stardust: newTotal,
            myInvestAmount: newMyInvest,
          });
        }
      }
      refreshProfile();
    },
    [wish, onWishUpdated, refreshProfile]
  );

  return {
    cardContainerRef,
    isFlipped,
    setIsFlipped,
    isBookmarked,
    showInvest,
    setShowInvest,
    showDriftModal,
    setShowDriftModal,
    showActionModal,
    setShowActionModal,
    actionReason,
    setActionReason,
    isActionLoading,
    isOfficial,
    targetPrice,
    localStardust,
    progress,
    isFulfilled,
    isOverFunded,
    isExactlyFunded,
    isNearComplete,
    isCardShining,
    tier,
    isAdmin,
    session,
    handleMouseMove,
    handleMouseLeave,
    handleToggleBookmark,
    handleConfirmAction,
    handleDeleteCard,
    handleInvestClosed,
  };
}