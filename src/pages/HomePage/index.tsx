// src/pages/HomePage/index.tsx
import { lazy, Suspense } from 'react';
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { LeaderboardWidget } from '@/components/LeaderboardWidget';
import { TagFilterBar } from './components/TagFilterBar';
import { WishGrid } from './components/WishGrid';
import { useHomePage } from './useHomePage';
import { useAccessWishDetector } from '@/hooks/useAccessWishDetector';
import type { HomePageProps } from './types';

const DriftBottleModal = lazy(() => import('@/components/DriftBottleModal'));

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
  } = useHomePage();

  // 🌟 專屬免阻斷時空憑證偵測器
  const { accessWish, clearAccessWish } = useAccessWishDetector();

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

      {/* 🌟 憑證直通專屬漂流瓶結局室（永久有效，首頁下架仍可直達） */}
      {accessWish && (
        <Suspense fallback={null}>
          <DriftBottleModal
            wish={accessWish}
            progress={Math.min(100, Math.round(((accessWish.current_stardust || 0) / (accessWish.product_price || 1)) * 100))}
            isFulfilled={accessWish.status === 'fulfilled' || accessWish.status === 'full_funded'}
            onClose={clearAccessWish}
          />
        </Suspense>
      )}
    </div>
  );
}

export default HomePage;