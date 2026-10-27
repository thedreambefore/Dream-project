// src/pages/UserDashboard/components/PublishTab/components/PublishForm.tsx
import { Loader2, Plus, ShieldAlert } from 'lucide-react';
import { PLATFORM_RIGHTS_STATEMENT } from '@/constants/compliance';
import { PriceShippingSection } from './PriceShippingSection';
import { IconTagSection } from './IconTagSection';
import { MediaStorySection } from './MediaStorySection';
import type { Tag } from '@/types/wish';

interface Props {
  title: string;
  setTitle: (v: string) => void;
  story: string;
  setStory: (v: string) => void;
  promise: string;
  setPromise: (v: string) => void;
  basePrice: number;
  setBasePrice: (v: number) => void;
  hasShippingFee: boolean;
  setHasShippingFee: (v: boolean) => void;
  finalPrice: number;
  productUrl: string;
  setProductUrl: (v: string) => void;
  tags: Tag[];
  tagName: string;
  setTagName: (v: string) => void;
  coverEmoji: string;
  setCoverEmoji: (v: string) => void;
  imageBase64: string | null;
  setImageBase64: (v: string | null) => void;
  compressing: boolean;
  submitting: boolean;
  error: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PublishForm(props: Props) {
  return (
    <form onSubmit={props.onSubmit} className="space-y-5 bg-white/5 border border-white/10 p-6 rounded-2xl glow-border">
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-medium text-gray-300">心願物品 / 核心目標 (限 20 字)</label>
          <span className={`text-[11px] font-mono ${props.title.length > 20 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
            {props.title.length}/20
          </span>
        </div>
        <input
          type="text"
          value={props.title}
          maxLength={20}
          onChange={(e) => props.setTitle(e.target.value)}
          placeholder="例如：二手電繪板 (供課後創作)"
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400/50"
          required
        />
      </div>

      <IconTagSection tags={props.tags} tagName={props.tagName} setTagName={props.setTagName} coverEmoji={props.coverEmoji} setCoverEmoji={props.setCoverEmoji} />
      <PriceShippingSection basePrice={props.basePrice} setBasePrice={props.setBasePrice} hasShippingFee={props.hasShippingFee} setHasShippingFee={props.setHasShippingFee} finalPrice={props.finalPrice} />
      <MediaStorySection story={props.story} setStory={props.setStory} promise={props.promise} setPromise={props.setPromise} productUrl={props.productUrl} setProductUrl={props.setProductUrl} imageBase64={props.imageBase64} setImageBase64={props.setImageBase64} compressing={props.compressing} onImageChange={props.onImageChange} />

      <div className="bg-amber-500/10 border border-amber-400/25 rounded-xl p-3 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <span className="text-[11px]">{PLATFORM_RIGHTS_STATEMENT}</span>
      </div>

      {props.error && <p className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">{props.error}</p>}

      <button
        type="submit"
        disabled={props.submitting || props.compressing}
        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-gray-950 font-black text-sm py-3.5 rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {props.submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        送交審核 · 發布心願卡片
      </button>
    </form>
  );
}