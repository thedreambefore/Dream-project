// src/pages/AdminConsole/components/PendingTab/components/PendingCardList.tsx
import { Check, ExternalLink } from 'lucide-react';
import type { Wish } from '@/types/wish';

interface Props {
  stories: Wish[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function PendingCardList({ stories, onApprove, onReject }: Props) {
  if (stories.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">
        目前所有心願皆已完成審核。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stories.map((story) => (
        <div key={story.id} className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-900/60 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-amber-100 text-sm">{story.product_name}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 font-mono">
                <span className="text-amber-300 font-sans">#{story.tag_name}</span>
                <span>•</span>
                <span>目標 NT$ {story.product_price.toLocaleString()}</span>
                <span>•</span>
                <span>{new Date(story.created_at).toLocaleDateString('zh-TW')}</span>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => onApprove(story.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> 通過上架
              </button>
              <button
                onClick={() => onReject(story.id)}
                className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs transition-all cursor-pointer"
              >
                駁回
              </button>
            </div>
          </div>

          <div className="bg-black/40 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed border border-white/5">
            <p className="font-bold text-zinc-400 mb-1">【故事內文】</p>
            {story.story_text}
            <p className="font-bold text-zinc-400 mt-2 mb-0.5">【終章承諾】</p>
            <span className="text-amber-200/90">{story.promise_text}</span>
          </div>

          {story.product_url && (
            <div className="flex items-center gap-2 text-xs text-sky-300 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="flex-shrink-0">電商驗證連結：</span>
              <a href={story.product_url} target="_blank" rel="noreferrer" className="underline truncate max-w-md">
                {story.product_url}
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}