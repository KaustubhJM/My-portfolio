import { useEffect, useRef } from 'react';
import { reduceMotion } from '../lib/motion';

const COLORS = ['200,20,28', '255,77,82', '243,241,237'];

// Crimson motes and petals drifting up the hero
export default function Embers() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (reduceMotion) return undefined;
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, particles = [], raf = 0, inView = true, running = false, resizeTimer;

    const spawn = (anywhere) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 20,
      r: Math.random() * 2.2 + 0.6,
      vy: Math.random() * 0.45 + 0.15,
      sway: Math.random() * 0.8 + 0.2,
      phase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.55 + 0.25,
      color: COLORS[Math.random() < 0.85 ? Math.round(Math.random()) : 2],
      petal: Math.random() < 0.35,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.02,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: Math.round(Math.min(64, w / 24)) }, () => spawn(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.y -= p.vy;
        p.phase += 0.01;
        p.rot += p.spin;
        if (p.y < -20) Object.assign(p, spawn(false));
        const x = p.x + Math.sin(p.phase) * p.sway * 12;
        ctx.globalAlpha = p.alpha * Math.max(0, Math.min(1, p.y / (h * 0.35)));
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.beginPath();
        if (p.petal) ctx.ellipse(x, p.y, p.r * 2.2, p.r, p.rot, 0, Math.PI * 2);
        else ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const sync = () => {
      const shouldRun = inView && !document.hidden;
      if (shouldRun && !running) { running = true; raf = requestAnimationFrame(tick); }
      if (!shouldRun && running) { running = false; cancelAnimationFrame(raf); }
    };
    const onResize = () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); };

    resize();
    window.addEventListener('resize', onResize);
    const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    io.observe(canvas);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', sync);
      io.disconnect();
    };
  }, []);

  return <canvas className="hero__embers" aria-hidden="true" ref={ref} />;
}
