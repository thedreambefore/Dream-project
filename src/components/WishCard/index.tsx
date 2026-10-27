// src/components/WishCard/index.tsx
import { CardFront } from './components/CardFront';
import { CardBack } from './components/CardBack';
import { WishCardModals } from './components/WishCardModals';
import { useWishCard } from './useWishCard';
import type { WishCardProps } from './types';

export function WishCard({ wish, index = 0, variant = 'market', onOpenLetterModal, onOpenEditModal, onCardDeleted, onWishUpdated }: WishCardProps) {
  const c = useWishCard(wish, onCardDeleted, onWishUpdated);

  return (
    <>
      <div
        ref={c.cardContainerRef}
        onMouseMove={c.handleMouseMove}
        onMouseLeave={c.handleMouseLeave}
        onClick={() => c.setIsFlipped((p) => !p)}
        className="holo-card perspective-1000 w-full h-[430px] select-none cursor-pointer group transition-transform duration-200 ease-out"
        style={{ transform: `perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg))`, animationDelay: `${index * 0.05}s` }}
      >
        <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ease-out ${c.isFlipped ? 'rotate-y-180' : ''}`}>
          <CardFront wish={wish} tier={c.tier} isOfficial={c.isOfficial} isCardShining={c.isCardShining} isOverFunded={c.isOverFunded} isExactlyFunded={c.isExactlyFunded} isNearComplete={c.isNearComplete} progress={c.progress} localStardust={c.localStardust} targetPrice={c.targetPrice} />
          <CardBack wish={wish} variant={variant} progress={c.progress} isOfficial={c.isOfficial} isFulfilled={c.isFulfilled} isBookmarked={c.isBookmarked} isAdmin={c.isAdmin} userId={c.session?.user?.id} onToggleBookmark={c.handleToggleBookmark} onDeleteCard={c.handleDeleteCard} onOpenDriftModal={(e) => { e.stopPropagation(); c.setShowDriftModal(true); }} onOpenActionModal={(e) => { e.stopPropagation(); c.setShowActionModal(true); }} onOpenInvestModal={c.handleOpenInvest} onOpenLetterModal={onOpenLetterModal} onOpenEditModal={onOpenEditModal} />
        </div>
      </div>

      <WishCardModals
        wish={wish} progress={c.progress} isFulfilled={c.isFulfilled} isAdmin={c.isAdmin}
        showActionModal={c.showActionModal} actionReason={c.actionReason} isActionLoading={c.isActionLoading}
        showInvest={c.showInvest} showDriftModal={c.showDriftModal}
        setActionReason={c.setActionReason} onCloseActionModal={() => c.setShowActionModal(false)}
        onConfirmAction={c.handleConfirmAction} onCloseInvest={c.handleInvestClosed}
        onCloseDriftModal={() => c.setShowDriftModal(false)}
      />
    </>
  );
}

export default WishCard;