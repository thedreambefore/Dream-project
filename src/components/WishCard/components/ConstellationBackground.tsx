// src/components/WishCard/components/ConstellationBackground.tsx
import { useMemo } from 'react';

interface Props {
  wishId: string;
}

interface StarNode {
  id: number;
  x: number;
  y: number;
  r: number;
  opacity: number;
  delay: number;
}

interface ConstellationLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  opacity: number;
}

/**
 * 依據 wishId 字串產生確定性的偽隨機數 (0 ~ 1)
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
  const { stars, lines } = useMemo(() => {
    const rng = createDeterministicRandom(wishId || 'default-seed');

    // 隨機生成 5 ~ 7 顆星座核心星點 (坐標百分比 15% ~ 85%，避開邊緣)
    const starCount = 5 + Math.floor(rng() * 3);
    const starNodes: StarNode[] = [];

    for (let i = 0; i < starCount; i++) {
      starNodes.push({
        id: i,
        x: 18 + rng() * 64,
        y: 20 + rng() * 55,
        r: 1.2 + rng() * 1.5,
        opacity: 0.4 + rng() * 0.5,
        delay: rng() * 3,
      });
    }

    // 計算星星間的鄰近連線（星座骨架）
    const lineList: ConstellationLine[] = [];
    for (let i = 0; i < starNodes.length; i++) {
      for (let j = i + 1; j < starNodes.length; j++) {
        const dx = starNodes[i].x - starNodes[j].x;
        const dy = starNodes[i].y - starNodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // 只連接鄰近距離小於 35% 的星點，維持自然星座形狀
        if (dist < 34) {
          lineList.push({
            x1: starNodes[i].x,
            y1: starNodes[i].y,
            x2: starNodes[j].x,
            y2: starNodes[j].y,
            opacity: Math.max(0.12, 0.35 - dist * 0.007),
          });
        }
      }
    }

    return { stars: starNodes, lines: lineList };
  }, [wishId]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full opacity-65 group-hover:opacity-100 transition-opacity duration-700"
      >
        <defs>
          <radialGradient id={`star-glow-${wishId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 星座連線 */}
        {lines.map((l, idx) => (
          <line
            key={`line-${idx}`}
            x1={`${l.x1}%`}
            y1={`${l.y1}%`}
            x2={`${l.x2}%`}
            y2={`${l.y2}%`}
            stroke="#fbbf24"
            strokeWidth="0.35"
            strokeDasharray="1.5 1"
            strokeOpacity={l.opacity}
          />
        ))}

        {/* 星座星點 */}
        {stars.map((s) => (
          <g key={`star-${s.id}`}>
            {/* 外圈微光 */}
            <circle
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r * 2.2}
              fill={`url(#star-glow-${wishId})`}
              opacity={s.opacity * 0.7}
            />
            {/* 核心實心星點 */}
            <circle
              cx={`${s.x}%`}
              cy={`${s.y}%`}
              r={s.r}
              fill="#ffffff"
              opacity={s.opacity}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}