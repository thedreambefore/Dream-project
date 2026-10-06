import { useState, useEffect, useCallback } from 'react';
import { X, Send, Loader2, Coins, Wallet, BookOpen, Award, Plus, History, Star, Clock, CheckCircle2, Hourglass, LogOut, UserCircle, Save } from 'lucide-react';
import { supabase, type Story, type Investment, type Wallet as WalletType, type Fulfillment } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';
import { fetchPhoneVerified, insertWish } from '@/lib/backend';

const SENSITIVE_WORDS = ['毒品', '槍枝', '色情', '現金', '裸露', '詐騙', '賭博', '暴力', '武器', '洗錢'];

type TabId = 'account' | 'publish' | 'wallet' | 'invested' | 'memorial';

export function UserDashboard({ onClose, onGoHome, onOpenAdmin }: { onClose: () => void; onGoHome: () => void; onOpenAdmin?: () => void }) {
  const { session, profile, refreshProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('account');
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [phoneVerifiedCallback, setPhoneVerifiedCallback] = useState<(() => void) | null>(null);

  const requirePhoneVerification = async (onVerified: () => void) => {
    if (!session?.user?.id) return;
    const verified = await fetchPhoneVerified(session.user.id);
    if (verified || profile?.is_phone_verified || profile?.phone_verified) {
      onVerified();
    } else {
      setPhoneVerifiedCallback(() => onVerified);
      setShowPhoneVerify(true);
    }
  };

  const handlePhoneVerified = () => {
    refreshProfile();
    if (phoneVerifiedCallback) {
      phoneVerifiedCallback();
      setPhoneVerifiedCallback(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 space-bg overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-strong border-b border-amber-400/10 px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo — always navigates to home */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0"
        >
          <span className="text-2xl">⏳</span>
          <span className="text-lg font-bold text-amber-100 glow-text">夢沙</span>
          <span className="text-sm text-gray-400 hidden sm:inline">DreamSand</span>
        </button>

        <div className="flex items-center gap-2 flex-shrink-0">
          {profile?.role === 'admin' && onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="touch-btn flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30 transition-all text-sm font-bold pulse-gold"
            >
              🛠️ 進入管理總後台
            </button>
          )}
          <button
            onClick={handleSignOut}
            className="touch-btn flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-400/20 text-red-300 hover:bg-red-500/20 transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">登出</span>
          </button>
          <button onClick={onClose} className="touch-btn rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6">
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
        <PhoneVerificationModal
          onClose={() => setShowPhoneVerify(false)}
          onVerified={handlePhoneVerified}
        />
      )}
    </div>
  );
}

