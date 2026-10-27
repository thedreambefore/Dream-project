// src/components/WishCard/components/WishCardModals.tsx
import { lazy, Suspense } from 'react';
import { ActionModal } from './ActionModal';
import type { Wish } from '@/types/wish';

const InvestModal = lazy(() => import('../../InvestModal').then((m) => ({ default: m.InvestModal })));
const DriftBottleModal = lazy(() => import('../../DriftBottleModal').then((m) => ({ default: m.DriftBottleModal })));

interface Props {
  wish: Wish;
  progress: number;
  isFulfilled: boolean;
  isAdmin: boolean;
  showActionModal: boolean;
  actionReason: string;
  isActionLoading: boolean;
  showInvest: boolean;
  showDriftModal: boolean;
  setActionReason: (val: string) => void;
  onCloseActionModal: () => void;
  onConfirmAction: () => void;
  onCloseInvest: () => void;
  onCloseDriftModal: () => void;
}

export function WishCardModals({
  wish,
  progress,
  isFulfilled,
  isAdmin,
  showActionModal,
  actionReason,
  isActionLoading,
  showInvest,
  showDriftModal,
  setActionReason,
  onCloseActionModal,
  onConfirmAction,
  onCloseInvest,
  onCloseDriftModal,
}: Props) {
  return (
    <>
      {showActionModal && (
        <ActionModal
          isAdmin={isAdmin}
          actionReason={actionReason}
          isActionLoading={isActionLoading}
          setActionReason={setActionReason}
          onClose={onCloseActionModal}
          onConfirm={onConfirmAction}
        />
      )}

      {showInvest && (
        <Suspense fallback={null}>
          <InvestModal story={wish} onClose={onCloseInvest} />
        </Suspense>
      )}

      {showDriftModal && (
        <Suspense fallback={null}>
          <DriftBottleModal wish={wish} progress={progress} isFulfilled={isFulfilled} onClose={onCloseDriftModal} />
        </Suspense>
      )}
    </>
  );
}