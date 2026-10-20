import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import type { TransitItem, LeaderboardUser } from '../../types';

export function useWallet() {
  const { session, profile } = useAuth();
  const [hallTab, setHallTab] = useState<'fulfilled' | 'inTransit' | 'official'>('fulfilled');
  const [showTransitDetails, setShowTransitDetails] = useState(false);

  const [transitList, setTransitList] = useState<TransitItem[]>([]);
  const [fulfilledTopUsers, setFulfilledTopUsers] = useState<LeaderboardUser[]>([]);
  const [inTransitTopUsers, setInTransitTopUsers] = useState<LeaderboardUser[]>([]);
  const [officialDonors, setOfficialDonors] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        // 1. 抓取全站未完結的心願清單
        const { data: activeWishes } = await supabase
          .from('wishes')
          .select('id, product_name, cover_emoji, current_stardust, product_price, status')
          .neq('status', 'fulfilled')
          .neq('id', OFFICIAL_SPONSOR_ID);

        const wishMap = new Map((activeWishes || []).map((w) => [w.id, w]));

        // 2. 登入者個人在途紀錄
        if (session?.user?.id && wishMap.size > 0) {
          const { data: myInvs } = await supabase
            .from('investments')
            .select('id, amount, message, created_at, wish_id, story_id')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

          if (myInvs && isMounted) {
            const list: TransitItem[] = [];
            myInvs.forEach((inv) => {
              const wid = inv.wish_id || inv.story_id;
              const targetWish = wishMap.get(wid);
              if (targetWish) {
                list.push({
                  id: inv.id,
                  amount: Number(inv.amount || 0),
                  message: inv.message,
                  created_at: inv.created_at,
                  wish: targetWish,
                });
              }
            });
            setTransitList(list);
          }
        }

        // 3. 圓滿引路榜 TOP 10
        const { data: fulfilledData } = await supabase
          .from('users')
          .select('id, anonymous_nickname, wallet_balance')
          .gt('wallet_balance', 0)
          .order('wallet_balance', { ascending: false })
          .limit(10);

        if (fulfilledData && isMounted) {
          setFulfilledTopUsers(
            fulfilledData.map((u) => ({
              id: u.id,
              anonymous_nickname: u.anonymous_nickname || '匿名星旅人',
              amount: Number(u.wallet_balance || 0),
            }))
          );
        }

        // 4. 在途守護榜 TOP 10
        if (wishMap.size > 0) {
          const { data: allInvs } = await supabase
            .from('investments')
            .select('user_id, amount, wish_id, story_id, users:user_id(anonymous_nickname)');

          if (allInvs && isMounted) {
            const transitMap: Record<string, { nickname: string; total: number }> = {};
            allInvs.forEach((inv) => {
              const wid = inv.wish_id || inv.story_id;
              if (wid && wishMap.has(wid) && inv.user_id) {
                const nick = (inv as { users?: { anonymous_nickname?: string } }).users?.anonymous_nickname || '匿名星旅人';
                if (!transitMap[inv.user_id]) {
                  transitMap[inv.user_id] = { nickname: nick, total: 0 };
                }
                transitMap[inv.user_id].total += Number(inv.amount || 0);
              }
            });

            const sorted = Object.entries(transitMap)
              .map(([id, val]) => ({ id, anonymous_nickname: val.nickname, amount: val.total }))
              .filter((u) => u.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 10);

            setInTransitTopUsers(sorted);
          }
        }

        // 5. 星空守護榜 TOP 10
        const { data: offInvs } = await supabase
          .from('investments')
          .select('user_id, amount, users:user_id(anonymous_nickname)')
          .or(`wish_id.eq.${OFFICIAL_SPONSOR_ID},story_id.eq.${OFFICIAL_SPONSOR_ID}`);

        if (offInvs && isMounted) {
          const offMap: Record<string, { nickname: string; total: number }> = {};
          offInvs.forEach((inv) => {
            if (inv.user_id) {
              const nick = (inv as { users?: { anonymous_nickname?: string } }).users?.anonymous_nickname || '匿名星旅人';
              if (!offMap[inv.user_id]) offMap[inv.user_id] = { nickname: nick, total: 0 };
              offMap[inv.user_id].total += Number(inv.amount || 0);
            }
          });

          const sortedOff = Object.entries(offMap)
            .map(([id, val]) => ({ id, anonymous_nickname: val.nickname, amount: val.total }))
            .filter((u) => u.amount > 0)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);

          setOfficialDonors(sortedOff);
        }
      } catch (err) {
        console.warn('榮譽館載入異常:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const totalHonor = profile?.wallet_balance ?? 0;
  const myInTransitAmount = useMemo(() => {
    return transitList.reduce((acc, cur) => acc + cur.amount, 0);
  }, [transitList]);

  return {
    hallTab,
    setHallTab,
    showTransitDetails,
    setShowTransitDetails,
    transitList,
    totalHonor,
    myInTransitAmount,
    fulfilledTopUsers,
    inTransitTopUsers,
    officialDonors,
    loading,
  };
}