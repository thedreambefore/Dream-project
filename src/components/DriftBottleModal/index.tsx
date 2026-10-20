// src/components/DriftBottleModal/index.tsx
import { createPortal } from 'react-dom';
import { X, MessageSquare } from 'lucide-react';
import { WishSidebar } from './components/WishSidebar';
import { MessageList } from './components/MessageList';
import { useDriftBottleModal } from './useDriftBottleModal';
import type { DriftBottleModalProps } from './types';

export function DriftBottleModal({ wish, isFulfilled, onClose }: DriftBottleModalProps) {
  const {
    isOfficial,
    isOwner,
    currentStardust,
    targetStardust,
    progressPercent,
    isExpiredFromHome,
    canAccess,
    canAccessSelfOnly,
    loading,
    displayedMessages,
    userContributionMap,
    isAdmin,
    session,
    handleSetReaction,
    handleToggleHideMessage,
  } = useDriftBottleModal(wish, isFulfilled);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-4xl w-full h-[620px] flex flex-col md:flex-row gap-4 items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <WishSidebar
          wish={wish}
          isOfficial={isOfficial}
          isFulfilled={isFulfilled}
          progressPercent={progressPercent}
          currentStardust={currentStardust}
          targetStardust={targetStardust}
        />

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
            <MessageList
              wish={wish}
              canAccess={canAccess}
              canAccessSelfOnly={canAccessSelfOnly}
              isExpiredFromHome={isExpiredFromHome}
              loading={loading}
              displayedMessages={displayedMessages}
              userContributionMap={userContributionMap}
              isOfficial={isOfficial}
              isAdmin={isAdmin}
              currentUserId={session?.user?.id}
              onSetReaction={handleSetReaction}
              onToggleHideMessage={handleToggleHideMessage}
            />
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

export default DriftBottleModal;