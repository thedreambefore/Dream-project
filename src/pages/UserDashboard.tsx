import { useState } from 'react';
import { X, Loader2, Wallet, BookOpen, Award, Plus, LogOut, UserCircle, Save } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';

export function UserDashboard({ onClose, onGoHome, onOpenAdmin }: { onClose: () => void; onGoHome: () => void; onOpenAdmin?: () => void }) {
  const { session, profile, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'publish' | 'wallet' | 'invested' | 'memorial'>('account');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);

  const requirePhoneVerification = (onVerified: () => void) => {
    if (profile?.is_phone_verified) onVerified();
    else setShowPhoneVerify(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-white p-4">
      <div className="flex justify-between items-center max-w-4xl mx-auto h-16 border-b border-white/5">
        <button onClick={onGoHome} className="text-amber-100 font-bold">⏳ 夢沙 DreamSand</button>
        <div className="flex gap-2">
          {profile?.role === 'admin' && onOpenAdmin && <button onClick={onOpenAdmin} className="bg-red-500/20 text-red-200 px-3 py-1 rounded-xl text-xs font-bold">🛠️ 後台</button>}
          <button onClick={async () => { await logout(); window.location.reload(); }} className="text-red-300 text-xs flex items-center gap-1"><LogOut className="w-3 h-3" />登出</button>
          <button onClick={onClose} className="text-gray-400 w-8 h-8"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex gap-2 max-w-4xl mx-auto border-b border-white/5 my-4 overflow-x-auto">
        <button onClick={() => setActiveTab('account')} className={`p-3 text-sm ${activeTab === 'account' ? 'text-amber-200 font-bold border-b-2 border-amber-400' : 'text-gray-400'}`}>帳號資訊</button>
        <button onClick={() => setActiveTab('publish')} className={`p-3 text-sm ${activeTab === 'publish' ? 'text-amber-200 font-bold border-b-2 border-amber-400' : 'text-gray-400'}`}>發布夢想</button>
        <button onClick={() => setActiveTab('wallet')} className={`p-3 text-sm ${activeTab === 'wallet' ? 'text-amber-200 font-bold border-b-2 border-amber-400' : 'text-gray-400'}`}>星塵錢包</button>
        <button onClick={() => setActiveTab('invested')} className={`p-3 text-sm ${activeTab === 'invested' ? 'text-amber-200 font-bold border-b-2 border-amber-400' : 'text-gray-400'}`}>追番牆</button>
        <button onClick={() => setActiveTab('memorial')} className={`p-3 text-sm ${activeTab === 'memorial' ? 'text-amber-200 font-bold border-b-2 border-amber-400' : 'text-gray-400'}`}>紀念館</button>
      </div>
      <div className="max-w-4xl mx-auto py-4">
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'publish' && <PublishTab requirePhoneVerification={requirePhoneVerification} />}
        {activeTab === 'wallet' && <WalletTab />}
        {activeTab === 'invested' && <div className="text-center text-gray-500 py-12"><BookOpen className="mx-auto mb-2 opacity-40"/>追故事結局牆 (空空如也)</div>}
        {activeTab === 'memorial' && <div className="text-center text-gray-500 py-12"><Award className="mx-auto mb-2 opacity-40"/>星願履約紀念館 (尚無榮譽)</div>}
      </div>
      {showPhoneVerify && <PhoneVerificationModal onClose={() => setShowPhoneVerify(false)} onVerified={async () => { await refreshProfile(); }} />}
    </div>
  );
}

function AccountTab() {
  const { session, profile, refreshProfile } = useAuth();
  const [realName, setRealName] = useState(profile?.real_name || '');
  const [nickname, setNickname] = useState(profile?.anonymous_nickname || '匿名小五郎');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({ real_name: realName.trim(), anonymous_nickname: nickname.trim() }).eq('id', session?.user?.id);
      if (error) throw error;
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { alert('儲存失敗'); } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSave} className="space-y-4 max-w-md bg-white/5 p-6 rounded-2xl border border-white/5">
      <p className="text-xs text-gray-500 font-mono">帳號: {session?.user?.email} ({profile?.is_phone_verified ? '✓ 已手機驗證' : '⚠️ 未手機驗證'})</p>
      <div><label className="text-xs text-gray-300 block mb-1">舞台真名（物流用）</label><input type="text" value={realName} onChange={(e) => setRealName(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-sm focus:outline-none" /></div>
      <div><label className="text-xs text-gray-300 block mb-1">匿名暱稱（全站顯示）</label><input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-sm focus:outline-none" required /></div>
      <button type="submit" className="w-full bg-amber-500 text-gray-950 font-bold p-2 rounded-xl text-sm flex items-center justify-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saved ? '儲存成功！' : '儲存變更設定'}</button>
    </form>
  );
}

function PublishTab({ requirePhoneVerification }: { requirePhoneVerification: (onVerified: () => void) => void }) {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); requirePhoneVerification(() => { alert('發布成功！下一階段接通實時數據。'); setTitle(''); setStory(''); }); }} className="space-y-4 max-w-md bg-white/5 p-6 rounded-2xl border border-white/5">
      <div><label className="text-xs text-gray-300 block mb-1">願望沙漏標題 (圓夢承諾)</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：湊齊學費我將免費義診" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-sm focus:outline-none" required /></div>
      <div><label className="text-xs text-gray-300 block mb-1">漂流瓶故事細節 (達標解鎖)</label><textarea rows={4} value={story} onChange={(e) => setStory(e.target.value)} placeholder="請真誠描述現狀" className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-sm focus:outline-none resize-none" required /></div>
      <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-bold p-2.5 rounded-xl text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4" />發布願望沙漏</button>
    </form>
  );
}

function WalletTab() {
  const { profile } = useAuth();
  return (
    <div className="max-w-md bg-white/5 p-6 rounded-2xl border border-white/5 space-y-4">
      <p className="text-xs text-gray-400">✨ CURRENT BALANCE · 星塵錢包</p>
      <h4 className="text-3xl font-black text-amber-300 font-mono flex items-baseline gap-1"><span>✨</span><span>{profile?.wallet_balance ?? 0}</span><span className="text-xs text-zinc-500 ml-1">星塵</span></h4>
      <div className="flex gap-2 pt-2"><button onClick={() => alert('MVP階段請先使用初始星塵')} className="bg-amber-500 text-gray-950 text-xs font-bold px-4 py-2 rounded-xl">⚡ 儲值星塵</button></div>
      <div className="border-t border-white/5 pt-4"><p className="text-xs text-gray-400 mb-2">近期明細</p><div className="flex justify-between text-xs bg-zinc-900 p-3 rounded-xl border border-white/5"><span>星旅人登場贈禮 (自動配發)</span><span className="text-green-400 font-bold">+500 ✨</span></div></div>
    </div>
  );
}
