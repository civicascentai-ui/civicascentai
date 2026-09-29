import React, { useEffect, useRef, useState } from "react";

const SAFARI_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3JtScanEzSzxXPKWKIblpvV5cMF/hf_20260929_095835_92833d99-5bd0-4982-82cb-2ded0ae10408.mp4";

const SAFARI_POSTER =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_3JtScanEzSzxXPKWKIblpvV5cMF/d023dc10-49ff-4203-a0a3-714b659221dc.png";

export default function App() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [landed, setLanded] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) setLanded(true);
    };
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  const replayArrival = () => {
    setDoorOpen(false);
    setLanded(false);
    const video = videoRef.current;
    if (!video || reducedMotion) return;
    video.currentTime = 0;
    video.play().catch(() => {});
  };

  return (
    <main
      className={`movie-shell ${landed ? "is-landed" : ""} ${doorOpen ? "door-is-open" : ""}`}
      aria-label="CivicAscent AI cinematic Safari introduction"
    >
      {reducedMotion ? (
        <img
          className="movie-media"
          src={SAFARI_POSTER}
          alt="Cinematic Safari lodge scene overlooking wildlife and water at golden hour."
        />
      ) : (
        <video
          ref={videoRef}
          className="movie-media"
          src={SAFARI_VIDEO}
          poster={SAFARI_POSTER}
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setLanded(true)}
          aria-label="CivicAscent AI cinematic Safari introduction"
        />
      )}

      <div className="cinematic-vignette" aria-hidden="true" />

      <section className="landing-moment" aria-live="polite">
        <p className="landing-kicker">CIVICASCENT AI</p>
        <h1>Welcome to a new world of opportunity with AI.</h1>
        <button className="start-cue" type="button" onClick={replayArrival}>
          <span>Start Here</span>
          <span className="start-line" aria-hidden="true" />
        </button>
      </section>

      <button
        className="environment-door"
        type="button"
        onClick={() => setDoorOpen(true)}
        aria-label="Enter the Living AI Lab"
      >
        <span className="door-frame" aria-hidden="true">
          <span className="door-light" />
          <span className="door-threshold" />
        </span>
        <span className="door-name">Living AI Lab</span>
      </button>

      <section className="door-transition" aria-live="polite">
        <div className="door-transition-copy">
          <p>ENTERING</p>
          <h2>Living AI Lab</h2>
          <button type="button" onClick={() => setDoorOpen(false)}>
            Return to Safari
          </button>
        </div>
      </section>

      <div className="sr-only">
        The cinematic camera arrives in the CivicAscent AI Safari learning world.
        A doorway in the environment leads to the Living AI Lab.
      </div>
    </main>
  );
}
