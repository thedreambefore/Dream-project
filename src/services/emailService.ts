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

export async function sendContributionAccessEmail({
  toEmail,
  toName,
  wishId,
  wishTitle,
  amount,
}: SendAccessEmailParams): Promise<boolean> {
  try {
    const accessLink = generateExclusiveAccessLink(wishId, toEmail);

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
      console.error('❌ Edge Function 調用報錯:', error);
      return false;
    }

    if (data?.error) {
      console.error('❌ Brevo 發信拒絕理由:', data.error);
      return false;
    }

    console.log('✅ 專屬免阻斷憑證已成功發信至:', toEmail);
    return true;
  } catch (err) {
    console.error('❌ 發信連線嚴重異常:', err);
    return false;
  }
}npx supabase login