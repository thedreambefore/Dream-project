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
  const progressPercent = Math.round((currentStardust / targetStardust) * 100);

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

    if (!error && data) setMessages(data as Investment[]);
    setLoading(false);
  }, [wish.id]);

  useEffect(() => {
    if (canAccess) loadMessages();
    else setLoading(false);
  }, [canAccess, loadMessages]);

  const userContributionMap = useMemo(() => {
    const map = new Map<string, UserContributionStat>();
    messages.forEach((m) => {
      if (m.user_id) {
        const prev = map.get(m.user_id)?.total || 0;
        const newTotal = prev + Number(m.amount || 0);
        const percent = Math.round((newTotal / targetStardust) * 1000) / 10;
        map.set(m.user_id, { total: newTotal, percent });
      }
    });
    return map;
  }, [messages, targetStardust]);

  const displayedMessages = useMemo(() => {
    if (canAccessSelfOnly) {
      return messages.filter((m) => m.user_id === session?.user?.id);
    }
    if (!session?.user?.id) return messages;

    return [...messages].sort((a, b) => {
      const aIsMe = a.user_id === session.user.id;
      const bIsMe = b.user_id === session.user.id;
      if (aIsMe && !bIsMe) return -1;
      if (!aIsMe && bIsMe) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [messages, canAccessSelfOnly, session?.user?.id]);

  // 🌟 將原先混在 JSX 裡面的文字計算抽至 Hook
  const modalTitles = useMemo(() => {
    if (isOfficial) {
      return {
        title: '夢沙星空意見箱 · 公開留言板',
        subtitle: '官方公開交流區 · 支持星空並留下寶貴建言',
        footer: '您的寶貴建言將於投入星星時永久留存，管理團隊將定期檢閱回饋',
      };
    }
    if (isFulfilled && !isExpiredFromHome) {
      return {
        title: '心願達成公開慶典 · 星砂加油牆',
        subtitle: '🎉 今日全站公開同慶 · 共同沐浴達成微光',
        footer: '🎉 今日為達成公開慶典，明日凌晨起將永久封藏至追番空間',
      };
    }
    if (isFulfilled && isExpiredFromHome) {
      return {
        title: '心願追番結局室 · 私密星語存檔',
        subtitle: '🔒 已換日封藏至追番牆 · 僅限許願者與支持者重溫結局',
        footer: '純粹善意 · 每一句加油話語都點亮了前行築夢的光芒',
      };
    }
    if (isOwner) {
      return {
        title: '星旅人實時加油室 (許願者專屬)',
        subtitle: '✨ 實時見證陌生星旅人為您投下的每一次鼓勵與加油',
        footer: '純粹善意 · 每一句加油話語都點亮了前行築夢的光芒',
      };
    }
    return {
      title: '我的心願加油紀錄',
      subtitle: '⭐ 記錄您為這段夢想點亮的星光與話語',
      footer: '純粹善意 · 每一句加油話語都點亮了前行築夢的光芒',
    };
  }, [isOfficial, isFulfilled, isExpiredFromHome, isOwner]);

  const handleSetReaction = useCallback(async (msgId: string, tag: string) => {
    try {
      await supabase.from('investments').update({ reaction: tag } as unknown as Partial<Investment>).eq('id', msgId);
      setMessages((prev) => prev.map((m) => (m.id === msgId ? ({ ...m, reaction: tag } as unknown as Investment) : m)));
    } catch (err: unknown) {
      alert(`註記失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    }
  }, []);

  const handleToggleHideMessage = useCallback(async (msgId: string, currentHidden: boolean) => {
    try {
      await supabase.from('investments').update({ is_hidden: !currentHidden }).eq('id', msgId);
      setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, is_hidden: !currentHidden } : m)));
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
    modalTitles,
    isAdmin,
    session,
    handleSetReaction,
    handleToggleHideMessage,
  };
}