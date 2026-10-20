// src/components/LeaderboardWidget/useLeaderboardWidget.ts
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import type { Wish } from '@/types/wish';
import type { BoardTab, BoardUserItem } from './types';

export function useLeaderboardWidget(wishes: Wish[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBoard, setActiveBoard] = useState<BoardTab>('nearComplete');

  const [fulfilledTopUsers, setFulfilledTopUsers] = useState<BoardUserItem[]>([]);
  const [inTransitTopUsers, setInTransitTopUsers] = useState<BoardUserItem[]>([]);
  const [officialDonors, setOfficialDonors] = useState<BoardUserItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchAllBoards() {
      setLoading(true);
      try {
        // 1. 圓滿引路榜 (TOP 3)
        const { data: usersData } = await supabase
          .from('users')
          .select('id, anonymous_nickname, wallet_balance')
          .gt('wallet_balance', 0)
          .order('wallet_balance', { ascending: false })
          .limit(3);

        if (usersData && isMounted) {
          setFulfilledTopUsers(
            usersData.map((u) => ({
              id: u.id,
              anonymous_nickname: u.anonymous_nickname || '匿名星旅人',
              amount: Number(u.wallet_balance || 0),
            }))
          );
        }

        // 2. 在途守護榜 (TOP 3)
        const { data: activeWishes } = await supabase
          .from('wishes')
          .select('id')
          .neq('status', 'fulfilled')
          .neq('id', OFFICIAL_SPONSOR_ID);

        const activeWishIds = new Set(activeWishes?.map((w) => w.id) || []);

        if (activeWishIds.size > 0) {
          const { data: allInvs } = await supabase
            .from('investments')
            .select('user_id, amount, wish_id, story_id, users:user_id(anonymous_nickname)');

          if (allInvs && isMounted) {
            const userTransitMap: Record<string, { nickname: string; total: number }> = {};
            allInvs.forEach((inv) => {
              const wid = inv.wish_id || inv.story_id;
              if (wid && activeWishIds.has(wid) && inv.user_id) {
                const nick = (inv as { users?: { anonymous_nickname?: string } }).users?.anonymous_nickname || '匿名星旅人';
                if (!userTransitMap[inv.user_id]) {
                  userTransitMap[inv.user_id] = { nickname: nick, total: 0 };
                }
                userTransitMap[inv.user_id].total += Number(inv.amount || 0);
              }
            });

            const sorted = Object.entries(userTransitMap)
              .map(([id, val]) => ({ id, anonymous_nickname: val.nickname, amount: val.total }))
              .filter((u) => u.amount > 0)
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 3);

            setInTransitTopUsers(sorted);
          }
        }

        // 3. 星空守護榜 (TOP 3)
        const { data: officialInvs } = await supabase
          .from('investments')
          .select('user_id, amount, users:user_id(anonymous_nickname)')
          .or(`wish_id.eq.${OFFICIAL_SPONSOR_ID},story_id.eq.${OFFICIAL_SPONSOR_ID}`);

        if (officialInvs && isMounted) {
          const map: Record<string, { nickname: string; total: number }> = {};
          officialInvs.forEach((inv) => {
            if (inv.user_id) {
              const nick = (inv as { users?: { anonymous_nickname?: string } }).users?.anonymous_nickname || '匿名星旅人';
              if (!map[inv.user_id]) {
                map[inv.user_id] = { nickname: nick, total: 0 };
              }
              map[inv.user_id].total += Number(inv.amount || 0);
            }
          });

          const sortedOfficial = Object.entries(map)
            .map(([uid, val]) => ({
              id: uid,
              anonymous_nickname: val.nickname,
              amount: val.total,
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);

          setOfficialDonors(sortedOfficial);
        }
      } catch (err) {
        console.warn('榜單讀取異常:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchAllBoards();
    return () => {
      isMounted = false;
    };
  }, []);

  // 臨門一腳心願：限制 0% < pct < 100%，嚴格取 TOP 3
  const topPercentWishes = useMemo(() => {
    return wishes
      .filter((w) => {
        const isOfficial = w.id === OFFICIAL_SPONSOR_ID;
        const current = Number(w.current_stardust || 0);
        const target = Number(w.product_price || 1);
        const pct = (current / target) * 100;
        return (
          !isOfficial &&
          pct > 0 &&
          pct < 100 &&
          w.status !== 'fulfilled' &&
          w.status !== 'full_funded'
        );
      })
      .sort((a, b) => {
        const pctA = (a.current_stardust || 0) / (a.product_price || 1);
        const pctB = (b.current_stardust || 0) / (b.product_price || 1);
        return pctB - pctA;
      })
      .slice(0, 3);
  }, [wishes]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    toggleOpen,
    activeBoard,
    setActiveBoard,
    topPercentWishes,
    fulfilledTopUsers,
    inTransitTopUsers,
    officialDonors,
    loading,
  };
}