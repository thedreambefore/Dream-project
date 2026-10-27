// src/pages/AdminConsole/components/ModerationTab/components/FulfilledShippingList.tsx
import { Package } from 'lucide-react';
import type { Wish } from '@/types/wish';

interface Props {
  fulfilledWishes: Wish[];
  onOpenShipping: (story: Wish) => void;
}

export function FulfilledShippingList({ fulfilledWishes, onOpenShipping }: Props) {
  if (fulfilledWishes.length === 0) {
    return <div className="text-center py-16 text-zinc-500 border border-white/5 rounded-2xl bg-zinc-900/20 text-xs">目前暫無滿額待出貨項目。</div>;
  }

  return (
    <div className="space-y-3">
      {fulfilledWishes.map((story) => (
        <div key={story.id} className="glass rounded-2xl p-5 border border-emerald-500/30 bg-emerald-950/15 flex justify-between items-center gap-4">
          <div>
            <span className="text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">活動 100% 達成</span>
            <h3 className="font-bold text-amber-100 text-sm mt-2">{story.product_name}</h3>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">累積總額: NT$ {story.current_stardust.toLocaleString()} / NT$ {story.product_price.toLocaleString()}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {story.product_url && (
              <a href={story.product_url} target="_blank" rel="noreferrer" className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700 flex items-center gap-1 cursor-pointer">查看商品</a>
            )}
            <button onClick={() => onOpenShipping(story)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer">
              <Package className="w-3.5 h-3.5" /> 審核留言並確認出貨
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}