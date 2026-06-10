import { useEffect, useRef } from 'react';

/**
 * 粒子星空背景 —— Canvas 实现
 * 高密度粒子 + 金色调比例 + prefers-reduced-motion 适配 + DPR 感知
 *
 * Props:
 * - className: 额外样式类
 * - density: 数值越大越稀疏（默认 3200）
 * - goldRatio: 金色粒子比例（默认 0.34）
 */
export default function StarField({ className = '', density = 3200, goldRatio = 0.34 }) {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars = [];
    let raf = 0;

    const build = (w, h) => {
      const n = Math.round((w * h) / density);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.3,
        ph: Math.random() * 6.28,
        tw: Math.random() * 0.0016 + 0.0004,
        vy: Math.random() * 0.04 + 0.012,
        gold: Math.random() < goldRatio,
      }));
    };

    const size = () => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build(w, h);
    };

    const frame = (t) => {
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        if (!reduce) {
          s.y -= s.vy;
          if (s.y < -2) {
            s.y = h + 2;
            s.x = Math.random() * w;
          }
        }
        const al = reduce
          ? 0.5
          : 0.18 + 0.62 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fillStyle = s.gold
          ? `rgba(233,207,140,${al})`
          : `rgba(255,255,255,${al})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    size();
    window.addEventListener('resize', size);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
    };
  }, [density, goldRatio]);

  return (
    <canvas
      ref={ref}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}
