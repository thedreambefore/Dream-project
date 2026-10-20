// src/components/DriftBottleModal/useDriftBottleModal.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import type { Wish, Investment } from '@/types/wish';
import type { UserContributionStat } from './types';

export function useDriftBottleModal(wish: Wish, isFulfilled: boolean) {
  const { session, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDonated, setHasDonated] = useState(false);

  const isOfficial = wish.id === OFFICIAL_SPONSOR_ID;
  const isOwner = session?.user?.id === wish.user_id;

  const currentStardust = Number(wish.current_stardust || 0);
  const targetStardust = Number(wish.product_price || 1);
  const progressPercent = Math.min(100, Math.round((currentStardust / targetStardust) * 100));

  // 判定是否超過達成隔天凌晨 00:00:00 (換日過期)
  const isExpiredFromHome = useMemo(() => {
    if (!isFulfilled || isOfficial) return false;
    const fundedDateStr = (wish as { funded_at?: string; created_at: string }).funded_at || wish.created_at;
    if (!fundedDateStr) return false;
    const fundedDate = new Date(fundedDateStr);
    const nextDayMidnight = new Date(
      fundedDate.getFullYear(),
      fundedDate.getMonth(),
      fundedDate.getDate() + 1,
      0,
      0,
      0
    );
    return new Date().getTime() >= nextDayMidnight.getTime();
  }, [isFulfilled, isOfficial, wish]);

  // 1. 查詢登入者是否曾投星
  useEffect(() => {
    if (!session?.user?.id || isOfficial) return;
    supabase
      .from('investments')
      .select('id')
      .eq('user_id', session.user.id)
      .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setHasDonated(true);
      });
  }, [session?.user?.id, wish.id, isOfficial]);

  // 2. 時空矩陣權限計算
  const canAccessFullRoom =
    isOfficial ||
    isAdmin ||
    (isFulfilled && !isExpiredFromHome) ||
    (isFulfilled && isExpiredFromHome && (isOwner || hasDonated)) ||
    (!isFulfilled && isOwner);

  const canAccessSelfOnly = !isFulfilled && !isOwner && hasDonated;
  const canAccess = canAccessFullRoom || canAccessSelfOnly;

  const loadMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('investments')
      .select('*, users:user_id(anonymous_nickname)')
      .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data as Investment[]);
    }
    setLoading(false);
  }, [wish.id]);

  useEffect(() => {
    if (canAccess) {
      loadMessages();
    } else {
      setLoading(false);
    }
  }, [canAccess, loadMessages]);

  // 累計投入星塵與佔比
  const userContributionMap = useMemo(() => {
    const map = new Map<string, UserContributionStat>();
    messages.forEach((m) => {
      if (m.user_id) {
        const prev = map.get(m.user_id)?.total || 0;
        const newTotal = prev + Number(m.amount || 0);
        const percent = Math.min(100, Math.round((newTotal / targetStardust) * 1000) / 10);
        map.set(m.user_id, { total: newTotal, percent });
      }
    });
    return map;
  }, [messages, targetStardust]);

  // 顯示訊息過濾
  const displayedMessages = useMemo(() => {
    if (canAccessSelfOnly) {
      return messages.filter((m) => m.user_id === session?.user?.id);
    }
    if (!isOfficial || !session?.user?.id) return messages;
    return [...messages].sort((a, b) => {
      const aIsMe = a.user_id === session.user.id;
      const bIsMe = b.user_id === session.user.id;
      if (aIsMe && !bIsMe) return -1;
      if (!aIsMe && bIsMe) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [messages, canAccessSelfOnly, isOfficial, session?.user?.id]);

  // 管理員：優質註記
  const handleSetReaction = useCallback(async (msgId: string, tag: string) => {
    try {
      await supabase.from('investments').update({ reaction: tag } as unknown as Partial<Investment>).eq('id', msgId);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? ({ ...m, reaction: tag } as unknown as Investment) : m))
      );
    } catch (err: unknown) {
      alert(`註記失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  }, []);

  // 管理員：非破壞性遮蔽
  const handleToggleHideMessage = useCallback(async (msgId: string, currentHidden: boolean) => {
    try {
      await supabase.from('investments').update({ is_hidden: !currentHidden }).eq('id', msgId);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, is_hidden: !currentHidden } : m))
      );
    } catch (err: unknown) {
      alert(`處置失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  }, []);

  return {
    isOfficial,
    isOwner,
    currentStardust,
    targetStardust,
    progressPercent,
    isExpiredFromHome,
    canAccess,
    canAccessSelfOnly,
    loading,
    displayedMessages,
    userContributionMap,
    isAdmin,
    session,
    handleSetReaction,
    handleToggleHideMessage,
  };
}