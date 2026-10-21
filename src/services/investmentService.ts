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

/**
 * 系統與技術服務費階梯試算：
 * - 50 ~ 100 顆：固定收 NT$ 5
 * - 超過 100 顆：按 5% 計收
 */
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

/**
 * 執行星塵投入核心事務
 */
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

  const tasks: PromiseLike<unknown>[] = [];

  // 1. 寫入加油投資紀錄（加入 .throwOnError() 杜絕靜默失敗）
  tasks.push(
    supabase
      .from('investments')
      .insert({
        user_id: userId,
        wish_id: story.id,
        story_id: story.id,
        amount: payAmount,
        message: message.trim() || '投下了閃爍的願望星！',
        is_hidden: false,
      })
      .throwOnError()
  );

  // 2. 非官方常駐卡，自動登錄追番牆
  if (!isOfficial) {
    tasks.push(
      supabase
        .from('bookmarks')
        .upsert(
          { user_id: userId, wish_id: story.id },
          { onConflict: 'user_id,wish_id' }
        )
        .throwOnError()
    );
  }

  // 3. 計算累計星塵與首次達標狀態
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

  // 平行處理所有資料庫更新
  await Promise.all(tasks);

  // 同步記憶體物件
  story.current_stardust = newTotal;
  story.status = newStatus as Wish['status'];

  // 🌟 4. 派發 Brevo 專屬免阻斷憑證信件
  const authUser = (await supabase.auth.getUser()).data.user;
  if (authUser?.email && !isOfficial) {
    // 修正：抓取投星支持者本人的暱稱，而非許願者的暱稱
    const { data: userData } = await supabase
      .from('users')
      .select('anonymous_nickname')
      .eq('id', userId)
      .maybeSingle();

    const supporterName = userData?.anonymous_nickname || '星旅人';

    sendContributionAccessEmail({
      toEmail: authUser.email,
      toName: supporterName,
      wishId: story.id,
      wishTitle: story.product_name,
      amount: payAmount,
    }).catch((e) => console.warn('專屬憑證信發送略過:', e));
  }

  return {
    newTotalStardust: newTotal,
    isNewlyFunded,
  };
}