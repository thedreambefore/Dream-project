// src/services/investmentService.ts
import { supabase } from '@/lib/supabaseClient';
import { updateWish, OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import { sendContributionAccessEmail } from '@/services/emailService';
import type { Wish } from '@/types/wish';

export interface FeeCalculation {
  fee: number;
  total: number;
  label: string;
  isValid: boolean;
}

export function calculateServiceFee(amount: number, isOfficial: boolean): FeeCalculation {
  const validAmount = Math.max(0, amount || 0);

  if (validAmount < 50 && !isOfficial) {
    return {
      fee: 0,
      total: validAmount,
      label: '單次最低需投下 50 顆星星',
      isValid: false,
    };
  }

  let fee = 5;
  if (validAmount > 100) {
    fee = Math.round(validAmount * 0.05);
  }

  return {
    fee,
    total: validAmount + fee,
    label: validAmount <= 100 ? '系統與技術服務費 (固定 NT$ 5)' : '系統與技術服務費 (5%)',
    isValid: true,
  };
}

export interface InvestmentParams {
  userId: string;
  story: Wish;
  amount: number;
  message: string;
}

export interface InvestmentResult {
  newTotalStardust: number;
  isNewlyFunded: boolean;
}

export async function executeStarInvestment({
  userId,
  story,
  amount,
  message,
}: InvestmentParams): Promise<InvestmentResult> {
  const isOfficial = story.id === OFFICIAL_SPONSOR_ID;
  const currentStardust = Number(story.current_stardust || 0);
  const targetPrice = Number(story.product_price || 0);
  const payAmount = Number(amount);

  // 🌟 核心修正：改用 PromiseLike<unknown>[] 以完美相容 Supabase Postgrest Builder
  const tasks: PromiseLike<unknown>[] = [];

  // 1. 寫入投資紀錄
  tasks.push(
    supabase.from('investments').insert({
      user_id: userId,
      wish_id: story.id,
      story_id: story.id,
      amount: payAmount,
      message: message.trim() || '投下了閃爍的願望星！',
      is_hidden: false,
    })
  );

  // 2. 自動加入追番牆
  if (!isOfficial) {
    tasks.push(
      supabase.from('bookmarks').upsert(
        { user_id: userId, wish_id: story.id },
        { onConflict: 'user_id,wish_id' }
      )
    );
  }

  // 3. 計算新星塵總額
  const newTotal = currentStardust + payAmount;
  const isNewlyFunded = !isOfficial && newTotal >= targetPrice && story.status === 'approved';
  const newStatus = isNewlyFunded ? 'full_funded' : story.status;

  const updatePayload: Record<string, unknown> = {
    current_stardust: newTotal,
    status: newStatus,
  };

  if (isNewlyFunded && !story.funded_at) {
    updatePayload.funded_at = new Date().toISOString();
  }

  tasks.push(updateWish(story.id, updatePayload));

  await Promise.all(tasks);

  story.current_stardust = newTotal;
  story.status = newStatus as Wish['status'];

  // 觸發 Brevo 專屬憑證郵件
  const authUser = (await supabase.auth.getUser()).data.user;
  if (authUser?.email && !isOfficial) {
    sendContributionAccessEmail({
      toEmail: authUser.email,
      toName: story.anonymous_nickname || '星旅人',
      wishId: story.id,
      wishTitle: story.product_name,
      amount: payAmount,
    }).catch((e) => console.warn('發送信件略過:', e));
  }

  return {
    newTotalStardust: newTotal,
    isNewlyFunded,
  };
}