// src/components/LeaderboardWidget/components/RankBoard.tsx
import type { BoardTab, BoardUserItem } from '../types';

interface Props {
  activeBoard: BoardTab;
  currentList: BoardUserItem[];
}

export function RankBoard({ activeBoard, currentList }: Props) {
  const description =
    activeBoard === 'fulfilled'
      ? '圓滿引路榜 · 故事履約見證榮譽總量 (TOP 3)'
      : activeBoard === 'inTransit'
      ? '在途守護榜 · 陪伴心願推進中在途燃料 (TOP 3)'
      : '星空守護榜 · 支持夢沙星空伺服器與維運之守護者 (TOP 3)';

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-zinc-400 px-1 font-bold">{description}</div>

      {currentList.length === 0 ? (
        <div className="text-center py-8 text-xs text-zinc-500 border border-white/5 rounded-xl bg-zinc-900/30">
          虛位以待，等待第一顆引路星點亮
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {currentList.map((item, idx) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <span className={`font-mono font-black text-sm w-4 text-center ${idx === 0 ? 'text-amber-300' : idx === 1 ? 'text-slate-300' : 'text-amber-600'}`}>
                  {idx + 1}
                </span>
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-[10px]">
                  {item.anonymous_nickname.substring(0, 1)}
                </div>
                <span className="text-zinc-200 truncate max-w-[90px] font-medium">{item.anonymous_nickname}</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-amber-300 font-bold">✨ {Number(item.amount || 0).toLocaleString()}</span>
                <span className="text-[10px] text-zinc-500 ml-1">星塵</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}