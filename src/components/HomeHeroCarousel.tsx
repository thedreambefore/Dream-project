// src/components/HomeHeroCarousel.tsx
import { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight, Megaphone } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Announcement } from '@/types/wish';

// 預設官方備用公告清單（無後台公告時優雅呈現）
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'default-1',
    title: '用陌生人的善意，拼湊夢想的沙漏',
    body: '這裡不看名氣，只聽故事。投入微小的心願燃料，當沙漏填滿時，漂流瓶留言將與夢想終章一同解鎖。',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-2',
    title: '聽見世界的微小願望 · 匿名星塵交易所',
    body: '所有心願皆經匿名加密處理，保護每位築夢者的隱私，讓善意在無壓力的星空下純粹流動。',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'default-3',
    title: '真實物流閉環 · 杜絕金錢直匯風險',
    body: '贊助燃料全數由平台代購指定物資直送超商，滿額後解鎖親筆開箱感謝信，見證善意的開花結果。',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export function HomeHeroCarousel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEFAULT_ANNOUNCEMENTS);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 撈取資料庫啟用中的公告
  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0 && isMounted) {
        setAnnouncements(data as Announcement[]);
      }
    };

    fetchAnnouncements();
    return () => { isMounted = false; };
  }, []);

  // ⏰ 每 6 秒自動輪播滑動至下一則
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [announcements.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const current = announcements[currentIndex] || announcements[0];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 my-10 relative">
      <div className="relative glass-strong rounded-3xl p-6 sm:p-10 border border-amber-400/20 shadow-2xl text-center overflow-hidden bg-zinc-950/70 backdrop-blur-md">
        {/* 背景微光飾點 */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* 頂部 Badge */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1 text-xs text-amber-300 font-medium mb-5 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>星空廣播站 · 公告 {currentIndex + 1} / {announcements.length}</span>
        </div>

        {/* 輪播滑入滑出標題與內容 */}
        <div key={current.id} className="min-h-[140px] flex flex-col justify-center animate-fade-in">
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 leading-tight bg-gradient-to-b from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
            {current.title}
          </h1>
          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            {current.body}
          </p>
        </div>

        {/* 左右切換按鈕 */}
        {announcements.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="上一則"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              title="下一則"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* 底部指示分頁點 */}
            <div className="flex justify-center gap-1.5 mt-5">
              {announcements.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    currentIndex === idx ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/20 hover:bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
