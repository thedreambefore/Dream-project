// src/components/WishCard/components/ConstellationBackground.tsx
import { useMemo } from 'react';

interface Props {
  wishId: string;
}

export function ConstellationBackground({ wishId }: Props) {
  // 依據 wishId 決定微幅起伏，讓每張卡片有專屬星軌
  const offset = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < (wishId || '').length; i++) {
      hash = (hash << 5) - hash + wishId.charCodeAt(i);
    }
    return (Math.abs(hash) % 7) - 3; // -3 ~ +3 微調
  }, [wishId]);

  return (
    <div className="absolute inset-x-0 top-14 h-48 pointer-events-none overflow-hidden z-10 flex items-center justify-center">
      <svg
        viewBox="0 0 100 50"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <style>
          {`
            @keyframes starBreathe {
              0%, 100% { opacity: 0.35; transform: scale(0.9); }
              50% { opacity: 0.95; transform: scale(1.15); filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.7)); }
            }
            .star-pulse-1 { animation: starBreathe 3.5s ease-in-out infinite; transform-origin: 15% ${14 + offset}%; }
            .star-pulse-anchor { animation: starBreathe 2.8s ease-in-out infinite 0.5s; transform-origin: 38% ${24 + offset}%; }
            .star-pulse-2 { animation: starBreathe 4.0s ease-in-out infinite 1.2s; transform-origin: 66% ${18 + offset}%; }
            .star-pulse-3 { animation: starBreathe 3.2s ease-in-out infinite 0.8s; transform-origin: 84% ${32 + offset}%; }
          `}
        </style>

        {/* 1. 溫潤砂金寬虛線連線（貫穿 4 顆星） */}
        <polyline
          points={`15,${14 + offset} 38,${24 + offset} 66,${18 + offset} 84,${32 + offset}`}
          fill="none"
          stroke="rgba(215, 195, 160, 0.35)"
          strokeWidth="0.55"
          strokeDasharray="1.8 1.8"
          strokeLinecap="round"
        />

        {/* 2. 呼吸星芒節點 */}
        {/* 星點 1 (左上) */}
        <g className="star-pulse-1">
          <circle cx="15" cy={14 + offset} r="1.5" fill="rgba(215, 195, 160, 0.25)" />
          <circle cx="15" cy={14 + offset} r="0.75" fill="#fef3c7" />
        </g>

        {/* 🌟 核心主星 (帶雙層呼吸光暈) */}
        <g className="star-pulse-anchor">
          <circle cx="38" cy={24 + offset} r="3.2" fill="rgba(215, 195, 160, 0.22)" />
          <circle cx="38" cy={24 + offset} r="1.8" fill="rgba(245, 225, 195, 0.45)" />
          <circle cx="38" cy={24 + offset} r="0.9" fill="#ffffff" />
        </g>

        {/* 星點 2 (右上) */}
        <g className="star-pulse-2">
          <circle cx="66" cy={18 + offset} r="1.6" fill="rgba(215, 195, 160, 0.25)" />
          <circle cx="66" cy={18 + offset} r="0.8" fill="#fef3c7" />
        </g>

        {/* 星點 3 (右下尾星) */}
        <g className="star-pulse-3">
          <circle cx="84" cy={32 + offset} r="1.4" fill="rgba(215, 195, 160, 0.25)" />
          <circle cx="84" cy={32 + offset} r="0.75" fill="#fef3c7" />
        </g>
      </svg>
    </div>
  );
}