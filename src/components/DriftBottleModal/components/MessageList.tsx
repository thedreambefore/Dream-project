// src/components/DriftBottleModal/components/MessageList.tsx
import {
  Lock,
  Loader2,
  MailCheck,
  Sparkles,
  Clock,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  ThumbsUp,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Wish, Investment } from '@/types/wish';
import type { UserContributionStat } from '../types';

interface Props {
  wish: Wish;
  canAccess: boolean;
  canAccessSelfOnly: boolean;
  isExpiredFromHome: boolean;
  loading: boolean;
  displayedMessages: Investment[];
  userContributionMap: Map<string, UserContributionStat>;
  isOfficial: boolean;
  isAdmin: boolean;
  currentUserId?: string;
  onSetReaction: (msgId: string, tag: string) => void;
  onToggleHideMessage: (msgId: string, currentHidden: boolean) => void;
}

export function MessageList({
  wish,
  canAccess,
  canAccessSelfOnly,
  isExpiredFromHome,
  loading,
  displayedMessages,
  userContributionMap,
  isOfficial,
  isAdmin,
  currentUserId,
  onSetReaction,
  onToggleHideMessage,
}: Props) {
  if (!canAccess) {
    return (
      <div className="text-center py-20 px-6 flex flex-col items-center justify-center gap-3">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
          <Lock className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-bold text-amber-200">
          {isExpiredFromHome ? '此活動已圓滿封藏至追番牆' : '星光加油中 · 完整加油室封存中'}
        </h4>
        <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
          {isExpiredFromHome
            ? '活動達成當天已結束公開展示，現已永久封存至追番專屬空間，僅開放給許願者本人與曾投星支持者查閱。'
            : '本心願目前正處於加油集星階段。為保護隱私，完整加油話語牆將在「活動 100% 圓滿達成」時正式開放全站見證！'}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-24 text-xs text-zinc-500 flex flex-col items-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
        正在打撈瓶中加油訊息...
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
              <img src={wish.unboxing_photo_url} alt="開箱成果" className="w-full h-full object-cover" />
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

      {/* 僅查看個人記錄提示 */}
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
          const isMyMessage = currentUserId === msg.user_id;
          const msgReaction = (msg as { reaction?: string }).reaction;
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
                {isMyMessage ? <UserCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
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

                {/* 非破壞性遮蔽：違規以醒目規範警語替代 */}
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
                        onClick={() => onSetReaction(msg.id, '優質加油')}
                        className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border transition-colors cursor-pointer ${
                          msgReaction === '優質加油'
                            ? 'bg-amber-500/30 border-amber-400 text-amber-200'
                            : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-2.5 h-2.5" /> 優質加油
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onToggleHideMessage(msg.id, msg.is_hidden)}
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
    </div>
  );
}