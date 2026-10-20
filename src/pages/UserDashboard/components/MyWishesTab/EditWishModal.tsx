import { createPortal } from 'react-dom';

interface Props {
  editTitle: string;
  setEditTitle: (val: string) => void;
  editPrice: number;
  setEditPrice: (val: number) => void;
  editProductUrl: string;
  setEditProductUrl: (val: string) => void;
  editStory: string;
  setEditStory: (val: string) => void;
  editPromise: string;
  setEditPromise: (val: string) => void;
  savingEdit: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function EditWishModal({
  editTitle,
  setEditTitle,
  editPrice,
  setEditPrice,
  editProductUrl,
  setEditProductUrl,
  editStory,
  setEditStory,
  editPromise,
  setEditPromise,
  savingEdit,
  onClose,
  onSubmit,
}: Props) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-strong rounded-2xl w-full max-w-lg p-6 glow-border border-amber-400/30 bg-zinc-950 space-y-4 my-auto">
        <h3 className="text-base font-bold text-amber-200">修正內容重新送審</h3>
        <div>
          <label className="text-xs text-zinc-400 block mb-1">願望標題 (限 20 字)</label>
          <input
            type="text"
            maxLength={20}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">目標星塵 (NT$)</label>
            <input
              type="number"
              min={50}
              max={20000}
              value={editPrice}
              onChange={(e) => setEditPrice(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-amber-300 font-mono"
              required
            />
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">電商連結</label>
            <input
              type="url"
              value={editProductUrl}
              onChange={(e) => setEditProductUrl(e.target.value)}
              placeholder="https://..."
              className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">故事內文 (限 200 字)</label>
          <textarea
            rows={4}
            maxLength={200}
            value={editStory}
            onChange={(e) => setEditStory(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
            required
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">終章承諾</label>
          <input
            type="text"
            value={editPromise}
            onChange={(e) => setEditPromise(e.target.value)}
            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-white"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={savingEdit}
            className="flex-1 py-2.5 text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl cursor-pointer disabled:opacity-50"
          >
            {savingEdit ? '提交中...' : '確認更新並重新送審'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}