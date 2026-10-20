// src/lib/stardust.ts

export const SENSITIVE_WORDS = ['詐騙', '匯款', '違禁品', '賭博', '毒品', '槍械'];

/**
 * 檢查文字是否包含敏感詞
 */
export function checkSensitiveWords(text: string): string | null {
  for (const word of SENSITIVE_WORDS) {
    if (text.includes(word)) {
      return word;
    }
  }
  return null;
}

/**
 * 計算進度百分比（可超過 100%）
 */
export function calculateProgress(current: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.round((Number(current || 0) / Number(target)) * 100);
}

/**
 * 計算個人貢獻佔比（精確至小數點後 1 位）
 */
export function calculateContributionRatio(userInvested: number, target: number): number {
  if (!target || target <= 0 || !userInvested || userInvested <= 0) return 0;
  return Math.round((Number(userInvested) / Number(target)) * 1000) / 10;
}

export interface GuardianTier {
  level: 1 | 2 | 3 | 4;
  label: string;
  cardClass: string;
  glimmerClass: string;
  badgeClass: string;
}

/**
 * 取得守護階梯等級與樣式定義
 */
export function getGuardianTier(ratio: number): GuardianTier | null {
  if (ratio <= 0) return null;
  if (ratio >= 50) {
    return {
      level: 4,
      label: `✦ 守護神 · ${ratio}%`,
      cardClass: 'tier-4-card',
      glimmerClass: 'tier-4-glimmer',
      badgeClass: 'bg-amber-950/80 border-amber-400/60 text-amber-200 shadow-sm',
    };
  }
  if (ratio >= 40) {
    return {
      level: 3,
      label: `✦ 耀夜者 · ${ratio}%`,
      cardClass: 'tier-3-card',
      glimmerClass: 'tier-3-glimmer',
      badgeClass: 'bg-zinc-900/90 border-amber-500/40 text-amber-300',
    };
  }
  if (ratio >= 20) {
    return {
      level: 2,
      label: `✦ 領航者 · ${ratio}%`,
      cardClass: 'tier-2-card',
      glimmerClass: 'tier-2-glimmer',
      badgeClass: 'bg-zinc-900/90 border-amber-300/30 text-amber-100',
    };
  }
  return {
    level: 1,
    label: `✦ 已守護 · ${ratio}%`,
    cardClass: 'tier-1-card',
    glimmerClass: 'tier-1-glimmer',
    badgeClass: 'bg-zinc-900/80 border-white/20 text-zinc-300',
  };
}

/**
 * 計算服務費
 * 50~100 固定 NT$ 5；> 100 按 5% 計算
 */
export function calculateServiceFee(amount: number): { fee: number; total: number; label: string } {
  const validAmount = Math.max(0, amount || 0);
  let fee = 5;
  if (validAmount > 100) {
    fee = Math.round(validAmount * 0.05);
  }
  return {
    fee,
    total: validAmount + fee,
    label: validAmount <= 100 ? '系統與技術服務費 (固定 NT$ 5)' : '系統與技術服務費 (5%)',
  };
}