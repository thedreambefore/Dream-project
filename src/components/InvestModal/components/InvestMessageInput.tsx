// src/components/InvestModal/components/InvestMessageInput.tsx

interface Props {
  message: string;
  setMessage: (m: string) => void;
}

export function InvestMessageInput({ message, setMessage }: Props) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-amber-100">✍️ 留下一則互動星語 (限 50 字)</label>
        <span className="text-[11px] text-amber-300/80 font-mono">(剩餘 {50 - message.length} 字)</span>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="留下您的溫暖話語，活動達成時將同步公開（系統將自動遮蔽含網址之廣告）..."
        maxLength={50}
        rows={2}
        className="w-full bg-zinc-900 border border-white/15 rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/60 text-xs resize-none"
      />
    </div>
  );
}