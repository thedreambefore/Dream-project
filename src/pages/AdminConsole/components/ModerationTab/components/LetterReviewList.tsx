// src/pages/AdminConsole/components/ModerationTab/components/LetterReviewList.tsx
import type { Wish } from '@/types/wish';

interface Props {
  pendingLetters: Wish[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function LetterReviewList({ pendingLetters, onApprove, onReject }: Props) {
  if (pendingLetters.length === 0) {
    return <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">目前無待審核的開箱感謝信。</div>;
  }

  return (
    <div className="space-y-3">
      {pendingLetters.map((story) => (
        <div key={story.id} className="glass rounded-2xl p-5 border border-purple-500/30 bg-purple-950/10 space-y-3">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="text-[11px] font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">創作者已提交開箱信待審</span>
              <h3 className="font-bold text-amber-100 text-sm mt-2">{story.product_name}</h3>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => onReject(story.id)} className="px-3 py-1.5 bg-red-500/20 border border-red-500/40 text-red-300 rounded-lg text-xs font-bold hover:bg-red-500/30 cursor-pointer">駁回修改</button>
              <button onClick={() => onApprove(story.id)} className="px-3 py-1.5 bg-purple-500 text-zinc-950 font-bold rounded-lg text-xs hover:bg-purple-400 cursor-pointer">審核通過並公開</button>
            </div>
          </div>

          {story.unboxing_photo_url && (
            <div className="h-44 max-w-sm rounded-xl overflow-hidden border border-white/10">
              <img src={story.unboxing_photo_url} alt="開箱照" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-zinc-200 leading-relaxed">
            <p className="font-bold text-zinc-400 mb-1">【創作者感謝信內文】</p>
            {story.thank_you_letter || '(無內文)'}
          </div>
        </div>
      ))}
    </div>
  );
}