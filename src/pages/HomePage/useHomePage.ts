// src/pages/HomePage/useHomePage.ts
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { fetchPublicWishes } from '@/lib/backend';
import type { Wish, Tag } from '@/types/wish';

export function useHomePage() {
  const { session } = useAuth();
  const [activeTag, setActiveTag] = useState('全部故事');
  const [tags, setTags] = useState<Tag[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedWishId, setHighlightedWishId] = useState<string | null>(null);

  // 🌟 專屬免阻斷連結之目標卡片狀態
  const [accessWishData, setAccessWishData] = useState<Wish | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadTags = useCallback(async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true });
    setTags((data as Tag[]) || []);
  }, []);

  const loadWishes = useCallback(async () => {
    try {
      const publicWishes = await fetchPublicWishes();

      if (session?.user?.id && publicWishes.length > 0) {
        const { data: invData } = await supabase
          .from('investments')
          .select('wish_id, story_id, amount')
          .eq('user_id', session.user.id);

        const myMap = new Map<string, number>();
        invData?.forEach((inv) => {
          const id = inv.wish_id || inv.story_id;
          if (id) {
            myMap.set(id, (myMap.get(id) || 0) + Number(inv.amount || 0));
          }
        });

        const merged: Wish[] = publicWishes.map((w) => {
          const myAmount = myMap.get(w.id) || 0;
          const target = Number(w.product_price || 1);
          const ratio = Math.round((myAmount / target) * 1000) / 10;
          return {
            ...w,
            myInvestAmount: myAmount,
            myContributionRatio: ratio,
          };
        });

        setWishes(merged);
      } else {
        setWishes(publicWishes);
      }
    } catch (err) {
      console.warn('載入願望異常:', err);
      setWishes([]);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadTags();
    loadWishes();

    const channel = supabase
      .channel('home-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wishes' }, () => loadWishes())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, () => loadTags())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadTags, loadWishes]);

  // 🌟 核心：監聽網址參數，支援信件點入免登入直接回訪漂流瓶
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetWishId = params.get('accessWish');
    const token = params.get('token');

    if (targetWishId && token) {
      supabase
        .from('wishes')
        .select('*')
        .eq('id', targetWishId)
        .single()
        .then(({ data }) => {
          if (data) {
            setAccessWishData(data as Wish);
          }
        });
    }
  }, []);

  const handleScrollToWish = useCallback((wishId: string) => {
    setActiveTag('全部故事');

    setTimeout(() => {
      const targetEl = cardRefs.current[wishId];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedWishId(wishId);
        setTimeout(() => setHighlightedWishId(null), 2500);
      }
    }, 120);
  }, []);

  const filteredWishes = useMemo(() => {
    if (activeTag === '全部故事') return wishes;
    const cleanTag = activeTag.replace(/^#/, '');
    return wishes.filter((item) => (item.tag_name || '').includes(cleanTag));
  }, [wishes, activeTag]);

  return {
    activeTag,
    setActiveTag,
    tags,
    wishes,
    filteredWishes,
    loading,
    highlightedWishId,
    cardRefs,
    handleScrollToWish,
    accessWishData,
    setAccessWishData,
  };
}