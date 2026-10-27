// src/components/BrandLogo/useBrandLogo.ts
import { useState, useEffect } from 'react';

const CANDIDATE_LOGO_PATHS = [
  '/logo.svg',
  '/logo.png',
  '/src/assets/logo.svg',
  '/src/assets/logo.png',
];

export function useBrandLogo() {
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
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

  return { logoSrc, setLogoSrc };
}