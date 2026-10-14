// src/components/LeaderboardWidget.tsx
import { useState, useEffect } from 'react';
import {
  Flame,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Coins,
  Sparkles,
  ShieldCheck,
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

  // 三大榜單狀態
  const [fulfilledTopUsers, setFulfilledTopUsers] = useState<any[]>([]);
  const [inTransitTopUsers, setInTransitTopUsers] = useState<any[]>([]);
  const [officialDonors, setOfficialDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchAllBoards = async () => {
      setLoading(true);
      try {
        // 1. 全額圓滿履約榜 (users.wallet_balance > 0)
        const { data: usersData } = await supabase
          .from('users')
          .select('id, anonymous_nickname, wallet_balance')
          .gt('wallet_balance', 0)
          .order('wallet_balance', { ascending: false })
          .limit(5);

        if (usersData && isMounted) {
          setFulfilledTopUsers(usersData);
        }

        // 2. 在途守護榜 (只撈取未出貨願望的在途投資額)
        const { data: activeWishes } = await supabase
          .from('wishes')
          .select('id')
          .neq('status', 'fulfilled');

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

        // 3. 官方支持榜 (斗內常駐卡)
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

  // 臨門一腳最高進度願望
  const topPercentWishes = wishes
    .filter((w) => {
      const isOfficial = w.id === OFFICIAL_SPONSOR_ID;
      const pct = ((w.current_stardust || 0) / (w.product_price || 1)) * 100;
      return !isOfficial && pct > 0 && pct < 100 && w.status !== 'fulfilled';
    })
    .sort((a, b) => {
      const pctA = (a.current_stardust || 0) / (a.product_price || 1);
      const pctB = (b.current_stardust || 0) / (b.product_price || 1);
      return pctB - pctA;
    })
    .slice(0, 3);

  return (
    <div className="mb-8 animate-fade-in">
      {/* 膠囊收合列：乾淨精簡，移除直通按鈕，僅保留展開觸發 */}
      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="glass rounded-2xl p-2.5 sm:p-3 border border-amber-400/20 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:border-amber-400/40 transition-all"
      >
        <div className="flex items-center gap-2 flex-wrap">
          {/* 徽章 1：臨門一腳 */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-400/30 px-3 py-1.5 rounded-xl text-xs text-amber-200">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
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
              <span className="text-zinc-500">靜候星塵</span>
            )}
          </div>

          {/* 徽章 2：官方守護榜首 */}
          <div className="flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/30 px-3 py-1.5 rounded-xl text-xs text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold">星空守護榜首：</span>
            {officialDonors.length > 0 ? (
              <span className="text-indigo-300 truncate max-w-[130px]">
                {officialDonors[0].anonymous_nickname} (⭐{officialDonors[0].amount})
              </span>
            ) : (
              <span className="text-zinc-500">虛位以待</span>
            )}
          </div>
        </div>

        {/* 展開箭頭提示 */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 pr-1">
          <span className="hidden sm:inline text-[11px]">查看三大榮譽榜</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-amber-300" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* 展開之完整榜單大廳 */}
      {isOpen && (
        <div className="mt-3 glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-950/90 space-y-4 animate-fade-in shadow-2xl">
          {/* 頂部切換 Tab 與 直通按鈕 */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl text-xs gap-1">
              <button
                type="button"
                onClick={() => setActiveBoard('fulfilled')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeBoard === 'fulfilled'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🌌 圓滿引路榜 (全額達成)
              </button>
              <button
                type="button"
                onClick={() => setActiveBoard('inTransit')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeBoard === 'inTransit'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                ⏳ 在途守護榜 (守護中)
              </button>
              <button
                type="button"
                onClick={() => setActiveBoard('official')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  activeBoard === 'official'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                🪐 官方支持榜 (斗內網站)
              </button>
            </div>

            {/* 🌟 依指示：榮譽殿堂直通按鈕移至展開後呈現 */}
            <button
              type="button"
              onClick={onOpenHonorHall}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/40 text-amber-200 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <span>前往個人中心完整殿堂</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-300" />
            </button>
          </div>

          {/* 榜單資料渲染 */}
          {loading ? (
            <div className="text-center py-8 text-xs text-zinc-500">同步星空榜單數據中...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 左側：當前所選排行榜清單 */}
              <div className="space-y-2">
                <p className="text-[11px] text-zinc-400 font-bold">
                  {activeBoard === 'fulfilled' && '🏆 已見證故事履約之永久榮譽星塵總量 (TOP 5)'}
                  {activeBoard === 'inTransit' && '🛡️ 陪伴主角奔向終點的在途守護燃料 (TOP 5)'}
                  {activeBoard === 'official' && '💫 支持夢沙星空伺服器與維運之守護者 (TOP 5)'}
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
                        虛位以待，等待第一位星旅人點亮光芒
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

              {/* 右側：臨門一腳快速定位 */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 md:pl-4 pt-3 md:pt-0">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-amber-300 font-bold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" /> 臨門一腳 · 搶先見證
                  </p>
                  <span className="text-[10px] text-zinc-500">點擊即刻定位卡片</span>
                </div>

                {topPercentWishes.length === 0 ? (
                  <div className="text-center py-8 text-xs text-zinc-500 border border-white/5 rounded-xl bg-zinc-900/40">
                    目前暫無推進中的活動
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