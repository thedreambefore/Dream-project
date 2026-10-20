// src/pages/HomePage.tsx
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { LeaderboardWidget } from '@/components/LeaderboardWidget';
import { fetchPublicWishes } from '@/lib/backend';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import type { Wish, Tag } from '@/types/wish';

const WishCard = lazy(() =>
  import('@/components/WishCard').then((module) => ({ default: module.WishCard }))
);

interface HomePageProps {
  onOpenHonorHall: () => void;
}

export function HomePage({ onOpenHonorHall }: HomePageProps) {
  const { session } = useAuth();
  const [activeTag, setActiveTag] = useState('全部故事');
  const [tags, setTags] = useState<Tag[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightedWishId, setHighlightedWishId] = useState<string | null>(null);

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadTags = async () => {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('sort_order', { ascending: true });
    setTags((data as Tag[]) || []);
  };

  const loadWishes = async () => {
    try {
      // 🌟 fetchPublicWishes() 本身已具備「達標項目展示至達成隔天凌晨 00:00:00」的下架邏輯
      const publicWishes = await fetchPublicWishes();

      // 關聯登入者的個人贊助紀錄，計算個人佔比（可超過 100%）
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
          // 佔比計算不再受限於 100%
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
  }, [session?.user?.id]);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-32 relative z-10 animate-fade-in">
      <HomeHeroCarousel />

      <LeaderboardWidget
        wishes={wishes}
        onScrollToWish={handleScrollToWish}
        onOpenHonorHall={onOpenHonorHall}
      />

      {/* 🌟 修正：flex-nowrap + flex-shrink-0，確保窄螢幕能滑動且不截斷 */}
      <div className="flex gap-2.5 overflow-x-auto pb-4 hide-scrollbar mb-10 border-b border-white/5 flex-nowrap">
        <button
          onClick={() => setActiveTag('全部故事')}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-300 cursor-pointer ${
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
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-300 cursor-pointer ${
                activeTag === tagNameWithHash
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-bold'
                  : 'bg-zinc-900/60 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-slate-200'
              }`}
            >
              #{t.name}
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
          <Suspense fallback={<div className="col-span-full py-16 text-center text-xs text-amber-200/50">星砂卡片凝聚中...</div>}>
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
                <WishCard
                  wish={story}
                  index={index}
                  variant="market"
                  onWishUpdated={(updated) => {
                    setWishes((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
                  }}
                />
              </div>
            ))}
          </Suspense>
        </div>
      )}
    </div>
  );
}