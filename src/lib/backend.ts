import { supabase } from '@/lib/supabaseClient';
import type { Story } from '@/lib/supabase';

export function isBlockedStatus(status: string | null | undefined): boolean {
  return status === '已封鎖' || status === 'blocked';
}

export async function fetchPublicWishes(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .in('status', ['approved', 'fulfilled'])
    .order('created_at', { ascending: false });

  if (!error && data) {
    return (data as Story[]).filter((row) => !isBlockedStatus(row.status));
  }
  return [];
}

export async function fetchAllWishesForAdmin(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('wishes')
    .select('*')
    .order('created_at', { ascending: false });

  if (!error && data) return data as Story[];
  return [];
}

export async function insertWish(payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('wishes').insert(payload);
  if (error) throw error;
}

export async function updateWish(id: string, payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('wishes').update(payload).eq('id', id);
  if (error) throw error;
}

export async function blockWish(id: string, blockReason: string): Promise<void> {
  const { error } = await supabase
    .from('wishes')
    .update({ status: '已封鎖', block_reason: blockReason })
    .eq('id', id);

  if (error) throw error;
}

export async function unblockWish(id: string): Promise<void> {
  await updateWish(id, { status: 'approved', block_reason: null });
}
