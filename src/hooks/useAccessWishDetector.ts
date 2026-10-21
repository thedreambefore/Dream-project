// src/hooks/useAccessWishDetector.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { verifyExclusiveAccessToken } from '@/services/tokenService';
import type { Wish } from '@/types/wish';

export function useAccessWishDetector() {
  const [accessWish, setAccessWish] = useState<Wish | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // 關閉漂流瓶時清理網址列參數，維持潔淨 URL
  const clearAccessWish = useCallback(() => {
    setAccessWish(null);
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetWishId = params.get('accessWish');
    const token = params.get('token');

    if (!targetWishId || !token) return;

    // 1. 驗證 Token 合法性（永久有效，防竄改）
    const isValid = verifyExclusiveAccessToken(token, targetWishId);
    if (!isValid) {
      alert('⚠️ 您的專屬免阻斷查看憑證無效或已被竄改。');
      return;
    }

    setIsVerifying(true);

    // 2. 直接從資料庫抓取該心願（即便首頁已下架封存也能直通讀取）
    supabase
      .from('wishes')
      .select('*')
      .eq('id', targetWishId)
      .maybeSingle()
      .then(({ data, error }) => {
        setIsVerifying(false);
        if (error || !data) {
          alert('找不到該心願的時空紀錄。');
          return;
        }
        setAccessWish(data as Wish);
      });
  }, []);

  return {
    accessWish,
    isVerifying,
    clearAccessWish,
  };
}