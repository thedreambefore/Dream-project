// src/pages/UserDashboard/components/PublishTab/components/PublishSuccessCard.tsx
interface Props {
  onReset: () => void;
}

export function PublishSuccessCard({ onReset }: Props) {
  return (
    <div className="glass rounded-2xl p-8 glow-border text-center space-y-3 bg-zinc-900/60">
      <div className="text-5xl animate-bounce">⏳</div>
      <h3 className="text-lg font-bold text-amber-200">心願已送交審核室！</h3>
      <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
        為了維護平台秩序與交易安全，管理團隊將在 24 小時內完成審查。通過後將自動點亮於前台願望交易所！
      </p>
      <button
        onClick={onReset}
        className="text-xs text-amber-300 border border-amber-400/40 px-4 py-2 rounded-xl hover:bg-amber-500/10 transition-all cursor-pointer mt-2"
      >
        繼續寫下另一個心願
      </button>
    </div>
  );
}