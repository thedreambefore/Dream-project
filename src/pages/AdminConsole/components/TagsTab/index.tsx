import { Tag, Trash2 } from 'lucide-react';
import { useTags } from './useTags';

export function TagsTab() {
  const { tags, name, setName, submitting, handleAdd, handleDelete } = useTags();

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-base font-bold text-amber-100 flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-300" /> 分類標籤庫管理
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          在此新增或移除的標籤將即時同步於前台篩選列與心願發布選單。
        </p>
      </div>

      <form onSubmit={handleAdd} className="glass rounded-2xl p-4 glow-border flex gap-3 items-center bg-zinc-900/60 border border-amber-400/20">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="輸入新標籤名稱 (例如：數位創作、課業微光)"
          className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
          required
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
        >
          {submitting ? '新增中...' : '+ 新增標籤'}
        </button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {tags.map((t) => (
          <div key={t.id} className="glass rounded-xl p-3 flex justify-between items-center text-xs border border-white/5 bg-zinc-900/40">
            <span className="text-amber-200 font-medium">#{t.name}</span>
            <button
              onClick={() => handleDelete(t.id, t.name)}
              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              title="刪除標籤"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}