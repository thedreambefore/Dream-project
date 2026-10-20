import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import type { Wish } from '@/types/wish';

export function useInvested() {
  const { session } = useAuth();
  const [trackedWishes, setTrackedWishes] = useState<Wish[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'invested' | 'bookmarked'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'funding' | 'fulfilled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTracked() {
      if (!session?.user?.id) return;
      setLoading(true);

      const { data: bData } = await supabase
        .from('bookmarks')
        .select('wish_id')
        .eq('user_id', session.user.id);

      const { data: iData } = await supabase
        .from('investments')
        .select('wish_id, story_id, amount')
        .eq('user_id', session.user.id);

      const investMap = new Map<string, number>();
      iData?.forEach((inv) => {
        const id = inv.wish_id || inv.story_id;
        if (id) investMap.set(id, (investMap.get(id) || 0) + Number(inv.amount || 0));
      });

      const bookmarkedSet = new Set(bData?.map((b) => b.wish_id).filter(Boolean) || []);
      const allWishIds = Array.from(new Set([...Array.from(bookmarkedSet), ...Array.from(investMap.keys())]));

      if (allWishIds.length > 0) {
        const { data: wishList } = await supabase.from('wishes').select('*').in('id', allWishIds);
        if (wishList) {
          const merged: Wish[] = wishList.map((w: Wish) => {
            const myAmount = investMap.get(w.id) || 0;
            const targetPrice = Number(w.product_price || 1);
            const ratio = Math.round((myAmount / targetPrice) * 1000) / 10;

            return {
              ...w,
              myInvestAmount: myAmount,
              myContributionRatio: ratio,
              hasInvested: investMap.has(w.id),
              isBookmarked: bookmarkedSet.has(w.id),
              isBookmarkedOnly: !investMap.has(w.id) && bookmarkedSet.has(w.id),
            };
          });
          setTrackedWishes(merged);
        }
      } else {
        setTrackedWishes([]);
      }
      setLoading(false);
    }
    loadTracked();
  }, [session?.user?.id]);

  const filtered = useMemo(() => {
    return trackedWishes.filter((w) => {
      const matchSearch =
        (w.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.tag_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      if (sourceFilter === 'invested' && !w.hasInvested) return false;
      if (sourceFilter === 'bookmarked' && !w.isBookmarkedOnly) return false;

      if (statusFilter === 'funding' && w.status === 'fulfilled') return false;
      if (statusFilter === 'fulfilled' && w.status !== 'fulfilled') return false;

      return true;
    });
  }, [trackedWishes, searchTerm, sourceFilter, statusFilter]);

  return {
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    statusFilter,
    setStatusFilter,
    filtered,
    loading,
  };
}