import React, { useEffect, useRef, useState } from "react";

const SCENE_IMAGE =
  "https://cdn.openart.ai/watermarked_images/YmxMJck2wpCt5p7NmfTC/thumbnail_4bf403d3_1790668655776.webp";

const moments = {
  start: {
    label: "Start Here",
    title: "Begin with one simple question",
    body: "Tell CivicAscent what you want to understand, create, organize, or improve. No technical language required.",
    prompt: "Explain AI to me like I’m brand new to it."
  },
  learn: {
    label: "Learn AI",
    title: "Follow the learning trail",
    body: "Move through practical beginner lessons one step at a time, with plain-language guidance and visible examples.",
    prompt: "Show me one useful AI skill I can learn in five minutes."
  },
  create: {
    label: "Create",
    title: "Turn an idea into something useful",
    body: "Start with a rough thought and watch it become a clearer plan, visual, lesson, or document.",
    prompt: "Help me turn this rough idea into a simple plan."
  },
  work: {
    label: "Work",
    title: "Use AI for everyday work",
    body: "Explore practical ways AI can help organize tasks, compare options, prepare information, and save time.",
    prompt: "Show me three simple ways AI could help with everyday work."
  },
  explore: {
    label: "Explore",
    title: "See what AI can do",
    body: "Use the watering hole overlook as your discovery point for real-world AI examples.",
    prompt: "Give me three useful things AI can do for a beginner today."
  }
};

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [activeMoment, setActiveMoment] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    if (!activeMoment) return;
    const onKey = (event) => {
      if (event.key === "Escape") setActiveMoment(null);
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [activeMoment]);

  const selected = activeMoment ? moments[activeMoment] : null;

  return (
    <main className={`world-shell ${reducedMotion ? "reduced-motion" : ""}`}>
      <section className="safari-world" aria-labelledby="world-title">
        <img className="world-image" src={SCENE_IMAGE} alt="" aria-hidden="true" />
        <div className="world-shade" aria-hidden="true" />
        <div className="world-light" aria-hidden="true" />
        <div className="ambient-birds" aria-hidden="true"><span/><span/><span/></div>
        <div className="water-glimmer" aria-hidden="true"><span/><span/><span/></div>

        <header className="world-brand">
          <div className="brand-mark" aria-hidden="true">CA</div>
          <div>
            <p>CIVICASCENT AI</p>
            <span>People · Learning · Opportunity</span>
          </div>
        </header>

        <div className="world-copy">
          <h1 id="world-title">A New World<br/>of Opportunity<br/><em>with AI</em></h1>
          <p>Explore. Learn. Create. Grow.<br/>Built for people new to AI.</p>
        </div>

        <button
          className="start-here"
          onClick={() => setActiveMoment("start")}
          aria-haspopup="dialog"
        >
          <span className="start-orb" aria-hidden="true">▶</span>
          <span className="start-copy">
            <strong>Start Here</strong>
            <small>Your first AI step</small>
          </span>
          <span className="start-arrow" aria-hidden="true">→</span>
        </button>

        <nav className="world-hotspots" aria-label="Explore the CivicAscent AI safari">
          <button
            className="world-hotspot hotspot-learn"
            onClick={() => setActiveMoment("learn")}
            aria-haspopup="dialog"
          >
            <span className="locator" aria-hidden="true" />
            <span className="hotspot-label"><strong>Learn AI</strong><small>Lodge study</small></span>
          </button>

          <button
            className="world-hotspot hotspot-create"
            onClick={() => setActiveMoment("create")}
            aria-haspopup="dialog"
          >
            <span className="locator" aria-hidden="true" />
            <span className="hotspot-label"><strong>Create</strong><small>Lookout studio</small></span>
          </button>

          <button
            className="world-hotspot hotspot-work"
            onClick={() => setActiveMoment("work")}
            aria-haspopup="dialog"
          >
            <span className="locator" aria-hidden="true" />
            <span className="hotspot-label"><strong>Work</strong><small>Trail marker</small></span>
          </button>

          <button
            className="world-hotspot hotspot-explore"
            onClick={() => setActiveMoment("explore")}
            aria-haspopup="dialog"
          >
            <span className="locator" aria-hidden="true" />
            <span className="hotspot-label"><strong>Explore</strong><small>Watering hole</small></span>
          </button>
        </nav>

        <div className="quiet-controls">
          <button type="button" aria-label="Language: English">English</button>
          <span aria-hidden="true">•</span>
          <span>{reducedMotion ? "Reduced motion" : "Cinematic motion"}</span>
        </div>

        {selected && (
          <section
            className="scene-transition"
            role="dialog"
            aria-modal="true"
            aria-labelledby="moment-title"
            tabIndex={-1}
            ref={dialogRef}
          >
            <div className="transition-background" aria-hidden="true" />
            <button
              className="return-world"
              onClick={() => setActiveMoment(null)}
              aria-label="Return to safari world"
            >
              ← Return to Safari
            </button>

            <div className="transition-copy">
              <p className="transition-eyebrow">{selected.label}</p>
              <h2 id="moment-title">{selected.title}</h2>
              <p>{selected.body}</p>
              <div className="prompt-line" aria-label="Example AI prompt">
                <span>Try:</span>
                <strong>“{selected.prompt}”</strong>
              </div>
              <button className="continue-world" onClick={() => setActiveMoment(null)}>
                Continue exploring
              </button>
            </div>

            <div className="transition-visual" aria-hidden="true">
              <span className="ring ring-one" />
              <span className="ring ring-two" />
              <span className="ring ring-three" />
              <div className="ai-core">AI</div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
