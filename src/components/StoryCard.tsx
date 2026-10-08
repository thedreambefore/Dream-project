import { useState, useMemo, useEffect } from 'react';
import { Coins, Sparkles, Heart, Compass, ShieldAlert, Flag } from 'lucide-react';
import type { Story } from '@/lib/supabase';
import { InvestModal } from './InvestModal';
import { useAuth } from '@/context/AuthContext';
import { blockWish, updateWish } from '@/lib/backend';
import { supabase } from '@/lib/supabaseClient';

interface ExtendedStory extends Story {
  image_url?: string | null;
  anonymous_nickname?: string | null;
  is_reported?: boolean;
  report_reason?: string | null;
}

export function StoryCard({ story, index }: { story: Story; index: number }) {
  const { session, profile, refreshProfile } = useAuth();
  const [showInvest, setShowInvest] = useState(false);
  const [isMobileFlipped, setIsMobileFlipped] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionReason, setActionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const extStory = story as ExtendedStory;
  const isAdmin = profile?.role === 'admin';
  const isBanned = profile?.role === 'banned';
  const isOfficial = story.id === '00000000-0000-0000-0000-000000000001';

  const progress = Math.min(100, Math.round((story.current_stardust / story.product_price) * 100));
  const isFulfilled = story.status === 'fulfilled';
  const isNearComplete = progress >= 90 && progress < 100;

  // 檢查是否已收藏
  useEffect(() => {
    if (!session?.user?.id || isOfficial) return;
    supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('wish_id', story.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsBookmarked(true);
      });
  }, [session?.user?.id, story.id, isOfficial]);

  // 切換收藏愛心
  const handleToggleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user?.id) {
      alert('請先登入後再加入追番收藏！');
      return;
    }
    try {
      if (isBookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', session.user.id).eq('wish_id', story.id);
        setIsBookmarked(false);
      } else {
        await supabase.from('bookmarks').insert({ user_id: session.user.id, wish_id: story.id });
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('收藏切換失敗:', err);
    }
  };

  const constellationSeed = useMemo(() => {
    let hash = 0;
    const str = story.id || 'seed';
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
  }, [story.id]);

  const handleOpenActionModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin && isBanned) {
      alert('🚫 您的帳號已被停權，無法使用檢舉功能。');
      return;
    }
    setShowActionModal(true);
  };

  const handleConfirmAction = async () => {
    if (!actionReason.trim()) return alert('請填寫原因');
    setIsActionLoading(true);
    try {
      if (isAdmin) {
        await blockWish(story.id, actionReason.trim());
        alert('✅ 管理員操作成功：卡片已即刻下架隱藏。');
      } else {
        await updateWish(story.id, { is_reported: true, report_reason: actionReason.trim() });
        alert('🚩 感謝通報！管理團隊將在後台查核，卡片暫時維持展示。');
      }
      setShowActionModal(false);
      setActionReason('');
    } catch (e: any) {
      alert(`操作失敗: ${e.message}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <>
      <div
        className="perspective-1000 w-full h-[400px] select-none group fade-in-up cursor-pointer"
        style={{ animationDelay: `${index * 0.06}s` }}
        onClick={() => setIsMobileFlipped((prev) => !prev)}
      >
        <div className={`relative w-full h-full duration-700 transform-style-3d group-hover-flip transition-transform ease-out ${isMobileFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* 正面（已移除愛心，徹底避免懸停/點擊衝突） */}
          <div className="absolute inset-0 w-full h-full rounded-2xl glass glow-border overflow-hidden backface-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl">
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
              {extStory.image_url ? (
                <div className="relative w-full h-full">
                  <img src={extStory.image_url} alt={story.product_name} className="w-full h-full object-cover brightness-60 contrast-125" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#120e28]/85 to-[#241446]/60 mix-blend-overlay" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a1a]" />
                </div>
              ) : (
                <div className="w-full h-full relative" style={{ background: constellationSeed.gradient }}>
                  <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 280 160">
                    <polyline points={constellationSeed.svgPoints.map((p) => `${p.cx},${p.cy}`).join(' ')} fill="none" stroke="rgba(251, 191, 36, 0.45)" strokeWidth="1.2" strokeDasharray="4 3" />
                    {constellationSeed.svgPoints.map((p, idx) => (
                      <circle key={idx} cx={p.cx} cy={p.cy} r={idx === 1 ? '3.5' : '2'} fill="#fde68a" className="animate-pulse" />
                    ))}
                  </svg>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 text-amber-300" />
                  #{story.tag_name}
                </span>
                {isFulfilled && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ 已履約圓夢
                  </span>
                )}
              </div>

              <h3 className="font-bold text-amber-100 text-lg leading-snug line-clamp-2 mt-2 drop-shadow-md">
                {story.product_name}
              </h3>
            </div>

            <div className="space-y-4">
              <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                <p className="text-[11px] text-zinc-400 line-clamp-1">
                  <span className="text-amber-300/80 font-bold">終章承諾：</span>{story.promise_text}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="text-zinc-400 flex items-center gap-1 font-mono">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {story.current_stardust.toLocaleString()} / {story.product_price.toLocaleString()} 星塵
                  </span>
                  <span className={`font-black font-mono ${isNearComplete ? 'text-amber-300 glow-text' : 'text-amber-200'}`}>{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative shadow-inner">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.7)] transition-all duration-800 ease-out" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-zinc-500 group-hover:text-amber-300/70 transition-colors flex items-center justify-center gap-1">
                  <span>🔄</span> 懸停翻轉揭曉故事
                </p>
              </div>
            </div>
          </div>

          {/* 背面（❤️ 愛心移至右上角原檢舉處；檢舉下移至底部） */}
          <div className="absolute inset-0 w-full h-full rounded-2xl glass-strong glow-border p-5 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950/98 border border-amber-400/30 shadow-2xl">
            <div className="border-b border-white/10 pb-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span className="flex items-center gap-1 text-amber-300">
                  <Compass className="w-3.5 h-3.5" />
                  {extStory.anonymous_nickname || '匿名星旅人'} 的心願
                </span>
                
                {/* 🌟 1. 愛心收藏按鈕放置在原檢舉按鈕位置 */}
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
              <h4 className="font-bold text-amber-100 text-sm truncate">{story.product_name}</h4>
            </div>

            <div className="relative my-2 flex-1 overflow-hidden">
              <p className="text-xs text-zinc-300 leading-relaxed tracking-wide text-justify">{story.story_text}</p>
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-2">
              <p className="text-[11px] text-amber-200/90 leading-tight">
                <span className="font-bold text-amber-300">承諾：</span>{story.promise_text}
              </p>
            </div>

            {/* 🌟 2. 檢舉按鈕下移至進度資訊欄旁 */}
            <div className="flex justify-between items-center text-xs text-zinc-400 mb-2.5 px-1 font-mono">
              <span>需募: NT$ {story.product_price.toLocaleString()}</span>
              
              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-bold">進度 {progress}%</span>
                {!isOfficial && (
                  <button
                    type="button"
                    onClick={handleOpenActionModal}
                    className={`text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                      isAdmin ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 font-bold' : 'bg-white/5 text-zinc-500 hover:text-zinc-300 hover:bg-white/10'
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
                  onClick={(e) => { e.stopPropagation(); setShowInvest(true); }}
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
          </div>
        </div>
      </div>

      {showInvest && (
        <InvestModal 
          story={story} 
          onClose={() => {
            setShowInvest(false);
            refreshProfile();
          }} 
        />
      )}

      {showActionModal && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md scale-in" onClick={(e) => { e.stopPropagation(); setShowActionModal(false); }}>
          <div className="glass-strong rounded-2xl w-full max-w-sm p-6 glow-border border-red-500/30 bg-zinc-950 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
              {isAdmin ? '⚠️ 管理員強制下架卡片' : '🚩 檢舉不當願望故事'}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAdmin ? `請輸入下架「${story.product_name}」的違規理由，將立刻從首頁隱藏：` : '請填寫檢舉原因（卡片會保留於首頁，並交由管理員核實定奪）：'}
            </p>
            <textarea rows={3} value={actionReason} onChange={(e) => setActionReason(e.target.value)} placeholder="請填寫具體原因..." className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400/50 resize-none" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowActionModal(false)} className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-zinc-400 hover:text-white">取消</button>
              <button type="button" disabled={isActionLoading} onClick={handleConfirmAction} className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs">
                {isActionLoading ? '處理中...' : isAdmin ? '確認下架隱藏' : '送出通報檢舉'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
