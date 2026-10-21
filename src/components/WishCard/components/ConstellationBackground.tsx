// src/components/WishCard/components/ConstellationBackground.tsx
import React, { useMemo } from 'react';

interface ConstellationProps {
  wishId: string; // 根據 wishId 雜湊生成穩定的圖案
  starCount?: number;
}

// 🌟 你原版的穩定字串雜湊種子
const SEED_FROM_ID = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// 🌟 你原版的 PRNG 偽隨機數產生器
const createRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const ConstellationBackground: React.FC<ConstellationProps> = ({
  wishId,
  starCount = 5,
}) => {
  // 固定向量畫布尺寸 (500x200)，透過 viewBox 自動隨卡片自適應縮放
  const width = 500;
  const height = 200;

  // 避免特殊符號破壞 SVG 濾鏡 ID
  const safeId = useMemo(() => (wishId || 'default').replace(/[^a-zA-Z0-9]/g, ''), [wishId]);

  // 🌟 完全採用你原本的區間分佈算法
  const stars = useMemo(() => {
    const seed = SEED_FROM_ID(wishId || 'dreamsand');
    const nextRandom = createRandom(seed);
    const points: { x: number; y: number; r: number }[] = [];

    // 沿著 X 軸均勻分佈並加上隨機偏移，避免點擠在一起
    const segmentWidth = (width * 0.8) / starCount;
    const startX = width * 0.1;

    for (let i = 0; i < starCount; i++) {
      const x = startX + i * segmentWidth + nextRandom() * (segmentWidth * 0.5);
      const y = height * 0.2 + nextRandom() * (height * 0.6);
      const r = 3 + nextRandom() * 3; // 星星大小 3~6px

      points.push({ x, y, r });
    }

    return points;
  }, [wishId, starCount]);

  // 折線連線坐標
  const pointsPath = useMemo(() => stars.map((s) => `${s.x},${s.y}`).join(' '), [stars]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 flex items-center justify-center">
      {/* 🌟 只有透明度一閃一閃（0% 位置偏移，絕對不移動！） */}
      <style>
        {`
          @keyframes starTwinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1.0; }
          }
        `}
      </style>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* 🌟 你原版的 feGaussianBlur 外發光濾鏡 */}
          <filter id={`glow-${safeId}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. 星座連線（虛線） */}
        <polyline
          points={pointsPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="1.8"
          strokeDasharray="6,6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. 星座節點（星星與光暈） */}
        {stars.map((star, index) => (
          <g
            key={index}
            style={{
              animation: `starTwinkle 3s ease-in-out infinite`,
              animationDelay: `${index * 0.6}s`, // 錯開閃爍時間
            }}
          >
            {/* 底層較大的半透明光暈圓點 */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r * 2.2}
              fill="rgba(255, 255, 255, 0.15)"
              filter={`url(#glow-${safeId})`}
            />
            {/* 頂層核心亮點 */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="rgba(255, 255, 255, 0.85)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ConstellationBackground;