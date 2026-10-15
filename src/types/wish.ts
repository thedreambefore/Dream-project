// src/types/wish.ts

export type UserRole = 'user' | 'admin' | 'banned';

export interface UserProfile {
  id: string;
  real_name: string | null;
  anonymous_nickname: string;
  role: UserRole;
  is_phone_verified: boolean;
  wallet_balance: number;
  phone?: string | null;
  address?: string | null;
  created_at?: string;
}

export type WishStatus =
  | 'pending'      // 待審核
  | 'approved'     // 募資中
  | 'full_funded'  // 募滿待出貨
  | 'fulfilled'    // 已出貨完結
  | 'blocked';     // 已下架封鎖

export type LetterStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface Wish {
  id: string;
  user_id: string;
  product_name: string;
  title?: string;
  product_price: number;
  current_stardust: number;
  tag_name: string;
  cover_emoji: string;
  story_text: string;
  promise_text: string;
  image_url?: string | null;
  product_url?: string | null;
  status: WishStatus;
  block_reason?: string | null;
  is_reported?: boolean;
  report_reason?: string | null;
  admin_blessing?: string | null;
  thank_you_letter?: string | null;
  unboxing_photo_url?: string | null;
  letter_status?: LetterStatus;
  letter_reject_reason?: string | null;
  created_at: string;
  
  // 前端關聯或即時運算欄位
  anonymous_nickname?: string | null;
  myInvestAmount?: number;
  myContributionRatio?: number; // 👈 0 ~ 100 之百分比數值 (例如: 25.5 代表 25.5%)
  isBookmarked?: boolean;
  isBookmarkedOnly?: boolean;
  hasInvested?: boolean;
}

export interface Investment {
  id: string;
  user_id: string;
  wish_id: string;
  story_id?: string;
  amount: number;
  message: string | null;
  is_hidden: boolean;
  created_at: string;
  users?: {
    anonymous_nickname: string | null;
  };
}

export interface Bookmark {
  id?: string;
  user_id: string;
  wish_id: string;
  created_at?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at?: string;
}
