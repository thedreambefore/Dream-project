// src/components/BrandLogo.tsx
import { useState, useEffect } from 'react';
import { Hourglass } from 'lucide-react';

/**
 * 🌟 智慧探測 Logo 候選清單：
 * 系統會在背景自動嘗試探測以下路徑，只要你把圖片放在其中任一個位置，就會自動載入！
 * 1. 根目錄新增 public/ 放 logo.svg 或 logo.png（Vite 標準靜態路徑）
 * 2. 放在 src/assets/ 放 logo.svg 或 logo.png
 */
const CANDIDATE_LOGO_PATHS = [
  '/logo.svg',
  '/logo.png',
  '/src/assets/logo.svg',
  '/src/assets/logo.png',
];

export function BrandLogo({
  iconSize = 'w-5 h-5',
  textSize = 'text-lg',
}: {
  iconSize?: string;
  textSize?: string;
}) {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // 探測圖片是否存在且能正常解碼
    const checkImage = (url: string): Promise<boolean> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });
    };

    const detectAvailableLogo = async () => {
      for (const path of CANDIDATE_LOGO_PATHS) {
        const isValid = await checkImage(path);
        if (isValid && isMounted) {
          setLogoSrc(path);
          return;
        }
      }
      if (isMounted) setLogoSrc(null);
    };

    detectAvailableLogo();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex items-center gap-2 select-none">
      {logoSrc ? (
        <img
          src={logoSrc}
          alt="夢沙 Logo"
          className={`${iconSize} object-contain`}
          onError={() => setLogoSrc(null)} // 二次防線：渲染失敗瞬間平滑切回沙漏
        />
      ) : (
        <Hourglass className={`${iconSize} text-amber-400`} />
      )}
      <span
        className={`font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent glow-text ${textSize}`}
      >
        夢沙 DreamSand
      </span>
    </div>
  );
}