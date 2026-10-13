// src/components/LeaderboardWidget.tsx
import { useState, useEffect, useMemo } from 'react';
import { Flame, Sparkles, TrendingUp, Compass, Calendar, Award } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Wish } from '@/types/wish';

interface LeaderboardWidgetProps {
  wishes: Wish[];
  onScrollToWish: (wishId: string) => void;
}

export function LeaderboardWidget({ wishes, onScrollToWish }: LeaderboardWidgetProps) {
  // 時間維度切換：本週 vs 全部時間
  const [timeRange, setTimeRange] = useState<'week' | 'all'>('week');
  const [weeklyWishSums, setWeeklyWishSums] = useState<Record<string, number>>({});
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // 1. 撈取「過去 7 天內」各心願注入的總星塵金額
  useEffect(() => {
    if (timeRange !== 'week') return;

    let isMounted = true;
    const fetchWeeklyInvestments = async () => {
      setLoadingWeekly(true);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('investments')
        .select('wish_id, story_id, amount')
        .gte('created_at', oneWeekAgo);

      if (!error && data && isMounted) {
        const sumMap: Record<string, number> = {};
        data.forEach((inv) => {
          const id = inv.wish_id || inv.story_id;
          if (id) {
            sumMap[id] = (sumMap[id] || 0) + Number(inv.amount || 0);
          }
        });
        setWeeklyWishSums(sumMap);
      }
      if (isMounted) setLoadingWeekly(false);
    };

    fetchWeeklyInvestments();
    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  // 排除官方維護基金卡片，純粹比較用戶故事
  const validStories = useMemo(() => {
    return wishes.filter((w) => w.id !== '00000000-0000-0000-0000-000000000001');
  }, [wishes]);

  // 🌟 榜單 A：星河匯聚中（看「% 數最高」且「尚未 100% 滿額」的故事）
  const topPercentWishes = useMemo(() => {
    return [...validStories]
      .filter((w) => {
        const pct = ((w.current_stardust || 0) / (w.product_price || 1)) * 100;
        return pct > 0 && pct < 100 && w.status !== 'fulfilled' && w.status !== 'full_funded';
      })
      .sort((a, b) => {
        const pctA = (a.current_stardust || 0) / (a.product_price || 1);
        const pctB = (b.current_stardust || 0) / (b.product_price || 1);
        return pctB - pctA;
      })
      .slice(0, 3);
  }, [validStories]);

  // 🌟 榜單 B：總星塵最多（依據「本週 / 全部時間」切換總注入燃料排序）
  const topStardustWishes = useMemo(() => {
    if (timeRange === 'all') {
      return [...validStories]
        .sort((a, b) => (b.current_stardust || 0) - (a.current_stardust || 0))
        .slice(0, 3);
    }

    // 本週排行
    return [...validStories]
      .map((w) => ({
        ...w,
        periodAmount: weeklyWishSums[w.id] || 0,
      }))
      .filter((w) => w.periodAmount > 0)
      .sort((a, b) => b.periodAmount - a.periodAmount)
      .slice(0, 3);
  }, [validStories, timeRange, weeklyWishSums]);

  return (
    <div className="mb-10 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ================= 1. 星河匯聚中 (% 數最高) ================= */}
        <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-950/70 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-amber-100 flex items-center gap-1.5">
                    星河匯聚中 · 臨門一腳
                  </h3>
                  <p className="text-[10px] text-zinc-400">目前距離終章百分比最接近的心願</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                依進度 % 排序
              </span>
            </div>

            {/* 清單項目 */}
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
                        <span className={`text-xs font-black font-mono w-4 text-center ${
                          idx === 0 ? 'text-amber-300' : idx === 1 ? 'text-slate-300' : 'text-amber-600'
                        }`}>
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
            <span>👆 點擊任一故事可直接跳轉至卡片</span>
            <Compass className="w-3 h-3 text-zinc-500" />
          </div>
        </div>

        {/* ================= 2. 總星塵最多 (支援 本週 / 全部時間 切換) ================= */}
        <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-950/70 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-yellow-500/15 text-yellow-300">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-amber-100 flex items-center gap-1.5">
                    星塵總量殿堂
                  </h3>
                  <p className="text-[10px] text-zinc-400">匯聚最多陌生人善意燃料的心願</p>
                </div>
              </div>

              {/* 切換 Tab */}
              <div className="flex bg-black/40 border border-white/10 rounded-lg p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setTimeRange('week')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    timeRange === 'week'
                      ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-400/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  本週內
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange('all')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    timeRange === 'all'
                      ? 'bg-amber-500/20 text-amber-200 font-bold border border-amber-400/30'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  全部時間
                </button>
              </div>
            </div>

            {/* 清單項目 */}
            {loadingWeekly ? (
              <div className="text-center py-6 text-xs text-zinc-500">正在統計本週星塵能量...</div>
            ) : topStardustWishes.length === 0 ? (
              <div className="text-center py-6 text-xs text-zinc-500">
                {timeRange === 'week' ? '本週尚無新的燃料注入' : '星海靜謐，等待第一筆星塵'}
              </div>
            ) : (
              <div className="space-y-2">
                {topStardustWishes.map((item: any, idx) => {
                  const displayAmount =
                    timeRange === 'week' ? item.periodAmount : item.current_stardust;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onScrollToWish(item.id)}
                      className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-yellow-500/10 border border-white/5 hover:border-yellow-400/30 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 truncate max-w-[220px]">
                        <span className={`text-xs font-black font-mono w-4 text-center ${
                          idx === 0 ? 'text-yellow-300' : idx === 1 ? 'text-slate-300' : 'text-amber-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="text-base">{item.cover_emoji}</span>
                        <span className="text-xs text-zinc-200 group-hover:text-yellow-200 truncate font-medium">
                          {item.product_name}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          ✨ {(displayAmount || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-zinc-500 ml-1">星塵</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>👆 點擊任一故事可直接跳轉至卡片</span>
            <Award className="w-3 h-3 text-zinc-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
