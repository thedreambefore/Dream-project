// src/components/Starfield/useStarfield.ts
import { useMemo } from 'react';

export function useStarfield() {
  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  const dust = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 15,
      duration: Math.random() * 10 + 10,
    }));
  }, []);

  return { stars, dust };
}