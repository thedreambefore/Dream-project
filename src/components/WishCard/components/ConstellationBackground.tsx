// src/components/WishCard/components/ConstellationBackground.tsx
import { useMemo } from 'react';

interface Props {
  wishId: string;
}

interface StarPoint {
  x: number;
  y: number;
  isAnchor?: boolean; // 是否為帶光暈的大主星
}

/**
 * 依據 wishId 產生確定性的隨機種子，確保每張卡片形狀獨一無二且固定
 */
function createDeterministicRandom(seedStr: string) {
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
  const points = useMemo(() => {
    const rng = createDeterministicRandom(wishId || 'default-seed');

    // 隨機決定星座型態 (4 顆或 5 顆星)
    const starCount = rng() > 0.4 ? 4 : 5;
    const list: StarPoint[] = [];

    // 決定哪一顆是帶光環的大主星（通常在第 2 顆或第 3 顆的波谷/波峰）
    const anchorIndex = 1 + Math.floor(rng() * (starCount - 2));

    if (starCount === 4) {
      // 🌟 1:1 還原截圖中的經典 4 星波浪起伏
      list.push({ x: 12 + rng() * 4, y: 22 + rng() * 8 });              // 左上起點 (約 14%, 25%)
      list.push({ x: 34 + rng() * 5, y: 38 + rng() * 8, isAnchor: true }); // 下沉主星 (約 36%, 42%)
      list.push({ x: 62 + rng() * 6, y: 30 + rng() * 8 });              // 上揚星點 (約 65%, 34%)
      list.push({ x: 80 + rng() * 5, y: 50 + rng() * 10 });             // 右下尾星 (約 82%, 54%)
    } else {
      // 5 星溫柔波浪延伸型態
      list.push({ x: 12 + rng() * 4, y: 24 + rng() * 8 });
      list.push({ x: 28 + rng() * 5, y: 38 + rng() * 8 });
      list.push({ x: 48 + rng() * 6, y: 28 + rng() * 8, isAnchor: true });
      list.push({ x: 68 + rng() * 5, y: 44 + rng() * 8 });
      list.push({ x: 82 + rng() * 5, y: 32 + rng() * 8 });
    }

    return list;
  }, [wishId]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full opacity-70 group-hover:opacity-100 transition-opacity duration-500"
      >
        {/* 1. 溫潤砂金寬虛線連線 (一條線貫穿連接) */}
        {points.map((pt, idx) => {
          if (idx === points.length - 1) return null;
          const nextPt = points[idx + 1];
          return (
            <line
              key={`line-${idx}`}
              x1={`${pt.x}%`}
              y1={`${pt.y}%`}
              x2={`${nextPt.x}%`}
              y2={`${nextPt.y}%`}
              stroke="rgba(218, 195, 160, 0.32)"
              strokeWidth="0.55"
              strokeDasharray="2 2"
              strokeLinecap="round"
            />
          );
        })}

        {/* 2. 星星節點 */}
        {points.map((pt, idx) => (
          <g key={`star-${idx}`}>
            {pt.isAnchor ? (
              /* 🌟 大主星（如截圖中間偏左的那顆核心焦點星） */
              <>
                {/* 最外層半透明砂金大光暈 */}
                <circle
                  cx={`${pt.x}%`}
                  cy={`${pt.y}%`}
                  r="3.2"
                  fill="rgba(218, 195, 160, 0.28)"
                />
                {/* 中層核心星光 */}
                <circle
                  cx={`${pt.x}%`}
                  cy={`${pt.y}%`}
                  r="1.8"
                  fill="rgba(235, 220, 195, 0.75)"
                />
                {/* 最內層微光亮點 */}
                <circle
                  cx={`${pt.x}%`}
                  cy={`${pt.y}%`}
                  r="0.75"
                  fill="#ffffff"
                  opacity="0.9"
                />
              </>
            ) : (
              /* 精緻伴星（其餘星點） */
              <>
                {/* 伴星外圈微芒 */}
                <circle
                  cx={`${pt.x}%`}
                  cy={`${pt.y}%`}
                  r="1.6"
                  fill="rgba(218, 195, 160, 0.2)"
                />
                {/* 伴星核心 */}
                <circle
                  cx={`${pt.x}%`}
                  cy={`${pt.y}%`}
                  r="1.0"
                  fill="rgba(235, 220, 195, 0.85)"
                />
              </>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}