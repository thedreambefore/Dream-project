import { createPortal } from 'react-dom';

interface Props {
  thankYouLetter: string;
  setThankYouLetter: (val: string) => void;
  unboxingPhoto: string | null;
  setUnboxingPhoto: (val: string | null) => void;
  compressingPhoto: boolean;
  savingLetter: boolean;
  onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export function LetterModal({
  thankYouLetter,
  setThankYouLetter,
  unboxingPhoto,
  setUnboxingPhoto,
  compressingPhoto,
  savingLetter,
  onPhotoUpload,
  onClose,
  onSubmit,
}: Props) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="glass-strong rounded-2xl w-full max-w-lg p-6 glow-border border-purple-500/30 bg-zinc-950 space-y-4 my-auto">
        <h3 className="text-base font-bold text-purple-300">💌 發布開箱感謝信 (需經管理員審核)</h3>
        <p className="text-xs text-zinc-400">
          審核通過後將公開於所有支持者的追番牆，審核期間將鎖定無法隨意變更。
        </p>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">開箱成果照片 (可選)</label>
          <input
            type="file"
            accept="image/*"
            onChange={onPhotoUpload}
            className="block w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-purple-500/20 file:text-purple-300"
          />
          {compressingPhoto && <p className="text-[10px] text-amber-300 mt-1">⏳ 照片壓縮中...</p>}
          {unboxingPhoto && (
            <div className="mt-2 relative h-32 rounded-xl overflow-hidden border border-white/10">
              <img src={unboxingPhoto} alt="預覽" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setUnboxingPhoto(null)}
                className="absolute top-2 right-2 bg-black/70 text-red-400 text-xs px-2 py-0.5 rounded-md cursor-pointer"
              >
                刪除
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-zinc-400 block mb-1">感謝信內文</label>
          <textarea
            rows={4}
            value={thankYouLetter}
            onChange={(e) => setThankYouLetter(e.target.value)}
            placeholder="誠摯感謝每位陌生人星光的相助... 請分享您收到商品的心得與實現承諾的成果！"
            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white resize-none"
            required
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 cursor-pointer"
          >
            取消
          </button>
          <button
            onClick={onSubmit}
            disabled={savingLetter || compressingPhoto}
            className="flex-1 py-2.5 text-xs bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold rounded-xl cursor-pointer disabled:opacity-50"
          >
            {savingLetter ? '送出中...' : '提交審查'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}