// src/pages/AdminConsole/components/ModerationTab/useModeration.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  fetchAllWishesForAdmin,
  isBlockedStatus,
  updateWish,
  blockWish,
  unblockWish,
} from '@/lib/backend';
import { fetchWishInvestments } from '../../services/adminService';
import type { Wish } from '@/types/wish';
import type { InvestmentWithUser } from '../../types';

export type ModerationSubTab = 'reported' | 'letters' | 'fulfilled';

export function useModeration() {
  const [stories, setStories] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [subTab, setSubTab] = useState<ModerationSubTab>('reported');

  const [shippingStory, setShippingStory] = useState<Wish | null>(null);
  const [investmentsList, setInvestmentsList] = useState<InvestmentWithUser[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(false);

  const loadStories = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllWishesForAdmin();
    setStories(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const reportedWishes = useMemo(
    () => stories.filter((s) => s.is_reported && !isBlockedStatus(s.status)),
    [stories]
  );
  const pendingLetters = useMemo(
    () => stories.filter((s) => s.letter_status === 'pending'),
    [stories]
  );
  const fulfilledWishes = useMemo(
    () =>
      stories.filter(
        (s) =>
          (s.status === 'full_funded' || Number(s.current_stardust) >= Number(s.product_price)) &&
          s.status !== 'fulfilled'
      ),
    [stories]
  );

  const handleApproveLetter = useCallback(
    async (id: string) => {
      await updateWish(id, { letter_status: 'approved' });
      alert('感謝信已審核通過！');
      loadStories();
    },
    [loadStories]
  );

  const handleRejectLetter = useCallback(
    async (id: string) => {
      const reason = prompt('請輸入感謝信駁回修改原因：', '感謝信內容過於簡略，或照片未清晰拍攝商品。');
      if (!reason) return;
      await updateWish(id, { letter_status: 'rejected', letter_reject_reason: reason });
      alert('已駁回，創作者可根據理由重新提交。');
      loadStories();
    },
    [loadStories]
  );

  const handleOpenShippingModal = useCallback(async (story: Wish) => {
    setShippingStory(story);
    setLoadingInvestments(true);
    try {
      const data = await fetchWishInvestments(story.id);
      setInvestmentsList(data);
    } catch (e) {
      console.warn('載入留言失敗:', e);
      setInvestmentsList([]);
    } finally {
      setLoadingInvestments(false);
    }
  }, []);

  const handleDismissReport = useCallback(
    async (id: string) => {
      await updateWish(id, { is_reported: false, report_reason: null });
      alert('已駁回檢舉。');
      loadStories();
    },
    [loadStories]
  );

  const handleConfirmBlock = useCallback(
    async (id: string, reason: string) => {
      await blockWish(id, reason || '管理員查核違規下架');
      loadStories();
    },
    [loadStories]
  );

  return {
    stories,
    loading,
    subTab,
    setSubTab,
    reportedWishes,
    pendingLetters,
    fulfilledWishes,
    shippingStory,
    setShippingStory,
    investmentsList,
    loadingInvestments,
    loadStories,
    handleApproveLetter,
    handleRejectLetter,
    handleOpenShippingModal,
    handleDismissReport,
    handleConfirmBlock,
  };
}