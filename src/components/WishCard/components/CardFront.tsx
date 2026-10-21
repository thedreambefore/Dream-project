// src/components/WishCard/components/CardFront.tsx
import {
  Sparkles,
  Compass,
  CheckCircle2,
  Coins,
  Crown,
  RotateCw,
  Laptop,
  BookOpen,
  Palette,
  Music,
  Coffee,
  Camera,
  Gift,
  Heart,
} from 'lucide-react';
import { ConstellationBackground } from './ConstellationBackground';
import type { Wish } from '@/types/wish';
import type { CardTier } from '../types';

interface Props {
  wish: Wish;
  tier: CardTier | null;
  isOfficial: boolean;
  isCardShining: boolean;
  isOverFunded: boolean;
  isExactlyFunded: boolean;
  isNearComplete: boolean;
  progress: number;
  localStardust: number;
  targetPrice: number;
}

function renderIcon(iconNameOrEmoji?: string) {
  if (!iconNameOrEmoji) return <Compass className="w-5 h-5 text-amber-300 flex-shrink-0" />;

  const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    Sparkles,
    Compass,
    Laptop,
    BookOpen,
    Palette,
    Music,
    Coffee,
    Camera,
    Gift,
    Heart,
  };

  const IconComp = ICON_MAP[iconNameOrEmoji];
  if (IconComp) {
    return <IconComp className="w-5 h-5 text-amber-300 flex-shrink-0" />;
  }

  return <span className="text-lg flex-shrink-0 leading-none">{iconNameOrEmoji}</span>;
}

export function CardFront({
  wish,
  tier,
  isOfficial,
  isCardShining,
  isOverFunded,
  isExactlyFunded,
  isNearComplete,
  progress,
  localStardust,
  targetPrice,
}: Props) {
  const hasImage = Boolean(wish.image_url);

  return (
    <div
      className={`absolute inset-0 w-full h-full rounded-2xl glass overflow-hidden backface-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl border transition-all ${
        tier ? tier.cardClass : isCardShining ? 'holo-border-gold' : 'border-white/10'
      }`}
    >
      {/* 🌟 A 案：原汁原味星宿幾何與雙色溫星雲漸層 */}
      <ConstellationBackground wishId={wish.id} hasImage={hasImage} />

      {/* 頂層 Trainer Gallery 閃卡光學膜 */}
      {isCardShining && <div className="trainer-gallery-shine" />}

      {/* 個人守護階梯微光層 */}
      {tier && (
        <div className={`absolute inset-0 rounded-inherit pointer-events-none z-30 ${tier.glimmerClass}`} />
      )}

      {/* 若有真實照片則呈現照片與遮罩 */}
      {hasImage && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <img
            src={wish.image_url!}
            alt={wish.product_name}
            className="w-full h-full object-cover brightness-60 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#120e28]/85 to-[#241446]/60 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a1a]" />
        </div>
      )}

      {/* 正面上半部：守護徽章覆蓋標籤 + 右上角達成膠囊 */}
      <div className="relative z-30">
        <div className="flex items-center justify-between mb-3">
          {tier ? (
            <span
              className={`text-[11px] px-2.5 py-0.5 rounded-full border font-mono flex items-center gap-1 backdrop-blur-md ${tier.badgeClass}`}
            >
              {tier.level === 4 && <Crown className="w-3 h-3 text-amber-300" />}
              {tier.label}
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
              <Sparkles className="w-3 h-3 text-amber-300" />
              #{wish.tag_name}
            </span>
          )}

          {isOfficial ? (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              官方常駐
            </span>
          ) : isOverFunded ? (
            <span className="text-[10px] px-2.5 py-0.5 rounded-full badge-prismatic-white flex items-center gap-1">
              <Sparkles className="w-3 h-3 animate-spin" />
              超額達成 {progress}%
            </span>
          ) : isExactlyFunded ? (
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 flex items-center gap-1 shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              <CheckCircle2 className="w-3 h-3" />
              圓滿達成
            </span>
          ) : (
            <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
              已投入 {progress}%
            </span>
          )}
        </div>

        {/* 標題與圖示 */}
        <h3 className="font-bold text-amber-100 text-lg leading-snug line-clamp-2 mt-2 drop-shadow-md flex items-center gap-2">
          {renderIcon(wish.cover_emoji)}
          <span>{wish.product_name}</span>
        </h3>
      </div>

      {/* 正面下半部：終章承諾 + 星塵進度條 */}
      <div className="relative z-30 space-y-3.5">
        <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
          <p className="text-[11px] text-zinc-300 line-clamp-1 leading-relaxed">
            <span className="text-amber-300 font-bold">終章承諾：</span>
            {wish.promise_text || '心願達成後公開開箱感謝信與成果！'}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-baseline text-xs font-mono">
            <span className="text-zinc-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              {localStardust.toLocaleString()} / {targetPrice.toLocaleString()} 星塵
            </span>

            {isOverFunded ? (
              <span className="text-prismatic-white">超額 {progress}%</span>
            ) : isExactlyFunded ? (
              <span className="text-amber-300 font-black glow-text">圓滿達成</span>
            ) : (
              <span className={`font-black ${isNearComplete ? 'text-amber-300 glow-text' : 'text-amber-200'}`}>
                {progress}%
              </span>
            )}
          </div>

          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverFunded
                  ? 'bg-gradient-to-r from-amber-400 via-white to-pink-300 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        <div className="text-center pt-0.5">
          <p className="text-[11px] text-zinc-400 group-hover:text-amber-300 transition-colors flex items-center justify-center gap-1 font-medium">
            <RotateCw className="w-3 h-3 text-amber-400/80" /> 點擊卡片翻面查閱
          </p>
        </div>
      </div>
    </div>
  );
}