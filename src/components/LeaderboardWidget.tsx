// src/components/LeaderboardWidget.tsx
import { useState, useEffect, useMemo } from 'react';
import { Flame, ChevronDown, ChevronUp, ExternalLink, Coins, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';
import { OFFICIAL_SPONSOR_ID } from '@/lib/backend';

interface LeaderboardWidgetProps {
  wishes: Wish[];
  onScrollToWish: (wishId: string) => void;
  onOpenHonorHall: () => void;
}

interface UserHonor {
  id: string;
  anonymous_nickname: string;
  wallet_balance: number;
}

interface OfficialDonor {
  user_id: string;
  anonymous_nickname: string;
  total_amount: number;
}

export function LeaderboardWidget({
  wishes,
  onScrollToWish,
  onOpenHonorHall,
}: LeaderboardWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topUsers, setTopUsers] = useState<UserHonor[]>([]);
  const [officialDonors, setOfficialDonors] = useState<OfficialDonor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchLeaderboards = async () => {
      setLoading(true);
      try {
        // 1. 全站已履約總榮譽榜
        const { data: usersData } = await supabase
          .from('users')
          .select('id, anonymous_nickname, wallet_balance')
          .gt('wallet_balance', 0)
          .order('wallet_balance', { ascending: false })
          .limit(3);

        if (usersData && isMounted) {
          setTopUsers(usersData as UserHonor[]);
        }

        // 2. 官方常駐星空守護榜 (支持夢沙官方營運)
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

          const sorted = Object.entries(map)
            .map(([uid, val]) => ({
              user_id: uid,
              anonymous_nickname: val.nickname,
              total_amount: val.total,
            }))
            .sort((a, b) => b.total_amount - a.total_amount)
            .slice(0, 3);

          setOfficialDonors(sorted);
        }
      } catch (err) {
        console.warn('榜單統計載入異常:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLeaderboards();
    return () => {
      isMounted = false;
    };
  }, []);

  // 星河匯聚中：進度 % 數最高（排除官方卡與已滿額 100% 願望）
  const topPercentWishes = useMemo(() => {
    return wishes
      .filter((w) => {
        const isOfficial = w.id === OFFICIAL_SPONSOR_ID;
        const pct = ((w.current_stardust || 0) / (w.product_price || 1)) * 100;
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
      {/* 預設微縮膠囊列 */}
      <div className="glass rounded-2xl p-2.5 sm:p-3 border border-amber-400/20 bg-zinc-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2 flex-wrap">
          {/* 臨門一腳 */}
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 px-3 py-1.5 rounded-xl text-xs text-amber-200 cursor-pointer transition-all"
          >
            <span className="flex items-center gap-1 font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              臨門一腳：
            </span>
            {topPercentWishes.length > 0 ? (
              <span className="font-mono text-amber-300 font-bold truncate max-w-[120px]">
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

          {/* 官方守護者榜首 */}
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-400/30 px-3 py-1.5 rounded-xl text-xs text-indigo-200 cursor-pointer transition-all"
          >
            <span className="flex items-center gap-1 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              星空守護人：
            </span>
            {officialDonors.length > 0 ? (
              <span className="text-indigo-300 truncate max-w-[120px]">
                {officialDonors[0].anonymous_nickname} (⭐{officialDonors[0].total_amount})
              </span>
            ) : (
              <span className="text-zinc-500">虛位以待</span>
            )}
          </div>
        </div>

        {/* 右側按鈕 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenHonorHall}
            className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>榮譽殿堂</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title={isOpen ? '收合榜單' : '展開榜單'}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 展開之雙欄榜單 */}
      {isOpen && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {/* 左欄：臨門一腳 */}
          <div className="glass rounded-2xl p-4 border border-amber-400/20 bg-zinc-950/85 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
                <Flame className="w-4 h-4 text-amber-400" /> 臨門一腳 · 接近達成
              </div>
              <span className="text-[10px] text-zinc-500">依累積百分比排序</span>
            </div>

            {topPercentWishes.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">暫無進行中的活動</div>
            ) : (
              <div className="space-y-1.5">
                {topPercentWishes.map((w, idx) => {
                  const pct = Math.round(
                    ((w.current_stardust || 0) / (w.product_price || 1)) * 100
                  );
                  return (
                    <div
                      key={w.id}
                      onClick={() => onScrollToWish(w.id)}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-amber-500/10 transition-all cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2 truncate max-w-[200px]">
                        <span className="font-mono font-bold text-amber-400 w-3">{idx + 1}</span>
                        <span>{w.cover_emoji}</span>
                        <span className="text-zinc-200 truncate">{w.product_name}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-300">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 右欄：官方星空守護榜 */}
          <div className="glass rounded-2xl p-4 border border-indigo-400/20 bg-zinc-950/85 space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-400" /> 夢沙守護者 · 官方支持榜
              </div>
              <span className="text-[10px] text-zinc-500">支持全站技術運營</span>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-zinc-500">統計守護星光中...</div>
            ) : officialDonors.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">虛位以待，等待第一顆守護星</div>
            ) : (
              <div className="space-y-1.5">
                {officialDonors.map((d, idx) => (
                  <div
                    key={d.user_id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[200px]">
                      <span className="font-mono font-bold text-indigo-400 w-3">{idx + 1}</span>
                      <span className="text-zinc-200 truncate">{d.anonymous_nickname}</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-300">
                      ⭐ {d.total_amount.toLocaleString()} 星
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}