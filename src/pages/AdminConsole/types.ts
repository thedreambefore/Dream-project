// src/pages/AdminConsole/types.ts
import type { Wish, Tag, Announcement } from '@/types/wish';

export type AdminTab = 'pending' | 'moderation' | 'users' | 'allCards' | 'announcements' | 'tags';

export interface AdminConsoleProps {
  onClose: () => void;
  onGoHome: () => void;
}

export interface AdminUserItem {
  id: string;
  real_name: string | null;
  anonymous_nickname: string | null;
  role: 'user' | 'admin' | 'banned';
  is_phone_verified: boolean;
  wallet_balance: number;
  created_at?: string;
}

export interface InvestmentWithUser {
  id: string;
  amount: number;
  message: string | null;
  is_hidden: boolean;
  created_at: string;
  users?: {
    anonymous_nickname: string | null;
  } | null;
}