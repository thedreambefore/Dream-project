// src/components/BrandLogo/index.tsx
import { Hourglass } from 'lucide-react';
import { useBrandLogo } from './useBrandLogo';

export function BrandLogo({ iconSize = 'w-5 h-5', textSize = 'text-lg' }: { iconSize?: string; textSize?: string }) {
  const { logoSrc, setLogoSrc } = useBrandLogo();

  return (
    <div className="flex items-center gap-2 select-none">
      {logoSrc ? (
        <img src={logoSrc} alt="夢沙 Logo" className={`${iconSize} object-contain`} onError={() => setLogoSrc(null)} />
      ) : (
        <Hourglass className={`${iconSize} text-amber-400`} />
      )}
      <span className={`font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent glow-text ${textSize}`}>
        夢沙 DreamSand
      </span>
    </div>
  );
}

export default BrandLogo;