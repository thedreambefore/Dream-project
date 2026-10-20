import { useState, useEffect, useCallback } from 'react';
import { fetchAllWishesForAdmin, updateWish, blockWish } from '@/lib/backend';
import type { Wish } from '@/types/wish';

export function usePendingWishes() {
  const [stories, setStories] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPending = useCallback(async () => {
    setLoading(true);
    const all = await fetchAllWishesForAdmin();
    setStories(all.filter((s) => s.status === 'pending'));
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  const handleApprove = useCallback(
    async (id: string) => {
      await updateWish(id, { status: 'approved' });
      alert('審核通過！該心願卡片已正式登上首頁交易所。');
      loadPending();
    },
    [loadPending]
  );

  const handleReject = useCallback(
    async (id: string) => {
      const reason = prompt('請輸入駁回原因：', '內容描述不全或商品連結無效');
      if (!reason) return;
      await blockWish(id, reason);
      loadPending();
    },
    [loadPending]
  );

  return {
    stories,
    loading,
    handleApprove,
    handleReject,
  };
}