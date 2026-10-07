import { useState, useEffect } from 'react';
import { X, Loader2, Wallet, BookOpen, Award, Plus, LogOut, UserCircle, Save, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';

// 🚨 補上先前遺漏的敏感詞定義，徹底消滅 Rollup traceVariable 崩潰
const SENSITIVE_WORDS = ['詐騙', '匯款', '違禁品', '賭博', '毒品', '槍械'];

type TabId = 'account' | 'publish' | 'wallet' | 'invested' | 'memorial';

export function UserDashboard({ onClose, onGoHome, onOpenAdmin }: { onClose: () => void; onGoHome: () => void; onOpenAdmin?: () => void }) {
  const { profile, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);

  return (
    <div className="fixed inset-0 z-50 space-bg overflow-y-auto bg-zinc-950 text-white select-none">
      {/* 頂部導覽列 */}
      <div className="sticky top-0 z-10 glass-strong border-b border-amber-400/10 px-4 sm:px-6 h-16 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">⏳</span>
          <span className="text-lg font-bold text-amber-100 glow-text">夢沙 DreamSand</span>
        </button>
        <div className="flex items-center gap-3">
          {profile?.role === 'admin' && onOpenAdmin && (
            <button onClick={onOpenAdmin} className="bg-red-500/20 border border-red-400/40 text-red-200 text-xs px-3 py-1.5 rounded-xl font-bold animate-pulse">🛠️ 管理後台</button>
          )}
          <button onClick={async () => { await logout(); window.location.reload(); }} className="flex items-center gap-1 text-xs text-red-300 hover:text-red-200 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl transition-all">
            <LogOut className="w-3.5 h-3.5" /> <span>登出</span>
          </button>
          <button onClick={onClose} className="rounded-full hover:bg-white/10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
      </div>

      {/* 標籤切換列 */}
      <div className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6 bg-zinc-950/60 backdrop-blur-sm">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-4xl mx-auto">
          <TabButton id="account" activeTab={activeTab} onClick={setActiveTab} icon={<UserCircle className="w-4 h-4" />} label="帳號資訊" />
          <TabButton id="publish" activeTab={activeTab} onClick={setActiveTab} icon={<Plus className="w-4 h-4" />} label="發布夢想" />
          <TabButton id="wallet" activeTab={activeTab} onClick={setActiveTab} icon={<Wallet className="w-4 h-4" />} label="星塵錢包" />
          <TabButton id="invested" activeTab={activeTab} onClick={setActiveTab} icon={<BookOpen className="w-4 h-4" />} label="追番牆" />
          <TabButton id="memorial" activeTab={activeTab} onClick={setActiveTab} icon={<Award className="w-4 h-4" />} label="星願紀念館" />
        </div>
      </div>

      {/* 內文主區塊 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'publish' && <PublishTab onRequireVerify={() => setShowPhoneVerify(true)} />}
        {activeTab === 'wallet' && <WalletTab />}
        {activeTab === 'invested' && <div className="max-w-md mx-auto text-center border border-slate-800 bg-slate-900/10 rounded-2xl p-12 text-gray-500"><BookOpen className="mx-auto mb-3 opacity-40 w-8 h-8"/>追結局牆目前空空如也，快去首頁投資故事吧！</div>}
        {activeTab === 'memorial' && <div className="max-w-md mx-auto text-center border border-slate-800 bg-slate-900/10 rounded-2xl p-12 text-gray-500"><Award className="mx-auto mb-3 opacity-40 w-8 h-8"/>星願履約紀念館尚未獲得榮譽勛章。</div>}
      </div>

      {showPhoneVerify && <PhoneVerificationModal onClose={() => setShowPhoneVerify(false)} onVerified={async () => { await refreshProfile(); }} />}
    </div>
  );
}

function TabButton({ id, activeTab, onClick, icon, label }: { id: TabId; activeTab: TabId; onClick: (id: TabId) => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={() => onClick(id)} className={`flex items-center gap-1.5 px-5 py-3.5 border-b-2 transition-all text-sm whitespace-nowrap cursor-pointer ${activeTab === id ? 'border-amber-400 text-amber-200 font-bold bg-white/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
      {icon} {label}
    </button>
  );
}

function AccountTab() {
  const { session, profile, refreshProfile } = useAuth();
  const [realName, setRealName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadUserData = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = session?.user?.id || authData?.user?.id;
      if (!currentUserId) {
        if (isMounted) setLoadingData(false);
        return;
      }

      try {
        const { data } = await supabase.from('users').select('*').eq('id', currentUserId).maybeSingle();
        if (data && isMounted) {
          setRealName(data.real_name ?? '');
          setNickname(data.anonymous_nickname ?? '匿名小五郎');
          setPhone(data.phone ?? '');
          setAddress(data.address ?? '');
        } else if (profile && isMounted) {
          setRealName(profile.real_name ?? '');
          setNickname(profile.anonymous_nickname ?? '匿名小五郎');
          setPhone(profile.phone ?? '');
          setAddress(profile.address ?? '');
        }
      } catch (err) {
        console.warn(err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    };
    loadUserData();
    return () => { isMounted = false; };
  }, [session?.user?.id, profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = session?.user?.id || authData?.user?.id;
    if (!currentUserId) {
      setError('找不到登入憑證，請重新登入');
      return;
    }

    setSaving(true);
    try {
      const { error: upsertError } = await supabase.from('users').upsert({
        id: currentUserId,
        real_name: realName.trim(),
        anonymous_nickname: nickname.trim() || '匿名小五郎',
        phone: phone.trim(),
        address: address.trim(),
      }, { onConflict: 'id' });

      if (upsertError) throw upsertError;

      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || '儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
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
        <p className="text-sm font-mono text-amber-200">{session?.user?.email || '星旅人'}</p>
        <div className="mt-3">
          {profile?.is_phone_verified ? (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">✓ 台灣手機強驗證已成功解鎖</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-gray-400">⚠️ 手機未強驗證（發布夢想功能受限）</span>
          )}
        </div>
      </div>
      <form onSubmit={handleSave} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glow-border">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">舞台真實姓名（物流核對用，不公開）</label>
          <input type="text" value={realName} onChange={(e) => setRealName(e.target.value)} placeholder="例如：王小明" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">匿名陌生人暱稱（平台顯示名稱）</label>
          <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="請輸入全站顯示的匿名暱稱" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">聯絡電話（台灣手機號碼）</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" maxLength={10} className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">超商收件門市 / 寄送地址</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="例如：7-11 夢沙門市" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" />
        </div>
        {error && <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
        <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black text-sm py-3 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? '✨ 星沙印記儲存成功！' : '儲存全站帳號設定'}
        </button>
      </form>
    </div>
  );
}

function PublishTab({ onRequireVerify }: { onRequireVerify: () => void }) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');

  const handlePublishClick = (e: React.FormEvent) => {
    e.preventDefault();
    for (const word of SENSITIVE_WORDS) {
      if (title.includes(word) || story.includes(word)) {
        alert(`防護盾牌提示：故事包含違禁詞 [ ${word} ] 已被強行攔截。`);
        return;
      }
    }
    if (!profile?.is_phone_verified) {
      onRequireVerify();
    } else {
      alert('發布願望成功！此功能下一階段將接通 Realtime 實時齒輪。');
      setTitle('');
      setStory('');
    }
  };

  return (
    <form onSubmit={handlePublishClick} className="space-y-5 max-w-xl bg-white/5 border border-white/10 p-6 rounded-2xl glow-border animate-fade-in">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-300" /> 發布夢想沙漏</h2>
      <div>
        <label className="block text-xs text-gray-300 mb-2">一條故事與圓夢承諾 (標題)</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：若籌齊報名碎銀，我將免費為偏鄉孩童課輔一年" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" required />
      </div>
      <div>
        <label className="block text-xs text-gray-300 mb-2">您的故事細節</label>
        <textarea rows={5} value={story} onChange={(e) => setStory(e.target.value)} placeholder="請誠摯描述現狀..." className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none" required />
      </div>
      <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-bold p-3 rounded-xl text-sm flex items-center justify-center gap-2"><Plus className="w-4 h-4" />注入星光 · 發布願望沙漏</button>
    </form>
  );
}

function WalletTab() {
  const { profile } = useAuth();
  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
        <Wallet className="w-5 h-5 text-amber-300" /> 星塵錢包
      </h2>
      <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/20 p-6 rounded-3xl relative overflow-hidden shadow-2xl glow-border">
        <p className="text-zinc-400 text-xs font-medium tracking-wider mb-1">當前星塵餘額</p>
        <h4 className="text-3xl font-black text-amber-300 font-mono">
          ✨ {profile?.wallet_balance ?? 0} <span className="text-xs text-zinc-500 font-normal">星塵</span>
        </h4>
      </div>
    </div>
  );
}
