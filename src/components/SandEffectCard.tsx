import { useState, useMemo } from 'react';
import { Coins, Sparkles, Heart, Compass, CheckCircle2, MessageCircle, X, Send } from 'lucide-react';
import type { Story } from '@/lib/supabase';
import { supabase } from '@/lib/supabaseClient';

export interface SandCardProps {
  wish: Story & { myInvestAmount?: number; isBookmarkedOnly?: boolean };
  index: number;
  showChatOnClick?: boolean; // 點擊是否打開漂流瓶留言聊天室
  onOpenInvest?: (wish: Story) => void;
}

export function SandEffectCard({ wish, index, showChatOnClick = true, onOpenInvest }: SandCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const progress = Math.min(100, Math.round(((wish.current_stardust || 0) / (wish.product_price || 1)) * 100));
  const isFulfilled = wish.status === 'fulfilled' || progress >= 100;

  const handleClickCard = (e: React.MouseEvent) => {
    // 優先打開漂流留言聊天室，手機或右鍵翻面
    if (showChatOnClick) {
      setShowChatModal(true);
    } else {
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <>
      <div
        className={`perspective-1000 w-full h-[430px] select-none group fade-in-up cursor-pointer relative ${
          isFulfilled ? 'holographic-card-container' : ''
        }`}
        style={{ animationDelay: `${index * 0.05}s` }}
        onClick={handleClickCard}
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d group-hover-flip transition-transform ease-out ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* ================= 正面 ================= */}
          <div
            className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden backface-hidden flex flex-col justify-between p-5 border transition-all duration-500 shadow-2xl ${
              isFulfilled
                ? 'holo-foil border-amber-300/60 shadow-[0_0_30px_rgba(251,191,36,0.35)]'
                : 'glass-strong border-white/10 hover:border-amber-400/40 bg-zinc-950/70'
            }`}
          >
            {/* 🌟 1. 核心特效：瓶裝星砂流體層 (邊框四周留空，透過半透明玻璃隱約透出) */}
            <div className="absolute inset-2 rounded-2xl overflow-hidden pointer-events-none -z-10 bg-black/40 border border-white/5 backdrop-blur-[2px]">
              {/* 星砂沉積層 */}
              <div
                className="absolute inset-x-0 bottom-0 transition-all duration-1000 ease-out bg-gradient-to-t from-amber-500/40 via-yellow-400/25 to-amber-300/10"
                style={{ height: `${progress}%` }}
              >
                {/* 星砂表面微光顆粒與波浪 */}
                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-300/40 via-yellow-200/80 to-amber-300/40 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                <div className="absolute inset-0 bg-[radial-gradient(#fde68a_1px,transparent_1px)] [background-size:12px_12px] opacity-40 animate-pulse" />
              </div>

              {/* 背景夜空星點 */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_0.8px,transparent_0.8px)] [background-size:20px_20px] opacity-15" />
            </div>

            {/* 🌟 2. 鍍閃卡專屬彩虹金箔光澤遮罩 */}
            {isFulfilled && (
              <div className="absolute inset-0 pointer-events-none holo-glimmer opacity-70 z-10 rounded-3xl" />
            )}

            {/* 卡片正面抬頭 */}
            <div className="relative z-20">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 text-amber-300" />
                  #{wish.tag_name}
                </span>

                {isFulfilled ? (
                  <span className="text-[11px] font-black tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-zinc-950 shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center gap-1">
                    ✨ 閃卡圓滿
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2 py-0.5 rounded-lg border border-white/5">
                    瓶中星砂 {progress}%
                  </span>
                )}
              </div>

              <h3 className="font-bold text-amber-100 text-lg leading-snug line-clamp-2 mt-1 drop-shadow-md flex items-center gap-2">
                <span className="text-2xl">{wish.cover_emoji}</span>
                <span>{wish.product_name}</span>
              </h3>
            </div>

            {/* 故事內文預覽 */}
            <div className="relative z-20 my-auto bg-black/50 border border-white/10 rounded-2xl p-3 backdrop-blur-md">
              <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed">
                {wish.story_text}
              </p>
            </div>

            {/* 卡片底端：星砂水位進度 & 互動提示 */}
            <div className="relative z-20 space-y-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                <p className="text-[11px] text-amber-200/90 truncate">
                  <span className="font-bold text-amber-300">終章承諾：</span>{wish.promise_text}
                </p>
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-zinc-300">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Coins className="w-3.5 h-3.5" />
                  NT$ {wish.current_stardust?.toLocaleString()} / {wish.product_price?.toLocaleString()}
                </span>
                <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-amber-300" /> 查看留言
                </span>
              </div>
            </div>
          </div>

          {/* ================= 背面 ================= */}
          <div className="absolute inset-0 w-full h-full rounded-3xl glass-strong glow-border p-5 flex flex-col justify-between backface-hidden rotate-y-180 bg-zinc-950/98 border border-amber-400/40 shadow-2xl overflow-hidden">
            <div className="border-b border-white/10 pb-2.5 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5" /> 故事旅人日誌
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowChatModal(true);
                }}
                className="text-[10px] bg-amber-500/20 border border-amber-400/40 text-amber-200 px-2 py-1 rounded-lg flex items-center gap-1 hover:bg-amber-500/30"
              >
                <MessageCircle className="w-3 h-3" /> 漂流瓶留言室
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 my-2 pr-1 hide-scrollbar">
              {wish.unboxing_photo_url && (
                <div className="h-32 rounded-xl overflow-hidden border border-white/10">
                  <img src={wish.unboxing_photo_url} alt="開箱照" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-zinc-200 leading-relaxed">
                <p className="font-bold text-amber-300 mb-1">【主角心聲與承諾】</p>
                {wish.thank_you_letter || wish.story_text}
              </div>

              {wish.admin_blessing && (
                <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-2.5 text-[11px] text-amber-200">
                  👑 官方祝福：{wish.admin_blessing}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-white/10 text-center text-[10px] text-zinc-500">
              點擊卡片任何處展開【漂流瓶聊天留言室】
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 3. 左側懸浮卡片 + 右側即時漂流瓶留言室 (Chat Room) */}
      {showChatModal && (
        <WishDriftChatModal
          wish={wish}
          progress={progress}
          isFulfilled={isFulfilled}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </>
  );
}

// ===== 左側固定卡片 + 右側漂流瓶聊天室 Modal =====
function WishDriftChatModal({
  wish,
  progress,
  isFulfilled,
  onClose,
}: {
  wish: any;
  progress: number;
  isFulfilled: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 讀取該心願所有的贊助漂流瓶留言
  useState(() => {
    const fetchChatMessages = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('investments')
        .select('*, users:user_id(anonymous_nickname)')
        .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
        .order('created_at', { ascending: true });

      setMessages((data || []).filter((m) => !m.is_hidden));
      setLoading(false);
    };
    fetchChatMessages();
  });

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full h-[600px] flex flex-col md:flex-row gap-4 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左側：精美懸浮卡片本體 (滿額覆蓋閃卡模) */}
        <div className="w-full md:w-80 h-full flex-shrink-0 relative rounded-3xl overflow-hidden border border-amber-400/40 bg-zinc-950 p-5 flex flex-col justify-between shadow-2xl">
          {isFulfilled && <div className="absolute inset-0 holo-glimmer opacity-80 pointer-events-none z-10" />}
          
          <div>
            <div className="flex items-center justify-between text-xs text-amber-300 font-mono mb-2">
              <span>#{wish.tag_name}</span>
              <span>{isFulfilled ? '✨ 閃卡完結' : `募資中 ${progress}%`}</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{wish.cover_emoji}</span>
              <span>{wish.product_name}</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed max-h-36 overflow-y-auto hide-scrollbar">
              {wish.story_text}
            </p>
          </div>

          <div className="space-y-2">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${isFulfilled ? 'bg-amber-300' : 'bg-amber-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] font-mono text-amber-200">
              進度：NT$ {wish.current_stardust?.toLocaleString()} / {wish.product_price?.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 右側：漂流瓶留言室 (Chat Room 風格) */}
        <div className="flex-1 w-full h-full rounded-3xl glass-strong border border-white/10 bg-zinc-900/90 flex flex-col justify-between overflow-hidden shadow-2xl relative">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
              <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <span>🍾</span> 願望星砂漂流瓶留言室
              </h4>
              <p className="text-[10px] text-zinc-400">所有注入燃料的星旅人在此留下的祝福痕跡</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 留言列表 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 hide-scrollbar">
            {loading ? (
              <div className="text-center py-20 text-xs text-zinc-500">正在打撈漂流瓶中...</div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-xs text-zinc-500">
                目前尚無漂流瓶留言，快去注入第一份星塵並寫下祝福吧！
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 items-start animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xs text-amber-300 font-bold flex-shrink-0">
                    ✨
                  </div>
                  <div className="flex-1 bg-black/50 border border-white/5 rounded-2xl p-3 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-200">
                        {msg.users?.anonymous_nickname || '匿名星旅人'}
                      </span>
                      <span className="font-mono text-amber-400 font-bold text-[10px]">
                        +${msg.amount} 星塵
                      </span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">{msg.message || '(默默注入了一筆心願燃料)'}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 底欄提示 */}
          <div className="p-3 bg-black/60 border-t border-white/5 text-center text-[11px] text-zinc-500">
            🌌 只有在注入燃料時才能向瓶中投入新的祝福
          </div>
        </div>
      </div>
    </div>
  );
}
