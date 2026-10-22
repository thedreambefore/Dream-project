// src/pages/UserDashboard/components/AccountTab/index.tsx
import { UserCircle, Loader2, Save, Sparkles } from 'lucide-react';
import { useAccount } from './useAccount';
import { ProfileHeaderCard } from './components/ProfileHeaderCard';
import { IdVerificationBox } from './components/IdVerificationBox';

export function AccountTab() {
  const {
    email, isPhoneVerified, realName, setRealName, nickname, setNickname,
    phone, setPhone, address, setAddress, hasStoredId, storedMaskedId,
    newIdInput, setNewIdInput, isEditingId, domicileAddress, setDomicileAddress,
    loading, saving, saved, error, handleStartEditId, handleCancelEditId, handleSave,
  } = useAccount();

  if (loading) return <div className="py-16 text-center"><Loader2 className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-3" /><p className="text-gray-400 text-sm">同步旅人資訊中...</p></div>;

  return (
    <div className="space-y-6 max-w-xl animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2"><UserCircle className="w-5 h-5 text-amber-300" /> 星旅人休息室</h2>
      <ProfileHeaderCard email={email} isPhoneVerified={isPhoneVerified} />

      <form onSubmit={handleSave} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glow-border">
        <div><label className="block text-xs font-medium text-gray-300 mb-2">真實姓名（所得稅申報與物流核對用，不公開）</label><input type="text" value={realName} onChange={(e) => setRealName(e.target.value)} placeholder="例如：王小明" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" /></div>
        <div><label className="block text-xs font-medium text-gray-300 mb-2">匿名暱稱（平台公開顯示名稱）</label><input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="全站匿名暱稱" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" required /></div>
        
        <IdVerificationBox hasStoredId={hasStoredId} isEditingId={isEditingId} storedMaskedId={storedMaskedId} newIdInput={newIdInput} setNewIdInput={setNewIdInput} onStartEdit={handleStartEditId} onCancelEdit={handleCancelEditId} />

        <div><label className="block text-xs font-medium text-gray-300 mb-2">戶籍地址 <span className="text-amber-300/80">（次年 1 月開立實物免扣繳憑單申報用）</span></label><input type="text" value={domicileAddress} onChange={(e) => setDomicileAddress(e.target.value)} placeholder="例如：台北市中正區重慶南路一段 122 號" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" /></div>
        <div><label className="block text-xs font-medium text-gray-300 mb-2">聯絡電話</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" maxLength={10} className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" /></div>
        <div><label className="block text-xs font-medium text-gray-300 mb-2">超商門市 / 通訊地址（活動贈禮寄送用）</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例如：7-11 夢沙門市" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" /></div>
        
        {error && <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
        <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black text-sm py-3 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saved ? <><Sparkles className="w-3.5 h-3.5 text-amber-950" /> 帳號設定儲存成功！</> : '儲存全站帳號設定'}</button>
      </form>
    </div>
  );
}