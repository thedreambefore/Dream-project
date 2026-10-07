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
          <TabButton id="wallet" activeTab={activeTab} onClick={setActiveTab} icon={<Wallet className="w-4 h-4" />} label="星光榮譽榜" />
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

      // 4. 寫入資料庫：全站只寫入 wishes 表
      const { error: insertError } = await supabase.from('wishes').insert({
        user_id: currentUserId,
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
      });

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
              placeholder="例如：二手電繪板 (供課後創作)"
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

function WalletTab() {
  const { profile } = useAuth();
  const contribution = profile?.wallet_balance ?? 0;

  // 榮譽稱號評級
  const getRank = (val: number) => {
    if (val >= 5000) return { title: '🌌 傳奇星河守護者', color: 'text-amber-300' };
    if (val >= 2000) return { title: '✨ 璀璨星宿築夢人', color: 'text-yellow-300' };
    if (val >= 500) return { title: '🌟 溫暖微光星旅人', color: 'text-emerald-300' };
    return { title: '🌱 初生星塵探索者', color: 'text-zinc-400' };
  };

  const rank = getRank(contribution);

  return (
    <div className="max-w-xl space-y-5 animate-fade-in">
      <h2 className="text-xl font-bold text-amber-100 flex items-center gap-2">
        <Award className="w-5 h-5 text-amber-300" /> 星光貢獻榮譽館
      </h2>

      <div className="bg-gradient-to-br from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/20 p-6 rounded-3xl relative overflow-hidden shadow-2xl glow-border">
        <p className="text-zinc-400 text-xs font-medium tracking-wider mb-1">
          TOTAL CONTRIBUTION · 累計心願燃料貢獻
        </p>
        <h4 className="text-3xl font-black text-amber-300 font-mono tracking-tight flex items-baseline gap-1">
          <span>✨</span>
          <span>{contribution.toLocaleString()}</span>
          <span className="text-xs text-zinc-500 font-normal ml-1">星塵榮譽點數</span>
        </h4>

        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-500">當前榮譽稱號</p>
            <p className={`text-sm font-bold ${rank.color}`}>{rank.title}</p>
          </div>
          <span className="text-xs text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            每資助 1 元即可累積 1 點
          </span>
        </div>
      </div>
    </div>
  );
}
