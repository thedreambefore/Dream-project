import { UserCircle, Loader2, Save, Sparkles } from 'lucide-react';
import { useAccount } from './useAccount';

export function AccountTab() {
  const {
    email,
    isPhoneVerified,
    realName,
    setRealName,
    nickname,
    setNickname,
    phone,
    setPhone,
    address,
    setAddress,
    loading,
    saving,
    saved,
    error,
    handleSave,
  } = useAccount();

  if (loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">正在從星海同步您的旅人資訊...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
        <UserCircle className="w-5 h-5 text-amber-300" /> 星旅人休息室
      </h2>

      <div className="glass rounded-2xl p-5 glow-border bg-zinc-900/40">
        <p className="text-xs text-gray-500 mb-1">登入憑證帳號 (Email)</p>
        <p className="text-sm font-mono text-amber-200">{email || '星旅人'}</p>
        <div className="mt-3">
          {isPhoneVerified ? (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
              ✓ 電子信箱已驗證
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-gray-400">
              ⚠️ 電子信箱未驗證（發布心願功能受限）
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glow-border">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">真實姓名（贈禮物流核對用，平台不公開）</label>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="例如：王小明"
            className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">匿名暱稱（平台公開顯示名稱）</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="請輸入全站顯示的匿名暱稱"
            className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">聯絡電話（配送通知與簡訊驗證備用）</label>
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
          <label className="block text-xs font-medium text-gray-300 mb-2">超商收件門市 / 寄送地址</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="例如：7-11 夢沙門市"
            className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
          />
        </div>

        {error && <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black text-sm py-3 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? <><Sparkles className="w-3.5 h-3.5 text-amber-950" /> 星沙印記儲存成功！</> : '儲存全站帳號設定'}
        </button>
      </form>
    </div>
  );
}