import type { Wish } from '@/types/wish';

export type TabId = 'account' | 'myWishes' | 'publish' | 'wallet' | 'invested';

export interface UserDashboardProps {
  onClose: () => void;
  onGoHome: () => void;
  onOpenAdmin?: () => void;
  initialTab?: TabId;
}

export interface TransitItem {
  id: string;
  amount: number;
  message: string | null;
  created_at: string;
  wish: {
    id: string;
    product_name: string;
    cover_emoji: string;
    current_stardust: number;
    product_price: number;
    status: string;
  };
}

export interface LeaderboardUser {
  id: string;
  anonymous_nickname: string;
  amount: number;
}