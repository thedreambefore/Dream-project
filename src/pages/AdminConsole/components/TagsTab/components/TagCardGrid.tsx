// src/pages/AdminConsole/components/TagsTab/components/TagCardGrid.tsx
import { Trash2 } from 'lucide-react';
import type { Tag } from '@/types/wish';

interface Props {
  tags: Tag[];
  onDelete: (id: string, name: string) => void;
}

export function TagCardGrid({ tags, onDelete }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {tags.map((t) => (
        <div key={t.id} className="glass rounded-xl p-3 flex justify-between items-center text-xs border border-white/5 bg-zinc-900/40">
          <span className="text-amber-200 font-medium">#{t.name}</span>
          <button
            onClick={() => onDelete(t.id, t.name)}
            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer flex-shrink-0"
            title="刪除標籤"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}