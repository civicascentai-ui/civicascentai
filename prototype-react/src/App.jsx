import React, { useEffect, useRef, useState } from "react";

const SCENE_IMAGE =
  "https://cdn.openart.ai/watermarked_images/YmxMJck2wpCt5p7NmfTC/thumbnail_4bf403d3_1790668655776.webp";

const paths = [
  { id: "learn", label: "Learn", title: "Build AI skills step by step", prompt: "Explain AI to me like I’m brand new to it." },
  { id: "create", label: "Create", title: "Turn ideas into reality", prompt: "Help me turn this rough idea into something useful." },
  { id: "work", label: "Work", title: "Explore real opportunities", prompt: "Show me practical ways AI could help with everyday work." },
  { id: "explore", label: "Explore", title: "See what’s possible", prompt: "Give me three simple AI examples I can try today." }
];

const navItems = ["Home", "Explore", "Learn AI", "Programs", "Community", "Support"];

export default function App() {
  const [activePath, setActivePath] = useState(paths[0]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") setPanelOpen(false);
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const openPath = (id) => {
    const path = paths.find((item) => item.id === id) || paths[0];
    setActivePath(path);
    setPanelOpen(true);
  };

  return (
    <main className={`prototype-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <section className="hero-scene" aria-labelledby="hero-title">
        <img className="hero-image" src={SCENE_IMAGE} alt="" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-light" aria-hidden="true" />
        <div className="ambient-birds" aria-hidden="true"><span/><span/><span/></div>
        <div className="water-glimmer" aria-hidden="true"><span/><span/><span/></div>

        <header className="topbar">
          <a className="brand-lockup" href="#home" aria-label="CivicAscent AI home">
            <span className="brand-mark" aria-hidden="true">CA</span>
            <span className="brand-copy">
              <strong>CivicAscent AI</strong>
              <small>People · Learning · Opportunity</small>
            </span>
          </a>

          <nav className="topnav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a key={item} href={item === "Home" ? "#home" : "#paths"}>{item}</a>
            ))}
          </nav>

          <button className="language-button" aria-label="Language: English">English</button>
        </header>

        <div className="hero-copy" id="home">
          <h1 id="hero-title">A New World<br/>of Opportunity<br/><span>with AI</span></h1>
          <p>Explore. Learn. Create. Grow.<br/>Built for People. Powered by Possibility.</p>

          <button className="start-button" onClick={() => openPath("learn")} aria-haspopup="dialog">
            <span className="play-icon" aria-hidden="true">▶</span>
            <span><strong>Start Here</strong><small>Your AI Journey</small></span>
            <span className="arrow" aria-hidden="true">→</span>
          </button>
        </div>

        <nav className="hotspot-layer" aria-label="Interactive scene hotspots">
          <button className="hotspot hotspot-explore" onClick={() => openPath("explore")} aria-haspopup="dialog">
            <span className="hotspot-pulse" aria-hidden="true"/>
            <span><strong>Explore</strong><small>Discover the world</small></span>
          </button>
          <button className="hotspot hotspot-learn" onClick={() => openPath("learn")} aria-haspopup="dialog">
            <span className="hotspot-pulse" aria-hidden="true"/>
            <span><strong>Learn AI</strong><small>Build new skills</small></span>
          </button>
          <button className="hotspot hotspot-create" onClick={() => openPath("create")} aria-haspopup="dialog">
            <span className="hotspot-pulse" aria-hidden="true"/>
            <span><strong>Create</strong><small>Turn ideas into reality</small></span>
          </button>
          <button className="hotspot hotspot-community" onClick={() => openPath("work")} aria-haspopup="dialog">
            <span className="hotspot-pulse" aria-hidden="true"/>
            <span><strong>Community</strong><small>Connect and grow</small></span>
          </button>
        </nav>

        <section className="path-rail" id="paths" aria-label="Choose your AI path">
          {paths.map((path) => (
            <button key={path.id} className="path-card" onClick={() => openPath(path.id)} aria-haspopup="dialog">
              <span className="path-thumb" aria-hidden="true"/>
              <span className="path-text">
                <strong>{path.label}</strong>
                <small>{path.title}</small>
              </span>
              <span className="path-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </section>

        {panelOpen && (
          <section
            className="experience-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panel-title"
            tabIndex={-1}
            ref={dialogRef}
          >
            <button className="panel-close" onClick={() => setPanelOpen(false)} aria-label="Return to safari scene">
              Return to Safari
            </button>

            <div className="panel-copy">
              <p className="eyebrow">YOUR AI PATH</p>
              <h2 id="panel-title">{activePath.label}</h2>
              <p>{activePath.title}. Start with one simple request, then build from there.</p>

              <div className="path-tabs" role="group" aria-label="Choose an AI path">
                {paths.map((path) => (
                  <button
                    key={path.id}
                    className={`path-tab ${activePath.id === path.id ? "selected" : ""}`}
                    onClick={() => setActivePath(path)}
                    aria-pressed={activePath.id === path.id}
                  >
                    {path.label}
                  </button>
                ))}
              </div>

              <div className="prompt-example">
                <span>Try this:</span>
                <strong>“{activePath.prompt}”</strong>
              </div>

              <button className="continue-button" onClick={() => setPanelOpen(false)}>
                Continue exploring
              </button>
            </div>

            <div className="panel-visual" aria-hidden="true">
              <span className="ring ring-one"/>
              <span className="ring ring-two"/>
              <span className="ring ring-three"/>
              <div className="ai-core">AI</div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
