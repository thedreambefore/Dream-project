// src/pages/HomePage/components/TagFilterBar.tsx
import type { TagFilterBarProps } from '../types';

export function TagFilterBar({ activeTag, tags, onSelectTag }: TagFilterBarProps) {
  return (
    <div className="flex gap-2.5 overflow-x-auto pb-4 hide-scrollbar mb-10 border-b border-white/5 flex-nowrap">
      <button
        onClick={() => onSelectTag('全部故事')}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-300 cursor-pointer ${
          activeTag === '全部故事'
            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-bold'
            : 'bg-zinc-900/60 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-slate-200'
        }`}
      >
        全部故事
      </button>

      {tags.map((t) => {
        const tagNameWithHash = `#${t.name}`;
        const isActive = activeTag === tagNameWithHash;

        return (
          <button
            key={t.id}
            onClick={() => onSelectTag(tagNameWithHash)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-300 cursor-pointer ${
              isActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] font-bold'
                : 'bg-zinc-900/60 text-slate-400 border-white/10 hover:border-amber-400/30 hover:text-slate-200'
            }`}
          >
            #{t.name}
          </button>
        );
      })}
    </div>
  );
}