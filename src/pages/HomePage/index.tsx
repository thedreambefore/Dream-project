// src/pages/HomePage/index.tsx
import { HomeHeroCarousel } from '@/components/HomeHeroCarousel';
import { LeaderboardWidget } from '@/components/LeaderboardWidget';
import { TagFilterBar } from './components/TagFilterBar';
import { WishGrid } from './components/WishGrid';
import { useHomePage } from './useHomePage';
import type { HomePageProps } from './types';

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
    </div>
  );
}

export default HomePage;