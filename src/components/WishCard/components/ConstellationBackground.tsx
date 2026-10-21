// src/components/WishCard/components/ConstellationBackground.tsx
import { useMemo } from 'react';

interface Props {
  wishId: string;
  hasImage?: boolean;
}

export function ConstellationBackground({ wishId, hasImage = false }: Props) {
  // 🌟 1:1 完整保留你的 A 案：星宿幾何種子計算（純數學雜湊演算法，保證同卡片永遠一致）
  const constellationSeed = useMemo(() => {
    let hash = 0;
    const str = wishId || 'seed';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash % 40) + 240; // 藍紫深空色相 (240 ~ 280)
    const hue2 = Math.abs((hash >> 2) % 30) + 280; // 紫粉星雲色相 (280 ~ 310)

    return {
      gradient: `radial-gradient(ellipse at 70% 30%, hsla(${hue2}, 70%, 25%, 0.7) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, hsla(${hue1}, 75%, 20%, 0.8) 0%, #0a0a1a 80%)`,
      svgPoints: [
        { cx: 30 + (Math.abs(hash) % 40), cy: 25 + (Math.abs(hash >> 1) % 30) },
        { cx: 80 + (Math.abs(hash >> 2) % 50), cy: 60 + (Math.abs(hash >> 3) % 40) },
        { cx: 160 + (Math.abs(hash >> 4) % 40), cy: 35 + (Math.abs(hash >> 5) % 35) },
        { cx: 220 + (Math.abs(hash >> 6) % 40), cy: 75 + (Math.abs(hash >> 7) % 30) },
      ],
    };
  }, [wishId]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden -z-10"
      style={{
        background: hasImage ? 'transparent' : constellationSeed.gradient,
      }}
    >
      {/* 🌟 1:1 照你的 A 案：SVG 幾何虛線星軌 + Tailwind animate-pulse 呼吸 */}
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 280 160"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 1. 星座連線：金色虛線星軌 */}
        <polyline
          points={constellationSeed.svgPoints.map((p) => `${p.cx},${p.cy}`).join(' ')}
          fill="none"
          stroke="rgba(251, 191, 36, 0.45)"
          strokeWidth="1.2"
          strokeDasharray="4 3"
        />

        {/* 2. 幾何星位節點：發光亮點與呼吸動畫 */}
        {constellationSeed.svgPoints.map((p, idx) => (
          <circle
            key={idx}
            cx={p.cx}
            cy={p.cy}
            r={idx === 1 ? '3.5' : '2'}
            fill="#fde68a"
            className="animate-pulse"
          />
        ))}
      </svg>
    </div>
  );
}

export default ConstellationBackground;