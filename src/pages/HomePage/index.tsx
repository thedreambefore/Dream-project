// src/pages/HomePage/index.tsx
import { lazy, Suspense } from 'react';
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { LeaderboardWidget } from '@/components/LeaderboardWidget';
import { TagFilterBar } from './components/TagFilterBar';
import { WishGrid } from './components/WishGrid';
import { useHomePage } from './useHomePage';
import type { HomePageProps } from './types';

const DriftBottleModal = lazy(() => import('@/components/DriftBottleModal'));

export function HomePage({ onOpenHonorHall }: HomePageProps) {
  const home = useHomePage();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-32 relative z-10 animate-fade-in">
      <HomeHeroCarousel />
      <LeaderboardWidget wishes={home.wishes} onScrollToWish={home.handleScrollToWish} onOpenHonorHall={onOpenHonorHall} />
      <TagFilterBar activeTag={home.activeTag} tags={home.tags} onSelectTag={home.setActiveTag} />
      <WishGrid loading={home.loading} filteredWishes={home.filteredWishes} highlightedWishId={home.highlightedWishId} cardRefs={home.cardRefs} />

      {home.accessWish && (
        <Suspense fallback={null}>
          <DriftBottleModal
            wish={home.accessWish}
            progress={Math.min(100, Math.round(((home.accessWish.current_stardust || 0) / (home.accessWish.product_price || 1)) * 100))}
            isFulfilled={home.accessWish.status === 'fulfilled' || home.accessWish.status === 'full_funded'}
            onClose={home.clearAccessWish}
          />
        </Suspense>
      )}
    </div>
  );
}

export default HomePage;