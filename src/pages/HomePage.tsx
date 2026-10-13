// src/pages/HomePage.tsx
import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { WishCard } from '@/components/WishCard';
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { LeaderboardWidget } from '@/components/LeaderboardWidget';
import { fetchPublicWishes, OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';

interface HomePageProps {
  onOpenHonorHall: () => void;
}

const OFFICIAL_SPONSOR_STORY: Wish = {
  id: OFFICIAL_SPONSOR_ID,
  user_id: '00000000-0000-0000-0000-000000000000',
  product_name: '💖 守護夢沙星空 · 平台伺服器與營運基金',
  product_price: 99999999,
  current_stardust: 0,
  tag_name: '官方營運支持',
  cover_emoji: '🪐',
  story_text:
    '夢沙 DreamSand 致力於打造一個完全匿名的溫暖心願避風港。您的每一筆微小心願燃料，都將全數投入網站運作，讓這片星空永不熄滅。',
  promise_text: '平台將持續發布重大更新與維護伺服器。',
  status: 'approved',
  block_reason: null,
  created_at: '2025-01-01T00:00:00.000Z',
};

export function HomePage({ onOpenHonorHall }: HomePageProps) {
  const [activeTag, setActiveTag] = useState('全部故事');
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedWishId, setHighlightedWishId] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const tags = [
    '全部故事',
    '#官方營運支持',
    '#學生苦讀中',
    '#面試大作戰',
    '#毛孩的願望',
    '#生日邊緣人',
  ];

  const loadWishes = async () => {
    try {
      const realWishes = await fetchPublicWishes();
      const activeWishes = realWishes.filter((w) => {
        const isFull = Number(w.current_stardust || 0) >= Number(w.product_price || 0);
        const isCompletedStatus = w.status === 'full_funded' || w.status === 'fulfilled';
        return !isFull && !isCompletedStatus;
      });

      setWishes([OFFICIAL_SPONSOR_STORY, ...activeWishes]);
    } catch (err) {
      console.warn('載入願望異常，使用保底模式:', err);
      setWishes([OFFICIAL_SPONSOR_STORY]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishes();

    const channel = supabase
      .channel('public-wishes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wishes' },
        () => loadWishes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 點擊平滑滾動並高亮卡片
  const handleScrollToWish = (wishId: string) => {
    if (activeTag !== '全部故事') {
      setActiveTag('全部故事');
    }

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

      {/* 🌟 徽章式星光榜微縮區（支援展開與跳轉殿堂） */}
      <LeaderboardWidget
        wishes={wishes}
        onScrollToWish={handleScrollToWish}
        onOpenHonorHall={onOpenHonorHall}
      />

      <div className="flex gap-2.5 overflow-x-auto pb-4 hide-scrollbar mb-10 border-b border-white/5">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium border whitespace-nowrap transition-all duration-300 cursor-pointer ${
              activeTag === tag
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-bold'
                : 'bg-zinc-900/60 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-slate-200'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-xs tracking-wider">正在搜尋星空中的願望故事...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWishes.map((story, index) => {
            const isTargetHighlight = highlightedWishId === story.id;
            return (
              <div
                key={story.id}
                ref={(el) => (cardRefs.current[story.id] = el)}
                className={`transition-all duration-500 rounded-2xl ${
                  isTargetHighlight
                    ? 'ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.9)] scale-[1.03]'
                    : ''
                }`}
              >
                <WishCard wish={story} index={index} variant="market" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
