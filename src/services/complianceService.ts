// src/services/complianceService.ts
import { supabase } from '@/lib/supabaseClient';
import type { Wish, SensitiveWord, TaxDeclarationRecord } from '@/types/wish';

// 系統核心備用防線（避免資料庫連線中斷時失去基礎防護）
export const FALLBACK_BLOCKED_WORDS = ['詐騙', '匯款', '賭博', '毒品', '槍械', '代購', '眾籌', '募資'];

/**
 * 取得自訂封禁詞庫（純資料庫已封禁列表）
 */
export async function getCustomSensitiveWords(): Promise<SensitiveWord[]> {
  const { data, error } = await supabase
    .from('sensitive_words')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('讀取違禁詞失敗:', error.message);
    return [];
  }
  return (data as SensitiveWord[]) || [];
}

/**
 * 新增封禁詞
 */
export async function addSensitiveWord(word: string): Promise<SensitiveWord> {
  const cleanWord = word.trim();
  if (!cleanWord) throw new Error('封禁詞不可為空');

  const { data, error } = await supabase
    .from('sensitive_words')
    .insert([{ word: cleanWord }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error(`詞彙「${cleanWord}」已經在封禁名單中`);
    throw new Error(`資料庫寫入失敗: ${error.message}`);
  }
  return data as SensitiveWord;
}

/**
 * 移除封禁詞
 */
export async function deleteSensitiveWord(id: string): Promise<void> {
  const { error } = await supabase.from('sensitive_words').delete().eq('id', id);
  if (error) throw new Error(`移除失敗: ${error.message}`);
}

/**
 * 全域文字封禁檢查（同時供心願發布與留言使用）
 */
export async function checkTextViolations(texts: (string | null | undefined)[]): Promise<{
  hasBlocked: boolean;
  blockedWord?: string;
}> {
  // 1. 抓取所有資料庫中的封禁詞
  const customList = await getCustomSensitiveWords();
  const allBlocked = Array.from(new Set([...FALLBACK_BLOCKED_WORDS, ...customList.map((i) => i.word)]));

  // 2. 比對所有傳入的字串
  const combinedText = texts.filter(Boolean).join(' ');

  for (const word of allBlocked) {
    if (combinedText.includes(word)) {
      return { hasBlocked: true, blockedWord: word };
    }
  }
  return { hasBlocked: false };
}

/**
 * 檢查使用者是否滿足發布新規範
 */
export async function checkCanPublishNewWish(userId: string): Promise<{
  canPublish: boolean;
  blockingWish?: Wish;
  reason?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'blocked')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return { canPublish: true };

    const wishes = data as Wish[];

    for (const w of wishes) {
      if (w.status === 'pending' || w.status === 'approved' || w.status === 'full_funded') {
        return {
          canPublish: false,
          blockingWish: w,
          reason: `您目前已有進行中的心願「${w.product_name}」。每位星旅人同時僅能開啟一個活動！`,
        };
      }
      if (w.status === 'fulfilled' && w.letter_status !== 'approved') {
        return {
          canPublish: false,
          blockingWish: w,
          reason: `您的心願「${w.product_name}」贈禮已送達，請先完成開箱感謝信並待審核通過後，方可開啟下一個心願！`,
        };
      }
    }
    return { canPublish: true };
  } catch (err) {
    console.error('檢查資格失敗:', err);
    return { canPublish: true };
  }
}

/**
 * 儲存所得稅免扣繳申報快照
 */
export async function recordTaxDeclarationSnapshot(record: TaxDeclarationRecord): Promise<void> {
  try {
    await supabase.from('tax_declarations').insert([
      {
        wish_id: record.wish_id,
        user_id: record.user_id,
        product_name: record.product_name,
        amount: record.amount,
        real_name: record.real_name,
        id_number: record.id_number,
        domicile_address: record.domicile_address,
        phone: record.phone || null,
        shipping_address: record.shipping_address || null,
      },
    ]);
  } catch (err) {
    console.warn('稅務申報存檔略過或表不存在:', err);
  }
}