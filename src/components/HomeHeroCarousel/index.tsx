// src/components/HomeHeroCarousel/index.tsx
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHeroCarousel } from './useHeroCarousel';

export function HomeHeroCarousel() {
  const {
    announcements,
    current,
    currentIndex,
    direction,
    isTransitioning,
    hasMultiple,
    switchSlide,
    handlePrev,
    handleNext,
  } = useHeroCarousel();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 my-8 relative">
      <div className="relative glass-strong rounded-3xl p-6 sm:p-9 border border-amber-400/20 shadow-2xl text-center overflow-hidden bg-zinc-950/80 backdrop-blur-md">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1 text-xs text-amber-300 font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>星空廣播站 · 公告 {currentIndex + 1} / {announcements.length}</span>
        </div>

        <div className="relative min-h-[140px] flex flex-col justify-center overflow-hidden">
          <div
            key={current.id}
            className={`transition-all duration-400 ease-out transform ${
              isTransitioning
                ? direction === 'right' ? 'opacity-0 translate-x-8 blur-sm' : 'opacity-0 -translate-x-8 blur-sm'
                : 'opacity-100 translate-x-0 blur-0'
            }`}
          >
            <h1 className="text-xl sm:text-3xl font-black mb-2.5 h-10 flex items-center justify-center bg-gradient-to-b from-white via-slate-100 to-amber-200 bg-clip-text text-transparent truncate">
              {current.title}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto line-clamp-2 h-10 flex items-center justify-center">
              {current.body}
            </p>
          </div>
        </div>

        {hasMultiple && (
          <>
            <button onClick={handlePrev} className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleNext} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
            <div className="flex justify-center gap-1.5 mt-4">
              {announcements.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => switchSlide(idx, idx > currentIndex ? 'right' : 'left')}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${currentIndex === idx ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/20'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default HomeHeroCarousel;