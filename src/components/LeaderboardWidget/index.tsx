// src/components/LeaderboardWidget/index.tsx
import { LeaderboardCapsule } from './components/LeaderboardCapsule';
import { LeaderboardTabs } from './components/LeaderboardTabs';
import { NearCompleteBoard } from './components/NearCompleteBoard';
import { RankBoard } from './components/RankBoard';
import { useLeaderboardWidget } from './useLeaderboardWidget';
import type { LeaderboardWidgetProps } from './types';

export function LeaderboardWidget({ wishes, onScrollToWish, onOpenHonorHall }: LeaderboardWidgetProps) {
  const {
    isOpen,
    toggleOpen,
    activeBoard,
    setActiveBoard,
    topPercentWishes,
    fulfilledTopUsers,
    inTransitTopUsers,
    officialDonors,
    loading,
  } = useLeaderboardWidget(wishes);

  const currentRankList =
    activeBoard === 'fulfilled' ? fulfilledTopUsers : activeBoard === 'inTransit' ? inTransitTopUsers : officialDonors;

  return (
    <div className="mb-8 animate-fade-in">
      <LeaderboardCapsule
        isOpen={isOpen}
        onToggle={toggleOpen}
        topWish={topPercentWishes[0]}
        topOfficialDonor={officialDonors[0]}
      />

      {isOpen && (
        <div className="mt-3 glass rounded-2xl p-4 sm:p-5 border border-amber-400/20 bg-zinc-950/95 space-y-4 animate-fade-in shadow-2xl">
          <LeaderboardTabs activeBoard={activeBoard} onSelectBoard={setActiveBoard} onOpenHonorHall={onOpenHonorHall} />

          {loading ? (
            <div className="text-center py-8 text-xs text-zinc-500">同步星空榜單數據中...</div>
          ) : activeBoard === 'nearComplete' ? (
            <NearCompleteBoard topPercentWishes={topPercentWishes} onScrollToWish={onScrollToWish} />
          ) : (
            <RankBoard activeBoard={activeBoard} currentList={currentRankList} />
          )}
        </div>
      )}
    </div>
  );
}

export default LeaderboardWidget;