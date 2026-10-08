import { useState, useEffect } from 'react';
import { X, Loader2, Wallet, BookOpen, Award, Plus, LogOut, UserCircle, Save, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { PhoneVerificationModal } from '@/components/PhoneVerificationModal';

// 🚨 補上先前遺漏的敏感詞定義，徹底消滅 Rollup traceVariable 崩潰
const SENSITIVE_WORDS = ['詐騙', '匯款', '違禁品', '賭博', '毒品', '槍械'];

type TabId = 'account' | 'myWishes' | 'publish' | 'wallet' | 'invested' | 'memorial';

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
        {activeTab === 'invested' && <div className="max-w-md mx-auto text-center border border-slate-800 bg-slate-900/10 rounded-2xl p-12 text-gray-500"><BookOpen className="mx-auto mb-3 opacity-40 w-8 h-8"/>結局牆目前空空如也，快去首頁看看故事吧！</div>}
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

// ===== 2. 發布夢想分頁 (Publish Tab) =====
function PublishTab({ onRequireVerify }: { onRequireVerify: () => void }) {
  const { session, profile } = useAuth();

  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [promise, setPromise] = useState('');
  const [productPrice, setProductPrice] = useState<number>(500);
  const [productUrl, setProductUrl] = useState('');
  const [tagName, setTagName] = useState('學生苦讀中');
  const [coverEmoji, setCoverEmoji] = useState('✨');
  
  // 圖片上傳與壓縮預覽
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tags = ['學生苦讀中', '面試大作戰', '毛孩的願望', '生日邊緣人', '創作旅途', '日常微光'];
  const emojis = ['✨', '💻', '📚', '🐾', '🎨', '🎵', '☕', '👟', '🎒', '🌱'];

  // 📷 客戶端圖片壓縮引擎 (降畫質、壓至小尺寸，免佔伺服器空間)
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
        // 設定最大解析度為 800px (維持清晰同時檔案極小)
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
          // 壓至 70% 畫質 JPEG (通常只有 40~70KB)
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

    if (profile?.role === 'banned') {
      setError('🚫 您的帳號因違反平台規範已被停權，目前無法發布任何願望。');
      return;
    }
    // 1. 手機強驗證防線
    if (!profile?.is_phone_verified) {
      onRequireVerify();
      return;
    }

    // 2. 敏感詞防護盾牌
    for (const word of SENSITIVE_WORDS) {
      if (title.includes(word) || story.includes(word) || promise.includes(word)) {
        setError(`防護盾牌提示：內容包含敏感詞 [ ${word} ]，請修正後再提交。`);
        return;
      }
    }

    // 3. 字數與數額檢查
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

// 4. 寫入資料庫：同時帶上 title 與 product_name 達成 100% 相容
      const payload = {
        user_id: currentUserId,
        title: title.trim(), // 🌟 補上這個！滿足 title NOT NULL 約束
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

      if (insertError) {
        console.error('Wishes 寫入錯誤詳情:', insertError);
        throw insertError;
      }

      setSuccess(true);
      setTitle('');
      setStory('');
      setPromise('');
      setProductUrl('');
      setImageBase64(null);
    } catch (err: any) {
      console.error('發布願望失敗:', err);
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
          {/* 標題 (限 20 字) */}
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
              placeholder="例如：二手電繪板 (供課後創作)"//標題範例
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
              required
            />
          </div>

          {/* 標籤與圖示選擇 */}
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

          {/* 目標金額與電商連結 */}
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
              <label className="block text-xs font-medium text-gray-300 mb-1.5">商品電商連結 (蝦皮 / MOMO / PChome)</label>
              <input
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="https://shopee.tw/..."
                className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400/50"
              />
            </div>
          </div>

          {/* 圖片上傳與即時深空濾鏡預覽 */}
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

            {/* 即時濾鏡預覽卡片 */}
            {imageBase64 && (
              <div className="mt-3 relative h-36 rounded-xl overflow-hidden border border-amber-400/30 group">
                <img
                  src={imageBase64}
                  alt="預覽"
                  className="w-full h-full object-cover brightness-60 contrast-125"
                />
                {/* 強制同化為深色星空殘影遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a1a] via-[#120e28]/85 to-[#241446]/60 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-[#0a0a1a]" />
                <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[10px] text-amber-200">
                  <span>✨ 星空殘影同化效果預覽成功</span>
                  <button
                    type="button"
                    onClick={() => setImageBase64(null)}
                    className="text-red-400 hover:text-red-300 underline"
                  >
                    移除圖片
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 故事內文 (限 200 字) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-gray-300">您的困境故事 (限 200 字，背面展示)</label>
              <span className={`text-[11px] font-mono ${story.length > 200 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                {story.length}/200
              </span>
            </div>
            <textarea
              rows={4}
              maxLength={200}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="請誠摯分享您的故事與現狀。大家將投入心願燃料，共同推進進度條來追這份故事的結局..."
              className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none"
              required
            />
          </div>

          {/* 終章承諾 */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">終章承諾 (滿願後的回饋，如開箱信、成果圖)</label>
            <input
              type="text"
              value={promise}
              onChange={(e) => setPromise(e.target.value)}
              placeholder="例如：圓夢後將公開作品成果與手寫感謝卡！"//承諾範例
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


// ===== 3. 星光榮譽館 (WalletTab：在途星塵暫存精準運算) =====
function WalletTab() {
  const { session, profile } = useAuth();
  const [inTransitAmount, setInTransitAmount] = useState(0);
  const [inTransitList, setInTransitList] = useState<any[]>([]);

  useEffect(() => {
    const calcTransit = async () => {
      if (!session?.user?.id) return;
      // 撈取用戶所有贊助紀錄
      const { data: invData } = await supabase
        .from('investments')
        .select('amount, wish_id, story_id')
        .eq('user_id', session.user.id);

      if (invData && invData.length > 0) {
        const wishIds = Array.from(new Set(invData.map((i) => i.wish_id || i.story_id).filter(Boolean)));
        
        // 查驗這些心願的履約狀態
        const { data: wishData } = await supabase
          .from('wishes')
          .select('id, product_name, status')
          .in('id', wishIds);

        const wishMap = new Map(wishData?.map((w) => [w.id, w]) || []);

        // 尚未真正履約出貨 (status !== 'fulfilled') 的全數歸入在途暫存區！
        const activeList = invData
          .filter((inv) => {
            const w = wishMap.get(inv.wish_id || inv.story_id);
            return w && w.status !== 'fulfilled';
          })
          .map((inv) => ({
            amount: inv.amount,
            product_name: wishMap.get(inv.wish_id || inv.story_id)?.product_name || '進行中心願',
          }));

        setInTransitList(activeList);
        const sum = activeList.reduce((acc, curr) => acc + (curr.amount || 0), 0);
        setInTransitAmount(sum);
      }
    };
    calcTransit();
  }, [session?.user?.id]);

  const totalHonor = profile?.wallet_balance ?? 0;

  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-300" /> 星光貢獻榮譽館
      </h2>

      <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/20 p-6 rounded-3xl glow-border">
        <p className="text-zinc-400 text-xs font-medium tracking-wider mb-1">COMPLETED HONOR · 已圓滿履約見證總額</p>
        <h4 className="text-3xl font-black text-amber-300 font-mono tracking-tight flex items-baseline gap-1">
          <span>✨</span>
          <span>{totalHonor.toLocaleString()}</span>
          <span className="text-xs text-zinc-500 font-normal ml-1">榮譽星塵點</span>
        </h4>
        <p className="text-[11px] text-zinc-500 mt-2">只有故事經管理員完成出貨履約後，燃料才會正式化為永久榮譽印記。</p>
      </div>

      <div className="glass rounded-2xl p-5 border border-amber-400/20 bg-zinc-900/60 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
              <span>⏳</span> 進行中心願暫存區 (在途燃料)
            </h3>
            <p className="text-[11px] text-zinc-400">故事推進中，正等待主角滿額與管理員出貨履約</p>
          </div>
          <span className="text-base font-black font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-400/30">
            {inTransitAmount.toLocaleString()} 星塵
          </span>
        </div>

        {inTransitList.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/5 max-h-48 overflow-y-auto hide-scrollbar">
            {inTransitList.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-zinc-950/60 p-2.5 rounded-xl border border-white/5">
                <span className="text-zinc-300 truncate max-w-[200px]">{item.product_name}</span>
                <span className="text-amber-400 font-mono font-bold">+{item.amount} 暫存星塵</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ===== 4. 我的心願館 (MyWishesTab：感謝信圖片上傳 + 審核閉環) =====
function MyWishesTab({ onEditWish }: { onEditWish: () => void }) {
  const { session } = useAuth();
  const [myWishes, setMyWishes] = useState<any[]>([]);
  const [filterTag, setFilterTag] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // ✏️ 重編願望狀態
  const [editingWish, setEditingWish] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState<number>(500);
  const [editProductUrl, setEditProductUrl] = useState('');
  const [editStory, setEditStory] = useState('');
  const [editPromise, setEditPromise] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // 💌 感謝信撰寫狀態 (含圖片上傳)
  const [letterWish, setLetterWish] = useState<any | null>(null);
  const [thankYouLetter, setThankYouLetter] = useState('');
  const [unboxingPhoto, setUnboxingPhoto] = useState<string | null>(null);
  const [compressingPhoto, setCompressingPhoto] = useState(false);
  const [savingLetter, setSavingLetter] = useState(false);

  const loadMyWishes = async () => {
    if (!session?.user?.id) return;
    setLoading(true);
    const { data } = await supabase
      .from('wishes')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    setMyWishes(data || []);
    setLoading(false);
  };

  useEffect(() => { loadMyWishes(); }, [session?.user?.id]);

  const handleStartEdit = (w: any) => {
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

  // 📷 感謝信開箱照壓縮
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

  // 送出感謝信審核 (鎖定不可直接改)
  const handleSubmitLetter = async () => {
    if (!letterWish || !thankYouLetter.trim()) return alert('請填寫感謝信內文');
    setSavingLetter(true);
    try {
      await supabase.from('wishes').update({
        thank_you_letter: thankYouLetter.trim(),
        unboxing_photo_url: unboxingPhoto,
        letter_status: 'pending', // 🌟 進入審核狀態，不可隨意修改！
        letter_reject_reason: null,
      }).eq('id', letterWish.id);
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
    if (filterTag === 'blocked') return w.status === 'blocked' || w.status === '已封鎖';
    if (filterTag === 'fulfilled') return w.status === 'fulfilled' || w.status === 'full_funded';
    return true;
  });

  if (loading) return <div className="text-center py-16 text-zinc-500">正在探尋您的星願紀錄...</div>;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
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
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterTag === tab.id ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30' : 'text-zinc-400'
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
        <div className="space-y-4">
          {filteredList.map((w) => {
            const isBlocked = w.status === 'blocked' || w.status === '已封鎖';
            const isPending = w.status === 'pending';
            const isFulfilled = w.status === 'fulfilled';
            const isFunded = w.status === 'full_funded';
            const letterStatus = w.letter_status || 'none';
            const progress = Math.min(100, Math.round(((w.current_stardust || 0) / (w.product_price || 1)) * 100));

            return (
              <div
                key={w.id}
                className={`rounded-2xl p-5 border transition-all ${
                  isBlocked
                    ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                    : isPending
                    ? 'bg-zinc-900/60 border-amber-400/20'
                    : 'bg-zinc-900/60 border-white/10'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{w.cover_emoji}</span>
                    <h3 className="font-bold text-amber-100 text-base">{w.product_name}</h3>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isBlocked ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                    isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    isFulfilled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' :
                    isFunded ? 'bg-yellow-500/20 text-yellow-300' : 'bg-emerald-500/10 text-emerald-300'
                  }`}>
                    {isBlocked ? '❌ 已駁回 / 下架' : isPending ? '⏳ 星際審核中' : isFulfilled ? '🎉 已履約完結' : isFunded ? '📦 募滿待出貨' : '🌟 集資進行中'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{w.story_text}</p>
                <p className="text-[11px] text-zinc-500 font-mono mb-3">目標：NT$ {w.product_price.toLocaleString()}</p>

                {/* 被駁回修正 */}
                {isBlocked && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-3 space-y-1.5">
                    <p className="text-xs font-bold text-red-300">⚠️ 駁回 / 下架原因：</p>
                    <p className="text-xs text-red-200/90 pl-2">{w.block_reason || '內容不符規範，請調整後重新送審。'}</p>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(w)}
                      className="mt-2 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 px-3 py-1.5 rounded-lg font-bold"
                    >
                      ✏️ 修正金額、連結與內容並再次提交
                    </button>
                  </div>
                )}

                {/* 💌 感謝信審核閉環專區 */}
                {(isFulfilled || isFunded) && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-emerald-300 font-bold">
                        {letterStatus === 'approved' ? '✓ 感謝信已審核通過並公開' :
                         letterStatus === 'pending' ? '⏳ 感謝信審核中 (暫不可修改)' :
                         letterStatus === 'rejected' ? '❌ 感謝信未通過審核' : '💌 集資已達標，請提交感謝信'}
                      </span>

                      {/* 只有在尚未提交，或被駁回時才給編輯！ */}
                      {(letterStatus === 'none' || letterStatus === 'rejected') && (
                        <button
                          onClick={() => {
                            setLetterWish(w);
                            setThankYouLetter(w.thank_you_letter || '');
                            setUnboxingPhoto(w.unboxing_photo_url || null);
                          }}
                          className="px-3 py-1 bg-emerald-500 text-zinc-950 font-bold rounded-lg text-xs"
                        >
                          {letterStatus === 'rejected' ? '修改重送感謝信' : '撰寫開箱感謝信'}
                        </button>
                      )}
                    </div>

                    {/* 駁回理由展示 */}
                    {letterStatus === 'rejected' && (
                      <p className="text-xs text-red-300 bg-red-500/10 p-2 rounded-lg">
                        駁回理由：{w.letter_reject_reason || '照片不清晰或感謝信過於簡略，請修改後重送。'}
                      </p>
                    )}
                  </div>
                )}

                {!isBlocked && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                      <span>進度: {w.current_stardust || 0} / {w.product_price} 星塵</span>
                      <span className="text-amber-300 font-bold">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ✏️ 完整重編彈窗 */}
      {editingWish && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-strong rounded-2xl w-full max-w-lg p-6 glow-border border-amber-400/30 bg-zinc-950 space-y-4 my-auto">
            <h3 className="text-base font-bold text-amber-200">修正內容重新送審</h3>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">願望標題 (限 20 字)</label>
              <input type="text" maxLength={20} value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white" required />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">目標星塵 (NT$)</label>
                <input type="number" min={10} value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-amber-300 font-mono" required />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">電商連結 (蝦皮/MOMO)</label>
                <input type="url" value={editProductUrl} onChange={(e) => setEditProductUrl(e.target.value)} placeholder="https://..." className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-white" />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">故事內文 (限 200 字)</label>
              <textarea rows={4} maxLength={200} value={editStory} onChange={(e) => setEditStory(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2.5 text-xs text-white resize-none" required />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">終章承諾</label>
              <input type="text" value={editPromise} onChange={(e) => setEditPromise(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-2 text-xs text-white" />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditingWish(null)} className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400">取消</button>
              <button onClick={handleResubmit} disabled={savingEdit} className="flex-1 py-2.5 text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl">
                {savingEdit ? '提交中...' : '確認更新並重新送審'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💌 上傳終章感謝信彈窗 (含開箱照壓縮) */}
      {letterWish && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-strong rounded-2xl w-full max-w-lg p-6 glow-border border-emerald-400/30 bg-zinc-950 space-y-4 my-auto">
            <h3 className="text-base font-bold text-emerald-300">💌 發布開箱感謝信 (需經管理員審核)</h3>
            <p className="text-xs text-zinc-400">審核通過後將公開於所有贊助者的追番牆，審核期間將鎖定無法隨意變更。</p>

            {/* 照片上傳 */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1">開箱成果照片 (可選)</label>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="block w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-500/20 file:text-emerald-300" />
              {compressingPhoto && <p className="text-[10px] text-amber-300 mt-1">⏳ 照片壓縮中...</p>}
              {unboxingPhoto && (
                <div className="mt-2 relative h-32 rounded-xl overflow-hidden border border-white/10">
                  <img src={unboxingPhoto} alt="預覽" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setUnboxingPhoto(null)} className="absolute top-2 right-2 bg-black/70 text-red-400 text-xs px-2 py-0.5 rounded-md">刪除</button>
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
              <button onClick={() => setLetterWish(null)} className="flex-1 py-2.5 text-xs border border-white/10 rounded-xl text-zinc-400">取消</button>
              <button onClick={handleSubmitLetter} disabled={savingLetter || compressingPhoto} className="flex-1 py-2.5 text-xs bg-emerald-500 text-zinc-950 font-bold rounded-xl">
                {savingLetter ? '送出中...' : '提交審查'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 5. 追番牆 (InvestedTab：聚合 ❤️ 愛心收藏與贊助追更 + 搜尋 + 開箱信圖文) =====
function InvestedTab() {
  const { session } = useAuth();
  const [trackedWishes, setTrackedWishes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracked = async () => {
      if (!session?.user?.id) return;
      setLoading(true);

      // 1. 撈取愛心收藏
      const { data: bData } = await supabase.from('bookmarks').select('wish_id').eq('user_id', session.user.id);
      // 2. 撈取贊助紀錄
      const { data: iData } = await supabase.from('investments').select('wish_id, story_id, amount').eq('user_id', session.user.id);

      const investMap = new Map();
      iData?.forEach((inv) => {
        const id = inv.wish_id || inv.story_id;
        if (id) investMap.set(id, (investMap.get(id) || 0) + (inv.amount || 0));
      });

      const allWishIds = Array.from(new Set([
        ...(bData?.map((b) => b.wish_id) || []),
        ...Array.from(investMap.keys())
      ].filter(Boolean)));

      if (allWishIds.length > 0) {
        const { data: wishList } = await supabase.from('wishes').select('*').in('id', allWishIds);
        if (wishList) {
          const merged = wishList.map((w) => ({
            ...w,
            myInvestAmount: investMap.get(w.id) || 0,
            isBookmarkedOnly: !investMap.has(w.id),
          }));
          setTrackedWishes(merged);
        }
      }
      setLoading(false);
    };
    loadTracked();
  }, [session?.user?.id]);

  const filtered = trackedWishes.filter((w) =>
    (w.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.tag_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-16 text-zinc-500">正在整理您的追番心願牆...</div>;

  return (
    <div className="max-w-2xl space-y-5 animate-fade-in">
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-300" /> 心願追番結局牆
        </h2>

        {/* 搜尋列 */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 搜尋追番故事或標籤..."
          className="bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-white/5 rounded-2xl bg-zinc-900/30 text-zinc-500">
          {searchTerm ? '未找到符合關鍵字的追番故事。' : '您目前尚未收藏或贊助過任何故事，點擊卡片愛心或注入星塵即可加入追番！'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((w) => {
            const isFulfilled = w.status === 'fulfilled';
            const progress = Math.min(100, Math.round(((w.current_stardust || 0) / (w.product_price || 1)) * 100));

            return (
              <div key={w.id} className="glass rounded-2xl p-5 border border-white/10 bg-zinc-900/60 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{w.cover_emoji}</span>
                    <div>
                      <h4 className="font-bold text-amber-100 text-sm">{w.product_name}</h4>
                      <p className="text-[11px] text-zinc-500">
                        {w.isBookmarkedOnly ? '❤️ 純愛心追番' : `🌟 贊助燃料：+${w.myInvestAmount} 星塵`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    isFulfilled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/10 text-amber-300'
                  }`}>
                    {isFulfilled ? '🎉 已履約圓夢' : `集資中 ${progress}%`}
                  </span>
                </div>

                {/* 創作者開箱感謝信 (需審核通過 letter_status === 'approved' 才展示) */}
                {w.letter_status === 'approved' && w.thank_you_letter && (
                  <div className="bg-emerald-950/20 border border-emerald-400/30 rounded-xl p-3.5 space-y-2">
                    <p className="text-xs font-bold text-emerald-300 flex items-center gap-1">💌 創作者終章開箱感謝信：</p>
                    {w.unboxing_photo_url && (
                      <div className="h-40 rounded-lg overflow-hidden border border-white/10">
                        <img src={w.unboxing_photo_url} alt="開箱照" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs text-zinc-200 leading-relaxed">{w.thank_you_letter}</p>
                  </div>
                )}

                {/* 官方祝福區 */}
                {w.admin_blessing && (
                  <div className="bg-amber-500/10 border border-amber-400/20 rounded-xl p-2.5 text-[11px] text-amber-200/90">
                    <span className="font-bold">👑 夢沙星空見證祝福：</span> {w.admin_blessing}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
