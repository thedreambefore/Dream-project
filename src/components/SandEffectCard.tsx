import { useState, useRef, useCallback } from 'react';
import { Coins, Sparkles, Heart, Compass, CheckCircle2, MessageCircle, X } from 'lucide-react';
import type { Story } from '@/lib/supabase';
import { supabase } from '@/lib/supabaseClient';

export interface SandCardProps {
  wish: Story & { myInvestAmount?: number; isBookmarkedOnly?: boolean };
  index: number;
  showChatOnClick?: boolean;
}

export function SandEffectCard({ wish, index, showChatOnClick = true }: SandCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const progress = Math.min(100, Math.round(((wish.current_stardust || 0) / (wish.product_price || 1)) * 100));
  const isFulfilled = wish.status === 'fulfilled' || progress >= 100;

  // 🌟 simeydotme/pokemon-cards-css 核心演算法：即時動態光學角度計算
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    const px = Math.round((x / width) * 100);
    const py = Math.round((y / height) * 100);

    const centerX = width / 2;
    const centerY = height / 2;

    // 視差 3D 傾角計算 (-15deg ~ +15deg)
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;

    // 計算離中心點距離 (0 ~ 1)
    const distFromCenter = Math.sqrt(
      Math.pow((x - centerX) / centerX, 2) + Math.pow((y - centerY) / centerY, 2)
    );

    card.style.setProperty('--pointer-x', `${px}%`);
    card.style.setProperty('--pointer-y', `${py}%`);
    card.style.setProperty('--background-x', `${px * 1.5}%`);
    card.style.setProperty('--background-y', `${py * 1.5}%`);
    card.style.setProperty('--pointer-from-center', `${Math.min(1, distFromCenter)}`);
    card.style.setProperty('--rotate-x', `${rotateX}deg`);
    card.style.setProperty('--rotate-y', `${rotateY}deg`);
    card.style.setProperty('--card-opacity', '1');
  }, []);

  const handleMouseEnter = () => setIsInteracting(true);

  const handleMouseLeave = () => {
    setIsInteracting(false);
    const card = cardRef.current;
    if (!card) return;
    // 滑鼠移出時彈性復位
    card.style.setProperty('--card-opacity', '0');
    card.style.setProperty('--rotate-x', '0deg');
    card.style.setProperty('--rotate-y', '0deg');
  };

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => setShowChatModal(true)}
        className={`holo-card w-full h-[450px] select-none rounded-[2rem] p-1.5 cursor-pointer relative group transition-transform ${
          isInteracting ? 'interacting' : ''
        }`}
        style={{
          transform: `perspective(800px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))`,
          animationDelay: `${index * 0.05}s`,
        }}
      >
        {/* 卡片玻璃瓶身底座 (四周預留半透明玻璃呼吸感) */}
        <div className="glass-flask-inner relative w-full h-full p-5 flex flex-col justify-between border border-white/10 group-hover:border-amber-400/50 transition-colors">
          
          {/* 🌟 1. 瓶中星砂流體層 (由 progress% 驅動高度升降) */}
          <div
            className="absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-1000 ease-out z-0"
            style={{ height: `${progress}%` }}
          >
            {/* 星砂沉積體 */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-600/50 via-amber-400/30 to-yellow-300/15 backdrop-blur-[1px]" />
            {/* 星砂表面微光金色水平線 */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_15px_#f59e0b] animate-pulse" />
            {/* 金砂顆粒質感遮罩 */}
            <div className="absolute inset-0 bg-[radial-gradient(#fde68a_1.2px,transparent_1.2px)] [background-size:14px_14px] opacity-35" />
          </div>

          {/* 🌟 2. 達成 100% 滿額 / 履約時啟動【寶可夢級物理全息閃卡雙薄膜】 */}
          {isFulfilled && (
            <>
              {/* 彩虹全息折射層 */}
              <div className="holo-shine" />
              {/* 星空銀河碎金閃爍層 */}
              <div className="holo-glitter" />
            </>
          )}

          {/* ===== 卡片前景內容 (z-30 確保不被閃卡遮蔽) ===== */}
          <div className="relative z-30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-black/40 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                <Sparkles className="w-3 text-amber-300" />
                #{wish.tag_name}
              </span>

              {isFulfilled ? (
                <span className="text-[11px] font-black tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 text-zinc-950 shadow-[0_0_18px_rgba(251,191,36,0.9)] flex items-center gap-1 animate-pulse">
                  ✨ 寶可夢級全息閃卡
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
                NT$ {wish.current_stardust?.toLocaleString()} / {wish.product_price?.toLocaleString()}
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
                <MessageCircle className="w-3.5 h-3.5 text-amber-400" /> 漂流瓶留言室
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 左側固定卡片 + 右側即時漂流瓶留言室 */}
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

// ===== 漂流瓶聊天室 Modal =====
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
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full h-[600px] flex flex-col md:flex-row gap-4 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左側：懸浮展示卡片本體 (滿額即具備全息閃卡膜) */}
        <div className="w-full md:w-80 h-full flex-shrink-0 relative rounded-3xl overflow-hidden border border-amber-400/40 bg-zinc-950 p-5 flex flex-col justify-between shadow-2xl">
          {isFulfilled && (
            <>
              <div className="holo-shine opacity-80" />
              <div className="holo-glitter opacity-90" />
            </>
          )}

          <div className="relative z-30">
            <div className="flex items-center justify-between text-xs text-amber-300 font-mono mb-2">
              <span>#{wish.tag_name}</span>
              <span>{isFulfilled ? '✨ 閃卡完結' : `集資 ${progress}%`}</span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{wish.cover_emoji}</span>
              <span>{wish.product_name}</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-3 leading-relaxed max-h-36 overflow-y-auto hide-scrollbar">
              {wish.story_text}
            </p>
          </div>

          <div className="relative z-30 space-y-2">
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

        {/* 右側：漂流瓶聊天留言室 */}
        <div className="flex-1 w-full h-full rounded-3xl glass-strong border border-white/10 bg-zinc-900/95 flex flex-col justify-between overflow-hidden shadow-2xl relative">
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

          <div className="p-3 bg-black/60 border-t border-white/5 text-center text-[11px] text-zinc-500">
            🌌 只有在注入燃料時才能向瓶中投入新的祝福
          </div>
        </div>
      </div>
    </div>
  );
}
