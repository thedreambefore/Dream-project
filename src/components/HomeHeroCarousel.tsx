// src/components/HomeHeroCarousel.tsx
import { useState, useEffect } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Announcement } from '@/types/wish';

// 🌟 前端降級專用：資料庫完全無公告時才呈現
const EMPTY_FALLBACK_ANNOUNCEMENT: Announcement = {
  id: 'empty-fallback',
  title: '目前這裡沒有資訊喔',
  body: '星空廣播站靜候新訊息中，請隨時留意最新公告。',
  is_active: true,
  created_at: new Date().toISOString(),
};

export function HomeHeroCarousel() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([EMPTY_FALLBACK_ANNOUNCEMENT]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && isMounted) {
        if (data && data.length > 0) {
          setAnnouncements(data as Announcement[]);
        } else {
          setAnnouncements([EMPTY_FALLBACK_ANNOUNCEMENT]);
        }
      }
    };

    fetchAnnouncements();

    // 實時監聽後台發布/更新
    const channel = supabase
      .channel('public-announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => fetchAnnouncements()
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // 左右切換處理
  const switchSlide = (newIndex: number, dir: 'left' | 'right') => {
    if (isTransitioning) return;
    setDirection(dir);
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + announcements.length) % announcements.length;
    switchSlide(nextIdx, 'left');
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % announcements.length;
    switchSlide(nextIdx, 'right');
  };

  // ⏰ 每 6.5 秒自動向右平滑滑動（只有在公告大於 1 則時才計時）
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6500);

    return () => clearInterval(timer);
  }, [currentIndex, announcements.length]);

  const current = announcements[currentIndex] || announcements[0];
  const hasMultiple = announcements.length > 1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 my-8 relative">
      <div className="relative glass-strong rounded-3xl p-6 sm:p-9 border border-amber-400/20 shadow-2xl text-center overflow-hidden bg-zinc-950/80 backdrop-blur-md">
        {/* 背景微光飾點 */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* 頂部 Badge 標籤 */}
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1 text-xs text-amber-300 font-medium mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>星空廣播站 · 公告 {currentIndex + 1} / {announcements.length}</span>
        </div>

        {/* 規格化排版：標題與內文高寬一致，杜絕跳動 */}
        <div className="relative min-h-[140px] flex flex-col justify-center overflow-hidden">
          <div
            key={current.id}
            className={`transition-all duration-400 ease-out transform ${
              isTransitioning
                ? direction === 'right'
                  ? 'opacity-0 translate-x-8 blur-sm'
                  : 'opacity-0 -translate-x-8 blur-sm'
                : 'opacity-100 translate-x-0 blur-0'
            }`}
          >
            <h1 className="text-xl sm:text-3xl font-black tracking-tight mb-2.5 h-10 flex items-center justify-center bg-gradient-to-b from-white via-slate-100 to-amber-200 bg-clip-text text-transparent truncate">
              {current.title}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed line-clamp-2 h-10 flex items-center justify-center">
              {current.body}
            </p>
          </div>
        </div>

        {/* 只有在多於 1 則公告時才顯示輪播箭頭與分頁指示點 */}
        {hasMultiple && (
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

            <div className="flex justify-center gap-1.5 mt-4">
              {announcements.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => switchSlide(idx, idx > currentIndex ? 'right' : 'left')}
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
