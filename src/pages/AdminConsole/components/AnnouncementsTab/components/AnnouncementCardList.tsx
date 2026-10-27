// src/pages/AdminConsole/components/AnnouncementsTab/components/AnnouncementCardList.tsx
import { Edit3, Trash2 } from 'lucide-react';
import type { Announcement } from '@/types/wish';

interface Props {
  announcements: Announcement[];
  loading: boolean;
  onToggle: (ann: Announcement) => void;
  onOpenEdit: (ann: Announcement) => void;
  onDelete: (id: string) => void;
}

export function AnnouncementCardList({
  announcements,
  loading,
  onToggle,
  onOpenEdit,
  onDelete,
}: Props) {
  if (loading) return <div className="text-center py-10 text-zinc-500 text-xs">載入公告清單中...</div>;
  if (announcements.length === 0) {
    return <div className="text-center py-12 border border-white/5 rounded-2xl bg-zinc-900/20 text-zinc-500 text-xs">目前暫無自訂公告，首頁正呈現官方預設備用廣播。</div>;
  }

  return (
    <div className="space-y-3">
      {announcements.map((ann) => (
        <div
          key={ann.id}
          className={`glass rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border transition-all ${
            ann.is_active ? 'border-amber-400/20 bg-zinc-900/50' : 'border-white/5 bg-zinc-950/40 opacity-70'
          }`}
        >
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${
                ann.is_active ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-white/10'
              }`}>
                {ann.is_active ? '輪播中' : '已停用'}
              </span>
              <h4 className="font-bold text-amber-100 text-sm">{ann.title}</h4>
            </div>
            <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">{ann.body}</p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              type="button"
              onClick={() => onToggle(ann)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                ann.is_active ? 'bg-zinc-800 border-white/10 text-zinc-300 hover:bg-zinc-700' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              {ann.is_active ? '停用' : '啟用'}
            </button>
            <button
              type="button"
              onClick={() => onOpenEdit(ann)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 border border-amber-400/30 text-amber-200 hover:bg-amber-500/25 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> 編輯
            </button>
            <button
              type="button"
              onClick={() => onDelete(ann.id)}
              className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}