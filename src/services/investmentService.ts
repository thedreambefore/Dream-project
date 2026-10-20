// src/services/investmentService.ts
import { supabase } from '@/lib/supabaseClient';
import { updateWish, OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import type { Wish } from '@/types/wish';

export interface FeeCalculation {
  fee: number;
  total: number;
  label: string;
  isValid: boolean;
}

/**
 * 計算金流與技術服務費：
 * - 50 ~ 100 顆：固定收 NT$ 5
 * - 超過 100 顆：依 5% 計收
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
 * 執行星塵注入交易（統一帳目與閉環）：
 * 1. 100% 全額投入目標心願（杜絕過去分流導致帳目不一致問題）
 * 2. 寫入 investments 表
 * 3. 非官方心願自動登錄追番牆 bookmarks
 * 4. 更新 wishes 累計星塵；若首次達標（>= product_price），自動更新狀態為 full_funded 並記錄 funded_at
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

  // 1. 寫入投資紀錄（全額計入本心願，保證帳目 1:1 絕對吻合）
  const { error: invError } = await supabase.from('investments').insert({
    user_id: userId,
    wish_id: story.id,
    story_id: story.id,
    amount: payAmount,
    message: message.trim() || '投下了閃爍的願望星！',
    is_hidden: false,
  });

  if (invError) {
    throw new Error(`星塵紀錄寫入失敗: ${invError.message}`);
  }

  // 2. 非官方活動自動加入個人追番牆
  if (!isOfficial) {
    const { error: bmError } = await supabase.from('bookmarks').upsert(
      { user_id: userId, wish_id: story.id },
      { onConflict: 'user_id,wish_id' }
    );
    if (bmError) {
      console.warn('追番牆自動登錄失敗 (非致命):', bmError.message);
    }
  }

  // 3. 計算新星塵總額與達標狀態
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

  // 4. 更新心願狀態
  await updateWish(story.id, updatePayload);

  // 同步當前內存物件
  story.current_stardust = newTotal;
  story.status = newStatus as Wish['status'];

  return {
    newTotalStardust: newTotal,
    isNewlyFunded,
  };
}