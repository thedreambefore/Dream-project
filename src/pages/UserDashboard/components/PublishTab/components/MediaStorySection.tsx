// src/pages/UserDashboard/components/PublishTab/components/MediaStorySection.tsx

interface Props {
  story: string;
  setStory: (v: string) => void;
  promise: string;
  setPromise: (v: string) => void;
  productUrl: string;
  setProductUrl: (v: string) => void;
  imageBase64: string | null;
  setImageBase64: (v: string | null) => void;
  compressing: boolean;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MediaStorySection({
  story,
  setStory,
  promise,
  setPromise,
  productUrl,
  setProductUrl,
  imageBase64,
  setImageBase64,
  compressing,
  onImageChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">外部電商商品連結 (B2C)</label>
        <input
          type="url"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          情境照片上傳 <span className="text-zinc-500">(自動壓縮並套用暗調濾鏡)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="block w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500/20 file:text-amber-200 hover:file:bg-amber-500/30 file:cursor-pointer"
        />
        {compressing && <p className="text-xs text-amber-300 mt-1">⏳ 壓縮中...</p>}
        {imageBase64 && (
          <div className="mt-3 relative h-36 rounded-xl overflow-hidden border border-amber-400/30">
            <img src={imageBase64} alt="預覽" className="w-full h-full object-cover brightness-60 contrast-125" />
            <button
              type="button"
              onClick={() => setImageBase64(null)}
              className="absolute bottom-2 right-3 text-red-400 text-xs underline cursor-pointer"
            >
              移除圖片
            </button>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-gray-300">困境故事 (限 200 字)</label>
          <span className={`text-[11px] font-mono ${story.length > 200 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
            {story.length}/200
          </span>
        </div>
        <textarea
          rows={4}
          maxLength={200}
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="誠摯分享心願現狀與心聲..."
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50 resize-none"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">終章承諾 (開箱感謝信承諾)</label>
        <input
          type="text"
          value={promise}
          onChange={(e) => setPromise(e.target.value)}
          placeholder="例如：達成後公開感謝信與開箱成果！"
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400/50"
        />
      </div>
    </div>
  );
}