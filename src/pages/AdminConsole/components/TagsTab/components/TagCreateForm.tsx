// src/pages/AdminConsole/components/TagsTab/components/TagCreateForm.tsx

interface Props {
  name: string;
  setName: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function TagCreateForm({ name, setName, submitting, onSubmit }: Props) {
  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl p-4 glow-border flex gap-3 items-center bg-zinc-900/60 border border-amber-400/20">
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
  );
}