// src/services/emailService.ts
import { supabase } from '@/lib/supabaseClient';

interface SendAccessEmailParams {
  toEmail: string;
  toName: string;
  wishId: string;
  wishTitle: string;
  amount: number;
}

/**
 * 產生 30 天時效之免登入回訪 Token 連結
 */
export function generateAccessLink(wishId: string): string {
  const payload = {
    wid: wishId,
    ts: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 天
  };
  const token = btoa(JSON.stringify(payload));
  return `${window.location.origin}/?accessWish=${wishId}&token=${encodeURIComponent(token)}`;
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
  const accessLink = generateAccessLink(wishId);

  try {
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
      console.warn('⚠️ Edge Function 發信回傳異常:', error);
      return false;
    }

    return data?.success === true;
  } catch (err) {
    console.warn('⚠️ 呼叫發信 Edge Function 失敗:', err);
    return false;
  }
}