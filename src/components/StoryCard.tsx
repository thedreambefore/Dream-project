import { useState, useMemo } from 'react';
import { Coins, Sparkles, Heart, Compass } from 'lucide-react';
import type { Story } from '@/lib/supabase';
import { InvestModal } from './InvestModal';

interface ExtendedStory extends Story {
  image_url?: string | null;
  anonymous_nickname?: string | null;
}

export function StoryCard({ story, index }: { story: Story; index: number }) {
  const [showInvest, setShowInvest] = useState(false);
  // 手機端預留點擊翻面狀態
  const [isMobileFlipped, setIsMobileFlipped] = useState(false);

  const extStory = story as ExtendedStory;

  // 計算募集進度百分比
  const progress = Math.min(100, Math.round((story.current_stardust / story.product_price) * 100));
  const isFulfilled = story.status === 'fulfilled';
  const isNearComplete = progress >= 90 && progress < 100;

  // A 案：星宿幾何種子計算（純 CSS/SVG 演算法，零延遲零 Token）
  const constellationSeed = useMemo(() => {
    let hash = 0;
    const str = story.id || 'seed';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 40) + 240; // 藍紫深空色相
    const hue2 = Math.abs((hash >> 2) % 30) + 280; // 紫粉星雲色相
    return {
      gradient: `radial-gradient(ellipse at 70% 30%, hsla(${hue2}, 70%, 25%, 0.7) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, hsla(${hue1}, 75%, 20%, 0.8) 0%, #0a0a1a 80%)`,
      svgPoints: [
        { cx: 30 + (Math.abs(hash) % 40), cy: 25 + (Math.abs(hash >> 1) % 30) },
        { cx: 80 + (Math.abs(hash >> 2) % 50), cy: 60 + (Math.abs(hash >> 3) % 40) },
        { cx: 160 + (Math.abs(hash >> 4) % 40), cy: 35 + (Math.abs(hash >> 5) % 35) },
        { cx: 220 + (Math.abs(hash >> 6) % 40), cy: 75 + (Math.abs(hash >> 7) % 30) },
      ],
    };
  }, [story.id]);

  // 手機端點擊卡片翻面切換（防呆：點擊結帳按鈕除外）
  const handleCardClick = () => {
    setIsMobileFlipped((prev) => !prev);
  };

  return (
    <>
      <div
        className="perspective-1000 w-full h-[400px] select-none group fade-in-up cursor-pointer"
        style={{ animationDelay: `${index * 0.06}s` }}
        onClick={handleCardClick}
      >
        {/* 3D 翻轉核心容器 */}
        <div
          className={`relative w-full h-full duration-700 transform-style-3d group-hover-flip transition-transform ease-out ${
            isMobileFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ======================================================== */}
          {/* 🌟 1. 正面 (FRONT)                                       */}
          {/* ======================================================== */}
          <div className="absolute inset-0 w-full h-full rounded-2xl glass glow-border overflow-hidden backface-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl">
            {/* 背景圖層機制 (A 案 / C 案防弊同化) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
              {extStory.image_url ? (
                /* C 案：用戶上傳圖 - 強制裁剪 + 疊加暗紫深空濾鏡同化 */
                <div className="relative w-full h-full">
                  <img
                    src={extStory.image_url}
                    alt={story.product_name}
                    className="w-full h-full object-cover brightness-60 contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#120e28]/85 to-[#241446]/60 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a1a]" />
                </div>
              ) : (
                /* A 案：系統發配專屬星宿圖 (純 CSS + SVG 幾何星軌) */
                <div
                  className="w-full h-full relative"
                  style={{ background: constellationSeed.gradient }}
                >
                  <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 280 160">
                    <polyline
                      points={constellationSeed.svgPoints.map((p) => `${p.cx},${p.cy}`).join(' ')}
                      fill="none"
                      stroke="rgba(251, 191, 36, 0.45)"
                      strokeWidth="1.2"
                      strokeDasharray="4 3"
                    />
                    {constellationSeed.svgPoints.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.cx}
                        cy={p.cy}
                        r={idx === 1 ? '3.5' : '2'}
                        fill="#fde68a"
                        className="animate-pulse"
                      />
                    ))}
                  </svg>
                </div>
              )}
            </div>

            {/* 正面上半部：標籤與 Emoji 星宿徽記章 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  #{story.tag_name}
                </span>
                {isFulfilled ? (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-bold">
                    ✓ 已履約
                  </span>
                ) : (
                  <div className="text-2xl drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]">
                    {story.cover_emoji}
                  </div>
                )}
              </div>

              {/* 正面願望標題 (限制顯示 2 行，超出 ellipsis) */}
              <h3 className="font-bold text-amber-100 text-lg leading-snug line-clamp-2 mt-2 drop-shadow-md">
                {story.product_name}
              </h3>
            </div>

            {/* 正面下半部：終章承諾縮圖 + 發光霓虹進度條 */}
            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  <span className="text-amber-300/80 font-bold">終章承諾：</span>
                  {story.promise_text}
                </p>
              </div>

              {/* 發光霓虹募集進度條 (帶 Transition 平滑過渡) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-zinc-400 flex items-center gap-1 font-mono">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {story.current_stardust.toLocaleString()} / {story.product_price.toLocaleString()} 星塵
                  </span>
                  <span className={`font-black font-mono ${isNearComplete ? 'text-amber-300 glow-text' : 'text-amber-200'}`}>
                    {progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.7)] transition-all duration-800 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* 翻面指引微提示 */}
              <div className="text-center">
                <p className="text-[11px] text-zinc-500 group-hover:text-amber-300/70 transition-colors flex items-center justify-center gap-1">
                  <span>🔄</span> 懸停翻轉揭曉故事
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 🌟 2. 背面 (BACK)                                        */}
          {/* ======================================================== */}
          <div className="absolute inset-0 w-full h-full rounded-2xl glass-strong glow-border p-5 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950/98 border border-amber-400/30 shadow-2xl">
            {/* 背面頭部：縮小版標題 + 匿名暱稱 */}
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1 text-amber-300">
                  <Compass className="w-3.5 h-3.5" />
                  {extStory.anonymous_nickname || '匿名星旅人'} 的心願
                </span>
                <span className="font-mono text-zinc-500">#{story.tag_name}</span>
              </div>
              <h4 className="font-bold text-amber-100 text-sm truncate">
                {story.product_name}
              </h4>
            </div>

            {/* 背面主體：完整故事內文（底部帶漸層淡出防爆字數） */}
            <div className="relative my-2 flex-1 overflow-hidden">
              <p className="text-xs text-zinc-300 leading-relaxed tracking-wide text-justify">
                {story.story_text}
              </p>
              {/* 漸層透明遮罩 */}
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
            </div>

            {/* 背面承諾小標籤 */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-3">
              <p className="text-[11px] text-amber-200/90 leading-tight">
                <span className="font-bold text-amber-300">承諾：</span>
                {story.promise_text}
              </p>
            </div>

            {/* 背面數據總覽 */}
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-3 px-1 font-mono">
              <span>需募: NT$ {story.product_price.toLocaleString()}</span>
              <span className="text-amber-300 font-bold">進度 {progress}%</span>
            </div>

            {/* 🔒 防呆結帳主按鈕：只有在翻到背面時點擊此按鈕才會觸發結帳 */}
            <div>
              {isFulfilled ? (
                <div className="w-full text-center py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                  🎉 此心願已圓滿達成履約
                </div>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // 阻止向上冒泡觸發翻面
                    setShowInvest(true); // 正式開啟三段式手續費結帳彈窗
                  }}
                  className={`w-full touch-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                    isNearComplete
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 pulse-gold font-black'
                      : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-bold shadow-amber-500/20'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  {isNearComplete ? '🌟 搶下尾刀 · 助他圓夢' : '🌌 注入星塵 · 助他圓夢'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 結帳視窗（已完美串接三段式服務費） */}
      {showInvest && (
        <InvestModal story={story} onClose={() => setShowInvest(false)} />
      )}
    </>
  );
}
