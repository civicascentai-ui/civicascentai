import React, { useEffect, useMemo, useRef, useState } from "react";

const SAFARI_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3JtScanEzSzxXPKWKIblpvV5cMF/hf_20260929_095835_92833d99-5bd0-4982-82cb-2ded0ae10408.mp4";

const SAFARI_POSTER =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_3JtScanEzSzxXPKWKIblpvV5cMF/d023dc10-49ff-4203-a0a3-714b659221dc.png";

const scenes = [
  { id: "arrival", eyebrow: "01 · ARRIVAL AT THE LODGE", title: "Welcome to a new world of opportunity with AI.", body: "A warm, cinematic welcome. The journey begins.", action: "Start Here" },
  { id: "explore", eyebrow: "02 · EXPLORE THE ENVIRONMENT", title: "Explore the Safari.", body: "Discover key areas across a living, interactive scene.", action: "Show Me Around" },
  { id: "start", eyebrow: "03 · START HERE ACTIVATION", title: "Start with one clear step.", body: "No technical language required. Choose one thing you want AI to help you understand or do.", action: "Learn AI" },
  { id: "learn", eyebrow: "04 · AI LEARNING DEMONSTRATION", title: "See AI explain something useful.", body: "Real-world examples appear in a simple, visual, easy-to-understand way.", action: "Enter the Living AI Lab" },
  { id: "lab", eyebrow: "05 · LIVING AI LAB TRANSITION", title: "Step into the Living AI Lab.", body: "Move from learning about AI to trying it yourself.", action: "Enter Lab" },
  { id: "next", eyebrow: "06 · RETURN TO LODGE / NEXT CHOICE", title: "Choose your next step.", body: "Continue exploring at your own pace. Your place in the journey stays clear.", action: "Explore More" }
];

const nextChoices = ["Explore More", "Learning Paths", "Programs", "Community"];

export default function App() {
  const [scene, setScene] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [language, setLanguage] = useState("en");
  const videoRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    sceneRef.current?.focus();
  }, [scene]);

  const current = scenes[scene];
  const isArrival = scene === 0;
  const isLab = scene === 4;

  const goNext = () => {
    setScene((value) => Math.min(value + 1, scenes.length - 1));
  };

  const goBack = () => {
    setScene((value) => Math.max(value - 1, 0));
  };

  const replayArrival = () => {
    setScene(0);
    if (!reducedMotion && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const destinations = useMemo(() => [
    { label: "Explore", scene: 1, className: "marker marker-explore" },
    { label: "Learn AI", scene: 3, className: "marker marker-learn" },
    { label: "Programs", scene: 5, className: "marker marker-programs" },
    { label: "Community", scene: 5, className: "marker marker-community" }
  ], []);

  return (
    <main className={`safari-shell scene-${current.id} ${reducedMotion ? "reduced-motion" : ""}`} aria-label="CivicAscent AI Safari learning experience">
      {isArrival && !reducedMotion ? (
        <video
          ref={videoRef}
          className="scene-media"
          src={SAFARI_VIDEO}
          poster={SAFARI_POSTER}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setScene(1)}
          aria-label="Cinematic arrival at the CivicAscent AI Safari lodge"
        />
      ) : (
        <img className="scene-media" src={SAFARI_POSTER} alt="" />
      )}

      <div className="scene-grade" aria-hidden="true" />
      <div className="ambient-light" aria-hidden="true" />

      <header className="topbar">
        <button className="brand-button" type="button" onClick={replayArrival}>CivicAscent AI</button>
        <div className="top-actions">
          <button type="button" onClick={() => setLanguage(language === "en" ? "es" : "en")} aria-label="Switch language">
            {language === "en" ? "ES" : "EN"}
          </button>
          <button type="button" onClick={replayArrival}>Replay</button>
        </div>
      </header>

      {scene === 1 && (
        <nav className="environment-nav" aria-label="Explore the Safari environment">
          {destinations.map((destination) => (
            <button
              key={destination.label}
              className={destination.className}
              type="button"
              onClick={() => setScene(destination.scene)}
            >
              <span className="marker-dot" aria-hidden="true" />
              <span>{destination.label}</span>
            </button>
          ))}
        </nav>
      )}

      {scene === 3 && (
        <div className="learning-visual" aria-hidden="true">
          <div className="learning-orbit orbit-one" />
          <div className="learning-orbit orbit-two" />
          <div className="learning-core">AI</div>
          <span className="learn-fact fact-one">Explain</span>
          <span className="learn-fact fact-two">Compare</span>
          <span className="learn-fact fact-three">Create</span>
        </div>
      )}

      {isLab && (
        <div className="lab-destination" aria-hidden="true">
          <div className="lab-door">
            <span className="lab-glow" />
            <span className="lab-sign">Living AI Lab</span>
          </div>
        </div>
      )}

      <section className="scene-copy" tabIndex="-1" ref={sceneRef} aria-live="polite">
        <p className="scene-eyebrow">{current.eyebrow}</p>
        <h1>{current.title}</h1>
        <p className="scene-body">{current.body}</p>

        {scene < scenes.length - 1 ? (
          <button className="primary-action" type="button" onClick={goNext}>
            {current.action}<span aria-hidden="true"> →</span>
          </button>
        ) : (
          <div className="next-choice-list" aria-label="Choose your next step">
            {nextChoices.map((choice, index) => (
              <button key={choice} type="button" onClick={() => index === 0 ? setScene(1) : null}>
                <span>{choice}</span><span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        )}

        {scene > 0 && (
          <button className="back-action" type="button" onClick={goBack}>← Previous</button>
        )}
      </section>

      <div className="scene-progress" aria-label={`Scene ${scene + 1} of ${scenes.length}`}>
        {scenes.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={index === scene ? "active" : ""}
            aria-label={`Go to scene ${index + 1}: ${item.id}`}
            aria-current={index === scene ? "step" : undefined}
            onClick={() => setScene(index)}
          />
        ))}
      </div>
    </main>
  );
}
