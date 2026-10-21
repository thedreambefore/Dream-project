// src/components/WishCard/components/ConstellationBackground.tsx
import { useMemo } from 'react';

interface Props {
  wishId: string;
  hasImage?: boolean;
}

interface SvgPoint {
  cx: number;
  cy: number;
  r: number;
}

interface ConstellationPattern {
  gradient: string;
  points: SvgPoint[];
  polylines: string[]; // 支援單折線或分叉星軌
}

export function ConstellationBackground({ wishId, hasImage = false }: Props) {
  const pattern = useMemo<ConstellationPattern>(() => {
    let hash = 0;
    const str = wishId || 'dreamsand';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // 1. 保留你原汁原味的 A 案星雲漸層演算法
    const hue1 = Math.abs(hash % 40) + 240; // 藍紫深空 (240 ~ 280)
    const hue2 = Math.abs((hash >> 2) % 30) + 280; // 紫粉星雲 (280 ~ 310)
    const gradient = `radial-gradient(ellipse at 70% 30%, hsla(${hue2}, 70%, 25%, 0.7) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, hsla(${hue1}, 75%, 20%, 0.8) 0%, #0a0a1a 80%)`;

    // 2. 決定星座拓撲骨架 (4 種經典天體型態)
    const topologyType = Math.abs(hash >> 3) % 4;
    const pts: SvgPoint[] = [];
    const polylines: string[] = [];

    // 輔助微調數值
    const rX = (shift: number, mod: number) => Math.abs(hash >> shift) % mod;
    const rY = (shift: number, mod: number) => Math.abs(hash >> shift) % mod;

    if (topologyType === 0) {
      // 🌟 型態 A：經典起伏折線型（4 顆星，你目前最滿意的原創版）
      const p0 = { cx: 35 + rX(1, 30), cy: 30 + rY(2, 25), r: 2 };
      const p1 = { cx: 90 + rX(3, 40), cy: 65 + rY(4, 30), r: 3.5 }; // 大主星
      const p2 = { cx: 165 + rX(5, 35), cy: 35 + rY(6, 30), r: 2 };
      const p3 = { cx: 225 + rX(7, 35), cy: 70 + rY(8, 25), r: 2 };
      pts.push(p0, p1, p2, p3);
      polylines.push(`${p0.cx},${p0.cy} ${p1.cx},${p1.cy} ${p2.cx},${p2.cy} ${p3.cx},${p3.cy}`);

    } else if (topologyType === 1) {
      // 🌟 型態 B：分叉星枝型（5 顆星，像天鵝座／人馬座分叉星軌）
      const p0 = { cx: 35 + rX(1, 25), cy: 40 + rY(2, 25), r: 2 };
      const pCore = { cx: 110 + rX(3, 30), cy: 55 + rY(4, 25), r: 3.5 }; // 核心交叉主星
      const pTop = { cx: 185 + rX(5, 30), cy: 30 + rY(6, 25), r: 2 };
      const pBranch = { cx: 175 + rX(7, 30), cy: 85 + rY(8, 25), r: 2 };
      const pEnd = { cx: 235 + rX(9, 25), cy: 45 + rY(10, 25), r: 2 };
      pts.push(p0, pCore, pTop, pBranch, pEnd);
      // 主線路徑
      polylines.push(`${p0.cx},${p0.cy} ${pCore.cx},${pCore.cy} ${pTop.cx},${pTop.cy} ${pEnd.cx},${pEnd.cy}`);
      // 分支路徑
      polylines.push(`${pCore.cx},${pCore.cy} ${pBranch.cx},${pBranch.cy}`);

    } else if (topologyType === 2) {
      // 🌟 型態 C：天穹弧線型（5 顆星，柔和的微拱天門）
      const p0 = { cx: 35 + rX(1, 20), cy: 75 + rY(2, 15), r: 2 };
      const p1 = { cx: 85 + rX(3, 25), cy: 45 + rY(4, 15), r: 2 };
      const p2 = { cx: 140 + rX(5, 25), cy: 30 + rY(6, 15), r: 3.5 }; // 頂點大主星
      const p3 = { cx: 195 + rX(7, 25), cy: 45 + rY(8, 15), r: 2 };
      const p4 = { cx: 240 + rX(9, 20), cy: 75 + rY(10, 15), r: 2 };
      pts.push(p0, p1, p2, p3, p4);
      polylines.push(`${p0.cx},${p0.cy} ${p1.cx},${p1.cy} ${p2.cx},${p2.cy} ${p3.cx},${p3.cy} ${p4.cx},${p4.cy}`);

    } else {
      // 🌟 型態 D：三角幾何星官型（4 顆星，折線帶一個低垂伴星）
      const p0 = { cx: 35 + rX(1, 30), cy: 60 + rY(2, 25), r: 2 };
      const pPeak = { cx: 120 + rX(3, 35), cy: 30 + rY(4, 20), r: 3.5 }; // 頂點大主星
      const pMid = { cx: 175 + rX(5, 30), cy: 55 + rY(6, 25), r: 2 };
      const pEnd = { cx: 235 + rX(7, 30), cy: 40 + rY(8, 25), r: 2 };
      pts.push(p0, pPeak, pMid, pEnd);
      polylines.push(`${p0.cx},${p0.cy} ${pPeak.cx},${pPeak.cy} ${pMid.cx},${pMid.cy} ${pEnd.cx},${pEnd.cy}`);
    }

    return {
      gradient,
      points: pts,
      polylines,
    };
  }, [wishId]);

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden -z-10"
      style={{
        background: hasImage ? 'transparent' : pattern.gradient,
      }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 280 160"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* 1. 星座連線：維持完全一致的金色虛線星軌 */}
        {pattern.polylines.map((ptsStr, idx) => (
          <polyline
            key={`poly-${idx}`}
            points={ptsStr}
            fill="none"
            stroke="rgba(251, 191, 36, 0.45)"
            strokeWidth="1.2"
            strokeDasharray="4 3"
          />
        ))}

        {/* 2. 幾何星位節點：維持發光亮點與原生 animate-pulse */}
        {pattern.points.map((p, idx) => (
          <circle
            key={`pt-${idx}`}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill="#fde68a"
            className="animate-pulse"
          />
        ))}
      </svg>
    </div>
  );
}

export default ConstellationBackground;