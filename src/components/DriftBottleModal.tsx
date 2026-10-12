// src/components/DriftBottleModal.tsx
import { useState, useEffect } from 'react';
import { X, Sparkles, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Wish, Investment } from '@/types/wish';

interface DriftBottleModalProps {
  wish: Wish;
  progress: number;
  isFulfilled: boolean;
  onClose: () => void;
}

export function DriftBottleModal({ wish, progress, isFulfilled, onClose }: DriftBottleModalProps) {
  const [messages, setMessages] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchChatMessages = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('investments')
        .select('*, users:user_id(anonymous_nickname)')
        .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
        .order('created_at', { ascending: true });

      if (!error && data && isMounted) {
        setMessages((data as Investment[]).filter((m) => !m.is_hidden));
      }
      if (isMounted) setLoading(false);
    };

    fetchChatMessages();
    return () => { isMounted = false; };
  }, [wish.id]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full h-[600px] flex flex-col md:flex-row gap-4 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左側：卡片本體懸浮展示 */}
        <div className="w-full md:w-80 h-full flex-shrink-0 relative rounded-3xl overflow-hidden border border-amber-400/30 bg-zinc-950 p-6 flex flex-col justify-between shadow-2xl">
          {isFulfilled && (
            <>
              <div className="trainer-gallery-shine" />
              <div className="holo-glitter opacity-90" />
            </>
          )}

          <div className="relative z-30 space-y-3">
            <div className="flex items-center justify-between text-xs text-amber-300 font-mono">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                #{wish.tag_name}
              </span>
              <span>{isFulfilled ? '✨ 閃卡圓滿' : `集資 ${progress}%`}</span>
            </div>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="text-2xl">{wish.cover_emoji}</span>
              <span className="line-clamp-2">{wish.product_name}</span>
            </h3>

            <p className="text-xs text-zinc-400 leading-relaxed max-h-36 overflow-y-auto hide-scrollbar">
              {wish.story_text}
            </p>
          </div>

          <div className="relative z-30 space-y-2 pt-4 border-t border-white/10">
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full ${isFulfilled ? 'bg-amber-300' : 'bg-amber-500'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] font-mono text-amber-200">
              進度：NT$ {(wish.current_stardust || 0).toLocaleString()} / {(wish.product_price || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* 右側：漂流瓶留言室 */}
        <div className="flex-1 w-full h-full rounded-3xl glass-strong border border-white/10 bg-zinc-900/95 flex flex-col justify-between overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
              <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                願望星砂漂流瓶留言室
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
              <div className="text-center py-24 text-xs text-zinc-500 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                正在打撈漂流瓶中...
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-24 text-xs text-zinc-500">
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
                    <p className="text-zinc-300 leading-relaxed">
                      {msg.message || '(默默注入了一筆心願燃料)'}
                    </p>
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
