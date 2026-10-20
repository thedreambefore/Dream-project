// src/components/WishCard/components/CardBack.tsx
import {
  Compass,
  Trash2,
  Heart,
  ExternalLink,
  MessageCircle,
  ShieldAlert,
  Flag,
  FileEdit,
  MailCheck,
  Sparkles,
  Coins,
} from 'lucide-react';
import type { Wish } from '@/types/wish';
import type { WishCardVariant } from '../types';

interface Props {
  wish: Wish;
  variant: WishCardVariant;
  progress: number;
  isOfficial: boolean;
  isFulfilled: boolean;
  isBookmarked: boolean;
  isAdmin: boolean;
  userId?: string;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onDeleteCard: (e: React.MouseEvent) => void;
  onOpenDriftModal: (e: React.MouseEvent) => void;
  onOpenActionModal: (e: React.MouseEvent) => void;
  onOpenInvestModal: (e: React.MouseEvent) => void;
  onOpenLetterModal?: (wish: Wish) => void;
  onOpenEditModal?: (wish: Wish) => void;
}

export function CardBack({
  wish,
  variant,
  progress,
  isOfficial,
  isFulfilled,
  isBookmarked,
  isAdmin,
  userId,
  onToggleBookmark,
  onDeleteCard,
  onOpenDriftModal,
  onOpenActionModal,
  onOpenInvestModal,
  onOpenLetterModal,
  onOpenEditModal,
}: Props) {
  const isNearComplete = progress >= 90 && progress < 100;

  return (
    <div className="absolute inset-0 w-full h-full rounded-2xl glass-strong glow-border p-5 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950 border border-amber-400/30 shadow-2xl">
      <div className="border-b border-white/10 pb-2.5">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
          <span className="flex items-center gap-1 text-amber-300 truncate max-w-[200px]">
            <Compass className="w-3.5 h-3.5 flex-shrink-0" />
            {isOfficial ? '夢沙官方團隊' : `${wish.anonymous_nickname || '匿名星旅人'} 的心願`}
          </span>

          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                type="button"
                onClick={onDeleteCard}
                className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                title="永久刪除此卡片"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {!isOfficial && (
              <button
                type="button"
                onClick={onToggleBookmark}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 scale-110 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>
            )}
          </div>
        </div>
        <h4 className="font-bold text-amber-100 text-sm truncate">{wish.product_name}</h4>
      </div>

      <div className="relative my-2 flex-1 overflow-hidden">
        <p className="text-xs text-zinc-300 leading-relaxed text-justify line-clamp-4">
          {wish.story_text}
        </p>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-2">
        <p className="text-[11px] text-amber-200/90 leading-tight">
          <span className="font-bold text-amber-300">終章承諾：</span>
          {wish.promise_text || '心願達成後公開開箱感謝信與成果！'}
        </p>
      </div>

      <div className="flex justify-between items-center text-xs text-zinc-400 mb-2.5 px-0.5 font-mono">
        <div className="flex items-center gap-2">
          <span>進度 {progress}%</span>
          {wish.product_url && (
            <a
              href={wish.product_url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
            >
              <ExternalLink className="w-2.5 h-2.5" /> 檢視商品
            </a>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {variant !== 'preview' && (
            <button
              type="button"
              onClick={onOpenDriftModal}
              className={`text-[10px] px-2.5 py-1 rounded-md border flex items-center gap-1 transition-all ${
                isOfficial || isFulfilled || userId === wish.user_id
                  ? 'bg-amber-500/15 border-amber-400/30 text-amber-200 hover:bg-amber-500/25'
                  : 'bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {isOfficial ? (
                <>
                  <MessageCircle className="w-3 h-3 text-amber-400" /> 意見交流板
                </>
              ) : isFulfilled ? (
                <>
                  <MessageCircle className="w-3 h-3 text-amber-300" /> 加油牆 (已解鎖)
                </>
              ) : userId === wish.user_id ? (
                <>
                  <MessageCircle className="w-3 h-3 text-amber-300" /> 查看實時加油
                </>
              ) : (
                <>
                  <MessageCircle className="w-3 h-3 text-zinc-400" /> 數位加油室
                </>
              )}
            </button>
          )}

          {!isOfficial && (
            <button
              type="button"
              onClick={onOpenActionModal}
              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400 hover:text-white flex items-center gap-1 transition-all"
            >
              {isAdmin ? (
                <>
                  <ShieldAlert className="w-3 h-3 text-red-400" /> 下架
                </>
              ) : (
                <>
                  <Flag className="w-3 h-3 text-amber-400" /> 檢舉
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 變體操作按鈕列 */}
      <div className="space-y-1.5">
        {variant === 'myWishes' && (
          <div className="flex gap-2">
            {onOpenEditModal && wish.status !== 'fulfilled' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenEditModal(wish);
                }}
                className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <FileEdit className="w-3.5 h-3.5" /> 編輯送審
              </button>
            )}
            {(isFulfilled || progress >= 100) && onOpenLetterModal && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenLetterModal(wish);
                }}
                className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 text-zinc-950 text-xs font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer"
              >
                <MailCheck className="w-3.5 h-3.5" />
                {wish.thank_you_letter ? '修改開箱信' : '撰寫開箱信'}
              </button>
            )}
          </div>
        )}

        {variant === 'tracked' && (
          <button
            type="button"
            onClick={onOpenDriftModal}
            className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {isFulfilled ? '查看主角開箱感謝信' : '進入加油室查看實時話語'}
          </button>
        )}

        {variant === 'market' && (
          <button
            type="button"
            onClick={onOpenInvestModal}
            className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 shadow-amber-500/20"
          >
            <Coins className="w-3.5 h-3.5 fill-current" />
            {isOfficial
              ? '投下星星 · 支持夢沙'
              : isFulfilled
              ? '已達成 · 加碼投星支持'
              : isNearComplete
              ? '投下尾星 · 助他達成'
              : '購買星星支持他'}
          </button>
        )}
      </div>
    </div>
  );
}