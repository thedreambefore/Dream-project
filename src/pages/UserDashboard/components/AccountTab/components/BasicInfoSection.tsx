// src/pages/UserDashboard/components/AccountTab/components/BasicInfoSection.tsx

interface Props {
  realName: string;
  setRealName: (v: string) => void;
  nickname: string;
  setNickname: (v: string) => void;
}

export function BasicInfoSection({ realName, setRealName, nickname, setNickname }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          真實姓名 <span className="text-zinc-500 font-normal">（所得稅申報與物流核對用，不公開）</span>
        </label>
        <input
          type="text"
          value={realName}
          onChange={(e) => setRealName(e.target.value)}
          placeholder="請輸入真實姓名"
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          匿名暱稱 <span className="text-zinc-500 font-normal">（平台公開顯示名稱）</span>
        </label>
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="請輸入全站匿名暱稱"
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
          required
        />
      </div>
    </div>
  );
}