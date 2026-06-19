import { useEffect, useRef } from 'react';

// 薄荷色星痕粒子背景：缓慢上浮的光点
export default function ParticleBg({ density = 60 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
    let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);

    const onResize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    };
    window.addEventListener('resize', onResize);

    type P = { x: number; y: number; r: number; vy: number; a: number; hue: number };
    const pts: P[] = Array.from({ length: density }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 2 + 0.6) * devicePixelRatio,
      vy: -(Math.random() * 0.4 + 0.15) * devicePixelRatio,
      a: Math.random() * 0.6 + 0.2,
      hue: Math.random() < 0.7 ? 155 : 45,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.a})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 70%, 0.8)`;
        ctx.shadowBlur = 8 * devicePixelRatio;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
