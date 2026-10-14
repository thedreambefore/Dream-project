// src/lib/backend.ts
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';

export const OFFICIAL_SPONSOR_ID = '00000000-0000-0000-0000-000000000001';

export function isBlockedStatus(status: string | null | undefined): boolean {
  return status === 'blocked' || status === '已封鎖';
}

/**
 * 取得首頁公開可見的願望：
 * 1. 狀態為 approved 且未被封鎖
 * 2. 一般卡片未滿額才展示；官方常駐卡永遠保留且永遠置頂
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

  const list = (data as Wish[]).filter((w) => {
    if (isBlockedStatus(w.status)) return false;
    // 官方常駐卡永遠展示
    if (w.id === OFFICIAL_SPONSOR_ID) return true;
    // 一般願望未滿額才展示
    return Number(w.current_stardust || 0) < Number(w.product_price || 0);
  });

  // 排序：官方卡永遠置頂，其餘按建立時間降冪
  return list.sort((a, b) => {
    if (a.id === OFFICIAL_SPONSOR_ID) return -1;
    if (b.id === OFFICIAL_SPONSOR_ID) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
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