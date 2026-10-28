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

  const filteredWishes = useMemo(() => {
    return wishes.filter((w) => {
      const matchSearch =
        (w.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.tag_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.anonymous_nickname || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.id.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;

      return true;
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