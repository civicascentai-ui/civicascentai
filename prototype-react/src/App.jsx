import React, { useEffect, useRef, useState } from "react";

const SCENE_IMAGE =
  "https://cdn.openart.ai/watermarked_images/YmxMJck2wpCt5p7NmfTC/thumbnail_4bf403d3_1790668655776.webp";

const paths = [
  {
    id: "learn",
    label: "Learn",
    title: "Understand AI",
    prompt: "Explain AI to me like I’m brand new to it."
  },
  {
    id: "create",
    label: "Create",
    title: "Make something useful",
    prompt: "Help me turn a rough idea into a clear plan."
  },
  {
    id: "work",
    label: "Work",
    title: "Use AI for everyday tasks",
    prompt: "Show me how AI can help organize something I need to do."
  },
  {
    id: "understand",
    label: "Explore",
    title: "See what AI can do",
    prompt: "Give me three simple examples of useful AI in daily life."
  }
];

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(paths[0]);
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
        <img className="scene-image" src={SCENE_IMAGE} alt="" aria-hidden="true" />
        <div className="scene-shade" aria-hidden="true" />
        <div className="scene-light" aria-hidden="true" />
        <div className="scene-dusk" aria-hidden="true" />

        <div className="ambient-birds" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <div className="water-glimmer" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

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
            onClick={() => {
              setSelectedPath(paths[1]);
              setGuideOpen(true);
            }}
            aria-haspopup="dialog"
          >
            <span className="destination-dot" aria-hidden="true" />
            <span>
              <strong>Living AI Lab</strong>
              <small>See AI in action</small>
            </span>
          </button>

          <button
            className="destination destination-secondary destination-paths"
            onClick={() => {
              setSelectedPath(paths[0]);
              setGuideOpen(true);
            }}
            aria-haspopup="dialog"
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
          <strong>{reducedMotion ? "Reduced motion" : "Living cinematic scene"}</strong>
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
              <p className="guide-eyebrow">CHOOSE YOUR FIRST PATH</p>
              <h2 id="guide-title">{selectedPath.title}</h2>
              <p>
                Pick the kind of help you want. CivicAscent keeps the first step simple,
                then builds from there.
              </p>

              <div className="path-choices" role="group" aria-label="Choose an AI learning path">
                {paths.map((path) => (
                  <button
                    key={path.id}
                    className={`path-choice ${selectedPath.id === path.id ? "is-selected" : ""}`}
                    onClick={() => setSelectedPath(path)}
                    aria-pressed={selectedPath.id === path.id}
                  >
                    {path.label}
                  </button>
                ))}
              </div>

              <div className="example-line" aria-label="Example prompt">
                <span>Try:</span>
                <strong>“{selectedPath.prompt}”</strong>
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
