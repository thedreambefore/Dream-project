// src/components/WishCard/components/ConstellationBackground.tsx
import { useMemo } from 'react';

interface Props {
  wishId: string;
}

interface StarNode {
  x: number;
  y: number;
  isAnchor?: boolean;
}

function getDeterministicRng(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let seed = Math.abs(hash);

  return function next() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export function ConstellationBackground({ wishId }: Props) {
  const { points, uniqueId } = useMemo(() => {
    const rng = getDeterministicRng(wishId || 'dreamsand');
    const safeId = (wishId || 'default').replace(/[^a-zA-Z0-9]/g, '');

    // 🌟 在 340 x 220 的黃金比例中，1:1 還原原版截圖的 4 星波浪航跡
    const pts: StarNode[] = [
      { x: 42 + rng() * 15, y: 55 + rng() * 15 },             // 1. 左上起點 (約 x:45, y:60)
      { x: 125 + rng() * 15, y: 110 + rng() * 18, isAnchor: true }, // 2. 核心大光暈沉降主星 (約 x:130, y:118)
      { x: 225 + rng() * 18, y: 88 + rng() * 15 },            // 3. 右上回彈星點 (約 x:230, y:92)
      { x: 285 + rng() * 15, y: 145 + rng() * 18 },           // 4. 右下尾端收斂星點 (約 x:290, y:150)
    ];

    return { points: pts, uniqueId: safeId };
  }, [wishId]);

  return (
    <div className="absolute inset-x-0 top-16 h-56 pointer-events-none overflow-hidden z-10 flex items-center justify-center">
      <svg
        viewBox="0 0 340 220"
        className="w-full h-full"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* 🌟 核心大光暈星：柔和自然擴散，完全無硬邊 */}
          <radialGradient id={`anchor-glow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.85" />
            <stop offset="25%" stopColor="#e5d0b5" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#c8b29b" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#c8b29b" stopOpacity="0" />
          </radialGradient>

          {/* 一般伴星微光暈 */}
          <radialGradient id={`star-glow-${uniqueId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="40%" stopColor="#d8c5b0" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#c8b29b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. 溫潤砂金極細寬虛線（與原版截圖完全同頻） */}
        {points.map((pt, idx) => {
          if (idx === points.length - 1) return null;
          const nextPt = points[idx + 1];
          return (
            <line
              key={`line-${idx}`}
              x1={pt.x}
              y1={pt.y}
              x2={nextPt.x}
              y2={nextPt.y}
              stroke="rgba(200, 178, 155, 0.35)"
              strokeWidth="1.2"
              strokeDasharray="4 4.5"
              strokeLinecap="round"
            />
          );
        })}

        {/* 2. 自然星芒節點（消除靶心感） */}
        {points.map((pt, idx) => {
          if (pt.isAnchor) {
            return (
              <g key={`anchor-${idx}`}>
                {/* 霧化漫射大光環（柔和融入深空背景） */}
                <circle cx={pt.x} cy={pt.y} r="14" fill={`url(#anchor-glow-${uniqueId})`} />
                {/* 凝縮砂金星核 */}
                <circle cx={pt.x} cy={pt.y} r="3.2" fill="rgba(235, 222, 205, 0.7)" />
                {/* 中心微亮焦點 */}
                <circle cx={pt.x} cy={pt.y} r="1.4" fill="#ffffff" opacity="0.95" />
              </g>
            );
          }

          return (
            <g key={`sub-star-${idx}`}>
              {/* 伴星柔和擴散 */}
              <circle cx={pt.x} cy={pt.y} r="7" fill={`url(#star-glow-${uniqueId})`} />
              {/* 伴星核心 */}
              <circle cx={pt.x} cy={pt.y} r="2.2" fill="rgba(230, 218, 202, 0.85)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}