import React, { useEffect, useRef, useState } from "react";

const experiences = [
  {
    id: "learn",
    eyebrow: "START HERE",
    title: "Learn AI",
    short: "A guided introduction to what AI can do for you.",
    detail: "Begin with plain-language examples, then move into short hands-on lessons. No prior AI experience is required.",
    x: "24%",
    y: "42%",
  },
  {
    id: "lab",
    eyebrow: "TRY IT",
    title: "Living AI Lab",
    short: "See an AI capability in action before you study it.",
    detail: "Explore short demonstrations of research, writing, automation, voice, and visual AI. Each demonstration includes a simple explanation and a clear next step.",
    x: "53%",
    y: "50%",
  },
  {
    id: "library",
    eyebrow: "EXPLORE",
    title: "Resource Library",
    short: "Search trusted beginner-friendly AI resources.",
    detail: "Find approved lessons, talks, guides, and references by topic. Search is designed around meaning, not just exact wording.",
    x: "76%",
    y: "38%",
  },
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

    const draw = (now) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
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

function speak(text) {
  if (!("speechSynthesis" in window)) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.pitch = 0.95;
  window.speechSynthesis.speak(utterance);
  return true;
}

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [selected, setSelected] = useState(null);
  const [voiceMessage, setVoiceMessage] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (selected && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [selected]);

  const activateVoice = (item) => {
    const text = `${item.title}. ${item.short} ${item.detail}`;
    const ok = speak(text);
    setVoiceMessage(ok ? `Reading ${item.title}` : "Voice playback is not supported on this device.");
  };

  return (
    <main className={`safari-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <a className="skip-link" href="#journey">Skip to learning choices</a>

      <section className="living-canvas" aria-labelledby="page-title">
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

        <header className="page-intro">
          <div className="brand-lockup" aria-label="CivicAscent AI">
            <span className="brand-mark">CA</span>
            <span>CivicAscent AI</span>
          </div>
          <p className="kicker">PAGE 2 · GUIDED AI SAFARI</p>
          <h1 id="page-title">Choose one place to begin.</h1>
          <p className="intro-copy">
            Explore AI at your own pace. Each stop explains what it does before asking you to continue.
          </p>
        </header>

        <nav id="journey" className="journey-map" aria-label="AI learning journey">
          {experiences.map((item, index) => (
            <button
              key={item.id}
              className="hotspot"
              style={{ "--x": item.x, "--y": item.y }}
              onClick={() => setSelected({ ...item, index })}
              aria-label={`${item.title}. ${item.short}`}
            >
              <span className="hotspot-ring" aria-hidden="true" />
              <span className="hotspot-label">
                <small>{item.eyebrow}</small>
                <strong>{item.title}</strong>
                <span>{item.short}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="journey-progress" aria-label="Three learning destinations available">
          <span className="progress-label">Your journey</span>
          <div className="progress-track" aria-hidden="true">
            <span className="progress-fill" />
          </div>
          <span className="progress-text">Choose 1 of 3 starting points</span>
        </div>

        <div className="prototype-status" aria-live="polite">
          <span>SAFARI LIVING CANVAS · PROTOTYPE B</span>
          <strong>{reducedMotion ? "Reduced motion enabled" : "Living motion active"}</strong>
        </div>

        <div className="voice-status" aria-live="polite">{voiceMessage}</div>
      </section>

      {selected && (
        <section
          className="detail-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-title"
          tabIndex="-1"
          ref={dialogRef}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSelected(null);
          }}
        >
          <button className="close-button" onClick={() => setSelected(null)} aria-label="Close details">
            ×
          </button>
          <p className="detail-step">STEP {selected.index + 1} OF 3</p>
          <h2 id="detail-title">{selected.title}</h2>
          <p className="detail-lead">{selected.short}</p>
          <p>{selected.detail}</p>

          <div className="detail-actions">
            <button className="primary-action" onClick={() => activateVoice(selected)}>
              Hear this explained
            </button>
            <button className="secondary-action" onClick={() => setSelected(null)}>
              Explore another stop
            </button>
          </div>

          <div className="next-action">
            <strong>Next action</strong>
            <span>Use “Hear this explained,” then continue into the full lesson in the next prototype stage.</span>
          </div>
        </section>
      )}
    </main>
  );
}
