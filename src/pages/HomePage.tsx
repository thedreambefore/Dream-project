import { useState, useEffect } from 'react';
import { Compass, Sparkles, Loader2, Heart } from 'lucide-react';
import { StoryCard } from '@/components/StoryCard';
import { fetchPublicWishes } from '@/lib/backend';
import { supabase, type Story } from '@/lib/supabase';

// 💖 官方常駐置頂贊助卡片（合法 UUID，可真正寫入贊助紀錄且進度無上限）
const OFFICIAL_SPONSOR_STORY: Story = {
  id: '00000000-0000-0000-0000-000000000001', // 標準合規 UUID
  user_id: '00000000-0000-0000-0000-000000000000',
  product_name: '💖 守護夢沙星空 · 平台伺服器與營運基金',
  product_price: '∞', // 
  current_stardust: 0,
  tag_name: '官方營運支持',
  cover_emoji: '🪐',
  story_text: '夢沙 DreamSand 致力於打造一個完全匿名的溫暖心願避風港。您的每一筆微小心願燃料，都將全數投入網站運作，讓這片星空永不熄滅。',
  promise_text: '平台將持續發布重大更新。',
  status: 'approved',
  block_reason: null,
  created_at: '2025-01-01T00:00:00.000Z',
};

export function HomePage() {
  const [activeTag, setActiveTag] = useState('全部故事');
  const [wishes, setWishes] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const tags = ['全部故事', '#官方營運支持', '#學生苦讀中', '#面試大作戰', '#毛孩的願望', '#生日邊緣人'];

  const loadWishes = async () => {
    try {
      const realWishes = await fetchPublicWishes();
      // 🌟 核心過濾：進度滿額 (>=100%) 或狀態已募滿/完結者，立刻從首頁退場！
      const activeWishes = realWishes.filter((w) => {
        // 排除已滿額、募滿待出貨或已履約完結的卡片
        const isFull = Number(w.current_stardust || 0) >= Number(w.product_price || 0);
        const isCompletedStatus = w.status === 'full_funded' || w.status === 'fulfilled';
    
        return !isFull && !isCompletedStatus;
      });
      // 官方贊助卡片（ID 000...001）常駐置頂，後面只放真正「需要燃料」的故事
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

  const filteredWishes = wishes.filter((item) => {
    if (activeTag === '全部故事') return true;
    const cleanTag = activeTag.replace('#', '');
    return (item.tag_name || '').includes(cleanTag);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-32 relative z-10 animate-fade-in">
      <header className="max-w-4xl mx-auto text-center my-12 px-6">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1 text-xs text-amber-400 font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>聽見世界的微小願望 · 匿名星塵交易所</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4 leading-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          用陌生人的善意，拼湊夢想的沙漏
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          這裡不看名氣，只聽故事。投入微小的心願燃料，當沙漏填滿時，漂流瓶留言將與夢想終章一同解鎖。
        </p>
      </header>

      {/* 標籤列 */}
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
          {filteredWishes.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
