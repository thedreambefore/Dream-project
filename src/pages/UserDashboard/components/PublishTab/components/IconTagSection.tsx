// src/pages/UserDashboard/components/PublishTab/components/IconTagSection.tsx
import { Sparkles, Laptop, BookOpen, Palette, Music, Coffee, Compass, Camera, Gift, Heart } from 'lucide-react';
import type { Tag } from '@/types/wish';

interface Props {
  tags: Tag[];
  tagName: string;
  setTagName: (v: string) => void;
  coverEmoji: string;
  setCoverEmoji: (v: string) => void;
}

const ICON_OPTIONS = [
  { id: 'Sparkles', icon: Sparkles },
  { id: 'Laptop', icon: Laptop },
  { id: 'BookOpen', icon: BookOpen },
  { id: 'Palette', icon: Palette },
  { id: 'Music', icon: Music },
  { id: 'Coffee', icon: Coffee },
  { id: 'Compass', icon: Compass },
  { id: 'Camera', icon: Camera },
  { id: 'Gift', icon: Gift },
  { id: 'Heart', icon: Heart },
];

export function IconTagSection({ tags, tagName, setTagName, coverEmoji, setCoverEmoji }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">分類標籤</label>
        <select
          value={tagName}
          onChange={(e) => setTagName(e.target.value)}
          className="w-full bg-zinc-900/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400/50"
        >
          {tags.map((t) => (
            <option key={t.id} value={t.name} className="bg-zinc-900 text-white">
              #{t.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-zinc-300 mb-1.5">心願主題圖示</label>
        <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
          {ICON_OPTIONS.map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCoverEmoji(item.id)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                  coverEmoji === item.id
                    ? 'bg-amber-500/20 border border-amber-400 text-amber-300'
                    : 'bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                <IconComp className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}