// src/components/LeaderboardWidget.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
  Award,
  Hourglass,
  Compass,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';
import { OFFICIAL_SPONSOR_ID } from '@/lib/backend';

interface LeaderboardWidgetProps {
  wishes: Wish[];
  onScrollToWish: (wishId: string) => void;
  onOpenHonorHall: () => void;
}

export function LeaderboardWidget({
  wishes,
  onScrollToWish,
  onOpenHonorHall,
}: LeaderboardWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeBoard, setActiveBoard] = useState<'fulfilled' | 'inTransit' | 'official'>('fulfilled');

  const [fulfilledTopUsers, setFulfilledTopUsers] = useState<any[]>([]);
  const [inTransitTopUsers, setInTransitTopUsers] = useState<any[]>([]);
  const [officialDonors, setOfficialDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAllBoards = async () => {
      setLoading(true);
      try {
        // 1. 【圓滿引路榜】
        const { data: usersData } = await supabase
          .from('users')
          .select('id, anonymous_nickname, wallet_balance')
          .gt('wallet_balance', 0)
          .order('wallet_balance', { ascending: false })
          .limit(5);

        if (usersData && isMounted) {
          setFulfilledTopUsers(usersData);
        }

        // 2. 【在途守護榜】
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
                const nick = (inv as any).users?.anonymous_nickname || '匿名星旅人';
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
              .slice(0, 5);

            setInTransitTopUsers(sorted);
          }
        }

        // 3. 【星空守護榜】
        const { data: officialInvs } = await supabase
          .from('investments')
          .select('user_id, amount, users:user_id(anonymous_nickname)')
          .or(`wish_id.eq.${OFFICIAL_SPONSOR_ID},story_id.eq.${OFFICIAL_SPONSOR_ID}`);

        if (officialInvs && isMounted) {
          const map: Record<string, { nickname: string; total: number }> = {};
          officialInvs.forEach((inv) => {
            if (inv.user_id) {
              const nick = (inv as any).users?.anonymous_nickname || '匿名星旅人';
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
            .slice(0, 5);

          setOfficialDonors(sortedOfficial);
        }
      } catch (err) {
        console.warn('榜單讀取異常:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllBoards();
    return () => {
      isMounted = false;
    };
  }, []);

  // 🌟 嚴格過濾：臨門一腳只取進度 > 0% 且 < 100% 的進行中心願
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

  return (
    <div className="mb-8 animate-fade-in">
      {/* 頂部徽章膠囊列 */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass rounded-2xl p-2.5 sm:p-3 border border-amber-400/20 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:border-amber-400/40 transition-all select-none"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* 臨門一腳 */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-400/30 px-3 py-1.5 rounded-xl text-xs text-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">臨門一腳：</span>
            {topPercentWishes.length > 0 ? (
              <span className="font-mono text-amber-300 font-bold truncate max-w-[130px]">
                {topPercentWishes[0].product_name} (
                {Math.round(
                  ((topPercentWishes[0].current_stardust || 0) /
                    (topPercentWishes[0].product_price || 1)) *
                    100
                )}
                %)
              </span>
            ) : (
              <span className="text-zinc-500">靜候星光</span>
            )}
          </div>

          {/* 星空守護榜首 */}
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/30 px-3 py-1.5 rounded-xl text-xs text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold">星空守護榜首：</span>
            {officialDonors.length > 0 ? (
              <span className="text-indigo-300 font-mono font-bold truncate max-w-[130px]">
                {officialDonors[0].anonymous_nickname} (⭐{officialDonors[0].amount})
              </span>
            ) : (
              <span className="text-zinc-500">虛位以待</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pr-1">
          <span className="hidden sm:inline text-[11px]">展開榮譽榜</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-amber-300" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* 展開後的榮譽大廳 */}
      {isOpen && (
        <div className="mt-3 glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-950/95 space-y-4 animate-fade-in shadow-2xl">
          {/* 工具列：線條風格分頁 Tab + 直通按鈕 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl text-xs gap-1">
              <button
                type="button"
                onClick={() => setActiveBoard('fulfilled')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeBoard === 'fulfilled'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>圓滿引路榜</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBoard('inTransit')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeBoard === 'inTransit'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Hourglass className="w-3.5 h-3.5" />
                <span>在途守護榜</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveBoard('official')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeBoard === 'official'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>星空守護榜</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenHonorHall}
              className="self-end sm:self-center text-xs px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>前往個人中心完整殿堂</span>
              <ExternalLink className="w-3 h-3 text-amber-300" />
            </button>
          </div>

          {/* 榜單雙欄內容 */}
          {loading ? (
            <div className="text-center py-8 text-xs text-zinc-500">同步星空榜單數據中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 左側：所選排行清單 */}
              <div className="space-y-2">
                <p className="text-[11px] text-zinc-400 font-bold flex items-center gap-1">
                  {activeBoard === 'fulfilled' && <><Award className="w-3.5 h-3.5 text-amber-400" /> 圓滿引路榜 · 故事履約見證榮譽點數 (TOP 5)</>}
                  {activeBoard === 'inTransit' && <><Hourglass className="w-3.5 h-3.5 text-yellow-400" /> 在途守護榜 · 進行中陪伴在途燃料 (TOP 5)</>}
                  {activeBoard === 'official' && <><Sparkles className="w-3.5 h-3.5 text-indigo-400" /> 星空守護榜 · 守護夢沙星空營運之引路人 (TOP 5)</>}
                </p>

                {(() => {
                  const currentList =
                    activeBoard === 'fulfilled'
                      ? fulfilledTopUsers.map((u) => ({ ...u, amount: u.wallet_balance }))
                      : activeBoard === 'inTransit'
                      ? inTransitTopUsers
                      : officialDonors;

                  if (currentList.length === 0) {
                    return (
                      <div className="text-center py-8 text-xs text-zinc-500 border border-white/5 rounded-xl bg-zinc-900/40">
                        虛位以待，等待第一顆引路星點亮
                      </div>
                    );
                  }

                  return currentList.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[200px]">
                        <span
                          className={`font-mono font-black text-xs w-4 text-center ${
                            idx === 0
                              ? 'text-amber-300'
                              : idx === 1
                              ? 'text-slate-300'
                              : idx === 2
                              ? 'text-amber-600'
                              : 'text-zinc-500'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                          {item.anonymous_nickname.substring(0, 1)}
                        </div>
                        <span className="text-zinc-200 truncate font-medium">
                          {item.anonymous_nickname}
                        </span>
                      </div>

                      <div className="text-right font-mono">
                        <span className="text-amber-300 font-bold">
                          ✨ {Number(item.amount || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-500 ml-1">星塵</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* 右側：臨門一腳精準列表 */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 md:pl-4 pt-3 md:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> 臨門一腳 · 接近達成 (未滿 100%)
                  </p>
                  <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                    <Compass className="w-3 h-3" /> 點擊定位卡片
                  </span>
                </div>

                {topPercentWishes.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-500 border border-white/5 rounded-xl bg-zinc-900/40">
                    目前暫無 1% ~ 99% 推進中的心願
                  </div>
                ) : (
                  topPercentWishes.map((w, idx) => {
                    const pct = Math.round(
                      ((w.current_stardust || 0) / (w.product_price || 1)) * 100
                    );
                    return (
                      <div
                        key={w.id}
                        onClick={() => onScrollToWish(w.id)}
                        className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2 truncate max-w-[180px]">
                          <span className="text-amber-400 font-mono font-bold">{idx + 1}.</span>
                          <span>{w.cover_emoji}</span>
                          <span className="text-zinc-200 truncate">{w.product_name}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-300">{pct}%</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}