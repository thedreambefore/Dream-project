// src/components/DriftBottleModal.tsx
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  MessageSquare,
  Loader2,
  Lock,
  EyeOff,
  Eye,
  Coins,
  Sparkles,
  Compass,
  CheckCircle2,
  MailCheck,
  ShieldAlert,
  ThumbsUp,
  UserCheck,
  Clock,
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

  // 判定是否已超過達成隔天凌晨 00:00:00 (換日過期)
  const isExpiredFromHome = useMemo(() => {
    if (!isFulfilled || isOfficial) return false;
    const fundedDateStr = (wish as any).funded_at || wish.created_at;
    if (!fundedDateStr) return false;
    const fundedDate = new Date(fundedDateStr);
    const nextDayMidnight = new Date(
      fundedDate.getFullYear(),
      fundedDate.getMonth(),
      fundedDate.getDate() + 1,
      0,
      0,
      0
    );
    return new Date().getTime() >= nextDayMidnight.getTime();
  }, [isFulfilled, isOfficial, wish]);

  // 1. 查詢當前登入者是否曾為本心願投星加油
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

  // 2. 權限邊界精準判定：
  // A. 官方意見箱 或 管理員：永遠完全可見
  // B. 活動達成當天（未換日）：開放全站所有訪客自由同慶查閱！
  // C. 活動換日後（已永久封存）：僅限提案人本人、曾投星支持者查閱
  // D. 活動進行中（未達成）：許願者可看「全部實時加油」；支持者可看「自己的加油紀錄」；其他路人封存
  const canAccessFullRoom =
    isOfficial ||
    isAdmin ||
    (isFulfilled && !isExpiredFromHome) ||
    (isFulfilled && isExpiredFromHome && (isOwner || hasDonated)) ||
    (!isFulfilled && isOwner);

  const canAccessSelfOnly = !isFulfilled && !isOwner && hasDonated;
  const canAccess = canAccessFullRoom || canAccessSelfOnly;

  const loadMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('investments')
      .select('*, users:user_id(anonymous_nickname)')
      .or(`wish_id.eq.${wish.id},story_id.eq.${wish.id}`)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMessages(data as Investment[]);
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

  // 計算每個用戶對該願望的累計投入星塵數與佔比
  const userContributionMap = useMemo(() => {
    const map = new Map<string, { total: number; percent: number }>();
    messages.forEach((m) => {
      if (m.user_id) {
        const prev = map.get(m.user_id)?.total || 0;
        const newTotal = prev + Number(m.amount || 0);
        const percent = Math.min(100, Math.round((newTotal / targetStardust) * 1000) / 10);
        map.set(m.user_id, { total: newTotal, percent });
      }
    });
    return map;
  }, [messages, targetStardust]);

  // 過濾與排序
  const displayedMessages = useMemo(() => {
    if (canAccessSelfOnly) {
      // 進行中之支持者：僅檢視自己的加油紀錄
      return messages.filter((m) => m.user_id === session?.user?.id);
    }
    if (!isOfficial || !session?.user?.id) return messages;
    return [...messages].sort((a, b) => {
      const aIsMe = a.user_id === session.user.id;
      const bIsMe = b.user_id === session.user.id;
      if (aIsMe && !bIsMe) return -1;
      if (!aIsMe && bIsMe) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [messages, canAccessSelfOnly, isOfficial, session?.user?.id]);

  // 管理員專屬：優質註記
  const handleSetReaction = async (msgId: string, tag: string) => {
    try {
      await supabase.from('investments').update({ reaction: tag } as any).eq('id', msgId);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? ({ ...m, reaction: tag } as any) : m))
      );
    } catch (err: any) {
      alert(`註記失敗: ${err.message}`);
    }
  };

  // 管理員非破壞性處置：切換隱藏遮蔽（保留星塵數額，內文轉為紅色違規提示）
  const handleToggleHideMessage = async (msgId: string, currentHidden: boolean) => {
    try {
      await supabase.from('investments').update({ is_hidden: !currentHidden }).eq('id', msgId);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, is_hidden: !currentHidden } : m))
      );
    } catch (err: any) {
      alert(`處置失敗: ${err.message}`);
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
        {/* 左側：活動進度與身分識別卡 */}
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

        {/* 右側：數位加油漂流瓶留言室 */}
        <div className="flex-1 w-full h-full rounded-3xl glass-strong border border-white/10 bg-zinc-900/95 flex flex-col justify-between overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
              <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                {isOfficial
                  ? '夢沙星空意見箱 · 公開留言板'
                  : isFulfilled && !isExpiredFromHome
                  ? '心願達成公開慶典 · 星砂加油牆'
                  : isFulfilled && isExpiredFromHome
                  ? '心願追番結局室 · 私密星語存檔'
                  : isOwner
                  ? '星旅人實時加油室 (許願者專屬)'
                  : '我的心願加油紀錄'}
              </h4>
              <p className="text-[10px] text-zinc-400">
                {isOfficial
                  ? '官方公開交流區 · 支持星空並留下寶貴建言'
                  : isFulfilled && !isExpiredFromHome
                  ? '🎉 今日全站公開同慶 · 共同沐浴達成微光'
                  : isFulfilled && isExpiredFromHome
                  ? '🔒 已換日封藏至追番牆 · 僅限許願者與支持者重溫結局'
                  : isOwner
                  ? '✨ 實時見證陌生星旅人為您投下的每一次鼓勵與加油'
                  : '⭐ 記錄您為這段夢想點亮的星光與話語'}
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
            {!canAccess ? (
              <div className="text-center py-20 px-6 flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Lock className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-amber-200">
                  {isFulfilled && isExpiredFromHome
                    ? '此活動已圓滿封藏至追番牆'
                    : '星光加油中 · 完整加油室封存中'}
                </h4>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  {isFulfilled && isExpiredFromHome
                    ? '活動達成當天已結束公開展示，現已永久封存至追番專屬空間，僅開放給許願者本人與曾投星支持者查閱。'
                    : '本心願目前正處於加油集星階段。為保護隱私，完整加油話語牆將在「活動 100% 圓滿達成」時正式開放全站見證！'}
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-24 text-xs text-zinc-500 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                正在打撈瓶中加油訊息...
              </div>
            ) : (
              <>
                {/* 創作者開箱感謝信 (審核通過後展示) */}
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
                          alt="開箱成果"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="text-xs text-purple-100 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                      {wish.thank_you_letter}
                    </p>
                  </div>
                )}

                {/* 官方見證祝福 */}
                {wish.admin_blessing && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25 text-xs text-amber-200 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">官方見證祝福：</span>
                      <span>{wish.admin_blessing}</span>
                    </div>
                  </div>
                )}

                {/* 提示正在查看自我紀錄 */}
                {canAccessSelfOnly && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-[11px] text-amber-300 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>活動集星推進中，此處呈現您為許願者投下的個人星語；心願達標時將開放全站共同見證！</span>
                  </div>
                )}

                {/* 留言清單 */}
                {displayedMessages.length === 0 ? (
                  <div className="text-center py-20 text-xs text-zinc-500">
                    目前尚無漂流瓶留言，快去投下星星並寫下第一句加油話語吧！
                  </div>
                ) : (
                  displayedMessages.map((msg) => {
                    const isMyMessage = session?.user?.id === msg.user_id;
                    const msgReaction = (msg as any).reaction;
                    const userStat = msg.user_id ? userContributionMap.get(msg.user_id) : null;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 items-start p-3.5 rounded-2xl border transition-all ${
                          msg.is_hidden
                            ? 'bg-red-950/20 border-red-500/30'
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
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-amber-200">
                                {msg.users?.anonymous_nickname || '匿名星旅人'}
                              </span>

                              {isMyMessage && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">
                                  我的話語
                                </span>
                              )}

                              {/* 🌟 贊助累計額與佔比標籤 */}
                              {!isOfficial && userStat && (
                                <span className="text-[10px] text-zinc-400 font-mono bg-white/5 px-1.5 py-0.2 rounded border border-white/10">
                                  累計投入 {userStat.total} 顆 ({userStat.percent}%)
                                </span>
                              )}
                            </div>

                            <span className="font-mono text-amber-400 font-bold text-[10px]">
                              +{msg.amount} 星塵
                            </span>
                          </div>

                          {/* 🌟 非破壞性遮蔽：違規時以紅色醒目預設提示替換內文 */}
                          {msg.is_hidden ? (
                            <p className="text-red-400 text-xs italic bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                              <span>[此加油留言因未符社群交流規範，已由管理團隊隱藏遮蔽]</span>
                            </p>
                          ) : (
                            <p className="text-zinc-200 leading-relaxed">
                              {msg.message || '(默默投下了加油星願)'}
                            </p>
                          )}

                          {msgReaction && !msg.is_hidden && (
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
                                <span className="text-[10px] text-zinc-500">審核標記：</span>
                                <button
                                  type="button"
                                  onClick={() => handleSetReaction(msg.id, '優質加油')}
                                  className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border transition-colors cursor-pointer ${
                                    msgReaction === '優質加油'
                                      ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                                      : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white'
                                  }`}
                                >
                                  <ThumbsUp className="w-2.5 h-2.5" /> 優質加油
                                </button>
                              </div>

                              {/* 遮蔽 / 還原切換 */}
                              <button
                                type="button"
                                onClick={() => handleToggleHideMessage(msg.id, msg.is_hidden)}
                                className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all ${
                                  msg.is_hidden
                                    ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                                    : 'bg-red-500/15 text-red-300 hover:bg-red-500/25'
                                }`}
                              >
                                {msg.is_hidden ? (
                                  <>
                                    <Eye className="w-3 h-3" /> 解除遮蔽
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3" /> 遮蔽留言
                                  </>
                                )}
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
            ) : isFulfilled && !isExpiredFromHome ? (
              <span>🎉 今日為達成公開慶典，明日凌晨起將永久封藏至追番空間</span>
            ) : (
              <span>純粹善意 · 每一句加油話語都點亮了前行築夢的光芒</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}