import { createPortal } from 'react-dom';
import { X, Edit3, Loader2 } from 'lucide-react';

interface Props {
  editTitle: string;
  setEditTitle: (val: string) => void;
  editBody: string;
  setEditBody: (val: string) => void;
  isSavingEdit: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function EditAnnouncementModal({
  editTitle,
  setEditTitle,
  editBody,
  setEditBody,
  isSavingEdit,
  onClose,
  onSave,
}: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="glass-strong rounded-3xl w-full max-w-lg p-6 glow-border border-amber-400/30 bg-zinc-950 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-base font-bold text-amber-200 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-400" /> 編輯公告內容
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">公告主標題</label>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
            required
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">公告內文說明</label>
          <textarea
            rows={3}
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50 resize-none"
            required
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
            disabled={isSavingEdit}
            onClick={onSave}
            className="flex-1 py-2.5 text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isSavingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : '確認並儲存修改'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}