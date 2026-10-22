// src/pages/UserDashboard/components/WalletTab/index.tsx
import { Award } from 'lucide-react';
import { useWallet } from './useWallet';
import { HonorStatsCards } from './components/HonorStatsCards';
import { InTransitDetailsList } from './components/InTransitDetailsList';
import { HonorLeaderboard } from './components/HonorLeaderboard';

export function WalletTab() {
  const {
    hallTab, setHallTab, showTransitDetails, setShowTransitDetails,
    transitList, totalHonor, myInTransitAmount, fulfilledTopUsers,
    inTransitTopUsers, officialDonors, loading,
  } = useWallet();

  const currentList =
    hallTab === 'fulfilled' ? fulfilledTopUsers : hallTab === 'inTransit' ? inTransitTopUsers : officialDonors;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-300" /> 星光貢獻榮譽殿堂
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">見證每位星旅人投入的真實善意與在途守護</p>
      </div>

      <HonorStatsCards
        totalHonor={totalHonor}
        myInTransitAmount={myInTransitAmount}
        transitCount={transitList.length}
        showTransitDetails={showTransitDetails}
        onToggleDetails={() => setShowTransitDetails((p) => !p)}
      />

      {showTransitDetails && <InTransitDetailsList transitList={transitList} />}

      <HonorLeaderboard
        hallTab={hallTab}
        setHallTab={setHallTab}
        loading={loading}
        currentList={currentList}
      />
    </div>
  );
}

export default WalletTab;