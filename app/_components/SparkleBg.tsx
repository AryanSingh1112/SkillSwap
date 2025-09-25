import { useEffect, useState } from "react";

export function SparkleBackground({ count = 18 }: { count?: number }) {
  const [sparkles, setSparkles] = useState<{ cx: string; cy: string; r: number }[]>([]);

  useEffect(() => {
    const arr = Array.from({ length: count }, () => ({
      cx: Math.random() * 100 + "%",
      cy: Math.random() * 100 + "%",
      r: Math.random() * 18 + 6,
    }));
    setSparkles(arr);
  }, [count]);

  if (sparkles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <svg
        className="absolute top-0 left-0 w-full h-full opacity-30"
        style={{ filter: "blur(1px)" }}
      >
        <defs>
          <radialGradient id="sparkle" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        {sparkles.map((s, i) => (
          <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="url(#sparkle)" />
        ))}
      </svg>
    </div>
  );
}