import React, { useEffect, useRef, useState } from "react";

const experiences = [
  {
    id: "learn",
    label: "AI Learning Trail",
    eyebrow: "BEGIN HERE",
    title: "See what AI can do",
    body: "A short guided scene for people new to AI. Explore one practical capability at a time, with plain-language explanations and obvious next steps.",
    demo: "Ask AI to explain, compare, organize, or create without needing technical language."
  },
  {
    id: "lab",
    label: "Living AI Lab",
    eyebrow: "TRY IT",
    title: "Watch an idea become useful",
    body: "This stop demonstrates how AI can turn a simple request into a structured result while keeping the process easy to follow.",
    demo: "Start with a rough idea, then refine it into a plan, lesson, visual concept, or useful document."
  },
  {
    id: "access",
    label: "Accessible AI",
    eyebrow: "DESIGNED FOR PEOPLE",
    title: "AI that meets you where you are",
    body: "Large readable type, clear navigation, optional voice guidance, and reduced-motion support keep the experience usable for a wider range of visitors.",
    demo: "Use the controls at your own pace. Nothing important depends on tiny text, hover-only actions, or fast motion."
  }
];

function LivingAtmosphere({ reducedMotion }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    let raf = 0;
    const start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = now => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      const t = reducedMotion ? 0 : (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);

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

      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 4; i++) {
        const yy = h * (0.58 + i * 0.035) + Math.sin(t * 0.35 + i) * 2;
        const grd = ctx.createLinearGradient(0, yy, w, yy);
        grd.addColorStop(0, "rgba(255,210,140,0)");
        grd.addColorStop(0.45, "rgba(255,210,140,0.05)");
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
  const [active, setActive] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const onKey = event => {
      if (event.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selected = experiences.find(item => item.id === active);

  return (
    <main className={`safari-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <section className="living-canvas" aria-label="CivicAscent AI Safari learning world">
        <div className="sky-glow" aria-hidden="true" />
        <div className="distant-haze" aria-hidden="true" />
        <div className="savanna-depth depth-back" aria-hidden="true" />
        <div className="water-field" aria-hidden="true" />
        <div className="savanna-depth depth-mid" aria-hidden="true" />

        <div className="lodge" aria-hidden="true">
          <div className="lodge-roof" />
          <div className="lodge-body" />
          <div className="terrace" />
        </div>

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

        <header className="experience-heading">
          <p>CIVICASCENT AI</p>
          <h1>Explore AI from the Safari Lodge</h1>
          <span>Choose one glowing stop. Each one shows a practical way AI can help.</span>
        </header>

        <nav className="hotspot-layer" aria-label="Safari learning stops">
          <button className="hotspot hotspot-learn" onClick={() => setActive("learn")} aria-label="Open AI Learning Trail">
            <span className="pulse" aria-hidden="true" />
            <strong>AI Learning Trail</strong>
          </button>
          <button className="hotspot hotspot-lab" onClick={() => setActive("lab")} aria-label="Open Living AI Lab">
            <span className="pulse" aria-hidden="true" />
            <strong>Living AI Lab</strong>
          </button>
          <button className="hotspot hotspot-access" onClick={() => setActive("access")} aria-label="Open Accessible AI">
            <span className="pulse" aria-hidden="true" />
            <strong>Accessible AI</strong>
          </button>
        </nav>

        <div className="prototype-status" aria-live="polite">
          <span>PROTOTYPE 09 · SAFARI LEARNING WORLD</span>
          <strong>{reducedMotion ? "Reduced motion active" : "Living motion active"}</strong>
        </div>

        {selected && (
          <section className="experience-overlay" role="dialog" aria-modal="true" aria-labelledby="experience-title">
            <button className="overlay-close" onClick={() => setActive(null)} aria-label="Return to Safari Lodge">Return to Safari</button>
            <div className="experience-scene">
              <div className="scene-orbit" aria-hidden="true" />
              <div className="scene-core" aria-hidden="true">AI</div>
            </div>
            <div className="experience-copy">
              <p>{selected.eyebrow}</p>
              <h2 id="experience-title">{selected.title}</h2>
              <div className="divider" aria-hidden="true" />
              <p className="body-copy">{selected.body}</p>
              <strong className="demo-line">{selected.demo}</strong>
              <button className="next-action" onClick={() => {
                const index = experiences.findIndex(item => item.id === selected.id);
                setActive(experiences[(index + 1) % experiences.length].id);
              }}>
                Next AI stop
              </button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
