// src/pages/AdminConsole/components/ModerationTab/components/ReportedList.tsx
import type { Wish } from '@/types/wish';

interface Props {
  reportedWishes: Wish[];
  onDismiss: (id: string) => void;
  onBlock: (id: string, reason: string) => void;
}

export function ReportedList({ reportedWishes, onDismiss, onBlock }: Props) {
  if (reportedWishes.length === 0) {
    return <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">目前無被檢舉卡片。</div>;
  }

  return (
    <div className="space-y-3">
      {reportedWishes.map((story) => (
        <div key={story.id} className="glass rounded-2xl p-4 border border-red-500/30 bg-red-950/15 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-amber-100 text-sm">{story.product_name}</h4>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onDismiss(story.id)} className="px-2.5 py-1 text-xs bg-zinc-800 text-zinc-300 rounded-lg cursor-pointer">駁回檢舉</button>
              <button onClick={() => onBlock(story.id, story.report_reason || '檢舉違規')} className="px-2.5 py-1 text-xs bg-red-500 text-white font-bold rounded-lg cursor-pointer">確認下架</button>
            </div>
          </div>
          <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded-lg">檢舉理由：{story.report_reason || '內容不符規範'}</p>
        </div>
      ))}
    </div>
  );
}