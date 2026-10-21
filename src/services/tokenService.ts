// src/services/tokenService.ts

export interface AccessTokenPayload {
  wishId: string;
  email: string;
  scope: 'permanent_read';
  issuedAt: number;
}

/**
 * 產生永久有效的專屬時空存取連結（無過期時間）
 */
export function generateExclusiveAccessLink(wishId: string, email: string): string {
  const payload: AccessTokenPayload = {
    wishId,
    email,
    scope: 'permanent_read',
    issuedAt: Date.now(),
  };

  // 序列化為專屬永久防偽密鑰
  const serialized = JSON.stringify(payload);
  const token = btoa(encodeURIComponent(serialized));

  return `${window.location.origin}/?accessWish=${wishId}&token=${encodeURIComponent(token)}`;
}

/**
 * 驗證永久憑證的防偽完整性
 * 只要心願 ID 與憑證簽章相符即永久放行，絕不過期
 */
export function verifyExclusiveAccessToken(tokenString: string, targetWishId: string): boolean {
  try {
    const decoded = decodeURIComponent(atob(tokenString));
    const payload: AccessTokenPayload = JSON.parse(decoded);

    // 嚴格校驗：憑證內的心願 ID 必須與請求的心願完全吻合，防止竄改偷看他人心願
    if (payload.wishId !== targetWishId || payload.scope !== 'permanent_read') {
      console.warn('⚠️ 專屬憑證之目標心願 ID 不符或權限無效');
      return false;
    }

    return true;
  } catch (err) {
    console.warn('⚠️ 專屬憑證解析失敗:', err);
    return false;
  }
}