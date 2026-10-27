// src/pages/UserDashboard/components/AccountTab/components/ContactInfoSection.tsx

interface Props {
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
}

export function ContactInfoSection({ phone, setPhone, address, setAddress }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">聯絡電話</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="09xxxxxxxx"
          maxLength={10}
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-2">
          通訊收件地址 <span className="text-zinc-500 font-normal">（主題活動贈禮寄送用）</span>
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="超商門市（如 7-11/全家店名與店號）或可收件住址"
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
        />
      </div>
    </div>
  );
}