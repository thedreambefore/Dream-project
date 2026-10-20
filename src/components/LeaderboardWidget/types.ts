// src/components/LeaderboardWidget/types.ts
import type { Wish } from '@/types/wish';

export type BoardTab = 'nearComplete' | 'fulfilled' | 'inTransit' | 'official';

export interface LeaderboardWidgetProps {
  wishes: Wish[];
  onScrollToWish: (wishId: string) => void;
  onOpenHonorHall: () => void;
}

export interface BoardUserItem {
  id: string;
  anonymous_nickname: string;
  amount: number;
}