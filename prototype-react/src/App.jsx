import React, { useEffect, useRef, useState } from "react";

const SCENE_IMAGE =
  "https://cdn.openart.ai/watermarked_images/YmxMJck2wpCt5p7NmfTC/thumbnail_4bf403d3_1790668655776.webp";

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener?.("change", sync);
    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (!guideOpen) return;
    const close = (event) => {
      if (event.key === "Escape") setGuideOpen(false);
    };
    window.addEventListener("keydown", close);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", close);
  }, [guideOpen]);

  return (
    <main className={`scene-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <section className="scene" aria-labelledby="scene-title">
        <img
          className="scene-image"
          src={SCENE_IMAGE}
          alt=""
          aria-hidden="true"
        />
        <div className="scene-shade" aria-hidden="true" />
        <div className="scene-light" aria-hidden="true" />

        <header className="scene-copy">
          <p className="brand">CIVICASCENT AI</p>
          <h1 id="scene-title">Start here.</h1>
          <p className="scene-intro">
            Explore AI from the safari lodge. One clear step at a time.
          </p>
        </header>

        <nav className="scene-actions" aria-label="Safari learning destinations">
          <button
            className="destination destination-primary"
            onClick={() => setGuideOpen(true)}
            aria-haspopup="dialog"
          >
            <span className="destination-dot" aria-hidden="true" />
            <span>
              <strong>Start Here</strong>
              <small>Your AI journey</small>
            </span>
          </button>

          <button
            className="destination destination-secondary destination-lab"
            onClick={() => setGuideOpen(true)}
          >
            <span className="destination-dot" aria-hidden="true" />
            <span>
              <strong>Living AI Lab</strong>
              <small>See AI in action</small>
            </span>
          </button>

          <button
            className="destination destination-secondary destination-paths"
            onClick={() => setGuideOpen(true)}
          >
            <span className="destination-dot" aria-hidden="true" />
            <span>
              <strong>Learning Paths</strong>
              <small>Build your skills</small>
            </span>
          </button>
        </nav>

        <div className="scene-status" aria-live="polite">
          <span>PROTOTYPE 09 · SCENE 01</span>
          <strong>{reducedMotion ? "Reduced motion" : "Cinematic motion"}</strong>
        </div>

        {guideOpen && (
          <section
            className="guided-moment"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guide-title"
            tabIndex={-1}
            ref={dialogRef}
          >
            <button
              className="return-button"
              onClick={() => setGuideOpen(false)}
              aria-label="Return to the safari lodge"
            >
              Return to Safari
            </button>

            <div className="guide-copy">
              <p className="guide-eyebrow">YOUR FIRST AI STEP</p>
              <h2 id="guide-title">Ask in plain language.</h2>
              <p>
                You do not need technical words. Tell AI what you want to understand,
                organize, compare, or create.
              </p>
              <div className="example-line" aria-label="Example prompt">
                <span>Try:</span>
                <strong>“Explain AI to me like I’m brand new to it.”</strong>
              </div>
              <button className="continue-button" onClick={() => setGuideOpen(false)}>
                Continue exploring
              </button>
            </div>

            <div className="guide-visual" aria-hidden="true">
              <span className="orb orb-one" />
              <span className="orb orb-two" />
              <span className="orb orb-three" />
              <div className="guide-core">AI</div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
