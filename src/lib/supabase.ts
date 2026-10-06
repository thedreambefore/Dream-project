export { supabase } from '@/lib/supabaseClient';

export type Profile = {
  id: string;
  display_name: string;
  avatar_emoji: string;
  role: 'user' | 'admin';
  phone_verified: boolean;
  is_phone_verified: boolean;
  credit_rating: '新星' | '星塵' | '銀河' | '傳說';
  real_name: string | null;
  phone: string | null;
  address: string | null;
  bio: string | null;
  created_at: string;
};

export type WishStatus = 'pending' | 'approved' | 'blocked' | 'fulfilled' | '已封鎖';

export type Story = {
  id: string;
  user_id: string;
  product_name: string;
  product_price: number;
  tag_name: string;
  story_text: string;
  promise_text: string;
  cover_emoji: string;
  status: WishStatus;
  block_reason: string | null;
  current_stardust: number;
  created_at: string;
};

export type Wish = Story;

export type Investment = {
  id: string;
  user_id: string;
  story_id: string;
  amount: number;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
};

export type Wallet = {
  id: string;
  user_id: string;
  available_stardust: number;
  in_transit_stardust: number;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  is_active: boolean;
  created_at: string;
};

export type Tag = {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
};

export type Fulfillment = {
  id: string;
  story_id: string;
  user_id: string;
  unboxing_emoji: string;
  thank_you_letter: string;
  created_at: string;
};

export function normalizeProfile(row: Record<string, unknown> | null): Profile | null {
  if (!row) return null;
  const verified = Boolean(row.is_phone_verified ?? row.phone_verified);
  return {
    ...(row as unknown as Profile),
    phone_verified: verified,
    is_phone_verified: verified,
    role: (row.role as Profile['role']) || 'user',
  };
}
