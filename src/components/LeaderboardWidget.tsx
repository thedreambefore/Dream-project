// src/components/LeaderboardWidget.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Coins,
  Compass,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';

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

export function LeaderboardWidget({
  wishes,
  onScrollToWish,
  onOpenHonorHall,
}: LeaderboardWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [topUsers, setTopUsers] = useState<UserHonor[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 1. 撈取全站已圓滿履約「榮譽星塵總量」前 3 名匿名星旅人
  useEffect(() => {
    let isMounted = true;
    const fetchTopUsers = async () => {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('users')
        .select('id, anonymous_nickname, wallet_balance')
        .gt('wallet_balance', 0)
        .order('wallet_balance', { ascending: false })
        .limit(3);

      if (!error && data && isMounted) {
        setTopUsers(data as UserHonor[]);
      }
      if (isMounted) setLoadingUsers(false);
    };

    fetchTopUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. 星河匯聚中：進度 % 數最高（排除官方卡與已滿額 100% 願望）
  const topPercentWishes = useMemo(() => {
    return wishes
      .filter((w) => {
        const isOfficial = w.id === '00000000-0000-0000-0000-000000000001';
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
      {/* ================= 預設不佔空間的微縮徽章膠囊列 ================= */}
      <div className="glass rounded-2xl p-2.5 sm:p-3 border border-amber-400/20 bg-zinc-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* 左側微徽章群 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 徽章 1：臨門一腳最高 % */}
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 px-3 py-1.5 rounded-xl text-xs text-amber-200 cursor-pointer transition-all"
          >
            <span className="flex items-center gap-1 font-bold">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              臨門一腳榜：
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

          {/* 徽章 2：榮譽引路人榜首 */}
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-400/30 px-3 py-1.5 rounded-xl text-xs text-yellow-200 cursor-pointer transition-all"
          >
            <span className="flex items-center gap-1 font-bold">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              星塵引路人：
            </span>
            {topUsers.length > 0 ? (
              <span className="text-yellow-300 truncate max-w-[120px]">
                {topUsers[0].anonymous_nickname} (✨{topUsers[0].wallet_balance.toLocaleString()})
              </span>
            ) : (
              <span className="text-zinc-500">虛位以待</span>
            )}
          </div>
        </div>

        {/* 右側：展開箭頭 + 跳轉殿堂按鈕 */}
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

      {/* ================= 點開後才流體展開的雙欄詳細榜單 ================= */}
      {isOpen && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          {/* 榜單 A：星河匯聚中 (% 數最高) */}
          <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-950/85 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300">
                    <Flame className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-100">
                      星河匯聚中 · 臨門一腳
                    </h3>
                    <p className="text-[10px] text-zinc-400">目前距離終章百分比最接近的心願故事</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  依進度 % 排序
                </span>
              </div>

              {topPercentWishes.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">星河靜謐，尚無推進中的心願</div>
              ) : (
                <div className="space-y-2">
                  {topPercentWishes.map((item, idx) => {
                    const pct = Math.min(
                      99,
                      Math.round(((item.current_stardust || 0) / (item.product_price || 1)) * 100)
                    );
                    return (
                      <div
                        key={item.id}
                        onClick={() => onScrollToWish(item.id)}
                        className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-400/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 truncate max-w-[220px]">
                          <span
                            className={`text-xs font-black font-mono w-4 text-center ${
                              idx === 0
                                ? 'text-amber-300'
                                : idx === 1
                                ? 'text-slate-300'
                                : 'text-amber-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <span className="text-base">{item.cover_emoji}</span>
                          <span className="text-xs text-zinc-200 group-hover:text-amber-200 truncate font-medium">
                            {item.product_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-right">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-300">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>👆 點擊任一故事可直接跳轉定位至卡片</span>
              <Compass className="w-3 h-3 text-zinc-500" />
            </div>
          </div>

          {/* 榜單 B：星塵引路人 · 榮譽總量榜 (取匿名暱稱) */}
          <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-950/85 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-yellow-500/15 text-yellow-300">
                    <Coins className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-amber-100">
                      星塵引路人 · 榮譽榜
                    </h3>
                    <p className="text-[10px] text-zinc-400">已見證圓滿故事的匿名星旅人總貢獻</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenHonorHall}
                  className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5"
                >
                  查看完整殿堂 ➔
                </button>
              </div>

              {loadingUsers ? (
                <div className="text-center py-6 text-xs text-zinc-500">正在統計引路星光...</div>
              ) : topUsers.length === 0 ? (
                <div className="text-center py-6 text-xs text-zinc-500">虛位以待，等待第一顆引路星點亮</div>
              ) : (
                <div className="space-y-2">
                  {topUsers.map((u, idx) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[220px]">
                        <span
                          className={`text-xs font-black font-mono w-4 text-center ${
                            idx === 0
                              ? 'text-yellow-300'
                              : idx === 1
                              ? 'text-slate-300'
                              : 'text-amber-600'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[10px] text-amber-300 font-bold">
                          {u.anonymous_nickname.substring(0, 1)}
                        </div>
                        <span className="text-xs text-zinc-200 truncate font-medium">
                          {u.anonymous_nickname}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          ✨ {u.wallet_balance.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-500 ml-1">星塵</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 text-[10px] text-zinc-500 flex items-center justify-between">
              <span>🛡️ 僅公示已履約完結之榮譽數據，全站匿名守護</span>
              <span className="text-amber-400">TOP 3</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
