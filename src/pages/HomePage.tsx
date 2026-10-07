import { useState, useEffect } from 'react';
import { Compass, Sparkles, Loader2 } from 'lucide-react';
import { StoryCard } from '@/components/StoryCard';
import { fetchPublicWishes } from '@/lib/backend';
import { supabase, type Story } from '@/lib/supabase';

// 🌟 精心設計的「經典示範願望卡片」：當雲端資料庫全空時自動登場，讓首頁隨時保持活力且可直接測試付款
const DEMO_STORY: Story = {
  id: 'demo-story-001',
  user_id: 'demo-user',
  product_name: 'Acer 輕薄教育用筆電 (含三年保固)',
  product_price: 18000,
  current_stardust: 14200, // 約 78% 進度
  tag_name: '學生苦讀中',
  cover_emoji: '💻',
  story_text: '在偏鄉課輔班帶孩子們學習 Python 已有一年，孩子們總是輪流共用一台容易當機的舊主機。希望能在新學期替課輔教室添購一台穩定的新筆電，讓對程式有熱情的孩子不用再等待輪流上機的時間。',
  promise_text: '若願望達成，將在偏鄉舉辦一場成果發表會，並公開孩子們親手寫出的第一款小遊戲成果與開箱感謝信！',
  status: 'approved',
  block_reason: null,
  created_at: new Date().toISOString(),
};

export function HomePage() {
  const [activeTag, setActiveTag] = useState('全部故事');
  const [wishes, setWishes] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const tags = ['全部故事', '#學生苦讀中', '#面試大作戰', '#毛孩的願望', '#生日邊緣人'];

  // 1. 撈取真實願望資料
  const loadWishes = async () => {
    try {
      const realWishes = await fetchPublicWishes();
      setWishes(realWishes);
    } catch (err) {
      console.warn('載入願望失敗，採用保底模式:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishes();

    // 2. ⚡ 重啟 Supabase Realtime 監聽器：進度條與留言即時跳動
    const channel = supabase
      .channel('public-wishes-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'wishes' },
        () => loadWishes()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'stories' },
        () => loadWishes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. 整合真實資料與示範資料
  // 若資料庫內無任何公開卡片，自動由示範卡片頂替
  const displayWishes = wishes.length > 0 ? wishes : [DEMO_STORY];

  // 4. 根據標籤進行前端動態過濾
  const filteredWishes = displayWishes.filter((item) => {
    if (activeTag === '全部故事') return true;
    const cleanTag = activeTag.replace('#', '');
    return item.tag_name?.includes(cleanTag);
  });

  return (
    <div className="max-w-6xl mx-auto px-6 pt-8 pb-32 relative z-10 animate-fade-in">
      
      {/* 1. 主標題區 */}
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

      {/* 2. 動態篩選標籤列 */}
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

      {/* 3. 卡片展示牆 */}
      {loading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-xs tracking-wider">正在搜尋星空中的願望故事...</p>
        </div>
      ) : filteredWishes.length === 0 ? (
        /* 當篩選條件下沒有對應卡片時的溫暖留空提示 */
        <div className="max-w-md mx-auto my-12 text-center border border-slate-800 bg-slate-900/30 backdrop-blur-md rounded-2xl p-10 shadow-2xl scale-in">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-amber-400">
            ⏳
          </div>
          <h3 className="text-base font-bold text-slate-200 mb-2">
            該標籤下的沙漏正等待點燃
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed max-w-xs mx-auto mb-5">
            目前這個分類下尚無星旅人拋下故事，您可以嘗試切換其他標籤瀏覽。
          </p>
          <button
            onClick={() => setActiveTag('全部故事')}
            className="text-xs text-amber-300 border border-amber-400/30 px-3.5 py-1.5 rounded-full hover:bg-amber-500/10 transition-all cursor-pointer"
          >
            返回全部故事
          </button>
        </div>
      ) : (
        /* 卡片網格渲染 */
        <div>
          {wishes.length === 0 && (
            <div className="mb-4 inline-flex items-center gap-1.5 text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              <Compass className="w-3.5 h-3.5" />
              <span>示範探索模式 · 點擊下方卡片即可測試結帳流程</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWishes.map((story, index) => (
              <StoryCard key={story.id} story={story} index={index} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
