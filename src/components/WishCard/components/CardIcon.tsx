// src/components/WishCard/components/CardIcon.tsx
import { Sparkles, Compass, Laptop, BookOpen, Palette, Music, Coffee, Camera, Gift, Heart } from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Compass, Laptop, BookOpen, Palette, Music, Coffee, Camera, Gift, Heart,
};

export function CardIcon({ iconNameOrEmoji }: { iconNameOrEmoji?: string }) {
  if (!iconNameOrEmoji) return <Compass className="w-5 h-5 text-amber-300 flex-shrink-0" />;
  const IconComp = ICON_MAP[iconNameOrEmoji];
  if (IconComp) return <IconComp className="w-5 h-5 text-amber-300 flex-shrink-0" />;
  return <span className="text-lg flex-shrink-0 leading-none">{iconNameOrEmoji}</span>;
}