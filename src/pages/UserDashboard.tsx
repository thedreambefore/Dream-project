// src/pages/UserDashboard.tsx
import { useState, useEffect } from 'react';
import {
  X,
  Loader2,
  BookOpen,
  Award,
  Plus,
  LogOut,
  UserCircle,
  Save,
  Sparkles,
  Coins,
  Heart,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';
import { WishCard } from '@/components/WishCard';
import type { Wish } from '@/types/wish';

const SENSITIVE_WORDS = ['詐騙', '匯款', '違禁品', '賭博', '毒品', '槍械'];

export type TabId = 'account' | 'myWishes' | 'publish' | 'wallet' | 'invested';

export function UserDashboard({
  onClose,
  onGoHome,
  onOpenAdmin,
  initialTab = 'account',
}: {
  onClose: () => void;
  onGoHome: () => void;
  onOpenAdmin?: () => void;
  initialTab?: TabId;
}) {
  const { profile, refreshProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);

  // 當外部傳入的 initialTab 改變時同步更新
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
            <button
              onClick={onOpenAdmin}
              className="bg-red-500/20 border border-red-400/40 text-red-200 text-xs px-3 py-1.5 rounded-xl font-bold animate-pulse"
            >
              🛠️ 管理後台
            </button>
          )}
          <button
            onClick={async () => {
              await logout();
              window.location.reload();
            }}
            className="flex items-center gap-1 text-xs text-red-300 hover:text-red-200 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> <span>登出</span>
          </button>
          <button
            onClick={onClose}
            className="rounded-full hover:bg-white/10 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 標籤切換列 */}
      <div className="sticky top-16 z-10 glass border-b border-white/5 px-4 sm:px-6 bg-zinc-950/60 backdrop-blur-sm">
        <div className="flex gap-1 overflow-x-auto hide-scrollbar max-w-4xl mx-auto">
          <TabButton id="account" activeTab={activeTab} onClick={setActiveTab} icon={<UserCircle className="w-4 h-4" />} label="帳號資訊" />
          <TabButton id="myWishes" activeTab={activeTab} onClick={setActiveTab} icon={<Sparkles className="w-4 h-4" />} label="我的心願" />
          <TabButton id="publish" activeTab={activeTab} onClick={setActiveTab} icon={<Plus className="w-4 h-4" />} label="發布夢想" />
          <TabButton id="wallet" activeTab={activeTab} onClick={setActiveTab} icon={<Award className="w-4 h-4" />} label="星光榮譽榜" />
          <TabButton id="invested" activeTab={activeTab} onClick={setActiveTab} icon={<BookOpen className="w-4 h-4" />} label="追番牆" />
        </div>
      </div>

      {/* 內文主區塊 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'myWishes' && <MyWishesTab onEditWish={() => setActiveTab('publish')} />}
        {activeTab === 'publish' && <PublishTab onRequireVerify={() => setShowPhoneVerify(true)} />}
        {activeTab === 'wallet' && <WalletTab />}
        {activeTab === 'invested' && <InvestedTab />}
      </div>

      {showPhoneVerify && (
        <PhoneVerificationModal
          onClose={() => setShowPhoneVerify(false)}
          onVerified={async () => {
            await refreshProfile();
          }}
        />
      )}
    </div>
  );
}

function TabButton({
  id,
  activeTab,
  onClick,
  icon,
  label,
}: {
  id: TabId;
  activeTab: TabId;
  onClick: (id: TabId) => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-1.5 px-5 py-3.5 border-b-2 transition-all text-sm whitespace-nowrap cursor-pointer ${
        activeTab === id
          ? 'border-amber-400 text-amber-200 font-bold bg-white/5'
          : 'border-transparent text-gray-400 hover:text-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  );
}

// ===== 1. 帳號資訊 Tab =====
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
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUserId)
          .maybeSingle();

        if (data && isMounted) {
          setRealName(data.real_name ?? '');
          setNickname(data.anonymous_nickname ?? '匿名星旅人');
          setPhone(data.phone ?? '');
          setAddress(data.address ?? '');
        } else if (profile && isMounted) {
          setRealName(profile.real_name ?? '');
          setNickname(profile.anonymous_nickname ?? '匿名星旅人');
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
    return () => {
      isMounted = false;
    };
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
      const { error: upsertError } = await supabase.from('users').upsert(
        {
          id: currentUserId,
          real_name: realName.trim() || null,
          anonymous_nickname: nickname.trim() || '匿名星旅人',
          phone: phone.trim() || null,
          address: address.trim() || null,
        },
        { onConflict: 'id' }
      );

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
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400">
              ✓ 台灣手機強驗證已成功解鎖
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-gray-400">
              ⚠️ 手機未強驗證（發布夢想功能受限）
            </span>
          )}
        </div>
      </div>
      <form onSubmit={handleSave} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glow-border">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">舞台真實姓名（物流核對用，不公開）</label>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="例如：王小明"
            className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-2">匿名陌生人暱稱（平台顯示名稱）</label>
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
          <label className="block text-xs font-medium text-gray-300 mb-2">聯絡電話（台灣手機號碼）</label>
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
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black text-sm py-3 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saved ? '✨ 星沙印記儲存成功！' : '儲存全站帳號設定'}
        </button>
      </form>
    </div>
  );
}

// ===== 2. 發布夢想 Tab =====
function PublishTab({ onRequireVerify }: { onRequireVerify: () => void }) {
  const { session, profile, isBanned } = useAuth();

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [promise, setPromise] = useState('');
  const [productPrice, setProductPrice] = useState<number>(500);
  const [productUrl, setProductUrl] = useState('');
  const [tagName, setTagName] = useState('學生苦讀中');
  const [coverEmoji, setCoverEmoji] = useState('✨');

  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tags = ['學生苦讀中', '面試大作戰', '毛孩的願望', '生日邊緣人', '創作旅途', '日常微光'];
  const emojis = ['✨', '💻', '📚', '🐾', '🎨', '🎵', '☕', '👟', '🎒', '🌱'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('請上傳圖片格式檔案 (JPG / PNG / WebP)');
      return;
    }

    setCompressing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImageBase64(compressedDataUrl);
        }
        setCompressing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePublishClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isBanned) {
      setError('🚫 您的帳號已被停權，無法發布任何願望。');
      return;
    }

    if (!profile?.is_phone_verified) {
      onRequireVerify();
      return;
    }

    for (const word of SENSITIVE_WORDS) {
      if (title.includes(word) || story.includes(word) || promise.includes(word)) {
        setError(`防護盾牌提示：內容包含敏感詞 [ ${word} ]，請修正後再提交。`);
        return;
      }
    }

    if (title.length > 20) {
      setError('標題不能超過 20 字');
      return;
    }
    if (story.length > 200) {
      setError('故事內文不能超過 200 字');
      return;
    }
    if (productPrice <= 0) {
      setError('目標金額需大於 0');
      return;
    }

    setSubmitting(true);
    try {
      const currentUserId = session?.user?.id;
      if (!currentUserId) throw new Error('請先登入');

      const payload = {
        user_id: currentUserId,
        title: title.trim(),
        product_name: title.trim(),
        product_price: Number(productPrice),
        current_stardust: 0,
        tag_name: tagName,
        cover_emoji: coverEmoji,
        story_text: story.trim(),
        promise_text: promise.trim() || '願望達成後公開回饋與開箱感謝信！',
        image_url: imageBase64,
        product_url: productUrl.trim() || null,
        status: 'pending',
        block_reason: null,
      };

      const { error: insertError } = await supabase.from('wishes').insert(payload);
      if (insertError) throw insertError;

      setSuccess(true);
      setTitle('');
      setStory('');
      setPromise('');
      setProductUrl('');
      setImageBase64(null);
    } catch (err: any) {
      setError(`發布失敗: ${err.message || '請確認網路狀態'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-amber-300" /> 發布夢想沙漏
      </h2>

      {success ? (
        <div className="glass rounded-2xl p-8 glow-border text-center space-y-3 bg-zinc-900/60">
          <div className="text-5xl animate-bounce">⏳</div>
          <h3 className="text-lg font-bold text-amber-200">願望已送交星際審核室！</h3>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
            為了杜絕不當內容與詐騙，管理團隊將在 24 小時內完成人工審核。通過後將自動點亮於前台願望交易所！
          </p>
          <button
            onClick={() => setSuccess(false)}
            className="text-xs text-amber-300 border border-amber-400/40 px-4 py-2 rounded-xl hover:bg-amber-500/10 transition-all cursor-pointer mt-2"
          >
            繼續寫下另一個願望
          </button>
        </div>
      ) : (
        <form onSubmit={handlePublishClick} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glow-border">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-gray-300">願望物品 / 核心目標 (限 20 字)</label>
              <span className={`text-[11px] font-mono ${title.length > 20 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                {title.length}/20
              </span>
            </div>
            <input
              type="text"
              value={title}
              maxLength={20}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：二手電繪板 (供課後創作)"
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">分類標籤</label>
              <select
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400/50"
              >
                {tags.map((t) => (
                  <option key={t} value={t} className="bg-zinc-900 text-white">#{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">願望星宿圖示</label>
              <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                {emojis.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setCoverEmoji(em)}
                    className={`w-9 h-9 rounded-lg text-base flex-shrink-0 transition-all ${
                      coverEmoji === em ? 'bg-amber-500/30 border border-amber-400' : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">心願所需星塵 (NT$)</label>
              <input
                type="number"
                min={10}
                value={productPrice}
                onChange={(e) => setProductPrice(Number(e.target.value))}
                placeholder="例如：1200"
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400/50"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">商品電商連結</label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://shopee.tw/..."
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              情境照片上傳 <span className="text-zinc-500">(自動壓縮並套用星空濾鏡)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-200 hover:file:bg-amber-500/30 file:cursor-pointer"
            />
            {compressing && <p className="text-xs text-amber-300 mt-1">⏳ 正在壓縮並生成星空濾鏡遮罩...</p>}

            {imageBase64 && (
              <div className="mt-3 relative h-36 rounded-xl overflow-hidden border border-amber-400/30">
                <img src={imageBase64} alt="預覽" className="w-full h-full object-cover brightness-60 contrast-125" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#120e28]/85 to-[#241446]/60 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a1a]" />
                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[10px] text-amber-200">
                  <span>✨ 星空殘影同化效果預覽成功</span>
                  <button type="button" onClick={() => setImageBase64(null)} className="text-red-400 hover:text-red-300 underline">
                    移除圖片
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-gray-300">您的困境故事 (限 200 字)</label>
              <span className={`text-[11px] font-mono ${story.length > 200 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                {story.length}/200
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={200}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="請誠摯分享您的故事與現狀..."
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">終章承諾 (滿願後的回饋，如開箱信、成果圖)</label>
            <input
              type="text"
              value={promise}
              onChange={(e) => setPromise(e.target.value)}
              placeholder="例如：圓夢後將公開作品成果與手寫感謝卡！"
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
            />
          </div>

          {error && <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}

          <button
            type="submit"
            disabled={submitting || compressing}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black text-sm py-3.5 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            送交管理團隊審核 · 發布願望沙漏
          </button>
        </form>
      )}
    </div>
  );
}

// ===== 3. 🌟 升級版：星光貢獻榮譽館 (雙軌殿堂完整清單) =====
function WalletTab() {
  const { session, profile } = useAuth();
  const [hallTab, setHallTab] = useState<'fulfilled' | 'inTransit'>('fulfilled');

  // 個人在途數據
  const [myInTransitAmount, setMyInTransitAmount] = useState(0);

  // 全站榜單數據
  const [fulfilledTopUsers, setFulfilledTopUsers] = useState<any[]>([]);
  const [inTransitTopUsers, setInTransitTopUsers] = useState<any[]>([]);
  const [loadingHall, setLoadingHall] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHallData = async () => {
      setLoadingHall(true);

      // 1. 撈取個人在途燃料
      if (session?.user?.id) {
        const { data: invData } = await supabase
          .from('investments')
          .select('amount, wish_id, story_id')
          .eq('user_id', session.user.id);

        if (invData && invData.length > 0) {
          const wishIds = Array.from(new Set(invData.map((i) => i.wish_id || i.story_id).filter(Boolean)));
          const { data: wishData } = await supabase
            .from('wishes')
            .select('id, product_name, status')
            .in('id', wishIds);

          const wishMap = new Map(wishData?.map((w) => [w.id, w]) || []);
          const activeList = invData
            .filter((inv) => {
              const w = wishMap.get(inv.wish_id || inv.story_id);
              return w && w.status !== 'fulfilled';
            })
            .map((inv) => ({
              amount: inv.amount,
              product_name: wishMap.get(inv.wish_id || inv.story_id)?.product_name || '進行中心願',
            }));

          if (isMounted) {
            setMyInTransitAmount(activeList.reduce((acc, curr) => acc + (curr.amount || 0), 0));
          }
        }
      }

      // 2. 殿堂軌道 A：已履約榮譽星塵前 10 名
      const { data: fulfilledData } = await supabase
        .from('users')
        .select('id, anonymous_nickname, wallet_balance')
        .gt('wallet_balance', 0)
        .order('wallet_balance', { ascending: false })
        .limit(10);

      if (isMounted && fulfilledData) {
        setFulfilledTopUsers(fulfilledData);
      }

      // 3. 殿堂軌道 B：在途燃料守護者前 10 名
      const { data: allActiveInvs } = await supabase
        .from('investments')
        .select('user_id, amount, wish_id, story_id, users:user_id(anonymous_nickname)');

      if (allActiveInvs && isMounted) {
        const userTransitMap: Record<string, { nickname: string; total: number }> = {};
        allActiveInvs.forEach((inv) => {
          if (inv.user_id) {
            const nick = (inv as any).users?.anonymous_nickname || '匿名星旅人';
            if (!userTransitMap[inv.user_id]) {
              userTransitMap[inv.user_id] = { nickname: nick, total: 0 };
            }
            userTransitMap[inv.user_id].total += Number(inv.amount || 0);
          }
        });

        const sortedTransit = Object.entries(userTransitMap)
          .map(([id, val]) => ({ id, anonymous_nickname: val.nickname, amount: val.total }))
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 10);

        setInTransitTopUsers(sortedTransit);
      }

      if (isMounted) setLoadingHall(false);
    };

    loadHallData();
    return () => {
      isMounted = false;
    };
  }, [session?.user?.id]);

  const totalHonor = profile?.wallet_balance ?? 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-300" /> 星光貢獻榮譽殿堂
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">見證每位星旅人投入的真實善意與在途守護</p>
        </div>
      </div>

      {/* 個人星光總覽雙卡 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/20 p-5 rounded-2xl glow-border">
          <p className="text-zinc-400 text-[11px] font-bold tracking-wider mb-1">
            已圓滿履約見證星塵 (HONOR)
          </p>
          <h4 className="text-2xl font-black text-amber-300 font-mono flex items-baseline gap-1">
            <span>✨</span>
            <span>{totalHonor.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-500 font-normal ml-1">榮譽點</span>
          </h4>
          <p className="text-[10px] text-zinc-500 mt-1.5">故事完成開箱履約後轉化之永久印記</p>
        </div>

        <div className="bg-zinc-900/70 border border-white/10 p-5 rounded-2xl">
          <p className="text-zinc-400 text-[11px] font-bold tracking-wider mb-1">
            進行中在途燃料 (IN TRANSIT)
          </p>
          <h4 className="text-2xl font-black text-yellow-200 font-mono flex items-baseline gap-1">
            <span>⏳</span>
            <span>{myInTransitAmount.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-500 font-normal ml-1">在途星塵</span>
          </h4>
          <p className="text-[10px] text-zinc-500 mt-1.5">正陪伴主角奔向目標，等待圓滿履約</p>
        </div>
      </div>

      {/* 殿堂排行榜雙軌切換 */}
      <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-900/60 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex bg-zinc-950 border border-white/10 p-1 rounded-xl text-xs gap-1">
            <button
              type="button"
              onClick={() => setHallTab('fulfilled')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                hallTab === 'fulfilled'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              🌌 傳奇引路榜 (已履約總額)
            </button>
            <button
              type="button"
              onClick={() => setHallTab('inTransit')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                hallTab === 'inTransit'
                  ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              ⏳ 在途守護榜 (當前在途)
            </button>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">全站匿名 TOP 10</span>
        </div>

        {/* 殿堂清單展示 */}
        {loadingHall ? (
          <div className="text-center py-10 text-xs text-zinc-500">正在同步全星空榮譽榜單...</div>
        ) : (
          <div className="space-y-2">
            {(hallTab === 'fulfilled' ? fulfilledTopUsers : inTransitTopUsers).length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500">虛位以待，等待第一顆引路星點亮</div>
            ) : (
              (hallTab === 'fulfilled' ? fulfilledTopUsers : inTransitTopUsers).map((u, idx) => (
                <div
                  key={u.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                    idx === 0
                      ? 'bg-amber-500/15 border-amber-400/40 shadow-sm'
                      : idx === 1
                      ? 'bg-white/5 border-white/15'
                      : idx === 2
                      ? 'bg-amber-900/10 border-amber-600/20'
                      : 'bg-zinc-950/60 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-mono font-black text-sm w-5 text-center ${
                        idx === 0
                          ? 'text-amber-300'
                          : idx === 1
                          ? 'text-slate-300'
                          : idx === 2
                          ? 'text-amber-600'
                          : 'text-zinc-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 text-zinc-950 font-bold flex items-center justify-center text-xs shadow-inner">
                      {u.anonymous_nickname.substring(0, 1)}
                    </div>
                    <span className="font-bold text-zinc-200">{u.anonymous_nickname}</span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-amber-300 font-bold text-sm">
                      ✨ {(hallTab === 'fulfilled' ? u.wallet_balance : u.amount).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-zinc-500 ml-1">星塵</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 4. 我的心願 Tab =====
function MyWishesTab({ onEditWish: _onEditWish }: { onEditWish: () => void }) {
  const { session } = useAuth();
  const [myWishes, setMyWishes] = useState<Wish[]>([]);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // 💌 感謝信撰寫狀態
  const [letterWish, setLetterWish] = useState<Wish | null>(null);
  const [thankYouLetter, setThankYouLetter] = useState('');
  const [unboxingPhoto, setUnboxingPhoto] = useState<string | null>(null);
  const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [savingLetter, setSavingLetter] = useState(false);

  // ✏️ 重編願望狀態
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState<number>(500);
  const [editProductUrl, setEditProductUrl] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editPromise, setEditPromise] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadMyWishes = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    setMyWishes((data as Wish[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadMyWishes();
  }, [session?.user?.id]);

  const handleStartEdit = (w: Wish) => {
    setEditingWish(w);
    setEditTitle(w.product_name || w.title || '');
    setEditPrice(Number(w.product_price) || 500);
    setEditProductUrl(w.product_url || '');
    setEditStory(w.story_text || '');
    setEditPromise(w.promise_text || '');
  };

  const handleResubmit = async () => {
    if (!editingWish) return;
    setSavingEdit(true);
    try {
      const { error } = await supabase
        .from('wishes')
        .update({
          title: editTitle.trim(),
          product_name: editTitle.trim(),
          product_price: Number(editPrice),
          product_url: editProductUrl.trim() || null,
          story_text: editStory.trim(),
          promise_text: editPromise.trim(),
          status: 'pending',
          block_reason: null,
        })
        .eq('id', editingWish.id);

      if (error) throw error;
      alert('✨ 已重新提交！請等待管理員審核。');
      setEditingWish(null);
      loadMyWishes();
    } catch (e: any) {
      alert(`更新失敗: ${e.message}`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleOpenLetterModal = (w: Wish) => {
    setLetterWish(w);
    setThankYouLetter(w.thank_you_letter || '');
    setUnboxingPhoto(w.unboxing_photo_url || null);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setUnboxingPhoto(canvas.toDataURL('image/jpeg', 0.7));
        }
        setCompressingPhoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitLetter = async () => {
    if (!letterWish || !thankYouLetter.trim()) return alert('請填寫感謝信內文');
    setSavingLetter(true);
    try {
      await supabase
        .from('wishes')
        .update({
          thank_you_letter: thankYouLetter.trim(),
          unboxing_photo_url: unboxingPhoto,
          letter_status: 'pending',
          letter_reject_reason: null,
        })
        .eq('id', letterWish.id);

      alert('💌 開箱感謝信已提交星際管理室審查！通過後將公開於所有贊助者的追番牆！');
      setLetterWish(null);
      loadMyWishes();
    } catch (e: any) {
      alert(`提交失敗: ${e.message}`);
    } finally {
      setSavingLetter(false);
    }
  };

  const filteredList = myWishes.filter((w) => {
    if (filterTag === 'all') return true;
    if (filterTag === 'approved') return w.status === 'approved';
    if (filterTag === 'pending') return w.status === 'pending';
    if (filterTag === 'blocked') return w.status === 'blocked';
    if (filterTag === 'fulfilled') return w.status === 'fulfilled' || w.status === 'full_funded';
    return true;
  });

  if (loading) return <div className="text-center py-16 text-zinc-500">正在探尋您的星願紀錄...</div>;

  return (
    <div className="max-w-4xl space-y-5 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-300" /> 我的心願追蹤館
        </h2>

        <div className="flex bg-zinc-900 border border-white/10 p-1 rounded-xl text-xs gap-1">
          {[
            { id: 'all', label: '全部' },
            { id: 'approved', label: '🌟 募資中' },
            { id: 'pending', label: '⏳ 審核中' },
            { id: 'fulfilled', label: '🎉 已滿額' },
            { id: 'blocked', label: '❌ 已駁回' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTag(tab.id)}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                filterTag === tab.id
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-zinc-900/30 text-zinc-500">
          此分類下目前無心願。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((w, idx) => (
            <WishCard
              key={w.id}
              wish={w}
              index={idx}
              variant="myWishes"
              onOpenLetterModal={handleOpenLetterModal}
              onOpenEditModal={handleStartEdit}
            />
          ))}
        </div>
      )}

      {/* ✏️ 重新編輯送審 Modal */}
      {editingWish && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-strong rounded-2xl w-full max-w-lg p-6 glow-border border-amber-400/30 bg-zinc-950 space-y-4 my-auto">
            <h3 className="text-base font-bold text-amber-200">修正內容重新送審</h3>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">願望標題 (限 20 字)</label>
              <input
                type="text"
                maxLength={20}
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">目標星塵 (NT$)</label>
                <input
                  type="number"
                  min={10}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-amber-300 font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">電商連結</label>
                <input
                  type="url"
                  value={editProductUrl}
                  onChange={(e) => setEditProductUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">故事內文 (限 200 字)</label>
              <textarea
                rows={4}
                maxLength={200}
                value={editStory}
                onChange={(e) => setEditStory(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none"
                required
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">終章承諾</label>
              <input
                type="text"
                value={editPromise}
                onChange={(e) => setEditPromise(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingWish(null)}
                className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleResubmit}
                disabled={savingEdit}
                className="flex-1 py-2.5 text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl cursor-pointer"
              >
                {savingEdit ? '提交中...' : '確認更新並重新送審'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💌 上傳／修改終章感謝信 Modal */}
      {letterWish && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-strong rounded-2xl w-full max-w-lg p-6 glow-border border-purple-500/30 bg-zinc-950 space-y-4 my-auto">
            <h3 className="text-base font-bold text-purple-300">💌 發布開箱感謝信 (需經管理員審核)</h3>
            <p className="text-xs text-zinc-400">
              審核通過後將公開於所有贊助者的追番牆，審核期間將鎖定無法隨意變更。
            </p>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">開箱成果照片 (可選)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="block w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-purple-500/20 file:text-purple-300"
              />
              {compressingPhoto && <p className="text-[10px] text-amber-300 mt-1">⏳ 照片壓縮中...</p>}
              {unboxingPhoto && (
                <div className="mt-2 relative h-32 rounded-xl overflow-hidden border border-white/10">
                  <img src={unboxingPhoto} alt="預覽" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setUnboxingPhoto(null)}
                    className="absolute top-2 right-2 bg-black/70 text-red-400 text-xs px-2 py-0.5 rounded-md cursor-pointer"
                  >
                    刪除
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">感謝信內文</label>
              <textarea
                rows={4}
                value={thankYouLetter}
                onChange={(e) => setThankYouLetter(e.target.value)}
                placeholder="誠摯感謝每位陌生人星光的相助... 請分享您收到商品的心得與實現承諾的成果！"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white resize-none"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setLetterWish(null)}
                className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSubmitLetter}
                disabled={savingLetter || compressingPhoto}
                className="flex-1 py-2.5 text-xs bg-purple-500 hover:bg-purple-400 text-zinc-950 font-bold rounded-xl cursor-pointer"
              >
                {savingLetter ? '送出中...' : '提交審查'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 5. 追番牆 Tab =====
function InvestedTab() {
  const { session } = useAuth();
  const [trackedWishes, setTrackedWishes] = useState<Wish[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'invested' | 'bookmarked'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'funding' | 'fulfilled'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracked = async () => {
      if (!session?.user?.id) return;
      setLoading(true);

      const { data: bData } = await supabase
        .from('bookmarks')
        .select('wish_id')
        .eq('user_id', session.user.id);

      const { data: iData } = await supabase
        .from('investments')
        .select('wish_id, story_id, amount')
        .eq('user_id', session.user.id);

      const investMap = new Map();
      iData?.forEach((inv) => {
        const id = inv.wish_id || inv.story_id;
        if (id) investMap.set(id, (investMap.get(id) || 0) + Number(inv.amount || 0));
      });

      const bookmarkedSet = new Set(bData?.map((b) => b.wish_id).filter(Boolean) || []);
      const allWishIds = Array.from(new Set([...Array.from(bookmarkedSet), ...Array.from(investMap.keys())]));

      if (allWishIds.length > 0) {
        const { data: wishList } = await supabase.from('wishes').select('*').in('id', allWishIds);
        if (wishList) {
          const merged: Wish[] = wishList.map((w: Wish) => ({
            ...w,
            myInvestAmount: investMap.get(w.id) || 0,
            hasInvested: investMap.has(w.id),
            isBookmarked: bookmarkedSet.has(w.id),
            isBookmarkedOnly: !investMap.has(w.id) && bookmarkedSet.has(w.id),
          }));
          setTrackedWishes(merged);
        }
      } else {
        setTrackedWishes([]);
      }
      setLoading(false);
    };
    loadTracked();
  }, [session?.user?.id]);

  const filtered = trackedWishes.filter((w) => {
    const matchSearch =
      (w.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.tag_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchSearch) return false;

    if (sourceFilter === 'invested' && !w.hasInvested) return false;
    if (sourceFilter === 'bookmarked' && !w.isBookmarkedOnly) return false;

    if (statusFilter === 'funding' && w.status === 'fulfilled') return false;
    if (statusFilter === 'fulfilled' && w.status !== 'fulfilled') return false;

    return true;
  });

  if (loading) return <div className="text-center py-16 text-zinc-500">正在探尋您的追番心願牆...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-300" /> 心願追番結局牆
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            點擊卡片翻面即可重溫初衷；點擊背面按鈕可開啟專屬漂流瓶與主角開箱信！
          </p>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 搜尋追番故事或標籤..."
          className="bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 p-2 bg-zinc-900/60 rounded-2xl border border-white/5">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 font-bold px-1.5">來源:</span>
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
              sourceFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            全部追番
          </button>
          <button
            onClick={() => setSourceFilter('invested')}
            className={`px-3 py-1 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer ${
              sourceFilter === 'invested'
                ? 'bg-amber-500/25 border border-amber-400/40 text-amber-200 font-bold'
                : 'text-zinc-400 hover:text-amber-200'
            }`}
          >
            <Coins className="w-3 h-3 text-amber-400" /> 曾注入燃料
          </button>
          <button
            onClick={() => setSourceFilter('bookmarked')}
            className={`px-3 py-1 rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer ${
              sourceFilter === 'bookmarked'
                ? 'bg-rose-500/25 border border-rose-400/40 text-rose-200 font-bold'
                : 'text-zinc-400 hover:text-rose-200'
            }`}
          >
            <Heart className="w-3 h-3 text-rose-400" /> 純愛心追番
          </button>
        </div>

        <div className="hidden sm:block w-[1px] h-5 bg-white/15 mx-1" />

        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 font-bold px-1.5">狀態:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
              statusFilter === 'all' ? 'bg-white/15 text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            所有狀態
          </button>
          <button
            onClick={() => setStatusFilter('funding')}
            className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
              statusFilter === 'funding'
                ? 'bg-sky-500/20 border border-sky-400/30 text-sky-200 font-bold'
                : 'text-zinc-400 hover:text-sky-200'
            }`}
          >
            ⏳ 集資進行中
          </button>
          <button
            onClick={() => setStatusFilter('fulfilled')}
            className={`px-3 py-1 rounded-xl text-xs transition-all cursor-pointer ${
              statusFilter === 'fulfilled'
                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-bold'
                : 'text-zinc-400 hover:text-emerald-200'
            }`}
          >
            🎉 已履約開箱
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-zinc-900/30 text-zinc-500">
          {searchTerm || sourceFilter !== 'all' || statusFilter !== 'all'
            ? '在此交叉條件下暫無追番故事，請嘗試調整上方過濾條件。'
            : '您目前尚未收藏或贊助過任何故事，快去首頁看看吧！'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((w, idx) => (
            <WishCard key={w.id} wish={w} index={idx} variant="tracked" />
          ))}
        </div>
      )}
    </div>
  );
}