function TabButton({ id, activeTab, onClick, icon, label }: { id: TabId; activeTab: TabId; onClick: (id: TabId) => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`touch-btn flex items-center gap-1.5 px-4 py-3 border-b-2 transition-all whitespace-nowrap text-sm ${
        activeTab === id
          ? 'border-amber-400 text-amber-200 font-bold'
          : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ===== Account Tab =====
const EMOJI_OPTIONS = ['🌙', '⭐', '💫', '🌟', '✨', '🌠', '🌌', '🪐', '☄️', '🌈', '🦋', '🌸', '🐉', '🦊', '🐺'];

function AccountTab() {
  const { session, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [avatarEmoji, setAvatarEmoji] = useState(profile?.avatar_emoji || '🌙');
  const [realName, setRealName] = useState(profile?.real_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!displayName.trim()) {
      setError('顯示名稱不能為空');
      return;
    }
    if (bio.length > 100) {
      setError('個人簡介不得超過 100 字');
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          avatar_emoji: avatarEmoji,
          real_name: realName.trim() || null,
          phone: phone.trim() || null,
          address: address.trim() || null,
          bio: bio.trim() || null,
        })
        .eq('id', session?.user?.id);
      if (updateError) throw updateError;
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
        <UserCircle className="w-5 h-5 text-amber-300" />
        帳號資訊
      </h2>

      {/* Account email (read-only) */}
      <div className="glass rounded-2xl p-5 glow-border">
        <p className="text-xs text-gray-500 mb-1">登入帳號 (Email)</p>
        <p className="text-sm text-amber-100">{session?.user?.email}</p>
        {profile?.is_phone_verified || profile?.phone_verified ? (
          <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-green-500/15 border border-green-400/30 text-green-300">
            ✓ 手機已驗證
          </span>
        ) : (
          <span className="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-gray-500/15 border border-gray-400/20 text-gray-400">
            手機未驗證
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar & display name */}
        <div className="glass rounded-2xl p-5 glow-border space-y-4">
          <h3 className="text-sm font-bold text-amber-200">公開形象</h3>

          {/* Avatar preview */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl glass glow-border flex items-center justify-center text-4xl flex-shrink-0">
              {avatarEmoji}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400 mb-2">選擇頭貼 Emoji</p>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setAvatarEmoji(e)}
                    className={`w-9 h-9 touch-btn rounded-lg text-lg transition-all ${
                      avatarEmoji === e
                        ? 'bg-amber-500/25 border border-amber-400/60 scale-110'
                        : 'bg-white/5 border border-white/10 hover:border-amber-400/30'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">顯示名稱 <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="例：星旅人小明"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">
              個人簡介 <span className="text-gray-500">(100 字內)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介紹一下自己..."
              maxLength={100}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all resize-none text-sm"
            />
            <p className="text-right text-xs text-gray-600 mt-1">{bio.length}/100</p>
          </div>
        </div>

        {/* Contact info */}
        <div className="glass rounded-2xl p-5 glow-border space-y-4">
          <h3 className="text-sm font-bold text-amber-200">聯絡資料 <span className="text-gray-500 font-normal">(非必填，僅平台內部使用)</span></h3>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">真實姓名</label>
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder="例：王小明"
              maxLength={30}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">聯絡電話</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="例：0912345678"
              maxLength={15}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">收件地址</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="例：台北市中正區某路某號"
              maxLength={100}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
            />
          </div>

          <p className="text-xs text-gray-600">聯絡資料僅用於超商物流驗證，不會公開顯示給其他用戶。</p>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
        )}

        {saved && (
          <div className="bg-green-500/10 border border-green-400/30 rounded-xl px-4 py-3 text-sm text-green-300 flex items-center gap-2 scale-in">
            <CheckCircle2 className="w-4 h-4" />
            帳號資訊已儲存！
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3.5 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-4 h-4" />}
          儲存變更
        </button>
      </form>
    </div>
  );
}

// ===== Publish Tab =====
function PublishTab({ requirePhoneVerification }: { requirePhoneVerification: (cb: () => void) => void }) {
  const { session } = useAuth();
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [tagName, setTagName] = useState('其他');
  const [storyText, setStoryText] = useState('');
  const [promiseText, setPromiseText] = useState('');
  const [coverEmoji, setCoverEmoji] = useState('🎁');
  const [tags, setTags] = useState<{ name: string; icon: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    supabase.from('tags').select('name, icon').order('sort_order').then(({ data }) => {
      if (data) setTags(data as { name: string; icon: string }[]);
    });
  }, []);

  const checkSensitiveWords = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    for (const word of SENSITIVE_WORDS) {
      if (lowerText.includes(word.toLowerCase())) return word;
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requirePhoneVerification(() => actuallySubmit());
  };

  const actuallySubmit = async () => {
    setError('');

    if (!productName || !productPrice || !storyText || !promiseText) {
      setError('請填寫所有欄位');
      return;
    }
    if (storyText.length > 500) {
      setError('困境故事不得超過 500 字');
      return;
    }

    const allText = `${productName} ${storyText} ${promiseText}`;
    const badWord = checkSensitiveWords(allText);
    if (badWord) {
      setError(`偵測到敏感詞「${badWord}」，請移除後重新提交。平台禁止涉及此類內容。`);
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await (async () => {
        try {
          await insertWish({
            user_id: session?.user?.id,
            product_name: productName,
            product_price: parseInt(productPrice),
            tag_name: tagName,
            story_text: storyText,
            promise_text: promiseText,
            cover_emoji: coverEmoji,
            status: 'approved',
          });
          return { error: null };
        } catch (err) {
          return { error: err };
        }
      })();
      if (insertError) throw insertError;

      setSuccess(true);
      setProductName('');
      setProductPrice('');
      setStoryText('');
      setPromiseText('');
      setShowForm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('發布失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  const emojiOptions = ['🎁', '📓', '🎧', '📱', '🪑', '🐱', '🏺', '🎨', '🧸', '👕', '🍜', '✨', '🏠', '⭐', '🌙'];

  if (success) {
    return (
      <div className="text-center py-16 scale-in">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-amber-200 mb-2">願望已成功發布！</h2>
        <p className="text-gray-400 text-sm">你的故事已加入星空，等待星旅人們注入星塵</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-5 glow-border">
        <h2 className="text-lg font-bold text-amber-100 mb-2 flex items-center gap-2">
          <Plus className="w-5 h-5 text-amber-300" />
          發布我的夢想沙漏
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          寫下你的困境故事與想要的商品，讓星旅人們用星塵幫你圓夢。發布前需完成手機驗證。
        </p>

        {!showForm ? (
          <button
            onClick={() => requirePhoneVerification(() => setShowForm(true))}
            className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3.5 hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            開始發布新願望
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">商品名稱</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="例：Hobonichi 手帳一本"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">商品金額 (星塵)</label>
              <input
                type="number"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                placeholder="例：1200"
                min={1}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Tag 分類</label>
              <select
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-400/50 transition-all"
              >
                {tags.map((t) => (
                  <option key={t.name} value={t.name} className="bg-gray-900">
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">封面 Emoji</label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setCoverEmoji(e)}
                    className={`w-10 h-10 touch-btn rounded-lg text-xl transition-all ${
                      coverEmoji === e ? 'bg-amber-500/25 border border-amber-400/50' : 'bg-white/5 border border-white/10 hover:border-amber-400/20'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">
                困境故事 <span className="text-gray-500">(500 字內)</span>
              </label>
              <textarea
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                placeholder="述說你的困境與為什麼需要這個物品..."
                maxLength={500}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all resize-none text-sm"
              />
              <p className="text-right text-xs text-gray-600 mt-1">{storyText.length}/500</p>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">履約終章承諾</label>
              <textarea
                value={promiseText}
                onChange={(e) => setPromiseText(e.target.value)}
                placeholder="收到禮物後你會如何回報大家？"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-400/50 transition-all resize-none text-sm"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="touch-btn flex-1 bg-white/5 border border-white/10 text-gray-300 rounded-xl py-3 hover:bg-white/10 transition-all"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={loading}
                className="touch-btn flex-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                發布願望
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ===== Wallet Tab =====
function WalletTab() {
  const { session } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [loading, setLoading] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);

  const loadWallet = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (data) setWallet(data as WalletType);
  }, [session]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleTopUp = async () => {
    if (!session?.user?.id || !wallet) return;
    setLoading(true);
    try {
      const newBalance = wallet.available_stardust + topUpAmount;
      await supabase
        .from('wallets')
        .update({ available_stardust: newBalance })
        .eq('user_id', session.user.id);
      setWallet({ ...wallet, available_stardust: newBalance });
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return <div className="text-center py-16 text-gray-400">載入中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="glass rounded-2xl p-6 glow-border">
        <h2 className="text-lg font-bold text-amber-100 mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-amber-300" />
          星塵錢包管理
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">可用星塵</p>
            <p className="text-2xl font-bold text-amber-300 glow-text flex items-center justify-center gap-1">
              <Coins className="w-5 h-5" />
              {wallet.available_stardust.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-500/10 border border-blue-400/20 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-400 mb-1">旅途中星塵</p>
            <p className="text-2xl font-bold text-blue-300 flex items-center justify-center gap-1">
              <Hourglass className="w-5 h-5" />
              {wallet.in_transit_stardust.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 space-y-3">
          <p className="text-sm text-gray-300 font-medium">快速模擬儲值</p>
          <div className="flex flex-wrap gap-2">
            {[100, 500, 1000, 5000].map((v) => (
              <button
                key={v}
                onClick={() => setTopUpAmount(v)}
                className={`touch-btn flex-1 min-w-[70px] text-sm rounded-lg py-2.5 transition-all ${
                  topUpAmount === v
                    ? 'bg-amber-500/25 border border-amber-400/50 text-amber-200 font-bold'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:border-amber-400/20'
                }`}
              >
                {v.toLocaleString()}
              </button>
            ))}
          </div>
          <button
            onClick={handleTopUp}
            disabled={loading}
            className="w-full touch-btn bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-900 font-bold rounded-xl py-3 hover:from-amber-400 hover:to-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-4 h-4" />}
            模擬儲值 {topUpAmount.toLocaleString()} 星塵
          </button>
          <p className="text-xs text-gray-500 text-center">此為模擬儲值功能，不涉及真實付款</p>
        </div>
      </div>
    </div>
  );
}

// ===== Invested Tab =====
function InvestedTab() {
  const { session } = useAuth();
  const [investments, setInvestments] = useState<(Investment & { stories: Story })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'funding' | 'fulfilled' | 'all'>('all');
  const [selectedFulfillment, setSelectedFulfillment] = useState<Fulfillment | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase
      .from('investments')
      .select('*, stories(*)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setInvestments((data as (Investment & { stories: Story })[]) || []);
        setLoading(false);
      });
  }, [session]);

  const filtered = investments.filter((inv) => {
    if (filter === 'funding') return inv.stories?.status === 'approved';
    if (filter === 'fulfilled') return inv.stories?.status === 'fulfilled';
    return true;
  });

  const handleViewFulfillment = async (storyId: string) => {
    const { data } = await supabase
      .from('fulfillments')
      .select('*')
      .eq('story_id', storyId)
      .maybeSingle();
    if (data) setSelectedFulfillment(data as Fulfillment);
  };

  if (loading) return <div className="text-center py-16 text-gray-400">載入中...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-300" />
        我投資的故事（追番牆）
      </h2>

      <div className="flex gap-2">
        <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="全部" />
        <FilterChip active={filter === 'funding'} onClick={() => setFilter('funding')} label="募資中" />
        <FilterChip active={filter === 'fulfilled'} onClick={() => setFilter('fulfilled')} label="🎉 已履約" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📖</div>
          <p className="text-gray-400">還沒有投資任何故事</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const progress = Math.min(100, Math.round((inv.stories.current_stardust / inv.stories.product_price) * 100));
            const isFulfilled = inv.stories.status === 'fulfilled';
            return (
              <div key={inv.id} className="glass rounded-2xl p-4 glow-border">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{inv.stories.cover_emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-amber-100 truncate">{inv.stories.product_name}</h3>
                      {isFulfilled && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 flex-shrink-0">已履約</span>}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">
                      你注入了 <span className="text-amber-300 font-bold">{inv.amount}</span> 星塵
                      {inv.message && <span className="text-gray-500"> ·「{inv.message}」</span>}
                    </p>
                    <div className="stardust-bar mb-2">
                      <div className="stardust-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{progress}%</span>
                      {isFulfilled && (
                        <button
                          onClick={() => handleViewFulfillment(inv.stories.id)}
                          className="text-xs touch-btn px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-400/30 text-green-300 hover:bg-green-500/25 transition-all"
                        >
                          📦 查看開箱與感謝信
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fulfillment detail modal */}
      {selectedFulfillment && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm scale-in"
          onClick={() => setSelectedFulfillment(null)}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-md p-6 glow-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-3">{selectedFulfillment.unboxing_emoji}</div>
              <h3 className="text-lg font-bold text-amber-200">開箱照片與感謝信</h3>
            </div>
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap italic">
                「{selectedFulfillment.thank_you_letter}」
              </p>
            </div>
            <p className="text-xs text-gray-500 text-center mb-4">— 匿名感謝信</p>
            <button
              onClick={() => setSelectedFulfillment(null)}
              className="w-full touch-btn bg-amber-500/15 border border-amber-400/30 text-amber-200 rounded-xl py-3 hover:bg-amber-500/25 transition-all"
            >
              關閉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`touch-btn px-4 py-2 rounded-full text-sm transition-all ${
        active ? 'tag-chip-active border' : 'glass border border-white/10 text-gray-300 hover:border-amber-400/30'
      }`}
    >
      {label}
    </button>
  );
}

// ===== Memorial Tab =====
function MemorialTab() {
  const { session, profile } = useAuth();
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [fulfillments, setFulfillments] = useState<Fulfillment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.id) return;
    Promise.all([
      supabase.from('stories').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
    ]).then(([storyResult]) => {
      const stories = (storyResult.data as Story[]) || [];
      setMyStories(stories);
      const fulfilledStoryIds = stories.filter((s) => s.status === 'fulfilled').map((s) => s.id);
      if (fulfilledStoryIds.length > 0) {
        supabase
          .from('fulfillments')
          .select('*')
          .in('story_id', fulfilledStoryIds)
          .then(({ data }) => {
            setFulfillments((data as Fulfillment[]) || []);
          });
      }
      setLoading(false);
    });
  }, [session]);

  if (loading) return <div className="text-center py-16 text-gray-400">載入中...</div>;

  const fulfilledCount = myStories.filter((s) => s.status === 'fulfilled').length;
  const totalRaised = myStories.reduce((sum, s) => sum + s.current_stardust, 0);

  const ratingStars: Record<string, number> = { '新星': 1, '星塵': 2, '銀河': 3, '傳說': 4 };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-amber-100 flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-300" />
        星願紀念館
      </h2>

      {/* Credit rating card */}
      <div className="glass rounded-2xl p-6 glow-border text-center">
        <div className="text-5xl mb-3">{profile?.avatar_emoji || '🌙'}</div>
        <h3 className="text-xl font-bold text-amber-100 mb-2">{profile?.display_name}</h3>
        <div className="flex items-center justify-center gap-1 mb-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < (ratingStars[profile?.credit_rating || '新星'] || 1)
                  ? 'text-amber-400 fill-amber-400 glow-text'
                  : 'text-gray-700'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-amber-200 font-bold">{profile?.credit_rating || '新星'}級</p>
        <p className="text-xs text-gray-500 mt-1">大沙漏信用評級</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-300">{fulfilledCount}</p>
          <p className="text-xs text-gray-400 mt-1">已圓夢數</p>
        </div>
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-300">{totalRaised.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">累計收到星塵</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass rounded-2xl p-5 glow-border">
        <h3 className="text-sm font-bold text-amber-200 mb-4 flex items-center gap-2">
          <History className="w-4 h-4" />
          圓夢時間軸
        </h3>
        {myStories.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-8">尚未有圓夢紀錄</p>
        ) : (
          <div className="space-y-3">
            {myStories.map((story, i) => {
              const fulfillment = fulfillments.find((f) => f.story_id === story.id);
              const isFulfilled = story.status === 'fulfilled';
              return (
                <div key={story.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${isFulfilled ? 'bg-green-400' : 'bg-amber-400/50'}`} />
                    {i < myStories.length - 1 && <div className="w-0.5 flex-1 bg-white/10 mt-1" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{story.cover_emoji}</span>
                      <span className="text-sm font-bold text-amber-100">{story.product_name}</span>
                      {isFulfilled && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(story.created_at).toLocaleDateString('zh-TW')}
                      {isFulfilled && fulfillment && ` · 已上傳開箱`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-gray-600 py-4">
        此頁面純粹作為誠信背書展示，無任何聊天或送禮功能
      </p>
    </div>
  );
}
