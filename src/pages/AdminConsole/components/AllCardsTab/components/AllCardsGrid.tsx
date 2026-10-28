// src/pages/AdminConsole/components/AllCardsTab/components/AllCardsGrid.tsx
import { WishCard } from '@/components/WishCard';
import type { Wish } from '@/types/wish';

interface Props {
  wishes: Wish[];
  onCardDeleted: (wishId: string) => void;
}

export function AllCardsGrid({ wishes, onCardDeleted }: Props) {
  if (wishes.length === 0) {
    return (
      <div className="text-center py-20 border border-white/5 rounded-2xl bg-zinc-900/20 text-zinc-500 text-xs">
        查無符合條件的心願卡片。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {wishes.map((w, idx) => (
        <WishCard
          key={w.id}
          wish={w}
          index={idx}
          variant="tracked"
          onCardDeleted={onCardDeleted}
        />
      ))}
    </div>
  );
}