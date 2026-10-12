// src/components/WishCard.tsx
import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Coins, Sparkles, Heart, Compass, ShieldAlert, Flag, MessageCircle, Lock, CheckCircle2 } from 'lucide-react';
import type { Wish } from '@/types/wish';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { blockWish, updateWish, OFFICIAL_SPONSOR_ID } from '@/lib/backend';
import { InvestModal } from './InvestModal';
import { DriftBottleModal } from './DriftBottleModal';

export interface WishCardProps {
  wish: Wish;
  index: number;
  /**
   * 顯示型態：
   * - 'market': 首頁市集模式（3D 懸停翻轉、下架/檢舉、注入燃料）
   * - 'tracked': 追番牆模式（正面為故事進度，背面為開箱感謝信/官方祝福）
   * - 'flask': 星砂波浪閃卡模式（點擊直接開漂流瓶留言室）
   */
  variant?: 'market' | 'tracked' | 'flask';
}

export function WishCard({ wish, index, variant = 'market' }: WishCardProps) {
  const { session, isBanned, isAdmin, refreshProfile } = useAuth();
  const cardRef = useRef<HTMLDivElement>(null);

  // 狀態管理
  const [isFlipped, setIsFlipped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(Boolean(wish.isBookmarked));
  const [showInvest, setShowInvest] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  // 檢舉 / 下架彈窗
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isOfficial = wish.id === OFFICIAL_SPONSOR_ID;
  const progress = Math.min(100, Math.round(((wish.current_stardust || 0) / (wish.product_price || 1)) * 100));
  const isFulfilled = wish.status === 'fulfilled' || progress >= 100;
  const isNearComplete = progress >= 90 && progress < 100;

  // 查詢書籤狀態
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

  // 愛心收藏切換
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

  // 全息閃卡物理傾斜運算 (Trainer Gallery 演算法)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (variant !== 'flask') return;
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = Math.round((x / rect.width) * 100);
    const py = Math.round((y / rect.height) * 100);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    card.style.setProperty('--pointer-x', `${px}%`);
    card.style.setProperty('--pointer-y', `${py}%`);
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--card-opacity', '1');
  }, [variant]);

  const handleMouseLeave = () => {
    if (variant !== 'flask') return;
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty('--card-opacity', '0');
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
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

  // 星宿背景計算
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

  /* ========================================================
     Variant: 'flask' (星砂波浪 + Trainer Gallery 閃卡)
     ======================================================== */
  if (variant === 'flask') {
    return (
      <>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => cardRef.current?.style.setProperty('--card-opacity', '1')}
          onMouseLeave={handleMouseLeave}
          onClick={() => setShowChatModal(true)}
          className={`holo-card w-full h-[450px] select-none rounded-2xl cursor-pointer relative group transition-transform ${
            isFulfilled ? 'holo-border-gold' : 'border border-white/10'
          }`}
          style={{
            transform: `perspective(800px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))`,
            animationDelay: `${index * 0.05}s`,
          }}
        >
          <div className="glass-flask-inner relative w-full h-full p-5 flex flex-col justify-between group-hover:border-amber-400/30 transition-colors">
            {/* 瓶中星砂水面 */}
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-1000 ease-out z-0 overflow-hidden"
              style={{ height: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 via-amber-400/5 to-transparent" />
              <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
            </div>

            {isFulfilled && <div className="trainer-gallery-shine" />}

            {/* 前景內容 */}
            <div className="relative z-30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 text-amber-300" />
                  #{wish.tag_name}
                </span>

                {isFulfilled ? (
                  <span className="text-[11px] font-black tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-zinc-950 shadow-[0_0_18px_rgba(251,191,36,0.9)] flex items-center gap-1 animate-pulse">
                    ✨ 圓滿閃卡
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-zinc-400 bg-black/60 px-2.5 py-1 rounded-lg border border-white/5">
                    瓶中星砂 {progress}%
                  </span>
                )}
              </div>

              <h3 className="font-bold text-amber-100 text-lg leading-snug line-clamp-2 mt-2 drop-shadow-md flex items-center gap-2">
                <span className="text-2xl">{wish.cover_emoji}</span>
                <span>{wish.product_name}</span>
              </h3>
            </div>

            <div className="relative z-30 my-auto bg-black/60 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
              <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed text-justify">
                {wish.story_text}
              </p>
            </div>

            <div className="relative z-30 space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 backdrop-blur-md">
                <p className="text-[11px] text-amber-200/90 truncate">
                  <span className="font-bold text-amber-300">終章承諾：</span>{wish.promise_text}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-zinc-300 pt-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  NT$ {(wish.current_stardust || 0).toLocaleString()} / {(wish.product_price || 0).toLocaleString()}
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5 text-amber-400" /> 漂流瓶留言室
                </span>
              </div>
            </div>
          </div>
        </div>

        {showChatModal && (
          <DriftBottleModal
            wish={wish}
            progress={progress}
            isFulfilled={isFulfilled}
            onClose={() => setShowChatModal(false)}
          />
        )}
      </>
    );
  }

  /* ========================================================
     Variant: 'market' (首頁) & 'tracked' (追番牆 3D 卡片)
     ======================================================== */
  return (
    <>
      <div
        className="perspective-1000 w-full h-[410px] select-none group fade-in-up cursor-pointer"
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d group-hover-flip transition-transform ease-out ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ========== 正面 ========== */}
          <div className="absolute inset-0 w-full h-full rounded-2xl glass glow-border overflow-hidden backface-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl">
            {/* 背景圖或星宿 */}
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

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 text-amber-300" />
                  #{wish.tag_name}
                </span>

                {variant === 'tracked' ? (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                      wish.isBookmarkedOnly
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {wish.isBookmarkedOnly ? <Heart className="w-2.5 h-2.5 fill-current" /> : <Coins className="w-2.5 h-2.5" />}
                    {wish.isBookmarkedOnly ? '純追番' : `已注燃料 $${wish.myInvestAmount || 0}`}
                  </span>
                ) : (
                  isFulfilled && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ✓ 已履約圓夢
                    </span>
                  )
                )}
              </div>

              <h3 className="font-bold text-amber-100 text-lg leading-snug line-clamp-2 mt-2 drop-shadow-md flex items-center gap-2">
                <span>{wish.cover_emoji}</span>
                <span>{wish.product_name}</span>
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  <span className="text-amber-300/80 font-bold">終章承諾：</span>
                  {wish.promise_text}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-zinc-400 flex items-center gap-1 font-mono">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {(wish.current_stardust || 0).toLocaleString()} / {(wish.product_price || 0).toLocaleString()} 星塵
                  </span>
                  <span className={`font-black font-mono ${isNearComplete ? 'text-amber-300 glow-text' : 'text-amber-200'}`}>
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

              <div className="text-center">
                <p className="text-[11px] text-zinc-500 group-hover:text-amber-300/70 transition-colors flex items-center justify-center gap-1">
                  <span>🔄</span> 懸停翻轉揭曉故事
                </p>
              </div>
            </div>
          </div>

          {/* ========== 背面 ========== */}
          <div className="absolute inset-0 w-full h-full rounded-2xl glass-strong glow-border p-5 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950/98 border border-amber-400/30 shadow-2xl">
            {variant === 'tracked' ? (
              // 追番結局面（開箱信 / 官方祝福）
              <>
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
                      {wish.thank_you_letter || '主角已順利收取夢想物資，感謝星空下每顆溫暖星塵的相助！'}
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
                  <span className="text-[11px] text-zinc-500">🔄 懸停或點擊翻回正面故事</span>
                </div>
              </>
            ) : (
              // 首頁市集面（完整故事、愛心追蹤、檢舉、贊助入口）
              <>
                <div className="border-b border-white/10 pb-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Compass className="w-3.5 h-3.5" />
                      {wish.anonymous_nickname || '匿名星旅人'} 的心願
                    </span>

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

                <div className="relative my-2 flex-1 overflow-hidden">
                  <p className="text-xs text-zinc-300 leading-relaxed tracking-wide text-justify">
                    {wish.story_text}
                  </p>
                  <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-2">
                  <p className="text-[11px] text-amber-200/90 leading-tight">
                    <span className="font-bold text-amber-300">承諾：</span>
                    {wish.promise_text}
                  </p>
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-400 mb-2.5 px-1 font-mono">
                  <span>需募: NT$ {(wish.product_price || 0).toLocaleString()}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-bold">進度 {progress}%</span>
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

                <div>
                  {isFulfilled ? (
                    <div className="w-full text-center py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
                      🎉 此心願已圓滿達成履約
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
                      className={`w-full touch-btn py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer ${
                        isNearComplete
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-950 pulse-gold font-black'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-bold shadow-amber-500/20'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5 fill-current" />
                      {isNearComplete ? '🌟 搶下尾刀 · 助他圓夢' : '🌌 注入星塵 · 助他圓夢'}
                    </button>
                  )}
                </div>
              </>
            )}
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

      {/* 檢舉 / 管理員下架 Modal */}
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
                ? `請輸入下架「${wish.product_name}」的違規理由，將立刻從首頁隱藏：`
                : '請填寫檢舉原因（卡片會保留於首頁，並交由管理員核實定奪）：'}
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
                {isActionLoading ? '處理中...' : isAdmin ? '確認下架隱藏' : '送出通報檢舉'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
