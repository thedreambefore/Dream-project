// src/pages/AdminConsole/components/AnnouncementsTab/components/AnnouncementPublishForm.tsx
import { Megaphone, Plus, Loader2 } from 'lucide-react';

interface Props {
  title: string;
  setTitle: (v: string) => void;
  body: string;
  setBody: (v: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AnnouncementPublishForm({
  title,
  setTitle,
  body,
  setBody,
  isSubmitting,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="glass rounded-2xl p-5 glow-border space-y-3.5 bg-zinc-900/60 border border-amber-400/20">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-200">
        <Plus className="w-4 h-4 text-amber-400" /> 發布新公告
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">公告主標題 (建議 15~25 字)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例如：星空心願回饋活動正式上線！"
          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
          required
        />
      </div>

      <div>
        <label className="text-xs text-zinc-400 block mb-1">公告內文說明 (固定規格展示)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="請輸入欲廣播給所有星旅人的詳細溫暖訊息..."
          rows={2}
          className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50 resize-none"
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-zinc-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
        即刻部署發布至首頁廣播站
      </button>
    </form>
  );
}