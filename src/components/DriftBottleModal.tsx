// src/components/DriftBottleModal.tsx
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MessageSquare,
  Loader2,
  Lock,
  Trash2,
  Coins,
  Sparkles,
  Compass,
  CheckCircle2,
  MailCheck,
  ShieldAlert,
  ThumbsUp,
  Ban,
  UserCheck,
} from 'lucide-react';
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

  // 1. 查詢當前登入者是否曾為本心願投下星星
  useEffect(() => {
    if (!session?.user?.id || isOfficial) return;
    supabase
      .from('investments')
      .select('id')
      .eq('user_id', session.user.id)
      .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setHasDonated(true);
      });
  }, [session?.user?.id, wish.id, isOfficial]);

  // 2. 嚴格權限判定
  // 官方意見箱：全員可見；管理員：擁有全域巡檢權限；一般願望：必須「活動已達成」且為「主角、支持者或管理員」
  const canAccess = isOfficial || isAdmin || (isFulfilled && (isOwner || hasDonated));

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('investments')
      .select('*, users:user_id(anonymous_nickname)')
      .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      // 非管理員只顯示未被隱藏的留言
      const filtered = isAdmin
        ? (data as Investment[])
        : (data as Investment[]).filter((m) => !m.is_hidden);
      setMessages(filtered);
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

  const handleSetReaction = async (msgId: string, tag: string) => {
    try {
      await supabase.from('investments').update({ reaction: tag } as any).eq('id', msgId);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? ({ ...m, reaction: tag } as any) : m))
      );
    } catch (err: any) {
      alert(`表態註記失敗: ${err.message}`);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm('確定要永久刪除此則留言嗎？')) return;
    try {
      await supabase.from('investments').delete().eq('id', msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch (err: any) {
      alert(`刪除失敗: ${err.message}`);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full h-[620px] flex flex-col md:flex-row gap-4 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 左側：心願卡摘要與進度膠囊 */}
        <div className="w-full md:w-80 h-[430px] flex-shrink-0 flex items-center justify-center">
          <div className="w-full h-full rounded-2xl glass glow-border overflow-hidden flex flex-col justify-between p-5 bg-zinc-950/90 shadow-2xl relative border border-amber-400/25">
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

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-200 font-mono flex items-center gap-1 backdrop-blur-md">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  #{wish.tag_name}
                </span>

                {isOfficial ? (
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                    <Compass className="w-3 h-3" /> 官方常駐
                  </span>
                ) : isFulfilled ? (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 活動達成
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-2 py-0.5 rounded-md border border-white/5">
                    已投入 {progressPercent}%
                  </span>
                )}
              </div>

              <h3 className="font-bold text-amber-100 text-base leading-snug line-clamp-2 mt-2 drop-shadow-md flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{wish.product_name}</span>
              </h3>
            </div>

            <div className="space-y-3">
              <div className="bg-black/50 border border-white/10 rounded-xl p-2.5 backdrop-blur-md">
                <p className="text-[11px] text-zinc-400 line-clamp-2">
                  <span className="text-amber-300/80 font-bold">終章承諾：</span>
                  {wish.promise_text}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span className="text-zinc-400 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    {currentStardust.toLocaleString()} / {targetStardust.toLocaleString()} 星塵
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

        {/* 右側：漂流瓶留言室與結局見證窗 */}
        <div className="flex-1 w-full h-full rounded-3xl glass-strong border border-white/10 bg-zinc-900/95 flex flex-col justify-between overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
              <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                {isOfficial ? '夢沙星空意見箱 · 公開留言板' : '願望星砂漂流瓶結局室'}
              </h4>
              <p className="text-[10px] text-zinc-400">
                {isOfficial
                  ? '官方公開交流區 · 支持星空並留下寶貴建言'
                  : '專屬閉環空間 · 僅提案人與投入星星之星旅人於達成後完整解鎖'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 hide-scrollbar">
            {/* 未達存取門檻時之安全鎖定遮罩 */}
            {!canAccess ? (
              <div className="text-center py-20 px-6 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-amber-200">漂流瓶受星光結界封存中</h4>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  {!isFulfilled
                    ? '本活動仍在推進中。為杜絕社交攀比與未達成干擾，所有互動留言將在「活動 100% 圓滿達成」後正式解鎖見證。'
                    : '本漂流瓶為私密結局閉環，僅開放給「提案人本人」與「曾投下星星的支持者」查閱彼此的星語與履約開箱信。'}
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-24 text-xs text-zinc-500 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                正在打撈瓶中留言...
              </div>
            ) : (
              <>
                {/* 🌟 若已審核通過開箱感謝信，置頂公開呈現 */}
                {wish.letter_status === 'approved' && wish.thank_you_letter && (
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <MailCheck className="w-4 h-4 text-purple-400" />
                        創作者已送達開箱感謝信
                      </span>
                      <span className="text-[10px] text-purple-300/80 bg-purple-500/20 px-2 py-0.5 rounded-full">
                        官方審核通過
                      </span>
                    </div>

                    {wish.unboxing_photo_url && (
                      <div className="h-44 w-full rounded-xl overflow-hidden border border-purple-400/20">
                        <img
                          src={wish.unboxing_photo_url}
                          alt="開箱照片"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="text-xs text-purple-100 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                      {wish.thank_you_letter}
                    </p>
                  </div>
                )}

                {/* 官方寄語 */}
                {wish.admin_blessing && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25 text-xs text-amber-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">官方見證祝福：</span>
                      <span>{wish.admin_blessing}</span>
                    </div>
                  </div>
                )}

                {/* 留言清單 */}
                {sortedMessages.length === 0 ? (
                  <div className="text-center py-20 text-xs text-zinc-500">
                    目前尚無漂流瓶留言，快去投下星星並寫下互動星語吧！
                  </div>
                ) : (
                  sortedMessages.map((msg) => {
                    const isMyMessage = session?.user?.id === msg.user_id;
                    const msgReaction = (msg as any).reaction;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 items-start p-3 rounded-2xl border transition-all ${
                          msg.is_hidden
                            ? 'bg-red-950/20 border-red-500/30 opacity-60'
                            : isMyMessage
                            ? 'bg-amber-500/10 border-amber-400/40'
                            : 'bg-black/50 border-white/5'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-xs text-amber-300 font-bold flex-shrink-0">
                          {isMyMessage ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <Sparkles className="w-4 h-4" />
                          )}
                        </div>

                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-amber-200">
                                {msg.users?.anonymous_nickname || '匿名星旅人'}
                              </span>
                              {isMyMessage && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                                  我的留言
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-amber-400 font-bold text-[10px]">
                              +{msg.amount} 星塵
                            </span>
                          </div>

                          <p className="text-zinc-200 leading-relaxed">
                            {msg.message || '(默默投下了星願)'}
                          </p>

                          {msgReaction && (
                            <div className="pt-1 flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-[11px] border border-white/15 text-zinc-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>{msgReaction}</span>
                              </span>
                            </div>
                          )}

                          {isAdmin && (
                            <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-zinc-500">官方註記：</span>
                                {[
                                  { label: '優質', icon: ThumbsUp },
                                  { label: '違規疑慮', icon: ShieldAlert },
                                ].map((badge) => {
                                  const Icon = badge.icon;
                                  return (
                                    <button
                                      key={badge.label}
                                      type="button"
                                      onClick={() => handleSetReaction(msg.id, badge.label)}
                                      className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border transition-colors cursor-pointer ${
                                        msgReaction === badge.label
                                          ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                                          : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white'
                                      }`}
                                    >
                                      <Icon className="w-2.5 h-2.5" />
                                      {badge.label}
                                    </button>
                                  );
                                })}
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
              </>
            )}
          </div>

          <div className="p-3 bg-black/60 border-t border-white/5 text-center text-[11px] text-zinc-500">
            {isOfficial ? (
              <span>您的寶貴建言將於投入星星時永久留存，管理團隊將定期檢閱回饋</span>
            ) : (
              <span>本室僅於活動 100% 達成後開放見證，守護純粹真實的互動空間</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}