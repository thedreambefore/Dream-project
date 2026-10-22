// src/pages/UserDashboard/components/AccountTab/components/IdVerificationBox.tsx
import { ShieldAlert, Lock, Edit3, X } from 'lucide-react';

interface Props {
  hasStoredId: boolean;
  isEditingId: boolean;
  storedMaskedId: string;
  newIdInput: string;
  setNewIdInput: (val: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export function IdVerificationBox({
  hasStoredId,
  isEditingId,
  storedMaskedId,
  newIdInput,
  setNewIdInput,
  onStartEdit,
  onCancelEdit,
}: Props) {
  return (
    <div className="bg-black/40 border border-amber-400/25 rounded-2xl p-4 space-y-2.5">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>身分證字號（依所得稅法規定，活動贈禮滿千申報必填）</span>
        </label>
        {hasStoredId && !isEditingId && (
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            ✓ 已加密留存
          </span>
        )}
      </div>

      {!isEditingId && hasStoredId ? (
        <div className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5">
          <span className="font-mono text-sm tracking-widest text-zinc-300 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            {storedMaskedId}
          </span>
          <button
            type="button"
            onClick={onStartEdit}
            className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer underline"
          >
            <Edit3 className="w-3 h-3" /> 修改身分證
          </button>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={10}
              value={newIdInput}
              onChange={(e) => setNewIdInput(e.target.value.toUpperCase())}
              placeholder="請輸入身分證字號 (例如：A123456789)"
              className="flex-1 bg-zinc-900 border border-amber-400/40 rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest text-amber-200 focus:outline-none focus:border-amber-400"
              autoFocus={isEditingId && hasStoredId}
            />
            {hasStoredId && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> 取消
              </button>
            )}
          </div>
          <p className="text-[11px] text-zinc-500">
            1 碼大寫英文字母 ＋ 9 碼數字。資料將經由高強度金鑰加密儲存。
          </p>
        </div>
      )}
    </div>
  );
}