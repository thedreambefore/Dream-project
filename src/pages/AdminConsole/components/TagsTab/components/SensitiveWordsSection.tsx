// src/pages/AdminConsole/components/TagsTab/components/SensitiveWordsSection.tsx
import { ShieldAlert, Trash2, Plus } from 'lucide-react';
import type { SensitiveWord } from '@/types/wish';

interface Props {
  words: SensitiveWord[];
  inputWord: string;
  setInputWord: (v: string) => void;
  loading: boolean;
  submitting: boolean;
  onAdd: (e: React.FormEvent) => void;
  onDelete: (id: string, word: string) => void;
}

export function SensitiveWordsSection({
  words,
  inputWord,
  setInputWord,
  loading,
  submitting,
  onAdd,
  onDelete,
}: Props) {
  return (
    <div className="space-y-3 pt-6 border-t border-white/10">
      <div>
        <h3 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-amber-400" /> 全站自訂敏感詞 / 違禁詞庫
        </h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          發布願望時系統將即時比對，阻斷任何包含以下關鍵字的標題、故事與承諾。
        </p>
      </div>

      <form onSubmit={onAdd} className="glass rounded-xl p-3 flex gap-2 items-center bg-zinc-900/60 border border-white/10">
        <input
          type="text"
          value={inputWord}
          onChange={(e) => setInputWord(e.target.value)}
          placeholder="輸入欲封鎖的違禁詞 (如：借款、合資、保證獲利)"
          className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-200 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" /> 新增封鎖詞
        </button>
      </form>

      {loading ? (
        <div className="text-center py-4 text-xs text-zinc-500">同步詞庫中...</div>
      ) : words.length === 0 ? (
        <div className="text-center py-6 border border-white/5 rounded-xl bg-zinc-900/20 text-zinc-500 text-xs">
          目前使用系統內建核心違禁詞（代購、眾籌、募資、詐騙等）。
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {words.map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-mono"
            >
              <span>{w.word}</span>
              <button
                type="button"
                onClick={() => onDelete(w.id, w.word)}
                className="text-red-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
                title="移除此敏感詞"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}