// src/components/WishCard/components/ConstellationBackground.tsx
import React, { useMemo } from 'react';

interface ConstellationProps {
  wishId: string; // 根據這個 id 雜湊生成不同的圖案
  width?: number;
  height?: number;
  starCount?: number;
}

// 🌟 1:1 照你的範本：簡單的雜湊函式，將 ID 字串轉換為穩定的數字種子
const SEED_FROM_ID = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// 🌟 1:1 照你的範本：基於種子的偽隨機數產生器 (PRNG)
const createRandom = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

export const ConstellationBackground: React.FC<ConstellationProps> = ({
  wishId,
  width = 500,
  height = 200,
  starCount = 4, // 依據截圖中的 4 顆星
}) => {
  // 為每張卡片生成獨立的濾鏡 ID，防止畫面多張卡片時 glow 互相覆蓋
  const filterId = useMemo(() => `glow-${SEED_FROM_ID(wishId || 'default')}`, [wishId]);

  // 🌟 1:1 照你的範本算法：X 軸等分分佈 + Y 軸 20%~80% 浮動 + 半徑 3~6px
  const stars = useMemo(() => {
    const seed = SEED_FROM_ID(wishId || 'dreamsand');
    const nextRandom = createRandom(seed);
    const points: { x: number; y: number; r: number }[] = [];

    const segmentWidth = (width * 0.8) / starCount;
    const startX = width * 0.1;

    for (let i = 0; i < starCount; i++) {
      const x = startX + i * segmentWidth + nextRandom() * (segmentWidth * 0.5);
      const y = height * 0.2 + nextRandom() * (height * 0.6);
      const r = 3 + nextRandom() * 3;

      points.push({ x, y, r });
    }

    return points;
  }, [wishId, width, height, starCount]);

  // 將所有點用折線（Polyline）格式連接起來
  const pointsPath = useMemo(() => stars.map((s) => `${s.x},${s.y}`).join(' '), [stars]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 flex items-center justify-center">
      {/* 🌟 原地呼吸燈：只有透明度一閃一閃，絕對不移動、不位移、不縮放！ */}
      <style>
        {`
          @keyframes starBreathePure {
            0%, 100% { opacity: 0.35; }
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
          {/* 🌟 1:1 照你的範本：feGaussianBlur 發光外觀濾鏡 */}
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. 星座連線（虛線） - 1:1 照你的範本參數 */}
        <polyline
          points={pointsPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="2"
          strokeDasharray="6,6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 2. 星座節點（星星與光暈） - 1:1 照你的範本結構 + 原地呼吸 */}
        {stars.map((star, index) => (
          <g
            key={index}
            style={{
              animation: 'starBreathePure 3s ease-in-out infinite',
              animationDelay: `${index * 0.7}s`,
            }}
          >
            {/* 底層較大的半透明光暈圓點 */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r * 2.2}
              fill="rgba(255, 255, 255, 0.15)"
              filter={`url(#${filterId})`}
            />
            {/* 頂層核心亮點 */}
            <circle
              cx={star.x}
              cy={star.y}
              r={star.r}
              fill="rgba(255, 255, 255, 0.8)"
            />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ConstellationBackground;