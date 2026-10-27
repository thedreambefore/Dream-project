// src/components/Starfield/index.tsx
import { useStarfield } from './useStarfield';

export function Starfield() {
  const { stars, dust } = useStarfield();

  return (
    <div className="stars-layer">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
      {dust.map((d) => (
        <div
          key={`d-${d.id}`}
          className="dust-particle"
          style={{
            left: `${d.left}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Starfield;