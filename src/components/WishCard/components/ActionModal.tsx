// src/components/WishCard/components/ActionModal.tsx
import { createPortal } from 'react-dom';
import { ShieldAlert, Flag, X, Loader2 } from 'lucide-react';

interface Props {
  isAdmin: boolean;
  actionReason: string;
  isActionLoading: boolean;
  setActionReason: (val: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function ActionModal({
  isAdmin,
  actionReason,
  isActionLoading,
  setActionReason,
  onClose,
  onConfirm,
}: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="glass-strong rounded-3xl w-full max-w-md p-6 glow-border bg-zinc-950 border border-amber-400/30 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
            {isAdmin ? (
              <>
                <ShieldAlert className="w-5 h-5 text-red-400" /> 管理員即刻下架願望
              </>
            ) : (
              <>
                <Flag className="w-5 h-5 text-amber-400" /> 檢舉回報此願望
              </>
            )}
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">請填寫理由：</label>
          <textarea
            rows={3}
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="請填寫具體原由..."
            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
            autoFocus
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            disabled={isActionLoading || !actionReason.trim()}
            onClick={onConfirm}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              isAdmin
                ? 'bg-red-500 hover:bg-red-400 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
            }`}
          >
            {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '確認送出'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}