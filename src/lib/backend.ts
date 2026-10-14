// src/lib/backend.ts
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';

export const OFFICIAL_SPONSOR_ID = '00000000-0000-0000-0000-000000000001';

export function isBlockedStatus(status: string | null | undefined): boolean {
  return status === 'blocked' || status === '已封鎖';
}

/**
 * 取得首頁公開可見的願望：
 * 1. 狀態為 approved 或 full_funded
 * 2. 官方卡片 (OFFICIAL_SPONSOR_ID) 永遠展示且置頂
 * 3. 若已滿額 (full_funded / 星塵達標)，只在當天展示，隔天凌晨 00:00 起自動從首頁移除
 */
export async function fetchPublicWishes(): Promise<Wish[]> {
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .in('status', ['approved', 'full_funded'])
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('fetchPublicWishes 讀取失敗:', error);
    return [];
  }

  const now = new Date();

  const list = (data as any[]).filter((w) => {
    if (isBlockedStatus(w.status)) return false;
    // 官方卡永遠展示
    if (w.id === OFFICIAL_SPONSOR_ID) return true;

    const isFull = Number(w.current_stardust || 0) >= Number(w.product_price || 0);

    // 未滿額的正常展示
    if (!isFull && w.status !== 'full_funded') return true;

    // 已滿額：檢查是否超過達成隔天的凌晨 00:00
    const fundedDateStr = w.funded_at || w.updated_at || w.created_at;
    if (!fundedDateStr) return true;

    const fundedDate = new Date(fundedDateStr);
    // 計算「達成日期的隔天凌晨 00:00:00」
    const nextDayMidnight = new Date(
      fundedDate.getFullYear(),
      fundedDate.getMonth(),
      fundedDate.getDate() + 1,
      0,
      0,
      0
    );

    // 若當前時間尚未超過隔天凌晨，繼續留在首頁展示見證；超過則自動在首頁隱藏（已封存至追番牆）
    return now.getTime() < nextDayMidnight.getTime();
  });

  // 排序：官方卡置頂，其餘按建立時間降冪
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

/**
 * 永久刪除願望卡片（連帶清理關聯收藏與投資紀錄）
 */
export async function deleteWish(id: string): Promise<void> {
  // 1. 清理關聯資料防報錯
  await supabase.from('bookmarks').delete().eq('wish_id', id);
  await supabase.from('investments').delete().eq('wish_id', id);

  // 2. 徹底自 wishes 表刪除
  const { error } = await supabase.from('wishes').delete().eq('id', id);
  if (error) throw error;
}