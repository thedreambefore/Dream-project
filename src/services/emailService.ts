// src/services/emailService.ts
import { supabase } from '@/lib/supabaseClient';
import { generateExclusiveAccessLink } from './tokenService';

export interface SendAccessEmailParams {
  toEmail: string;
  toName: string;
  wishId: string;
  wishTitle: string;
  amount: number;
}

/**
 * 呼叫 Supabase Edge Function 發送專屬憑證信件
 */
export async function sendContributionAccessEmail({
  toEmail,
  toName,
  wishId,
  wishTitle,
  amount,
}: SendAccessEmailParams): Promise<boolean> {
  try {
    // 1. 產生永久有效之免登入專屬連結
    const accessLink = generateExclusiveAccessLink(wishId, toEmail);

    // 2. 透過 Supabase SDK 安全調用伺服器端 Edge Function
    const { data, error } = await supabase.functions.invoke('send-access-email', {
      body: {
        toEmail,
        toName,
        wishId,
        wishTitle,
        amount,
        accessLink,
      },
    });

    if (error) {
      console.error('❌ Edge Function 發信失敗:', error.message);
      return false;
    }

    return Boolean(data?.success);
  } catch (err) {
    console.error('❌ 發信服務調用異常:', err);
    return false;
  }
}