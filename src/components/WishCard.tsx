// src/components/WishCard.tsx
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { createPortal } from 'react-dom';
import {
  Coins,
  Sparkles,
  Heart,
  Compass,
  ShieldAlert,
  Flag,
  MessageCircle,
  MailCheck,
  CheckCircle2,
  FileEdit,
  ExternalLink,
  Trash2,
  RotateCw,
  X,
  Loader2,
} from 'lucide-react';
import type { Wish } from '@/types/wish';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { blockWish, deleteWish, updateWish, OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import { AuthModal } from '@/components/AuthModal';

const InvestModal = lazy(() => import('./InvestModal').then((m) => ({ default: m.InvestModal })));
const DriftBottleModal = lazy(() =>
  import('./DriftBottleModal').then((m) => ({ default: m.DriftBottleModal }))
);

export interface WishCardProps {
  wish: Wish;
  index?: number;
  variant?: 'market' | 'tracked' | 'myWishes' | 'preview';
  onOpenLetterModal?: (wish: Wish) => void;
  onOpenEditModal?: (wish: Wish) => void;
  onCardDeleted?: (wishId: string) => void;
}

export function WishCard({
  wish,
  index = 0,
  variant = 'market',
  onOpenLetterModal,
  onOpenEditModal,
  onCardDeleted,
}: WishCardProps) {
  const { session, isBanned, isAdmin, refreshProfile } = useAuth();
  const cardContainerRef = useRef<HTMLDivElement>(null);

  const [isFlipped, setIsFlipped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(wish.isBookmarked));
  const [showInvest, setShowInvest] = useState(false);
  const [showDriftModal, setShowDriftModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 管理員下架 / 用戶檢舉彈窗狀態
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isOfficial = wish.id === OFFICIAL_SPONSOR_ID;
  const progress = Math.min(
    100,
    Math.round(((wish.current_stardust || 0) / (wish.product_price || 1)) * 100)
  );
  const isFulfilled = wish.status === 'fulfilled' || progress >= 100;
  const isNearComplete = progress >= 90 && progress < 100;
  const isCardShining = isOfficial || isFulfilled;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardContainerRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    card.style.setProperty('--pointer-x', `${Math.round((x / rect.width) * 100)}%`);
    card.style.setProperty('--pointer-y', `${Math.round((y / rect.height) * 100)}%`);
    card.style.setProperty('--rotate-x', `${((y - centerY) / centerY) * -8}deg`);
    card.style.setProperty('--rotate-y', `${((x - centerX) / centerX) * 8}deg`);
    card.style.setProperty('--card-opacity', '1');
  }, []);

  const handleMouseLeave = () => {
    const card = cardContainerRef.current;
    if (!card) return;
    card.style.setProperty('--card-opacity', '0');
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
  };

  useEffect(() => {
    if (!session?.user?.id || isOfficial) return;
    supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('wish_id', wish.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsBookmarked(true);
      });
  }, [session?.user?.id, wish.id, isOfficial]);

  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) {
      setShowAuthModal(true);
      return;
    }
    if (isBanned) return alert('您的帳號已被停權，無法使用收藏功能。');

    try {
      if (isBookmarked) {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', session.user.id)
          .eq('wish_id', wish.id);
        setIsBookmarked(false);
      } else {
        await supabase
          .from('bookmarks')
          .insert({ user_id: session.user.id, wish_id: wish.id });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('收藏切換失敗:', err);
    }
  };

  // 🌟 點擊支持按鈕：未登入直接彈出 AuthModal，登入者則開啟 InvestModal
  const handleOpenInvest = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) {
      setShowAuthModal(true);
      return;
    }
    setShowInvest(true);
  };

  // 下架操作
  const handleConfirmAction = async () => {
    if (!actionReason.trim()) return alert('請填寫下架或回報理由');
    setIsActionLoading(true);
    try {
      if (isAdmin) {
        await blockWish(wish.id, actionReason.trim());
        alert('管理員操作成功：卡片已即刻下架隱藏。');
      } else {
        await updateWish(wish.id, { is_reported: true, report_reason: actionReason.trim() });
        alert('感謝通報！管理團隊將在後台進行查核。');
      }
      setShowActionModal(false);
      setActionReason('');
      window.location.reload();
    } catch (e: any) {
      alert(`操作失敗: ${e.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 管理員永久刪除卡片
  const handleDeleteCard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!confirm(`確定要永久刪除願望「${wish.product_name}」嗎？此操作將同時清除所有留言與關聯紀錄！`)) {
      return;
    }
    try {
      await deleteWish(wish.id);
      alert('卡片已永久自資料庫刪除！');
      if (onCardDeleted) onCardDeleted(wish.id);
      else window.location.reload();
    } catch (err: any) {
      alert(`刪除失敗: ${err.message}`);
    }
  };

  return (
    <>
      <div
        ref={cardContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped((prev) => !prev)}
        className="holo-card perspective-1000 w-full h-[430px] select-none cursor-pointer group transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))`,
          animationDelay: `${index * 0.05}s`,
        }}
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ease-out ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* 正面 */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl glass glow-border overflow-hidden backface-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl ${
              isCardShining ? 'holo-border-gold' : 'border-white/10'
            }`}
          >
            {isCardShining && <div className="trainer-gallery-shine" />}

            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
              {wish.image_url ? (
                <div className="relative w-full h-full">
                  <img
                    src={wish.image_url}
                    alt={wish.product_name}
                    className="w-full h-full object-cover brightness-60 contrast-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#120e28]/85 to-[#241446]/60 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a1a]" />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-[#0a0a1a]" />
              )}
            </div>

            <div className="relative z-30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  #{wish.tag_name}
                </span>

                {isOfficial ? (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    官方常駐
                  </span>
                ) : isFulfilled ? (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    圓滿達成
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                    已投入 {progress}%
                  </span>
                )}
              </div>

              <h3 className="font-bold text-amber-100 text-lg leading-snug line-clamp-2 mt-2 drop-shadow-md flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <span>{wish.product_name}</span>
              </h3>
            </div>

            <div className="relative z-30 space-y-3.5">
              <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  <span className="text-amber-300/80 font-bold">終章承諾：</span>
                  {wish.promise_text}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {(wish.current_stardust || 0).toLocaleString()} / {(wish.product_price || 0).toLocaleString()} 星塵
                  </span>
                  <span
                    className={`font-black ${
                      isNearComplete ? 'text-amber-300 glow-text' : 'text-amber-200'
                    }`}
                  >
                    {progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="text-center pt-1">
                <p className="text-[11px] text-zinc-500 group-hover:text-amber-300/80 transition-colors flex items-center justify-center gap-1 font-medium">
                  <RotateCw className="w-3 h-3 text-amber-400/80" /> 點擊卡片翻面查閱
                </p>
              </div>
            </div>
          </div>

          {/* 背面 */}
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
                      onClick={handleDeleteCard}
                      className="p-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer"
                      title="永久刪除此卡片"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!isOfficial && (
                    <button
                      type="button"
                      onClick={handleToggleBookmark}
                      className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                        isBookmarked
                          ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 scale-110 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                          : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isBookmarked ? 'fill-rose-400 text-rose-400' : ''
                        }`}
                      />
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
                <span className="font-bold text-amber-300">承諾：</span>
                {wish.promise_text}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDriftModal(true);
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-md border flex items-center gap-1 transition-all ${
                      isOfficial || isFulfilled || session?.user?.id === wish.user_id
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
                        <MessageCircle className="w-3 h-3 text-amber-300" /> 加油牆 (已達成解鎖)
                      </>
                    ) : session?.user?.id === wish.user_id ? (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActionModal(true);
                    }}
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

            {/* 操作按鈕 */}
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
                      className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1"
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
                      className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 text-zinc-950 text-xs font-black rounded-xl flex items-center justify-center gap-1"
                    >
                      <MailCheck className="w-3.5 h-3.5" />{' '}
                      {wish.thank_you_letter ? '修改開箱信' : '撰寫開箱信'}
                    </button>
                  )}
                </div>
              )}

              {variant === 'tracked' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDriftModal(true);
                  }}
                  className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {isFulfilled ? '查看主角開箱感謝信' : '進入瓶中留言室查看結局進度'}
                </button>
              )}

              {variant === 'market' &&
                (!isOfficial && isFulfilled ? (
                  <div className="w-full text-center py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 此心願已圓滿達成
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenInvest}
                    className="w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 shadow-amber-500/20"
                  >
                    <Coins className="w-3.5 h-3.5 fill-current" />
                    {isOfficial
                      ? '投下星星 · 支持夢沙'
                      : isNearComplete
                      ? '投下尾星 · 助他達成'
                      : '購買星星支持他'}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 下架 / 檢舉 Modal */}
      {showActionModal &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation();
              setShowActionModal(false);
            }}
          >
            <div
              className="glass-strong rounded-3xl w-full max-w-md p-6 glow-border bg-zinc-950 border border-amber-400/30 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
                  {isAdmin ? (
                    <>
                      <ShieldAlert className="w-5 h-5 text-red-400" /> 管理員即刻下架願望
                    </>
                  ) : (
                    <>
                      <Flag className="w-5 h-5 text-amber-400" /> 檢舉回報此願望
                    </>
                  )}
                </h3>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">
                  請填寫{isAdmin ? '下架封鎖原因' : '檢舉理由'}：
                </label>
                <textarea
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={
                    isAdmin
                      ? '例如：經查核商品來源異常、含有敏感詐騙資訊...'
                      : '請輸入此願望有疑慮的具體內容...'
                  }
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 hover:text-white"
                >
                  取消
                </button>
                <button
                  type="button"
                  disabled={isActionLoading || !actionReason.trim()}
                  onClick={handleConfirmAction}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isAdmin
                      ? 'bg-red-500 hover:bg-red-400 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  }`}
                >
                  {isActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : isAdmin ? (
                    '確認即刻下架'
                  ) : (
                    '提交回報'
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* 🌟 未登入時直接喚出 AuthModal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {showInvest && (
        <Suspense fallback={null}>
          <InvestModal
            story={wish}
            onClose={() => {
              setShowInvest(false);
              refreshProfile();
            }}
          />
        </Suspense>
      )}

      {showDriftModal && (
        <Suspense fallback={null}>
          <DriftBottleModal
            wish={wish}
            progress={progress}
            isFulfilled={isFulfilled}
            onClose={() => setShowDriftModal(false)}
          />
        </Suspense>
      )}
    </>
  );
}