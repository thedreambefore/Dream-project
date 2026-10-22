// src/pages/UserDashboard/components/PublishTab/components/PublishForm.tsx
import { Sparkles, Laptop, BookOpen, Palette, Music, Coffee, Compass, Camera, Gift, Heart, Loader2, Plus } from 'lucide-react';
import type { Tag } from '@/types/wish';

interface Props {
  title: string; setTitle: (v: string) => void;
  story: string; setStory: (v: string) => void;
  promise: string; setPromise: (v: string) => void;
  productPrice: number; setProductPrice: (v: number) => void;
  productUrl: string; setProductUrl: (v: string) => void;
  tags: Tag[]; tagName: string; setTagName: (v: string) => void;
  coverEmoji: string; setCoverEmoji: (v: string) => void;
  imageBase64: string | null; setImageBase64: (v: string | null) => void;
  compressing: boolean; submitting: boolean; error: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ICON_OPTIONS = [
  { id: 'Sparkles', icon: Sparkles, label: '星塵' }, { id: 'Laptop', icon: Laptop, label: '科技' },
  { id: 'BookOpen', icon: BookOpen, label: '學識' }, { id: 'Palette', icon: Palette, label: '藝術' },
  { id: 'Music', icon: Music, label: '音樂' }, { id: 'Coffee', icon: Coffee, label: '生活' },
  { id: 'Compass', icon: Compass, label: '探索' }, { id: 'Camera', icon: Camera, label: '創作' },
  { id: 'Gift', icon: Gift, label: '心意' }, { id: 'Heart', icon: Heart, label: '陪伴' },
];

export function PublishForm({
  title, setTitle, story, setStory, promise, setPromise, productPrice, setProductPrice,
  productUrl, setProductUrl, tags, tagName, setTagName, coverEmoji, setCoverEmoji,
  imageBase64, setImageBase64, compressing, submitting, error, onImageChange, onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glow-border">
      <div>
        <div className="flex justify-between items-center mb-1.5"><label className="text-xs font-medium text-gray-300">心願物品 / 核心目標 (限 20 字)</label><span className={`text-[11px] font-mono ${title.length > 20 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>{title.length}/20</span></div>
        <input type="text" value={title} maxLength={20} onChange={(e) => setTitle(e.target.value)} placeholder="例如：二手電繪板 (供課後創作)" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-300 mb-1.5">分類標籤</label>
          <select value={tagName} onChange={(e) => setTagName(e.target.value)} className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400/50">
            {tags.map((t) => (<option key={t.id} value={t.name} className="bg-zinc-900 text-white">#{t.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">心願主題圖示</label>
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {ICON_OPTIONS.map((item) => {
              const IconComp = item.icon;
              return (
                <button key={item.id} type="button" onClick={() => setCoverEmoji(item.id)} className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${coverEmoji === item.id ? 'bg-amber-500/20 border border-amber-400 text-amber-300' : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'}`}><IconComp className="w-4 h-4" /></button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="block text-xs font-medium text-gray-300 mb-1.5">心願所需星塵 (NT$ 50 ~ 20,000)</label><input type="number" min={50} max={20000} value={productPrice} onChange={(e) => setProductPrice(Number(e.target.value))} className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400/50" required /></div>
        <div><label className="block text-xs font-medium text-gray-300 mb-1.5">電商商品連結 (B2C)</label><input type="url" value={productUrl} onChange={(e) => setProductUrl(e.target.value)} placeholder="https://..." className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50" required /></div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">情境照片上傳 <span className="text-zinc-500">(自動壓縮並套用暗調濾鏡)</span></label>
        <input type="file" accept="image/*" onChange={onImageChange} className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-200 hover:file:bg-amber-500/30 file:cursor-pointer" />
        {compressing && <p className="text-xs text-amber-300 mt-1">⏳ 壓縮中...</p>}
        {imageBase64 && (
          <div className="mt-3 relative h-36 rounded-xl overflow-hidden border border-amber-400/30">
            <img src={imageBase64} alt="預覽" className="w-full h-full object-cover brightness-60 contrast-125" />
            <button type="button" onClick={() => setImageBase64(null)} className="absolute bottom-2 right-3 text-red-400 text-xs underline cursor-pointer">移除圖片</button>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5"><label className="text-xs font-medium text-gray-300">困境故事 (限 200 字)</label><span className={`text-[11px] font-mono ${story.length > 200 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>{story.length}/200</span></div>
        <textarea rows={4} maxLength={200} value={story} onChange={(e) => setStory(e.target.value)} placeholder="誠摯分享心願現狀..." className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none" required />
      </div>

      <div><label className="block text-xs font-medium text-gray-300 mb-1.5">終章承諾 (開箱感謝信承諾)</label><input type="text" value={promise} onChange={(e) => setPromise(e.target.value)} placeholder="例如：達成後公開感謝信與成果！" className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50" /></div>
      <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed">🔔 <b>履約提醒</b>：本活動若順利達成，平台將依您於帳號填寫之電話與地址寄送活動贈禮。</div>
      
      {error && <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
      <button type="submit" disabled={submitting || compressing} className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black text-sm py-3.5 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">{submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}送交審核 · 發布心願卡片</button>
    </form>
  );
}