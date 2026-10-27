// src/pages/UserDashboard/components/AccountTab/index.tsx
import { UserCircle, Loader2, Save, Sparkles } from 'lucide-react';
import { useAccount } from './useAccount';
import { ProfileHeaderCard } from './components/ProfileHeaderCard';
import { IdVerificationBox } from './components/IdVerificationBox';
import { BasicInfoSection } from './components/BasicInfoSection';
import { ContactInfoSection } from './components/ContactInfoSection';
import { TaiwanAddressInput } from './components/TaiwanAddressInput';
import { PrivacyNoticeCard } from './components/PrivacyNoticeCard';

export function AccountTab() {
  const account = useAccount();

  if (account.loading) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 text-amber-300 animate-spin mx-auto mb-3" />
        <p className="text-gray-400 text-sm">同步旅人資訊中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-xl animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
        <UserCircle className="w-5 h-5 text-amber-300" /> 星旅人休息室
      </h2>
      <ProfileHeaderCard email={account.email} isPhoneVerified={account.isPhoneVerified} />

      <form onSubmit={account.handleSave} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glow-border">
        <BasicInfoSection realName={account.realName} setRealName={account.setRealName} nickname={account.nickname} setNickname={account.setNickname} />
        <IdVerificationBox hasStoredId={account.hasStoredId} isEditingId={account.isEditingId} storedMaskedId={account.storedMaskedId} newIdInput={account.newIdInput} setNewIdInput={account.setNewIdInput} onStartEdit={account.handleStartEditId} onCancelEdit={account.handleCancelEditId} />
        <TaiwanAddressInput hasStoredDomicile={account.hasStoredDomicile} isEditingDomicile={account.isEditingDomicile} storedDomicile={account.storedDomicile} onChange={(formatted) => account.setNewDomicileInput(formatted)} onStartEdit={account.handleStartEditDomicile} onCancelEdit={account.handleCancelEditDomicile} />
        <ContactInfoSection phone={account.phone} setPhone={account.setPhone} address={account.address} setAddress={account.setAddress} />
        <PrivacyNoticeCard />

        {account.error && <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{account.error}</p>}

        <button type="submit" disabled={account.saving} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black text-sm py-3 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
          {account.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {account.saved ? <><Sparkles className="w-3.5 h-3.5 text-amber-950" /> 帳號設定儲存成功！</> : '儲存全站帳號設定'}
        </button>
      </form>
    </div>
  );
}

export default AccountTab;