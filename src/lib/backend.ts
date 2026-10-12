// src/lib/backend.ts
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';

export const OFFICIAL_SPONSOR_ID = '00000000-0000-0000-0000-000000000001';

export function isBlockedStatus(status: string | null | undefined): boolean {
  return status === 'blocked' || status === '已封鎖';
}

/**
 * 取得首頁公開可見的願望（只包含募資中的 approved，且排除已滿額）
 */
export async function fetchPublicWishes(): Promise<Wish[]> {
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('fetchPublicWishes 讀取失敗:', error);
    return [];
  }

  return (data as Wish[]).filter(
    (w) =>
      !isBlockedStatus(w.status) &&
      Number(w.current_stardust || 0) < Number(w.product_price || 0)
  );
}

/**
 * 管理員讀取所有卡片
 */
export async function fetchAllWishesForAdmin(): Promise<Wish[]> {
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data as Wish[];
}

/**
 * 更新願望欄位
 */
export async function updateWish(id: string, payload: Partial<Wish>): Promise<void> {
  const { error } = await supabase.from('wishes').update(payload).eq('id', id);
  if (error) throw error;
}

/**
 * 下架/封鎖願望
 */
export async function blockWish(id: string, blockReason: string): Promise<void> {
  const { error } = await supabase
    .from('wishes')
    .update({ status: 'blocked', block_reason: blockReason })
    .eq('id', id);

  if (error) throw error;
}

/**
 * 解除封鎖
 */
export async function unblockWish(id: string): Promise<void> {
  await updateWish(id, { status: 'approved', block_reason: null });
}
