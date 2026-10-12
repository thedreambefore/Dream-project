// src/components/WishCard.tsx
import { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import type { Wish } from '@/types/wish';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { blockWish, updateWish, OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import { InvestModal } from './InvestModal';
import { DriftBottleModal } from './DriftBottleModal';

export interface WishCardProps {
  wish: Wish;
  index?: number;
  /**
   * 模式切換：
   * - 'market': 首頁願望交易所
   * - 'tracked': 個人中心追番結局牆
   * - 'myWishes': 我的心願管理
   * - 'preview': 放在 Modal 左側展示（禁用內部再彈窗，支援靜態展示）
   */
  variant?: 'market' | 'tracked' | 'myWishes' | 'preview';
  onOpenLetterModal?: (wish: Wish) => void;
  onOpenEditModal?: (wish: Wish) => void;
}

export function WishCard({
  wish,
  index = 0,
  variant = 'market',
  onOpenLetterModal,
  onOpenEditModal,
}: WishCardProps) {
  const { session, isBanned, isAdmin, refreshProfile } = useAuth();

  // 🌟 核心：全面改用手動狀態控制 3D 翻轉，點擊內部元件不冒泡
  const [isFlipped, setIsFlipped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(wish.isBookmarked));
  const [showInvest, setShowInvest] = useState(false);
  const [showDriftModal, setShowDriftModal] = useState(false);

  // 檢舉 / 管理員下架 Modal
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

  // 查詢當前登入者是否已追番收藏
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

  // ❤️ 點擊收藏按鈕（阻斷冒泡，絕對不翻轉）
  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) {
      alert('請先登入後再加入追番收藏！');
      return;
    }
    if (isBanned) {
      alert('🚫 您的帳號已被停權，無法使用收藏功能。');
      return;
    }

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

  // 下架/檢舉提交
  const handleConfirmAction = async () => {
    if (!actionReason.trim()) return alert('請填寫原因');
    setIsActionLoading(true);
    try {
      if (isAdmin) {
        await blockWish(wish.id, actionReason.trim());
        alert('✅ 管理員操作成功：卡片已即刻下架隱藏。');
      } else {
        await updateWish(wish.id, { is_reported: true, report_reason: actionReason.trim() });
        alert('🚩 感謝通報！管理團隊將在後台查核。');
      }
      setShowActionModal(false);
      setActionReason('');
    } catch (e: any) {
      alert(`操作失敗: ${e.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // 隨機星宿星座微光生成
  const constellationSeed = useMemo(() => {
    let hash = 0;
    const str = wish.id || 'seed';
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const hue1 = Math.abs(hash % 40) + 240;
    const hue2 = Math.abs((hash >> 2) % 30) + 280;
    return {
      gradient: `radial-gradient(ellipse at 70% 30%, hsla(${hue2}, 70%, 25%, 0.7) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, hsla(${hue1}, 75%, 20%, 0.8) 0%, #0a0a1a 80%)`,
      svgPoints: [
        { cx: 30 + (Math.abs(hash) % 40), cy: 25 + (Math.abs(hash >> 1) % 30) },
        { cx: 80 + (Math.abs(hash >> 2) % 50), cy: 60 + (Math.abs(hash >> 3) % 40) },
        { cx: 160 + (Math.abs(hash >> 4) % 40), cy: 35 + (Math.abs(hash >> 5) % 35) },
        { cx: 220 + (Math.abs(hash >> 6) % 40), cy: 75 + (Math.abs(hash >> 7) % 30) },
      ],
    };
  }, [wish.id]);

  return (
    <>
      <div
        className="perspective-1000 w-full h-[430px] select-none cursor-pointer group"
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => {
          // 點擊空白處切換翻轉狀態
          setIsFlipped((prev) => !prev);
        }}
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ease-out ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ==================== 1. 正面 (故事前綴與進度) ==================== */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl glass glow-border overflow-hidden backface-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl ${
              isFulfilled ? 'holo-border-gold' : 'border-white/10'
            }`}
          >
            {/* 滿額時 Trainer Gallery 全息閃光膜 */}
            {isFulfilled && <div className="trainer-gallery-shine" />}

            {/* 背景圖層 */}
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
                <div className="w-full h-full relative" style={{ background: constellationSeed.gradient }}>
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

            {/* 頂部標籤與狀態 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 text-amber-300" />
                  #{wish.tag_name}
                </span>

                {isFulfilled ? (
                  <span className="text-[10px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-zinc-950 shadow-[0_0_12px_rgba(251,191,36,0.6)] animate-pulse">
                    ✨ 圓滿履約
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                    集資中 {progress}%
                  </span>
                )}
              </div>

              <h3 className="font-bold text-amber-100 text-lg leading-snug line-clamp-2 mt-2 drop-shadow-md flex items-center gap-2">
                <span className="text-2xl">{wish.cover_emoji}</span>
                <span>{wish.product_name}</span>
              </h3>
            </div>

            {/* 底部承諾與進度列 */}
            <div className="space-y-3.5">
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
                  <span className={`font-black ${isNearComplete ? 'text-amber-300 glow-text' : 'text-amber-200'}`}>
                    {progress}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="text-center pt-1">
                <p className="text-[11px] text-zinc-500 group-hover:text-amber-300/80 transition-colors flex items-center justify-center gap-1 font-medium">
                  <span>👆</span> 點擊卡片翻面看完整故事與互動
                </p>
              </div>
            </div>
          </div>

          {/* ==================== 2. 背面 (故事全文、互動按鈕、感謝信) ==================== */}
          <div className="absolute inset-0 w-full h-full rounded-2xl glass-strong glow-border p-5 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950/98 border border-amber-400/30 shadow-2xl">
            {/* 背面頂部資訊列 */}
            <div className="border-b border-white/10 pb-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1 text-amber-300 truncate max-w-[200px]">
                  <Compass className="w-3.5 h-3.5 flex-shrink-0" />
                  {wish.anonymous_nickname || '匿名星旅人'} 的心願
                </span>

                {/* ❤️ 追番按鈕（點擊不翻面） */}
                {!isOfficial && (
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                      isBookmarked
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 scale-110 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={isBookmarked ? '已追番 (點擊取消)' : '加入追番牆'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-rose-400 text-rose-400' : ''}`} />
                  </button>
                )}
              </div>
              <h4 className="font-bold text-amber-100 text-sm truncate">{wish.product_name}</h4>
            </div>

            {/* 故事內文 */}
            <div className="relative my-2 flex-1 overflow-hidden">
              <p className="text-xs text-zinc-300 leading-relaxed text-justify line-clamp-4">
                {wish.story_text}
              </p>
              <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
            </div>

            {/* 承諾內容 */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-2">
              <p className="text-[11px] text-amber-200/90 leading-tight">
                <span className="font-bold text-amber-300">承諾：</span>
                {wish.promise_text}
              </p>
            </div>

            {/* 進度與小功能列 (電商連結、漂流瓶、檢舉/下架) */}
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
                    <ExternalLink className="w-2.5 h-2.5" /> 商品
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* 漂流瓶留言室按鈕 */}
                {variant !== 'preview' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDriftModal(true);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-amber-300 hover:bg-white/10 flex items-center gap-1 transition-all"
                  >
                    <MessageCircle className="w-3 h-3" /> 漂流瓶
                  </button>
                )}

                {/* 檢舉 / 下架按鈕 */}
                {!isOfficial && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isAdmin && isBanned) {
                        alert('🚫 您的帳號已被停權，無法使用檢舉功能。');
                        return;
                      }
                      setShowActionModal(true);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                      isAdmin
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-bold'
                        : 'bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
                    }`}
                  >
                    {isAdmin ? <><ShieldAlert className="w-3 h-3" /> 下架</> : <><Flag className="w-3 h-3" /> 檢舉</>}
                  </button>
                )}
              </div>
            </div>

            {/* ================= 底部按鈕區 (依 variant 呈現) ================= */}
            <div className="space-y-1.5">
              {/* 1. 「我的心願」管理模式：呈現重編與感謝信上傳按鈕 */}
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

                  {/* 🌟 核心回歸：滿額 (full_funded) 或履約完結時，出現感謝信按鈕 */}
                  {(wish.status === 'full_funded' || wish.status === 'fulfilled' || progress >= 100) &&
                    onOpenLetterModal && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenLetterModal(wish);
                        }}
                        className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 text-zinc-950 text-xs font-black rounded-xl flex items-center justify-center gap-1 shadow-lg shadow-purple-500/20"
                      >
                        <MailCheck className="w-3.5 h-3.5" />
                        {wish.thank_you_letter ? '修改開箱信' : '撰寫開箱信'}
                      </button>
                    )}
                </div>
              )}

              {/* 2. 「追番牆」模式：直接開啟詳細終章與留言彈窗 */}
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
                  {isFulfilled ? '✨ 查看主角開箱感謝信與結局' : '🍾 進入瓶中留言室查看結局進度'}
                </button>
              )}

              {/* 3. 「首頁市集」模式：注入星塵或圓滿標籤 */}
              {variant === 'market' &&
                (isFulfilled ? (
                  <div className="w-full text-center py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 此心願已圓滿達成
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isBanned) {
                        alert('🚫 您的帳號已被停權，無法贊助願望。');
                        return;
                      }
                      setShowInvest(true);
                    }}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                      isNearComplete
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 pulse-gold font-black'
                        : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-bold shadow-amber-500/20'
                    }`}
                  >
                    <Coins className="w-3.5 h-3.5 fill-current" />
                    {isNearComplete ? '🌟 搶下尾刀 · 助他圓夢' : '🌌 注入星塵 · 助他圓夢'}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 贊助 Modal */}
      {showInvest && (
        <InvestModal
          story={wish}
          onClose={() => {
            setShowInvest(false);
            refreshProfile();
          }}
        />
      )}

      {/* 漂流瓶與終章結局共用 Modal（內部左側直接復用此 WishCard preview 版） */}
      {showDriftModal && (
        <DriftBottleModal
          wish={wish}
          progress={progress}
          isFulfilled={isFulfilled}
          onClose={() => setShowDriftModal(false)}
        />
      )}

      {/* 檢舉 / 下架 Modal */}
      {showActionModal && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md scale-in"
          onClick={(e) => {
            e.stopPropagation();
            setShowActionModal(false);
          }}
        >
          <div
            className="glass-strong rounded-2xl w-full max-w-sm p-6 glow-border border-red-500/30 bg-zinc-950 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
              {isAdmin ? '⚠️ 管理員強制下架卡片' : '🚩 檢舉不當願望故事'}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAdmin
                ? `請輸入下架「${wish.product_name}」的理由：`
                : '請填寫檢舉原因（將送交管理團隊查核）：'}
            </p>
            <textarea
              rows={3}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="請填寫具體原因..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400/50 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowActionModal(false)}
                className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white"
              >
                取消
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleConfirmAction}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs"
              >
                {isActionLoading ? '處理中...' : isAdmin ? '確認下架' : '送出檢舉'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
