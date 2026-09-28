import React, { useEffect, useRef, useState } from "react";

function LivingAtmosphere({ reducedMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let raf = 0;
    let start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const t = reducedMotion ? 0 : (now - start) / 1000;

      ctx.clearRect(0, 0, w, h);

      // slow atmospheric haze
      for (let i = 0; i < 7; i++) {
        const x = ((i * 0.19 + t * 0.0035) % 1.25) * w - 0.12 * w;
        const y = h * (0.38 + i * 0.055);
        const r = w * (0.18 + (i % 3) * 0.05);
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, "rgba(255,220,165,0.045)");
        g.addColorStop(1, "rgba(255,220,165,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // heat shimmer / water-light bands
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 4; i++) {
        const yy = h * (0.58 + i * 0.035) + Math.sin(t * 0.35 + i) * 2;
        const grd = ctx.createLinearGradient(0, yy, w, yy);
        grd.addColorStop(0, "rgba(255,210,140,0)");
        grd.addColorStop(0.45, "rgba(255,210,140,0.05)");
        grd.addColorStop(0.65, "rgba(255,240,210,0.02)");
        grd.addColorStop(1, "rgba(255,210,140,0)");
        ctx.strokeStyle = grd;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, yy);
        for (let x = 0; x <= w; x += 28) {
          ctx.lineTo(x, yy + Math.sin(x * 0.018 + t * 0.4 + i) * 1.6);
        }
        ctx.stroke();
      }
      ctx.globalCompositeOperation = "source-over";

      if (!reducedMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [reducedMotion]);

  return <canvas className="atmosphere-canvas" ref={canvasRef} aria-hidden="true" />;
}

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  return (
    <main className={`safari-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <section className="living-canvas" aria-label="Safari living canvas prototype">
        <div className="sky-glow" aria-hidden="true" />
        <div className="distant-haze" aria-hidden="true" />
        <div className="savanna-depth depth-back" aria-hidden="true" />
        <div className="water-field" aria-hidden="true" />
        <div className="savanna-depth depth-mid" aria-hidden="true" />

        <div className="wildlife-event" aria-hidden="true">
          <span className="elephant elephant-one" />
          <span className="elephant elephant-two" />
          <span className="elephant elephant-three" />
        </div>

        <div className="foreground-grass" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} style={{ "--i": i }} />
          ))}
        </div>

        <LivingAtmosphere reducedMotion={reducedMotion} />

        <div className="prototype-status" aria-live="polite">
          <span>SAFARI LIVING CANVAS · PROTOTYPE A</span>
          <strong>{reducedMotion ? "Reduced motion" : "Living motion active"}</strong>
        </div>
      </section>
    </main>
  );
}
