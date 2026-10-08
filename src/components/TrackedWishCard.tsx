// src/components/TrackedWishCard.tsx
import { useState } from 'react';
import { Coins, Sparkles, Heart, Compass, Lock, CheckCircle2 } from 'lucide-react';
import type { Story } from '@/lib/supabase';

interface TrackedWish extends Story {
  myInvestAmount?: number;
  isBookmarkedOnly?: boolean;
}

export function TrackedWishCard({ wish, index }: { wish: TrackedWish; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);

  const progress = Math.min(100, Math.round(((wish.current_stardust || 0) / (wish.product_price || 1)) * 100));
  const isFulfilled = wish.status === 'fulfilled';
  const hasLetter = wish.letter_status === 'approved' && Boolean(wish.thank_you_letter);

  return (
    <div
      className="perspective-1000 w-full h-[430px] select-none group fade-in-up cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={() => setIsFlipped((prev) => !prev)}
    >
      <div
        className={`relative w-full h-full duration-700 transform-style-3d group-hover-flip transition-transform ease-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ===== 追番卡片 正面 (原首頁背面：故事、進度、你的追蹤狀態) ===== */}
        <div className="absolute inset-0 w-full h-full rounded-2xl glass-strong glow-border p-5 flex flex-col justify-between backface-hidden bg-zinc-950/95 border border-amber-400/30 shadow-2xl">
          <div className="border-b border-white/10 pb-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
              <span className="flex items-center gap-1 text-amber-300">
                <Compass className="w-3.5 h-3.5" />
                #{wish.tag_name}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  wish.isBookmarkedOnly
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                }`}
              >
                {wish.isBookmarkedOnly ? <Heart className="w-2.5 h-2.5 fill-current" /> : <Coins className="w-2.5 h-2.5" />}
                {wish.isBookmarkedOnly ? '純心願追更' : `已注燃料 $${wish.myInvestAmount}`}
              </span>
            </div>
            <h4 className="font-bold text-amber-100 text-base truncate flex items-center gap-1.5">
              <span>{wish.cover_emoji}</span>
              <span>{wish.product_name}</span>
            </h4>
          </div>

          <div className="relative my-2 flex-1 overflow-hidden">
            <p className="text-xs text-zinc-300 leading-relaxed tracking-wide text-justify">
              {wish.story_text}
            </p>
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-2">
            <p className="text-[11px] text-amber-200/90 leading-tight">
              <span className="font-bold text-amber-300">終章承諾：</span>
              {wish.promise_text}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-zinc-400 px-1 font-mono">
              <span>
                進度: NT$ {wish.current_stardust?.toLocaleString()} / {wish.product_price?.toLocaleString()}
              </span>
              <span className="text-amber-300 font-bold">{progress}%</span>
            </div>

            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isFulfilled ? 'bg-emerald-400' : 'bg-gradient-to-r from-amber-500 to-yellow-400'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="text-center pt-1">
              <span className="text-[11px] text-zinc-500 flex items-center justify-center gap-1 group-hover:text-amber-300 transition-colors">
                {isFulfilled ? '✨ 翻轉查看開箱感謝信與結局' : '⏳ 翻轉查看故事終章鎖定狀態'}
              </span>
            </div>
          </div>
        </div>

        {/* ===== 追番卡片 背面 (履約解鎖區：開箱照片、感謝信、見證祝福) ===== */}
        <div className="absolute inset-0 w-full h-full rounded-2xl glass-strong glow-border p-5 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950/98 border border-emerald-400/30 shadow-2xl overflow-hidden">
          <div className="border-b border-white/10 pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> 故事終章結局
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                isFulfilled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-400 border border-white/10'
              }`}
            >
              {isFulfilled ? '🎉 圓夢履約達成' : '⏳ 募集中待解鎖'}
            </span>
          </div>

          {!isFulfilled ? (
            /* 未履約：鎖定狀態 */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-zinc-300">終章信件封存中</h5>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                  當願望達成 100% 募資並經物流送達後，<br />
                  主角親筆撰寫的開箱感謝信將在此自動點亮！
                </p>
              </div>
            </div>
          ) : (
            /* 已履約：解鎖圖文與感謝信 */
            <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1 hide-scrollbar">
              {wish.unboxing_photo_url && (
                <div className="h-32 rounded-xl overflow-hidden border border-white/10 relative">
                  <img
                    src={wish.unboxing_photo_url}
                    alt="開箱照"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-2 text-[9px] bg-black/60 px-1.5 py-0.5 rounded text-zinc-300">
                    📸 主角實拍開箱
                  </span>
                </div>
              )}

              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-xs text-zinc-200 leading-relaxed">
                <p className="text-[11px] font-bold text-emerald-300 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 主角感謝信：
                </p>
                {hasLetter ? wish.thank_you_letter : '主角已順利收取夢想物資，感謝星空下每顆溫暖星塵的相助！'}
              </div>

              {wish.admin_blessing && (
                <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-2.5 text-[11px] text-amber-200/90 leading-tight">
                  <span className="font-bold">👑 夢沙官方祝福：</span>
                  {wish.admin_blessing}
                </div>
              )}
            </div>
          )}

          <div className="text-center pt-2 border-t border-white/10">
            <span className="text-[11px] text-zinc-500">🔄 懸停或點擊翻回故事主頁</span>
          </div>
        </div>
      </div>
    </div>
  );
}
