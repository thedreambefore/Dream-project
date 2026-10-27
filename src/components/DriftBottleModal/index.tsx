// src/components/DriftBottleModal/index.tsx
import { createPortal } from 'react-dom';
import { X, MessageSquare } from 'lucide-react';
import { WishSidebar } from './components/WishSidebar';
import { MessageList } from './components/MessageList';
import { useDriftBottleModal } from './useDriftBottleModal';
import type { DriftBottleModalProps } from './types';

export function DriftBottleModal({ wish, isFulfilled, onClose }: DriftBottleModalProps) {
  const d = useDriftBottleModal(wish, isFulfilled);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="max-w-4xl w-full h-[620px] flex flex-col md:flex-row gap-4 items-center justify-center" onClick={(e) => e.stopPropagation()}>
        <WishSidebar wish={wish} isOfficial={d.isOfficial} isFulfilled={isFulfilled} progressPercent={d.progressPercent} currentStardust={d.currentStardust} targetStardust={d.targetStardust} />

        <div className="flex-1 w-full h-full rounded-3xl glass-strong border border-white/10 bg-zinc-900/95 flex flex-col justify-between overflow-hidden shadow-2xl relative">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
            <div>
              <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                {d.modalTitles.title}
              </h4>
              <p className="text-[10px] text-zinc-400">{d.modalTitles.subtitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 hide-scrollbar">
            <MessageList wish={wish} canAccess={d.canAccess} canAccessSelfOnly={d.canAccessSelfOnly} isExpiredFromHome={d.isExpiredFromHome} loading={d.loading} displayedMessages={d.displayedMessages} userContributionMap={d.userContributionMap} isOfficial={d.isOfficial} isAdmin={d.isAdmin} currentUserId={d.session?.user?.id} onSetReaction={d.handleSetReaction} onToggleHideMessage={d.handleToggleHideMessage} />
          </div>

          <div className="p-3 bg-black/60 border-t border-white/5 text-center text-[11px] text-zinc-500">
            <span>{d.modalTitles.footer}</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DriftBottleModal;