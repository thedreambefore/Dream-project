// src/pages/AdminConsole/services/adminService.ts
import { supabase } from '@/lib/supabaseClient';
import { updateWish } from '@/lib/backend';
import { recordTaxDeclarationSnapshot } from '@/services/complianceService';
import type { Wish } from '@/types/wish';
import type { InvestmentWithUser } from '../types';

/**
 * 結算並完成出貨：
 * 1. 查詢該心願所有支持者投下的星塵紀錄
 * 2. 累加每位用戶的投入數額並轉化為個人永久榮譽星塵（users.wallet_balance）
 * 3. 若贈禮價值 >= NT$ 1,000，自動儲存國稅局標準免扣繳申報快照
 * 4. 更新心願狀態為 fulfilled，寫入官方見證祝福
 */
export async function fulfillWishAndSettleHonor(
  wish: Wish,
  adminBlessing: string
): Promise<void> {
  const defaultBlessing = '夢沙星空見證了這份純粹的善意，願這份溫暖伴隨你迎向嶄新的明天！';
  const wishId = wish.id;

  // 1. 抓取提案人個資以備申報快照
  const { data: creatorData } = await supabase
    .from('users')
    .select('real_name, id_number, domicile_address, phone, address')
    .eq('id', wish.user_id)
    .maybeSingle();

  // 2. 滿千門檻：自動持久化所得稅申報快照
  if (Number(wish.product_price || 0) >= 1000 && creatorData) {
    await recordTaxDeclarationSnapshot({
      wish_id: wish.id,
      user_id: wish.user_id,
      product_name: wish.product_name,
      amount: Number(wish.product_price || 0),
      real_name: creatorData.real_name || '未填寫姓名',
      id_number: creatorData.id_number || '未填寫身分證',
      domicile_address: creatorData.domicile_address || '未填寫戶籍地址',
      phone: creatorData.phone,
      shipping_address: creatorData.address,
    });
  }

  // 3. 支持者投入星塵結算
  const { data: invList, error: invError } = await supabase
    .from('investments')
    .select('user_id, amount')
    .or(`wish_id.eq.${wishId},story_id.eq.${wishId}`);

  if (invError) throw invError;

  if (invList && invList.length > 0) {
    const userSums: Record<string, number> = {};
    invList.forEach((inv) => {
      if (inv.user_id) {
        userSums[inv.user_id] = (userSums[inv.user_id] || 0) + Number(inv.amount || 0);
      }
    });

    for (const [userId, addAmount] of Object.entries(userSums)) {
      const { data: userData } = await supabase
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .maybeSingle();

      const currentBalance = Number(userData?.wallet_balance || 0);
      await supabase
        .from('users')
        .update({ wallet_balance: currentBalance + addAmount })
        .eq('id', userId);
    }
  }

  // 4. 更新心願狀態為已完成
  await updateWish(wishId, {
    status: 'fulfilled',
    admin_blessing: adminBlessing.trim() || defaultBlessing,
  });
}

/**
 * 載入指定心願的加油留言明細
 */
export async function fetchWishInvestments(wishId: string): Promise<InvestmentWithUser[]> {
  const { data, error } = await supabase
    .from('investments')
    .select('id, amount, message, is_hidden, created_at, users:user_id(anonymous_nickname)')
    .or(`wish_id.eq.${wishId},story_id.eq.${wishId}`)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as unknown as InvestmentWithUser[]) || [];
}