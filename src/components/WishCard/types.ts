// src/components/WishCard/types.ts
import type { Wish } from '@/types/wish';

export type WishCardVariant = 'market' | 'tracked' | 'myWishes' | 'preview';

export interface WishCardProps {
  wish: Wish;
  index?: number;
  variant?: WishCardVariant;
  onOpenLetterModal?: (wish: Wish) => void;
  onOpenEditModal?: (wish: Wish) => void;
  onCardDeleted?: (wishId: string) => void;
  onWishUpdated?: (updatedWish: Wish) => void; // 👈 補上此行
}

export interface CardTier {
  level: number;
  label: string;
  cardClass: string;
  glimmerClass: string;
  badgeClass: string;
}