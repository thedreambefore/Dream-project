import { useState, useEffect } from 'react';
import { X, Send, Loader2, Wallet, BookOpen, Award, Plus, History, Star, Clock, CheckCircle2, Hourglass, LogOut, UserCircle, Save, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient'; // 🚀 對齊已有的客戶端
import { useAuth } from '@/context/AuthContext';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';

const SENSITIVE_WORDS = ['毒品', '槍枝', '色情', '現金', '裸露', '詐騙', '賭博', '暴力', '武器', '洗錢'];
type TabId = 'account' | 'publish' | 'wallet' | 'invested' | 'memorial';

export function UserDashboard({ onClose, onGoHome, onOpenAdmin }: { onClose: () => void; onGoHome: () => void; onOpenAdmin?: () => void }) {
  const { session, profile, refreshProfile, logout } = useAuth(); // 🚀 對齊小寫 logout
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [phoneVerifiedCallback, setPhoneVerifiedCallback] = useState<(() => void) | null>(null);

  // 彈出台灣手機強驗證攔截盾牌
  const requirePhoneVerification = async (onVerified: () => void) => {
    if (!session?.user?.id) return;
    if (profile?.is_phone_verified) {
      onVerified();
    } else {
      setPhoneVerifiedCallback(() => onVerified);
      setShowPhoneVerify(true);
    }
  };

  const handlePhoneVerified = async () => {
    await refreshProfile();
    if (phoneVerifiedCallback) {
      phoneVerifiedCallback();
      setPhoneVerifiedCallback(null);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 space-bg overflow-y-auto bg-zinc-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-strong border-b border-amber-400/10 px-4 sm:px-6 h-16 flex items-center justify-between bg-zinc-950/90 backdrop-blur-md">
        <button onClick={onGoHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
          <span className="text-2xl">⏳</span>
          <span className="text-lg font-bold text-amber-100 glow-text">夢沙</span>
          <span className="text-sm text-gray-400 hidden sm:inline">DreamSand</span>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          {profile?.role === 'admin' && onOpenAdmin && (
            <button onClick={onOpenAdmin} className="touch-btn flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition-all text-sm font-bold animate-pulse">
              🛠️ 進入管理總後台
            </button>
          )}
          <button onClick={handleSignOut} className="touch-btn flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition-all text-sm">
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">登出</span>
          </button>
          <button onClick={onClose} className="touch-btn rounded-full hover:bg-white/10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6 bg-zinc-950/60 backdrop-blur-sm">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-4xl mx-auto">
          <TabButton id="account" activeTab={activeTab} onClick={setActiveTab} icon={<UserCircle className="w-4 h-4" />} label="帳號資訊" />
          <TabButton id="publish" activeTab={activeTab} onClick={setActiveTab} icon={<Plus className="w-4 h-4" />} label="發布夢想" />
          <TabButton id="wallet" activeTab={activeTab} onClick={setActiveTab} icon={<Wallet className="w-4 h-4" />} label="星塵錢包" />
          <TabButton id="invested" activeTab={activeTab} onClick={setActiveTab} icon={<BookOpen className="w-4 h-4" />} label="追番牆" />
          <TabButton id="memorial" activeTab={activeTab} onClick={setActiveTab} icon={<Award className="w-4 h-4" />} label="星願紀念館" />
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24">
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'publish' && <PublishTab requirePhoneVerification={requirePhoneVerification} />}
        {activeTab === 'wallet' && <WalletTab />}
        {activeTab === 'invested' && <InvestedTab />}
        {activeTab === 'memorial' && <MemorialTab />}
      </div>

      {showPhoneVerify && (
        <PhoneVerificationModal onClose={() => setShowPhoneVerify(false)} onVerified={handlePhoneVerified} />
      )}
    </div>
  );
}

function TabButton({ id, activeTab, onClick, icon, label }: { id: TabId; activeTab: TabId; onClick: (id: TabId) => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={() => onClick(id)} className={`touch-btn flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap text-sm cursor-pointer ${activeTab === id ? 'border-amber-400 text-amber-200 font-bold bg-white/5' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>
      {icon}
      {label}
    </button>
  );
}

// ===== 1. Account Tab (帳號資訊) =====
function AccountTab() {
  const { session, profile, refreshProfile } = useAuth();
  const [realName, setRealName] = useState(profile?.real_name || '');
  const [anonymousNickname, setAnonymousNickname] = useState(profile?.anonymous_nickname || '匿名小五郎');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!anonymousNickname.trim()) {
      setError('匿名暱稱不能為空');
      return;
    }
    setSaving(true);
    try {
      // 🚀 🔥 核心修正：精確對接小寫的 users 資料表，完美更新資料庫
      const { error: updateError } = await supabase
        .from('users')
        .update({
          real_name: realName.trim() || null,
          anonymous_nickname: anonymousNickname.trim(),
        })
        .eq('id', session?.user?.id);

      if (updateError) throw updateError;
      
      await refreshProfile(); // 刷新 Context
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError('儲存失敗，欄位結構不符或連線異常');
    } {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-xl animate-fade-in">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
        <UserCircle className="w-5 h-5 text-amber-300" /> 帳號基本資訊
      </h2>

      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5">
        <p className="text-xs text-gray-500 mb-1">星旅人登入帳號 (Email)</p>
        <p className="text-sm font-mono text-amber-200">{session?.user?.email}</p>
        <div className="mt-3">
          {profile?.is_phone_verified ? (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">✓ 台灣手機強驗證已解鎖</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-zinc-800 border border-white/5 text-gray-400">⚠️ 手機未驗證（許願功能受限）</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 bg-zinc-900/20 border border-white/5 p-6 rounded-2xl">
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">舞台真名（物流代買用，不對外公開）</label>
          <input type="text" value={realName} onChange={(e) => setRealName(e.target.value)} placeholder="請輸入真實姓名" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">匿名陌生人暱稱（夢沙全站顯示）</label>
          <input type="text" value={anonymousNickname} onChange={(e) => setAnonymousNickname(e.target.value)} placeholder="例如：匿名小五郎" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400/50" required />
        </div>

        {error && <p className="text-red-400 text-xs bg-red-500/10 p-2.5 rounded-lg">{error}</p>}

        <button type="submit" disabled={saving} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-bold text-sm py-2.5 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? '資料儲存成功！' : '儲存變更設定'}
        </button>
      </form>
    </div>
  );
}

// ===== 2. Publish Tab (發布夢想沙漏) =====
function PublishTab({ requirePhoneVerification }: { requirePhoneVerification: (onVerified: () => void) => void }) {
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 敏感詞前端防護盾牌
    for (const word of SENSITIVE_WORDS) {
      if (title.includes(word) || story.includes(word)) {
        alert(`故事中包含敏感詞彙 [ ${word} ]，已被防護盾牌強行攔截。`);
        return;
      }
    }

    // 🚀 發布夢想時強制攔截彈出台灣手機強驗證
    requirePhoneVerification(async () => {
      setLoading(true);
      try {
        await new Promise((r) => setTimeout(r, 1000));
        alert('夢想故事沙漏已順利注入星空！目前降級為靜態模式，資料將於下一階段接通實時 Realtime。');
        setTitle('');
        setStory('');
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <form onSubmit={handlePublish} className="space-y-4 max-w-xl bg-zinc-900/20 border border-white/5 p-6 rounded-2xl animate-fade-in">
