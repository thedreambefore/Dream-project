// src/pages/AdminConsole/components/AllCardsTab/useAllCards.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchAllWishesForAdmin } from '@/lib/backend';
import type { Wish, WishStatus } from '@/types/wish';

export function useAllCards() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WishStatus>('all');

  const loadAllCards = useCallback(async () => {
    setLoading(true);
    const data = await fetchAllWishesForAdmin();
    setWishes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAllCards();
  }, [loadAllCards]);

  const handleCardDeleted = useCallback((deletedId: string) => {
    setWishes((prev) => prev.filter((w) => w.id !== deletedId));
  }, []);

  // 🌟 修正搜尋邏輯：嚴格限定於看得到的內容（標題、標籤、暱稱、內文），ID 僅限長度>=8前綴
  const filteredWishes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return wishes.filter((w) => {
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      if (!term) return true;

      const matchText =
        (w.product_name || '').toLowerCase().includes(term) ||
        (w.title || '').toLowerCase().includes(term) ||
        (w.tag_name || '').toLowerCase().includes(term) ||
        (w.anonymous_nickname || '').toLowerCase().includes(term) ||
        (w.story_text || '').toLowerCase().includes(term);

      // 若使用者明確輸入了長 ID（8 碼以上）才進行 ID 前綴比對，避免 2 碼隨機數誤中 UUID
      const matchIdPrefix = term.length >= 8 && w.id.toLowerCase().startsWith(term);

      return matchText || matchIdPrefix;
    });
  }, [wishes, searchTerm, statusFilter]);

  return {
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    filteredWishes,
    totalCount: wishes.length,
    handleCardDeleted,
  };
}