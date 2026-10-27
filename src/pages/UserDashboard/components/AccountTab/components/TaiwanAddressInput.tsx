// src/pages/UserDashboard/components/AccountTab/components/TaiwanAddressInput.tsx
import { MapPin, Lock, Edit3, X } from 'lucide-react';
import { TW_ZIP_CODES } from '@/constants/twzipcode';
import { useTaiwanAddress } from './useTaiwanAddress';

interface Props {
  hasStoredDomicile: boolean;
  isEditingDomicile: boolean;
  storedDomicile: string;
  onChange: (formattedAddress: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export function TaiwanAddressInput({
  hasStoredDomicile,
  isEditingDomicile,
  storedDomicile,
  onChange,
  onStartEdit,
  onCancelEdit,
}: Props) {
  const {
    city,
    district,
    village,
    setVillage,
    neighbor,
    street,
    setStreet,
    currentZip,
    districtList,
    handleCityChange,
    setDistrict,
    handleNeighborChange,
  } = useTaiwanAddress(storedDomicile, onChange);

  return (
    <div className="bg-black/40 border border-amber-400/25 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>戶籍地址（台灣國稅局免扣繳憑單法定申報規格）</span>
        </label>
        {hasStoredDomicile && !isEditingDomicile && (
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            ✓ 已建立憑單地址
          </span>
        )}
      </div>

      {/* 🌟 1. 檢視態（已儲存過）：直接顯示完整地址與修改按鈕 */}
      {!isEditingDomicile && hasStoredDomicile ? (
        <div className="flex items-center justify-between bg-zinc-900 border border-white/10 rounded-xl px-4 py-3">
          <span className="font-mono text-xs text-zinc-200 flex items-center gap-2 truncate max-w-[280px] sm:max-w-md">
            <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="truncate">{storedDomicile}</span>
          </span>
          <button
            type="button"
            onClick={onStartEdit}
            className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer underline flex-shrink-0 ml-2"
          >
            <Edit3 className="w-3 h-3" /> 修改戶籍地址
          </button>
        </div>
      ) : (
        /* 🌟 2. 編輯態：展開五欄位連動輸入 */
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center text-[11px] text-zinc-400">
            <span>請逐欄填寫法定戶籍地址各欄位：</span>
            {hasStoredDomicile && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer text-xs underline"
              >
                <X className="w-3 h-3" /> 取消修改
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={city}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            >
              <option value="">-- 請選擇縣市 --</option>
              {TW_ZIP_CODES.map((c) => (
                <option key={c.city} value={c.city}>
                  {c.city}
                </option>
              ))}
            </select>

            <select
              value={district}
              disabled={!city}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 disabled:opacity-40"
            >
              <option value="">-- 請選擇鄉鎮市區 --</option>
              {districtList.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.zip} {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="村 / 里（例如：光華里）"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
            />

            <div className="flex items-center gap-1.5 bg-zinc-900 border border-white/10 rounded-xl px-3 py-2">
              <input
                type="text"
                maxLength={3}
                value={neighbor}
                onChange={(e) => handleNeighborChange(e.target.value)}
                placeholder="鄰（限純數字）"
                className="w-full bg-transparent text-xs text-white focus:outline-none font-mono"
              />
              <span className="text-xs text-zinc-500 whitespace-nowrap">鄰</span>
            </div>
          </div>

          <input
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="其餘路街巷弄門牌號樓（例如：重慶南路一段122號5樓）"
            className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          />

          <p className="text-[11px] text-zinc-500">
            ※ 儲存時系統將自動補滿 3 位數（如「005鄰」）組合成標準國稅局申報格式。
          </p>
        </div>
      )}
    </div>
  );
}