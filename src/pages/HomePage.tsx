// src/pages/HomePage.tsx
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { WishCard } from '@/components/WishCard';
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { LeaderboardWidget } from '@/components/LeaderboardWidget';
import { fetchPublicWishes } from '@/lib/backend';
import { supabase } from '@/lib/supabaseClient';
import type { Wish, Tag } from '@/types/wish';

interface HomePageProps {
  onOpenHonorHall: () => void;
}

export function HomePage({ onOpenHonorHall }: HomePageProps) {
  const [activeTag, setActiveTag] = useState('全部故事');
  const [tags, setTags] = useState<Tag[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedWishId, setHighlightedWishId] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // 1. 動態讀取 tags 資料表
  const loadTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true });
    setTags((data as Tag[]) || []);
  };

  // 2. 讀取願望（包含資料庫中的官方常駐卡）
  const loadWishes = async () => {
    try {
      const realWishes = await fetchPublicWishes();
      const activeWishes = realWishes.filter((w) => {
        const isFull = Number(w.current_stardust || 0) >= Number(w.product_price || 0);
        const isCompletedStatus = w.status === 'full_funded' || w.status === 'fulfilled';
        return !isFull && !isCompletedStatus;
      });
      setWishes(activeWishes);
    } catch (err) {
      console.warn('載入願望異常:', err);
      setWishes([]);
    } finally {
      setLoading(false);
    }
  };

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
  }, []);

  const handleScrollToWish = (wishId: string) => {
    if (activeTag !== '全部故事') setActiveTag('全部故事');

    setTimeout(() => {
      const targetEl = cardRefs.current[wishId];
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedWishId(wishId);
        setTimeout(() => setHighlightedWishId(null), 2500);
      }
    }, 100);
  };

  const filteredWishes = wishes.filter((item) => {
    if (activeTag === '全部故事') return true;
    const cleanTag = activeTag.replace('#', '');
    return (item.tag_name || '').includes(cleanTag);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 pt-4 pb-32 relative z-10 animate-fade-in">
      <HomeHeroCarousel />

      <LeaderboardWidget
        wishes={wishes}
        onScrollToWish={handleScrollToWish}
        onOpenHonorHall={onOpenHonorHall}
      />

      {/* 動態標籤列（資料庫有標籤才列出，未建立時只顯示全部故事） */}
      <div className="flex gap-2.5 overflow-x-auto pb-4 hide-scrollbar mb-10 border-b border-white/5">
        <button
          onClick={() => setActiveTag('全部故事')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap transition-all duration-300 cursor-pointer ${
            activeTag === '全部故事'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-bold'
              : 'bg-zinc-900/60 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-slate-200'
          }`}
        >
          全部故事
        </button>
        {tags.map((t) => {
          const tagNameWithHash = `#${t.name}`;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTag(tagNameWithHash)}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap transition-all duration-300 cursor-pointer ${
                activeTag === tagNameWithHash
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-bold'
                  : 'bg-zinc-900/60 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-slate-200'
              }`}
            >
              {t.icon} #{t.name}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-xs tracking-wider">正在搜尋星空中的願望故事...</p>
        </div>
      ) : filteredWishes.length === 0 ? (
        <div className="py-24 text-center border border-white/5 rounded-3xl bg-zinc-950/40 text-zinc-500 text-sm">
          此分類下目前尚無許願星光
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishes.map((story, index) => (
            <div
              key={story.id}
              ref={(el) => (cardRefs.current[story.id] = el)}
              className={`transition-all duration-500 rounded-2xl ${
                highlightedWishId === story.id
                  ? 'ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.9)] scale-[1.03]'
                  : ''
              }`}
            >
              <WishCard wish={story} index={index} variant="market" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
