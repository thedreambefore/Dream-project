// src/components/BrandLogo.tsx
import { useState } from 'react';
import { Hourglass } from 'lucide-react';
// ✨ 直接透過 import 引入圖片，打包工具（如 Vite/Webpack）會自動幫您處理路徑
import customLogo from './logo.svg';

interface BrandLogoProps {
  /** 圖示/圖片尺寸（純數字，單位為像素，預設 20 等於 Tailwind 的 w-5/h-5） */
  iconSize?: number;
  /** 文字大小字級，需傳入 Tailwind 類別，如 'text-lg', 'text-2xl' */
  textSize?: string;
  /** 外層容器的額外樣式 */
  className?: string;
}

export function BrandLogo({
  iconSize = 20,
  textSize = 'text-lg',
  className = '',
}: BrandLogoProps) {
  // 狀態：如果圖片加載失敗，則切換為備用圖示
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {!imgError && customLogo ? (
        <img
          src={customLogo} // ✨ 使用引入的圖片物件
          alt="夢沙 Logo"
          width={iconSize}
          height={iconSize}
          className="object-contain"
          // 當圖片路徑不存在、找不到或檔案損毀時，觸發自動降級
          onError={() => setImgError(true)}
        />
      ) : (
        <Hourglass 
          size={iconSize} 
          className="text-amber-400" 
        />
      )}
      <span
        className={`font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent glow-text ${textSize}`}
      >
        夢沙 DreamSand
      </span>
    </div>
  );
}