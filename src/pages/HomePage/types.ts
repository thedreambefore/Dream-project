// src/pages/HomePage/types.ts
import type { Wish, Tag } from '@/types/wish';

export interface HomePageProps {
  onOpenHonorHall: () => void;
}

export interface TagFilterBarProps {
  activeTag: string;
  tags: Tag[];
  onSelectTag: (tagName: string) => void;
}

export interface WishGridProps {
  loading: boolean;
  filteredWishes: Wish[];
  highlightedWishId: string | null;
  cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}