// src/components/WishCard/index.tsx
import { lazy, Suspense } from 'react';
import { CardFront } from './components/CardFront';
import { CardBack } from './components/CardBack';
import { ActionModal } from './components/ActionModal';
import { useWishCard } from './useWishCard';
import type { WishCardProps } from './types';

const InvestModal = lazy(() => import('../InvestModal').then((m) => ({ default: m.InvestModal })));
const DriftBottleModal = lazy(() => import('../DriftBottleModal').then((m) => ({ default: m.DriftBottleModal })));

export function WishCard({
  wish,
  index = 0,
  variant = 'market',
  onOpenLetterModal,
  onOpenEditModal,
  onCardDeleted,
  onWishUpdated, // 👈 1. 解構出來
}: WishCardProps) {
  const {
    cardContainerRef,
    isFlipped,
    setIsFlipped,
    isBookmarked,
    showInvest,
    setShowInvest,
    showDriftModal,
    setShowDriftModal,
    showActionModal,
    setShowActionModal,
    actionReason,
    setActionReason,
    isActionLoading,
    isOfficial,
    targetPrice,
    localStardust,
    progress,
    isFulfilled,
    isOverFunded,
    isExactlyFunded,
    isNearComplete,
    isCardShining,
    tier,
    isAdmin,
    session,
    handleMouseMove,
    handleMouseLeave,
    handleToggleBookmark,
    handleConfirmAction,
    handleDeleteCard,
    handleInvestClosed,
  } = useWishCard(wish, onCardDeleted, onWishUpdated); // 👈 2. 傳入 Hook

  return (
    <>
      <div
        ref={cardContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => setIsFlipped((prev) => !prev)}
        className="holo-card perspective-1000 w-full h-[430px] select-none cursor-pointer group transition-transform duration-200 ease-out"
        style={{
          transform: `perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))`,
          animationDelay: `${index * 0.05}s`,
        }}
      >
        <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ease-out ${isFlipped ? 'rotate-y-180' : ''}`}>
          <CardFront
            wish={wish}
            tier={tier}
            isOfficial={isOfficial}
            isCardShining={isCardShining}
            isOverFunded={isOverFunded}
            isExactlyFunded={isExactlyFunded}
            isNearComplete={isNearComplete}
            progress={progress}
            localStardust={localStardust}
            targetPrice={targetPrice}
          />
          <CardBack
            wish={wish}
            variant={variant}
            progress={progress}
            isOfficial={isOfficial}
            isFulfilled={isFulfilled}
            isBookmarked={isBookmarked}
            isAdmin={isAdmin}
            userId={session?.user?.id}
            onToggleBookmark={handleToggleBookmark}
            onDeleteCard={handleDeleteCard}
            onOpenDriftModal={(e) => {
              e.stopPropagation();
              setShowDriftModal(true);
            }}
            onOpenActionModal={(e) => {
              e.stopPropagation();
              setShowActionModal(true);
            }}
            onOpenInvestModal={(e) => {
              e.stopPropagation();
              setShowInvest(true);
            }}
            onOpenLetterModal={onOpenLetterModal}
            onOpenEditModal={onOpenEditModal}
          />
        </div>
      </div>

      {showActionModal && (
        <ActionModal
          isAdmin={isAdmin}
          actionReason={actionReason}
          isActionLoading={isActionLoading}
          setActionReason={setActionReason}
          onClose={() => setShowActionModal(false)}
          onConfirm={handleConfirmAction}
        />
      )}

      {showInvest && (
        <Suspense fallback={null}>
          <InvestModal story={wish} onClose={handleInvestClosed} />
        </Suspense>
      )}

      {showDriftModal && (
        <Suspense fallback={null}>
          <DriftBottleModal wish={wish} progress={progress} isFulfilled={isFulfilled} onClose={() => setShowDriftModal(false)} />
        </Suspense>
      )}
    </>
  );
}

export default WishCard;