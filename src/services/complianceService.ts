// src/services/complianceService.ts
import { supabase } from '@/lib/supabaseClient';
import type { Wish, SensitiveWord, TaxDeclarationRecord } from '@/types/wish';

// 預設備用違禁詞
export const DEFAULT_SENSITIVE_WORDS = [
  '詐騙', '匯款', '違禁品', '賭博', '毒品', '槍械', '代購', '眾籌', '募資', '投資', '回報率'
];

/**
 * 取得系統中的敏感詞清單（優先自 Supabase 讀取，失敗時降級為預設值）
 */
export async function fetchSensitiveWords(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('sensitive_words')
      .select('word')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return DEFAULT_SENSITIVE_WORDS;
    }
    const dbWords = data.map((item: { word: string }) => item.word);
    // 合併去重
    return Array.from(new Set([...DEFAULT_SENSITIVE_WORDS, ...dbWords]));
  } catch (err) {
    console.warn('載入敏感詞異常，套用預設詞庫:', err);
    return DEFAULT_SENSITIVE_WORDS;
  }
}

/**
 * 檢查使用者是否滿足發布新規範：
 * 每帳號同時只能存在「一個」進行中的心願。
 * 若已有先前的願望，必須符合：
 * 1. 該願望已結束（status === 'fulfilled'）
 * 2. 開箱感謝信已提交且經管理員核准（letter_status === 'approved'）
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

    if (error || !data || data.length === 0) {
      return { canPublish: true };
    }

    const wishes = data as Wish[];

    // 檢查是否有尚未履行完畢或感謝信尚未通過的心願
    for (const w of wishes) {
      // 情況 A：心願仍在推進中、待審核或達成待出貨
      if (w.status === 'pending' || w.status === 'approved' || w.status === 'full_funded') {
        return {
          canPublish: false,
          blockingWish: w,
          reason: `您目前已有進行中的心願「${w.product_name}」（狀態：${
            w.status === 'pending' ? '審核中' : w.status === 'approved' ? '集星推進中' : '圓滿排定寄送中'
          }）。每位星旅人同時僅能開啟一個主題活動！`,
        };
      }

      // 情況 B：心願已出貨（fulfilled），但開箱感謝信尚未核准
      if (w.status === 'fulfilled' && w.letter_status !== 'approved') {
        return {
          canPublish: false,
          blockingWish: w,
          reason: `您的心願「${w.product_name}」贈禮已送達，請先前往「我的心願」撰寫開箱感謝信並待管理團隊審核通過後，方可開啟下一個心願！`,
        };
      }
    }

    return { canPublish: true };
  } catch (err) {
    console.error('檢查心願發布資格失敗:', err);
    return { canPublish: true };
  }
}

/**
 * 儲存所得稅免扣繳申報快照（贈禮價值 >= NT$ 1,000）
 */
export async function recordTaxDeclarationSnapshot(record: TaxDeclarationRecord): Promise<void> {
  try {
    const { error } = await supabase.from('tax_declarations').insert([
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

    if (error) {
      // 若無獨立 tax_declarations 表，則記錄至主後台日誌避免阻斷
      console.warn('tax_declarations 寫入備忘:', error.message);
    }
  } catch (err) {
    console.error('稅務申報資料存檔錯誤:', err);
  }
}