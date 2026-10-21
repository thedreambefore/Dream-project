// src/pages/HomePage/index.tsx
import { lazy, Suspense } from 'react';
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { LeaderboardWidget } from '@/components/LeaderboardWidget';
import { TagFilterBar } from './components/TagFilterBar';
import { WishGrid } from './components/WishGrid';
import { useHomePage } from './useHomePage';
import type { HomePageProps } from './types';

const DriftBottleModal = lazy(() =>
  import('@/components/DriftBottleModal').then((m) => ({ default: m.DriftBottleModal }))
);

export function HomePage({ onOpenHonorHall }: HomePageProps) {
  const {
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
  } = useHomePage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-32 relative z-10 animate-fade-in">
      <HomeHeroCarousel />
      <LeaderboardWidget
        wishes={wishes}
        onScrollToWish={handleScrollToWish}
        onOpenHonorHall={onOpenHonorHall}
      />
      <TagFilterBar activeTag={activeTag} tags={tags} onSelectTag={setActiveTag} />
      <WishGrid
        loading={loading}
        filteredWishes={filteredWishes}
        highlightedWishId={highlightedWishId}
        cardRefs={cardRefs}
      />

      {/* 🌟 專屬免阻斷連結：當訪客從信件點擊專屬連結時，自動彈出專屬漂流瓶結局室 */}
      {accessWishData && (
        <Suspense fallback={null}>
          <DriftBottleModal
            wish={accessWishData}
            progress={100}
            isFulfilled={accessWishData.status === 'fulfilled' || accessWishData.status === 'full_funded'}
            onClose={() => setAccessWishData(null)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default HomePage;