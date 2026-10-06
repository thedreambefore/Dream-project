import { supabase } from '@/lib/supabaseClient';
import type { Story } from '@/lib/supabase';

const WISH_TABLES = ['wishes', 'stories'] as const;

export function isBlockedStatus(status: string | null | undefined): boolean {
  return status === '已封鎖' || status === 'blocked';
}

export async function fetchPhoneVerified(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('is_phone_verified, phone_verified')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    const fallback = await supabase
      .from('profiles')
      .select('phone_verified')
      .eq('id', userId)
      .maybeSingle();
    return Boolean(fallback.data?.phone_verified);
  }

  return Boolean(data?.is_phone_verified ?? data?.phone_verified);
}

export async function markPhoneVerified(userId: string, phone: string): Promise<void> {
  const payload = {
    is_phone_verified: true,
    phone_verified: true,
    phone: phone.trim() || null,
  };

  const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
  if (error) {
    const { error: fallbackError } = await supabase
      .from('profiles')
      .update({ phone_verified: true, phone: payload.phone })
      .eq('id', userId);
    if (fallbackError) throw fallbackError;
  }
}

export async function fetchPublicWishes(): Promise<Story[]> {
  for (const table of WISH_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .in('status', ['approved', 'fulfilled'])
      .order('created_at', { ascending: false });
    if (!error) {
      return ((data as Story[]) || []).filter((row) => !isBlockedStatus(row.status));
    }
  }
  return [];
}

export async function fetchAllWishesForAdmin(): Promise<Story[]> {
  for (const table of WISH_TABLES) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) return (data as Story[]) || [];
  }
  return [];
}

export async function insertWish(payload: Record<string, unknown>): Promise<void> {
  let lastError: Error | null = null;
  for (const table of WISH_TABLES) {
    const { error } = await supabase.from(table).insert(payload);
    if (!error) return;
    lastError = error;
  }
  throw lastError ?? new Error('發布失敗');
}

export async function updateWish(
  id: string,
  payload: Record<string, unknown>
): Promise<void> {
  let lastError: Error | null = null;
  for (const table of WISH_TABLES) {
    const { error } = await supabase.from(table).update(payload).eq('id', id);
    if (!error) return;
    lastError = error;
  }
  throw lastError ?? new Error('更新失敗');
}

export async function blockWish(id: string, blockReason: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('wishes')
      .update({ status: '已封鎖', block_reason: blockReason })
      .eq('id', id);
    if (!error) return;
  } catch {
    /* fallback below */
  }

  const { error } = await supabase
    .from('stories')
    .update({ status: '已封鎖', block_reason: blockReason })
    .eq('id', id);

  if (error) {
    const { error: fallbackError } = await supabase
      .from('stories')
      .update({ status: 'blocked', block_reason: blockReason })
      .eq('id', id);
    if (fallbackError) throw fallbackError;
  }
}

export async function unblockWish(id: string): Promise<void> {
  await updateWish(id, { status: 'approved', block_reason: null });
}
