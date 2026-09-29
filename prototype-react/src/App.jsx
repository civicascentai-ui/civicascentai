import React, { useEffect, useState } from "react";

const SAFARI_VIDEO =
  "https://d8j0ntlcm91z4.cloudfront.net/user_3JtScanEzSzxXPKWKIblpvV5cMF/hf_20260929_095835_92833d99-5bd0-4982-82cb-2ded0ae10408.mp4";

const SAFARI_POSTER =
  "https://d2ol7oe51mr4n9.cloudfront.net/user_3JtScanEzSzxXPKWKIblpvV5cMF/d023dc10-49ff-4203-a0a3-714b659221dc.png";

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
    <main className="movie-shell" aria-label="CivicAscent AI cinematic Safari introduction">
      {reducedMotion ? (
        <img
          className="movie-media"
          src={SAFARI_POSTER}
          alt="Cinematic Safari lodge scene overlooking wildlife and water at golden hour."
        />
      ) : (
        <video
          className="movie-media"
          src={SAFARI_VIDEO}
          poster={SAFARI_POSTER}
          autoPlay
          muted
          playsInline
          loop
          preload="metadata"
          aria-label="CivicAscent AI cinematic Safari introduction"
        />
      )}

      <div className="sr-only">
        CivicAscent AI opens with a continuous cinematic camera move into a Safari learning world.
      </div>
    </main>
  );
}
