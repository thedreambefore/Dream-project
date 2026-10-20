// src/pages/HomePage/components/WishGrid.tsx
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { WishGridProps } from '../types';

const WishCard = lazy(() =>
  import('@/components/WishCard').then((module) => ({ default: module.WishCard }))
);

export function WishGrid({ loading, filteredWishes, highlightedWishId, cardRefs }: WishGridProps) {
  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-xs tracking-wider">正在搜尋星空中的願望故事...</p>
      </div>
    );
  }

  if (filteredWishes.length === 0) {
    return (
      <div className="py-24 text-center border border-white/5 rounded-3xl bg-zinc-950/40 text-zinc-500 text-sm">
        此分類下目前尚無許願星光
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Suspense fallback={<div className="col-span-full py-16 text-center text-xs text-amber-200/50">星砂卡片凝聚中...</div>}>
        {filteredWishes.map((story, index) => (
          <div
            key={story.id}
            ref={(el) => {
              cardRefs.current[story.id] = el;
            }}
            className={`transition-all duration-500 rounded-2xl ${
              highlightedWishId === story.id
                ? 'ring-4 ring-amber-400 shadow-[0_0_35px_rgba(251,191,36,0.9)] scale-[1.03]'
                : ''
            }`}
          >
            <WishCard wish={story} index={index} variant="market" />
          </div>
        ))}
      </Suspense>
    </div>
  );
}