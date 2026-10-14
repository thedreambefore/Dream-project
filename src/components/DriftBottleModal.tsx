// src/components/DriftBottleModal.tsx
import { useState, useEffect, useMemo } from 'react';
import { X, MessageCircle, Loader2, Lock, Trash2, Coins, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import type { Wish, Investment } from '@/types/wish';
import { useAuth } from '@/context/AuthContext';
import { OFFICIAL_SPONSOR_ID } from '@/lib/backend';

interface DriftBottleModalProps {
  wish: Wish;
  progress: number;
  isFulfilled: boolean;
  onClose: () => void;
}

export function DriftBottleModal({ wish, isFulfilled, onClose }: DriftBottleModalProps) {
  const { session, isAdmin } = useAuth();
  const [messages, setMessages] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasDonated, setHasDonated] = useState(false);

  const isOfficial = wish.id === OFFICIAL_SPONSOR_ID;
  const isOwner = session?.user?.id === wish.user_id;

  const currentStardust = Number(wish.current_stardust || 0);
  const targetStardust = Number(wish.product_price || 1);
  const progressPercent = Math.min(100, Math.round((currentStardust / targetStardust) * 100));

  // 1. 檢查當前使用者是否曾贊助過此願望
  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('investments')
      .select('id')
      .eq('user_id', session.user.id)
      .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setHasDonated(true);
      });
  }, [session?.user?.id, wish.id]);

  // 2. 核心權限判斷：官方卡全公開；一般卡履約後僅許願人、贊助者、管理員可見
  const canAccess = isOfficial || (isFulfilled && (isOwner || hasDonated || isAdmin));

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('investments')
      .select('*, users:user_id(anonymous_nickname)')
      .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages((data as Investment[]).filter((m) => !m.is_hidden));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (canAccess) {
      loadMessages();
    } else {
      setLoading(false);
    }
  }, [wish.id, canAccess]);

  // 3. 官方卡留言排序：優先置頂自己發出的留言，其餘按時間排列
  const sortedMessages = useMemo(() => {
    if (!isOfficial || !session?.user?.id) return messages;

    return [...messages].sort((a, b) => {
      const aIsMe = a.user_id === session.user.id;
      const bIsMe = b.user_id === session.user.id;
      if (aIsMe && !bIsMe) return -1;
      if (!aIsMe && bIsMe) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [messages, isOfficial, session?.user?.id]);

  // 管理員：貼圖表情反饋 (⭕, ❌, 👍)
  const handleSetReaction = async (msgId: string, emoji: string) => {
    try {
      await supabase.from('investments').update({ reaction: emoji } as any).eq('id', msgId);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? ({ ...m, reaction: emoji } as any) : m))
      );
    } catch (err: any) {
      alert(`表態失敗: ${err.message}`);
    }
  };

  // 管理員：刪除留言
  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('確定要永久刪除此則留言嗎？')) return;
    try {
      await supabase.from('investments').delete().eq('id', msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err: any) {
      alert(`刪除失敗: ${err.message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full h-[620px] flex flex-col md:flex-row gap-4 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 🌟 左側獨立預覽卡片：不依賴 WishCard 元件，杜絕 Circular Dependency */}
        <div className="w-full md:w-80 h-[430px] flex-shrink-0 flex items-center justify-center">
          <div className="w-full h-full rounded-2xl glass glow-border overflow-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl relative border border-amber-400/25">
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
                <div className="w-full h-full bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-[#0a0a1a]" />
              )}
            </div>

            {/* 頂部標籤 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 text-amber-300" />
                  #{wish.tag_name}
                </span>

                {isOfficial ? (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                    🪐 官方常駐
                  </span>
                ) : isFulfilled ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950">
                    ✨ 圓滿履約
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                    {progressPercent}%
                  </span>
                )}
              </div>

              <h3 className="font-bold text-amber-100 text-base leading-snug line-clamp-2 mt-2 drop-shadow-md flex items-center gap-2">
                <span className="text-2xl">{wish.cover_emoji}</span>
                <span>{wish.product_name}</span>
              </h3>
            </div>

            {/* 底部承諾與進度列 */}
            <div className="space-y-3">
              <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                <p className="text-[11px] text-zinc-400 line-clamp-2">
                  <span className="text-amber-300/80 font-bold">故事承諾：</span>
                  {wish.promise_text}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {currentStardust.toLocaleString()} / {targetStardust.toLocaleString()}
                  </span>
                  <span className="text-amber-200 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右側：漂流瓶留言室 */}
        <div className="flex-1 w-full h-full rounded-3xl glass-strong border border-white/10 bg-zinc-900/95 flex flex-col justify-between overflow-hidden shadow-2xl relative">
          {/* 頂部標題列 */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
              <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                {isOfficial ? '🪐 夢沙星空意見箱 · 公開留言板' : '願望星砂漂流瓶留言室'}
              </h4>
              <p className="text-[10px] text-zinc-400">
                {isOfficial
                  ? '官方公開交流區 · 支持星空並留下寶貴建議'
                  : '專屬閉環空間 · 僅許願者與贊助星旅人於圓滿履約後解鎖'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 內容區塊 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 hide-scrollbar">
            {!canAccess ? (
              <div className="text-center py-20 px-6 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-amber-200">漂流瓶受星光結界封存中</h4>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  {!isFulfilled
                    ? '此願望目前仍在募資集星中。為守護最純粹的善意，所有祝福將在「完成履約出貨」後才正式開啟。'
                    : '本願望漂流瓶為私密專屬空間，僅開放給「許願者本人」與「曾注入燃料的贊助者」共同見證。'}
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-24 text-xs text-zinc-500 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                正在打撈瓶中留言...
              </div>
            ) : sortedMessages.length === 0 ? (
              <div className="text-center py-24 text-xs text-zinc-500">
                目前尚無漂流瓶留言，快去注入第一份星塵並寫下祝福或建言吧！
              </div>
            ) : (
              sortedMessages.map((msg) => {
                const isMyMessage = session?.user?.id === msg.user_id;
                const msgReaction = (msg as any).reaction;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 items-start p-3 rounded-2xl border transition-all ${
                      isMyMessage && isOfficial
                        ? 'bg-amber-500/10 border-amber-400/40 shadow-sm'
                        : 'bg-black/50 border-white/5'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xs text-amber-300 font-bold flex-shrink-0">
                      {isMyMessage ? '⭐' : '✨'}
                    </div>

                    <div className="flex-1 text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-amber-200">
                            {msg.users?.anonymous_nickname || '匿名星旅人'}
                          </span>
                          {isMyMessage && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                              我的留言
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-amber-400 font-bold text-[10px]">
                          +${msg.amount} 星塵
                        </span>
                      </div>

                      <p className="text-zinc-200 leading-relaxed">
                        {msg.message || '(默默注入了一筆心願燃料)'}
                      </p>

                      {/* 貼圖表情反饋展示 */}
                      {msgReaction && (
                        <div className="pt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-xs border border-white/15">
                            <span>{msgReaction}</span>
                            <span className="text-[10px] text-zinc-400">官方回饋</span>
                          </span>
                        </div>
                      )}

                      {/* 管理員專屬操作工具列 */}
                      {isAdmin && (
                        <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-zinc-500">審核表態：</span>
                            {['⭕', '❌', '👍'].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleSetReaction(msg.id, emoji)}
                                className={`px-1.5 py-0.5 rounded text-xs hover:bg-white/10 transition-colors cursor-pointer ${
                                  msgReaction === emoji ? 'bg-amber-500/30 border border-amber-400' : ''
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-red-400 hover:text-red-300 text-[10px] flex items-center gap-0.5 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> 刪除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-3 bg-black/60 border-t border-white/5 text-center text-[11px] text-zinc-500">
            {isOfficial ? (
              <span>💡 您的寶貴建言將於注入星塵時永久留存，管理團隊將定期檢閱回饋</span>
            ) : (
              <span>🌌 此處為真實履約閉環見證室，致敬每一位星旅人的真心付託</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
